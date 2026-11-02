import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Play,
  Pause,
  FileText,
  Search,
  Shield,
  Volume2,
} from 'lucide-react';
import { Conversation, ChatMessage, User } from '../types';
import { AcademyStore } from '../services/storage';
import { AudioRecorder } from './AudioRecorder';

interface ChatSystemProps {
  currentUser: User;
  isOwnerAuditMode?: boolean;
  auditJustification?: string;
  preselectedConversationId?: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  currentUser,
  isOwnerAuditMode = false,
  auditJustification,
  preselectedConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [fileAttachmentModal, setFileAttachmentModal] = useState(false);
  const [attachmentName, setAttachmentName] = useState('Speaking_Grammar_Correction.pdf');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadConversations();
  }, [currentUser]);

  useEffect(() => {
    if (preselectedConversationId) {
      setSelectedConvId(preselectedConversationId);
    }
  }, [preselectedConversationId]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = () => {
    const all = AcademyStore.getConversations();
    let permitted: Conversation[] = [];
    if (isOwnerAuditMode || currentUser.role === 'owner') {
      permitted = all;
    } else if (currentUser.role === 'student') {
      permitted = all.filter((c) => c.studentId === currentUser.id);
    } else if (currentUser.role === 'teacher') {
      permitted = all.filter((c) => c.teacherId === currentUser.id);
    }
    setConversations(permitted);
    if (permitted.length > 0 && !selectedConvId) {
      setSelectedConvId(permitted[0].id);
    }
  };

  const loadMessages = (convId: string) => {
    const list = AcademyStore.getMessages(convId);
    setMessages(list);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConvId) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    AcademyStore.sendMessage(newMessage);
    setInputMessage('');
    loadMessages(selectedConvId);
    loadConversations();
  };

  const handleAudioRecordingComplete = (audioUrl: string, durationSeconds: number) => {
    if (!selectedConvId) return;

    const newVoiceMessage: ChatMessage = {
      id: `msg_audio_${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      content: `Voice message (${durationSeconds}s)`,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: [
        {
          name: `Voice_Note_${new Date().toLocaleTimeString()}.webm`,
          type: 'audio',
          url: audioUrl,
          size: `${Math.round(durationSeconds * 16)} KB`,
          duration: durationSeconds,
        },
      ],
    };

    AcademyStore.sendMessage(newVoiceMessage);
    setShowVoiceRecorder(false);
    loadMessages(selectedConvId);
    loadConversations();
  };

  const handleSendAttachment = () => {
    if (!selectedConvId || !attachmentName) return;

    const newFileMessage: ChatMessage = {
      id: `msg_att_${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      content: `Shared document: ${attachmentName}`,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: [
        {
          name: attachmentName,
          type: 'doc',
          url: '#',
          size: '480 KB',
        },
      ],
    };

    AcademyStore.sendMessage(newFileMessage);
    setFileAttachmentModal(false);
    loadMessages(selectedConvId);
    loadConversations();
  };

  const playVoiceNote = (url: string, msgId: string) => {
    if (activeAudioPlaying === msgId) {
      audioInstanceRef.current?.pause();
      setActiveAudioPlaying(null);
      return;
    }

    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
    }

    const audio = new Audio(url);
    audioInstanceRef.current = audio;
    setActiveAudioPlaying(msgId);

    audio.play().catch(() => {});

    audio.onended = () => {
      setActiveAudioPlaying(null);
    };
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.studentName.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E3DFD3] overflow-hidden flex flex-col md:flex-row h-[620px]">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-80 border-r border-[#E3DFD3] flex flex-col bg-[#FAF8F5]">
        <div className="p-4 border-b border-[#E3DFD3] bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0D382B]">Direct Conversations</h3>
            {isOwnerAuditMode && (
              <span className="text-[10px] bg-[#EBF2EE] text-[#0D382B] px-2 py-0.5 rounded font-mono font-bold">
                AUDIT OVERSIGHT
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E3DFD3] rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0D382B]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No authorized conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const counterpartName =
                currentUser.role === 'student' ? conv.teacherName : conv.studentName;
              const counterpartAvatar =
                currentUser.role === 'student' ? conv.teacherAvatar : conv.studentAvatar;
              const counterpartRole =
                currentUser.role === 'student' ? 'Instructor' : 'Student';

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-white border-l-3 border-[#0D382B] shadow-sm' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <img
                    src={counterpartAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={counterpartName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{counterpartName}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3D6E57] font-semibold">{counterpartRole}</p>
                    <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessageSnippet}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-3.5 border-b border-[#E3DFD3] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <img
                  src={
                    (currentUser.role === 'student' ? activeConv.teacherAvatar : activeConv.studentAvatar) ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#0D382B]">
                    {currentUser.role === 'student' ? activeConv.teacherName : activeConv.studentName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {currentUser.role === 'student'
                      ? 'Certified Academic Instructor'
                      : 'Assigned Academy Student'}
                  </p>
                </div>
              </div>

              {isOwnerAuditMode && (
                <div className="flex items-center gap-1.5 text-xs text-[#0D382B] bg-[#EBF2EE] px-3 py-1 rounded-full border border-[#D1E3D7] font-mono">
                  <Shield className="w-3.5 h-3.5 text-[#3D6E57]" />
                  <span>Audit: {auditJustification || 'Safeguarding Protocol'}</span>
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F5]/50">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{msg.senderName}</span>
                      <span>·</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-md rounded-2xl px-4 py-3 text-xs md:text-sm shadow-sm ${
                        isMine
                          ? 'bg-[#0D382B] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-[#E3DFD3] rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 space-y-1.5">
                          {msg.attachments.map((att, i) => {
                            if (att.type === 'audio') {
                              const isPlayingThis = activeAudioPlaying === msg.id;
                              return (
                                <div
                                  key={i}
                                  className={`p-2.5 rounded-xl flex items-center justify-between gap-3 ${
                                    isMine ? 'bg-white/10 text-white' : 'bg-[#FAF8F5] text-slate-900 border border-[#E3DFD3]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => playVoiceNote(att.url, msg.id)}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isMine ? 'bg-[#8CAE97] text-[#07261D]' : 'bg-[#0D382B] text-white'
                                      }`}
                                    >
                                      {isPlayingThis ? (
                                        <Pause className="w-3.5 h-3.5" />
                                      ) : (
                                        <Play className="w-3.5 h-3.5 ml-0.5" />
                                      )}
                                    </button>
                                    <div>
                                      <p className="text-[11px] font-semibold">{att.name}</p>
                                      <p className="text-[10px] opacity-75 font-mono">
                                        Voice note · {att.duration || 5}s
                                      </p>
                                    </div>
                                  </div>
                                  <Volume2 className="w-4 h-4 opacity-70" />
                                </div>
                              );
                            }

                            return (
                              <div
                                key={i}
                                className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs ${
                                  isMine ? 'bg-white/10' : 'bg-[#FAF8F5] text-slate-800 border border-[#E3DFD3]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 shrink-0 text-[#8CAE97]" />
                                  <span className="truncate">{att.name}</span>
                                </div>
                                <span className="text-[10px] opacity-70 font-mono shrink-0">
                                  {att.size}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Recorder Overlay */}
            {showVoiceRecorder && (
              <div className="p-4 border-t border-[#E3DFD3] bg-white">
                <AudioRecorder
                  label="Record Spoken English Voice Note"
                  onRecordingComplete={handleAudioRecordingComplete}
                  onCancel={() => setShowVoiceRecorder(false)}
                />
              </div>
            )}

            {/* Document attachment modal */}
            {fileAttachmentModal && (
              <div className="p-4 border-t border-[#E3DFD3] bg-[#FAF8F5] flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#0D382B] mb-1">
                    Select Study Material / Worksheet Document
                  </label>
                  <select
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-[#E3DFD3] rounded-lg bg-white"
                  >
                    <option value="Speaking_Grammar_Correction.pdf">Speaking_Grammar_Correction.pdf (480 KB)</option>
                    <option value="IELTS_Band_7_Speaking_Rubric.pdf">IELTS_Band_7_Speaking_Rubric.pdf (920 KB)</option>
                    <option value="Egyptian_English_Phonetics_Cheatsheet.pdf">Egyptian_English_Phonetics_Cheatsheet.pdf (310 KB)</option>
                    <option value="Meeting_Vocabulary_Worksheet.docx">Meeting_Vocabulary_Worksheet.docx (150 KB)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setFileAttachmentModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-xs rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendAttachment}
                    className="px-4 py-1.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
                  >
                    Attach & Send
                  </button>
                </div>
              </div>
            )}

            {/* Message Input Bottom Bar */}
            {!showVoiceRecorder && !fileAttachmentModal && !isOwnerAuditMode && (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E3DFD3] flex items-center gap-2 bg-white">
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="p-2 text-slate-500 hover:text-[#0D382B] hover:bg-[#EBF2EE] rounded-xl transition-colors"
                  title="Record Voice Note"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setFileAttachmentModal(true)}
                  className="p-2 text-slate-500 hover:text-[#0D382B] hover:bg-[#EBF2EE] rounded-xl transition-colors"
                  title="Attach File / Worksheet"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message or pronunciation question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0D382B]"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white rounded-xl transition-colors disabled:opacity-40"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {isOwnerAuditMode && (
              <div className="p-3 bg-slate-100 border-t border-[#E3DFD3] text-center text-xs text-slate-600 font-mono">
                Read-only audit inspection mode active. Direct messages cannot be sent by administrative auditors.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
            <Search className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">Select a conversation to begin private messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
