import React, { useState, useEffect } from 'react';

// --- EUCHRE GAME CONSTANTS & UTILITIES ---
const SUITS = ['♥', '♦', '♣', '♠'];
const RANKS = ['9', '10', 'J', 'Q', 'K', 'A'];
const RED_SUITS = ['♥', '♦'];
const BLACK_SUITS = ['♣', '♠'];

const PLAYERS = [
  { id: 0, name: 'You', team: 0, pos: 'bottom' },
  { id: 1, name: 'Bot 1', team: 1, pos: 'left' },
  { id: 2, name: 'Your Partner', team: 0, pos: 'top' },
  { id: 3, name: 'Bot 2', team: 1, pos: 'right' }
];

const FUNNY_PASS_MESSAGES = [
  { title: "🐔 COWARDICE AT THE TABLE!", desc: "Too chicken to call trump? Sweeping this hand away..." },
  { title: "🤷‍♂️ RESPONSIBILITY EVADED!", desc: "Everyone passed the buck! Next dealer, save us..." },
  { title: "🥶 COLD FEET!", desc: "Brrr! Cold feet all around. Let's try that again with a fresh deck!" },
  { title: "🧙‍♂️ IS THIS DECK CURSED?", desc: "Absolutely nobody wanted to touch that hand. Redealing!" },
  { title: "🙈 CRICKETS...", desc: "The silence is deafening. Shuffling again with a new dealer!" }
];

const FUNNY_SKIP_PHRASES = [
  "Fold 'em! The math doesn't lie 🧮",
  "Wrap it up, we're done here 🌯",
  "Fast-forward this snooze fest 😴",
  "Throw in the towel! 🏳️",
  "Skip the drama, next hand! ⏭️",
  "Ain't nobody got time for this! ⏱️",
  "Boring hand! Shuffle 'em up! 🎴",
  "Mathematical mercy rule! 🚨"
];

// Funny, sarcastic callout screens for when a human gets caught reneging in Hard Mode
const FUNNY_RENEGE_QUOTES = [
  { title: "🚨 YOU WERE CAUGHT - RENEGING! LOSER! 🚨", desc: "You tried to sneak that card past a neural network? Nice try, slick! Bots see EVERYTHING! 🫵🤖" },
  { title: "🐔 COWARDLY CHEATER! 🐔", desc: "You had a lead suit card but tried to play dumb. Absolute amateur hour! Loser! 💀" },
  { title: "🤷‍♂️ ARE YOU FOR REAL? 🤷‍♂️", desc: "Did you 'forget' you had that suit, or is your memory bank malfunctioning? The AI remembers! 🫵🚨" },
  { title: "🤡 BRAIN-FADE OF THE CENTURY! 🤡", desc: "You brought a butterknife to an AI cardfight and got caught red-handed! Reneging is illegal in 48 states! 🇺🇸💸" }
];

// Color profiles for visual customization of card backs
const DECK_COLORS = [
  { id: 'sapphire', name: 'Sapphire Blue', bg: 'from-blue-400 via-blue-800 to-blue-950', border: 'border-blue-400/40', preview: 'bg-blue-600' },
  { id: 'crimson', name: 'Crimson Ruby', bg: 'from-red-400 via-red-800 to-red-950', border: 'border-red-400/40', preview: 'bg-red-600' },
  { id: 'emerald', name: 'Emerald Forest', bg: 'from-emerald-400 via-emerald-800 to-emerald-950', border: 'border-emerald-400/40', preview: 'bg-emerald-600' },
  { id: 'amethyst', name: 'Royal Amethyst', bg: 'from-purple-400 via-purple-800 to-purple-950', border: 'border-purple-400/40', preview: 'bg-purple-600' },
  { id: 'obsidian', name: 'Midnight Obsidian', bg: 'from-gray-400 via-gray-800 to-gray-950', border: 'border-gray-500/40', preview: 'bg-neutral-800' }
];

// Extracted globally to avoid JSX parsing bugs with CSS curly braces
const GLOBAL_CSS = `
  @keyframes euchreShake {
    0%, 100% { transform: translate(0, 0) scale(1); }
    10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 3px) rotate(-0.5deg); }
    20%, 40%, 60%, 80% { transform: translate(4px, -3px) rotate(0.5deg); }
  }
  @keyframes euchreGlow {
    0%, 100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.4), inset 0 0 12px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); }
    50% { box-shadow: 0 0 50px rgba(244, 63, 94, 0.95), inset 0 0 24px rgba(244, 63, 94, 0.6); border-color: rgba(244, 63, 94, 0.9); }
  }
  @keyframes shuffleLeft {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    50% { transform: translateX(-35px) rotate(-15deg); z-index: 50; }
  }
  @keyframes shuffleRight {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    50% { transform: translateX(35px) rotate(15deg); z-index: 50; }
  }
  .euchred-overlay-flashy {
    animation: euchreShake 0.4s cubic-bezier(.36,.07,.19,.97) both, euchreGlow 0.8s ease-in-out infinite alternate;
  }
  .animate-shuffle-left {
    animation: shuffleLeft 0.5s ease-in-out infinite;
  }
  .animate-shuffle-right {
    animation: shuffleRight 0.5s ease-in-out infinite;
  }
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .rotate-y-0 {
    transform: rotateY(0deg);
  }
  @keyframes confettiFall {
    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
  }
  @keyframes rainDrop {
    0% { transform: translateY(-10px); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(60px); opacity: 0; }
  }
  @keyframes floatCloud {
    0%, 100% { transform: translateX(-5px) translateY(0); }
    50% { transform: translateX(5px) translateY(-8px); }
  }
`;

// Helper to determine text color of a suit
const getSuitColor = (suit) => RED_SUITS.includes(suit) ? 'text-[#d40000]' : 'text-[#1a1a1a]';

// --- HIGHLY PORTABLE GLOBAL LAYOUT & CARD RENDER HELPERS ---
const renderCard = (card, onClick = null, isPlayable = true) => {
  if (!card) return null;
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);
  
  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`relative w-16 h-24 sm:w-24 sm:h-36 bg-[#fdfdfd] rounded-xl shadow-[2px_4px_12px_rgba(0,0,0,0.4)] border border-gray-300 flex flex-col justify-between overflow-hidden
        ${getSuitColor(card.suit)} 
        ${isPlayable && onClick ? 'cursor-pointer hover:-translate-y-4 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300' : 'transition-all duration-300'}
        ${!isPlayable ? 'opacity-60 brightness-90' : ''} ring-1 ring-black/10 ring-inset group`}
    >
      <div className="absolute inset-1 sm:inset-1.5 border-[0.5px] border-slate-300 rounded-lg pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
      
      <div className="absolute top-1 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center font-serif z-10">
        <span className="text-sm sm:text-xl font-bold leading-none tracking-tighter">{card.rank}</span>
        <span className="text-xs sm:text-lg leading-none mt-0.5">{card.suit}</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative w-full h-full p-3 sm:p-5">
        {isFaceCard && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="w-10 h-14 sm:w-16 sm:h-20 border-2 border-current rounded-sm flex items-center justify-center">
               <span className="text-5xl sm:text-7xl font-serif">{card.rank}</span>
             </div>
          </div>
        )}
        <span className={`text-4xl sm:text-6xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 ${isFaceCard ? 'mt-2' : ''}`}>
          {card.suit}
        </span>
      </div>
      
      <div className="absolute bottom-1 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center rotate-180 font-serif z-10">
        <span className="text-sm sm:text-xl font-bold leading-none tracking-tighter">{card.rank}</span>
        <span className="text-xs sm:text-lg leading-none mt-0.5">{card.suit}</span>
      </div>
    </div>
  );
};

const renderCardBack = (activeDeckStyle) => {
  return (
    <div className={`w-12 h-16 sm:w-20 sm:h-28 rounded-xl shadow-[2px_4px_12px_rgba(0,0,0,0.4)] border ${activeDeckStyle.border} flex items-center justify-center overflow-hidden bg-gradient-to-br ${activeDeckStyle.bg} relative`}>
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,1)_6px,rgba(255,255,255,1)_12px)]"></div>
      <div className="absolute inset-1.5 border-2 border-white/60 rounded-lg"></div>
    </div>
  );
};

const getMakerFrameClasses = (maker, playerIndex, trump) => {
  if (maker === playerIndex && trump) {
    return "bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 p-[3px] sm:p-1 rounded-[1.5rem] shadow-[0_0_30px_rgba(234,179,8,0.6)] z-40 transition-all duration-500 scale-[1.02]";
  }
  return "p-[3px] sm:p-1 rounded-[1.5rem] transition-all duration-500 border border-transparent";
};

const getMakerInnerClasses = (maker, playerIndex, trump) => {
  if (maker === playerIndex && trump) {
    return "bg-black/40 backdrop-blur-md rounded-[1.3rem]";
  }
  return "rounded-[1.3rem]";
};

const renderDealerCoin = (dealer, playerIndex, positionClasses) => {
  if (dealer === null || dealer !== playerIndex) return null;
  return (
    <div className={`absolute ${positionClasses} w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-[0_6px_15px_rgba(0,0,0,0.6),inset_0_4px_6px_rgba(255,255,255,1),inset_0_-4px_6px_rgba(0,0,0,0.2)] border-4 border-gray-900 shrink-0 z-[70] animate-bounce pointer-events-auto`} title="Dealer">
       <div className="absolute inset-[2px] border-[1px] border-dotted border-gray-400 rounded-full opacity-60"></div>
       <span className="text-gray-900 font-black text-[9px] sm:text-[11px] tracking-widest leading-none">DEALER</span>
    </div>
  );
};

const renderPlayerBadge = (currentPlayer, gameState, playerIndex, name, maker, trump, extraClasses = "") => {
  const isTurn = currentPlayer === playerIndex && !['round_over', 'game_over', 'finding_dealer', 'no_trump_passed', 'dealing_cards', 'renege_caught'].includes(gameState);
  return (
    <div className={`flex items-center gap-3 ${extraClasses} pointer-events-none`}>
      <div className={`flex items-center gap-2 bg-black/80 backdrop-blur-md border px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto ${isTurn ? 'border-green-400 text-green-100 shadow-[0_0_15px_rgba(74,222,128,0.6)] ring-1 ring-green-400 scale-105' : 'border-white/20 text-white'}`}>
        <span className="whitespace-nowrap">{name}</span>
        {maker === playerIndex && trump && (
          <div className={`bg-white px-1.5 py-0.5 rounded text-sm sm:text-base leading-none shadow-[0_2px_4px_rgba(0,0,0,0.4)] shrink-0 font-bold border border-gray-200 ${getSuitColor(trump)}`} title="Maker of Trump">
            {trump}
          </div>
        )}
      </div>
      {isTurn && playerIndex === 0 && (
         <div className="flex items-center gap-1.5 sm:gap-2 bg-green-500/20 text-green-300 border border-green-500/40 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] whitespace-nowrap pointer-events-auto">
           <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-ping shrink-0"></div>
           YOUR TURN
         </div>
      )}
    </div>
  );
};

