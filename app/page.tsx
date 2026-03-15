'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { mascots } from '@/lib/mascots';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket, Settings, Trophy, Star, Play } from 'lucide-react';

export default function Home() {
  const { mascotId, playerName, setPlayerInfo, completedGames } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!mascotId) {
    return <SetupScreen onComplete={setPlayerInfo} />;
  }

  return <MainMenuScreen mascotId={mascotId} playerName={playerName} completedGames={completedGames} router={router} />;
}

function SetupScreen({ onComplete }: { onComplete: (name: string, mascotId: string) => void }) {
  const [selectedMascot, setSelectedMascot] = useState<string>('');
  const [name, setName] = useState('');

  const handlePlay = () => {
    if (selectedMascot && name.trim()) {
      onComplete(name.trim(), selectedMascot);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl">
      <div className="flex items-center p-6 pb-2 justify-between">
        <h2 className="text-slate-900 text-2xl font-extrabold leading-tight tracking-tight flex-1 text-center">Pick Your Mascot!</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        {mascots.map((mascot) => {
          const isSelected = selectedMascot === mascot.id;
          return (
            <div 
              key={mascot.id} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedMascot(mascot.id)}
            >
              <div className={`bg-white flex flex-col gap-3 rounded-xl p-3 aspect-square shadow-md border-4 transition-all ${isSelected ? 'border-orange-500 ring-4 ring-orange-500/20 scale-[1.02]' : 'border-transparent hover:border-orange-500/30'}`}>
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image src={mascot.image} alt={mascot.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-slate-900 text-sm font-bold">{mascot.name}</p>
                {isSelected && (
                  <span className="inline-block px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-bold uppercase tracking-wider">Selected</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-6 bg-white rounded-t-xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
        <h3 className="text-slate-900 text-lg font-bold leading-tight tracking-tight mb-4 flex items-center gap-2">
          Enter Your Name
        </h3>
        <div className="flex flex-col gap-4">
          <input 
            className="flex w-full rounded-xl text-slate-900 focus:outline-0 focus:ring-2 focus:ring-orange-500/50 border-2 border-orange-500/20 bg-slate-50 focus:border-orange-500 h-14 px-5 text-base font-medium shadow-inner" 
            placeholder="Type your hero name..." 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button 
            onClick={handlePlay}
            disabled={!selectedMascot || !name.trim()}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-5 bg-orange-500 text-white text-xl font-extrabold leading-normal tracking-wide shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              LET&apos;S PLAY!
              <Rocket className="w-6 h-6" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MainMenuScreen({ mascotId, playerName, completedGames, router }: { mascotId: string, playerName: string, completedGames: number, router: any }) {
  const mascot = mascots.find(m => m.id === mascotId);

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl">
      <header className="flex items-center p-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Trophy className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-bold text-slate-700">{completedGames} Wins</span>
        </div>
        <button onClick={() => router.push('/settings')} className="bg-slate-200 p-2 rounded-full text-slate-600 hover:bg-slate-300 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-5xl font-black text-center mb-2">
          <span className="text-orange-500">Super</span> <span className="text-slate-800">SudoKids</span>
        </h1>
        
        <p className="text-lg font-bold text-slate-600 mb-8">Hi, {playerName}!</p>

        {mascot && (
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-8 border-white mb-8">
            <Image src={mascot.image} alt={mascot.name} fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        <button 
          onClick={() => router.push('/levels')}
          className="w-full bg-orange-500 text-white text-2xl font-black py-4 rounded-2xl shadow-[0_8px_0_0_#c2410c] active:translate-y-[8px] active:shadow-none transition-all flex items-center justify-center gap-3 mb-6"
        >
          <Play className="w-8 h-8 fill-white" />
          PLAY NOW
        </button>

      </div>
    </div>
  );
}
