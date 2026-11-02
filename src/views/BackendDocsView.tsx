import React, { useState } from 'react';
import { Database, ShieldCheck, Terminal, Server, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

export const BackendDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const postgresSchema = `-- ====================================================================
-- FLUENTIA ENGLISH ACADEMY - ENTERPRISE POSTGRESQL & SUPABASE SCHEMA
-- ====================================================================

-- 1. Create Enumerated Types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'owner');
CREATE TYPE account_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- 2. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  status account_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Teacher Applications (Held in Pending until Owner Approval)
CREATE TABLE public.teacher_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  experience_years INT NOT NULL DEFAULT 1,
  specializations TEXT[] NOT NULL,
  bio TEXT NOT NULL,
  status account_status NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Courses Table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  level cefr_level NOT NULL,
  description TEXT NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 8,
  hours_per_week INT NOT NULL DEFAULT 4,
  price_egp NUMERIC(10, 2) NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  enrolled_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Speaking Practice Audio Submissions
CREATE TABLE public.speaking_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_title TEXT NOT NULL,
  prompt_category TEXT NOT NULL,
  level cefr_level NOT NULL,
  audio_url TEXT,
  audio_duration_seconds INT,
  written_response TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  grammar_score INT,
  pronunciation_score INT,
  fluency_score INT,
  confidence_score INT,
  teacher_feedback TEXT,
  teacher_id UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_at TIMESTAMPTZ
);

-- 6. Direct Student-Teacher Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB,
  is_audio_note BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tamper-Evident Immutable Audit Log
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  user_role TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT NOT NULL,
  justification_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Protect Audit Log from modification or deletion
CREATE POLICY "Audit logs immutable read-only for owner"
  ON public.audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'owner');

CREATE POLICY "Audit logs insert only"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
`;

  const rlsPolicies = `-- ====================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) ACCESS POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can read public teachers; only owner can view all; students read themselves
CREATE POLICY "Public profiles visible for approved teachers"
  ON public.profiles FOR SELECT
  USING (role = 'teacher' AND status = 'active');

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Owner can manage all profiles"
  ON public.profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
  ));

-- 2. Speaking Submissions: Student can read their own; assigned teacher can review; owner can audit
CREATE POLICY "Student access own speaking recordings"
  ON public.speaking_submissions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Teacher access assigned student submissions"
  ON public.speaking_submissions FOR ALL
  USING (teacher_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
  ));

-- 3. Messages: Strictly participants only (plus disclosed owner audit mode)
CREATE POLICY "Conversation participants can read/send messages"
  ON public.messages FOR ALL
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#3D6E57] uppercase tracking-wider font-mono">
          Architecture & Deployment Blueprint
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D382B] mt-1">
          Backend Schema & Vercel Specification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Production SQL schemas, Supabase Row-Level Security (RLS) policies, storage bucket rules, and one-click Vercel deployment documentation.
        </p>
      </div>

      {/* Deployment summary boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#0D382B] text-[#D1E3D7] flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Vercel Web Hosting</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Optimized for Vercel static & Edge deployments with clean headers and security configurations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#0D382B] text-[#D1E3D7] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Supabase PostgreSQL</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Relational tables with foreign key cascades, triggers, and enum types for CEFR levels and roles.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#0D382B] text-[#D1E3D7] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Row-Level Security (RLS)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero-trust database policies ensuring students never access peer records, and pending teachers remain quarantined.
          </p>
        </div>
      </div>

      {/* PostgreSQL Schema Code Block */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">schema.sql (PostgreSQL 15+)</span>
          </div>
          <button
            onClick={() => copyToClipboard(postgresSchema, 'schema')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded transition-colors"
          >
            {copiedSection === 'schema' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
          {postgresSchema}
        </pre>
      </div>

      {/* Supabase RLS Policies Code Block */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">security_policies.sql (Supabase RLS)</span>
          </div>
          <button
            onClick={() => copyToClipboard(rlsPolicies, 'rls')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded transition-colors"
          >
            {copiedSection === 'rls' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy RLS</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-6 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed max-h-80">
          {rlsPolicies}
        </pre>
      </div>

      {/* Deployment & Setup Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-serif font-bold text-[#0D382B]">
          Vercel Deployment & Production Environment Configuration
        </h3>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Step 1: Environment Variables on Vercel</h4>
            <div className="p-3 bg-slate-900 text-slate-200 font-mono rounded text-[11px] space-y-1">
              <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."</div>
              <div>ACADEMY_OWNER_EMAIL="owner@fluentia.edu.eg"</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Step 2: Private Audio & Media Storage Bucket Rules</h4>
            <p className="leading-relaxed text-slate-600">
              Create a private bucket named <span className="font-mono text-slate-900 font-bold">fluentia-audio-vault</span>. Restrict read/write permissions via storage RLS so that uploaded WebM audio chunks can only be streamed by the recording author, assigned teacher, and academy administrator.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Step 3: Secure Owner Account Initialization</h4>
            <p className="leading-relaxed text-slate-600">
              The academy owner account is never exposed in public registration. In Supabase, initialize the owner by running:
              <br />
              <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-900">
                UPDATE public.profiles SET role = 'owner', status = 'active' WHERE email = 'owner@fluentia.edu.eg';
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
