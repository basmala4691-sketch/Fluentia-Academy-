import React, { useState, useEffect } from 'react';
import {
  User,
  StudentProfile,
  SpeakingPracticeSubmission,
  VocabularyItem,
  Course,
  Assignment,
  LessonBooking,
  UserFile,
  CourseSession,
  SpeakingClubSession,
} from '../types';
import { AcademyStore } from '../services/storage';
import { sendFormspreePayload } from '../services/formspree';
import { AudioRecorder } from '../components/AudioRecorder';
import { ChatSystem } from '../components/ChatSystem';
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  Users,
  FolderLock,
  LineChart,
  Bookmark,
  CalendarCheck,
  Settings,
  MessageSquare,
  Play,
  Pause,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Check,
  FileText,
  Volume2,
  Sparkles,
  Video,
  X,
  ExternalLink,
  Download,
  AlertCircle,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  onNavigateToCourses: () => void;
  onNavigateToPlacementTest: () => void;
  onNavigateToSpeakingClub?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onNavigateToCourses,
  onNavigateToPlacementTest,
  onNavigateToSpeakingClub,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'courses'
    | 'speaking'
    | 'teachers'
    | 'files'
    | 'progress'
    | 'vocabulary'
    | 'plan'
    | 'messages'
    | 'settings'
  >('overview');

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() =>
    AcademyStore.getStudentProfile(currentUser.id)
  );

  const [clubs, setClubs] = useState<SpeakingClubSession[]>(() => AcademyStore.getSpeakingClubs());

  const [teachers] = useState(() => AcademyStore.getTeachers());

  useEffect(() => {
    setStudentProfile(AcademyStore.getStudentProfile(currentUser.id));
    setClubs(AcademyStore.getSpeakingClubs());
  }, [currentUser.id, activeSubTab]);

  const confirmedClubs = clubs.filter(
    (c) =>
      (studentProfile.confirmedClubSessionIds || []).includes(c.id) ||
      (c.confirmedStudentIds || []).includes(currentUser.id)
  );

  const pendingClubs = clubs.filter(
    (c) =>
      (c.registeredStudentIds || []).includes(currentUser.id) &&
      !((studentProfile.confirmedClubSessionIds || []).includes(c.id) ||
        (c.confirmedStudentIds || []).includes(currentUser.id))
  );

  const [courses] = useState<Course[]>(() => AcademyStore.getCourses());
  const [submissions, setSubmissions] = useState<SpeakingPracticeSubmission[]>(() =>
    AcademyStore.getSpeakingSubmissions().filter((s) => s.studentId === currentUser.id)
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    AcademyStore.getAssignments().filter((a) => a.studentId === currentUser.id)
  );
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() =>
    AcademyStore.getVocabulary().filter((v) => v.studentId === currentUser.id)
  );
  const [lessons] = useState<LessonBooking[]>(() =>
    AcademyStore.getLessons().filter((l) => l.studentId === currentUser.id)
  );
  const [files, setFiles] = useState<UserFile[]>(() => AcademyStore.getFiles());

  // Interactive Course Workspace State (Sessions, Recordings, Assignments, Chat)
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);
  const [activeWatchingSession, setActiveWatchingSession] = useState<CourseSession | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [assignmentResponseText, setAssignmentResponseText] = useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignmentSuccessToast, setAssignmentSuccessToast] = useState<string | null>(null);

  // Speaking submission state
  const [promptTitle, setPromptTitle] = useState('Describing a Complex Decision Under Uncertainty');
  const [promptCategory, setPromptCategory] = useState('Business Strategy & Decision Making');
  const [promptText, setPromptText] = useState('');
  const [recordedAudio, setRecordedAudio] = useState<{ url: string; duration: number } | null>(null);
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Vocabulary Form & Flashcard Revision Mode
  const [newVocabTerm, setNewVocabTerm] = useState('');
  const [newVocabPos, setNewVocabPos] = useState<VocabularyItem['partOfSpeech']>('verb');
  const [newVocabDef, setNewVocabDef] = useState('');
  const [newVocabEx, setNewVocabEx] = useState('');
  const [newVocabCategory, setNewVocabCategory] = useState<VocabularyItem['category']>('Business');
  const [vocabSearch, setVocabSearch] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionIndex, setRevisionIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  // File Upload State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'audio' | 'doc'>('pdf');
  const [fileSearch, setFileSearch] = useState('');

  // Playing audio feedback state
  const [activeFeedbackPlaying, setActiveFeedbackPlaying] = useState<string | null>(null);

  const enrolledCourses = courses.filter((c) =>
    studentProfile.enrolledCourseIds.includes(c.id)
  );

  const myFiles = files.filter(
    (f) => f.ownerId === currentUser.id || !f.isPrivate
  );

  const handleAudioComplete = (url: string, durationSeconds: number) => {
    setRecordedAudio({ url, duration: durationSeconds });
  };

  const handleSubmitSpeakingPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordedAudio && !promptText.trim()) return;

    const newSub: SpeakingPracticeSubmission = {
      id: `spk_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      promptTitle,
      promptDescription: promptCategory,
      level: studentProfile.estimatedLevel,
      audioUrl: recordedAudio?.url,
      audioDurationSeconds: recordedAudio?.duration,
      writtenResponse: promptText.trim(),
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };

    AcademyStore.addSpeakingSubmission(newSub);
    setSubmissions(AcademyStore.getSpeakingSubmissions());

    sendFormspreePayload({
      _subject: `🎙️ Speaking Practice Submission: ${currentUser.fullName} - "${promptTitle}"`,
      category: 'Student Speaking Practice Submission',
      studentName: currentUser.fullName,
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone || 'N/A',
      promptTitle,
      categoryName: promptCategory,
      writtenTranscript: promptText.trim() || 'Audio response provided',
      audioDurationSeconds: recordedAudio?.duration || 0,
      message: `${currentUser.fullName} submitted a spoken English audio recording for prompt: "${promptTitle}" (${promptCategory}).`,
    });

    setRecordedAudio(null);
    setPromptText('');
    setShowRecorderModal(false);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  const handleStudentSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !assignmentResponseText.trim()) return;

    setIsSubmittingAssignment(true);
    const allAssignments = AcademyStore.getAssignments();
    const idx = allAssignments.findIndex((a) => a.id === submittingAssignment.id);
    if (idx >= 0) {
      allAssignments[idx] = {
        ...allAssignments[idx],
        status: 'submitted',
        submission: {
          submittedAt: new Date().toISOString(),
          textResponse: assignmentResponseText.trim(),
        },
      };
      localStorage.setItem('fluentia_assignments', JSON.stringify(allAssignments));
      setAssignments(allAssignments.filter((a) => a.studentId === currentUser.id));
    }

    AcademyStore.addAuditLog({
      action: 'ASSIGNMENT_SUBMITTED',
      performedBy: currentUser.fullName,
      userRole: 'student',
      targetEntity: `Task: ${submittingAssignment.title}`,
      details: `Student submitted assignment response to faculty mentor.`,
    });

    sendFormspreePayload({
      _subject: `📝 Assignment Submitted: ${currentUser.fullName} - "${submittingAssignment.title}"`,
      category: 'Course Assignment Submission',
      studentName: currentUser.fullName,
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone || 'N/A',
      taskTitle: submittingAssignment.title,
      courseName: submittingAssignment.courseName,
      submittedResponse: assignmentResponseText.trim(),
      message: `${currentUser.fullName} submitted task "${submittingAssignment.title}" for ${submittingAssignment.courseName}.`,
    });

    setIsSubmittingAssignment(false);
    setAssignmentSuccessToast(`Task submitted to your mentor for review!`);
    setSubmittingAssignment(null);
    setAssignmentResponseText('');
    setTimeout(() => setAssignmentSuccessToast(null), 4000);
  };

  const handleAddVocabulary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVocabTerm.trim() || !newVocabDef.trim()) return;

    const newItem: VocabularyItem = {
      id: `voc_${Date.now()}`,
      studentId: currentUser.id,
      term: newVocabTerm.trim(),
      partOfSpeech: newVocabPos,
      definition: newVocabDef.trim(),
      exampleSentence: newVocabEx.trim(),
      category: newVocabCategory,
      mastered: false,
      addedAt: new Date().toISOString().slice(0, 10),
    };

    AcademyStore.addVocabularyItem(newItem);
    setVocabulary(AcademyStore.getVocabulary());
    setNewVocabTerm('');
    setNewVocabDef('');
    setNewVocabEx('');
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const newFile: UserFile = {
      id: `file_${Date.now()}`,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      ownerRole: 'student',
      name: uploadFileName.trim().endsWith(`.${uploadFileType}`)
        ? uploadFileName.trim()
        : `${uploadFileName.trim()}.${uploadFileType}`,
      fileType: uploadFileType,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      url: '#',
      category: uploadFileType === 'audio' ? 'Audio Recording' : 'Document',
      uploadedAt: new Date().toISOString().slice(0, 10),
      isPrivate: true,
    };

    AcademyStore.addFile(newFile);
    setFiles(AcademyStore.getFiles());
    setUploadFileName('');
  };

  const filteredVocab = vocabulary.filter(
    (v) =>
      v.term.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.definition.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(vocabSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160'}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0D382B]/15 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.fullName}</h1>
              <span className="bg-[#0D382B] text-[#D1E3D7] text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                CEFR {studentProfile.estimatedLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: Professional Spoken Fluency · Ain Shams University
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('speaking')}
            className="px-3.5 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Speaking Practice</span>
          </button>
          <button
            onClick={() => setActiveSubTab('messages')}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Teacher</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 space-y-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'speaking', label: 'Speaking Practice', icon: Mic },
            { id: 'teachers', label: 'My Teachers', icon: Users },
            { id: 'files', label: 'My Files', icon: FolderLock },
            { id: 'progress', label: 'My Progress', icon: LineChart },
            { id: 'vocabulary', label: 'Vocabulary Notebook', icon: Bookmark },
            { id: 'plan', label: 'Weekly Plan', icon: CalendarCheck },
            { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-[#0D382B] text-[#D1E3D7] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {enrolledCourses.length === 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-[#FAF8F5] to-emerald-500/10 rounded-2xl border border-[#D1E3D7] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#EBF2EE] text-[#0D382B] rounded-full text-[11px] font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#3D6E57]" />
                        <span>Account Registered · 0 Active Courses</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        Welcome to Fluentia English Academy, {currentUser.fullName}!
                      </h3>
                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                        Your account is currently set to zero statistics because you have not been assigned to a course cohort yet. If you have registered or paid offline (via WhatsApp, Vodafone Cash, or InstaPay), the Academy Director will verify your payment and activate your curriculum access, 8 recorded sessions, assignments, and mentor chat shortly.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <a
                        href="https://wa.me/201205793420?text=Hello%20Fluentia%20Academy%20Director,%20I%20registered%20as%20a%20new%20student%20and%20would%20like%20to%20activate%20my%20course."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Confirm via WhatsApp (+20 1 20 57 9 3 4 20)</span>
                      </a>
                      <button
                        onClick={onNavigateToCourses}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
                      >
                        Browse Courses Catalog
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Summary Cards (Session Attendance Focus) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Sessions Attended</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {studentProfile.attendedSessions || 0}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Verified by Faculty</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Program Sessions</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {studentProfile.totalSessions || 0}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Curriculum Scope</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Attendance Rate</span>
                  <p className="text-xl font-bold text-[#0D382B] font-mono tabular-nums mt-1">
                    {studentProfile.totalSessions && studentProfile.totalSessions > 0
                      ? Math.round(((studentProfile.attendedSessions || 0) / studentProfile.totalSessions) * 100)
                      : 0}%
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Session Completion</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Remaining Sessions</span>
                  <p className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {Math.max(0, (studentProfile.totalSessions || 0) - (studentProfile.attendedSessions || 0))}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">To Course Completion</span>
                </div>
              </div>

              {/* Learning Goals */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Your Active Learning Goals</h3>
                <ul className="space-y-2">
                  {studentProfile.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speaking Club Sessions & Confirmed Seat Status */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#0D382B]" />
                    <h3 className="text-sm font-bold text-slate-900">Speaking Club Circle (Immersion Roundtables)</h3>
                  </div>
                  {onNavigateToSpeakingClub && (
                    <button
                      type="button"
                      onClick={onNavigateToSpeakingClub}
                      className="text-xs text-[#0D382B] hover:text-[#184D3C] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <span>Explore Speaking Club</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {confirmedClubs.length > 0 || pendingClubs.length > 0 ? (
                  <div className="space-y-3">
                    {/* Confirmed Sessions */}
                    {confirmedClubs.map((club) => (
                      <div
                        key={club.id}
                        className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-[#0D382B] text-[#D1E3D7] px-2 py-0.5 rounded">
                              {club.levelRange}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{club.title}</span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Seat Confirmed ✓ (Verified by Academy Director)</span>
                            </span>
                          </div>
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">Topic:</span> {club.topic}
                          </p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {club.date} · {club.time} ({club.durationMinutes} min) · Mentor: {club.hostTeacherName}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <a
                            href={club.meetingUrl || `https://meet.fluentia.edu.eg/speaking-circle-${club.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] font-semibold rounded-lg flex items-center gap-1.5 shadow-sm text-xs cursor-pointer transition-colors"
                          >
                            <span>Enter Virtual Round Table</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}

                    {/* Pending Sessions */}
                    {pendingClubs.map((club) => (
                      <div
                        key={club.id}
                        className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              {club.levelRange}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{club.title}</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Seat Requested ⏳ (Awaiting Director Confirmation)</span>
                            </span>
                          </div>
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">Topic:</span> {club.topic}
                          </p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {club.date} · {club.time} · Mentor: {club.hostTeacherName}
                          </p>
                        </div>

                        <div className="text-xs text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-200 italic shrink-0">
                          Dispatched to Academy Director Basmala Ahmed
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">No active Speaking Club seat bookings</p>
                      <p className="text-slate-500 mt-0.5">
                        Practice real-time spoken English without Arabic in our mentor-guided weekend roundtables.
                      </p>
                    </div>
                    {onNavigateToSpeakingClub && (
                      <button
                        type="button"
                        onClick={onNavigateToSpeakingClub}
                        className="px-3.5 py-1.5 bg-[#0D382B] text-white hover:bg-[#184D3C] font-semibold rounded-lg shrink-0 cursor-pointer text-xs"
                      >
                        Book a Speaking Seat
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Upcoming Lessons & Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Live Lessons</h3>
                    <span className="text-xs text-slate-400 font-mono">{lessons.length} Booked</span>
                  </div>
                  <div className="space-y-2.5">
                    {lessons.map((les) => (
                      <div key={les.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{les.courseName}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                            {les.status}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">
                          Teacher: <span className="font-medium text-slate-800">{les.teacherName}</span>
                        </p>
                        <p className="text-slate-400 mt-0.5 font-mono">
                          {les.date} · {les.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Pending Assignments</h3>
                    <span className="text-xs text-slate-400 font-mono">{assignments.length} Total</span>
                  </div>
                  <div className="space-y-2.5">
                    {assignments.map((asg) => (
                      <div key={asg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span className="truncate pr-2">{asg.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              asg.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {asg.status}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1 truncate">{asg.courseName}</p>
                        <p className="text-slate-400 mt-0.5 font-mono">Due: {asg.dueDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY COURSES */}
          {activeSubTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enrolled Academic Programs</h3>
                  <p className="text-xs text-slate-500">Access worksheets, schedules, and lesson recordings.</p>
                </div>
                <button
                  onClick={onNavigateToCourses}
                  className="px-3.5 py-1.5 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
                >
                  Explore More Courses
                </button>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">You are not enrolled in any courses yet.</p>
                  <button
                    onClick={onNavigateToCourses}
                    className="mt-4 px-4 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg"
                  >
                    Browse Courses Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((c) => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                        <span className="font-bold text-[#0D382B] bg-slate-100 px-2 py-0.5 rounded">
                          {c.level}
                        </span>
                        <span>{c.code}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{c.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4">{c.description}</p>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                        <div className="bg-[#0D382B] h-full" style={{ width: '45%' }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-4">
                        <span>Course Progress</span>
                        <span className="font-mono font-bold">45%</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        <span className="font-semibold text-slate-800 text-[11px] uppercase block">
                          Current Milestone:
                        </span>
                        <p className="text-slate-600">Unit 1: Sound Articulation & Spoken Foundations</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedCourseForCurriculum(c)}
                          className="px-3 py-2 bg-[#0D382B] text-[#D1E3D7] hover:bg-[#184D3C] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5 text-[#D1E3D7]" />
                          <span>Open Sessions and Materials</span>
                        </button>
                        <button
                          onClick={() => setActiveSubTab('messages')}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Teacher</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPEAKING PRACTICE (Web Audio Recording & Teacher Audio Feedback) */}
          {activeSubTab === 'speaking' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Spoken English Laboratory</h3>
                    <p className="text-xs text-slate-500">
                      Record audio answers to weekly teacher prompts and receive personalized audio phonology feedback.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecorderModal(!showRecorderModal)}
                    className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{showRecorderModal ? 'Hide Recorder' : 'New Recording Task'}</span>
                  </button>
                </div>

                {submissionSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Speaking submission dispatched to Dr. Amina for evaluation!</span>
                  </div>
                )}

                {/* Recording Submission Form */}
                {showRecorderModal && (
                  <form onSubmit={handleSubmitSpeakingPrompt} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Prompt Topic</label>
                        <input
                          type="text"
                          required
                          value={promptTitle}
                          onChange={(e) => setPromptTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Competency Category</label>
                        <select
                          value={promptCategory}
                          onChange={(e) => setPromptCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Business Strategy & Decision Making">Business Strategy & Decision Making</option>
                          <option value="Elevator Pitch & Self Introduction">Elevator Pitch & Self Introduction</option>
                          <option value="STAR Job Interview Scenario">STAR Job Interview Scenario</option>
                          <option value="Debate Argumentation">Debate Argumentation</option>
                        </select>
                      </div>
                    </div>

                    {/* Microphone Recorder Component */}
                    <AudioRecorder onRecordingComplete={handleAudioComplete} label="Record Spoken Answer" />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Optional Spoken Transcript or Key Talking Points
                      </label>
                      <textarea
                        rows={2}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Write your outline or key phrases here..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>Submit Recording for Teacher Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              {/* Past Submissions & Teacher Feedback List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Your Speaking Practice Submissions</h4>

                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">{sub.promptDescription}</span>
                        <h4 className="text-base font-bold text-slate-900">{sub.promptTitle}</h4>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded font-mono font-semibold self-start sm:self-auto ${
                          sub.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {sub.status === 'reviewed' ? 'Reviewed by Faculty' : 'Pending Teacher Feedback'}
                      </span>
                    </div>

                    {sub.writtenResponse && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl italic leading-relaxed">
                        "{sub.writtenResponse}"
                      </p>
                    )}

                    {/* Teacher Feedback Box if reviewed */}
                    {sub.feedback && (
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0D382B] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#3D6E57]" />
                            Teacher Assessment by {sub.feedback.teacherName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(sub.feedback.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed">
                          {sub.feedback.writtenComments}
                        </p>

                        {/* Scores Strip */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-center">
                          <div className="bg-white/80 p-1.5 rounded">
                            <span className="text-[10px] text-slate-500 block">Grammar</span>
                            <span className="font-bold text-xs font-mono">{sub.feedback.grammarScore}%</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded">
                            <span className="text-[10px] text-slate-500 block">Pronunciation</span>
                            <span className="font-bold text-xs font-mono">{sub.feedback.pronunciationScore}%</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded">
                            <span className="text-[10px] text-slate-500 block">Fluency</span>
                            <span className="font-bold text-xs font-mono">{sub.feedback.fluencyScore}%</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded">
                            <span className="text-[10px] text-slate-500 block">Confidence</span>
                            <span className="font-bold text-xs font-mono">{sub.feedback.confidenceScore}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MY TEACHERS */}
          {activeSubTab === 'teachers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Academy Mentors & Faculty</h3>
                  <p className="text-xs text-slate-500">
                    Direct access to your certified academic mentors for phonology coaching and private guidance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => {
                  const isAssigned = studentProfile.assignedTeacherId === teacher.userId;
                  return (
                    <div
                      key={teacher.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        isAssigned
                          ? 'bg-[#FAF8F5] border-[#0D382B] shadow-md ring-1 ring-[#0D382B]/20'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={teacher.avatarUrl}
                          alt={teacher.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-slate-900">{teacher.name}</h4>
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ★ {teacher.rating}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#0D382B] mt-0.5">{teacher.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isAssigned && (
                              <span className="text-[10px] bg-[#0D382B] text-white font-semibold px-2 py-0.5 rounded">
                                Assigned Mentor
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-mono">
                              {teacher.experienceYears} Years Exp
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {teacher.bio}
                      </p>

                      <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.specializations.map((spec, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">Languages:</span> {teacher.languages.join(', ')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('messages')}
                          className="w-full py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with {teacher.name.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: MY PROGRESS (SESSIONS ATTENDANCE ONLY) */}
          {activeSubTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">Session Attendance & Curriculum Progress</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      Verified Attendance
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Official record of live interactive sessions attended with your certified Academy faculty.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Attendance Metric</span>
                  <span className="text-lg font-mono font-bold text-[#0D382B]">
                    {studentProfile.attendedSessions || 0} / {studentProfile.totalSessions || 0} Sessions
                  </span>
                </div>
              </div>

              {/* Hero Progress Banner */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#D1E3D7] p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-[#0D382B] uppercase tracking-wide font-mono block">
                      Overall Completion
                    </span>
                    <h4 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                      {studentProfile.attendedSessions || 0} of {studentProfile.totalSessions || 0} Sessions Completed
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-mono font-bold text-[#0D382B]">
                      {studentProfile.totalSessions && studentProfile.totalSessions > 0
                        ? Math.round(((studentProfile.attendedSessions || 0) / studentProfile.totalSessions) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/70 h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#0D382B] via-[#1F5441] to-[#3D6E57] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{
                      width: `${
                        studentProfile.totalSessions && studentProfile.totalSessions > 0
                          ? Math.min(100, Math.round(((studentProfile.attendedSessions || 0) / studentProfile.totalSessions) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-2 pt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {(studentProfile.totalSessions || 0) === 0
                      ? 'No cohort sessions assigned yet. Awaiting Academy Director enrollment.'
                      : (studentProfile.attendedSessions || 0) === 0
                      ? '0 sessions attended so far. Ready to begin your first session!'
                      : (studentProfile.attendedSessions || 0) >= (studentProfile.totalSessions || 0)
                      ? 'Congratulations! You have completed all sessions of your program.'
                      : `${(studentProfile.totalSessions || 0) - (studentProfile.attendedSessions || 0)} sessions remaining to complete your curriculum.`}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Cohort Pace: {studentProfile.attendedSessions || 0} Attended · {Math.max(0, (studentProfile.totalSessions || 0) - (studentProfile.attendedSessions || 0))} Remaining
                  </span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Attended Sessions</span>
                  <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {studentProfile.attendedSessions || 0}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold">Live Interactive</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Curriculum</span>
                  <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {studentProfile.totalSessions || 0}
                  </p>
                  <span className="text-[11px] text-slate-500">Total Program Scope</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Remaining Sessions</span>
                  <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {Math.max(0, (studentProfile.totalSessions || 0) - (studentProfile.attendedSessions || 0))}
                  </p>
                  <span className="text-[11px] text-slate-500">To Certificate</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Attendance Rate</span>
                  <p className="text-2xl font-bold text-[#0D382B] font-mono tabular-nums mt-1">
                    {studentProfile.totalSessions && studentProfile.totalSessions > 0
                      ? Math.round(((studentProfile.attendedSessions || 0) / studentProfile.totalSessions) * 100)
                      : 0}%
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold">Active Standing</span>
                </div>
              </div>

              {/* Session-by-Session Attendance Registry */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Curriculum Sessions Attendance Roster</h4>
                    <p className="text-xs text-slate-500">
                      Breakdown of each session in your enrolled program with verified attendance logs.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {studentProfile.totalSessions || 8} Total Sessions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Array.from({ length: Math.max(studentProfile.totalSessions || 0, 8) }).map((_, index) => {
                    const sessionNum = index + 1;
                    const isAttended = sessionNum <= (studentProfile.attendedSessions || 0);
                    return (
                      <div
                        key={sessionNum}
                        className={`p-4 rounded-xl border transition-all ${
                          isAttended
                            ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                            Session {sessionNum}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isAttended
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isAttended ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Attended</span>
                              </>
                            ) : (
                              <span>Upcoming</span>
                            )}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          {isAttended
                            ? `Session ${sessionNum} Completed`
                            : `Session ${sessionNum} Pending`}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {isAttended
                            ? 'Verified by Faculty Mentor'
                            : 'Scheduled in Curriculum'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Academic Notes & Attendance Guidance */}
              <div className="p-5 bg-gradient-to-r from-[#FAF8F5] to-emerald-50/50 rounded-2xl border border-[#D1E3D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Questions about your attendance record?</h4>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    Session attendance is verified directly by Academy Director Basmala Ahmed and your assigned teacher after each live session. If you missed a session and need the recorded session or want to reschedule, contact us directly.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://wa.me/201205793420?text=Hello%20Academy%20Director%20Basmala,%20I%20have%20an%20inquiry%20regarding%20my%20session%20attendance."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Contact Academy Director</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('messages')}
                    className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
                  >
                    Message Teacher
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOCABULARY NOTEBOOK & FLASHCARD REVISION */}
          {activeSubTab === 'vocabulary' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Vocabulary Notebook</h3>
                  <p className="text-xs text-slate-500">Save idiomatic phrases, collocations, and technical terms.</p>
                </div>
                <button
                  onClick={() => {
                    setIsRevisionMode(!isRevisionMode);
                    setShowFlashcardAnswer(false);
                    setRevisionIndex(0);
                  }}
                  className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg shadow-sm"
                >
                  {isRevisionMode ? 'Exit Revision Mode' : 'Start Flashcard Revision'}
                </button>
              </div>

              {isRevisionMode ? (
                /* Interactive Flashcard Deck */
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-6">
                    <span>Active Flashcard Review</span>
                    <span>
                      {revisionIndex + 1} of {vocabulary.length}
                    </span>
                  </div>

                  {vocabulary.length > 0 ? (
                    <div className="space-y-4">
                      <span className="text-xs uppercase font-mono font-bold text-[#3D6E57]">
                        {vocabulary[revisionIndex]?.category} · {vocabulary[revisionIndex]?.partOfSpeech}
                      </span>
                      <h3 className="text-3xl font-serif font-bold text-slate-900">
                        {vocabulary[revisionIndex]?.term}
                      </h3>
                      {vocabulary[revisionIndex]?.phonetic && (
                        <p className="text-xs text-slate-400 font-mono">{vocabulary[revisionIndex]?.phonetic}</p>
                      )}

                      {showFlashcardAnswer ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 mt-4 animate-fadeIn">
                          <p className="text-xs font-bold text-slate-800">
                            Definition: <span className="font-normal text-slate-600">{vocabulary[revisionIndex]?.definition}</span>
                          </p>
                          <p className="text-xs italic text-slate-600">
                            "{vocabulary[revisionIndex]?.exampleSentence}"
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowFlashcardAnswer(true)}
                          className="mt-6 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                        >
                          Reveal Definition & Example
                        </button>
                      )}

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          disabled={revisionIndex === 0}
                          onClick={() => {
                            setRevisionIndex((p) => Math.max(0, p - 1));
                            setShowFlashcardAnswer(false);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        >
                          Previous Word
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            AcademyStore.toggleVocabularyMastered(vocabulary[revisionIndex]?.id);
                            setVocabulary(AcademyStore.getVocabulary());
                          }}
                          className="text-xs text-emerald-700 font-semibold"
                        >
                          {vocabulary[revisionIndex]?.mastered ? 'Mark Unmastered' : 'Mark as Mastered ✓'}
                        </button>
                        <button
                          type="button"
                          disabled={revisionIndex >= vocabulary.length - 1}
                          onClick={() => {
                            setRevisionIndex((p) => Math.min(vocabulary.length - 1, p + 1));
                            setShowFlashcardAnswer(false);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        >
                          Next Word
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No words saved yet.</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Add word form */}
                  <form onSubmit={handleAddVocabulary} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Add New Word or Collocation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Term / Phrase</label>
                        <input
                          type="text"
                          required
                          value={newVocabTerm}
                          onChange={(e) => setNewVocabTerm(e.target.value)}
                          placeholder="e.g. Counter-intuitive"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Part of Speech</label>
                        <select
                          value={newVocabPos}
                          onChange={(e) => setNewVocabPos(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        >
                          <option value="noun">Noun</option>
                          <option value="verb">Verb</option>
                          <option value="adjective">Adjective</option>
                          <option value="idiom">Idiom</option>
                          <option value="phrasal verb">Phrasal Verb</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={newVocabCategory}
                          onChange={(e) => setNewVocabCategory(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        >
                          <option value="Business">Business</option>
                          <option value="Everyday Fluency">Everyday Fluency</option>
                          <option value="Academic">Academic</option>
                          <option value="Idioms">Idioms</option>
                          <option value="Phrasal Verbs">Phrasal Verbs</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Clear Definition</label>
                        <input
                          type="text"
                          required
                          value={newVocabDef}
                          onChange={(e) => setNewVocabDef(e.target.value)}
                          placeholder="e.g. Contrary to what common-sense expectation would suggest."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Example Sentence</label>
                        <input
                          type="text"
                          value={newVocabEx}
                          onChange={(e) => setNewVocabEx(e.target.value)}
                          placeholder="e.g. This architectural design is counter-intuitive but efficient."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg"
                    >
                      Save Word to Notebook
                    </button>
                  </form>

                  {/* Words List */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        Saved Lexicon ({filteredVocab.length})
                      </h4>
                      <div className="relative w-48">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search words..."
                          value={vocabSearch}
                          onChange={(e) => setVocabSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredVocab.map((item) => (
                        <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900">{item.term}</h5>
                              <span className="text-[10px] text-slate-400 font-mono italic">
                                ({item.partOfSpeech})
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              {item.mastered && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                  Mastered
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 mt-1">{item.definition}</p>
                            {item.exampleSentence && (
                              <p className="text-xs italic text-slate-500 mt-0.5">
                                "{item.exampleSentence}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                AcademyStore.toggleVocabularyMastered(item.id);
                                setVocabulary(AcademyStore.getVocabulary());
                              }}
                              className={`p-1.5 rounded text-xs ${
                                item.mastered
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                              title="Toggle Mastered"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                AcademyStore.deleteVocabularyItem(item.id);
                                setVocabulary(AcademyStore.getVocabulary());
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: MY FILES */}
          {activeSubTab === 'files' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Study Files & Audio Vault</h3>
                    <p className="text-xs text-slate-500">
                      Private storage for your lesson worksheets, speaking takes, and written assignments.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadFile} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="File title / assignment name..."
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="audio">Audio Clip (.mp3)</option>
                    <option value="doc">Word Worksheet (.docx)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </form>
              </div>

              {/* Files Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Authorized Files ({myFiles.length})
                  </h4>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {myFiles
                    .filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()))
                    .map((file) => (
                      <div key={file.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0D382B] flex items-center justify-center font-mono text-xs font-bold">
                            {file.fileType.toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{file.name}</h5>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {file.category} · {file.size} · Uploaded {file.uploadedAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              AcademyStore.deleteFile(file.id, currentUser);
                              setFiles(AcademyStore.getFiles());
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DIRECT MESSAGES */}
          {activeSubTab === 'messages' && (
            <div>
              <ChatSystem currentUser={currentUser} />
            </div>
          )}

          {/* TAB 7: WEEKLY LEARNING PLAN */}
          {activeSubTab === 'plan' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assigned Weekly Roadmap</h3>
                <p className="text-xs text-slate-500">Curated weekly targets set by Dr. Amina El-Sayed.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D382B]">Monday · Phonology Focus</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Practice minimal pairs /p/ vs /b/ and record the 90-second elevator pitch take 2.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D382B]">Wednesday · Live Speaking Circle</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-mono">
                      Upcoming at 7:30 PM CLT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Attend "Overcoming the Imposter Barrier in Multinational Workplaces" circle.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D382B]">Saturday · Vocabulary Consolidation</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Review Flashcard Deck: 5 business idioms and submit the written email rewrite task.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Account Preferences</h3>
                <p className="text-xs text-slate-500">Manage profile data and notification preferences.</p>
              </div>

              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={onNavigateToPlacementTest}
                    className="px-4 py-2 border border-[#0D382B] text-[#0D382B] rounded-lg font-semibold hover:bg-[#0D382B]/5"
                  >
                    Retake CEFR Diagnostic Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
