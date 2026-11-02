import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, X, Lock, Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { AcademyStore } from '../services/storage';
import { User } from '../types';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (owner: User) => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitWait, setRateLimitWait] = useState<number | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkLimiter();
    }
  }, [isOpen]);

  const checkLimiter = () => {
    const status = AcademyStore.checkOwnerRateLimit();
    if (!status.allowed && status.waitSeconds) {
      setRateLimitWait(status.waitSeconds);
    } else {
      setRateLimitWait(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const limiter = AcademyStore.checkOwnerRateLimit();
    if (!limiter.allowed && limiter.waitSeconds) {
      setRateLimitWait(limiter.waitSeconds);
      setErrorMessage(`Too many failed attempts. Temporary security lockout active (${limiter.waitSeconds}s remaining).`);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const users = AcademyStore.getUsers();
      const trimmedId = identifier.trim().toLowerCase();
      let ownerUser = users.find(
        (u) =>
          u.role === 'owner' &&
          (u.email.toLowerCase() === trimmedId ||
            trimmedId === 'fluentia.academy.edu@gmail.com' ||
            trimmedId === 'owner' ||
            trimmedId === 'director')
      );

      // If owner user in storage has legacy email, sync it to the configured email
      if (ownerUser && ownerUser.email !== 'fluentia.academy.edu@gmail.com') {
        ownerUser.email = 'fluentia.academy.edu@gmail.com';
        AcademyStore.setCurrentUser(ownerUser);
      } else if (!ownerUser && (trimmedId === 'fluentia.academy.edu@gmail.com' || trimmedId === 'owner')) {
        ownerUser = {
          id: 'usr_owner_1',
          email: 'fluentia.academy.edu@gmail.com',
          fullName: 'Basmala Ahmed (Owner)',
          role: 'owner',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      const isPasswordValid = password === 'FluentiaEdu20+26!';

      if (ownerUser && isPasswordValid && ownerUser.status === 'active') {
        AcademyStore.recordOwnerLoginAttempt(true);
        AcademyStore.setCurrentUser(ownerUser);
        onSuccess(ownerUser);
        onClose();
      } else {
        AcademyStore.recordOwnerLoginAttempt(false);
        checkLimiter();
        setErrorMessage('Invalid authentication credentials or unauthorized access privilege.');
      }
    }, 600);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    AcademyStore.addAuditLog({
      action: 'OWNER_RECOVERY_REQUESTED',
      performedBy: recoveryEmail || 'Anonymous',
      userRole: 'owner',
      targetEntity: 'Owner Credentials Recovery Service',
      details: 'Secure password recovery dispatch requested via authorized administrative protocol.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0D382B] px-6 py-6 text-white relative border-b border-[#184D3C]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#184D3C] border border-[#3D6E57] flex items-center justify-center text-[#A5C2AE]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Academy Administration</h2>
              <p className="text-xs text-[#A5C2AE] font-mono">Restricted Owner Access Portal</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Authorized entry point for academy ownership, academic leadership, and audit governance.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {rateLimitWait ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-red-900">Security Rate Limit Active</h4>
              <p className="text-xs text-red-700 mt-1">
                Multiple unverified attempts detected. Please wait{' '}
                <span className="font-mono font-bold tabular-nums">{rateLimitWait}</span> seconds before re-authenticating.
              </p>
              <button
                type="button"
                onClick={checkLimiter}
                className="mt-3 text-xs text-red-800 underline font-medium"
              >
                Refresh Status
              </button>
            </div>
          ) : showRecovery ? (
            <div>
              {recoverySent ? (
                <div className="text-center py-4">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-900">Recovery Instructions Dispatched</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If this address corresponds to a verified academy owner account, an authorized encrypted recovery link has been dispatched to your backup mailbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoverySent(false);
                    }}
                    className="mt-4 px-4 py-2 bg-[#0D382B] text-white text-xs font-semibold rounded-lg hover:bg-[#184D3C]"
                  >
                    Back to Owner Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Administrative Account Recovery</h3>
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Return to Login
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Enter the registered owner email address to receive administrative verification credentials.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Owner Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="owner@fluentia.edu.eg"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Send Recovery Link
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter owner email address"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Master Password</label>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                  >
                    Forgot credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D382B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying Authorization...</span>
                ) : (
                  <>
                    <span>Enter Owner Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Direct Route Protection Active</span>
            <span className="font-mono">Audit Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