// --- COORD MATH, RULES, AND AUDIO SYNTHESIS UTILITIES (Global Scope) ---

// Determines the true suit of a card (handling the Left Bower)
const getEffectiveSuit = (card, trump) => {
  if (!card) return null;
  if (!trump) return card.suit;
  if (card.rank === 'J') {
    if (card.suit === trump) return trump; // Right Bower
    if (trump === '♥' && card.suit === '♦') return '♥'; // Left Bower
    if (trump === '♦' && card.suit === '♥') return '♦'; // Left Bower
    if (trump === '♠' && card.suit === '♣') return '♠'; // Left Bower
    if (trump === '♣' && card.suit === '♠') return '♣'; // Left Bower
  }
  return card.suit;
};

// Generates a 24-card Euchre deck
const createDeck = () => {
  const deck = [];
  let id = 0;
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ id: id++, suit, rank });
    }
  }
  return deck;
};

// Fisher-Yates Shuffle
const shuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Assigns a numerical value to a card to determine the trick winner
const getCardValue = (card, trump, leadSuit) => {
  const effectiveSuit = getEffectiveSuit(card, trump);
  const isLeft = card.rank === 'J' && effectiveSuit === trump && card.suit !== trump;

  if (effectiveSuit === trump) {
    if (card.rank === 'J' && card.suit === trump) return 1000; // Right
    if (isLeft) return 900; // Left
    const trumpRanks = { 'A': 800, 'K': 700, 'Q': 600, '10': 500, '9': 400 };
    return trumpRanks[card.rank];
  }
  if (effectiveSuit === leadSuit) {
    const leadRanks = { 'A': 80, 'K': 70, 'Q': 60, 'J': 55, '10': 50, '9': 40 };
    return leadRanks[card.rank];
  }
  return 0; // Off-suit garbage
};

// Assigns a sorting value to group cards and put trumps on the left
const getSortValue = (card, trump) => {
  const suitsOrder = {'♥': 4, '♦': 3, '♣': 2, '♠': 1}; // Arbitrary order to group suits together
  const rankValues = { '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

  if (!trump) {
    return (suitsOrder[card.suit] * 100) + rankValues[card.rank];
  }

  const effectiveSuit = getEffectiveSuit(card, trump);
  const isRight = card.rank === 'J' && card.suit === trump;
  const isLeft = card.rank === 'J' && effectiveSuit === trump && card.suit !== trump;

  if (effectiveSuit === trump) {
    if (isRight) return 2000;
    if (isLeft) return 1900;
    return 1000 + rankValues[card.rank];
  } else {
    return (suitsOrder[card.suit] * 100) + rankValues[card.rank];
  }
};

// Filters a hand for valid cards that can be legally played
const getValidPlays = (hand, trick, trump) => {
  if (trick.length === 0) return hand; // Lead anything
  const leadSuit = getEffectiveSuit(trick[0].card, trump);
  const validCards = hand.filter(c => getEffectiveSuit(c, trump) === leadSuit);
  return validCards.length > 0 ? validCards : hand; // Must follow suit if possible
};

// Helper to check if a bot's hand is extremely strong to go alone
const botBidsAlone = (hand, suit) => {
  const trumps = hand.filter(c => getEffectiveSuit(c, suit) === suit);
  const hasRight = trumps.some(c => c.rank === 'J' && c.suit === suit);
  const hasLeft = trumps.some(c => c.rank === 'J' && c.suit !== suit && getEffectiveSuit(c, suit) === suit);
  
  if (trumps.length >= 4) return true;
  if (hasRight && hasLeft && trumps.length >= 3) return true;
  return false;
};

// Mobile notch / Safe margin layouts helper
const getSafeAreaStyles = () => ({
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)'
});

// --- REAL-TIME SOUND EFFECT SYSTEM (WEB AUDIO API) ---
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.12, ctx.currentTime);

  switch (type) {
    case 'card_play': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const pitchOffset = (Math.random() - 0.5) * 15;
      osc.frequency.setValueAtTime(160 + pitchOffset, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);

      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 900;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start();
      break;
    }

    case 'card_flick': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
      break;
    }

    case 'click': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      break;
    }

    case 'bid_pass': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
      break;
    }

    case 'trump_call': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      playTone(261.63, 0, 0.18);     // C4
      playTone(329.63, 0.07, 0.18);  // E4
      playTone(392.00, 0.14, 0.18);  // G4
      playTone(523.25, 0.21, 0.35);  // C5
      break;
    }

    case 'go_alone': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      playTone(196.00, 0, 0.12);    // G3
      playTone(293.66, 0.05, 0.12); // D4
      playTone(392.00, 0.10, 0.12); // G4
      playTone(587.33, 0.15, 0.12); // D5
      playTone(783.99, 0.20, 0.35); // G5
      break;
    }

    case 'trick_win': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); 
      gain.connect(masterGain);
      osc.start(); 
      osc.stop(ctx.currentTime + 0.25);
      break;
    }

    case 'hand_win': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); 
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(440.00, 0.0, 0.4); // A4
      playTone(554.37, 0.1, 0.4); // C#5
      playTone(659.25, 0.2, 0.6); // E5
      playTone(880.00, 0.2, 0.6); // A5
      break;
    }

    case 'fold_alert': {
      const playToot = (freq, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine'; 
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime + delay);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      };
      // Double bright chime!
      playToot(880.00, 0);    // A5
      playToot(1108.73, 0.15); // C#6
      break;
    }

    case 'euchred_sad': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Sad sliding trombone pitch "wa-wa-wa-waaa"
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
      
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.35);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.6);
      
      osc.frequency.setValueAtTime(260, ctx.currentTime + 0.6);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.65);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.9);
      
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.9);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.8);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.95);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.9);
      break;
    }

    case 'euchred_happy': {
      // Fast, bouncing victorious trumpet
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square'; // Trumpet-like brassy tone
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, ctx.currentTime + delay);
        filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + delay + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      // "Da - da - da - DAA!"
      playTone(523.25, 0, 0.15);     // C5
      playTone(523.25, 0.18, 0.15);  // C5
      playTone(523.25, 0.36, 0.15);  // C5
      playTone(659.25, 0.54, 0.6);   // E5
      break;
    }

    case 'renege_caught': {
      const playSiren = (freq1, freq2, duration) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + duration);
        
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(freq1, ctx.currentTime + duration);
        
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + duration + 0.05);
        osc2.stop(ctx.currentTime + duration + 0.05);
      };
      playSiren(550, 850, 0.35);
      setTimeout(() => playSiren(850, 550, 0.35), 350);
      setTimeout(() => playSiren(550, 850, 0.35), 700);
      break;
    }

    case 'game_won': {
      // Fast, happy 8-bit victory arpeggio
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(523.25, 0.0, 0.15);  // C5
      playTone(659.25, 0.15, 0.15); // E5
      playTone(783.99, 0.30, 0.15); // G5
      playTone(1046.50, 0.45, 0.6); // C6

      // Confetti "pop" white noise
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(masterGain);
      noise.start();
      break;
    }

    case 'game_lost': {
      // Slow, detuning, tragic dirge
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        // Slowly detune downwards for maximum sadness
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + delay + duration);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(300, 0.0, 0.8);
      playTone(280, 0.8, 0.8);
      playTone(260, 1.6, 0.8);
      playTone(200, 2.4, 2.0);
      break;
    }

    case 'in_the_barn': {
      // 8-Bit Retro Farm Animals - Tuned for better recognition!
      const animals = ['cow', 'pig', 'goat', 'horse', 'rooster'];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      const t = ctx.currentTime;
      
      if (animal === 'cow') { // "Mooo" - Needs a muffled, low, bending filter
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 1.5);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.linearRampToValueAtTime(200, t + 1.5);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.3);
        gain.gain.setValueAtTime(0.6, t + 1.0);
        gain.gain.linearRampToValueAtTime(0, t + 1.5);

        osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
        osc.start(start); osc.stop(start + dur + 0.05);
      }
      break;
    }
    
    default:
      break;
  }
};

// LocalStorage helper for Player Statistics
const getSavedStats = () => {
  try {
    const saved = localStorage.getItem('euchre_stats');
    return saved ? JSON.parse(saved) : { played: 0, won: 0, lost: 0 };
  } catch (e) {
    return { played: 0, won: 0, lost: 0 };
  }
};

