'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GameMode } from '@/lib/store';
import { mascots } from '@/lib/mascots';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2, Palette, Hash } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { 
    playerName, 
    mascotId, 
    gameMode,
    setPlayerInfo, 
    setGameMode,
    resetProgress 
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState('');
  const [mode, setMode] = useState<GameMode>('numbers');

  useEffect(() => {
    setName(playerName);
    setSelectedMascot(mascotId);
    setMode(gameMode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [playerName, mascotId, gameMode]);

  if (!mounted) return null;

  const handleSave = () => {
    if (name.trim() && selectedMascot) {
      setPlayerInfo(name.trim(), selectedMascot);
      setGameMode(mode);
      router.push('/');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      resetProgress();
      router.push('/');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl">
      <header className="flex items-center bg-white p-4 justify-between border-b border-orange-500/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="text-orange-500 flex size-10 shrink-0 items-center justify-center bg-orange-500/10 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold leading-tight tracking-tight text-slate-800">Settings</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
        
        <section>
          <h2 className="text-lg font-bold text-slate-700 mb-4">Game Mode</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('numbers')}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-4 transition-all ${mode === 'numbers' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}
            >
              <Hash className={`w-8 h-8 ${mode === 'numbers' ? 'text-orange-500' : 'text-slate-400'}`} />
              <span className={`font-bold ${mode === 'numbers' ? 'text-orange-600' : 'text-slate-500'}`}>Numbers</span>
            </button>
            <button
              onClick={() => setMode('colors')}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-4 transition-all ${mode === 'colors' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}
            >
              <Palette className={`w-8 h-8 ${mode === 'colors' ? 'text-orange-500' : 'text-slate-400'}`} />
              <span className={`font-bold ${mode === 'colors' ? 'text-orange-600' : 'text-slate-500'}`}>Colors</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {mode === 'numbers' ? 'Play with numbers 1-9.' : 'Play with colors! Great for younger kids.'}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-700 mb-4">Your Name</h2>
          <input 
            className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-orange-500/50 border-2 border-orange-500/20 bg-white focus:border-orange-500 h-14 px-5 text-base font-bold shadow-sm" 
            placeholder="Type your hero name..." 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-700 mb-4">Change Mascot</h2>
          <div className="grid grid-cols-2 gap-4">
            {mascots.map((mascot) => {
              const isSelected = selectedMascot === mascot.id;
              return (
                <div 
                  key={mascot.id} 
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedMascot(mascot.id)}
                >
                  <div className={`bg-white flex flex-col gap-3 rounded-xl p-3 aspect-square shadow-sm border-4 transition-all ${isSelected ? 'border-orange-500 ring-4 ring-orange-500/20 scale-[1.02]' : 'border-slate-100 hover:border-orange-500/30'}`}>
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image src={mascot.image} alt={mascot.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-slate-700 text-sm font-bold">{mascot.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pt-8 border-t border-slate-200">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-bold border-2 border-red-200 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Reset All Progress
          </button>
        </section>

      </main>

      <div className="p-4 bg-white border-t border-slate-200">
        <button 
          onClick={handleSave}
          disabled={!name.trim() || !selectedMascot}
          className="w-full bg-orange-500 text-white text-xl font-black py-4 rounded-2xl shadow-[0_8px_0_0_#c2410c] active:translate-y-[8px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-6 h-6" />
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
