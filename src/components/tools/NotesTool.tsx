import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Plus, Trash2, Edit3, Search, Check } from 'lucide-react';
import { formatDatePretty } from '../../utils/time';
import { NoteItem } from '../../types';

export const NotesTool: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, subjects, themeConfig } = useStudy();
  const [searchNote, setSearchNote] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubjId, setNoteSubjId] = useState('');

  const startCreateNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteSubjId('');
    setIsCreatingNote(true);
  };

  const startEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubjId(note.subjectId || '');
    setIsCreatingNote(true);
  };

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNoteId) {
      updateNote(editingNoteId, noteTitle.trim(), noteContent.trim(), noteSubjId || undefined);
    } else {
      addNote(noteTitle.trim(), noteContent.trim(), noteSubjId || undefined);
    }

    setIsCreatingNote(false);
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchNote.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.subjectName && n.subjectName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Notes Header & New Button */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 mr-2">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNote}
            onChange={(e) => setSearchNote(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>
        <button
          onClick={startCreateNote}
          className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Create / Edit Note Modal/Inline Form */}
      {isCreatingNote && (
        <form onSubmit={saveNote} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3 animate-in fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200">
              {editingNoteId ? 'Edit Study Note' : 'Create Study Note'}
            </span>
            <select
              value={noteSubjId}
              onChange={(e) => setNoteSubjId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="">No Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note Title / Topic..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
            required
            autoFocus
          />

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Formulas, key concepts, reminders..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none font-mono"
            required
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingNote(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
              style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
            No study notes found. Create one above!
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">{note.title}</h4>
                  {note.subjectName && (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                      {note.subjectName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditNote(note)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-300 whitespace-pre-wrap font-mono leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-900">
                {note.content}
              </p>

              <div className="text-[10px] text-neutral-500 pt-1">
                Updated {formatDatePretty(note.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
