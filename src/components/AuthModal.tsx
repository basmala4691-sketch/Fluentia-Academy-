import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AcademyStore } from '../services/storage';
import { User, CefrLevel, UserRole } from '../types';
import { notifyStudentRegistration, notifyTeacherRegistration } from '../services/formspree';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Student Register State
  const [stuFullName, setStuFullName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [stuAge, setStuAge] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [stuLevel, setStuLevel] = useState<CefrLevel>('B1');
  const [stuGoal, setStuGoal] = useState('Improve speaking confidence & fluency in meetings');
  const [stuFormat, setStuFormat] = useState<'one-on-one' | 'group' | 'speaking-club'>('one-on-one');

  // Teacher Register State
  const [teaFullName, setTeaFullName] = useState('');
  const [teaEmail, setTeaEmail] = useState('');
  const [teaPhone, setTeaPhone] = useState('');
  const [teaAge, setTeaAge] = useState('');
  const [teaPassword, setTeaPassword] = useState('');
  const [teaBio, setTeaBio] = useState('');
  const [teaQuals, setTeaQuals] = useState('');
  const [teaExpYears, setTeaExpYears] = useState(3);
  const [teaSpecializations, setTeaSpecializations] = useState('Speaking & Fluency, Business English');
  const [teaLanguages, setTeaLanguages] = useState('Arabic (Native), English (C2/Near-Native)');
  const [teaProficiency, setTeaProficiency] = useState('C2 Bilingual / Native Proficiency');
  const [teaAvailability, setTeaAvailability] = useState('Sunday - Thursday evenings');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post registration banner
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState<{
    role: UserRole;
    name: string;
    isPending: boolean;
  } | null>(null);

  // Reset modal state on opening/closing or mode change
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setRegistrationSuccessMsg(null);
      setLoginError(null);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const enteredPassword = loginPassword.trim();
    const users = AcademyStore.getUsers();

    // Check if logging in as Academy Owner Basmala Ahmed
    if (trimmedEmail === 'fluentia.academy.edu@gmail.com') {
      if (enteredPassword === 'FluentiaEdu20+26!') {
        let ownerUser = users.find((u) => u.role === 'owner' || u.email.toLowerCase() === trimmedEmail);
        if (!ownerUser) {
          ownerUser = {
            id: 'usr_owner_1',
            email: 'fluentia.academy.edu@gmail.com',
            fullName: 'Basmala Ahmed',
            role: 'owner',
            status: 'active',
            password: 'FluentiaEdu20+26!',
            phone: '+20 1 20 57 9 3 4 20',
            createdAt: new Date().toISOString(),
          };
          users.push(ownerUser);
          localStorage.setItem('fluentia_users', JSON.stringify(users));
        } else if (ownerUser.fullName !== 'Basmala Ahmed') {
          ownerUser.fullName = 'Basmala Ahmed';
          localStorage.setItem('fluentia_users', JSON.stringify(users));
        }
        AcademyStore.setCurrentUser(ownerUser);
        onLoginSuccess(ownerUser);
        onClose();
        return;
      } else {
        setLoginError('Incorrect password for Academy Owner. Please verify your credentials.');
        return;
      }
    }

    // Check regular users (Student or Teacher)
    const user = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (user) {
      if (user.password && enteredPassword && user.password !== enteredPassword) {
        setLoginError('Invalid password. Please check your credentials.');
        return;
      }
      AcademyStore.setCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    } else {
      setLoginError('No account found with this email address. Please register or check for typos.');
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = stuEmail.trim().toLowerCase();
    const users = AcademyStore.getUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setLoginError('An account with this email address already exists. Please log in or use a different email.');
      return;
    }

    setIsSubmitting(true);

    const newUserId = `usr_stu_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: stuEmail.trim(),
      fullName: stuFullName.trim(),
      role: 'student',
      status: 'active',
      phone: stuPhone.trim() || undefined,
      age: stuAge ? Number(stuAge) : undefined,
      password: stuPassword.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('fluentia_users', JSON.stringify(users));

    AcademyStore.updateStudentProfile(
      {
        userId: newUserId,
        estimatedLevel: stuLevel,
        goals: [stuGoal],
        preferredFormat: stuFormat,
        enrolledCourseIds: [],
        grammarScore: 0,
        vocabularyScore: 0,
        fluencyScore: 0,
        pronunciationScore: 0,
        confidenceScore: 0,
        learningNotes: 'New student account. Awaiting course enrollment from Academy Director.',
      },
      newUserId
    );

    AcademyStore.addAuditLog({
      action: 'STUDENT_REGISTERED',
      performedBy: newUser.fullName,
      userRole: 'student',
      targetEntity: `Student Profile: ${newUser.fullName} (${newUser.email})`,
      details: `Registered with estimated level ${stuLevel}, phone: ${stuPhone}, age: ${stuAge}.`,
    });

    // Send Formspree notification immediately to Owner
    await notifyStudentRegistration({
      fullName: stuFullName.trim(),
      email: stuEmail.trim(),
      phone: stuPhone.trim(),
      age: stuAge,
      password: stuPassword,
      level: stuLevel,
      learningGoal: stuGoal,
      preferredFormat: stuFormat,
    });

    setIsSubmitting(false);
    AcademyStore.setCurrentUser(newUser);
    setRegistrationSuccessMsg({
      role: 'student',
      name: newUser.fullName,
      isPending: false,
    });
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = teaEmail.trim().toLowerCase();
    const users = AcademyStore.getUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setLoginError('An account with this email address already exists. Please log in or use a different email.');
      return;
    }

    setIsSubmitting(true);

    const newUserId = `usr_tea_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: teaEmail.trim(),
      fullName: teaFullName.trim(),
      role: 'teacher',
      status: 'pending',
      phone: teaPhone.trim() || undefined,
      age: teaAge ? Number(teaAge) : undefined,
      password: teaPassword.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('fluentia_users', JSON.stringify(users));

    AcademyStore.submitTeacherApplication({
      id: `app_${Date.now()}`,
      userId: newUserId,
      fullName: teaFullName.trim(),
      email: teaEmail.trim(),
      bio: teaBio.trim(),
      qualifications: teaQuals.trim(),
      experienceYears: Number(teaExpYears),
      specializations: teaSpecializations.split(',').map((s) => s.trim()),
      languages: teaLanguages.trim(),
      proficiency: teaProficiency,
      preferredLevels: ['B1', 'B2', 'C1'],
      lessonFormats: ['1-on-1 Intensive', 'Group Class'],
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    // Send Formspree notification immediately to Owner
    await notifyTeacherRegistration({
      fullName: teaFullName.trim(),
      email: teaEmail.trim(),
      phone: teaPhone.trim(),
      age: teaAge,
      password: teaPassword,
      qualifications: teaQuals.trim(),
      experienceYears: teaExpYears,
      specializations: teaSpecializations.trim(),
      languages: teaLanguages.trim(),
      proficiency: teaProficiency,
      bio: teaBio.trim(),
    });
    setIsSubmitting(false);

    const teachers = AcademyStore.getTeachers();
    teachers.push({
      id: `prof_tea_${Date.now()}`,
      userId: newUserId,
      name: teaFullName.trim(),
      title: 'English Educator (Pending Verification)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: teaBio.trim(),
      qualifications: [teaQuals.trim()],
      experienceYears: Number(teaExpYears),
      specializations: teaSpecializations.split(',').map((s) => s.trim()),
      languages: [teaLanguages.trim()],
      proficiency: teaProficiency,
      preferredLevels: ['B1', 'B2', 'C1'],
      lessonFormats: ['1-on-1 Intensive', 'Group Class'],
      hourlyRateEgp: 500,
      hourlyRateUsd: 18,
      rating: 5.0,
      reviewsCount: 0,
      isApproved: false,
      availabilitySummary: teaAvailability,
    });
    localStorage.setItem('fluentia_teachers', JSON.stringify(teachers));

    AcademyStore.setCurrentUser(newUser);
    setRegistrationSuccessMsg({
      role: 'teacher',
      name: newUser.fullName,
      isPending: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#E3DFD3] overflow-y-auto">
        {/* Header with Logo */}
        <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-[#E3DFD3] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/file_0000000018fc81f497e52944e9bf52e5_eee5e1aa.png"
              alt="Fluentia English Academy"
              className="h-9 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {registrationSuccessMsg ? (
          <div className="p-8 text-center">
            {registrationSuccessMsg.isPending ? (
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Teacher Application Submitted</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Welcome, <span className="font-semibold text-slate-900">{registrationSuccessMsg.name}</span>. Your teacher account has been created with <span className="text-amber-800 font-semibold">Pending Status</span>.
                </p>
                <div className="p-4 bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl text-left text-xs text-slate-700 space-y-2 mb-6">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3D6E57] shrink-0 mt-0.5" />
                    <span>To protect students, all teacher credentials and certificates are manually verified by Academy Leadership before public listing.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3D6E57] shrink-0 mt-0.5" />
                    <span>Pending teachers cannot access private student records or receive bookings until verified.</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLoginSuccess(AcademyStore.getCurrentUser()!);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#0D382B] text-white font-semibold text-sm rounded-lg hover:bg-[#184D3C]"
                >
                  View Teacher Onboarding Dashboard
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-[#EBF2EE] text-[#0D382B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D1E3D7]">
                  <CheckCircle className="w-7 h-7 text-[#3D6E57]" />
                </div>
                <h3 className="text-xl font-bold text-[#0D382B] mb-2">Welcome to Fluentia Academy!</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Congratulations, <span className="font-semibold text-slate-900">{registrationSuccessMsg.name}</span>. Your student profile is active. You can now access your learning plan, record speaking practice, and join speaking clubs.
                </p>
                <button
                  onClick={() => {
                    onLoginSuccess(AcademyStore.getCurrentUser()!);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#0D382B] text-white font-semibold text-sm rounded-lg hover:bg-[#184D3C]"
                >
                  Enter Student Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Mode switch */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-[#0D382B] text-white shadow-sm' : 'text-slate-700 hover:text-[#0D382B]'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-[#0D382B] text-white shadow-sm' : 'text-slate-700 hover:text-[#0D382B]'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Quick login helper */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl text-xs text-slate-700">
                  <span className="font-semibold text-[#0D382B]">Demo Accounts:</span>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('nour.khalil@gmail.com');
                        setLoginPassword('password123');
                      }}
                      className="text-left p-1.5 bg-white border border-[#E3DFD3] rounded hover:border-[#3D6E57]"
                    >
                      <div className="font-semibold text-slate-900">Student Account</div>
                      <div className="text-slate-500 font-mono truncate">nour.khalil@gmail.com</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('amina.elsayed@fluentia.edu.eg');
                        setLoginPassword('password123');
                      }}
                      className="text-left p-1.5 bg-white border border-[#E3DFD3] rounded hover:border-[#3D6E57]"
                    >
                      <div className="font-semibold text-slate-900">Approved Teacher</div>
                      <div className="text-slate-500 font-mono truncate">amina.elsayed@...</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@example.com or teacher@fluentia.edu.eg"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Log In to Fluentia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div>
                {loginError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Choose Account Type (2 Options Only)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedRole === 'student'
                          ? 'border-[#0D382B] bg-[#EBF2EE] ring-1 ring-[#0D382B]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#0D382B] flex items-center justify-center mb-2">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Student Account</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        For learners wanting to improve speaking, master grammar, and join speaking clubs.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedRole === 'teacher'
                          ? 'border-[#0D382B] bg-[#EBF2EE] ring-1 ring-[#0D382B]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#0D382B] flex items-center justify-center mb-2">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Teacher Account</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        For certified English educators applying to teach through Fluentia Academy.
                      </p>
                    </button>
                  </div>
                </div>

                {selectedRole === 'student' ? (
                  <form onSubmit={handleStudentRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={stuFullName}
                          onChange={(e) => setStuFullName(e.target.value)}
                          placeholder="e.g. Omar Hassan"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={stuEmail}
                          onChange={(e) => setStuEmail(e.target.value)}
                          placeholder="omar@example.com"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={stuPhone}
                          onChange={(e) => setStuPhone(e.target.value)}
                          placeholder="e.g. +20 100 123 4567"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                        <input
                          type="number"
                          min="12"
                          max="100"
                          required
                          value={stuAge}
                          onChange={(e) => setStuAge(e.target.value)}
                          placeholder="e.g. 21"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={stuPassword}
                        onChange={(e) => setStuPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Level</label>
                        <select
                          value={stuLevel}
                          onChange={(e) => setStuLevel(e.target.value as CefrLevel)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        >
                          <option value="A1">A1 - Beginner</option>
                          <option value="A2">A2 - Elementary</option>
                          <option value="B1">B1 - Intermediate</option>
                          <option value="B2">B2 - Upper-Intermediate</option>
                          <option value="C1">C1 - Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Format</label>
                        <select
                          value={stuFormat}
                          onChange={(e) => setStuFormat(e.target.value as any)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        >
                          <option value="one-on-one">1-on-1 Intensive Mentorship</option>
                          <option value="group">Group Interactive Cohort</option>
                          <option value="speaking-club">Speaking Club Only</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Primary Learning Goal</label>
                      <input
                        type="text"
                        required
                        value={stuGoal}
                        onChange={(e) => setStuGoal(e.target.value)}
                        placeholder="e.g. Speaking fluently in job interviews"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Submitting & Dispatching...' : 'Complete Student Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleTeacherRegister} className="space-y-3">
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>All teacher applications undergo credential review and verification before public listing.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={teaFullName}
                          onChange={(e) => setTeaFullName(e.target.value)}
                          placeholder="e.g. Sarah Mansour"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={teaEmail}
                          onChange={(e) => setTeaEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={teaPhone}
                          onChange={(e) => setTeaPhone(e.target.value)}
                          placeholder="e.g. +20 122 987 6543"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                        <input
                          type="number"
                          min="20"
                          max="80"
                          required
                          value={teaAge}
                          onChange={(e) => setTeaAge(e.target.value)}
                          placeholder="e.g. 29"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={teaPassword}
                        onChange={(e) => setTeaPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Qualifications & Certificates</label>
                      <input
                        type="text"
                        required
                        value={teaQuals}
                        onChange={(e) => setTeaQuals(e.target.value)}
                        placeholder="e.g. 5+ Years Teaching Experience, B.A. English, TEFL"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Years Teaching Experience</label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          required
                          value={teaExpYears}
                          onChange={(e) => setTeaExpYears(Number(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">English Proficiency</label>
                        <select
                          value={teaProficiency}
                          onChange={(e) => setTeaProficiency(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                        >
                          <option value="Native Speaker">Native Speaker</option>
                          <option value="C2 Bilingual / Native Proficiency">C2 Bilingual / Near-Native</option>
                          <option value="C1 Advanced">C1 Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Teaching Specializations</label>
                      <input
                        type="text"
                        required
                        value={teaSpecializations}
                        onChange={(e) => setTeaSpecializations(e.target.value)}
                        placeholder="e.g. Pronunciation, IELTS Speaking, Business English"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Short Professional Biography</label>
                      <textarea
                        rows={2}
                        required
                        value={teaBio}
                        onChange={(e) => setTeaBio(e.target.value)}
                        placeholder="Summarize your teaching philosophy, methodology, and student track record..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Submitting & Dispatching...' : 'Submit Teacher Application'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
