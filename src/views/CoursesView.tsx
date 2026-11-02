import React, { useState, useEffect } from 'react';
import { Course, User, CefrLevel } from '../types';
import { AcademyStore } from '../services/storage';
import { notifyBookingSubmission, notifySeatConfirmation } from '../services/formspree';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefreshCourses: () => void;
  initialFilterLevel?: string;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  currentUser,
  onOpenAuth,
  onRefreshCourses,
  initialFilterLevel = 'all',
}) => {
  const [filterLevel, setFilterLevel] = useState<string>(initialFilterLevel);

  useEffect(() => {
    if (initialFilterLevel) {
      setFilterLevel(initialFilterLevel);
    }
  }, [initialFilterLevel]);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student booking form state
  const [studentName, setStudentName] = useState(currentUser?.fullName || '');
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || '');
  const [studentPhone, setStudentPhone] = useState(currentUser?.phone || '');
  const [studentAge, setStudentAge] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentNotes, setStudentNotes] = useState('');

  // Owner Mode Course Editing State
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const isOwner = currentUser?.role === 'owner';

  const studentProfile = currentUser?.role === 'student' ? AcademyStore.getStudentProfile() : null;

  const filteredCourses = courses.filter((c) => {
    if (!isOwner && c.status !== 'published') return false;
    if (filterLevel === 'all') return true;
    return c.level.toLowerCase().includes(filterLevel.toLowerCase());
  });

  const handleOpenEnrollModal = (course: Course) => {
    setSelectedCourseForEnroll(course);
    setEnrollSuccess(false);
    setStudentName(currentUser?.fullName || '');
    setStudentEmail(currentUser?.email || '');
    setStudentPhone(currentUser?.phone || '');
    setStudentAge('');
    setStudentPassword('');
    setStudentNotes('');
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEnroll) return;
    setIsSubmitting(true);

    let studentUserId = currentUser?.id;

    // If new user registering on the fly
    if (!currentUser) {
      studentUserId = `usr_stu_${Date.now()}`;
      const newUser: User = {
        id: studentUserId,
        email: studentEmail.trim(),
        fullName: studentName.trim(),
        role: 'student',
        status: 'active',
        phone: studentPhone.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const users = AcademyStore.getUsers();
      users.push(newUser);
      localStorage.setItem('fluentia_users', JSON.stringify(users));
      AcademyStore.setCurrentUser(newUser);

      AcademyStore.updateStudentProfile({
        userId: studentUserId,
        estimatedLevel: selectedCourseForEnroll.level === 'All Levels' ? 'B1' : selectedCourseForEnroll.level,
        goals: [`Complete ${selectedCourseForEnroll.title}`],
        preferredFormat: 'group',
        enrolledCourseIds: [selectedCourseForEnroll.id],
      });
    }

    if (studentUserId) {
      AcademyStore.enrollInCourse(selectedCourseForEnroll.id, studentUserId);
    }

    // Dispatch seat confirmation and booking to Formspree (https://formspree.io/f/xnppbnqo)
    await notifySeatConfirmation({
      itemType: 'Course Cohort',
      itemName: `${selectedCourseForEnroll.title} (${selectedCourseForEnroll.code})`,
      studentName: studentName.trim(),
      email: studentEmail.trim(),
      phone: studentPhone.trim(),
      age: studentAge,
      password: studentPassword || (currentUser ? '[Existing User Session]' : undefined),
      tuition: `${selectedCourseForEnroll.priceEgp} EGP ($${selectedCourseForEnroll.priceUsd} USD)`,
      notes: studentNotes.trim() || 'No special notes',
    });

    setIsSubmitting(false);
    setEnrollSuccess(true);
    onRefreshCourses();
  };

  // Owner saves edited or newly created course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToEdit) return;

    AcademyStore.saveCourse(courseToEdit);
    setCourseToEdit(null);
    setIsCreatingNew(false);
    onRefreshCourses();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course from the academy catalog?')) {
      AcademyStore.deleteCourse(courseId);
      setCourseToEdit(null);
      onRefreshCourses();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
          Curriculum of Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D382B] mt-1">
          Academic Courses & Intensive Programs
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Calibrated to the Common European Framework of Reference for Languages (CEFR). Designed for adult and university learners seeking definitive spoken fluency and executive writing skills.
        </p>

        {isOwner && (
          <div className="mt-4 inline-flex items-center gap-2">
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setCourseToEdit({
                  id: `course_${Date.now()}`,
                  title: '',
                  code: 'ENG-',
                  level: 'B1',
                  audience: 'Adult learners & university students',
                  description: '',
                  outcomes: ['Spoken English Fluency', 'Grammar Precision', 'Pronunciation Clarity'],
                  format: 'Group Class',
                  durationWeeks: 10,
                  hoursPerWeek: 4,
                  priceEgp: 3500,
                  priceUsd: 115,
                  status: 'published',
                  enrolledCount: 0,
                });
              }}
              className="px-4 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Owner Mode: Add New Course</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {['all', 'A1', 'A2', 'B1', 'B2', 'All Levels'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterLevel === lvl
                ? 'bg-[#0D382B] text-[#D1E3D7] shadow-sm'
                : 'bg-white border border-[#E3DFD3] text-slate-700 hover:border-[#3D6E57]'
            }`}
          >
            {lvl === 'all' ? 'All Programs' : lvl}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const isEnrolled = studentProfile?.enrolledCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-[#E3DFD3] overflow-hidden shadow-sm hover:border-[#3D6E57] hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              {/* Owner quick edit button */}
              {isOwner && (
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setCourseToEdit({ ...course });
                    }}
                    className="px-2.5 py-1 bg-[#0D382B] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow-md hover:bg-[#184D3C] transition-colors"
                    title="Edit course details, price, syllabus"
                  >
                    <Edit3 className="w-3 h-3 text-[#D1E3D7]" />
                    <span>Edit Course</span>
                  </button>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3">
                  <span className="bg-[#EBF2EE] text-[#0D382B] px-2.5 py-0.5 rounded font-bold">
                    {course.level}
                  </span>
                  <span className="text-slate-400">{course.code}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {course.description}
                </p>

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E3DFD3] space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-[#3D6E57]" />
                      Duration:
                    </span>
                    <span className="font-semibold text-slate-800">{course.durationWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-[#3D6E57]" />
                      Format:
                    </span>
                    <span className="font-semibold text-slate-800">{course.format}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-[#3D6E57]" />
                      Intensity:
                    </span>
                    <span className="font-semibold text-slate-800">{course.hoursPerWeek} hrs/week</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Key Competencies Acquired:
                  </h4>
                  <ul className="space-y-1.5">
                    {course.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6E57] shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer / CTA */}
              <div className="p-6 bg-[#FAF8F5] border-t border-[#E3DFD3] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Tuition</p>
                  <p className="text-base font-bold text-[#0D382B] font-mono tabular-nums">
                    {course.priceEgp.toLocaleString()} EGP
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">≈ ${course.priceUsd} USD</p>
                </div>

                {isEnrolled ? (
                  <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Enrolled</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenEnrollModal(course)}
                    className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Enrollment & Notification Modal */}
      {selectedCourseForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Course Enrolment Form</h3>
                <p className="text-xs text-[#A5C2AE] font-mono">{selectedCourseForEnroll.title} ({selectedCourseForEnroll.code})</p>
              </div>
              <button
                onClick={() => setSelectedCourseForEnroll(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {enrollSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Enrolment Form Received!</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Thank you, <span className="font-semibold text-slate-900">{studentName}</span>. Your enrolment request for <span className="font-semibold text-slate-900">{selectedCourseForEnroll.title}</span> has been confirmed and immediately dispatched to the Academy Director.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Tuition: {selectedCourseForEnroll.priceEgp} EGP (${selectedCourseForEnroll.priceUsd} USD).
                  </p>
                  <button
                    onClick={() => setSelectedCourseForEnroll(null)}
                    className="mt-6 px-6 py-2.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnrollSubmit} className="space-y-4">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Program:</span>
                      <span className="font-semibold text-slate-900">{selectedCourseForEnroll.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tuition:</span>
                      <span className="font-bold text-[#0D382B] font-mono">
                        {selectedCourseForEnroll.priceEgp.toLocaleString()} EGP (${selectedCourseForEnroll.priceUsd} USD)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Mahmoud Ali"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="mahmoud@gmail.com"
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
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="+20 100 123 4567"
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
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        placeholder="e.g. 23"
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
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        This creates your Student Portal account so you can access your worksheets and live sessions.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Learning Goals or Questions</label>
                    <textarea
                      rows={2}
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      placeholder="e.g. Focusing on conversation, preparing for engineering interviews, etc."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                    />
                  </div>

                  <div className="p-3 bg-[#EBF2EE] border border-[#D1E3D7] rounded-xl text-xs text-[#0D382B] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3D6E57] shrink-0 mt-0.5" />
                    <span>
                      Information is securely forwarded to the Academy Director. Your schedule and diagnostic assessment will be coordinated immediately.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Transmitting Details...' : 'Submit Enrolment & Reserve Seat'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Owner Mode Course Editor / Creator Modal */}
      {courseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D1E3D7]" />
                <h3 className="text-base font-bold text-white">
                  {isCreatingNew ? 'Create New Academy Course' : `Edit Course: ${courseToEdit.title}`}
                </h3>
              </div>
              <button
                onClick={() => setCourseToEdit(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseToEdit.title}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, title: e.target.value })}
                    placeholder="e.g. B1: Intermediate Fluency & Grammar"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseToEdit.code}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, code: e.target.value })}
                    placeholder="ENG-B101"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CEFR Level</label>
                  <select
                    value={courseToEdit.level}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, level: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper-Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tuition (EGP)</label>
                  <input
                    type="number"
                    required
                    value={courseToEdit.priceEgp}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, priceEgp: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tuition (USD)</label>
                  <input
                    type="number"
                    required
                    value={courseToEdit.priceUsd}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, priceUsd: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  required
                  value={courseToEdit.description}
                  onChange={(e) => setCourseToEdit({ ...courseToEdit, description: e.target.value })}
                  placeholder="Detailed course description and goals..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Key Outcomes (One per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={courseToEdit.outcomes.join('\n')}
                  onChange={(e) =>
                    setCourseToEdit({
                      ...courseToEdit,
                      outcomes: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                    })
                  }
                  placeholder="Introduce yourself clearly&#10;Master past tenses&#10;Deliver business presentations"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    required
                    value={courseToEdit.durationWeeks}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, durationWeeks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Hours / Week</label>
                  <input
                    type="number"
                    required
                    value={courseToEdit.hoursPerWeek}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, hoursPerWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Catalog Status</label>
                  <select
                    value={courseToEdit.status}
                    onChange={(e) => setCourseToEdit({ ...courseToEdit, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {!isCreatingNew ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(courseToEdit.id)}
                    className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Course</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseToEdit(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Save Course Changes
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
