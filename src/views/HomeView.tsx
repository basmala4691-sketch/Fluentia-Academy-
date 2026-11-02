import React, { useState } from 'react';
import {
  ArrowRight,
  Mic,
  CheckCircle2,
  ChevronRight,
  Star,
  Plus,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { Course, TeacherProfile, User, AcademyVoice } from '../types';
import { AcademyStore } from '../services/storage';
import { WhatsAppIcon, WHATSAPP_DEFAULT_URL, WHATSAPP_PHONE } from '../components/WhatsAppButton';

interface HomeViewProps {
  courses: Course[];
  teachers: TeacherProfile[];
  currentUser?: User | null;
  onNavigate: (tab: string) => void;
  onSelectCourse: (course: Course) => void;
  onOpenPlacementTest: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  teachers,
  currentUser,
  onNavigate,
  onSelectCourse,
  onOpenPlacementTest,
}) => {
  const publishedCourses = courses.filter((c) => c.status === 'published').slice(0, 4);
  const approvedTeachers = teachers.filter((t) => t.isApproved).slice(0, 2);

  // Dynamic Academy Voices
  const [voices, setVoices] = useState<AcademyVoice[]>(() => AcademyStore.getAcademyVoices());
  const [voiceToEdit, setVoiceToEdit] = useState<AcademyVoice | null>(null);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const isOwner = currentUser?.role === 'owner';

  const reloadVoices = () => {
    setVoices(AcademyStore.getAcademyVoices());
  };

  const handleSaveVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceToEdit) return;
    AcademyStore.saveAcademyVoice(voiceToEdit);
    setVoiceToEdit(null);
    setIsCreatingVoice(false);
    reloadVoices();
  };

  const handleDeleteVoice = (id: string) => {
    if (confirm('Delete this student voice testimonial?')) {
      AcademyStore.deleteAcademyVoice(id);
      setVoiceToEdit(null);
      reloadVoices();
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D382B]/5 via-[#F7F5EE] to-[#F7F5EE] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Core Message */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#EBF2EE] border border-[#D1E3D7] rounded-full text-xs font-semibold text-[#0D382B] tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#3D6E57]" />
                <span>Premier Online Academy for Egyptian & International Learners</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#0D382B] tracking-tight leading-[1.15] text-balance">
                Your English. <br />
                Your Confidence. <br />
                <span className="text-[#3D6E57] italic">Your Next Level.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
                Bridge the gap between textbook grammar and spontaneous executive spoken fluency. Guided by experienced, fluent English mentors through personalized 1-on-1 mentorship, audio recording feedback, and weekly immersion speaking clubs.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onOpenPlacementTest}
                  className="px-6 py-3.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Find Your Learning Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('speaking-club')}
                  className="px-6 py-3.5 bg-white hover:bg-[#EBF2EE] text-[#0D382B] border border-[#D1E3D7] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Mic className="w-4 h-4 text-[#3D6E57]" />
                  <span>Join Our Speaking Club</span>
                </button>

                <a
                  href={WHATSAPP_DEFAULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl flex items-center justify-center shadow-md transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  title="Chat on WhatsApp"
                  aria-label="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-[#E3DFD3]">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#3D6E57]" />
                  CEFR Aligned Curriculum (A1–C1)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Mic className="w-4 h-4 text-[#3D6E57]" />
                  Personal Teacher Audio Feedback
                </span>
              </div>
            </div>

            {/* Right Column: Hero Graphic Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  src="/src/assets/images/fluentia_hero_banner_1792916086909.jpg"
                  alt="Fluentia English Academy Study Lounge"
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07261D]/90 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-wider text-[#A5C2AE] font-semibold mb-1">
                      Academic Atmosphere
                    </p>
                    <h3 className="text-lg font-serif font-bold text-white">
                      Where Egyptian Ambition Meets International English Mastery
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Metric Full-Width Row Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-[#E3DFD3] shadow-sm">
            <div className="border-r border-slate-100 last:border-0 pr-4">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] tabular-nums">420+</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Active Egyptian & Global Students</p>
            </div>
            <div className="border-r border-slate-100 last:border-0 pr-4">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] tabular-nums">98%</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Speaking Confidence Metric</p>
            </div>
            <div className="border-r border-slate-100 last:border-0 pr-4">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] tabular-nums">100%</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Experienced & Fluent Mentors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] tabular-nums">12</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Weekly Immersion Speaking Circles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
              Structured Milestones
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
              Featured Academic Courses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
              Every course is engineered with clear CEFR benchmarks, interactive conversation drills, and personalized feedback.
            </p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-semibold text-[#0D382B] hover:text-[#3D6E57] flex items-center gap-1.5 transition-colors"
          >
            <span>View All 8 Courses</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {publishedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-[#E3DFD3] p-6 flex flex-col justify-between hover:border-[#3D6E57] hover:shadow-lg transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-mono">
                  <span className="font-bold text-[#0D382B] bg-[#EBF2EE] px-2.5 py-0.5 rounded">
                    {course.level}
                  </span>
                  <span>{course.durationWeeks} Weeks</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0D382B] transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {course.outcomes.slice(0, 2).map((out, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6E57] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{out}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Tuition</span>
                  <span className="text-sm font-bold text-[#0D382B] font-mono tabular-nums">
                    {course.priceEgp.toLocaleString()} EGP
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">(${course.priceUsd})</span>
                </div>
                <button
                  onClick={() => onSelectCourse(course)}
                  className="px-4 py-1.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Speaking Club Feature Spotlight */}
      <section className="bg-[#0D382B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border-2 border-[#4E7C65]/40 shadow-2xl">
                <img
                  src="/src/assets/images/speaking_club_group_1792916087603.jpg"
                  alt="Fluentia Speaking Club Session"
                  className="w-full h-[380px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#A5C2AE]">
                Active Spoken Immersion
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                The Fluentia Speaking Club
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Speaking a language cannot be learned in silence. Every week, small cohorts of 8 to 12 students gather online with an experienced, fluent mentor to debate real-world topics, conduct business simulations, and build unshakeable spontaneous fluency.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#184D3C] text-[#A5C2AE] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">No Arabic Translation Allowed</h4>
                    <p className="text-xs text-slate-300">Train your brain to retrieve English words instantaneously without pausing to translate.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#184D3C] text-[#A5C2AE] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Immediate Professional Coaching</h4>
                    <p className="text-xs text-slate-300">Our mentors pinpoint Egyptian phonology transfers (e.g. /p/ vs /b/) and refine intonation curves in real time.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => onNavigate('speaking-club')}
                  className="px-6 py-3 bg-[#4E7C65] hover:bg-[#3D6E57] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Explore Upcoming Sessions & Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Faculty Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
            Faculty & Mentors
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
            Learn from Experienced Language Mentors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Every teacher at Fluentia brings proven teaching experience, strong English language fluency, and dedicated personalized guidance for learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {approvedTeachers.map((tea) => (
            <div
              key={tea.id}
              className="bg-white rounded-2xl border border-[#E3DFD3] p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={tea.avatarUrl}
                alt={tea.name}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-between">
                  <h3 className="text-base font-bold text-slate-900">{tea.name}</h3>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-[#2E7D5B] font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{tea.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#3D6E57] font-semibold">{tea.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{tea.bio}</p>
                <div className="pt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {tea.specializations.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-[#EBF2EE] text-[#0D382B] px-2 py-0.5 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('teachers')}
            className="text-xs font-semibold text-[#0D382B] hover:text-[#3D6E57] transition-colors"
          >
            Explore All Faculty & Book Private Mentorship →
          </button>
        </div>
      </section>

      {/* How It Works & Diagnostic CTA */}
      <section className="bg-[#EFECE2]/60 border-y border-[#E3DFD3] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
              The Fluentia Method
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
              How You Achieve Real Spoken Fluency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Diagnostic Assessment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take our 12-question calibrated CEFR placement test to identify grammar gaps and target level.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Targeted Cohort or 1-on-1</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join a specialized group class or private mentor matched to your career and learning cadence.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Voice Recording Practice</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit audio answers to real-world prompts and receive direct teacher audio voice feedback.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] text-center">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-3">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Weekly Speaking Immersion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test your skills live in the Speaking Club, eliminating hesitation in high-pressure debates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genuine Testimonials - Voices from Our Academy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
            Verified Student Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
            Voices from Our Academy
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Real Egyptian and international learners who achieved confidence, career breakthroughs, and conversational mastery.
          </p>

          {isOwner && (
            <div className="mt-4">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Owner Mode: Add Academy Voice / Feedback</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 relative flex flex-col justify-between group shadow-sm hover:border-[#3D6E57] transition-all"
            >
              {isOwner && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsCreatingVoice(false);
                      setVoiceToEdit({ ...voice });
                    }}
                    className="p-1 bg-[#EBF2EE] text-[#0D382B] hover:bg-[#D1E3D7] rounded text-xs"
                    title="Edit voice"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVoice(voice.id)}
                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs"
                    title="Delete voice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#2E7D5B] text-xs">
                  {Array.from({ length: voice.rating || 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{voice.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs">
                <p className="font-bold text-slate-900">{voice.studentName}</p>
                <p className="text-slate-500">{voice.roleOrField} · {voice.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Owner Mode Voice Editor Modal */}
      {voiceToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0D382B] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D1E3D7]" />
                <h3 className="text-base font-bold text-white">
                  {isCreatingVoice ? 'Add New Academy Voice' : `Edit Voice: ${voiceToEdit.studentName}`}
                </h3>
              </div>
              <button
                onClick={() => setVoiceToEdit(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={voiceToEdit.studentName}
                  onChange={(e) => setVoiceToEdit({ ...voiceToEdit, studentName: e.target.value })}
                  placeholder="e.g. Tamer Nabil"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Profession / Role</label>
                  <input
                    type="text"
                    required
                    value={voiceToEdit.roleOrField}
                    onChange={(e) => setVoiceToEdit({ ...voiceToEdit, roleOrField: e.target.value })}
                    placeholder="e.g. Senior Product Manager"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={voiceToEdit.location}
                    onChange={(e) => setVoiceToEdit({ ...voiceToEdit, location: e.target.value })}
                    placeholder="e.g. Cairo, Egypt"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Star Rating (1 - 5)</label>
                <select
                  value={voiceToEdit.rating}
                  onChange={(e) => setVoiceToEdit({ ...voiceToEdit, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Student Review / Testimonial Quote</label>
                <textarea
                  rows={4}
                  required
                  value={voiceToEdit.quote}
                  onChange={(e) => setVoiceToEdit({ ...voiceToEdit, quote: e.target.value })}
                  placeholder="Share the learning breakthrough, phonology improvement, or career outcome..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {!isCreatingVoice ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteVoice(voiceToEdit.id)}
                    className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceToEdit(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Save Voice Testimonial
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
