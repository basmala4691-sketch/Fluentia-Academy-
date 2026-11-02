import React, { useState } from 'react';
import { PLACEMENT_QUESTIONS } from '../services/mockData';
import { CefrLevel, User } from '../types';
import { AcademyStore } from '../services/storage';
import { sendFormspreePayload } from '../services/formspree';
import {
  CheckCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';

interface PlacementTestProps {
  currentUser: User | null;
  onNavigateToCourses?: (level?: CefrLevel) => void;
  onCompleteToDashboard?: () => void;
  onExitTest?: () => void;
}

export const PlacementTest: React.FC<PlacementTestProps> = ({
  currentUser,
  onNavigateToCourses,
  onCompleteToDashboard,
  onExitTest,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedToProfile, setSavedToProfile] = useState(false);

  const currentQ = PLACEMENT_QUESTIONS[currentIdx];
  const total = PLACEMENT_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    PLACEMENT_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / total) * 100);
    let estimatedLevel: CefrLevel = 'A1';

    if (scorePct >= 85) estimatedLevel = 'C1';
    else if (scorePct >= 70) estimatedLevel = 'B2';
    else if (scorePct >= 50) estimatedLevel = 'B1';
    else if (scorePct >= 30) estimatedLevel = 'A2';
    else estimatedLevel = 'A1';

    return { correct, total, scorePct, estimatedLevel };
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    const { estimatedLevel, scorePct, correct } = calculateResults();

    if (currentUser && currentUser.role === 'student') {
      AcademyStore.updateStudentProfile({
        estimatedLevel,
        grammarScore: Math.min(100, scorePct + 4),
        vocabularyScore: scorePct,
      });
      setSavedToProfile(true);
    }

    AcademyStore.addAuditLog({
      action: 'PLACEMENT_TEST_COMPLETED',
      performedBy: currentUser ? currentUser.fullName : 'Guest Visitor',
      userRole: currentUser ? currentUser.role : 'guest',
      targetEntity: `Diagnostic Assessment (${scorePct}% - CEFR ${estimatedLevel})`,
      details: `User completed 12 diagnostic items. Estimated baseline: ${estimatedLevel}.`,
    });

    sendFormspreePayload({
      _subject: `🎯 Placement Test Completed: ${currentUser ? currentUser.fullName : 'Prospective Learner'} (Level ${estimatedLevel} - ${scorePct}%)`,
      category: 'Diagnostic Assessment Completed',
      learnerName: currentUser ? currentUser.fullName : 'Prospective Learner',
      learnerEmail: currentUser ? currentUser.email : 'Unauthenticated Visitor',
      learnerPhone: currentUser?.phone || 'N/A',
      accuracyScore: `${scorePct}%`,
      estimatedLevel: estimatedLevel,
      correctAnswers: `${correct} / ${total}`,
      message: `A learner completed the CEFR Diagnostic Test:\n\nScore: ${scorePct}%\nCorrect: ${correct}/${total}\nEstimated Level: ${estimatedLevel}\nUser: ${currentUser ? `${currentUser.fullName} (${currentUser.email})` : 'Prospective Student'}`,
    });
  };

  const restartTest = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setSavedToProfile(false);
  };

  if (isSubmitted) {
    const { correct, scorePct, estimatedLevel } = calculateResults();

    const levelDescriptions: Record<CefrLevel, string> = {
      A1: 'Beginner: You understand familiar everyday expressions and can introduce yourself. Focus on foundational tenses and basic word building.',
      A2: 'Elementary: You can communicate in routine tasks and describe past events. Focus on past tenses, connectors, and confidence in sentences.',
      B1: 'Intermediate: You understand the main points of clear standard speech and can enter into conversations unprepared. This is the optimal stage to join our Fluency Workshop and Speaking Club.',
      B2: 'Upper-Intermediate: You interact with a degree of fluency and spontaneity. You can produce clear, detailed text and explain a viewpoint on topical issues.',
      C1: 'Advanced: You express ideas fluently and spontaneously without much obvious searching for expressions. Ready for Executive Business and Debate Mastery.',
      C2: 'Mastery: Near-native command across nuanced contexts.',
    };

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-[#E3DFD3] p-8 my-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EBF2EE] text-[#0D382B] border border-[#D1E3D7] flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-[#3D6E57]" />
        </div>

        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
          Diagnostic Assessment Outcome
        </p>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
          Estimated CEFR Level: <span className="text-[#0D382B]">{estimatedLevel}</span>
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
          {levelDescriptions[estimatedLevel]}
        </p>

        {/* Score metrics */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6 p-4 bg-[#FAF8F5] rounded-xl border border-[#E3DFD3]">
          <div>
            <p className="text-xs text-slate-500">Correct Answers</p>
            <p className="text-lg font-bold text-[#0D382B] font-mono tabular-nums">
              {correct} <span className="text-xs font-normal text-slate-400">/ {total}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Accuracy Score</p>
            <p className="text-lg font-bold text-[#0D382B] font-mono tabular-nums">{scorePct}%</p>
          </div>
        </div>

        {/* Disclosed academic boundary */}
        <div className="p-3 bg-[#EBF2EE] border border-[#D1E3D7] rounded-xl text-left text-xs text-[#0D382B] mb-6 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-[#3D6E57] shrink-0 mt-0.5" />
          <span>
            <strong>Academic Note:</strong> This assessment provides an initial diagnostic estimate for Fluentia course placement. Official CEFR certification requires live oral examination and writing verification with an authorized Cambridge examiner.
          </span>
        </div>

        {savedToProfile && (
          <div className="mb-6 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Diagnostic estimate automatically synchronized with your Student Profile!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={restartTest}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Diagnostic</span>
          </button>

          {onExitTest && (
            <button
              onClick={onExitTest}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Exit Assessment</span>
            </button>
          )}

          {/* Primary Action Button: Explore {estimatedLevel} Courses */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToCourses) {
                onNavigateToCourses(estimatedLevel);
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0D382B] hover:bg-[#184D3C] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <span>Explore {estimatedLevel} Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onCompleteToDashboard && currentUser?.role === 'student' && (
            <button
              type="button"
              onClick={onCompleteToDashboard}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Go to My Learning Dashboard</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-[#E3DFD3] overflow-hidden my-6">
      {/* Test top bar */}
      <div className="bg-[#0D382B] px-6 py-4 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Fluentia Diagnostic Placement Test</h2>
          <p className="text-xs text-[#A5C2AE]">Grammar · Vocabulary · Reading · Situational English</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#D1E3D7] tabular-nums">
              Question {currentIdx + 1} of {total}
            </span>
            <div className="w-24 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-[#8CAE97] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
              />
            </div>
          </div>
          {onExitTest && (
            <button
              type="button"
              onClick={onExitTest}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#D1E3D7] hover:text-white rounded-lg text-xs font-medium transition-colors border border-white/10"
              title="Exit Diagnostic Test"
            >
              <X className="w-4 h-4" />
              <span>Exit Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="uppercase tracking-wider font-semibold text-slate-700">Section: {currentQ.section}</span>
          <span>·</span>
          <span>Target Level: {currentQ.level}</span>
        </div>

        {currentQ.context && (
          <div className="p-4 bg-[#FAF8F5] border border-[#E3DFD3] rounded-xl text-xs md:text-sm text-slate-700 leading-relaxed italic mb-5">
            {currentQ.context}
          </div>
        )}

        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswers[currentQ.id] === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(i)}
                className={`w-full p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#0D382B] bg-[#EBF2EE] ring-1 ring-[#0D382B]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono font-bold ${
                    isSelected ? 'bg-[#0D382B] text-white border-[#0D382B]' : 'border-slate-300 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-xs md:text-sm text-slate-800 leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous
            </button>
            {onExitTest && (
              <button
                type="button"
                onClick={onExitTest}
                className="px-3.5 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
              >
                Exit Test
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {answeredCount} of {total} Answered
          </span>

          {currentIdx === total - 1 ? (
            <button
              type="button"
              disabled={answeredCount < total}
              onClick={handleSubmitTest}
              className="px-5 py-2.5 bg-[#0D382B] text-white rounded-lg text-xs font-semibold hover:bg-[#184D3C] transition-colors disabled:opacity-40"
            >
              Submit & View Placement
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIdx((p) => Math.min(total - 1, p + 1))}
              className="px-5 py-2.5 bg-[#0D382B] text-white rounded-lg text-xs font-semibold hover:bg-[#184D3C] flex items-center gap-1.5 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
