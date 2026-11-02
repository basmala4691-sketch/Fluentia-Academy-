import React from 'react';
import { User } from '../types';
import { AcademyStore } from '../services/storage';
import { ShieldCheck, UserCheck, Clock, KeyRound, Database, RefreshCw } from 'lucide-react';

interface RoleSwitcherBarProps {
  currentUser: User | null;
  onSelectUser: (user: User | null) => void;
  onOpenOwnerModal: () => void;
  onNavigate: (tab: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSelectUser,
  onOpenOwnerModal,
  onNavigate,
}) => {
  const users = AcademyStore.getUsers();

  const handleSwitch = (email: string | null) => {
    if (!email) {
      AcademyStore.setCurrentUser(null);
      onSelectUser(null);
      onNavigate('home');
      return;
    }
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      AcademyStore.setCurrentUser(found);
      onSelectUser(found);
      if (found.role === 'student') onNavigate('student-dashboard');
      else if (found.role === 'teacher') onNavigate('teacher-dashboard');
      else if (found.role === 'owner') onNavigate('owner-dashboard');
    }
  };

  const isOwner = currentUser?.role === 'owner';

  // The student Nour, approved teacher Dr. Amina, and pending teacher Youssef icons
  // only appear when logged in as Owner.
  if (!isOwner) {
    return null;
  }

  return (
    <aside aria-label="Owner Role Switcher Bar" className="bg-[#08261D] border-b border-[#184D3C] text-slate-300 text-xs py-1.5 px-4 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A5C2AE] font-semibold flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#8CAE97]" />
            <span>Owner Privileged Simulation:</span>
          </span>
          <span className="text-slate-400 text-[11px]">Inspect active portal views across academy roles</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleSwitch('fluentia.academy.edu@gmail.com')}
            className={`px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
              currentUser?.email === 'fluentia.academy.edu@gmail.com'
                ? 'bg-[#4E7C65] text-white font-semibold shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-[#D1E3D7]'
            }`}
          >
            <KeyRound className="w-3 h-3 text-[#A5C2AE]" />
            <span>Owner Dashboard</span>
          </button>

          <button
            onClick={() => handleSwitch('nour.khalil@gmail.com')}
            className="px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/15 text-slate-200"
            title="Inspect as Student Nour Khalil"
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>Student (Nour)</span>
          </button>

          <button
            onClick={() => handleSwitch('amina.elsayed@fluentia.edu.eg')}
            className="px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/15 text-slate-200"
            title="Inspect as Approved Faculty Dr. Amina El-Sayed"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Approved Teacher (Dr. Amina)</span>
          </button>

          <button
            onClick={() => handleSwitch('youssef.kamal@gmail.com')}
            className="px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/15 text-amber-200"
            title="Inspect as Pending Teacher Youssef Kamal"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending Teacher (Youssef)</span>
          </button>

          <span className="text-white/20 mx-1">|</span>

          <button
            onClick={() => onNavigate('backend-docs')}
            className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 font-mono"
            title="Supabase Schema & Vercel Deployment Documentation"
          >
            <Database className="w-3 h-3 text-[#A5C2AE]" />
            <span>Vercel & SQL Specs</span>
          </button>

          <button
            onClick={() => handleSwitch(null)}
            className="px-2 py-0.5 rounded text-[11px] bg-red-950/60 hover:bg-red-900 text-red-200 ml-1 transition-colors"
            title="Exit Owner Mode"
          >
            Exit Owner Mode
          </button>
        </div>
      </div>
    </aside>
  );
};
