import React, { useState } from 'react';
import { User, TeacherProfile, Assignment, SpeakingPracticeSubmission, LessonBooking, UserFile } from '../types';
import { AcademyStore } from '../services/storage';
import { ChatSystem } from '../components/ChatSystem';
import { AudioRecorder } from '../components/AudioRecorder';
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Mic,
  FolderLock,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ArrowRight,
  FileText,
  Star,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser }) => {
  const isPending = currentUser.status === 'pending';

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'schedule' | 'media' | 'chat'>('overview');

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | undefined>(() =>
    AcademyStore.getTeacherByUserId(currentUser.id)
  );

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    AcademyStore.getAssignments().filter((a) => a.teacherId === currentUser.id)
  );

  const [speakingSubmissions, setSpeakingSubmissions] = useState<SpeakingPracticeSubmission[]>(() =>
    AcademyStore.getSpeakingSubmissions()
  );

  const [lessons] = useState<LessonBooking[]>(() =>
    AcademyStore.getLessons().filter((l) => l.teacherId === currentUser.id)
  );

  const studentProfile = AcademyStore.getStudentProfile();

  // Create Assignment State
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgCourse, setNewAsgCourse] = useState('Speaking & Fluency Intensive Workshop');
  const [newAsgInstructions, setNewAsgInstructions] = useState('');
  const [newAsgDueDate, setNewAsgDueDate] = useState('2026-11-05');
  const [newAsgAttachmentName, setNewAsgAttachmentName] = useState('');
  const [newAsgAttachmentUrl, setNewAsgAttachmentUrl] = useState('');
  const [showCreateAsg, setShowCreateAsg] = useState(false);

  // Reviewing Speaking Submission State
  const [reviewingSubId, setReviewingSubId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [grammarScore, setGrammarScore] = useState(85);
  const [pronunciationScore, setPronunciationScore] = useState(80);
  const [fluencyScore, setFluencyScore] = useState(80);
  const [confidenceScore, setConfidenceScore] = useState(85);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) return;

    const attachments = newAsgAttachmentName.trim()
      ? [
          {
            name: newAsgAttachmentName.trim(),
            url: newAsgAttachmentUrl.trim() || '#',
            size: '1.4 MB',
          },
        ]
      : undefined;

    const newAssignment: Assignment = {
      id: `asg_${Date.now()}`,
      title: newAsgTitle.trim(),
      instructions: newAsgInstructions.trim(),
      courseId: 'course_speak_fluency',
      courseName: newAsgCourse,
      teacherId: currentUser.id,
      studentId: 'usr_stu_nour',
      dueDate: newAsgDueDate,
      status: 'assigned',
      attachments,
    };

    AcademyStore.saveAssignment(newAssignment);
    setAssignments(AcademyStore.getAssignments().filter((a) => a.teacherId === currentUser.id));
    setNewAsgTitle('');
    setNewAsgInstructions('');
    setNewAsgAttachmentName('');
    setNewAsgAttachmentUrl('');
    setShowCreateAsg(false);
  };

  const handlePublishFeedback = (subId: string) => {
    if (!feedbackComment.trim()) return;

    const sub = speakingSubmissions.find((s) => s.id === subId);

    AcademyStore.addSpeakingTeacherFeedback(subId, {
      teacherName: currentUser.fullName,
      teacherId: currentUser.id,
      reviewedAt: new Date().toISOString(),
      writtenComments: feedbackComment.trim(),
      grammarScore: Number(grammarScore),
      pronunciationScore: Number(pronunciationScore),
      fluencyScore: Number(fluencyScore),
      confidenceScore: Number(confidenceScore),
    });

    if (sub && sub.studentId) {
      AcademyStore.updateStudentProfile(
        {
          grammarScore: Number(grammarScore),
          pronunciationScore: Number(pronunciationScore),
          fluencyScore: Number(fluencyScore),
          confidenceScore: Number(confidenceScore),
        },
        sub.studentId
      );
    }

    setSpeakingSubmissions(AcademyStore.getSpeakingSubmissions());
    setReviewingSubId(null);
    setFeedbackComment('');
  };

  // IF TEACHER IS PENDING OWNER APPROVAL: DISPLAY PROTECTED RESTRICTED STATE
  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
          <div className="bg-amber-500/10 border-b border-amber-200 px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Teacher Application Under Review</h2>
              <p className="text-xs text-amber-900 font-mono">Academic Verification in Progress · Status: PENDING</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              Hello <span className="font-semibold text-slate-900">{currentUser.fullName}</span>. Thank you for applying to teach at Fluentia English Academy. Your application has been registered in our moderation queue and is currently undergoing credential verification by our Academic Director.
            </p>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                Security & Student Safeguarding Policy:
              </h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Private Student Records Protection:</strong> In accordance with our safeguarding constitution, pending instructors cannot access student profiles, contact students, or receive lesson bookings until qualifications are approved.
                </li>
                <li>
                  <strong>Public Faculty Directory:</strong> Your profile is currently hidden from the public website directory.
                </li>
                <li>
                  <strong>Owner Notification:</strong> Academy leadership reviews applications within 24–48 hours. Once verified, all teaching portals, messaging channels, and booking schedules will activate automatically.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#EBF2EE] rounded-xl border border-[#D1E3D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#0D382B]">
              <div>
                <span className="font-bold block">Need expedited review or have credential updates?</span>
                <p className="text-slate-600 text-[11px] mt-0.5">Contact Academy Director Basmala Ahmed directly.</p>
              </div>
              <a
                href="mailto:fluentia.academy.edu@gmail.com?subject=Teacher%20Application%20Inquiry%20-%20Fluentia%20English%20Academy"
                className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <span>Email Academy Director</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={teacherProfile?.avatarUrl || currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0D382B]/15 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.fullName}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Faculty</span>
              </span>
            </div>
            <p className="text-xs text-[#3D6E57] font-semibold mt-0.5">
              {teacherProfile?.title || 'Academic English Lead'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('assignments')}
            className="px-3.5 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'students', label: 'My Assigned Students', icon: Users },
            { id: 'assignments', label: 'Assignment Reviews', icon: BookOpen },
            { id: 'schedule', label: 'Schedule & Bookings', icon: Calendar },
            { id: 'chat', label: 'Student Messages', icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-[#0D382B] text-[#D1E3D7] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Content */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Assigned Students</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">1</p>
                  <span className="text-[10px] text-slate-500">Active Mentees</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Pending Reviews</span>
                  <p className="text-xl font-bold text-amber-600 font-mono tabular-nums mt-1">1</p>
                  <span className="text-[10px] text-slate-500">Audio Submissions</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Upcoming Lessons</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">{lessons.length}</p>
                  <span className="text-[10px] text-slate-500">This Week</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Faculty Rating</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {teacherProfile?.rating || '4.95'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">100% Verified</span>
                </div>
              </div>

              {/* Speaking Submissions Awaiting Review */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Student Voice Submissions Awaiting Evaluation</h3>
                {speakingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{sub.promptDescription}</span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {sub.studentName} — {sub.promptTitle}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {sub.status}
                      </span>
                    </div>

                    {sub.writtenResponse && (
                      <p className="text-xs text-slate-600 italic">"{sub.writtenResponse}"</p>
                    )}

                    {reviewingSubId === sub.id ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                        <h5 className="text-xs font-bold text-slate-900">Submit Spoken Phonology Assessment</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="block text-slate-500 mb-1">Grammar ({grammarScore}%)</label>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={grammarScore}
                              onChange={(e) => setGrammarScore(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Pronunciation ({pronunciationScore}%)</label>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={pronunciationScore}
                              onChange={(e) => setPronunciationScore(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Fluency ({fluencyScore}%)</label>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={fluencyScore}
                              onChange={(e) => setFluencyScore(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Confidence ({confidenceScore}%)</label>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={confidenceScore}
                              onChange={(e) => setConfidenceScore(Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Written Feedback & Phonetic Notes
                          </label>
                          <textarea
                            rows={3}
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Provide constructive feedback on sentence rhythm, vowel length, and linking..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePublishFeedback(sub.id)}
                            className="px-4 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg"
                          >
                            Publish Evaluation to Student
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewingSubId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewingSubId(sub.id);
                          setFeedbackComment(sub.feedback?.writtenComments || '');
                        }}
                        className="px-3.5 py-1.5 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
                      >
                        {sub.status === 'reviewed' ? 'Update Evaluation' : 'Evaluate Recording'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MY STUDENTS */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">Assigned Mentee Dossier</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120"
                    alt="Nour"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Nour Khalil</h4>
                    <p className="text-xs text-slate-500">Level: CEFR {studentProfile.estimatedLevel} · Computer Engineering</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Average Fluency: </span>
                    <span className="font-mono font-bold">{studentProfile.fluencyScore}%</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Grammar Accuracy: </span>
                    <span className="font-mono font-bold">{studentProfile.grammarScore}%</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Dated Academic Notes & Targets:
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {studentProfile.learningNotes}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENT REVIEWS & CREATION */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assignment Management</h3>
                  <p className="text-xs text-slate-500">Create written and pronunciation assignments with deadlines.</p>
                </div>
                <button
                  onClick={() => setShowCreateAsg(!showCreateAsg)}
                  className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Assignment</span>
                </button>
              </div>

              {showCreateAsg && (
                <form onSubmit={handleCreateAssignment} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Create New Course Assignment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Assignment Title</label>
                      <input
                        type="text"
                        required
                        value={newAsgTitle}
                        onChange={(e) => setNewAsgTitle(e.target.value)}
                        placeholder="e.g. STAR Method Interview Script"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        required
                        value={newAsgDueDate}
                        onChange={(e) => setNewAsgDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Instructions & Rubric</label>
                    <textarea
                      rows={3}
                      required
                      value={newAsgInstructions}
                      onChange={(e) => setNewAsgInstructions(e.target.value)}
                      placeholder="Outline instructions, required modal verb structures, and word count..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Attachment File / Resource Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAsgAttachmentName}
                        onChange={(e) => setNewAsgAttachmentName(e.target.value)}
                        placeholder="e.g. Unit_3_Phonology_Worksheet.pdf"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Attachment Link / URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAsgAttachmentUrl}
                        onChange={(e) => setNewAsgAttachmentUrl(e.target.value)}
                        placeholder="https://... or # for built-in PDF"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg"
                    >
                      Publish Assignment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateAsg(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {assignments.map((asg) => (
                  <div key={asg.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                      <span className="text-[11px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                        {asg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{asg.instructions}</p>
                    {asg.attachments && asg.attachments.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">Attached Study Materials:</span>
                        <div className="flex flex-wrap gap-2">
                          {asg.attachments.map((att, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] rounded-lg border border-slate-200 flex items-center gap-1.5"
                            >
                              <FileText className="w-3 h-3 text-[#0D382B]" />
                              <span>{att.name}</span>
                              <span className="text-slate-400 font-mono text-[10px]">({att.size})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {asg.submission && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-900 block mb-1">Student Submission:</span>
                        <p className="text-slate-700 italic">{asg.submission.textResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">Weekly Mentorship Calendar</h3>
              <div className="space-y-3">
                {lessons.map((les) => (
                  <div key={les.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{les.courseName}</h4>
                      <p className="text-slate-500">Student: {les.studentName}</p>
                      <p className="text-slate-400 font-mono mt-0.5">{les.date} · {les.time}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-mono font-semibold text-[11px]">
                      {les.status === 'confirmed' ? 'Scheduled' : les.status === 'completed' ? 'Finished' : les.status === 'pending' ? 'Pending' : 'Ongoing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHAT */}
          {activeTab === 'chat' && (
            <div>
              <ChatSystem currentUser={currentUser} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
