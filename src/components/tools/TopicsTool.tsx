import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Plus, Trash2, CheckCircle2, Circle, Target, BookOpen, Clock, Check } from 'lucide-react';
import { TargetTopic } from '../../types';

export const TopicsTool: React.FC = () => {
  const { targetTopics, addTargetTopic, updateTargetTopic, deleteTargetTopic, subjects, themeConfig } = useStudy();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [estimatedCycles, setEstimatedCycles] = useState('2');
  const [checkpointsText, setCheckpointsText] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const checkpoints = checkpointsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((text, idx) => ({ id: `cp-${Date.now()}-${idx}`, text, completed: false }));

    addTargetTopic({
      title: title.trim(),
      subjectId: subjectId || undefined,
      estimatedCycles: parseInt(estimatedCycles, 10) || 1,
      targetDate,
      checkpoints: checkpoints.length > 0 ? checkpoints : undefined,
    });

    setTitle('');
    setCheckpointsText('');
    setIsAdding(false);
  };

  const handleToggleCheckpoint = (topicId: string, checkpointId: string) => {
    const topic = targetTopics.find((t) => t.id === topicId);
    if (!topic || !topic.checkpoints) return;

    const updatedCheckpoints = topic.checkpoints.map((cp) =>
      cp.id === checkpointId ? { ...cp, completed: !cp.completed } : cp
    );

    const allDone = updatedCheckpoints.every((cp) => cp.completed);
    updateTargetTopic(topicId, {
      checkpoints: updatedCheckpoints,
      status: allDone ? 'completed' : topic.status === 'completed' ? 'in_progress' : topic.status,
    });
  };

  const handleToggleTopicStatus = (topicId: string) => {
    const topic = targetTopics.find((t) => t.id === topicId);
    if (!topic) return;
    const nextStatus = topic.status === 'completed' ? 'in_progress' : 'completed';
    updateTargetTopic(topicId, { status: nextStatus });
  };

  const completedTopics = targetTopics.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header & Stats */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-neutral-200">Today's Target Topics & Syllabus</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {completedTopics} of {targetTopics.length} targets mastered today
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-opacity"
          style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close' : 'Add Target Topic'}</span>
        </button>
      </div>

      {/* Add Topic Modal / Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-neutral-200">New Target Topic</div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic Name (e.g. Thermodynamics Laws, Newton's Kinematics...)"
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Subject</label>
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
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Est. Cycles (1hr ea)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={estimatedCycles}
                onChange={(e) => setEstimatedCycles(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 block mb-1">
              Sub-checkpoints / Concepts (1 per line, optional)
            </label>
            <textarea
              rows={3}
              value={checkpointsText}
              onChange={(e) => setCheckpointsText(e.target.value)}
              placeholder="1. First Law formulas&#10;2. Isobaric vs Adiabatic graphs&#10;3. Solve 5 textbook numericals"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none font-mono"
            />
          </div>

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
              Save Target
            </button>
          </div>
        </form>
      )}

      {/* Target Topics List */}
      <div className="space-y-3">
        {targetTopics.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
            No target topics added for today yet. Add the concepts you plan to conquer!
          </div>
        ) : (
          targetTopics.map((topic) => {
            const subj = subjects.find((s) => s.id === topic.subjectId);
            const isCompleted = topic.status === 'completed';
            const checkpoints = topic.checkpoints || [];
            const completedCps = checkpoints.filter((c) => c.completed).length;

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-neutral-950/60 border-neutral-900 opacity-60'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTopicStatus(topic.id)}
                      className="mt-0.5 shrink-0 text-neutral-400 hover:text-neutral-100 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-600 hover:text-neutral-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                        }`}
                      >
                        {topic.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {subj && (
                          <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subj.color }} />
                            {subj.name}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono">
                          Target: {topic.targetDate}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono">
                          {topic.completedCycles || 0}/{topic.estimatedCycles} Cycles
                        </span>
                        {checkpoints.length > 0 && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {completedCps}/{checkpoints.length} sub-tasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTargetTopic(topic.id)}
                    className="p-1.5 text-neutral-600 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub checkpoints list */}
                {checkpoints.length > 0 && (
                  <div className="pl-8 space-y-1.5 pt-1 border-t border-neutral-800/40">
                    {checkpoints.map((cp) => (
                      <button
                        key={cp.id}
                        onClick={() => handleToggleCheckpoint(topic.id, cp.id)}
                        className="w-full flex items-center gap-2 text-left group"
                      >
                        {cp.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            cp.completed ? 'line-through text-neutral-500' : 'text-neutral-300'
                          }`}
                        >
                          {cp.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
