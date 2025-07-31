
import React, { useState, useEffect, useCallback } from 'react';
import { generateFighters } from './services/geminiService';
import type { Fighter } from './types';
import FighterCard from './components/FighterCard';
import MatchModal from './components/MatchModal';
import { RejectIcon, ChallengeIcon, ReloadIcon } from './components/icons';

const App: React.FC = () => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedFighter, setMatchedFighter] = useState<Fighter | null>(null);
  const [animationClass, setAnimationClass] = useState('');

  const fetchFighters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMatchedFighter(null);
    setCurrentIndex(0);
    try {
      const newFighters = await generateFighters();
      if(newFighters.length === 0){
        setError("Neizdevās ielādēt cīkstoņus. Mēģiniet vēlreiz.");
      } else {
        setFighters(newFighters);
      }
    } catch (err) {
      setError("Notika kļūda, ielādējot cīkstoņus.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFighters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (animationClass) return; // Prevent multiple swipes during animation

    if (direction === 'right') {
      setAnimationClass('animate-swipe-right');
      setTimeout(() => {
        setMatchedFighter(fighters[currentIndex]);
      }, 250); // Show modal slightly before animation ends
    } else {
      setAnimationClass('animate-swipe-left');
    }

    setTimeout(() => {
      setAnimationClass('');
      if(direction === 'left'){ // only move to next if it was not a match
         setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }, 500); // Duration of the animation
  };
  
  const closeMatchModal = () => {
      setMatchedFighter(null);
      setCurrentIndex((prevIndex) => prevIndex + 1);
  }

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <svg className="animate-spin h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-xl">Meklējam pretiniekus...</p>
    </div>
  );

  const renderEndScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen text-white text-center">
      <h2 className="text-3xl font-bold">Visi cīkstoņi ir apskatīti!</h2>
      <p className="text-gray-400 mt-2">Vēlies sākt no jauna ar jauniem pretiniekiem?</p>
      <button
        onClick={() => fetchFighters()}
        className="mt-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
      >
        <ReloadIcon className="w-6 h-6" />
        Ielādēt jaunus
      </button>
    </div>
  );
  
  if (isLoading) return renderLoading();
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (currentIndex >= fighters.length && fighters.length > 0) return renderEndScreen();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-red-500 tracking-widest uppercase">Ielu Cīkstonis</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative pb-28">
        <div className="relative w-11/12 h-[65vh] max-w-sm max-h-[700px]">
          {fighters.length > 0 && fighters.map((fighter, index) => {
            if (index < currentIndex) return null;
            if (index > currentIndex + 1) return null; // Only render current and next card
            
            return (
              <FighterCard
                key={fighter.name + index}
                fighter={fighter}
                isTopCard={index === currentIndex}
                animationClass={index === currentIndex ? animationClass : ''}
              />
            );
          })}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex justify-center items-center space-x-8">
          <button onClick={() => handleSwipe('left')} className="p-4 bg-gray-800 border-2 border-gray-600 rounded-full text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 transform hover:scale-110">
            <RejectIcon className="w-8 h-8"/>
          </button>
          <button onClick={() => handleSwipe('right')} className="p-6 bg-red-600 border-2 border-red-400 rounded-full text-white hover:bg-red-500 hover:border-red-300 transition-all duration-200 transform hover:scale-110 shadow-lg shadow-red-600/50">
            <ChallengeIcon className="w-10 h-10"/>
          </button>
        </div>
      </footer>

      {matchedFighter && <MatchModal fighter={matchedFighter} onClose={closeMatchModal} />}
    </div>
  );
};

export default App;
