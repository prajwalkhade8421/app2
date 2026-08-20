import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Target, CheckSquare, Sparkles, Layers, FileText, Timer, Calculator, Calendar } from 'lucide-react';
import { TodoTool } from './tools/TodoTool';
import { TopicsTool } from './tools/TopicsTool';
import { SoundscapesTool } from './tools/SoundscapesTool';
import { FlashcardsTool } from './tools/FlashcardsTool';
import { StopwatchTool } from './tools/StopwatchTool';
import { CalculatorTool } from './tools/CalculatorTool';
import { NotesTool } from './tools/NotesTool';
import { CalendarTool } from './tools/CalendarTool';

export const ToolsScreen: React.FC = () => {
  const { themeConfig } = useStudy();
  const [activeTool, setActiveTool] = useState<
    'calendar' | 'topics' | 'todos' | 'soundscapes' | 'flashcards' | 'notes' | 'stopwatch' | 'calculator'
  >('calendar');

  const TOOLS_TABS = [
    { id: 'calendar', label: 'Study Calendar', icon: Calendar },
    { id: 'topics', label: 'Target Topics', icon: Target },
    { id: 'todos', label: 'To-Do List', icon: CheckSquare },
    { id: 'soundscapes', label: 'Soundscapes', icon: Sparkles },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
  ] as const;

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: themeConfig.hex }}
        >
          PRODUCTIVITY SUITE
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 font-heading">
          Study Tools
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Real-time calendar schedule, syllabus targets, task checklists, ambient soundscapes & utilities
        </p>
      </div>

      {/* Tool Navigation Horizontal Scrollable Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
        {TOOLS_TABS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive ? 'font-bold shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                backgroundColor: isActive ? themeConfig.hex : undefined,
                color: isActive ? '#0a0a0a' : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TOOL CONTENT */}
      {activeTool === 'calendar' && <CalendarTool />}
      {activeTool === 'topics' && <TopicsTool />}
      {activeTool === 'todos' && <TodoTool />}
      {activeTool === 'soundscapes' && <SoundscapesTool />}
      {activeTool === 'flashcards' && <FlashcardsTool />}
      {activeTool === 'notes' && <NotesTool />}
      {activeTool === 'stopwatch' && <StopwatchTool />}
      {activeTool === 'calculator' && <CalculatorTool />}
    </div>
  );
};
