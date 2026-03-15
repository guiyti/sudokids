'use client';

import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Lock } from 'lucide-react';

export default function Levels() {
  const { completedGames } = useGameStore();
  const router = useRouter();

  const totalLevels = 40;

  const getDifficulty = (level: number) => {
    if (level <= 10) return 'very_easy';
    if (level <= 20) return 'easy';
    if (level <= 30) return 'medium';
    return 'hard';
  };

  const isLocked = (level: number) => {
    return level > completedGames + 1;
  };

  const handlePlay = (level: number) => {
    if (isLocked(level)) return;
    router.push(`/play?level=${level}&diff=${getDifficulty(level)}`);
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl">
      <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-100 p-2 rounded-xl text-orange-500 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 font-bold" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Pick Your Adventure</h1>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Sudoku Quest</span>
            </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-600">Total Progress</span>
            <span className="text-sm font-extrabold text-orange-500">{completedGames} Wins</span>
          </div>
          <div className="w-full bg-orange-100 h-3 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, (completedGames / totalLevels) * 100)}%` }}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8 overflow-y-auto pb-24">
        {[
          { title: 'Very Easy', start: 1, end: 10 },
          { title: 'Easy', start: 11, end: 20 },
          { title: 'Medium', start: 21, end: 30 },
          { title: 'Hard', start: 31, end: 40 }
        ].map((group) => {
          // If the entire group is locked, don't show it (or show it faded)
          if (completedGames + 1 < group.start) return null;

          return (
            <section key={group.title}>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                {group.title} Levels
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {Array.from({ length: group.end - group.start + 1 }).map((_, i) => {
                  const level = group.start + i;
                  const locked = isLocked(level);
                  const completed = completedGames >= level;
                  const isNext = completedGames === level - 1;

                  if (locked) {
                    return (
                      <button key={level} className="aspect-square bg-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-not-allowed">
                        <Lock className="w-8 h-8 text-slate-400" />
                      </button>
                    );
                  }

                  if (completed) {
                    return (
                      <button 
                        key={level}
                        onClick={() => handlePlay(level)}
                        className="aspect-square bg-orange-500 rounded-2xl flex flex-col items-center justify-center shadow-[0_8px_0_0_#c2410c] active:translate-y-[4px] active:shadow-[0_4px_0_0_#c2410c] transition-all"
                      >
                        <span className="text-white text-2xl font-black">{level}</span>
                        <div className="flex gap-0.5 mt-1">
                          <Star className="w-3 h-3 text-white fill-white" />
                          <Star className="w-3 h-3 text-white fill-white" />
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                      </button>
                    );
                  }

                  if (isNext) {
                    return (
                      <button 
                        key={level}
                        onClick={() => handlePlay(level)}
                        className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-orange-500/20 shadow-lg group"
                      >
                        <span className="text-orange-500 text-2xl font-black">{level}</span>
                        <span className="text-[10px] font-bold text-orange-500/60 uppercase">Ready</span>
                      </button>
                    );
                  }

                  return (
                    <button 
                      key={level}
                      onClick={() => handlePlay(level)}
                      className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-slate-200 shadow-sm"
                    >
                      <span className="text-slate-400 text-2xl font-black">{level}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {completedGames >= 40 && (
          <section>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
              Infinite Levels
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => handlePlay(completedGames + 1)}
                className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-orange-500/20 shadow-lg group"
              >
                <span className="text-orange-500 text-2xl font-black">...</span>
                <span className="text-[10px] font-bold text-orange-500/60 uppercase">Play Next</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
