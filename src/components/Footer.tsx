import React from 'react';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';
import { WhatsAppIcon, WHATSAPP_DEFAULT_URL, WHATSAPP_PHONE } from './WhatsAppButton';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenOwnerModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenOwnerModal }) => {
  return (
    <footer className="bg-[#0D382B] text-slate-200 pt-16 pb-12 border-t border-[#184D3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="bg-[#F7F5EE] p-2.5 rounded-xl inline-block shadow-sm">
              <img
                src="/assets/aistudio/file_0000000018fc81f497e52944e9bf52e5_eee5e1aa.png"
                alt="Fluentia English Academy"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Empowering Egyptian and international learners to achieve spontaneous spoken fluency, executive confidence, and Cambridge-aligned communicative mastery.
            </p>
            <div className="text-xs text-slate-300/80 space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#A5C2AE] shrink-0" />
                <span>Online · New Alamein, Egypt</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A5C2AE] shrink-0" />
                <span>fluentia.academy.edu@gmail.com</span>
              </div>
              <a
                href={WHATSAPP_DEFAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
                title={`Chat on WhatsApp: ${WHATSAPP_PHONE}`}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0 fill-current" />
                <span className="font-mono tabular-nums">+20 1 20 57 9 3 4 20 ({WHATSAPP_PHONE})</span>
              </a>
            </div>
          </div>

          {/* Col 2: Academic Pathways */}
          <div>
            <h4 className="text-xs font-semibold text-[#A5C2AE] uppercase tracking-wider mb-4">
              Academic Programs
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  A1 – A2 Foundational Grammar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  B1 – B2 Intermediate Fluency
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  English for Tech & Multinational Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('speaking-club')}
                  className="hover:text-white transition-colors text-left"
                >
                  Fluency Speaking Club Immersion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  Personalized 1-on-1 Mentorship
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('placement-test')}
                  className="hover:text-white transition-colors text-left font-semibold text-[#D1E3D7]"
                >
                  Take Free CEFR Placement Test
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academy & Faculty */}
          <div>
            <h4 className="text-xs font-semibold text-[#A5C2AE] uppercase tracking-wider mb-4">
              Academy & Faculty
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('teachers')}
                  className="hover:text-white transition-colors text-left"
                >
                  Faculty Directory & Credentials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  Our Pedagogical Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  Student Support & Guidance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('backend-docs')}
                  className="hover:text-white transition-colors text-left text-slate-300"
                >
                  Supabase Schema & Vercel Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Safeguarding & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-[#A5C2AE] uppercase tracking-wider mb-4">
              Safeguarding & Governance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy & Data Rights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service & Code of Conduct
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors text-left text-[#D1E3D7]"
                >
                  Disclosed Administrative Oversight
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#184D3C] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Fluentia English Academy. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>CEFR Aligned Pedagogy</span>
            <span>·</span>
            <span>Online · New Alamein, Egypt</span>
            <span>·</span>
            <span>International Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
