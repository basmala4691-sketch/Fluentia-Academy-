import React, { useState } from 'react';
import { TeacherProfile, User } from '../types';
import { AcademyStore } from '../services/storage';
import { notifyBookingSubmission } from '../services/formspree';
import {
  Search,
  Star,
  Award,
  Globe,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
} from 'lucide-react';

interface TeachersViewProps {
  teachers: TeacherProfile[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onStartChatWithTeacher?: (teacherUserId: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  currentUser,
  onOpenAuth,
  onStartChatWithTeacher,
}) => {
  const [localTeachers, setLocalTeachers] = useState<TeacherProfile[]>(teachers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<TeacherProfile | null>(null);
  const [selectedTeacherProfileModal, setSelectedTeacherProfileModal] = useState<TeacherProfile | null>(null);

  // Booking modal form state
  const [bookingName, setBookingName] = useState(currentUser?.fullName || '');
  const [bookingEmail, setBookingEmail] = useState(currentUser?.email || '');
  const [bookingPhone, setBookingPhone] = useState(currentUser?.phone || '');
  const [bookingAge, setBookingAge] = useState('');
  const [bookingPassword, setBookingPassword] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-10-30');
  const [bookingTime, setBookingTime] = useState('6:00 PM CLT');
  const [bookingNotes, setBookingNotes] = useState('Focus on job interview STAR methodology & pronunciation.');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Owner Mode Teacher Editing State
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherProfile | null>(null);
  const [isCreatingNewTeacher, setIsCreatingNewTeacher] = useState(false);
  const isOwner = currentUser?.role === 'owner';

  const refreshTeachersList = () => {
    setLocalTeachers(AcademyStore.getTeachers());
  };

  // Only approved teachers are published in public directory, unless owner is viewing
  const availableTeachers = isOwner ? localTeachers : localTeachers.filter((t) => t.isApproved);

  const filteredTeachers = availableTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teacher.qualifications.some((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedSpecialization === 'all') return true;
    return teacher.specializations.some((s) =>
      s.toLowerCase().includes(selectedSpecialization.toLowerCase())
    );
  });

  const handleOpenBookingModal = (teacher: TeacherProfile) => {
    setSelectedTeacherForBooking(teacher);
    setBookingSuccess(false);
    setBookingName(currentUser?.fullName || '');
    setBookingEmail(currentUser?.email || '');
    setBookingPhone(currentUser?.phone || '');
    setBookingAge('');
    setBookingPassword('');
    setBookingDate('2026-10-30');
    setBookingTime('6:00 PM CLT');
    setBookingNotes('Focus on job interview STAR methodology & pronunciation.');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForBooking) return;
    setIsSubmitting(true);

    let studentUserId = currentUser?.id;

    // If student isn't logged in, register on the spot
    if (!currentUser) {
      studentUserId = `usr_stu_${Date.now()}`;
      const newUser: User = {
        id: studentUserId,
        email: bookingEmail.trim(),
        fullName: bookingName.trim(),
        role: 'student',
        status: 'active',
        phone: bookingPhone.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const users = AcademyStore.getUsers();
      users.push(newUser);
      localStorage.setItem('fluentia_users', JSON.stringify(users));
      AcademyStore.setCurrentUser(newUser);

      AcademyStore.updateStudentProfile({
        userId: studentUserId,
        estimatedLevel: 'B1',
        goals: ['1-on-1 Faculty Mentorship'],
        preferredFormat: 'one-on-one',
        enrolledCourseIds: [],
      });
    }

    if (studentUserId) {
      AcademyStore.bookLesson({
        id: `les_${Date.now()}`,
        studentId: studentUserId,
        studentName: bookingName.trim(),
        teacherId: selectedTeacherForBooking.userId,
        teacherName: selectedTeacherForBooking.name,
        courseName: 'Personalized 1-on-1 Mentorship',
        date: bookingDate,
        time: bookingTime,
        durationMinutes: 60,
        status: 'confirmed',
        notes: bookingNotes,
        meetingUrl: `https://meet.fluentia.edu.eg/room-${Date.now().toString().slice(-4)}`,
      });
    }

    // Immediately dispatch email to Owner via Formspree
    await notifyBookingSubmission({
      bookingType: '1-on-1 Teacher Mentorship',
      itemName: `Mentorship with ${selectedTeacherForBooking.name}`,
      studentName: bookingName.trim(),
      email: bookingEmail.trim(),
      phone: bookingPhone.trim(),
      age: bookingAge,
      password: bookingPassword || (currentUser ? '[Existing User Session]' : undefined),
      price: `${selectedTeacherForBooking.hourlyRateEgp} EGP ($${selectedTeacherForBooking.hourlyRateUsd} USD) / 60 min`,
      scheduledDate: bookingDate,
      scheduledTime: bookingTime,
      notes: bookingNotes,
    });

    setIsSubmitting(false);
    setBookingSuccess(true);
  };

  // Owner saves teacher card
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherToEdit) return;

