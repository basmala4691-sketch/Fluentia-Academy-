import React from 'react';
import { Award, ShieldCheck, Target } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider">
          Our Heritage & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0D382B]">
          Empowering the Voices of Egypt and the Global South
        </h1>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Fluentia English Academy was established to solve a widespread educational tragedy: hundreds of thousands of ambitious Egyptian engineers, doctors, entrepreneurs, and students possess years of textbook grammatical knowledge, yet feel paralyzed with anxiety when speaking English in multinational boardrooms or interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0D382B]">Task-Based Spoken Fluency</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We abandon mechanical fill-in-the-blank grammar drills. Every lesson is anchored in real communicative tasks: defending a product roadmap, resolving customer friction, and delivering spontaneous elevator pitches.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0D382B]">Bilingual Phonological Precision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our faculty understand the phonetic nuances of Egyptian Arabic. We specifically target the consonant clusters, vowel reductions, and rhythm anomalies that give Egyptian speakers anxiety, replacing tension with natural cadence.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#0D382B] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0D382B]">Rigorous Academic Standards</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All curriculum pathways are mapped strictly to the Common European Framework of Reference (CEFR) from A1 through C1, overseen by experienced language educators and applied curriculum specialists.
          </p>
        </div>
      </div>

      {/* Leadership Note */}
      <div className="bg-[#0D382B] text-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#184D3C]">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs uppercase tracking-wider text-[#A5C2AE] font-semibold font-mono">
            Founder & Academic Director’s Note
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            "Your accent is part of your identity. Your clarity is your passport."
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We do not believe in erasing cultural heritage or striving for an artificial caricature of native speech. We believe in unshakeable intelligibility, precise grammatical expression, rich vocabulary, and the internal poise that allows Egyptian talent to lead global organizations.
          </p>
          <div className="pt-4 border-t border-[#184D3C] flex items-center gap-3">
            <div>
              <p className="text-sm font-bold text-white">Basmala Ahmed</p>
              <p className="text-xs text-[#D1E3D7]">Founder & Academy Director · Fluentia English Academy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
