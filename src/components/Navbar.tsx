import React from 'react';
import { KeyRound, LayoutDashboard, LogOut } from 'lucide-react';
import { User } from '../types';
import { WhatsAppIcon, WHATSAPP_DEFAULT_URL, WHATSAPP_PHONE } from './WhatsAppButton';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenOwnerModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onNavigate,
  onOpenAuth,
  onOpenOwnerModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#E3DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Official Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group text-left"
          title="Fluentia English Academy"
        >
          <img
            src="/assets/aistudio/file_0000000018fc81f497e52944e9bf52e5_eee5e1aa.png"
            alt="Fluentia English Academy"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'home'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'courses'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => onNavigate('teachers')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'teachers'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Teachers
          </button>
          <button
            onClick={() => onNavigate('speaking-club')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'speaking-club'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Speaking Club
          </button>
          <button
            onClick={() => onNavigate('placement-test')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'placement-test'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Placement Test
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'about'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            About
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 ${
              activeTab === 'contact'
                ? 'text-[#0D382B] border-b-2 border-[#0D382B] font-bold'
                : 'hover:text-[#0D382B]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Actions + Discreet Owner Key Icon */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Direct WhatsApp Link */}
          <a
            href={WHATSAPP_DEFAULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors duration-150 shadow-xs cursor-pointer"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
          </a>

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (currentUser.role === 'student') onNavigate('student-dashboard');
                  else if (currentUser.role === 'teacher') onNavigate('teacher-dashboard');
                  else if (currentUser.role === 'owner') onNavigate('owner-dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D382B] text-[#D1E3D7] text-xs font-semibold rounded-lg hover:bg-[#184D3C] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>
                  {currentUser.role === 'owner'
                    ? 'Owner Dashboard'
                    : currentUser.role === 'teacher'
                    ? 'Teacher Portal'
                    : 'Student Dashboard'}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-[#0D382B] hover:text-[#184D3C] px-3.5 py-2 transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 bg-[#0D382B] text-white text-xs font-semibold rounded-lg hover:bg-[#184D3C] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
