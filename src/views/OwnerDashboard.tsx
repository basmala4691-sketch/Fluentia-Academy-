import React, { useState } from 'react';
import {
  User,
  TeacherApplication,
  Course,
  SpeakingClubSession,
  AuditLogEntry,
  Conversation,
  TeacherProfile,
  AcademyVoice,
  StudentProfile,
  Assignment,
  AcademyStats,
} from '../types';
import { AcademyStore } from '../services/storage';
import { ChatSystem } from '../components/ChatSystem';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Mic,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Plus,
  Search,
  FileText,
  Clock,
  AlertTriangle,
  Edit3,
  Trash2,
  Star,
  Award,
  Upload,
  Image,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Settings,
  Eye,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: User;
  onRefreshData: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ currentUser, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<
    | 'analytics'
    | 'teachers'
    | 'courses'
    | 'voices'
    | 'users'
    | 'clubs'
    | 'settings'
    | 'communications'
    | 'audit'
  >('analytics');

  const [users, setUsers] = useState<User[]>(() => AcademyStore.getUsers());
  const [applications, setApplications] = useState<TeacherApplication[]>(() =>
    AcademyStore.getTeacherApplications()
  );
  const [courses, setCourses] = useState<Course[]>(() => AcademyStore.getCourses());
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => AcademyStore.getTeachers());
  const [voices, setVoices] = useState<AcademyVoice[]>(() => AcademyStore.getAcademyVoices());
  const [clubs, setClubs] = useState<SpeakingClubSession[]>(() => AcademyStore.getSpeakingClubs());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => AcademyStore.getAuditLogs());
  const [conversations] = useState<Conversation[]>(() => AcademyStore.getConversations());
  const [academySettings, setAcademySettings] = useState(() => AcademyStore.getAcademySettings());

  // Communications Oversight Justification Modal State
  const [showAuditReasonModal, setShowAuditReasonModal] = useState(false);
  const [selectedAuditConvId, setSelectedAuditConvId] = useState<string | null>(null);
  const [auditJustificationReason, setAuditJustificationReason] = useState(
    'Dispute resolution and educational quality safeguarding inquiry'
  );
  const [isAuditAccessGranted, setIsAuditAccessGranted] = useState(false);

  // Course Editing / Creating State
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Teacher Card Editing / Creating State
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherProfile | null>(null);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

  // Academy Voice / Testimonial Editing / Creating State
  const [voiceToEdit, setVoiceToEdit] = useState<AcademyVoice | null>(null);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);

  // Audit filter state
  const [auditFilter, setAuditFilter] = useState('');

  // User list filter state
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Account Inspection Dossier State (When clicking a student or teacher)
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [studentDossierProfile, setStudentDossierProfile] = useState<StudentProfile | null>(null);
  const [studentScoreForm, setStudentScoreForm] = useState({
    fluencyScore: 0,
    grammarScore: 0,
    pronunciationScore: 0,
    vocabularyScore: 0,
    confidenceScore: 0,
    learningNotes: '',
  });
  const [newStudentGoalInput, setNewStudentGoalInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Academy Settings Form State
  const [settingsForm, setSettingsForm] = useState(() => AcademyStore.getAcademySettings());
  const [newProgramInput, setNewProgramInput] = useState('');

  // Academy Statistics State (Zero baseline initially, editable & updatable by Owner)
  const [academyStats, setAcademyStats] = useState<AcademyStats>(() => AcademyStore.getAcademyStats());
  const [showEditStatsModal, setShowEditStatsModal] = useState(false);
  const [statsForm, setStatsForm] = useState<AcademyStats>(() => AcademyStore.getAcademyStats());

  // Student Session Attendance editing state
  const [studentSessionsForm, setStudentSessionsForm] = useState({
    attendedSessions: 0,
    totalSessions: 0,
  });

  const pendingTeacherApps = applications.filter((a) => a.status === 'pending').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAll = () => {
    setCourses(AcademyStore.getCourses());
    setTeachers(AcademyStore.getTeachers());
    setVoices(AcademyStore.getAcademyVoices());
    setClubs(AcademyStore.getSpeakingClubs());
    setApplications(AcademyStore.getTeacherApplications());
    setUsers(AcademyStore.getUsers());
    setAuditLogs(AcademyStore.getAuditLogs());
    setAcademySettings(AcademyStore.getAcademySettings());
    setAcademyStats(AcademyStore.getAcademyStats());
    onRefreshData();
  };

  const handleTeacherApproval = (appId: string, decision: 'approved' | 'rejected') => {
    AcademyStore.reviewTeacherApplication(appId, decision, 'Owner direct review');
    refreshAll();
    showToast(`Teacher application marked as ${decision}.`);
  };

  const handleToggleCourseStatus = (course: Course) => {
    const updatedStatus = course.status === 'published' ? 'draft' : 'published';
    AcademyStore.saveCourse({ ...course, status: updatedStatus });
    refreshAll();
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToEdit) return;
    AcademyStore.saveCourse(courseToEdit);
    setCourseToEdit(null);
    setIsCreatingCourse(false);
    refreshAll();
    showToast('Course saved to academy catalog.');
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Permanently remove this course from the academy catalog?')) {
      AcademyStore.deleteCourse(courseId);
      setCourseToEdit(null);
      refreshAll();
      showToast('Course removed.');
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherToEdit) return;
    AcademyStore.saveTeacher(teacherToEdit);
    setTeacherToEdit(null);
    setIsCreatingTeacher(false);
    refreshAll();
    showToast('Teacher card updated.');
  };

  const handleDeleteTeacher = (teacherId: string) => {
    if (confirm('Permanently delete this teacher card and remove from faculty directory?')) {
      AcademyStore.deleteTeacher(teacherId);
      setTeacherToEdit(null);
      refreshAll();
      showToast('Teacher card deleted.');
    }
  };

  const handleTeacherPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && teacherToEdit) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTeacherToEdit({
            ...teacherToEdit,
            avatarUrl: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceToEdit) return;
    AcademyStore.saveAcademyVoice(voiceToEdit);
    setVoiceToEdit(null);
    setIsCreatingVoice(false);
    refreshAll();
    showToast('Student testimonial saved.');
  };

  const handleDeleteVoice = (voiceId: string) => {
    if (confirm('Delete this student review/testimonial?')) {
      AcademyStore.deleteAcademyVoice(voiceId);
      setVoiceToEdit(null);
      refreshAll();
      showToast('Testimonial removed.');
    }
  };

  const handleOpenAuditedChat = (conversationId: string) => {
    setSelectedAuditConvId(conversationId);
    setShowAuditReasonModal(true);
  };

  const handleConfirmAuditAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuditConvId || !auditJustificationReason.trim()) return;

    AcademyStore.addAuditLog({
      action: 'COMMUNICATIONS_AUDIT_ACCESS',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Conversation ID: ${selectedAuditConvId}`,
      details: `Safeguarding inspection initiated for thread. Reason: ${auditJustificationReason}`,
      reason: auditJustificationReason,
    });

    setAuditLogs(AcademyStore.getAuditLogs());
    setIsAuditAccessGranted(true);
    setShowAuditReasonModal(false);
  };

  // Academy Stats Handlers (Editable & Updatable by Owner)
  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = AcademyStore.saveAcademyStats({
      activeStudents: Math.max(0, Number(statsForm.activeStudents) || 0),
      approvedFaculty: Math.max(0, Number(statsForm.approvedFaculty) || 0),
      courseEnrollments: Math.max(0, Number(statsForm.courseEnrollments) || 0),
      studentTestimonials: Math.max(0, Number(statsForm.studentTestimonials) || 0),
      totalTuitionEgp: Math.max(0, Number(statsForm.totalTuitionEgp) || 0),
      totalTuitionUsd: Math.max(0, Number(statsForm.totalTuitionUsd) || Math.round((Number(statsForm.totalTuitionEgp) || 0) / 30.5)),
    });
    setAcademyStats(updated);
    setShowEditStatsModal(false);
    refreshAll();
    showToast('Academy statistics updated successfully.');
  };

  const handleResetStats = () => {
    const reset = AcademyStore.resetAcademyStats();
    setAcademyStats(reset);
    setStatsForm(reset);
    setShowEditStatsModal(false);
    refreshAll();
    showToast('All academy statistics reset to 0.');
  };

  // Inspecting Account Dossier Logic
  const handleOpenAccountDossier = (user: User) => {
    setInspectingUser(user);
    if (user.role === 'student') {
      const profile = AcademyStore.getStudentProfile(user.id);
      setStudentDossierProfile(profile);
      setStudentSessionsForm({
        attendedSessions: profile.attendedSessions || 0,
        totalSessions: profile.totalSessions || 0,
      });
      setStudentScoreForm({
        fluencyScore: profile.fluencyScore || 0,
        grammarScore: profile.grammarScore || 0,
        pronunciationScore: profile.pronunciationScore || 0,
        vocabularyScore: profile.vocabularyScore || 0,
        confidenceScore: profile.confidenceScore || 0,
        learningNotes: profile.learningNotes || '',
      });
    }
  };

  const handleSaveStudentSessions = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inspectingUser) return;
    const attended = Math.max(0, Number(studentSessionsForm.attendedSessions) || 0);
    const total = Math.max(0, Number(studentSessionsForm.totalSessions) || 0);

    const updated = AcademyStore.updateStudentProfile(
      {
        attendedSessions: attended,
        totalSessions: total,
      },
      inspectingUser.id
    );

    setStudentDossierProfile(updated);
    AcademyStore.addAuditLog({
      action: 'STUDENT_SESSIONS_UPDATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Student Profile: ${inspectingUser.fullName}`,
      details: `Updated session attendance: ${attended} attended of ${total} total sessions.`,
    });
    refreshAll();
    showToast(`Session attendance updated: ${attended} / ${total} sessions.`);
  };

  const handleToggleCourseAccess = (courseId: string) => {
    if (!inspectingUser) return;
    const profile = AcademyStore.getStudentProfile(inspectingUser.id);
    const hasCourse = profile.enrolledCourseIds.includes(courseId);

    if (hasCourse) {
      const updated = AcademyStore.unenrollStudentFromCourse(inspectingUser.id, courseId);
      setStudentDossierProfile(updated);
      showToast('Course access revoked.');
    } else {
      const updated = AcademyStore.enrollStudentInCourse(
        inspectingUser.id,
        courseId,
        'Offline WhatsApp Payment Verified by Owner Basmala Ahmed'
      );
      setStudentDossierProfile(updated);
      showToast('Course access granted (Offline / WhatsApp payment registered).');
    }
    refreshAll();
  };

  const handleToggleSpeakingClubAccess = (clubId: string) => {
    if (!inspectingUser) return;
    const profile = AcademyStore.getStudentProfile(inspectingUser.id);
    const club = clubs.find((c) => c.id === clubId);
    const isConfirmed =
      (profile.confirmedClubSessionIds || []).includes(clubId) ||
      (club?.confirmedStudentIds || []).includes(inspectingUser.id);

    if (isConfirmed) {
      AcademyStore.revokeSpeakingClubSeat(clubId, inspectingUser.id);
      showToast(`Speaking Club seat revoked for ${inspectingUser.fullName}.`);
    } else {
      AcademyStore.confirmSpeakingClubSeat(clubId, inspectingUser.id);
      showToast(`Speaking Club seat CONFIRMED for ${inspectingUser.fullName}!`);
    }
    const updatedProfile = AcademyStore.getStudentProfile(inspectingUser.id);
    setStudentDossierProfile(updatedProfile);
    setClubs(AcademyStore.getSpeakingClubs());
    refreshAll();
  };

  const handleConfirmClubSeat = (clubId: string, studentId: string) => {
    AcademyStore.confirmSpeakingClubSeat(clubId, studentId);
    const student = users.find((u) => u.id === studentId);
    showToast(`Speaking Club seat confirmed for ${student?.fullName || 'student'}!`);
    setClubs(AcademyStore.getSpeakingClubs());
    if (inspectingUser && inspectingUser.id === studentId) {
      setStudentDossierProfile(AcademyStore.getStudentProfile(studentId));
    }
    refreshAll();
  };

  const handleRevokeClubSeat = (clubId: string, studentId: string) => {
    AcademyStore.revokeSpeakingClubSeat(clubId, studentId);
    const student = users.find((u) => u.id === studentId);
    showToast(`Speaking Club seat revoked for ${student?.fullName || 'student'}.`);
    setClubs(AcademyStore.getSpeakingClubs());
    if (inspectingUser && inspectingUser.id === studentId) {
      setStudentDossierProfile(AcademyStore.getStudentProfile(studentId));
    }
    refreshAll();
  };

  const handleSaveStudentScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingUser) return;

    const updated = AcademyStore.updateStudentProfile(
      {
        fluencyScore: Number(studentScoreForm.fluencyScore),
        grammarScore: Number(studentScoreForm.grammarScore),
        pronunciationScore: Number(studentScoreForm.pronunciationScore),
        vocabularyScore: Number(studentScoreForm.vocabularyScore),
        confidenceScore: Number(studentScoreForm.confidenceScore),
        learningNotes: studentScoreForm.learningNotes,
      },
      inspectingUser.id
    );

    setStudentDossierProfile(updated);
    refreshAll();
    showToast('Student scores and academic notes updated.');
  };

  const handleAddStudentGoal = () => {
    if (!newStudentGoalInput.trim() || !inspectingUser || !studentDossierProfile) return;
    const updatedGoals = [...studentDossierProfile.goals, newStudentGoalInput.trim()];
    const updated = AcademyStore.updateStudentProfile(
      { goals: updatedGoals },
      inspectingUser.id
    );
    setStudentDossierProfile(updated);
    setNewStudentGoalInput('');
    showToast('Goal added to student profile.');
  };

  const handleDeleteStudentGoal = (index: number) => {
    if (!inspectingUser || !studentDossierProfile) return;
    const updatedGoals = studentDossierProfile.goals.filter((_, i) => i !== index);
    const updated = AcademyStore.updateStudentProfile(
      { goals: updatedGoals },
      inspectingUser.id
    );
    setStudentDossierProfile(updated);
    showToast('Goal removed.');
  };

  // Academy Settings Save Handler
  const handleSaveAcademySettings = (e: React.FormEvent) => {
    e.preventDefault();
    AcademyStore.saveAcademySettings(settingsForm);
    setAcademySettings(settingsForm);
    refreshAll();
    showToast('Academy address, contact info, and program tags updated.');
  };

  const handleAddProgramTag = () => {
    if (!newProgramInput.trim()) return;
    setSettingsForm((prev) => ({
      ...prev,
      academicPrograms: [...prev.academicPrograms, newProgramInput.trim()],
    }));
    setNewProgramInput('');
  };

  const handleDeleteProgramTag = (index: number) => {
    setSettingsForm((prev) => ({
      ...prev,
      academicPrograms: prev.academicPrograms.filter((_, i) => i !== index),
    }));
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchQuery));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0D382B] text-[#D1E3D7] px-4 py-2.5 rounded-xl shadow-xl border border-[#3D6E57] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#0D382B] rounded-2xl text-white p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight">Academy Owner Control Center</h1>
            <span className="bg-[#D1E3D7] text-[#0D382B] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
              SUPERADMIN PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Authenticated as: <span className="text-[#D1E3D7] font-semibold">{currentUser.fullName}</span> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-white/10 rounded-lg font-mono">
            Direct Protected Route: Active
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Immutable</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'analytics', label: 'Overview & Analytics', icon: LayoutDashboard },
          { id: 'users', label: `Account Inspection & Registry (${users.length})`, icon: Users },
          { id: 'courses', label: `Course Catalog (${courses.length})`, icon: BookOpen },
          { id: 'teachers', label: `Faculty & Cards (${teachers.length})`, icon: Award },
          { id: 'voices', label: `Voices & Testimonials (${voices.length})`, icon: Star },
          { id: 'clubs', label: 'Speaking Clubs', icon: Mic },
          { id: 'settings', label: 'Academy & Contact Settings', icon: Settings },
          { id: 'communications', label: 'Communications Oversight', icon: MessageSquare },
          { id: 'audit', label: 'Immutable Audit Log', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#0D382B] text-[#D1E3D7] shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REAL ANALYTICS (ZERO INITIAL BASELINE, EDITABLE BY OWNER) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Banner with Edit Stats Action */}
          <div className="bg-gradient-to-r from-[#FAF8F5] via-emerald-50/40 to-[#FAF8F5] p-5 rounded-2xl border border-[#D1E3D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold bg-[#0D382B] text-[#D1E3D7] px-2 py-0.5 rounded">
                  ACADEMY LAUNCH BASELINE
                </span>
                <span className="text-xs text-slate-500 font-medium">All Statistics Initialized to Zero</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Executive Platform Metrics & Tuition Volume
              </h3>
              <p className="text-xs text-slate-600">
                As Academy Owner, you can calibrate, update, or reset these statistics at any time.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStatsForm(academyStats);
                  setShowEditStatsModal(true);
                }}
                className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit & Update Statistics</span>
              </button>
              <button
                type="button"
                onClick={handleResetStats}
                className="px-3.5 py-2 bg-white border border-slate-300 text-slate-600 hover:text-red-700 hover:border-red-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all metrics to 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 0</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Students</span>
              <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">{academyStats.activeStudents}</p>
              <span className="text-[11px] text-slate-500">Database verified</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Approved Faculty</span>
              <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">{academyStats.approvedFaculty}</p>
              <span className="text-[11px] text-emerald-700 font-semibold">{pendingTeacherApps} pending review</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Course Enrollments</span>
              <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">{academyStats.courseEnrollments}</p>
              <span className="text-[11px] text-slate-500">Active study tracks</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Student Testimonials</span>
              <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">{academyStats.studentTestimonials}</p>
              <span className="text-[11px] text-slate-500">Published feedback</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Total Enrolment Tuition Volume</h3>
                <p className="text-xs text-slate-500">Accrued course fees calculated from database enrolments.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatsForm(academyStats);
                  setShowEditStatsModal(true);
                }}
                className="text-xs font-semibold text-[#0D382B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Tuition Figures</span>
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500">Total Tuition (Egyptian Pounds)</span>
                <p className="text-3xl font-serif font-bold text-[#0D382B] font-mono tabular-nums mt-1">
                  {academyStats.totalTuitionEgp.toLocaleString()} EGP
                </p>
              </div>
              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                <span className="text-xs text-slate-500">USD Equivalent</span>
                <p className="text-2xl font-mono font-bold text-slate-700 tabular-nums mt-1">
                  ${(academyStats.totalTuitionUsd ?? Math.round(academyStats.totalTuitionEgp / 30.5)).toLocaleString()} USD
                </p>
              </div>
            </div>
          </div>

          {/* Verification Queue Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Faculty Applications Queue</h3>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {pendingTeacherApps} Applications Pending
              </span>
            </div>

            {applications.filter((a) => a.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No pending teacher applications in queue.</p>
            ) : (
              <div className="space-y-3">
                {applications
                  .filter((a) => a.status === 'pending')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{app.fullName}</span>
                          <span className="text-[11px] text-slate-500">({app.email})</span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2">{app.qualifications}</p>
                        <p className="text-slate-400 font-mono mt-0.5 text-[11px]">
                          {app.experienceYears} Years Experience · Submitted {app.submittedAt.slice(0, 10)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTeacherApproval(app.id, 'approved')}
                          className="px-3.5 py-1.5 bg-[#0D382B] text-white hover:bg-[#184D3C] rounded-lg font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTeacherApproval(app.id, 'rejected')}
                          className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT ACCOUNT INSPECTION & REGISTRY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Accounts & Access Rules</h3>
              <p className="text-xs text-slate-500">
                Click any student or teacher account to inspect chats, grant WhatsApp/offline course access, and edit scores.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                {(['all', 'student', 'teacher'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-md transition-all uppercase text-[11px] font-mono ${
                      userRoleFilter === r ? 'bg-white text-[#0D382B] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="relative w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Account / Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Phone / Age</th>
                  <th className="px-4 py-3 font-semibold">Password</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => handleOpenAccountDossier(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{u.fullName}</span>
                        {u.role === 'owner' && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-mono px-1.5 py-0.2 rounded font-bold">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono uppercase font-bold text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {u.phone || '—'} {u.age ? `· Age ${u.age}` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {u.password ? '••••••••' : 'OAuth / Auto'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAccountDossier(u);
                        }}
                        className="px-3 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Account</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT ACCOUNT INSPECTION DOSSIER (STUDENT & TEACHER) */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{inspectingUser.fullName}</h3>
                  <span className="text-[10px] uppercase font-mono font-bold bg-[#0D382B] text-white px-2 py-0.5 rounded">
                    {inspectingUser.role} Account Dossier
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Email: {inspectingUser.email} · Phone: {inspectingUser.phone || 'Not provided'} {inspectingUser.age ? `· Age: ${inspectingUser.age}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Credentials & Access Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">User ID</span>
                  <span className="font-bold text-slate-800">{inspectingUser.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Account Password</span>
                  <span className="font-bold text-[#0D382B]">{inspectingUser.password || 'Managed via OAuth'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                  <span className="font-bold text-emerald-800">{inspectingUser.status.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Date Joined</span>
                  <span className="font-bold text-slate-800">{new Date(inspectingUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* IF STUDENT: SHOW COURSE ACCESS MATRIX & LIVE SCORE EDITOR */}
              {inspectingUser.role === 'student' && studentDossierProfile && (
                <div className="space-y-6">
                  {/* Session Attendance & Curriculum Scale Editor (Owner Control) */}
                  <div className="border-2 border-[#0D382B]/20 rounded-xl p-5 bg-[#FAF8F5] space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D1E3D7] pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#0D382B]" />
                          <span>Student Session Attendance & Curriculum Scale</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Set how many total sessions and how many sessions this student has attended. The student's progress tab reflects only attended sessions out of their total sessions.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-[#0D382B] text-[#D1E3D7] px-3 py-1 rounded-full shrink-0">
                        {studentSessionsForm.attendedSessions} / {studentSessionsForm.totalSessions} Sessions
                      </span>
                    </div>

                    <form onSubmit={handleSaveStudentSessions} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Attended Sessions */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              Sessions Attended
                            </label>
                            <span className="text-[11px] text-emerald-700 font-mono font-bold">
                              Live Interactive
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setStudentSessionsForm((prev) => ({
                                  ...prev,
                                  attendedSessions: Math.max(0, prev.attendedSessions - 1),
                                }))
                              }
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={studentSessionsForm.attendedSessions}
                              onChange={(e) =>
                                setStudentSessionsForm((prev) => ({
                                  ...prev,
                                  attendedSessions: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              className="flex-1 px-3 py-1.5 text-center text-base font-bold font-mono border border-slate-300 rounded-lg text-[#0D382B]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setStudentSessionsForm((prev) => ({
                                  ...prev,
                                  attendedSessions: prev.attendedSessions + 1,
                                }))
                              }
                              className="w-8 h-8 rounded-lg bg-[#0D382B] hover:bg-[#184D3C] text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Increment each time the student attends a live 1-on-1 or group session.
                          </p>
                        </div>

                        {/* Total Sessions */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              Total Program Sessions
                            </label>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Curriculum Scope
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={studentSessionsForm.totalSessions}
                              onChange={(e) =>
                                setStudentSessionsForm((prev) => ({
                                  ...prev,
                                  totalSessions: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              className="flex-1 px-3 py-1.5 text-center text-base font-bold font-mono border border-slate-300 rounded-lg text-slate-800"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 self-center">Presets:</span>
                            {[0, 8, 12, 16, 24].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() =>
                                  setStudentSessionsForm((prev) => ({
                                    ...prev,
                                    totalSessions: num,
                                  }))
                                }
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  studentSessionsForm.totalSessions === num
                                    ? 'bg-[#0D382B] text-white border-[#0D382B]'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {num} Sessions
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Preview Bar */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">Student Progress Bar Preview</span>
                          <span className="font-mono font-bold text-[#0D382B]">
                            {studentSessionsForm.totalSessions > 0
                              ? Math.round((studentSessionsForm.attendedSessions / studentSessionsForm.totalSessions) * 100)
                              : 0}% Completion
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0D382B] h-full transition-all duration-300"
                            style={{
                              width: `${
                                studentSessionsForm.totalSessions > 0
                                  ? Math.min(100, Math.round((studentSessionsForm.attendedSessions / studentSessionsForm.totalSessions) * 100))
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-slate-500">
                          Saving immediately updates the student's personal dashboard progress meters and milestone badges.
                        </p>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Session Attendance</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Course Access Matrix (WhatsApp / Offline Payment Grant) */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0D382B]" />
                        <span>Course Access Permissions & Offline Payments</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        If this student paid via WhatsApp or bank transfer, grant access below. This instantly unlocks all 8 sessions, recorded lessons, and assignments on their student dashboard.
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {courses.map((course) => {
                        const isEnrolled = studentDossierProfile.enrolledCourseIds.includes(course.id);
                        return (
                          <div key={course.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-[#0D382B] px-1.5 py-0.5 rounded">
                                  {course.level}
                                </span>
                                <span className="font-bold text-slate-900">{course.title}</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Tuition: {course.priceEgp} EGP (${course.priceUsd}) · Code: {course.code}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleCourseAccess(course.id)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isEnrolled
                                  ? 'bg-emerald-100 text-emerald-900 hover:bg-red-50 hover:text-red-700 border border-emerald-300'
                                  : 'bg-[#0D382B] text-white hover:bg-[#184D3C] shadow-sm'
                              }`}
                            >
                              {isEnrolled ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Enrolled ✓ (Click to Revoke)</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Grant Access (Paid Offline)</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speaking Club Sessions Access & Seat Confirmation */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#0D382B]" />
                        <span>Speaking Club Sessions Access & Seat Confirmation</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Confirm or grant this student access to specific Speaking Club circles. When confirmed by the Owner, the student's dashboard displays "Seat Confirmed ✓ (Verified by Academy Director)" and unlocks the live session room.
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {clubs.map((club) => {
                        const isConfirmed =
                          (studentDossierProfile.confirmedClubSessionIds || []).includes(club.id) ||
                          (club.confirmedStudentIds || []).includes(inspectingUser.id);
                        const isRequested =
                          (club.registeredStudentIds || []).includes(inspectingUser.id) && !isConfirmed;

                        return (
                          <div key={club.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-[#EBF2EE] text-[#0D382B] px-1.5 py-0.5 rounded">
                                  {club.levelRange}
                                </span>
                                <span className="font-bold text-slate-900">{club.title}</span>
                              </div>
                              <p className="text-slate-500 text-[11px]">
                                {club.date} · {club.time} · Host: {club.hostTeacherName} · Topic: {club.topic}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                {isConfirmed ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Seat Confirmed ✓ (Live Room Unlocked)</span>
                                  </span>
                                ) : isRequested ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Student Requested Seat · Awaiting Confirmation</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                                    Not Registered
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleSpeakingClubAccess(club.id)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                                isConfirmed
                                  ? 'bg-emerald-100 text-emerald-900 hover:bg-red-50 hover:text-red-700 border border-emerald-300'
                                  : isRequested
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold'
                                  : 'bg-[#0D382B] text-white hover:bg-[#184D3C] shadow-sm'
                              }`}
                            >
                              {isConfirmed ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirmed ✓ (Click to Revoke)</span>
                                </>
                              ) : isRequested ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirm Student Seat ✓</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Grant & Confirm Seat</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Performance Scores Editor */}
                  <form onSubmit={handleSaveStudentScores} className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#0D382B]" />
                        <span>Academic Fluency Benchmarks (Owner Score Calibration)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Calibrate CEFR performance scores for this student. Updates reflect immediately on their personal progress meters.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fluency %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentScoreForm.fluencyScore}
                          onChange={(e) => setStudentScoreForm({ ...studentScoreForm, fluencyScore: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Grammar %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentScoreForm.grammarScore}
                          onChange={(e) => setStudentScoreForm({ ...studentScoreForm, grammarScore: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pronunciation %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentScoreForm.pronunciationScore}
                          onChange={(e) => setStudentScoreForm({ ...studentScoreForm, pronunciationScore: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vocabulary %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentScoreForm.vocabularyScore}
                          onChange={(e) => setStudentScoreForm({ ...studentScoreForm, vocabularyScore: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confidence %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentScoreForm.confidenceScore}
                          onChange={(e) => setStudentScoreForm({ ...studentScoreForm, confidenceScore: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Academic Pedagogical Notes</label>
                      <textarea
                        rows={2}
                        value={studentScoreForm.learningNotes}
                        onChange={(e) => setStudentScoreForm({ ...studentScoreForm, learningNotes: e.target.value })}
                        placeholder="Provide feedback on minimal pairs, connected speech, or meeting presence..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save Student Scores & Notes
                    </button>
                  </form>

                  {/* Active Goals Manager */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">Active Learning Targets</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add specific target, e.g. Eliminate Arabic /p/ vs /b/ confusion..."
                        value={newStudentGoalInput}
                        onChange={(e) => setNewStudentGoalInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddStudentGoal}
                        className="px-3 py-1.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg"
                      >
                        Add Target
                      </button>
                    </div>

                    <ul className="space-y-1.5">
                      {studentDossierProfile.goals.map((goal, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-700">{goal}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentGoal(idx)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Remove target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Student-Teacher Chats Inspection */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#0D382B]" />
                      <span>Communication History with Faculty</span>
                    </h4>
                    {conversations.filter((c) => c.studentId === inspectingUser.id).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No message threads started yet for this student.</p>
                    ) : (
                      <div className="space-y-2">
                        {conversations
                          .filter((c) => c.studentId === inspectingUser.id)
                          .map((conv) => (
                            <div key={conv.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">Teacher: {conv.teacherName}</span>
                                <p className="text-slate-600 italic text-[11px] mt-0.5">"{conv.lastMessageSnippet}"</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenAuditedChat(conv.id)}
                                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold"
                              >
                                View Chat Log
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* IF TEACHER: SHOW TEACHER CARD & PHOTO CHANGER */}
              {inspectingUser.role === 'teacher' && (
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Teacher Profile & Directory Settings</h4>
                  {teachers.find((t) => t.userId === inspectingUser.id || t.name === inspectingUser.fullName) ? (
                    (() => {
                      const teacher = teachers.find(
                        (t) => t.userId === inspectingUser.id || t.name === inspectingUser.fullName
                      )!;
                      return (
                        <div className="space-y-4 text-xs">
                          <div className="flex items-center gap-4">
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                            />
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">{teacher.name}</h5>
                              <p className="text-slate-500">{teacher.title}</p>
                              <span
                                className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  teacher.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {teacher.isApproved ? 'Approved & Listed' : 'Pending Verification'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTeacherToEdit({ ...teacher });
                                setIsCreatingTeacher(false);
                                setInspectingUser(null);
                                setActiveTab('teachers');
                              }}
                              className="px-4 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Teacher Card & Change Photo</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-slate-500 italic">No faculty card currently configured for this account.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE CATALOG MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Curriculum Catalog</h3>
              <p className="text-xs text-slate-500">Edit course tuition in Egyptian Pounds / USD, duration, and learning outcomes.</p>
            </div>
            <button
              onClick={() => {
                setIsCreatingCourse(true);
                setCourseToEdit({
                  id: `course_${Date.now()}`,
                  title: '',
                  code: 'ENG-NEW',
                  level: 'B1',
                  audience: '',
                  description: '',
                  outcomes: ['Develop conversational spoken confidence'],
                  format: 'Group Class',
                  durationWeeks: 8,
                  hoursPerWeek: 4,
                  priceEgp: 3500,
                  priceUsd: 115,
                  status: 'published',
                  enrolledCount: 0,
                });
              }}
              className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#0D382B] text-[#D1E3D7] px-2 py-0.5 rounded">
                    {c.level} · {c.code}
                  </span>
                  <button
                    onClick={() => handleToggleCourseStatus(c)}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      c.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </button>
                </div>

                <h4 className="text-base font-bold text-slate-900">{c.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-500 font-semibold">{c.priceEgp} EGP</span>
                    <span className="text-slate-400"> (${c.priceUsd})</span>
                  </div>
                  <span className="text-slate-500">{c.durationWeeks} Weeks · {c.enrolledCount} Enrolled</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreatingCourse(false);
                      setCourseToEdit({ ...c });
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:border-[#0D382B]"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY & TEACHER CARDS (WITH PHOTO CHANGER/UPLOAD) */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Faculty Cards & Directory Governance</h3>
                <p className="text-xs text-slate-500">
                  Edit educator bios, hourly rates, and manage teacher photos (upload new, change URL, or pick presets).
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingTeacher(true);
                  setTeacherToEdit({
                    id: `prof_tea_${Date.now()}`,
                    userId: `usr_tea_${Date.now()}`,
                    name: '',
                    title: 'Senior English Educator',
                    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
                    bio: '',
                    qualifications: ['6+ Years English Teaching Experience', 'B.A. English'],
                    experienceYears: 6,
                    specializations: ['Conversational Fluency', 'Pronunciation'],
                    languages: ['Arabic (Native)', 'English (C2)'],
                    proficiency: 'Near-Native C2',
                    preferredLevels: ['B1', 'B2', 'C1'],
                    lessonFormats: ['1-on-1 Intensive', 'Group Class'],
                    hourlyRateEgp: 650,
                    hourlyRateUsd: 22,
                    rating: 5.0,
                    reviewsCount: 1,
                    isApproved: true,
                    availabilitySummary: 'Sunday to Thursday CLT',
                  });
                }}
                className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teacher Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={teacher.avatarUrl}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-slate-900">{teacher.name}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ★ {teacher.rating}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0D382B] mt-0.5">{teacher.title}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {teacher.hourlyRateEgp} EGP (${teacher.hourlyRateUsd}) · {teacher.experienceYears} yrs exp
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{teacher.bio}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      Status: {teacher.isApproved ? 'Approved & Listed' : 'Pending Review'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsCreatingTeacher(false);
                          setTeacherToEdit({ ...teacher });
                        }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:border-[#0D382B] font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Card & Photo</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE TEACHER CARD (WITH PHOTO MANAGEMENT) */}
      {(teacherToEdit || isCreatingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingTeacher ? 'Create New Teacher Card' : 'Edit Teacher Card & Photo'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTeacherToEdit(null);
                  setIsCreatingTeacher(false);
                }}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4">
              {/* Photo Management Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Teacher Photo Management
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={teacherToEdit?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#0D382B]/20 shadow-sm"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Photo Image URL</label>
                      <input
                        type="text"
                        value={teacherToEdit?.avatarUrl || ''}
                        onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, avatarUrl: e.target.value } : null)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Or Upload New Photo from Device</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeacherPhotoUpload}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0D382B] file:text-white hover:file:bg-[#184D3C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 block mb-1">Pick a Preset Portrait:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      '/src/assets/images/teacher_amina_portrait_1792916088049.jpg',
                      '/src/assets/images/teacher_marcus_portrait_1792916087630.jpg',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
                    ].map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTeacherToEdit((prev) => prev ? { ...prev, avatarUrl: imgUrl } : null)}
                        className="w-10 h-10 rounded-lg overflow-hidden border-2 hover:border-[#0D382B] shrink-0"
                      >
                        <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={teacherToEdit?.name || ''}
                  onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Academic Title / Credentials</label>
                <input
                  type="text"
                  required
                  value={teacherToEdit?.title || ''}
                  onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Hourly Rate (EGP)</label>
                  <input
                    type="number"
                    value={teacherToEdit?.hourlyRateEgp || 600}
                    onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, hourlyRateEgp: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rating (★)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={teacherToEdit?.rating || 4.9}
                    onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Teacher Bio</label>
                <textarea
                  rows={3}
                  required
                  value={teacherToEdit?.bio || ''}
                  onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, bio: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="teacherApproved"
                  checked={teacherToEdit?.isApproved || false}
                  onChange={(e) => setTeacherToEdit((prev) => prev ? { ...prev, isApproved: e.target.checked } : null)}
                  className="rounded text-[#0D382B]"
                />
                <label htmlFor="teacherApproved" className="text-xs font-semibold text-slate-800">
                  Approved & Listed on Public Academy Faculty Directory
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherToEdit(null);
                    setIsCreatingTeacher(false);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Teacher Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE COURSE */}
      {(courseToEdit || isCreatingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingCourse ? 'Create New Course' : 'Edit Course Details'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCourseToEdit(null);
                  setIsCreatingCourse(false);
                }}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseToEdit?.title || ''}
                  onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseToEdit?.code || ''}
                    onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, code: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target CEFR Level</label>
                  <select
                    value={courseToEdit?.level || 'B1'}
                    onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, level: e.target.value as any } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper Intermediate</option>
                    <option value="C1">C1 Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tuition (EGP)</label>
                  <input
                    type="number"
                    value={courseToEdit?.priceEgp || 3000}
                    onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, priceEgp: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tuition (USD)</label>
                  <input
                    type="number"
                    value={courseToEdit?.priceUsd || 100}
                    onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, priceUsd: Number(e.target.value) } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  required
                  value={courseToEdit?.description || ''}
                  onChange={(e) => setCourseToEdit((prev) => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCourseToEdit(null);
                    setIsCreatingCourse(false);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: ACADEMY VOICES & TESTIMONIALS (EDIT, ADD, DELETE FEEDBACK) */}
      {activeTab === 'voices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Voices from Our Academy Governance</h3>
              <p className="text-xs text-slate-500">
                Manage student outcomes, feedback quotes, job titles, and ratings displayed across the website.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreatingVoice(true);
                setVoiceToEdit({
                  id: `voice_${Date.now()}`,
                  studentName: '',
                  roleOrField: 'Software Engineer',
                  location: 'Cairo, Egypt',
                  quote: '',
                  rating: 5,
                  featured: true,
                  dateAdded: new Date().toISOString().slice(0, 10),
                });
              }}
              className="px-4 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Voice / Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.map((v) => (
              <div key={v.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#2E7D5B] font-bold">
                      {'★'.repeat(v.rating || 5)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{v.dateAdded}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{v.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{v.studentName}</h5>
                    <p className="text-slate-500 text-[11px]">{v.roleOrField} · {v.location}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsCreatingVoice(false);
                        setVoiceToEdit({ ...v });
                      }}
                      className="p-1 text-slate-600 hover:text-[#0D382B]"
                      title="Edit review"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVoice(v.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE TESTIMONIAL */}
      {(voiceToEdit || isCreatingVoice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingVoice ? 'Add New Student Voice' : 'Edit Testimonial'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setVoiceToEdit(null);
                  setIsCreatingVoice(false);
                }}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={voiceToEdit?.studentName || ''}
                  onChange={(e) => setVoiceToEdit((prev) => prev ? { ...prev, studentName: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role / Profession</label>
                  <input
                    type="text"
                    required
                    value={voiceToEdit?.roleOrField || ''}
                    onChange={(e) => setVoiceToEdit((prev) => prev ? { ...prev, roleOrField: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={voiceToEdit?.location || ''}
                    onChange={(e) => setVoiceToEdit((prev) => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Quote / Student Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={voiceToEdit?.quote || ''}
                  onChange={(e) => setVoiceToEdit((prev) => prev ? { ...prev, quote: e.target.value } : null)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceToEdit(null);
                    setIsCreatingVoice(false);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SPEAKING CLUBS MANAGEMENT */}
      {activeTab === 'clubs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Speaking Club Circle Management & Seat Approvals</h3>
              <p className="text-xs text-slate-500">
                Confirm student seat requests, grant access, or manage session topics and schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#0D382B] bg-[#EBF2EE] px-3 py-1.5 rounded-lg border border-[#D1E3D7]">
                {clubs.length} Active Immersion Circles
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {clubs.map((c) => {
              const studentUsers = users.filter((u) => u.role === 'student');
              const confirmedList = (c.confirmedStudentIds || []);
              const pendingList = (c.registeredStudentIds || []).filter((id) => !confirmedList.includes(id));

              return (
                <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-[#0D382B] text-[#D1E3D7] px-2 py-0.5 rounded">
                          {c.levelRange}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1"><span className="font-semibold text-slate-800">Topic:</span> {c.topic}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {c.date} · {c.time} ({c.durationMinutes} min) · Host: {c.hostTeacherName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          {confirmedList.length} Confirmed / {c.maxParticipants} Seats
                        </span>
                        {pendingList.length > 0 && (
                          <span className="inline-block text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded mt-0.5">
                            {pendingList.length} Pending Approval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Registered & Confirmed Attendees Section */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Enrolled Students & Seat Approvals
                    </h5>

                    {c.registeredStudentIds.length === 0 && confirmedList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No seat requests or enrollments yet for this session.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {Array.from(new Set([...c.registeredStudentIds, ...confirmedList])).map((stuId) => {
                          const stuUser = users.find((u) => u.id === stuId);
                          const isConfirmed = confirmedList.includes(stuId);

                          return (
                            <div
                              key={stuId}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                isConfirmed
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold truncate text-slate-900">
                                    {stuUser?.fullName || stuId}
                                  </span>
                                  {isConfirmed ? (
                                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                      Confirmed ✓
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                      Pending ⏳
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{stuUser?.email || 'No email'}</p>
                              </div>

                              <div className="shrink-0">
                                {isConfirmed ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeClubSeat(c.id, stuId)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 rounded-lg border border-red-300 transition-colors cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmClubSeat(c.id, stuId)}
                                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Confirm Seat</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Quick Manual Grant to any student */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        id={`select_grant_${c.id}`}
                        defaultValue=""
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white flex-1"
                      >
                        <option value="" disabled>
                          Select any student to grant speaking seat...
                        </option>
                        {studentUsers
                          .filter((s) => !confirmedList.includes(s.id))
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.email})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const selectElem = document.getElementById(`select_grant_${c.id}`) as HTMLSelectElement | null;
                          if (selectElem && selectElem.value) {
                            handleConfirmClubSeat(c.id, selectElem.value);
                            selectElem.value = '';
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg shrink-0 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Grant & Confirm Seat</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: ACADEMY SETTINGS & CONTACT CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Academy Institutional & Contact Settings</h3>
            <p className="text-xs text-slate-500">
              Customize public academy contact information, campus locations, and official educational programs.
            </p>
          </div>

          <form onSubmit={handleSaveAcademySettings} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academy Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.academyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, academyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0D382B]" />
                  <span>Campus / Location Address</span>
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0D382B]" />
                    <span>Official Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0D382B]" />
                    <span>Official Phone / WhatsApp Hotline</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Academic Program Tags */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Official Academic Programs & Focus Areas
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Cambridge B2 First Exam Prep..."
                  value={newProgramInput}
                  onChange={(e) => setNewProgramInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddProgramTag}
                  className="px-3.5 py-1.5 bg-[#0D382B] text-white text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
                >
                  Add Program
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {settingsForm.academicPrograms.map((prog, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs border border-slate-200 flex items-center gap-1.5"
                  >
                    <span>{prog}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProgramTag(i)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-bold rounded-lg shadow-sm"
              >
                Save Academy Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: COMMUNICATIONS OVERSIGHT */}
      {activeTab === 'communications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Academy Communications Oversight</h3>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded">
                AUDITED DISCLOSURE
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with our disclosed safeguarding charter, academy administrators may inspect sent student-teacher conversations for quality assurance and dispute resolution. Each inspection requires a recorded justification note and is written immutably to the audit log.
            </p>
          </div>

          <div className="space-y-3">
            {conversations.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{c.studentName} ⟷ {c.teacherName}</span>
                  <p className="text-slate-600 italic truncate mt-0.5">"{c.lastMessageSnippet}"</p>
                </div>
                <button
                  onClick={() => handleOpenAuditedChat(c.id)}
                  className="px-3.5 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-[#D1E3D7] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Inspect Thread (Audited)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: AUDIT REASON / DISCLOSURE */}
      {showAuditReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Safeguarding Inspection Justification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every administrative thread access is recorded permanently in the academy audit trail to protect student and faculty privacy rights.
            </p>

            <form onSubmit={handleConfirmAuditAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Administrative Reason</label>
                <textarea
                  rows={3}
                  required
                  value={auditJustificationReason}
                  onChange={(e) => setAuditJustificationReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditReasonModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D382B] text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Confirm & Inspect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AUDITED CHAT VIEWER */}
      {isAuditAccessGranted && selectedAuditConvId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Thread Inspection Portal</h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  AUDITED ACTIVE
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAuditAccessGranted(false);
                  setSelectedAuditConvId(null);
                }}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <ChatSystem
                currentUser={currentUser}
                isOwnerAuditMode={true}
                auditJustification={auditJustificationReason}
                preselectedConversationId={selectedAuditConvId}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: IMMUTABLE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Academy Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Cryptographically sequenced log of administrative approvals, tuition entries, and communications audits.
              </p>
            </div>

            <input
              type="text"
              placeholder="Filter audit actions..."
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-52"
            />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs
              .filter(
                (log) =>
                  log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
                  log.performedBy.toLowerCase().includes(auditFilter.toLowerCase()) ||
                  log.details.toLowerCase().includes(auditFilter.toLowerCase())
              )
              .map((log) => (
                <div key={log.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#0D382B] text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.details}</p>
                  <p className="text-slate-500 text-[11px]">
                    Actor: <span className="font-semibold text-slate-700">{log.performedBy}</span> ({log.userRole}) · Target: {log.targetEntity}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: EDIT & UPDATE ACADEMY OVERVIEW STATISTICS */}
      {showEditStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Academy Overview Statistics</h3>
                <p className="text-xs text-slate-500">
                  Update platform metrics or reset all to zero as Fluentia English Academy launches.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditStatsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStats} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Active Students</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.activeStudents}
                    onChange={(e) => setStatsForm({ ...statsForm, activeStudents: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approved Faculty</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.approvedFaculty}
                    onChange={(e) => setStatsForm({ ...statsForm, approvedFaculty: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Enrollments</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.courseEnrollments}
                    onChange={(e) => setStatsForm({ ...statsForm, courseEnrollments: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Testimonials</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.studentTestimonials}
                    onChange={(e) => setStatsForm({ ...statsForm, studentTestimonials: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Tuition (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.totalTuitionEgp}
                    onChange={(e) => {
                      const egp = Math.max(0, parseInt(e.target.value) || 0);
                      setStatsForm({
                        ...statsForm,
                        totalTuitionEgp: egp,
                        totalTuitionUsd: Math.round(egp / 30.5),
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">USD Equivalent ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={statsForm.totalTuitionUsd ?? Math.round(statsForm.totalTuitionEgp / 30.5)}
                    onChange={(e) => setStatsForm({ ...statsForm, totalTuitionUsd: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetStats}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to 0</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditStatsModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D382B] text-white hover:bg-[#184D3C] text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save & Update Statistics
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
