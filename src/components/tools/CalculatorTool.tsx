import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';

export const CalculatorTool: React.FC = () => {
  const { themeConfig } = useStudy();
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleCalcDigit = (digit: string) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(digit);
      setCalcWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? digit : calcDisplay + digit);
    }
  };

  const handleCalcDecimal = () => {
    if (calcWaitingForOperand) {
      setCalcDisplay('0.');
      setCalcWaitingForOperand(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrevValue(null);
    setCalcOp(null);
    setCalcWaitingForOperand(false);
  };

  const handleCalcBackspace = () => {
    if (calcWaitingForOperand) return;
    if (calcDisplay.length === 1 || (calcDisplay.length === 2 && calcDisplay.startsWith('-'))) {
      setCalcDisplay('0');
    } else {
      setCalcDisplay(calcDisplay.slice(0, -1));
    }
  };

  const handleCalcPercentage = () => {
    const value = parseFloat(calcDisplay);
    if (!isNaN(value)) {
      setCalcDisplay(String(value / 100));
    }
  };

  const handleCalcOperator = (nextOp: string) => {
    const inputValue = parseFloat(calcDisplay);

    if (calcPrevValue === null) {
      setCalcPrevValue(inputValue);
    } else if (calcOp && !calcWaitingForOperand) {
      const current = calcPrevValue || 0;
      let result = 0;
      switch (calcOp) {
        case '+': result = current + inputValue; break;
        case '-': result = current - inputValue; break;
        case '×': result = current * inputValue; break;
        case '÷': result = inputValue !== 0 ? current / inputValue : 0; break;
        default: result = inputValue;
      }
      setCalcDisplay(String(result));
      setCalcPrevValue(result);
      setCalcHistory([`${current} ${calcOp} ${inputValue} = ${result}`, ...calcHistory.slice(0, 4)]);
    }

    setCalcWaitingForOperand(true);
    setCalcOp(nextOp);
  };

  const handleCalcEquals = () => {
    const inputValue = parseFloat(calcDisplay);

    if (calcOp && calcPrevValue !== null && !calcWaitingForOperand) {
      let result = 0;
      switch (calcOp) {
        case '+': result = calcPrevValue + inputValue; break;
        case '-': result = calcPrevValue - inputValue; break;
        case '×': result = calcPrevValue * inputValue; break;
        case '÷': result = inputValue !== 0 ? calcPrevValue / inputValue : 0; break;
        default: result = inputValue;
      }
      setCalcDisplay(String(result));
      setCalcHistory([`${calcPrevValue} ${calcOp} ${inputValue} = ${result}`, ...calcHistory.slice(0, 4)]);
      setCalcPrevValue(null);
      setCalcOp(null);
      setCalcWaitingForOperand(true);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 max-w-sm mx-auto shadow-xl space-y-4 animate-in fade-in">
      {/* Display & Mini History */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/90 text-right">
        <div className="h-4 text-[11px] font-mono-numbers text-neutral-500 truncate mb-1">
          {calcHistory.length > 0 ? calcHistory[0] : ''}
        </div>
        <div className="text-3xl sm:text-4xl font-black font-mono-numbers text-neutral-100 tracking-tight overflow-x-auto">
          {calcDisplay}
        </div>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono-numbers">
        <button
          onClick={handleCalcClear}
          className="py-3 rounded-xl bg-neutral-800 text-rose-400 hover:bg-neutral-700 transition-colors"
        >
          AC
        </button>
        <button
          onClick={handleCalcBackspace}
          className="py-3 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
        >
          ⌫
        </button>
        <button
          onClick={handleCalcPercentage}
          className="py-3 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
        >
          %
        </button>
        <button
          onClick={() => handleCalcOperator('÷')}
          className="py-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors text-base"
        >
          ÷
        </button>

        <button onClick={() => handleCalcDigit('7')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">7</button>
        <button onClick={() => handleCalcDigit('8')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">8</button>
        <button onClick={() => handleCalcDigit('9')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">9</button>
        <button onClick={() => handleCalcOperator('×')} className="py-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors text-base">×</button>

        <button onClick={() => handleCalcDigit('4')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">4</button>
        <button onClick={() => handleCalcDigit('5')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">5</button>
        <button onClick={() => handleCalcDigit('6')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">6</button>
        <button onClick={() => handleCalcOperator('-')} className="py-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors text-base">-</button>

        <button onClick={() => handleCalcDigit('1')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">1</button>
        <button onClick={() => handleCalcDigit('2')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">2</button>
        <button onClick={() => handleCalcDigit('3')} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">3</button>
        <button onClick={() => handleCalcOperator('+')} className="py-3 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors text-base">+</button>

        <button onClick={() => handleCalcDigit('0')} className="col-span-2 py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">0</button>
        <button onClick={handleCalcDecimal} className="py-3 rounded-xl bg-neutral-950 text-neutral-100 hover:bg-neutral-800 transition-colors">.</button>
        <button
          onClick={handleCalcEquals}
          className="py-3 rounded-xl font-black transition-colors text-base"
          style={{ backgroundColor: themeConfig.hex, color: '#0a0a0a' }}
        >
          =
        </button>
      </div>
    </div>
  );
};
