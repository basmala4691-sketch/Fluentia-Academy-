import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface PrivacyTermsViewProps {
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyTermsView: React.FC<PrivacyTermsViewProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'privacy'
              ? 'bg-[#0D382B] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0D382B]'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'terms'
              ? 'bg-[#0D382B] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0D382B]'
          }`}
        >
          Terms of Service
        </button>
      </div>

      {activeTab === 'privacy' ? (
        <div className="bg-white rounded-2xl border border-[#E3DFD3] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-mono font-semibold text-[#3D6E57] uppercase tracking-wider">
              Transparency & Safeguarding Policy
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
              Fluentia Academy Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 · Compliant with Egyptian Data Protection Law & Global Safeguarding Standards</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">1. Data Minimization & Collection Boundary</h2>
              <p>
                Fluentia English Academy collects only the personal information strictly required to facilitate educational instruction, course delivery, audio diagnostic evaluations, and user authentication. We never sell student information, commercialize audio recordings, or distribute personal files to third-party advertising brokers.
              </p>
            </section>

            {/* MANDATORY DISCLOSED ADMINISTRATIVE OVERSIGHT CLAUSE */}
            <section className="p-5 bg-[#EBF2EE] border border-[#D1E3D7] rounded-2xl space-y-3 text-[#0D382B]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0D382B]">
                <Shield className="w-5 h-5 text-[#3D6E57]" />
                <h3>2. Disclosed Administrative Oversight of Academy Communications</h3>
              </div>
              <p className="text-xs leading-relaxed">
                In strict accordance with academic safeguarding guidelines, child and young-adult protection standards, and dispute resolution protocols, <strong>authorized Fluentia Academy administrators may access and review sent platform messages and shared attachments between students and faculty.</strong>
              </p>
              <ul className="text-xs space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Authorized Purposes:</strong> Administrative access is permitted solely for safeguarding compliance, formal student-teacher disputes, pedagogical quality reviews, and support inquiries.
                </li>
                <li>
                  <strong>Immutable Audit Logging:</strong> Every instance of administrative access to a student-teacher conversation requires a recorded justification note and is permanently recorded in the academy’s tamper-evident audit log.
                </li>
                <li>
                  <strong>No Covert Surveillance:</strong> We do NOT capture unsent drafts, real-time keystrokes, camera feeds outside of scheduled sessions, or private user passwords.
                </li>
                <li>
                  <strong>Password Confidentiality:</strong> Authentication passwords are encrypted and salted; neither academy teachers nor the academy owner can view student passwords.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">3. Voice Recordings & Educational Submissions</h2>
              <p>
                Spoken audio recordings uploaded to the Speaking Practice portal are stored in protected storage buckets accessible exclusively to the student, their assigned teacher, and academic moderators. Audio files are utilized solely for pronunciation diagnostic feedback and progress tracking.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">4. Right to Deletion & Data Portability</h2>
              <p>
                Students may request full account deletion and removal of their media library records at any time through their settings or by contacting <span className="font-mono text-slate-800">privacy@fluentia.edu.eg</span>.
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3DFD3] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-mono font-semibold text-[#3D6E57] uppercase tracking-wider">
              Academic Agreement
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D382B] mt-1">
              Terms of Service & Code of Conduct
            </h1>
            <p className="text-xs text-slate-500 mt-1">Effective for all registered students, applicants, and faculty</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">1. Educational Community Standards</h2>
              <p>
                Fluentia Academy is dedicated to fostering an intellectually supportive, mutually respectful learning community. Harassment, discriminatory language, political antagonism, or disruptive behavior during live sessions or within direct messages will result in immediate suspension without refund.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">2. Lesson Scheduling & Cancellation Policy</h2>
              <p>
                One-on-one sessions must be cancelled or rescheduled at least 24 hours prior to the booked time. Speaking club seats must be released if a participant cannot attend to free capacity for learners on the waiting list.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">3. Faculty Accreditation & Independent Representation</h2>
              <p>
                Only teachers who have completed credential verification and owner approval are authorized to represent Fluentia Academy. Unapproved or pending teacher applicants may not solicit students privately or claim academy endorsement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0D382B]">4. Intellectual Property</h2>
              <p>
                All worksheets, phonological contrast guides, proprietary lesson recordings, and diagnostic question banks remain the exclusive intellectual property of Fluentia English Academy.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
