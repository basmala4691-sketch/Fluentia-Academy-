/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course } from './types';
import { AcademyStore } from './services/storage';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { AuthModal } from './components/AuthModal';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { PlacementTest } from './components/PlacementTest';
import { FloatingWhatsAppButton } from './components/WhatsAppButton';

import { HomeView } from './views/HomeView';
import { CoursesView } from './views/CoursesView';
import { TeachersView } from './views/TeachersView';
import { SpeakingClubView } from './views/SpeakingClubView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { PrivacyTermsView } from './views/PrivacyTermsView';
import { StudentDashboard } from './views/StudentDashboard';
import { TeacherDashboard } from './views/TeacherDashboard';
import { OwnerDashboard } from './views/OwnerDashboard';
import { BackendDocsView } from './views/BackendDocsView';

import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => AcademyStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);
  const [courseFilterLevel, setCourseFilterLevel] = useState<string>('all');

  // Data states from store
  const [courses, setCourses] = useState(() => AcademyStore.getCourses());
  const [teachers, setTeachers] = useState(() => AcademyStore.getTeachers());
  const [clubs, setClubs] = useState(() => AcademyStore.getSpeakingClubs());

  const refreshAllData = () => {
    setCourses(AcademyStore.getCourses());
    setTeachers(AcademyStore.getTeachers());
    setClubs(AcademyStore.getSpeakingClubs());
    setCurrentUser(AcademyStore.getCurrentUser());
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setActiveTab('student-dashboard');
    } else if (user.role === 'teacher') {
      setActiveTab('teacher-dashboard');
    } else if (user.role === 'owner') {
      setActiveTab('owner-dashboard');
    }
    refreshAllData();
  };

  const handleOwnerLoginSuccess = (owner: User) => {
    setCurrentUser(owner);
    setActiveTab('owner-dashboard');
    refreshAllData();
  };

  const handleLogout = () => {
    AcademyStore.logout();
    setCurrentUser(null);
    setActiveTab('home');
    refreshAllData();
  };

  const handleNavigate = (tab: string) => {
    setUnauthorizedMessage(null);

    // Direct Protected Route Enforcement
    if (tab === 'owner-dashboard') {
      if (!currentUser || currentUser.role !== 'owner') {
        setUnauthorizedMessage('Unauthorized Route: Owner credentials required to access the Administrative Center.');
        setOwnerModalOpen(true);
        return;
      }
    }

    if (tab === 'teacher-dashboard') {
      if (!currentUser || currentUser.role !== 'teacher') {
        setUnauthorizedMessage('Please sign in with a faculty account to access the Teacher Portal.');
        handleOpenAuth('login');
        return;
      }
    }

    if (tab === 'student-dashboard') {
      if (!currentUser || currentUser.role !== 'student') {
        setUnauthorizedMessage('Please sign in with a student account to access the Student Portal.');
        handleOpenAuth('login');
        return;
      }
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (course: Course) => {
    setActiveTab('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800">
      {/* Testing role switcher bar for easy evaluation of all 5 roles */}
      <RoleSwitcherBar
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          refreshAllData();
        }}
        onOpenOwnerModal={() => setOwnerModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenOwnerModal={() => setOwnerModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Unauthorized Direct Route Protection Warning Banner */}
      {unauthorizedMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{unauthorizedMessage}</span>
            </div>
            <button
              onClick={() => setUnauthorizedMessage(null)}
              className="text-xs font-semibold text-red-900 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            courses={courses}
            teachers={teachers}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            onOpenPlacementTest={() => handleNavigate('placement-test')}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login')}
            onRefreshCourses={refreshAllData}
            initialFilterLevel={courseFilterLevel}
          />
        )}

        {activeTab === 'teachers' && (
          <TeachersView
            teachers={teachers}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {activeTab === 'speaking-club' && (
          <SpeakingClubView
            sessions={clubs}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login')}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'placement-test' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PlacementTest
              currentUser={currentUser}
              onNavigateToCourses={(level) => {
                if (level) {
                  setCourseFilterLevel(level);
                }
                handleNavigate('courses');
              }}
              onCompleteToDashboard={() => handleNavigate('student-dashboard')}
              onExitTest={() => handleNavigate('home')}
            />
          </div>
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'privacy' && <PrivacyTermsView initialTab="privacy" />}

        {activeTab === 'terms' && <PrivacyTermsView initialTab="terms" />}

        {activeTab === 'backend-docs' && <BackendDocsView />}

        {activeTab === 'student-dashboard' && currentUser?.role === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            onNavigateToCourses={() => handleNavigate('courses')}
            onNavigateToPlacementTest={() => handleNavigate('placement-test')}
            onNavigateToSpeakingClub={() => handleNavigate('speaking-club')}
          />
        )}

        {activeTab === 'teacher-dashboard' && currentUser?.role === 'teacher' && (
          <TeacherDashboard currentUser={currentUser} />
        )}

        {activeTab === 'owner-dashboard' && currentUser?.role === 'owner' && (
          <OwnerDashboard currentUser={currentUser} onRefreshData={refreshAllData} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenOwnerModal={() => setOwnerModalOpen(true)} />

      {/* Public Authentication Modal (Student & Teacher registration ONLY) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Discreet Owner Login Modal with Rate Limiting */}
      <OwnerLoginModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
        onSuccess={handleOwnerLoginSuccess}
      />

      {/* Floating Direct WhatsApp Button */}
      <FloatingWhatsAppButton />
    </div>
  );
}
