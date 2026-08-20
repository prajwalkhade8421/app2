import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import { TodoItem } from '../../types';

export const TodoTool: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, subjects, themeConfig } = useStudy();
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newEstMinutes, setNewEstMinutes] = useState('30');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const est = parseInt(newEstMinutes, 10) || undefined;
    addTodo(newTitle.trim(), newSubjectId || undefined, newPriority, est);
    setNewTitle('');
    setIsAdding(false);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 border border-rose-800/60 text-rose-300">High</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-300">Med</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-400">Low</span>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header & Progress */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-neutral-200">Study Task Checklist</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {completedCount} of {todos.length} completed ({progressPercent}%)
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-opacity"
          style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close' : 'Add Task'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      {todos.length > 0 && (
        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: themeConfig.hex }}
          />
        </div>
      )}

      {/* Inline Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-neutral-200">New Study Task</div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you need to do? (e.g. Chapter 4 Practice Problems...)"
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            autoFocus
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Subject selector */}
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Subject</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="">General</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Est Minutes */}
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1">Est. Minutes</label>
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={newEstMinutes}
                onChange={(e) => setNewEstMinutes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
              />
            </div>
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
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-center text-xs text-neutral-500">
            No tasks found in this view.
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const subj = subjects.find((s) => s.id === todo.subjectId);
            return (
              <div
                key={todo.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  todo.completed
                    ? 'bg-neutral-950/60 border-neutral-900 opacity-60'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="shrink-0 text-neutral-400 hover:text-neutral-100 transition-colors"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-600 hover:text-neutral-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        todo.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {todo.title}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {subj && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subj.color }} />
                          {subj.name}
                        </span>
                      )}
                      {getPriorityBadge(todo.priority)}
                      {todo.estimatedMinutes && (
                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {todo.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 text-neutral-600 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
