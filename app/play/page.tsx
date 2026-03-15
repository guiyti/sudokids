'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore, Cell } from '@/lib/store';
import { generateSudoku, Board } from '@/lib/sudoku';
import { ArrowLeft, Timer, Undo, Eraser, Edit3, Lightbulb, Frown } from 'lucide-react';
import confetti from 'canvas-confetti';

const numberColors = [
  'text-red-600 bg-red-100 border-red-200',
  'text-orange-600 bg-orange-100 border-orange-200',
  'text-yellow-600 bg-yellow-100 border-yellow-200',
  'text-green-600 bg-green-100 border-green-200',
  'text-blue-600 bg-blue-100 border-blue-200',
  'text-purple-600 bg-purple-100 border-purple-200',
  'text-pink-600 bg-pink-100 border-pink-200',
  'text-fuchsia-600 bg-fuchsia-100 border-fuchsia-200',
  'text-slate-600 bg-slate-100 border-slate-200'
];

const pureColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-400',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-rainbow-stripes',
  'bg-pink-400',
  'bg-slate-400'
];

const blockColors = [
  'bg-red-50/50', 'bg-blue-50/50', 'bg-green-50/50',
  'bg-yellow-50/50', 'bg-purple-50/50', 'bg-orange-50/50',
  'bg-pink-50/50', 'bg-teal-50/50', 'bg-indigo-50/50'
];

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <Play />
    </Suspense>
  );
}