    AcademyStore.saveTeacher(teacherToEdit);
    setTeacherToEdit(null);
    setIsCreatingNewTeacher(false);
    refreshTeachersList();
  };

  const handleDeleteTeacher = (teacherId: string) => {
    if (confirm('Are you sure you want to remove this teacher from the faculty directory?')) {
      AcademyStore.deleteTeacher(teacherId);
      setTeacherToEdit(null);
      refreshTeachersList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
          Experienced Mentors
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D382B] mt-1">
          Distinguished English Educators
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Learn directly from experienced, high-proficiency English mentors with proven language mastery and practical coaching expertise.
        </p>

        {isOwner && (
          <div className="mt-4 inline-flex items-center gap-2">
            <button
              onClick={() => {
                setIsCreatingNewTeacher(true);
                setTeacherToEdit({
                  id: `prof_tea_${Date.now()}`,
                  userId: `usr_tea_${Date.now()}`,
                  name: '',
                  title: 'English Educator & Speaking Coach',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                  bio: '',
                  qualifications: ['5+ Years Teaching Experience', 'B.A. English'],
                  experienceYears: 5,
                  specializations: ['Conversational Fluency', 'Phonology'],
                  languages: ['Arabic (Native)', 'English (C2)'],
                  proficiency: 'Near-Native C2',
                  preferredLevels: ['A2', 'B1', 'B2', 'C1'],
                  lessonFormats: ['1-on-1 Intensive', 'Group Class'],
                  hourlyRateEgp: 600,
                  hourlyRateUsd: 20,
                  rating: 5.0,
                  reviewsCount: 1,
                  isApproved: true,
                  availabilitySummary: 'Sunday to Thursday: 4:00 PM – 9:00 PM CLT',
                });
              }}
              className="px-4 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Owner Mode: Add Faculty Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E3DFD3] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, qualification, or accent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0D382B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter:</span>
          {['all', 'Pronunciation', 'Business', 'IELTS', 'Fluency'].map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedSpecialization === spec
                  ? 'bg-[#0D382B] text-[#D1E3D7]'
                  : 'bg-[#FAF8F5] text-slate-700 hover:bg-[#EBF2EE]'
              }`}
            >
              {spec === 'all' ? 'All Specialties' : spec}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-sm hover:border-[#3D6E57] hover:shadow-md transition-all flex flex-col justify-between relative group"
          >
            {/* Owner quick edit button */}
            {isOwner && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCreatingNewTeacher(false);
                    setTeacherToEdit({ ...teacher });
                  }}
                  className="px-2.5 py-1 bg-[#0D382B] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow-md hover:bg-[#184D3C] transition-colors"
                  title="Edit faculty profile, biography, qualifications, and rates"
                >
                  <Edit3 className="w-3 h-3 text-[#D1E3D7]" />
                  <span>Edit Teacher Card</span>
                </button>
              </div>
            )}

            <div>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-1.5 pr-20 sm:pr-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#2E7D5B] font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{teacher.rating}</span>
                      <span className="text-slate-500 font-normal">({teacher.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#3D6E57]">{teacher.title}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.experienceYears} Years Experience</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.proficiency}</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-4">{teacher.bio}</p>

              {/* Qualifications */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Verified Academic Credentials:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.qualifications.map((q, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#EBF2EE] border border-[#D1E3D7] text-[#0D382B] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#3D6E57]" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specializations & Availability */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-[#FAF8F5] p-3 rounded-xl border border-[#E3DFD3]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Specializations</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {teacher.specializations.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Schedule</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {teacher.availabilitySummary}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-mono">1-on-1 Tuition</p>
                <p className="text-sm font-bold text-[#0D382B] font-mono tabular-nums">
                  {teacher.hourlyRateEgp} EGP <span className="text-slate-500 font-normal font-sans text-xs">/ 60 min</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">≈ ${teacher.hourlyRateUsd} USD</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTeacherProfileModal(teacher)}
                  className="px-3.5 py-2 border border-[#E3DFD3] text-slate-700 text-xs font-semibold rounded-lg hover:border-[#3D6E57] hover:bg-[#FAF8F5] transition-colors"
                >
                  Full Bio
                </button>
                <button
                  onClick={() => handleOpenBookingModal(teacher)}
                  className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Book 1-on-1 Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {selectedTeacherForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Schedule 1-on-1 Mentorship</h3>
                <p className="text-xs text-[#A5C2AE]">Direct booking with {selectedTeacherForBooking.name}</p>
              </div>
              <button
                onClick={() => setSelectedTeacherForBooking(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Mentorship Request Dispatched!</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Thank you, <span className="font-semibold text-slate-900">{bookingName}</span>. Your private session with <span className="font-semibold text-slate-900">{selectedTeacherForBooking.name}</span> on {bookingDate} at {bookingTime} has been submitted and transmitted immediately to the Academy Director.
                  </p>
                  <button
                    onClick={() => setSelectedTeacherForBooking(null)}
                    className="mt-6 px-6 py-2.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instructor:</span>
                      <span className="font-semibold text-slate-900">{selectedTeacherForBooking.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rate:</span>
                      <span className="font-bold text-[#0D382B] font-mono">
                        {selectedTeacherForBooking.hourlyRateEgp} EGP (${selectedTeacherForBooking.hourlyRateUsd}) / 60 min
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="e.g. Dina Samy"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        placeholder="dina@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="+20 114 550 8821"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        min="12"
                        max="100"
                        required
                        value={bookingAge}
                        onChange={(e) => setBookingAge(e.target.value)}
                        placeholder="e.g. 25"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                  </div>

                  {!currentUser && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Create Account Password
                      </label>
                      <input
                        type="password"
                        required
                        value={bookingPassword}
                        onChange={(e) => setBookingPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Creates your student account to access video room links & recordings.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Select Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Time Slot (Cairo Time)</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      >
                        <option value="4:00 PM CLT">4:00 PM CLT</option>
                        <option value="6:00 PM CLT">6:00 PM CLT</option>
                        <option value="7:30 PM CLT">7:30 PM CLT</option>
                        <option value="9:00 PM CLT">9:00 PM CLT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Learning Focus & Goals</label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. Preparing for multinational job interview; reducing Arabic accent transfer..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Confirm Lesson Booking'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Bio Modal */}
      {selectedTeacherProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{selectedTeacherProfileModal.name}</h3>
                <p className="text-xs text-[#A5C2AE]">{selectedTeacherProfileModal.title}</p>
              </div>
              <button
                onClick={() => setSelectedTeacherProfileModal(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Faculty Biography</h4>
                <p className="leading-relaxed text-slate-600">{selectedTeacherProfileModal.bio}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Academic Credentials</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {selectedTeacherProfileModal.qualifications.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Languages Spoken</h4>
                <p className="text-slate-600">{selectedTeacherProfileModal.languages.join(' · ')}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    const t = selectedTeacherProfileModal;
                    setSelectedTeacherProfileModal(null);
                    handleOpenBookingModal(t);
                  }}
                  className="px-4 py-2 bg-[#0D382B] text-white font-semibold rounded-lg hover:bg-[#184D3C]"
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Mode Teacher Editor / Creator Modal */}
      {teacherToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D1E3D7]" />
                <h3 className="text-base font-bold text-white">
                  {isCreatingNewTeacher ? 'Add New Faculty Member' : `Edit Faculty Card: ${teacherToEdit.name}`}
                </h3>
              </div>
              <button
                onClick={() => setTeacherToEdit(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Teacher Full Name</label>
                  <input
                    type="text"
                    required
                    value={teacherToEdit.name}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, name: e.target.value })}
                    placeholder="e.g. Dr. Amina El-Sayed"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Professional Academic Title</label>
                  <input
                    type="text"
                    required
                    value={teacherToEdit.title}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, title: e.target.value })}
                    placeholder="e.g. Senior Academic Lead & Bilingual Phonology Specialist"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  required
                  value={teacherToEdit.avatarUrl}
                  onChange={(e) => setTeacherToEdit({ ...teacherToEdit, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Professional Biography</label>
                <textarea
                  rows={3}
                  required
                  value={teacherToEdit.bio}
                  onChange={(e) => setTeacherToEdit({ ...teacherToEdit, bio: e.target.value })}
                  placeholder="Detailed educator background, specializations, and methodology..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={teacherToEdit.experienceYears}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rate (EGP / 60 min)</label>
                  <input
                    type="number"
                    required
                    value={teacherToEdit.hourlyRateEgp}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, hourlyRateEgp: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rate (USD / 60 min)</label>
                  <input
                    type="number"
                    required
                    value={teacherToEdit.hourlyRateUsd}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, hourlyRateUsd: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Qualifications (Comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherToEdit.qualifications.join(', ')}
                    onChange={(e) =>
                      setTeacherToEdit({
                        ...teacherToEdit,
                        qualifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="5+ Years Teaching Experience, B.A. English"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Specializations (Comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherToEdit.specializations.join(', ')}
                    onChange={(e) =>
                      setTeacherToEdit({
                        ...teacherToEdit,
                        specializations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Pronunciation, Business English, IELTS"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rating (e.g. 4.95)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    required
                    value={teacherToEdit.rating}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Reviews Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={teacherToEdit.reviewsCount}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, reviewsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Public Directory Status</label>
                  <select
                    value={teacherToEdit.isApproved ? 'approved' : 'pending'}
                    onChange={(e) => setTeacherToEdit({ ...teacherToEdit, isApproved: e.target.value === 'approved' })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="approved">Approved & Listed</option>
                    <option value="pending">Pending Moderation (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Availability Schedule</label>
                <input
                  type="text"
                  required
                  value={teacherToEdit.availabilitySummary}
                  onChange={(e) => setTeacherToEdit({ ...teacherToEdit, availabilitySummary: e.target.value })}
                  placeholder="Sunday to Thursday: 4:00 PM – 10:00 PM CLT"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {!isCreatingNewTeacher ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTeacher(teacherToEdit.id)}
                    className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Teacher</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTeacherToEdit(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Save Teacher Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
