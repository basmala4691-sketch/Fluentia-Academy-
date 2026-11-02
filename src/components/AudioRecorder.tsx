import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, AlertCircle, ShieldAlert } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blobUrl: string, durationSeconds: number) => void;
  onCancel?: () => void;
  label?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  label = 'Record Voice Response',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setPermissionDenied(false);
    audioChunksRef.current = [];
    setDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone audio capture.');
      }

      // Prompt browser for explicit microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Setup Web Audio Analyser for live visual feedback
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animationFrameRef.current = requestAnimationFrame(updateLevel);
            }
          };
          updateLevel();
        }
      } catch (audioErr) {
        console.warn('Audio visualization context skipped:', audioErr);
      }

      // Determine supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const mimeType = selectedMime || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop stream tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setErrorMsg(
          'Microphone permission was denied by your browser. Please click the camera/lock icon in your browser address bar, set Microphone to "Allow", and try again.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No microphone was detected on this device. Please connect an audio input device.');
      } else {
        setErrorMsg(`Unable to access microphone: ${err.message || 'Unknown error'}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const resetRecording = () => {
    cleanupAudio();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setRecordedAudioUrl(null);
    setIsRecording(false);
    setIsPlaying(false);
    setDuration(0);
    setErrorMsg(null);
    setAudioLevel(0);
  };

  const togglePlayback = () => {
    if (!recordedAudioUrl) return;

    if (!audioElementRef.current) {
      const audio = new Audio(recordedAudioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setErrorMsg('Error playing audio recording.');
      };
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const handleConfirm = () => {
    if (recordedAudioUrl) {
      onRecordingComplete(recordedAudioUrl, duration || 1);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
          {label}
        </span>
        <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          {permissionDenied ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-semibold block">Microphone Access Notice</span>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {!recordedAudioUrl ? (
        <div className="flex flex-col items-center justify-center py-5 bg-white rounded-xl border border-slate-200">
          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              {/* Dynamic waveform based on live microphone level */}
              <div className="flex items-center gap-1.5 h-10 px-4">
                {[30, 60, 90, 75, 40, 85, 95, 70, 50, 80, 60, 45].map((baseHeight, i) => {
                  const dynamicHeight = Math.max(15, Math.min(100, (baseHeight * (audioLevel + 30)) / 100));
                  return (
                    <span
                      key={i}
                      className="w-1.5 bg-emerald-600 rounded-full transition-all duration-75"
                      style={{
                        height: `${dynamicHeight}%`,
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-slate-700 font-semibold animate-pulse">
                Recording your voice... Speak naturally into your microphone
              </p>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish & Review Recording</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={startRecording}
                className="w-14 h-14 rounded-full bg-[#0D382B] hover:bg-[#184D3C] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
                title="Start Voice Recording"
              >
                <Mic className="w-6 h-6" />
              </button>
              <div className="text-center">
                <span className="text-xs text-slate-800 font-semibold block">
                  Click microphone to start recording
                </span>
                <span className="text-[11px] text-slate-400">
                  Your browser will request permission to capture audio
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-[#0D382B] text-white flex items-center justify-center hover:bg-[#184D3C] transition-colors shrink-0 shadow-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-bold text-slate-900">Your Voice Recording</p>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                {formatTime(duration)} · Audio Captured & Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={resetRecording}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Record again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Use</span>
            </button>
          </div>
        </div>
      )}

      {onCancel && (
        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
