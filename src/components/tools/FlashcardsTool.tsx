import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Plus, Trash2, RotateCw, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { FlashcardItem } from '../../types';

export const FlashcardsTool: React.FC = () => {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard, subjects, themeConfig } = useStudy();
  const [isAdding, setIsAdding] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    addFlashcard(front.trim(), back.trim(), subjectId || undefined);
    setFront('');
    setBack('');
    setIsAdding(false);
  };

  const currentCard = flashcards.length > 0 ? flashcards[Math.min(activeCardIndex, flashcards.length - 1)] : null;

  const handleNext = (mastered: boolean) => {
    if (currentCard) {
      updateFlashcard(currentCard.id, {
        masteryLevel: mastered ? Math.min(5, (currentCard.masteryLevel || 0) + 1) : Math.max(0, (currentCard.masteryLevel || 0) - 1),
        nextReviewDate: new Date(Date.now() + (mastered ? 86400000 * 2 : 3600000)).toISOString().split('T')[0],
      });
    }
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-neutral-200">Active Recall Flashcards</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {flashcards.length} cards in deck • Spaced repetition test
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-opacity"
          style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close' : 'Add Card'}</span>
        </button>
      </div>

      {/* Add Card Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-neutral-200">New Flashcard</div>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <textarea
            rows={2}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front (Question / Formula / Term)..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none font-mono"
            required
          />

          <textarea
            rows={3}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back (Answer / Explanation / Key Definition)..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none font-mono"
            required
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg font-bold text-xs"
              style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
            >
              Save Card
            </button>
          </div>
        </form>
      )}

      {/* Interactive Flashcard Deck View */}
      {flashcards.length === 0 ? (
        <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
          No flashcards created yet. Create active recall cards for formulas, vocabulary, or concepts!
        </div>
      ) : currentCard ? (
        <div className="space-y-4">
          {/* Active Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 cursor-pointer flex flex-col justify-between transition-all duration-300 select-none shadow-xl relative"
          >
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Card {activeCardIndex + 1} of {flashcards.length}</span>
              <span className="flex items-center gap-1 font-mono">
                <RotateCw className="w-3 h-3" />
                Tap to flip ({isFlipped ? 'Answer' : 'Question'})
              </span>
            </div>

            <div className="text-center py-6">
              <div className="text-base sm:text-lg font-bold text-neutral-100 leading-relaxed font-mono">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
              <span>Mastery: Level {currentCard.masteryLevel || 0}/5</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFlashcard(currentCard.id);
                }}
                className="text-neutral-600 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Self-Rating Response Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 py-3 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Need Review</span>
            </button>

            <button
              onClick={() => handleNext(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-900/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mastered (+1)</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
