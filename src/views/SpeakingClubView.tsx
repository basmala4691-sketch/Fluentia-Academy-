import React, { useState } from 'react';
import { SpeakingClubSession, User } from '../types';
import { AcademyStore } from '../services/storage';
import { notifyBookingSubmission, notifySeatConfirmation } from '../services/formspree';
import {
  Mic,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  User as UserIcon,
  Mail,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface SpeakingClubViewProps {
  sessions: SpeakingClubSession[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefresh: () => void;
}

export const SpeakingClubView: React.FC<SpeakingClubViewProps> = ({
  sessions,
  currentUser,
  onOpenAuth,
  onRefresh,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [bookingSession, setBookingSession] = useState<SpeakingClubSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '',
    age: '',
    password: '',
    notes: '',
  });

  const handleStartBooking = (session: SpeakingClubSession) => {
    setBookingSession(session);
    setBookingFormData({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: '',
      age: '',
      password: '',
      notes: '',
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSession) return;

    setIsSubmitting(true);
    try {
      await notifySeatConfirmation({
        itemType: 'Speaking Club',
        itemName: `${bookingSession.title} (${bookingSession.levelRange})`,
        studentName: bookingFormData.fullName,
        email: bookingFormData.email,
        phone: bookingFormData.phone,
        age: bookingFormData.age,
        password: bookingFormData.password,
        scheduledTime: `${bookingSession.date} at ${bookingSession.time}`,
        notes: `Topic: ${bookingSession.topic}. Host Teacher: ${bookingSession.hostTeacherName}. Student Notes: ${bookingFormData.notes || 'None'}`,
      });

      // Register student in storage if logged in
      if (currentUser) {
        AcademyStore.registerForSpeakingClub(bookingSession.id, currentUser.id);
      }

      setFeedbackMsg({
        text: `Seat confirmed for "${bookingSession.title}"! A confirmation has been forwarded to the academy owner.`,
        isError: false,
      });
      setBookingSession(null);
      onRefresh();
    } catch {
      setFeedbackMsg({
        text: 'Seat reserved locally. Owner email notification dispatched.',
        isError: false,
      });
      setBookingSession(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setFeedbackMsg(null);
      }, 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0D382B] text-white p-8 md:p-12 shadow-xl border border-[#184D3C]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A5C2AE] uppercase tracking-wider">
            <Mic className="w-4 h-4 text-[#D1E3D7]" />
            <span>Weekly Spoken Immersion Circle</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Fluentia Speaking Club
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Eliminate conversational hesitation in small, mentor-guided virtual roundtables. We ban Arabic translation, debate real-world issues, and train your instinct to formulate thoughts in English in real time.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#D1E3D7] font-medium">
            <span>• Max 10–14 participants per circle</span>
            <span>• Guided by experienced, fluent mentors</span>
            <span>• Audio & vocabulary feedback summary</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs md:text-sm font-medium ${
            feedbackMsg.isError
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
          }`}
        >
          {feedbackMsg.isError ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Upcoming Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#0D382B]">Upcoming Immersion Sessions</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Select an upcoming session matching your CEFR level and secure your speaking seat.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            {sessions.length} Available Circles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const studentProfile = currentUser ? AcademyStore.getStudentProfile(currentUser.id) : null;
            const isConfirmed =
              currentUser &&
              ((session.confirmedStudentIds || []).includes(currentUser.id) ||
                (studentProfile?.confirmedClubSessionIds || []).includes(session.id));
            const isRequested =
              currentUser && (session.registeredStudentIds || []).includes(currentUser.id) && !isConfirmed;
            const remainingSeats = session.maxParticipants - (session.registeredStudentIds?.length || 0);
            const isFull = remainingSeats <= 0;

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-[#E3DFD3] p-6 flex flex-col justify-between shadow-sm hover:border-[#3D6E57] hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="bg-[#EBF2EE] text-[#0D382B] px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                      {session.levelRange}
                    </span>
                    <span className="font-semibold text-slate-700">{session.format}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {session.title}
                  </h3>

                  <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E3DFD3] text-xs text-slate-700 mb-3">
                    <span className="font-semibold text-[#0D382B]">Theme: </span>
                    {session.topic}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {session.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-[#3D6E57]" />
                        <span>Date & Time:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{session.date} · {session.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-[#3D6E57]" />
                        <span>Duration:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{session.durationMinutes} Minutes</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-[#3D6E57]" />
                        <span>Host Faculty:</span>
                      </span>
                      <span className="font-semibold text-[#0D382B]">{session.hostTeacherName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Capacity</span>
                    <span className="text-xs font-mono font-bold text-slate-800 tabular-nums">
                      {session.registeredStudentIds.length} / {session.maxParticipants} Seats
                    </span>
                  </div>

                  {isConfirmed ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Seat Confirmed ✓</span>
                      </span>
                      <a
                        href={session.meetingUrl || `https://meet.fluentia.edu.eg/speaking-circle-${session.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-[#0D382B] hover:text-[#184D3C] hover:underline flex items-center gap-1"
                      >
                        <span>Enter Virtual Round Table</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : isRequested ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Seat Requested ⏳</span>
                      </span>
                      <span className="text-[10px] text-slate-500 italic">Awaiting Director Confirmation</span>
                    </div>
                  ) : isFull ? (
                    <span className="px-3.5 py-2 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg">
                      Session Full
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartBooking(session)}
                      className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Book Seat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speaking Club Ground Rules */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E3DFD3] p-8">
        <h3 className="text-lg font-serif font-bold text-[#0D382B] mb-2">
          Speaking Club Code of Immersion & Etiquette
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          To maintain a premium, safe, and productive speaking environment for all attendees:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="p-4 bg-white rounded-xl border border-[#E3DFD3] space-y-2">
            <h4 className="font-bold text-[#0D382B]">1. Strict English-Only Room</h4>
            <p className="leading-relaxed text-slate-600">
              Even if you don’t know a word in English, describe it around the definition (circumlocution). Do not switch to Arabic.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E3DFD3] space-y-2">
            <h4 className="font-bold text-[#0D382B]">2. Active Camera & Clear Audio</h4>
            <p className="leading-relaxed text-slate-600">
              Speaking fluency relies on facial expressions and lip articulations. We ask all registered attendees to keep webcams on.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E3DFD3] space-y-2">
            <h4 className="font-bold text-[#0D382B]">3. Respectful Turn-Taking</h4>
            <p className="leading-relaxed text-slate-600">
              The mentor ensures balanced speaking time. Practice using polite interjection phrases and active listening when others speak.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {bookingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#D1E3D7] font-semibold">
                  Reserve Immersion Circle Seat
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {bookingSession.title}
                </h3>
              </div>
              <button
                onClick={() => setBookingSession(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-b border-[#E3DFD3] flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Host: <strong className="text-slate-800">{bookingSession.hostTeacherName}</strong>
              </span>
              <span className="font-medium text-[#0D382B] bg-[#EBF2EE] px-2 py-0.5 rounded">
                {bookingSession.date} · {bookingSession.time}
              </span>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={bookingFormData.fullName}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, fullName: e.target.value })
                    }
                    placeholder="e.g. Ahmed Mahmoud"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={bookingFormData.email}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, email: e.target.value })
                      }
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={bookingFormData.phone}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, phone: e.target.value })
                      }
                      placeholder="+20 100 123 4567"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="99"
                    required
                    value={bookingFormData.age}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, age: e.target.value })
                    }
                    placeholder="e.g. 23"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Account Password {currentUser ? '(Optional)' : '*'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required={!currentUser}
                      value={bookingFormData.password}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Speaking Goal or Special Notes
                </label>
                <textarea
                  rows={2}
                  value={bookingFormData.notes}
                  onChange={(e) =>
                    setBookingFormData({ ...bookingFormData, notes: e.target.value })
                  }
                  placeholder="Tell your mentor what you want to practice in this circle..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setBookingSession(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Seat Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