export default function App() {
  // --- STATE ---
  const [gameState, setGameState] = useState('menu'); // menu, finding_dealer, dealing_cards, bid1, bid2, discard, playing, trick_eval, round_over, game_over, no_trump_passed, renege_caught
  const [hands, setHands] = useState([[], [], [], []]);
  const [upCard, setUpCard] = useState(null);
  const [trump, setTrump] = useState(null);
  const [maker, setMaker] = useState(null); // Player who called trump
  const [alonePlayer, setAlonePlayer] = useState(null); // Who is playing alone
  const [goAlone, setGoAlone] = useState(false); // User's alone choice toggle
  const [dealer, setDealer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [trick, setTrick] = useState([]); // Array of { player: id, card: {} }
  const [tricksTaken, setTricksTaken] = useState([0, 0]); // [Team 0 (You/North), Team 1 (West/East)]
  const [scores, setScores] = useState([0, 0]); // Game score to 10
  const [message, setMessage] = useState('Welcome to Euchre!');
  const [roundResult, setRoundResult] = useState({ title: '', desc: '', isEuchre: false });

  // Customizable deck back color & difficulty profile
  const [selectedDeckId, setSelectedDeckId] = useState('sapphire');
  const [difficulty, setDifficulty] = useState('normal'); // 'normal' or 'hard'
  const [showWarningModal, setShowWarningModal] = useState(false); // Warning for Hard level reneging

  // Finding Dealer states
  const [dealerSequence, setDealerSequence] = useState([]);
  const [dealerDeck, setDealerDeck] = useState([]);
  const [dealerCandidate, setDealerCandidate] = useState(0);
  const [findingDealerPhase, setFindingDealerPhase] = useState('none'); // Added phase state
  const [jackWinnerId, setJackWinnerId] = useState(null); // Tracks Jack winner for visual highlight

  // Visual Bidding Log player-by-player tracker
  const [biddingDecisions, setBiddingDecisions] = useState([null, null, null, null]);
  const [isBiddingPaused, setIsBiddingPaused] = useState(false); // Slower visual pace state

  // Funny "No Trump Passed" transition state
  const [noTrumpMessage, setNoTrumpMessage] = useState(null);

  // Card Dealing Animation states
  const [dealAnimationStep, setDealAnimationStep] = useState('none'); // none, shuffling, distributing, flipping
  const [revealedCardsCount, setRevealedCardsCount] = useState(0);
  const [isUpCardFlipped, setIsUpCardFlipped] = useState(false);

  // Early Hand Skip state
  const [funnySkipText, setFunnySkipText] = useState("");

  // Reneging Funny Callout state
  const [currentRenegeQuote, setCurrentRenegeQuote] = useState(null);

  // Stats state
  const [stats, setStats] = useState(getSavedStats());
  const [showStatsModal, setShowStatsModal] = useState(false);

  // --- DERIVED GAME STATES & HELPER HOOKS ---
  const activeDeckStyle = DECK_COLORS.find(d => d.id === selectedDeckId) || DECK_COLORS[0];

  const getRenderedHand = (playerIndex) => {
    const hand = hands[playerIndex];
    if (gameState === 'dealing_cards') {
      return hand.slice(0, revealedCardsCount);
    }
    return hand;
  };

  // Re-sort hands automatically whenever the trump suit changes
  useEffect(() => {
    if (trump) {
      setHands(prevHands => prevHands.map(hand => 
        [...hand].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump))
      ));
    }
  }, [trump]);

  // Handle Dealing Animation Sequence with audio synchronization
  useEffect(() => {
    if (gameState === 'dealing_cards') {
      if (dealAnimationStep === 'shuffling') {
        const interval = setInterval(() => {
          playSound('card_flick');
        }, 150);
        
        const t = setTimeout(() => {
          clearInterval(interval);
          setDealAnimationStep('distributing');
          setMessage('Dealing cards...');
        }, 1500);
        return () => {
          clearInterval(interval);
          clearTimeout(t);
        };
      }

      if (dealAnimationStep === 'distributing') {
        const interval = setInterval(() => {
          setRevealedCardsCount(prev => {
            playSound('card_flick'); // Deal flick sound
            if (prev >= 5) {
              clearInterval(interval);
              setDealAnimationStep('flipping');
              setMessage('Revealing up card...');
              return 5;
            }
            return prev + 1;
          });
        }, 250);
        return () => clearInterval(interval);
      }

      if (dealAnimationStep === 'flipping') {
        const t1 = setTimeout(() => {
          setIsUpCardFlipped(true);
          playSound('card_flick'); // Flip card flick sound
        }, 500);

        const t2 = setTimeout(() => {
          setDealAnimationStep('none');
          setGameState('bid1');
          setIsBiddingPaused(false); // Ensure the bidding freeze lock is completely lifted!
          const activeDealer = dealer !== null ? dealer : 0;
          const firstBidder = (activeDealer + 1) % 4;
          setCurrentPlayer(firstBidder);
          const nextName = PLAYERS[firstBidder].name;
          setMessage(`Bidding Round 1. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
        }, 1800);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [gameState, dealAnimationStep, dealer]);

  // Helper to evaluate if the current playing hand is mathematically won/lost early
  const isHandDecided = () => {
    // We only evaluate this during active trick play or trick evaluation pauses
    if (gameState !== 'playing' && gameState !== 'trick_eval') return false; 
    if (maker === null) return false;
    
    const makerTeam = PLAYERS[maker].team;
    const defenderTeam = makerTeam === 0 ? 1 : 0;
    const mTricks = tricksTaken[makerTeam];
    const dTricks = tricksTaken[defenderTeam];

    // Ensure BOTH teams have at least 1 trick so neither can automatically be robbed of a chance at a sweep (march).
    if (mTricks >= 1 && dTricks >= 1) {
      if (mTricks >= 3) return true; // Makers won 3+ tricks
      if (dTricks >= 3) return true; // Defenders won 3+ tricks (Euchre)
    }
    return false;
  };

  // Trigger funny skip texts when the hand is decided
  useEffect(() => {
    if (isHandDecided()) {
      if (!funnySkipText) {
        const randomPhrase = FUNNY_SKIP_PHRASES[Math.floor(Math.random() * FUNNY_SKIP_PHRASES.length)];
        setFunnySkipText(randomPhrase);
        playSound('fold_alert');
      }
    } else {
      setFunnySkipText("");
    }
  }, [tricksTaken, gameState]); // Removed funnySkipText from dependencies to avoid endless hook loops

  // Handle skip action - fold cards in the middle and skip remaining tricks
  const handleEarlyTermination = () => {
    playSound('card_flick'); // Fold swoosh
    setFunnySkipText("");
    setHands([[], [], [], []]);
    setTrick([]);
    setGameState('round_over');
  };

  // --- GAME ENGINE FUNCTIONS ---
  const handleStartGameRequest = () => {
    playSound('click');
    if (difficulty === 'hard') {
      setShowWarningModal(true);
    } else {
      confirmStartNewGame();
    }
  };

  const confirmStartNewGame = () => {
    playSound('click');
    setShowWarningModal(false);
    setScores([0, 0]);
    setHands([[], [], [], []]);
    setDealer(null); // Reset dealer so we can find a new one
    setAlonePlayer(null);
    setGoAlone(false);
    setBiddingDecisions([null, null, null, null]);
    setFunnySkipText("");
    setIsBiddingPaused(false); // Clear lock state
    setDealerDeck(shuffle(createDeck()));
    setDealerSequence([]);
    setDealerCandidate(Math.floor(Math.random() * 4)); // Random player gets first card
    setGameState('finding_dealer');
    setFindingDealerPhase('initial_pause');
    setMessage('Determining first dealer...');
  };

  // "First Jack Deals" Sequence Effect with visual highlight pause and sound
  useEffect(() => {
    if (gameState === 'finding_dealer') {
      if (findingDealerPhase === 'initial_pause') {
        const t = setTimeout(() => {
          setFindingDealerPhase('dealing');
        }, 2000);
        return () => clearTimeout(t);
      }

      if (findingDealerPhase === 'dealing') {
        const t = setTimeout(() => {
          const newDeck = [...dealerDeck];
          const card = newDeck.shift();
          
          if (!card) return; // Safeguard

          setDealerDeck(newDeck);
          setDealerSequence(prev => {
             const next = [...prev];
             // Find if we already dealt a card to this candidate, and replace it so it doesn't stack forever
             const idx = next.findIndex(p => p.player === dealerCandidate);
             if (idx >= 0) next[idx] = { player: dealerCandidate, card };
             else next.push({ player: dealerCandidate, card });
             return next;
          });

          // Play a rhythmic flick sound for each dealer sequence deal card
          playSound('card_flick');

          // Check the currently pulled card for a Jack
          if (card.rank === 'J') {
            setJackWinnerId(dealerCandidate); // Step 1: Lock in the winner to render the gold highlight!
            setFindingDealerPhase('highlighting_jack'); // Move to the visual highlighting step
          } else {
            // Move to next player clockwise
            setDealerCandidate((dealerCandidate + 1) % 4);
          }
        }, 600); // 600ms per card flick
        return () => clearTimeout(t);
      }

      if (findingDealerPhase === 'highlighting_jack') {
        // Play triumphant trump cue when Jack select resolves!
        playSound('trump_call');
        const t = setTimeout(() => {
          setDealer(jackWinnerId); // The white dealer puck jumps to the winner!
          setMessage(`${PLAYERS[jackWinnerId].name} got the first Jack and deals first!`);
          setFindingDealerPhase('found');
        }, 2000); // Highlight pause
        return () => clearTimeout(t);
      }

      if (findingDealerPhase === 'found') {
        const t = setTimeout(() => {
          setFindingDealerPhase('none');
          setJackWinnerId(null);
          startRound(jackWinnerId);
        }, 3000); // Reading pause
        return () => clearTimeout(t);
      }
    }
  }, [gameState, findingDealerPhase, dealerDeck, dealerCandidate, jackWinnerId]);

  const startRound = (activeDealer) => {
    setDealer(activeDealer); // Hard-lock the dealer to prevent null-state crashes!
    
    setDealerSequence([]); // Clear the middle dealer-finding cards
    setAlonePlayer(null);
    setGoAlone(false);
    setBiddingDecisions([null, null, null, null]);
    setFunnySkipText("");
    setIsBiddingPaused(false); // Force state reset of lock
    const newDeck = shuffle(createDeck());
    const newHands = [[], [], [], []];
    
    // Deal 5 cards to each player and sort them initially
    for (let i = 0; i < 4; i++) {
      newHands[i] = newDeck.splice(0, 5).sort((a, b) => getSortValue(b, null) - getSortValue(a, null));
    }
    
    setHands(newHands);
    setUpCard(newDeck[0]);
    setTrump(null);
    setMaker(null);
    setTrick([]);
    setTricksTaken([0, 0]);
    
    // Transition to Shuffling & Dealing Animation instead of immediate Bidding
    setGameState('dealing_cards');
    setDealAnimationStep('shuffling');
    setRevealedCardsCount(0);
    setIsUpCardFlipped(false);
    setMessage('Shuffling...');
  };

  const handleBid = (playerIndex, action, chosenSuit = null, bidAlone = false) => {
    if (isBiddingPaused) return; // Prevent double-triggering during visual transitions
    setIsBiddingPaused(true); // Freeze game clock

    const newDecisions = [...biddingDecisions];
    
    if (gameState === 'bid1') {
      if (action === 'order_up') {
        newDecisions[playerIndex] = bidAlone ? 'Order Up Alone!' : 'Order Up!';
        setBiddingDecisions(newDecisions);
        
        if (bidAlone) {
          playSound('go_alone');
          setMessage(`${PLAYERS[playerIndex].name} ordered up ${upCard.suit} ALONE! Partner sits out.`);
        } else {
          playSound('trump_call');
          setMessage(`${PLAYERS[playerIndex].name} ordered up ${upCard.suit}! Dealer must discard.`);
        }

        // Slow transition: Pause to let the player read the decision before changing turn or setting up discard
        setTimeout(() => {
          setTrump(upCard.suit);
          setMaker(playerIndex);
          if (bidAlone) {
            setAlonePlayer(playerIndex);
          }
          setGameState('discard');
          setCurrentPlayer(dealer); // Dealer must discard
          setIsBiddingPaused(false);
        }, 1800);

      } else {
        newDecisions[playerIndex] = 'Pass';
        setBiddingDecisions(newDecisions);
        playSound('bid_pass');
        setMessage(`${PLAYERS[playerIndex].name} passed.`);
        
        // Slow transition: Pause to let the player read the "Pass" decision bubble
        setTimeout(() => {
          if (playerIndex === dealer) {
            // Everyone passed round 1 - transition to Round 2
            setBiddingDecisions([null, null, null, null]); // Reset decisions so we don't hold them in round 2
            setGameState('bid2');
            const nextBidder = (dealer + 1) % 4;
            setCurrentPlayer(nextBidder);
            const nextName = PLAYERS[nextBidder].name;
            setMessage(`Bidding Round 2. ${upCard.suit} is dead. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
            setIsBiddingPaused(false); // CRITICAL BUGFIX: Ensure bidding is unpaused when dealer passes, moving the active turn onwards!
          } else {
            const nextBidder = (playerIndex + 1) % 4;
            setCurrentPlayer(nextBidder);
            const nextName = PLAYERS[nextBidder].name;
            setMessage(`${PLAYERS[playerIndex].name} passed. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
            setIsBiddingPaused(false);
          }
        }, 1500);
      }
    } else if (gameState === 'bid2') {
      if (action === 'call') {
        newDecisions[playerIndex] = bidAlone ? `Called ${chosenSuit} Alone!` : `Called ${chosenSuit}!`;
        setBiddingDecisions(newDecisions);
        
        if (bidAlone) {
          playSound('go_alone');
          setMessage(`${PLAYERS[playerIndex].name} called ${chosenSuit} ALONE! Partner sits out.`);
        } else {
          playSound('trump_call');
          setMessage(`${PLAYERS[playerIndex].name} called ${chosenSuit}!`);
        }
        
        // Slow transition: Pause to see the caller's decision speech bubble
        setTimeout(() => {
          setTrump(chosenSuit);
          setMaker(playerIndex);
          if (bidAlone) {
            setAlonePlayer(playerIndex);
          }
          setBiddingDecisions([null, null, null, null]); // Clear decisions for play phase
          setGameState('playing');
          
          // Skip first lead player if they are partner of lone player
          let firstLeader = (dealer + 1) % 4;
          if (bidAlone && firstLeader === ((playerIndex + 2) % 4)) {
            firstLeader = (firstLeader + 1) % 4;
          }
          setCurrentPlayer(firstLeader);
          const leaderName = PLAYERS[firstLeader].name;
          setMessage(`${leaderName === 'You' ? 'You lead' : leaderName + ' leads'}.`);
          setIsBiddingPaused(false);
        }, 1800);

      } else {
        newDecisions[playerIndex] = 'Pass';
        setBiddingDecisions(newDecisions);
        playSound('bid_pass');
        setMessage(`${PLAYERS[playerIndex].name} passed.`);
        
        // Slow transition: Pause to read the passed turn
        setTimeout(() => {
          if (playerIndex === dealer) {
             // Nobody selected trump in both rounds! Trigger funny transition overlay
             const randomMsg = FUNNY_PASS_MESSAGES[Math.floor(Math.random() * FUNNY_PASS_MESSAGES.length)];
             setNoTrumpMessage(randomMsg);
             setGameState('no_trump_passed');
             setMessage('Hand passed completely. Redealing...');
             
             setTimeout(() => {
               const nextDealer = (dealer + 1) % 4;
               setDealer(nextDealer);
               setNoTrumpMessage(null);
               startRound(nextDealer);
               setIsBiddingPaused(false);
             }, 3500);
          } else {
            const nextBidder = (playerIndex + 1) % 4;
            setCurrentPlayer(nextBidder);
            const nextName = PLAYERS[nextBidder].name;
            setMessage(`${PLAYERS[playerIndex].name} passed. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
            setIsBiddingPaused(false);
          }
        }, 1500);
      }
    }
  };

  const handleDiscard = (cardIndex) => {
    if (currentPlayer !== 0) return; // Only user handles manual discard here
    const newHands = [...hands];
    newHands[0].splice(cardIndex, 1);
    newHands[0].push(upCard);
    newHands[0].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump)); // Sort after picking up upCard
    setHands(newHands);
    setUpCard(null);
    setBiddingDecisions([null, null, null, null]); // Clear visual bids
    setGameState('playing');
    playSound('card_play'); // Sound feedback for felt drop
    
    // Find next player to lead, skipping sitting out partner
    let leader = (dealer + 1) % 4;
    if (alonePlayer !== null && leader === ((alonePlayer + 2) % 4)) {
      leader = (leader + 1) % 4;
    }
    setCurrentPlayer(leader);
    const leaderName = PLAYERS[leader].name;
    setMessage(`${leaderName === 'You' ? 'You lead' : leaderName + ' leads'}.`);
  };

  const handlePlayCard = (cardIndex) => {
    if (gameState !== 'playing') return;
    const playerHand = hands[currentPlayer];
    const cardToPlay = playerHand[cardIndex];
    
    // Check follow-suit rules
    const validPlays = getValidPlays(playerHand, trick, trump);
    const isPlayFollowsSuit = validPlays.some(c => c.id === cardToPlay.id);

    if (!isPlayFollowsSuit) {
      if (difficulty === 'normal' || currentPlayer !== 0) {
        // Normal Mode: Strict validation blocks wrong plays
        if (currentPlayer === 0) setMessage("You must follow suit!");
        return;
      } else {
        // Hard Mode: Let user play out of suit, but detect if they are "reneging"
        const leadSuit = trick.length > 0 ? getEffectiveSuit(trick[0].card, trump) : null;
        const hasLeadSuit = leadSuit && playerHand.some(c => getEffectiveSuit(c, trump) === leadSuit);
        
        if (hasLeadSuit) {
          // Player reneged! Play card visually, trigger funny overlay & add points to bots
          const newHands = [...hands];
          newHands[0].splice(cardIndex, 1);
          setHands(newHands);

          const newTrick = [...trick, { player: 0, card: cardToPlay }];
          setTrick(newTrick);
          
          // Select a random, highly sarcastic reneging quote
          const randomQuote = FUNNY_RENEGE_QUOTES[Math.floor(Math.random() * FUNNY_RENEGE_QUOTES.length)];
          setCurrentRenegeQuote(randomQuote);
          
          // Play the emergency siren sound!
          playSound('renege_caught');
          
          // Award +2 points directly to opponent bot team
          setScores(prev => [prev[0], prev[1] + 2]);
          setGameState('renege_caught');
          return;
        }
      }
    }

    // Play card standard path
    const newHands = [...hands];
    newHands[currentPlayer].splice(cardIndex, 1);
    setHands(newHands);
    
    const newTrick = [...trick, { player: currentPlayer, card: cardToPlay }];
    setTrick(newTrick);
    playSound('card_play'); // Physical thud sound

    const trickTargetSize = alonePlayer !== null ? 3 : 4;
    if (newTrick.length === trickTargetSize) {
      setMessage(`You played ${cardToPlay.rank}${cardToPlay.suit}. Evaluating trick...`);
      setGameState('trick_eval');
    } else {
      let next = (currentPlayer + 1) % 4;
      if (alonePlayer !== null && next === ((alonePlayer + 2) % 4)) {
        next = (next + 1) % 4;
      }
      setCurrentPlayer(next);
      const nextName = PLAYERS[next].name;
      setMessage(`You played ${cardToPlay.rank}${cardToPlay.suit}. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
    }
  };

  // --- BOT LOGIC ---
  useEffect(() => {
    if (currentPlayer === 0) return; // User turn
    if (['menu', 'trick_eval', 'round_over', 'game_over', 'finding_dealer', 'dealing_cards', 'no_trump_passed', 'renege_caught'].includes(gameState)) return;
    
    // Safety check: Only respect bidding locks during active bidding states
    const isBiddingState = gameState === 'bid1' || gameState === 'bid2';
    if (isBiddingPaused && isBiddingState) return; 

    // Skip sitting out partners ONLY during active gameplay ('playing' phase)
    if (gameState === 'playing' && alonePlayer !== null && currentPlayer === ((alonePlayer + 2) % 4)) {
       return; 
    }

    const timer = setTimeout(() => {
      const hand = hands[currentPlayer];
      
      // CRITICAL SAFEGUARD: If hand is empty or unpopulated, release pause and abort to prevent deadlocks!
      if (!hand || hand.length === 0) {
        setIsBiddingPaused(false);
        return;
      }

      const upCardSuit = upCard ? upCard.suit : null;

      if (gameState === 'bid1' && upCardSuit) {
        const suitCards = hand.filter(c => getEffectiveSuit(c, upCardSuit) === upCardSuit);
        const hasHigh = suitCards.some(c => ['J', 'A', 'K'].includes(c.rank));
        if (suitCards.length >= 2 && hasHigh) {
          const alone = botBidsAlone(hand, upCardSuit);
          handleBid(currentPlayer, 'order_up', null, alone);
        } else {
          handleBid(currentPlayer, 'pass');
        }
      } 
      else if (gameState === 'bid2') {
         let bestSuit = null;
         let maxCount = 0;
         SUITS.forEach(s => {
           if (upCardSuit && s !== upCardSuit) {
             const count = hand.filter(c => getEffectiveSuit(c, s) === s).length;
             if (count > maxCount) {
               maxCount = count;
               bestSuit = s;
             }
           }
         });
         if (maxCount >= 2 && Math.random() > 0.3) {
            const alone = botBidsAlone(hand, bestSuit);
            handleBid(currentPlayer, 'call', bestSuit, alone);
         } else {
            handleBid(currentPlayer, 'pass');
         }
      }
      else if (gameState === 'discard' && currentPlayer === dealer) {
        // Bot discard: lowest non-trump
        let worstIdx = 0;
        let worstVal = 9999;
        hand.forEach((c, idx) => {
            const val = getCardValue(c, trump, null); // Lead is null
            if (val < worstVal && getEffectiveSuit(c, trump) !== trump) {
                worstVal = val;
                worstIdx = idx;
            }
        });
        const newHands = [...hands];
        newHands[currentPlayer].splice(worstIdx, 1);
        if (upCard) {
          newHands[currentPlayer].push(upCard);
        }
        newHands[currentPlayer].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump));
        setHands(newHands);
        setUpCard(null);
        setBiddingDecisions([null, null, null, null]); // Clear visual bids
        setGameState('playing');
        playSound('card_play'); // Discards felt hit sound
        
        let leader = (dealer + 1) % 4;
        if (alonePlayer !== null && leader === ((alonePlayer + 2) % 4)) {
          leader = (leader + 1) % 4;
        }
        setCurrentPlayer(leader);
        const leaderName = PLAYERS[leader].name;
        setMessage(`${leaderName === 'You' ? 'You lead' : leaderName + ' leads'}.`);
      }
      else if (gameState === 'playing') {
        const validPlays = getValidPlays(hand, trick, trump);
        // Simple Bot: Play random valid card
        const randomCard = validPlays[Math.floor(Math.random() * validPlays.length)];
        const cardIndex = hand.findIndex(c => c.id === randomCard.id);
        
        const newHands = [...hands];
        newHands[currentPlayer].splice(cardIndex, 1);
        setHands(newHands);
        
        const newTrick = [...trick, { player: currentPlayer, card: randomCard }];
        setTrick(newTrick);
        playSound('card_play'); // Felt hit sound

        const trickTargetSize = alonePlayer !== null ? 3 : 4;
        if (newTrick.length === trickTargetSize) {
          setMessage(`${PLAYERS[currentPlayer].name} played ${randomCard.rank}${randomCard.suit}. Evaluating trick...`);
          setGameState('trick_eval');
        } else {
          let next = (currentPlayer + 1) % 4;
          if (alonePlayer !== null && next === ((alonePlayer + 2) % 4)) {
            next = (next + 1) % 4;
          }
          setCurrentPlayer(next);
          const nextName = PLAYERS[next].name;
          setMessage(`${PLAYERS[currentPlayer].name} played ${randomCard.rank}${randomCard.suit}. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
        }
      }
    }, 1200); // 1.2s delay for bot actions to feel natural

    return () => clearTimeout(timer);
  }, [currentPlayer, gameState, hands, trick, trump, upCard, alonePlayer, biddingDecisions, dealer, isBiddingPaused]);

  // Evaluate the completed trick
  useEffect(() => {
    if (gameState === 'trick_eval') {
      const evaluateDelay = setTimeout(() => {
        const leadSuit = getEffectiveSuit(trick[0].card, trump);
        let bestIndex = 0;
        let bestValue = -1;
        
        trick.forEach((play, index) => {
          const val = getCardValue(play.card, trump, leadSuit);
          if (val > bestValue) {
            bestValue = val;
            bestIndex = index;
          }
        });

        const winnerId = trick[bestIndex].player;
        const winningTeam = PLAYERS[winnerId].team;
        
        const newTricksTaken = [...tricksTaken];
        newTricksTaken[winningTeam] += 1;
        setTricksTaken(newTricksTaken);
        
        setMessage(`${PLAYERS[winnerId].name} won the trick!`);
        
        // Use lone player or player 0 as empty hand checker to avoid blocked partner length
        const activePlayerSample = alonePlayer !== null ? alonePlayer : 0;
        if (hands[activePlayerSample].length === 0) {
          // Round over
          setGameState('round_over');
        } else {
          // Next trick
          playSound('trick_win');
          setTrick([]);
          setGameState('playing');
          setCurrentPlayer(winnerId);
        }
      }, 1500);
      return () => clearTimeout(evaluateDelay);
    }
  }, [gameState, trick, trump, tricksTaken, hands, alonePlayer]);

  // Round Scoring
  useEffect(() => {
    if (gameState === 'round_over') {
      let newScores = [...scores];
      let title = "";
      let msg = "";
      let isEuchre = false;
      const makerTeam = PLAYERS[maker].team;
      const defenderTeam = makerTeam === 0 ? 1 : 0;
      const makerTricks = tricksTaken[makerTeam];
      
      if (makerTricks >= 3) {
        if (makerTricks === 5) {
          if (alonePlayer !== null) {
            newScores[makerTeam] += 4; // 4 Points for alone march!
            title = makerTeam === 0 ? "LONE WOLF MARCH!" : "LONE BOT MARCH!";
            msg = makerTeam === 0 ? "You swept all 5 tricks ALONE! +4 Pts" : "They swept all 5 tricks ALONE! +4 Pts";
          } else {
            newScores[makerTeam] += 2;
            title = makerTeam === 0 ? "YOUR TEAM MARCHED!" : "OPPONENTS MARCHED!";
            msg = makerTeam === 0 ? "Swept all 5 tricks. +2 Pts" : "They swept all 5 tricks. +2 Pts";
          }
        } else {
          newScores[makerTeam] += 1;
          title = makerTeam === 0 ? "HAND WON!" : "HAND LOST";
          msg = makerTeam === 0 ? `Your team took ${makerTricks} tricks. +1 Pt` : `Opponents took ${makerTricks} tricks. +1 Pt`;
        }
      } else {
        // EUCHRED SCENARIO! Dynamic, flashy re-score styling
        newScores[defenderTeam] += 2;
        isEuchre = true;
        
        if (defenderTeam === 0) {
          title = "⚡ EUCHRED! ⚡";
          msg = "YOU EUCHRED THEM! +2 POINTS!";
        } else {
          title = "💀 EUCHRED! 💀";
          msg = "YOUR TEAM GOT EUCHRED! OPPONENTS +2 POINTS!";
        }
      }
      
      setScores(newScores);
      setRoundResult({ title, desc: msg, isEuchre });
      setMessage(msg);

      // Play conditional sound effect for hand evaluation
      if (isEuchre) {
        if (defenderTeam === 0) { // Good Guys defended successfully and Euchred the Bots
           playSound('euchred_happy');
        } else { // Bots defended successfully and Euchred the Good Guys
           playSound('euchred_sad');
        }
      } else {
        playSound('hand_win');
      }

      // In the Barn Sound Logic!
      const justHitBarn = (newScores[0] === 9 && scores[0] < 9) || (newScores[1] === 9 && scores[1] < 9);
      if (justHitBarn) {
        setTimeout(() => playSound('in_the_barn'), 1200); // Wait for the hand_win sound to mostly finish
      }
      
      const scoreDelay = setTimeout(() => {
        if (newScores[0] >= 10 || newScores[1] >= 10) {
          setGameState('game_over');
          setMessage(newScores[0] >= 10 ? 'YOU WON THE GAME!' : 'BOTS WON THE GAME!');
          playSound(newScores[0] >= 10 ? 'game_won' : 'game_lost');
          
          setStats(prev => {
            const won = newScores[0] >= 10;
            const updated = { played: prev.played + 1, won: prev.won + (won ? 1 : 0), lost: prev.lost + (won ? 0 : 1) };
            try { localStorage.setItem('euchre_stats', JSON.stringify(updated)); } catch(e) {}
            return updated;
          });
        } else {
          const nextDealer = (dealer + 1) % 4;
          startRound(nextDealer); // Skip Jack search for subsequent rounds
          setCurrentRenegeQuote(null);
        }
      }, 4000);
      return () => clearTimeout(scoreDelay);
    }
  }, [gameState]);

  // Handle redealing transition pause after caught reneging
  useEffect(() => {
    if (gameState === 'renege_caught') {
      const timer = setTimeout(() => {
        if (scores[0] >= 10 || scores[1] >= 10) {
          setGameState('game_over');
          setMessage(scores[0] >= 10 ? 'YOU WON THE GAME!' : 'BOTS WON THE GAME!');
          playSound(scores[0] >= 10 ? 'game_won' : 'game_lost');
          
          setStats(prev => {
            const won = scores[0] >= 10;
            const updated = { played: prev.played + 1, won: prev.won + (won ? 1 : 0), lost: prev.lost + (won ? 0 : 1) };
            try { localStorage.setItem('euchre_stats', JSON.stringify(updated)); } catch(e) {}
            return updated;
          });
        } else {
          const nextDealer = (dealer + 1) % 4;
          setCurrentRenegeQuote(null);
          startRound(nextDealer);
        }
      }, 4500); // 4.5 seconds of caught screen laughing space
      return () => clearTimeout(timer);
    }
  }, [gameState, scores, dealer]);

  // --- MAIN RENDER (Menu Screen) ---
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-700 via-green-900 to-gray-900 flex flex-col items-center justify-center text-white p-4 font-sans relative overflow-y-auto">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

        {/* Background Decor */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
        
        {/* STATS BUTTON */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
          <button 
            onClick={() => { setShowStatsModal(true); playSound('click'); }}
            className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-2 px-3 sm:px-4 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] text-xs sm:text-sm tracking-wider transition-all hover:scale-105 active:scale-95 border-2 border-yellow-200 flex items-center gap-1.5 sm:gap-2"
          >
            <span className="text-sm sm:text-base leading-none">📊</span>
            <span className="hidden sm:inline">STATS</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center p-6 sm:p-10 my-4 bg-black/45 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl max-w-lg w-full">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white via-yellow-200 to-amber-500 bg-clip-text text-transparent text-center select-none">
            AI EUCHRE
          </h1>
          
          <div className="flex gap-4 sm:gap-6 mb-6 bg-white/5 px-6 py-4 rounded-2xl shadow-inner border border-white/5 select-none">
              <span className="text-red-500 text-3xl sm:text-5xl drop-shadow-md transform hover:scale-110 transition-transform">♥</span>
              <span className="text-slate-200 text-3xl sm:text-5xl drop-shadow-md transform hover:scale-110 transition-transform">♠</span>
              <span className="text-red-500 text-3xl sm:text-5xl drop-shadow-md transform hover:scale-110 transition-transform">♦</span>
              <span className="text-slate-200 text-3xl sm:text-5xl drop-shadow-md transform hover:scale-110 transition-transform">♣</span>
          </div>

          <p className="text-center mb-6 text-green-100/90 text-sm sm:text-base font-medium leading-relaxed max-w-sm">
            Play classic Euchre alongside highly strategic neural opponents. First team to 10 wins!
          </p>

          {/* COLOR SELECTOR */}
          <div className="w-full mb-6 text-center">
            <h3 className="text-xs uppercase tracking-widest text-yellow-400 font-extrabold mb-3">Select Deck Theme</h3>
            <div className="flex justify-center gap-3">
              {DECK_COLORS.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => { setSelectedDeckId(deck.id); playSound('click'); }}
                  className={`w-9 h-12 rounded-lg border-2 shadow-lg relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${selectedDeckId === deck.id ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110' : 'border-white/10 hover:border-white/40'}`}
                  title={deck.name}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${deck.bg}`} />
                  <div className="absolute inset-[1px] border border-white/30 rounded"></div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Active: {DECK_COLORS.find(d => d.id === selectedDeckId)?.name}
            </p>
          </div>

          {/* DIFFICULTY SELECTOR */}
          <div className="w-full mb-8 text-center font-sans">
            <h3 className="text-xs uppercase tracking-widest text-yellow-400 font-extrabold mb-3">Set Match Difficulty</h3>
            <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
              <button
                onClick={() => { setDifficulty('normal'); playSound('click'); }}
                className={`flex-1 py-2 text-xs font-black rounded-full tracking-wider transition-all duration-300
                  ${difficulty === 'normal' 
                    ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                NORMAL
              </button>
              <button
                onClick={() => { setDifficulty('hard'); playSound('click'); }}
                className={`flex-1 py-2 text-xs font-black rounded-full tracking-wider transition-all duration-300
                  ${difficulty === 'hard' 
                    ? 'bg-gradient-to-r from-red-600 to-orange-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                HARD (RENEGE ON ⚠️)
              </button>
            </div>
            {difficulty === 'hard' ? (
              <p className="text-[11px] text-red-300 mt-2 px-2 italic leading-tight">
                Warning: AI checks your follow-suit strictly! You can play out of suit, but get caught and opponents gain +2 Points instantly!
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2 px-2 italic leading-tight">
                Perfect for friendly play. Suit restrictions are fully automated for you.
              </p>
            )}
          </div>

          <button 
            onClick={handleStartGameRequest}
            className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-4 px-12 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] text-xl tracking-wider transition-all hover:scale-105 active:scale-95 border-2 border-yellow-200 pointer-events-auto"
          >
            START GAME
          </button>
        </div>

        {/* HARD LEVEL WARNING CONFIRM DIALOG */}
        {showWarningModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-2 border-red-500/50 p-6 sm:p-10 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.4)] text-center w-full max-w-md pointer-events-auto">
               <div className="text-5xl mb-4 animate-bounce">⚠️</div>
               <h2 className="text-2xl sm:text-3xl font-black text-red-500 uppercase tracking-widest mb-3">
                 RENEGING CONFLICT WARN
               </h2>
               <div className="bg-red-950/20 rounded-xl p-4 border border-red-900/30 mb-8 text-left text-xs sm:text-sm text-slate-200 space-y-3 leading-relaxed">
                 <p>You are starting a match on <strong className="text-red-400">HARD LEVEL</strong>.</p>
                 <p>In Euchre, "Reneging" is the illegal act of playing out of suit when you actually have matching suit cards in your hand.</p>
                 <p>Unlike Normal Mode, <strong className="text-yellow-400">suit restriction gates are unlocked for you</strong>. If you make a mistake and play out of suit:</p>
                 <ul className="list-disc pl-5 text-red-300 space-y-1">
                   <li>The neural AI bots will catch you instantly!</li>
                   <li>They will call "Renege!" and stop the hand.</li>
                   <li>Opponents win <strong className="text-red-400">+2 Points</strong> immediately.</li>
                 </ul>
               </div>
               <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                   onClick={() => { setShowWarningModal(false); playSound('click'); }}
                   className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-full border border-neutral-600 transition-all text-xs"
                 >
                   GO BACK
                 </button>
                 <button 
                   onClick={confirmStartNewGame}
                   className="flex-1 bg-gradient-to-r from-red-600 to-orange-700 text-white font-black py-3 px-6 rounded-full shadow-lg border border-red-400 hover:brightness-110 transition-all text-xs"
                 >
                   I UNDERSTAND, DEAL IN!
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* STATS MODAL */}
        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-2 border-yellow-500/50 p-6 sm:p-10 rounded-3xl shadow-[0_0_80px_rgba(234,179,8,0.4)] text-center w-full max-w-sm pointer-events-auto relative">
               <h2 className="text-2xl sm:text-3xl font-black text-yellow-400 uppercase tracking-widest mb-6">
                 Player Stats
               </h2>
               <div className="grid grid-cols-2 gap-4 text-slate-200 mb-8">
                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center shadow-inner">
                   <span className="text-3xl sm:text-4xl font-black text-white">{stats.played}</span>
                   <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Matches</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center shadow-inner">
                   <span className="text-3xl sm:text-4xl font-black text-yellow-400">
                     {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                   </span>
                   <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Win Rate</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center shadow-inner">
                   <span className="text-3xl sm:text-4xl font-black text-green-400">{stats.won}</span>
                   <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Wins</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center shadow-inner">
                   <span className="text-3xl sm:text-4xl font-black text-red-400">{stats.lost}</span>
                   <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Losses</span>
                 </div>
               </div>
               <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => { setShowStatsModal(false); playSound('click'); }}
                   className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black py-3 px-6 rounded-full shadow-lg border border-yellow-300 hover:brightness-110 transition-all text-sm tracking-wider"
                 >
                   CLOSE
                 </button>
                 <button 
                   onClick={() => {
                     const reset = { played: 0, won: 0, lost: 0 };
                     setStats(reset);
                     try { localStorage.setItem('euchre_stats', JSON.stringify(reset)); } catch(e) {}
                     playSound('card_flick');
                   }}
                   className="w-full bg-transparent hover:bg-white/5 text-slate-400 font-bold py-3 px-6 rounded-full border border-slate-600 transition-all text-xs tracking-wider mt-2"
                 >
                   RESET STATS
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN RENDER (Active Gameboard Screen) ---
  return (
    <div className="h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-800 via-green-900 to-slate-900 font-sans overflow-hidden text-white selection:bg-transparent relative">
      
      {/* Custom Styles safely injected */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Main Board View: Fully wrapped inside Safe Area Boundaries */}
      <div className="absolute inset-0 flex flex-col justify-between" style={getSafeAreaStyles()}>
        
        {/* Top Bar: Score, Partner Layout & Turn Notification */}
        <div className="p-4 w-full flex justify-between items-start z-30 max-w-6xl mx-auto relative pointer-events-none">
          {/* Score Panel: Good Guys */}
          <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col min-w-[110px] pointer-events-auto transition-all">
            <span className="font-black text-yellow-400 text-xs sm:text-base tracking-wide whitespace-nowrap">GOOD GUYS POINTS: {scores[0]}</span>
            <span className="text-green-300 text-xs sm:text-sm font-extrabold mt-1 tracking-wider">TRICKS: {tricksTaken[0]}</span>
            {scores[0] === 9 && (
              <span className="text-[9px] sm:text-xs text-yellow-300 font-black tracking-widest mt-1.5 animate-pulse text-center bg-yellow-950/45 px-2 py-0.5 rounded border border-yellow-500/20">
                🚜 IN THE BARN! 🐄
              </span>
            )}
          </div>

          {/* Suit Led Indicator (Now safely in the top bar layout gap) */}
          {trick.length > 0 && trick[0] && (
            <div className="absolute top-1 sm:top-4 left-[24%] sm:left-[28%] flex flex-col items-center z-10 pointer-events-none transform -rotate-[10deg] animate-fade-in origin-top scale-[0.6] sm:scale-75 md:scale-90">
              <div className="bg-black/90 border border-slate-400/60 text-slate-200 text-[12px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.5)] mb-[-2px] z-10">
                Suit Led
              </div>
              <div className="bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 p-[3px] sm:p-1 rounded-xl shadow-[0_8px_25px_rgba(148,163,184,0.4)]">
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-[#fdfdfd] rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center relative overflow-hidden border border-gray-300">
                   <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
                   <div className="absolute inset-1 sm:inset-1.5 border-[0.5px] border-slate-400/40 rounded-md pointer-events-none"></div>
                   <div className="absolute top-1 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center font-serif z-10">
                     <span className={`text-sm sm:text-base leading-none ${getSuitColor(getEffectiveSuit(trick[0].card, trump))}`}>{getEffectiveSuit(trick[0].card, trump)}</span>
                   </div>
                   <span className={`text-5xl sm:text-6xl drop-shadow-md ${getSuitColor(getEffectiveSuit(trick[0].card, trump))} transform scale-110 z-20`}>{getEffectiveSuit(trick[0].card, trump)}</span>
                   <div className="absolute bottom-1 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center rotate-180 font-serif z-10">
                     <span className={`text-sm sm:text-base leading-none ${getSuitColor(getEffectiveSuit(trick[0].card, trump))}`}>{getEffectiveSuit(trick[0].card, trump)}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Partner Center Hand */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-0 pointer-events-auto">
            {/* Sitting Out view only triggers when NOT discarding, so partner dealers can perform their discards! */}
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 2 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 w-44 h-24 flex flex-col items-center justify-center text-center shadow-2xl animate-fade-in">
                <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase">Sitting Out</span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-1">Partner is playing Alone</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 2, trump)}>
                <div className={`flex -space-x-6 sm:-space-x-10 pt-4 sm:pt-6 pb-4 sm:pb-6 px-6 sm:px-10 relative ${getMakerInnerClasses(maker, 2, trump)}`}>
                   {getRenderedHand(2).map((_, i) => <div className="shadow-[0_4px_10px_rgba(0,0,0,0.4)]" key={`partner_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 2, "-bottom-2 -right-6 sm:-bottom-4 sm:-right-8")}
                </div>
              </div>
            )}
            {/* Badge over cards */}
            {renderPlayerBadge(currentPlayer, gameState, 2, "Your Partner", maker, trump, "absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 z-50")}

            {/* Player Bidding Decision Bubble */}
            {biddingDecisions[2] && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-xl text-[10px] sm:text-xs font-black tracking-wide text-center
                  ${biddingDecisions[2] === 'Pass' 
                    ? 'bg-black/90 border-slate-500/50 text-slate-300' 
                    : biddingDecisions[2].includes('Alone') 
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-700 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                      : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'
                  }`}
                >
                  <span className="block font-medium text-[8px] uppercase opacity-75 leading-none mb-0.5 font-sans">Partner Bid</span>
                  <span className="uppercase">{biddingDecisions[2]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Trump Indicator (Now safely in the top bar layout gap) */}
          {trump && (
            <div className="absolute top-1 sm:top-4 right-[24%] sm:right-[28%] flex flex-col items-center z-10 pointer-events-none transform rotate-[10deg] animate-fade-in origin-top scale-[0.6] sm:scale-75 md:scale-90">
              <div className="bg-black/90 border border-yellow-500/60 text-yellow-400 text-[12px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.5)] mb-[-2px] z-10">
                Trump
              </div>
              <div className="bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 p-[3px] sm:p-1 rounded-xl shadow-[0_8px_25px_rgba(234,179,8,0.5)]">
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-[#fdfdfd] rounded-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center relative overflow-hidden border border-gray-300">
                   <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
                   <div className="absolute inset-1 sm:inset-1.5 border-[0.5px] border-yellow-600/40 rounded-md pointer-events-none"></div>
                   <div className="absolute top-1 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center font-serif z-10">
                     <span className={`text-sm sm:text-base leading-none ${getSuitColor(trump)}`}>{trump}</span>
                   </div>
                   <span className={`text-5xl sm:text-6xl drop-shadow-md ${getSuitColor(trump)} transform scale-110 z-20`}>{trump}</span>
                   <div className="absolute bottom-1 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center rotate-180 font-serif z-10">
                     <span className={`text-sm sm:text-base leading-none ${getSuitColor(trump)}`}>{trump}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Panels - Bot Team */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col text-right min-w-[110px] pointer-events-auto transition-all">
            <span className="font-black text-red-400 text-xs sm:text-base tracking-wide whitespace-nowrap">BOT TEAM: {scores[1]}</span>
            <span className="text-green-300 text-xs sm:text-sm font-extrabold mt-1 tracking-wider">TRICKS: {tricksTaken[1]}</span>
            {scores[1] === 9 && (
              <span className="text-[9px] sm:text-xs text-red-300 font-black tracking-widest mt-1.5 animate-pulse text-center bg-red-950/45 px-2 py-0.5 rounded border border-red-500/20">
                🚜 IN THE BARN! 🐄
              </span>
            )}
          </div>
        </div>

        {/* Game Table Area */}
        <div className="absolute inset-0 flex items-center justify-center perspective-1000 z-10 pointer-events-none">
          
          {/* Game Message Box */}
          <div className="absolute top-[18%] sm:top-[22%] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md flex justify-center pointer-events-none">
            {gameState !== 'finding_dealer' && gameState !== 'round_over' && gameState !== 'no_trump_passed' && gameState !== 'renege_caught' && (
              <div className="text-white text-sm sm:text-base font-bold bg-black/60 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.6)] text-center w-full pointer-events-auto transition-all select-none">
                {message}
              </div>
            )}
          </div>

          {/* Table central felt highlight */}
          <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Left Player (West) */}
          <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
            {/* Sitting Out view only triggers when NOT discarding, so partner dealers can perform their discards! */}
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 1 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 w-24 h-40 flex flex-col items-center justify-center text-center shadow-2xl rotate-90 animate-fade-in">
                <span className="text-yellow-400 font-bold text-xs tracking-widest uppercase">Sitting Out</span>
                <span className="text-[9px] text-slate-400 mt-1">Playing Alone</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 1, trump)}>
                <div className={`flex flex-col -space-y-8 sm:-space-y-12 py-6 sm:py-10 px-4 sm:px-6 relative ${getMakerInnerClasses(maker, 1, trump)}`}>
                   {getRenderedHand(1).map((_, i) => <div className="rotate-90 transform hover:-translate-x-2 transition-transform shadow-[4px_0_10px_rgba(0,0,0,0.4)]" key={`bot1_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 1, "-bottom-4 -right-4 sm:-bottom-6 sm:-right-6")}
                </div>
              </div>
            )}
            {/* Badge over cards */}
            {renderPlayerBadge(currentPlayer, gameState, 1, "Bot 1", maker, trump, "absolute left-8 sm:left-14 -rotate-90 z-50")}

            {/* Player Bidding Decision Bubble */}
            {biddingDecisions[1] && (
              <div className="absolute left-24 sm:left-36 top-1/2 -translate-y-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-xl text-[10px] sm:text-xs font-black tracking-wide text-center
                  ${biddingDecisions[1] === 'Pass' 
                    ? 'bg-black/90 border-slate-500/50 text-slate-300' 
                    : biddingDecisions[1].includes('Alone') 
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-700 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                      : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'
                  }`}
                >
                  <span className="block font-medium text-[8px] uppercase opacity-75 leading-none mb-0.5">Bot 1 Bid</span>
                  <span className="uppercase">{biddingDecisions[1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Player (East) */}
          <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
            {/* Sitting Out view only triggers when NOT discarding, so partner dealers can perform their discards! */}
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 3 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 w-44 h-24 flex flex-col items-center justify-center text-center shadow-2xl -rotate-90 animate-fade-in">
                <span className="text-yellow-400 font-bold text-xs tracking-widest uppercase">Sitting Out</span>
                <span className="text-[9px] text-slate-400 mt-1">Playing Alone</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 3, trump)}>
                <div className={`flex flex-col -space-y-8 sm:-space-y-12 py-6 sm:py-10 px-4 sm:px-6 relative ${getMakerInnerClasses(maker, 3, trump)}`}>
                   {getRenderedHand(3).map((_, i) => <div className="-rotate-90 transform hover:translate-x-2 transition-transform shadow-[-4px_0_10px_rgba(0,0,0,0.4)]" key={`bot2_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 3, "-bottom-4 -left-4 sm:-bottom-6 sm:-left-6")}
                </div>
              </div>
            )}
            {/* Badge over cards */}
            {renderPlayerBadge(currentPlayer, gameState, 3, "Bot 2", maker, trump, "absolute right-8 sm:right-14 rotate-90 z-50")}

            {/* Player Bidding Decision Bubble */}
            {biddingDecisions[3] && (
              <div className="absolute right-24 sm:right-36 top-1/2 -translate-y-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-xl text-[10px] sm:text-xs font-black tracking-wide text-center
                  ${biddingDecisions[3] === 'Pass' 
                    ? 'bg-black/90 border-slate-500/50 text-slate-300' 
                    : biddingDecisions[3].includes('Alone') 
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-700 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                      : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'
                  }`}
                >
                  <span className="block font-medium text-[8px] uppercase opacity-75 leading-none mb-0.5">Bot 2 Bid</span>
                  <span className="uppercase">{biddingDecisions[3]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Center Play Area */}
          <div className="w-44 h-44 sm:w-60 sm:h-60 rounded-full border border-white/10 bg-black/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative flex items-center justify-center backdrop-blur-sm z-10 pointer-events-auto">
            
            {/* Finding Dealer Overlay & Central Elements */}
            {gameState === 'finding_dealer' && (
              <>
                {findingDealerPhase === 'initial_pause' && (
                  <div className="absolute z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md border border-yellow-500/50 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.4)] text-center w-64 sm:w-80 animate-fade-in">
                     <h2 className="text-2xl sm:text-3xl font-black text-yellow-400 mb-2 uppercase tracking-wider text-center">
                       First Jack Deals!
                     </h2>
                     <p className="text-sm sm:text-base text-white font-medium text-center">Dealing cards to find the first dealer...</p>
                  </div>
                )}

                {findingDealerPhase === 'dealing' && (
                  <div className="absolute z-0 flex flex-col items-center justify-center animate-fade-in">
                    {/* Large Dealer Coin in Center */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_6px_8px_rgba(255,255,255,1),inset_0_-6px_8px_rgba(0,0,0,0.2)] border-[5px] border-gray-900 relative">
                       <div className="absolute inset-[2px] border-[1px] border-dotted border-gray-400 rounded-full opacity-60"></div>
                       <span className="text-gray-900 font-black text-sm sm:text-base tracking-widest leading-none">DEALER</span>
                    </div>
                  </div>
                )}

                {/* Glowing Announcement Box is hidden during 'highlighting_jack' to avoid covering the player cards! */}
                {findingDealerPhase === 'found' && (
                  <div className="absolute z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md border border-green-500/50 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.4)] text-center w-64 sm:w-80 animate-fade-in animate-pulse">
                     <h2 className="text-2xl sm:text-3xl font-black text-green-400 mb-2 uppercase tracking-wider text-center">
                       Dealer Selected
                     </h2>
                     <p className="text-sm sm:text-base text-white font-medium text-center">{message}</p>
                  </div>
                )}
              </>
            )}

            {/* Shuffling Transition Visual Deck */}
            {gameState === 'dealing_cards' && dealAnimationStep === 'shuffling' && (
              <div className="absolute z-40 flex items-center justify-center w-full h-full">
                <div className="relative w-16 h-24 sm:w-24 sm:h-36">
                  <div className="absolute inset-0 shadow-lg transform -translate-y-1">{renderCardBack(activeDeckStyle)}</div>
                  <div className="absolute inset-0 shadow-lg animate-shuffle-left">{renderCardBack(activeDeckStyle)}</div>
                  <div className="absolute inset-0 shadow-lg animate-shuffle-right">{renderCardBack(activeDeckStyle)}</div>
                </div>
              </div>
            )}

            {/* Distributing Cards Visual Stack */}
            {gameState === 'dealing_cards' && dealAnimationStep === 'distributing' && (
              <div className="absolute z-40 flex items-center justify-center w-full h-full">
                <div className="relative w-16 h-24 sm:w-24 sm:h-36 shadow-2xl">
                  {renderCardBack(activeDeckStyle)}
                </div>
              </div>
            )}

            {/* 3D Flipping Up-Card Step */}
            {gameState === 'dealing_cards' && dealAnimationStep === 'flipping' && upCard && (
              <div className="absolute z-50 flex flex-col items-center justify-center">
                <span className="text-[10px] sm:text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2 drop-shadow-md">
                  Up Card Flip
                </span>
                <div className="perspective-1000 w-16 h-24 sm:w-24 sm:h-36 shadow-2xl">
                  <div 
                    className={`relative w-full h-full duration-700 ease-out transform-style-3d ${isUpCardFlipped ? 'rotate-y-0' : 'rotate-y-180'}`}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden z-10">
                      {renderCard(upCard)}
                    </div>
                    {/* Back Side */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      {renderCardBack(activeDeckStyle)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Trick OR Dealing Sequence Cards */}
            {(gameState === 'finding_dealer' ? dealerSequence : trick).map((play) => {
               let posClass = "";
               if (play.player === 0) posClass = "translate-y-14 sm:translate-y-24 z-40";
               if (play.player === 1) posClass = "-translate-x-16 sm:-translate-x-28 z-20 -rotate-[15deg]";
               if (play.player === 2) posClass = "-translate-y-14 sm:-translate-y-24 z-10 rotate-[8deg]";
               if (play.player === 3) posClass = "translate-x-16 sm:translate-x-28 z-30 rotate-[15deg]";
               
               const isWinningJack = gameState === 'finding_dealer' && 
                                     play.card.rank === 'J' && 
                                     (findingDealerPhase === 'highlighting_jack' || findingDealerPhase === 'found') && 
                                     play.player === jackWinnerId;

               return (
                 <div 
                   key={play.player} 
                   className={`absolute ${posClass} transition-all duration-300 ease-out
                     ${isWinningJack 
                       ? 'ring-4 ring-yellow-400 rounded-xl shadow-[0_0_40px_rgba(234,179,8,1)] scale-110 z-50 animate-pulse' 
                       : 'shadow-[0_10px_20px_rgba(0,0,0,0.5)]'}`}
                 >
                   {renderCard(play.card)}
                 </div>
               )
            })}

            {/* Funny "No Trump Passed" Redealing Transition Overlay */}
            {gameState === 'no_trump_passed' && noTrumpMessage && (
              <div className="absolute z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-yellow-500/40 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.4)] text-center w-72 sm:w-[22rem] animate-fade-in">
                 <div className="text-5xl mb-3 animate-bounce select-none">🐔💨💤</div>
                 <h2 className="text-xl sm:text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide leading-tight text-center">
                   {noTrumpMessage.title}
                 </h2>
                 <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed text-center">
                   {noTrumpMessage.desc}
                 </p>
                 <div className="mt-4 flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full animate-pulse">
                    <span>Passing Dealer Coin</span>
                    <span className="animate-ping">⚪</span>
                 </div>
              </div>
            )}

            {/* Round Over Overlay - Upgraded Flashy Euchre Display */}
            {gameState === 'round_over' && (
              <div className={`absolute z-50 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl text-center w-72 sm:w-[22rem] transition-all duration-500 backdrop-blur-md border
                ${roundResult.isEuchre 
                  ? 'bg-gradient-to-br from-[#6b0202] via-[#210202] to-black border-red-500 euchred-overlay-flashy' 
                  : 'bg-black/90 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)]'}`}
              >
                 {roundResult.isEuchre && (
                   <div className="text-4xl mb-3 animate-bounce select-none">⚡💥💀</div>
                 )}
                 <h2 className={`text-2xl sm:text-4xl font-black tracking-wider mb-2
                   ${roundResult.isEuchre 
                     ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.95)]' 
                     : (roundResult.title.includes('WON') || roundResult.title.includes('YOUR') || roundResult.title.includes('SUCCESS') ? 'text-yellow-400' : 'text-red-400')}`}
               >
                 {roundResult.title}
               </h2>
               <p className={`text-sm sm:text-base font-bold text-white leading-relaxed ${roundResult.isEuchre ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : ''}`}>
                 {roundResult.desc}
               </p>
               {roundResult.isEuchre && (
                 <div className="mt-4 bg-yellow-500 text-black text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(234,179,8,0.3)] animate-pulse">
                   Double Points Added!
                 </div>
               )}
              </div>
            )}

            {/* Bidding/Dealing UI */}
            {trick.length === 0 && !['round_over', 'finding_dealer', 'no_trump_passed', 'dealing_cards', 'renege_caught'].includes(gameState) && (
              <div className="flex flex-col items-center z-10">
                {['bid1', 'bid2', 'discard'].includes(gameState) && upCard && (
                   <div className="mb-4 text-center animate-fade-in-up">
                     <div className="text-xs sm:text-sm font-semibold text-green-200 mb-2 uppercase tracking-wider drop-shadow-md">Up Card</div>
                     <div className="shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-xl transform hover:scale-105 transition-transform">
                        {renderCard(upCard)}
                     </div>
                   </div>
                )}
                {gameState === 'bid2' && !upCard && (
                  <div className="text-green-200 text-sm italic border border-white/20 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full shadow-lg">
                    Up card passed & discarded.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FLASHY CHEATER / RENEGE INTERSTITIAL MODAL */}
        {gameState === 'renege_caught' && currentRenegeQuote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-[#800] via-[#300] to-black border-4 border-red-500 euchred-overlay-flashy p-8 sm:p-12 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.8)] text-center w-full max-w-md pointer-events-auto">
               <div className="text-6xl mb-4 animate-bounce">🚨🫵🤖</div>
               <h2 className="text-3xl sm:text-4xl font-black text-red-500 uppercase tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] leading-tight">
                 {currentRenegeQuote.title}
               </h2>
               <p className="text-base sm:text-lg text-slate-100 font-extrabold mb-6 leading-relaxed">
                 {currentRenegeQuote.desc}
               </p>
               <div className="bg-yellow-500 text-black text-xs sm:text-sm font-black tracking-widest uppercase py-2.5 px-6 rounded-full shadow-lg inline-block animate-pulse">
                 OPPONENTS: +2 POINTS! 💸
               </div>
            </div>
          </div>
        )}

        {/* Funny Early Round Skip / Fast-Forward Button */}
        {isHandDecided() && funnySkipText && (
          <div className="absolute bottom-28 left-4 sm:bottom-36 sm:left-8 z-[80] pointer-events-auto animate-fade-in">
            <button 
              onClick={handleEarlyTermination}
              className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 hover:from-red-500 hover:to-orange-500 text-white font-extrabold py-2.5 px-5 sm:py-3.5 sm:px-7 rounded-full border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] text-xs sm:text-sm tracking-widest transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 uppercase animate-pulse"
            >
              <span>{funnySkipText}</span>
            </button>
          </div>
        )}

        {/* User Actions & Hand (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-24 pb-4 sm:pb-6 px-4 flex flex-col items-center z-30 pointer-events-none">
          
          {/* Contextual Action Buttons */}
          <div className="flex flex-col items-center gap-3 mb-3 relative w-full pointer-events-auto">
            {/* Go Alone Luxury Toggle Option */}
            {currentPlayer === 0 && ['bid1', 'bid2'].includes(gameState) && (
              <label className="flex items-center gap-2 cursor-pointer bg-black/60 px-5 py-2 rounded-full border border-yellow-500/30 text-xs sm:text-sm font-bold text-yellow-400 select-none animate-pulse hover:border-yellow-400 transition-all duration-300">
                <input 
                  type="checkbox" 
                  checked={goAlone} 
                  disabled={isBiddingPaused}
                  onChange={(e) => { setGoAlone(e.target.checked); playSound('click'); }} 
                  className="accent-yellow-500 w-4 h-4 rounded cursor-pointer"
                />
                <span className="tracking-wide">GO ALONE 🚀 (4 PTS IF MARCHE)</span>
              </label>
            )}

            {currentPlayer === 0 && gameState === 'bid1' && (
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const canOrderUp = upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit);
                    if (canOrderUp) handleBid(0, 'order_up', null, goAlone);
                  }} 
                  disabled={isBiddingPaused || !(upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit))}
                  title={!(upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit)) ? `You need at least one ${upCard?.suit} in your hand to order it up!` : ''}
                  className={`bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-3 px-8 rounded-full shadow-[0_4px_15px_rgba(234,179,8,0.4)] transition-transform hover:scale-105 active:scale-95 border border-yellow-200 ${isBiddingPaused || !(upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit)) ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                >
                  Order Up {upCard?.suit} {goAlone && "Alone"}
                </button>
                <button 
                  onClick={() => handleBid(0, 'pass')} 
                  disabled={isBiddingPaused}
                  className={`bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95 border-slate-500 ${isBiddingPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pass
                </button>
              </div>
            )}

            {currentPlayer === 0 && gameState === 'bid2' && (
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUITS.filter(s => s !== upCard?.suit).map(suit => (
                  <button 
                    key={suit} 
                    onClick={() => handleBid(0, 'call', suit, goAlone)}
                    disabled={isBiddingPaused}
                    className={`bg-gradient-to-b from-white to-gray-200 hover:from-white hover:to-white text-black font-bold py-3 px-6 rounded-full shadow-[0_4px_15px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95 border-gray-300 flex items-center gap-2 ${isBiddingPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Make <span className={`text-2xl ${getSuitColor(suit)} leading-none drop-shadow-sm`}>{suit}</span> {goAlone && "Alone"}
                  </button>
                ))}
                <button 
                  onClick={() => handleBid(0, 'pass')} 
                  disabled={isBiddingPaused}
                  className={`bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95 border-slate-500 sm:ml-4 ${isBiddingPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pass
                </button>
              </div>
            )}

            {currentPlayer === 0 && gameState === 'discard' && dealer === 0 && (
               <div className="text-yellow-400 font-bold bg-black/60 border border-yellow-400/30 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse">
                  Select a card from your hand to discard.
               </div>
            )}
          </div>

          {/* User Hand */}
          <div className="flex flex-col items-center relative w-full max-w-3xl pointer-events-auto">
             
             <div className={getMakerFrameClasses(maker, 0, trump)}>
               {/* Render Hand with radial arc effect */}
               <div className={`flex justify-center items-end h-36 sm:h-48 pt-6 sm:pt-10 pb-6 sm:pb-8 px-6 sm:px-12 relative w-max mx-auto ${getMakerInnerClasses(maker, 0, trump)}`}>
                 
                 {/* Badge over user cards */}
                 {renderPlayerBadge(currentPlayer, gameState, 0, "You", maker, trump, "absolute -bottom-4 sm:-bottom-6 left-1/2 transform -translate-x-1/2 z-[60]")}
                 {renderDealerCoin(dealer, 0, "top-4 right-2 sm:top-6 sm:right-4")}

                 {/* Player Bidding Decision Bubble */}
                 {biddingDecisions[0] && (
                   <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-[80] flex items-center justify-center animate-bounce">
                     <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-xl text-[10px] sm:text-xs font-black tracking-wide text-center
                       ${biddingDecisions[0] === 'Pass' 
                         ? 'bg-black/90 border-slate-500/50 text-slate-300' 
                         : biddingDecisions[0].includes('Alone') 
                           ? 'bg-gradient-to-r from-yellow-600 to-amber-700 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                           : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'
                       }`}
                     >
                       <span className="block font-medium text-[8px] uppercase opacity-75 leading-none mb-0.5 font-sans">Your Bid</span>
                       <span className="uppercase">{biddingDecisions[0]}</span>
                     </div>
                   </div>
                 )}

                 {/* Sitting Out view only triggers when NOT discarding, so partner dealers can perform their discards! */}
                 {alonePlayer !== null && (alonePlayer + 2) % 4 === 0 && gameState !== 'discard' ? (
                   <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 w-44 h-24 flex flex-col items-center justify-center text-center shadow-2xl animate-fade-in relative z-50">
                     <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase">Sitting Out</span>
                     <span className="text-[10px] sm:text-xs text-slate-400 mt-1">Partner is playing Alone</span>
                   </div>
                 ) : (
                   getRenderedHand(0).map((card, index) => {
                     let isPlayable = false;
                     if (gameState === 'discard' && dealer === 0) isPlayable = true;
                     if (gameState === 'playing') {
                        const validPlays = getValidPlays(hands[0], trick, trump);
                        isPlayable = validPlays.some(c => c.id === card.id);
                     }

                     // Calculate arc styling for the cards to make them fanning out realistically
                     const totalCards = getRenderedHand(0).length;
                     const offset = index - (totalCards - 1) / 2;
                     const rotation = offset * 6; // Spread angle
                     const translateY = Math.abs(offset) * 8; // Vertical drop for edge cards
                     const zIndex = 10 + index; // Layer properly

                     return (
                       <div 
                         key={card.id} 
                         className="origin-bottom -ml-4 sm:-ml-6 first:ml-0 transition-transform duration-300 ease-out hover:-translate-y-6 sm:hover:-translate-y-8 z-10 hover:z-50"
                         style={{ 
                           transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                           zIndex: zIndex
                         }}
                       >
                         {renderCard(
                           card, 
                           () => {
                             if (gameState === 'discard' && dealer === 0) handleDiscard(index);
                             else if (gameState === 'playing') handlePlayCard(index);
                           }, 
                           isPlayable || gameState !== 'playing' || difficulty === 'hard' // Hard Mode makes all cards clickable so player can renege
                         )}
                       </div>
                     );
                   })
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameState === 'game_over' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {scores[0] >= 10 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[101]">
                {[...Array(60)].map((_, i) => (
                  <div key={i} className="absolute w-3 h-3 sm:w-4 sm:h-4 opacity-0" style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animation: `confettiFall ${Math.random() * 3 + 2}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][Math.floor(Math.random()*5)]
                  }} />
                ))}
              </div>
            )}
            <div className="bg-gradient-to-b from-slate-900 to-black border border-white/10 p-10 sm:p-16 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center w-full max-w-lg relative z-[105]">
               <div className="mb-6 relative flex justify-center">
                 {scores[0] >= 10 ? (
                   <span className="text-6xl sm:text-8xl drop-shadow-lg animate-bounce">🏆</span>
                 ) : (
                   <div className="relative">
                     <div className="absolute inset-x-0 -top-10 sm:-top-14 flex justify-center z-20 pointer-events-none animate-[floatCloud_3s_ease-in-out_infinite]">
                        <div className="text-6xl sm:text-8xl drop-shadow-2xl">☁️</div>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute text-blue-400 text-xl sm:text-3xl" style={{
                            left: `${20 + Math.random() * 60}%`,
                            animation: `rainDrop 1.2s linear infinite`,
                            animationDelay: `${Math.random()}s`
                          }}>💧</div>
                        ))}
                     </div>
                     <span className="text-6xl sm:text-8xl drop-shadow-lg relative z-10 grayscale opacity-80">💀</span>
                   </div>
                 )}
               </div>
               <h2 className={`text-5xl sm:text-7xl font-black mb-4 drop-shadow-lg mt-8 sm:mt-10 ${scores[0] >= 10 ? 'text-yellow-400' : 'text-blue-300'}`}>
                 {scores[0] >= 10 ? 'YOU WON!' : 'YOU LOST'}
               </h2>
               <p className="text-xl sm:text-2xl text-slate-300 mb-10 font-medium">
                 Final Score: <span className={scores[0] >= 10 ? 'text-yellow-400' : 'text-white'}>{scores[0]}</span> - <span className={scores[1] >= 10 ? 'text-red-500' : 'text-white'}>{scores[1]}</span>
               </p>
               <button onClick={confirmStartNewGame} className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-4 px-12 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] text-xl transition-transform hover:scale-105 active:scale-95 border-2 border-yellow-200 w-full sm:w-auto">
                 PLAY AGAIN
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}