function Play() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = parseInt(searchParams.get('level') || '1');
  const difficulty = (searchParams.get('diff') || 'very_easy') as 'very_easy' | 'easy' | 'medium' | 'hard';
  
  const { incrementCompletedGames, gameMode, currentGame, saveCurrentGame, clearCurrentGame } = useGameStore();

  const [board, setBoard] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState<{r: number, c: number, prev: number | null}[]>([]);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [lastMistakeAlert, setLastMistakeAlert] = useState(0);

  useEffect(() => {
    if (currentGame && currentGame.level === level) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBoard(currentGame.board);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSolution(currentGame.solution);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(currentGame.history);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMistakes(currentGame.mistakes);
    } else {
      const { puzzle, solution } = generateSudoku(difficulty);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSolution(solution);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBoard(puzzle.map(row => row.map(val => ({
        value: val,
        isGiven: val !== null,
        isError: false
      }))));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMistakes(0);
    }
  }, [difficulty, level]); // Ignore currentGame to avoid infinite loops

  useEffect(() => {
    if (board.length > 0 && !isWon) {
      saveCurrentGame({
        level,
        board,
        solution,
        history,
        mistakes
      });
    }
  }, [board, history, mistakes, isWon, level, solution, saveCurrentGame]);

  useEffect(() => {
    if (isWon) return;
    const timer = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isWon]);

  useEffect(() => {
    if (mistakes > 0 && mistakes % 4 === 0 && mistakes !== lastMistakeAlert) {
      setShowMistakeModal(true);
      setLastMistakeAlert(mistakes);
    }
  }, [mistakes, lastMistakeAlert]);

  const handleClearErrors = () => {
    const newBoard = board.map(row => row.map(cell => {
      if (cell.isError) {
        return { ...cell, value: null, isError: false };
      }
      return cell;
    }));
    setBoard(newBoard);
    setHistory([]);
    setShowMistakeModal(false);
  };

  const handleRestart = () => {
    const newBoard = board.map(row => row.map(cell => {
      if (!cell.isGiven) {
        return { ...cell, value: null, isError: false };
      }
      return cell;
    }));
    setBoard(newBoard);
    setMistakes(0);
    setTime(0);
    setHistory([]);
    setLastMistakeAlert(0);
    setShowMistakeModal(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (r: number, c: number) => {
    if (isWon || board[r][c].isGiven) return;
    setSelectedCell({ r, c });
  };

  const checkWin = (newBoard: Cell[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value !== solution[r][c]) return false;
      }
    }
    return true;
  };

  const handleNumberInput = (num: number) => {
    if (isWon || !selectedCell) return;
    const { r, c } = selectedCell;
    if (board[r][c].isGiven) return;

    const prevValue = board[r][c].value;
    if (prevValue === num) return;

    const isCorrect = solution[r][c] === num;
    
    const newBoard = [...board];
    newBoard[r] = [...newBoard[r]];
    newBoard[r][c] = {
      ...newBoard[r][c],
      value: num,
      isError: !isCorrect
    };

    if (!isCorrect) {
      setMistakes(m => m + 1);
    }

    setBoard(newBoard);
    setHistory([...history, { r, c, prev: prevValue }]);

    if (isCorrect && checkWin(newBoard)) {
      setIsWon(true);
      clearCurrentGame();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        incrementCompletedGames();
        router.push('/levels');
      }, 3000);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const lastAction = history[history.length - 1];
    const newBoard = [...board];
    newBoard[lastAction.r] = [...newBoard[lastAction.r]];
    newBoard[lastAction.r][lastAction.c] = {
      ...newBoard[lastAction.r][lastAction.c],
      value: lastAction.prev,
      isError: false // Reset error state on undo
    };
    setBoard(newBoard);
    setHistory(history.slice(0, -1));
  };

  const handleErase = () => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    if (board[r][c].isGiven || board[r][c].value === null) return;
    
    const prevValue = board[r][c].value;
    const newBoard = [...board];
    newBoard[r] = [...newBoard[r]];
    newBoard[r][c] = {
      ...newBoard[r][c],
      value: null,
      isError: false
    };
    setBoard(newBoard);
    setHistory([...history, { r, c, prev: prevValue }]);
  };

  const handleHint = () => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    if (board[r][c].isGiven || board[r][c].value === solution[r][c]) return;
    
    handleNumberInput(solution[r][c] as number);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Run on every render to capture the latest state in the closure

  if (board.length === 0) return null;

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl">
      <header className="flex items-center bg-white p-4 justify-between border-b border-orange-500/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/levels')}
            className="text-orange-500 flex size-10 shrink-0 items-center justify-center bg-orange-500/10 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold leading-tight tracking-tight">Level {level}</h1>
            <p className="text-xs font-medium text-slate-500 capitalize">{difficulty.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/10 px-3 py-1 rounded-full flex items-center gap-1">
            <Timer className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500">{formatTime(time)}</span>
          </div>
        </div>
      </header>

      <div className="flex gap-4 p-4">
        <div className="flex min-w-[120px] flex-1 flex-col gap-1 rounded-xl p-3 bg-white shadow-sm border border-orange-500/5">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Mistakes</p>
          <p className="text-red-500 tracking-light text-xl font-black">{mistakes}</p>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-orange-500/20">
          <div className="grid grid-cols-9 aspect-square">
            {board.flatMap((row, r) => row.map((cell, c) => {
              const blockIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isSameValue = cell.value && selectedCell && board[selectedCell.r][selectedCell.c].value === cell.value;
              const isRelated = selectedCell && (selectedCell.r === r || selectedCell.c === c || Math.floor(selectedCell.r / 3) * 3 + Math.floor(selectedCell.c / 3) === blockIdx);
              
              let bgClass = blockColors[blockIdx];
              if (isSelected) bgClass = 'bg-orange-200';
              else if (isSameValue) bgClass = 'bg-orange-100';
              else if (isRelated) bgClass = 'bg-orange-50/50';

              let textClass = 'text-slate-800';
              if (cell.isError) textClass = 'text-red-500';
              else if (!cell.isGiven && cell.value) {
                textClass = numberColors[cell.value - 1].split(' ')[0];
              }

              let cellContent: React.ReactNode = cell.value || '';
              
              if (gameMode === 'colors' && cell.value) {
                cellContent = (
                  <div className={`w-[75%] h-[75%] rounded-lg border-2 border-white shadow-sm ${pureColors[cell.value - 1]}`} />
                );
              }

              return (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    flex items-center justify-center text-xl sm:text-2xl font-black cursor-pointer
                    border border-orange-500/10 ${bgClass} ${textClass}
                    ${r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-orange-500/30' : ''}
                    ${c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-orange-500/30' : ''}
                    ${isSelected ? 'ring-2 ring-inset ring-orange-500 z-10' : ''}
                  `}
                >
                  {cellContent}
                </div>
              );
            }))}
          </div>
        </div>

        <div className="w-full flex justify-between gap-4 mt-6">
          <button onClick={handleUndo} className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white shadow-sm border border-orange-500/10 group active:scale-95 transition-all">
            <Undo className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Undo</span>
          </button>
          <button onClick={handleErase} className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white shadow-sm border border-orange-500/10 group active:scale-95 transition-all">
            <Eraser className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Erase</span>
          </button>
          <button onClick={handleHint} className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 text-white group active:scale-95 transition-all">
            <Lightbulb className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Hint</span>
          </button>
        </div>
      </main>

      <div className="mt-auto p-4 bg-white border-t border-orange-500/10 rounded-t-[2.5rem] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-9 gap-1 sm:gap-2 max-w-md mx-auto mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num}
              onClick={() => handleNumberInput(num)}
              className={`aspect-square flex items-center justify-center rounded-xl text-lg sm:text-xl font-black active:scale-90 transition-all border-b-4 
                ${gameMode === 'numbers' ? numberColors[num-1] : 'bg-white border-slate-200'}
              `}
            >
              {gameMode === 'numbers' ? num : (
                <div className={`w-[60%] h-[60%] rounded-lg border-2 border-white shadow-sm ${pureColors[num - 1]}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {showMistakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
              <Frown className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Puxa vida!</h2>
            <p className="text-slate-600 font-medium mb-6">
              Você fez alguns errinhos. Não tem problema! Quer limpar os erros ou recomeçar o jogo?
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleClearErrors}
                className="w-full bg-orange-500 text-white font-bold text-lg py-3 rounded-xl shadow-[0_4px_0_0_#c2410c] active:translate-y-[4px] active:shadow-none transition-all"
              >
                Limpar Erros
              </button>
              <button 
                onClick={handleRestart}
                className="w-full bg-slate-200 text-slate-700 font-bold text-lg py-3 rounded-xl shadow-[0_4px_0_0_#94a3b8] active:translate-y-[4px] active:shadow-none transition-all"
              >
                Recomeçar Jogo
              </button>
              <button 
                onClick={() => setShowMistakeModal(false)}
                className="w-full bg-transparent text-slate-500 font-bold text-lg py-3 rounded-xl hover:bg-slate-50 transition-all mt-2"
              >
                Continuar Jogando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
