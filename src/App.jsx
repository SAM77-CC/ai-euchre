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
  { title: "🤷‍♂️ COLD FEET!", desc: "Brrr! Cold feet all around. Let's try that again with a fresh deck!" },
  { title: "🧙‍♂️ IS THIS DECK CURSED?", desc: "Absolutely nobody wanted to touch that hand. Redealing!" },
  { title: "🙈 CRICKETS...", desc: "The silence is deafening. Shuffling again with a new dealer!" }
];

const FUNNY_SKIP_PHRASES = [
  "Fold 'em! 🧮",
  "Wrap it up! 🌯",
  "Snooze fest! 😴",
  "Throw towel! 🏳️",
  "Skip drama! ⏭️",
  "No time! ⏱️",
  "Boring hand! 🎴",
  "Mercy rule! 🚨"
];

const FUNNY_RENEGE_QUOTES = [
  { title: "🚨 CAUGHT RED-HANDED! 🚨", desc: "You tried to sneak that card past a neural network? Nice try, slick! Bots see EVERYTHING! 🫵🤖" },
  { title: "🐔 COWARDLY CHEATER! 🐔", desc: "You had a lead suit card but tried to play dumb. Absolute amateur hour! Loser! 💀" },
  { title: "🤷‍♂️ ARE YOU FOR REAL? 🤷‍♂️", desc: "Did you 'forget' you had that suit, or is your memory bank malfunctioning? The AI remembers! 🫵🚨" },
  { title: "🤡 BRAIN-FADE! 🤡", desc: "You brought a butterknife to an AI cardfight and got caught! Reneging is illegal! 🇺🇸💸" }
];

const DECK_COLORS = [
  { id: 'sapphire', name: 'Sapphire Blue', bg: 'from-blue-400 via-blue-800 to-blue-950', border: 'border-blue-400/40', preview: 'bg-blue-600' },
  { id: 'crimson', name: 'Crimson Ruby', bg: 'from-red-400 via-red-800 to-red-950', border: 'border-red-400/40', preview: 'bg-red-600' },
  { id: 'emerald', name: 'Emerald Forest', bg: 'from-emerald-400 via-emerald-800 to-emerald-950', border: 'border-emerald-400/40', preview: 'bg-emerald-600' },
  { id: 'amethyst', name: 'Royal Amethyst', bg: 'from-purple-400 via-purple-800 to-purple-950', border: 'border-purple-400/40', preview: 'bg-purple-600' },
  { id: 'obsidian', name: 'Midnight Obsidian', bg: 'from-gray-400 via-gray-800 to-gray-950', border: 'border-gray-500/40', preview: 'bg-neutral-800' }
];

const GLOBAL_CSS = `
  /* Stop the mobile browser from ever shifting or scrolling */
  html, body, #root {
    overflow: hidden !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    position: fixed;
    width: 100%;
  }

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

  /* --- PROFESSIONAL FLUID LAYOUT OVERRIDES --- */

  /* VERTICAL PORTRAIT PHONE MODE (Forces everything onto one screen) */
  @media (max-width: 640px) and (orientation: portrait) {
    .game-table-container {
      transform: scale(0.95);
      transform-origin: center center;
    }
    .game-table-felt {
      width: 145px !important;
      height: 145px !important;
    }
    .fanned-hand-container {
      transform: scale(1) !important;
      margin-bottom: env(safe-area-inset-bottom, 12px) !important;
    }
    .game-message-box {
      top: 17% !important;
    }
  }

  /* HORIZONTAL LANDSCAPE MODE (Clamps massive heights sideways) */
  @media (orientation: landscape) and (max-height: 540px) {
    .game-table-container {
      transform: scale(0.85);
      transform-origin: center center;
    }
    .game-table-felt {
      width: 130px !important;
      height: 130px !important;
    }
    .fanned-hand-container {
      transform: scale(0.75) !important;
      bottom: -10px !important;
    }
  }
`;

const getSuitColor = (suit) => RED_SUITS.includes(suit) ? 'text-[#d40000]' : 'text-[#1a1a1a]';

const renderCard = (card, onClick = null, isPlayable = true) => {
  if (!card) return null;
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);
  
  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`relative w-11 h-16 xs:w-12 xs:h-18 sm:w-24 sm:h-36 bg-[#fdfdfd] rounded-lg sm:rounded-xl shadow-[2px_4px_12px_rgba(0,0,0,0.4)] border border-gray-300 flex flex-col justify-between overflow-hidden
        ${getSuitColor(card.suit)} 
        ${isPlayable && onClick ? 'cursor-pointer hover:-translate-y-4 hover:shadow-[4px_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300' : 'transition-all duration-300'}
        ${!isPlayable ? 'opacity-60 brightness-90' : ''} ring-1 ring-black/10 ring-inset group`}
    >
      <div className="absolute inset-0.5 sm:inset-1.5 border-[0.5px] border-slate-300 rounded-md sm:rounded-lg pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
      
      <div className="absolute top-0.5 left-1 sm:top-2 sm:left-2 flex flex-col items-center font-serif z-10">
        <span className="text-[10px] xs:text-sm sm:text-xl font-bold leading-none tracking-tighter">{card.rank}</span>
        <span className="text-[9px] xs:text-xs sm:text-lg leading-none mt-0.5">{card.suit}</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative w-full h-full p-1.5 sm:p-5">
        {isFaceCard && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <div className="w-6 h-9 xs:w-8 xs:h-12 sm:w-16 sm:h-20 border border-current rounded-sm flex items-center justify-center">
               <span className="text-xl xs:text-2xl sm:text-7xl font-serif">{card.rank}</span>
             </div>
          </div>
        )}
        <span className={`text-xl xs:text-3xl sm:text-6xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 ${isFaceCard ? 'mt-1' : ''}`}>
          {card.suit}
        </span>
      </div>
      
      <div className="absolute bottom-0.5 right-1 sm:bottom-2 sm:right-2 flex flex-col items-center rotate-180 font-serif z-10">
        <span className="text-[10px] xs:text-sm sm:text-xl font-bold leading-none tracking-tighter">{card.rank}</span>
        <span className="text-[9px] xs:text-xs sm:text-lg leading-none mt-0.5">{card.suit}</span>
      </div>
    </div>
  );
};

const renderCardBack = (activeDeckStyle) => {
  return (
    <div className={`w-8 h-12 xs:w-11 xs:h-16 sm:w-20 sm:h-28 rounded-lg sm:rounded-xl shadow-[1px_2px_6px_rgba(0,0,0,0.4)] border ${activeDeckStyle.border} flex items-center justify-center overflow-hidden bg-gradient-to-br ${activeDeckStyle.bg} relative`}>
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,1)_6px,rgba(255,255,255,1)_12px)]"></div>
      <div className="absolute inset-1 sm:inset-1.5 border border-white/60 rounded-md"></div>
    </div>
  );
};

const getEffectiveSuit = (card, trump) => {
  if (!card) return null;
  if (!trump) return card.suit;
  if (card.rank === 'J') {
    if (card.suit === trump) return trump; 
    if (trump === '♥' && card.suit === '♦') return '♥'; 
    if (trump === '♦' && card.suit === '♥') return '♦'; 
    if (trump === '♠' && card.suit === '♣') return '♠'; 
    if (trump === '♣' && card.suit === '♠') return '♣'; 
  }
  return card.suit;
};

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

const shuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCardValue = (card, trump, leadSuit) => {
  const effectiveSuit = getEffectiveSuit(card, trump);
  const isLeft = card.rank === 'J' && effectiveSuit === trump && card.suit !== trump;

  if (effectiveSuit === trump) {
    if (card.rank === 'J' && card.suit === trump) return 1000; 
    if (isLeft) return 900; 
    const trumpRanks = { 'A': 800, 'K': 700, 'Q': 600, '10': 500, '9': 400 };
    return trumpRanks[card.rank];
  }
  if (effectiveSuit === leadSuit) {
    const leadRanks = { 'A': 80, 'K': 70, 'Q': 60, 'J': 55, '10': 50, '9': 40 };
    return leadRanks[card.rank];
  }
  return 0; 
};

const getSortValue = (card, trump) => {
  const suitsOrder = {'♥': 4, '♦': 3, '♣': 2, '♠': 1}; 
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

const getValidPlays = (hand, trick, trump) => {
  if (trick.length === 0) return hand; 
  const leadSuit = getEffectiveSuit(trick[0].card, trump);
  const validCards = hand.filter(c => getEffectiveSuit(c, trump) === leadSuit);
  return validCards.length > 0 ? validCards : hand; 
};

const botBidsAlone = (hand, suit) => {
  const trumps = hand.filter(c => getEffectiveSuit(c, suit) === suit);
  const hasRight = trumps.some(c => c.rank === 'J' && c.suit === suit);
  const hasLeft = trumps.some(c => c.rank === 'J' && c.suit !== suit && getEffectiveSuit(c, suit) === suit);
  
  if (trumps.length >= 4) return true;
  if (hasRight && hasLeft && trumps.length >= 3) return true;
  return false;
};

const getSafeAreaStyles = () => ({
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)'
});

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
      osc.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.16);

      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 900;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(masterGain);
      noise.start();
      break;
    }
    case 'card_flick': {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.13);
      break;
    }
    case 'click': {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
      break;
    }
    case 'bid_pass': {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.35, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.26);
      break;
    }
    case 'trump_call': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      playTone(261.63, 0, 0.18); playTone(329.63, 0.07, 0.18); playTone(392.00, 0.14, 0.18); playTone(523.25, 0.21, 0.35);
      break;
    }
    case 'go_alone': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      playTone(196.00, 0, 0.12); playTone(293.66, 0.05, 0.12); playTone(392.00, 0.10, 0.12); playTone(587.33, 0.15, 0.12); playTone(783.99, 0.20, 0.35);
      break;
    }
    case 'trick_win': {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
      break;
    }
    case 'hand_win': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(440.00, 0.0, 0.4); playTone(554.37, 0.1, 0.4); playTone(659.25, 0.2, 0.6); playTone(880.00, 0.2, 0.6);
      break;
    }
    case 'fold_alert': {
      const playToot = (freq, delay) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
        osc.type = 'sine'; osc.frequency.value = freq; filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay); gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.35);
      };
      playToot(880.00, 0); playToot(1108.73, 0.15);
      break;
    }
    case 'euchred_sad': {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime); gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.3); gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.35); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.6);
      osc.frequency.setValueAtTime(260, ctx.currentTime + 0.6); gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.65); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.9);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.9); osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.8);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.95); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.8);
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, ctx.currentTime); filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.8);
      osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(ctx.currentTime + 1.9);
      break;
    }
    case 'euchred_happy': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(1500, ctx.currentTime + delay); filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + delay + duration);
        osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.05);
      };
      playTone(523.25, 0, 0.15); playTone(523.25, 0.18, 0.15); playTone(523.25, 0.36, 0.15); playTone(659.25, 0.54, 0.6);
      break;
    }
    case 'renege_caught': {
      const playSiren = (freq1, freq2, duration) => {
        const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const gain = ctx.createGain();
        osc1.type = 'sawtooth'; osc2.type = 'triangle'; osc1.frequency.setValueAtTime(freq1, ctx.currentTime); osc1.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + duration);
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime); osc2.frequency.linearRampToValueAtTime(freq1, ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.35, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc1.connect(gain); osc2.connect(gain); gain.connect(masterGain);
        osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + duration + 0.05); osc2.stop(ctx.currentTime + duration + 0.05);
      };
      playSiren(550, 850, 0.35); setTimeout(() => playSiren(850, 550, 0.35), 350); setTimeout(() => playSiren(550, 850, 0.35), 700);
      break;
    }
    case 'game_won': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(523.25, 0.0, 0.15); playTone(659.25, 0.15, 0.15); playTone(783.99, 0.30, 0.15); playTone(1046.50, 0.45, 0.6);
      const bufferSize = ctx.sampleRate * 0.2; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate); const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buffer; const noiseFilter = ctx.createBiquadFilter(); noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1200;
      const noiseGain = ctx.createGain(); noiseGain.gain.setValueAtTime(0.3, ctx.currentTime); noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(masterGain); noise.start();
      break;
    }
    case 'game_lost': {
      const playTone = (freq, delay, duration) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + delay + duration); gain.gain.setValueAtTime(0.3, ctx.currentTime + delay); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.connect(gain); gain.connect(masterGain);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + duration + 0.1);
      };
      playTone(300, 0.0, 0.8); playTone(280, 0.8, 0.8); playTone(260, 1.6, 0.8); playTone(200, 2.4, 2.0);
      break;
    }
    case 'in_the_barn': {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, t); osc.frequency.exponentialRampToValueAtTime(70, t + 1.5);
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, t); filter.frequency.linearRampToValueAtTime(200, t + 1.5);
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.6, t + 0.3); gain.gain.setValueAtTime(0.6, t + 1.0); gain.gain.linearRampToValueAtTime(0, t + 1.5);
      osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
      osc.start(); osc.stop(t + 1.6);
      break;
    }
    default: break;
  }
};

const getSavedStats = () => {
  try {
    const saved = localStorage.getItem('euchre_stats');
    return saved ? JSON.parse(saved) : { played: 0, won: 0, lost: 0 };
  } catch (e) { return { played: 0, won: 0, lost: 0 }; }
};

const getMakerFrameClasses = (maker, playerIndex, trump) => {
  if (maker === playerIndex && trump) return "bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 p-[2px] sm:p-1 rounded-[1rem] sm:rounded-[1.5rem] shadow-[0_0_20px_rgba(234,179,8,0.5)] z-40 transition-all duration-500 scale-[1.01]";
  return "p-[2px] sm:p-1 rounded-[1rem] sm:rounded-[1.5rem] transition-all duration-500 border border-transparent";
};

const getMakerInnerClasses = (maker, playerIndex, trump) => {
  if (maker === playerIndex && trump) return "bg-black/40 backdrop-blur-md rounded-[0.9rem] sm:rounded-[1.3rem]";
  return "rounded-[0.9rem] sm:rounded-[1.3rem]";
};

const renderDealerCoin = (dealer, playerIndex, positionClasses) => {
  if (dealer === null || dealer !== playerIndex) return null;
  return (
    <div className={`absolute ${positionClasses} w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,1)] border-2 sm:border-4 border-gray-900 shrink-0 z-[70] animate-bounce pointer-events-auto`} title="Dealer">
       <span className="text-gray-900 font-black text-[7px] sm:text-[11px] tracking-widest leading-none">DEALER</span>
    </div>
  );
};

const renderPlayerBadge = (currentPlayer, gameState, playerIndex, name, maker, trump, extraClasses = "") => {
  const isTurn = currentPlayer === playerIndex && !['round_over', 'game_over', 'finding_dealer', 'no_trump_passed', 'dealing_cards', 'renege_caught'].includes(gameState);
  return (
    <div className={`flex items-center gap-1.5 sm:gap-3 ${extraClasses} pointer-events-none`}>
      <div className={`flex items-center gap-1 sm:gap-2 bg-black/80 backdrop-blur-md border px-2 sm:px-4 py-1 rounded-full text-[10px] sm:text-sm font-semibold shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto ${isTurn ? 'border-green-400 text-green-100 shadow-[0_0_15px_rgba(74,222,128,0.6)] ring-1 ring-green-400 scale-105' : 'border-white/20 text-white'}`}>
        <span className="whitespace-nowrap">{name}</span>
        {maker === playerIndex && trump && (
          <div className={`bg-white px-1 py-0.5 rounded text-xs sm:text-base leading-none shadow-[0_1px_2px_rgba(0,0,0,0.4)] shrink-0 font-bold border border-gray-200 ${getSuitColor(trump)}`} title="Maker of Trump">
            {trump}
          </div>
        )}
      </div>
      {isTurn && playerIndex === 0 && (
         <div className="flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-500/40 px-1.5 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] whitespace-nowrap pointer-events-auto">
           <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping shrink-0"></div>
           YOUR TURN
         </div>
      )}
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState('menu'); 
  const [hands, setHands] = useState([[], [], [], []]);
  const [upCard, setUpCard] = useState(null);
  const [trump, setTrump] = useState(null);
  const [maker, setMaker] = useState(null); 
  const [alonePlayer, setAlonePlayer] = useState(null); 
  const [goAlone, setGoAlone] = useState(false); 
  const [dealer, setDealer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [trick, setTrick] = useState([]); 
  const [tricksTaken, setTricksTaken] = useState([0, 0]); 
  const [scores, setScores] = useState([0, 0]); 
  const [message, setMessage] = useState('Welcome to Euchre!');
  const [roundResult, setRoundResult] = useState({ title: '', desc: '', isEuchre: false });
  const [selectedDeckId, setSelectedDeckId] = useState('sapphire');
  const [difficulty, setDifficulty] = useState('normal'); 
  const [showWarningModal, setShowWarningModal] = useState(false); 
  const [dealerSequence, setDealerSequence] = useState([]);
  const [dealerDeck, setDealerDeck] = useState([]);
  const [dealerCandidate, setDealerCandidate] = useState(0);
  const [findingDealerPhase, setFindingDealerPhase] = useState('none'); 
  const [jackWinnerId, setJackWinnerId] = useState(null); 
  const [biddingDecisions, setBiddingDecisions] = useState([null, null, null, null]);
  const [isBiddingPaused, setIsBiddingPaused] = useState(false); 
  const [noTrumpMessage, setNoTrumpMessage] = useState(null);
  const [dealAnimationStep, setDealAnimationStep] = useState('none'); 
  const [revealedCardsCount, setRevealedCardsCount] = useState(0);
  const [isUpCardFlipped, setIsUpCardFlipped] = useState(false);
  const [funnySkipText, setFunnySkipText] = useState("");
  const [currentRenegeQuote, setCurrentRenegeQuote] = useState(null);
  const [stats, setStats] = useState(getSavedStats());
  const [showStatsModal, setShowStatsModal] = useState(false);

  const activeDeckStyle = DECK_COLORS.find(d => d.id === selectedDeckId) || DECK_COLORS[0];

  const getRenderedHand = (playerIndex) => {
    const hand = hands[playerIndex];
    if (gameState === 'dealing_cards') return hand.slice(0, revealedCardsCount);
    return hand;
  };

  useEffect(() => {
    if (trump) {
      setHands(prevHands => prevHands.map(hand => 
        [...hand].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump))
      ));
    }
  }, [trump]);

  useEffect(() => {
    if (gameState === 'dealing_cards') {
      if (dealAnimationStep === 'shuffling') {
        const interval = setInterval(() => { playSound('card_flick'); }, 150);
        const t = setTimeout(() => {
          clearInterval(interval);
          setDealAnimationStep('distributing');
          setMessage('Dealing cards...');
        }, 1500);
        return () => { clearInterval(interval); clearTimeout(t); };
      }
      if (dealAnimationStep === 'distributing') {
        const interval = setInterval(() => {
          setRevealedCardsCount(prev => {
            playSound('card_flick'); 
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
        const t1 = setTimeout(() => { setIsUpCardFlipped(true); playSound('card_flick'); }, 500);
        const t2 = setTimeout(() => {
          setDealAnimationStep('none');
          setGameState('bid1');
          setIsBiddingPaused(false); 
          const activeDealer = dealer !== null ? dealer : 0;
          const firstBidder = (activeDealer + 1) % 4;
          setCurrentPlayer(firstBidder);
          const nextName = PLAYERS[firstBidder].name;
          setMessage(`Bidding Round 1. ${nextName === 'You' ? 'Your' : nextName + "'s"} turn.`);
        }, 1800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    }
  }, [gameState, dealAnimationStep, dealer]);

  const isHandDecided = () => {
    if (gameState !== 'playing' && gameState !== 'trick_eval') return false; 
    if (maker === null) return false;
    const makerTeam = PLAYERS[maker].team;
    const defenderTeam = makerTeam === 0 ? 1 : 0;
    if (tricksTaken[makerTeam] >= 1 && tricksTaken[defenderTeam] >= 1) {
      if (tricksTaken[makerTeam] >= 3) return true;
      if (tricksTaken[defenderTeam] >= 3) return true;
    }
    return false;
  };

  useEffect(() => {
    if (isHandDecided()) {
      if (!funnySkipText) {
        const randomPhrase = FUNNY_SKIP_PHRASES[Math.floor(Math.random() * FUNNY_SKIP_PHRASES.length)];
        setFunnySkipText(randomPhrase);
        playSound('fold_alert');
      }
    } else { setFunnySkipText(""); }
  }, [tricksTaken, gameState]); 

  const handleEarlyTermination = () => {
    playSound('card_flick'); setFunnySkipText(""); setHands([[], [], [], []]); setTrick([]); setGameState('round_over');
  };

  const handleStartGameRequest = () => {
    playSound('click'); if (difficulty === 'hard') setShowWarningModal(true); else confirmStartNewGame();
  };

  const confirmStartNewGame = () => {
    playSound('click'); setShowWarningModal(false); setScores([0, 0]); setHands([[], [], [], []]);
    setDealer(null); setAlonePlayer(null); setGoAlone(false); setBiddingDecisions([null, null, null, null]);
    setFunnySkipText(""); setIsBiddingPaused(false); setDealerDeck(shuffle(createDeck())); setDealerSequence([]);
    setDealerCandidate(Math.floor(Math.random() * 4)); setGameState('finding_dealer'); setFindingDealerPhase('initial_pause');
    setMessage('Determining first dealer...');
  };

  useEffect(() => {
    if (gameState === 'finding_dealer') {
      if (findingDealerPhase === 'initial_pause') {
        const t = setTimeout(() => { setFindingDealerPhase('dealing'); }, 2000);
        return () => clearTimeout(t);
      }
      if (findingDealerPhase === 'dealing') {
        const t = setTimeout(() => {
          const newDeck = [...dealerDeck]; const card = newDeck.shift(); if (!card) return;
          setDealerDeck(newDeck);
          setDealerSequence(prev => {
             const next = [...prev]; const idx = next.findIndex(p => p.player === dealerCandidate);
             if (idx >= 0) next[idx] = { player: dealerCandidate, card }; else next.push({ player: dealerCandidate, card });
             return next;
          });
          playSound('card_flick');
          if (card.rank === 'J') { setJackWinnerId(dealerCandidate); setFindingDealerPhase('highlighting_jack'); } 
          else { setDealerCandidate((dealerCandidate + 1) % 4); }
        }, 600);
        return () => clearTimeout(t);
      }
      if (findingDealerPhase === 'highlighting_jack') {
        playSound('trump_call');
        const t = setTimeout(() => {
          setDealer(jackWinnerId); setMessage(`${PLAYERS[jackWinnerId].name} got the first Jack and deals first!`);
          setFindingDealerPhase('found');
        }, 2000);
        return () => clearTimeout(t);
      }
      if (findingDealerPhase === 'found') {
        const t = setTimeout(() => { setFindingDealerPhase('none'); setJackWinnerId(null); startRound(jackWinnerId); }, 3000);
        return () => clearTimeout(t);
      }
    }
  }, [gameState, findingDealerPhase, dealerDeck, dealerCandidate, jackWinnerId]);

  const startRound = (activeDealer) => {
    setDealer(activeDealer); setDealerSequence([]); setAlonePlayer(null); setGoAlone(false);
    setBiddingDecisions([null, null, null, null]); setFunnySkipText(""); setIsBiddingPaused(false);
    const newDeck = shuffle(createDeck()); const newHands = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      newHands[i] = newDeck.splice(0, 5).sort((a, b) => getSortValue(b, null) - getSortValue(a, null));
    }
    setHands(newHands); setUpCard(newDeck[0]); setTrump(null); setMaker(null); setTrick([]); setTricksTaken([0, 0]);
    setGameState('dealing_cards'); setDealAnimationStep('shuffling'); setRevealedCardsCount(0); setIsUpCardFlipped(false); setMessage('Shuffling...');
  };

  const handleBid = (playerIndex, action, chosenSuit = null, bidAlone = false) => {
    if (isBiddingPaused) return; setIsBiddingPaused(true); const newDecisions = [...biddingDecisions];
    if (gameState === 'bid1') {
      if (action === 'order_up') {
        newDecisions[playerIndex] = bidAlone ? 'Order Up Alone!' : 'Order Up!'; setBiddingDecisions(newDecisions);
        if (bidAlone) { playSound('go_alone'); setMessage(`${PLAYERS[playerIndex].name} ordered up ${upCard.suit} ALONE! Partner sits out.`); } 
        else { playSound('trump_call'); setMessage(`${PLAYERS[playerIndex].name} ordered up ${upCard.suit}! Dealer must discard.`); }
        setTimeout(() => {
          setTrump(upCard.suit); setMaker(playerIndex); if (bidAlone) setAlonePlayer(playerIndex);
          setGameState('discard'); setCurrentPlayer(dealer); setIsBiddingPaused(false);
        }, 1800);
      } else {
        newDecisions[playerIndex] = 'Pass'; setBiddingDecisions(newDecisions); playSound('bid_pass'); setMessage(`${PLAYERS[playerIndex].name} passed.`);
        setTimeout(() => {
          if (playerIndex === dealer) {
            setBiddingDecisions([null, null, null, null]); setGameState('bid2'); const nextBidder = (dealer + 1) % 4;
            setCurrentPlayer(nextBidder); setMessage(`Bidding Round 2. ${upCard.suit} is dead. ${PLAYERS[nextBidder].name === 'You' ? 'Your' : PLAYERS[nextBidder].name + "'s"} turn.`);
            setIsBiddingPaused(false);
          } else {
            const nextBidder = (playerIndex + 1) % 4; setCurrentPlayer(nextBidder);
            setMessage(`${PLAYERS[playerIndex].name} passed. ${PLAYERS[nextBidder].name === 'You' ? 'Your' : PLAYERS[nextBidder].name + "'s"} turn.`);
            setIsBiddingPaused(false);
          }
        }, 1500);
      }
    } else if (gameState === 'bid2') {
      if (action === 'call') {
        newDecisions[playerIndex] = bidAlone ? `Called ${chosenSuit} Alone!` : `Called ${chosenSuit}!`; setBiddingDecisions(newDecisions);
        if (bidAlone) { playSound('go_alone'); setMessage(`${PLAYERS[playerIndex].name} called ${chosenSuit} ALONE! Partner sits out.`); } 
        else { playSound('trump_call'); setMessage(`${PLAYERS[playerIndex].name} called ${chosenSuit}!`); }
        setTimeout(() => {
          setTrump(chosenSuit); setMaker(playerIndex); if (bidAlone) setAlonePlayer(playerIndex);
          setBiddingDecisions([null, null, null, null]); setGameState('playing');
          let firstLeader = (dealer + 1) % 4; if (bidAlone && firstLeader === ((playerIndex + 2) % 4)) firstLeader = (firstLeader + 1) % 4;
          setCurrentPlayer(firstLeader); setMessage(`${PLAYERS[firstLeader].name === 'You' ? 'You lead' : PLAYERS[firstLeader].name + ' leads'}.`);
          setIsBiddingPaused(false);
        }, 1800);
      } else {
        newDecisions[playerIndex] = 'Pass'; setBiddingDecisions(newDecisions); playSound('bid_pass'); setMessage(`${PLAYERS[playerIndex].name} passed.`);
        setTimeout(() => {
          if (playerIndex === dealer) {
             const randomMsg = FUNNY_PASS_MESSAGES[Math.floor(Math.random() * FUNNY_PASS_MESSAGES.length)];
             setNoTrumpMessage(randomMsg); setGameState('no_trump_passed'); setMessage('Hand passed completely. Redealing...');
             setTimeout(() => {
               const nextDealer = (dealer + 1) % 4; setDealer(nextDealer); setNoTrumpMessage(null); startRound(nextDealer); setIsBiddingPaused(false);
             }, 3500);
          } else {
            const nextBidder = (playerIndex + 1) % 4; setCurrentPlayer(nextBidder);
            setMessage(`${PLAYERS[playerIndex].name} passed. ${PLAYERS[nextBidder].name === 'You' ? 'Your' : PLAYERS[nextBidder].name + "'s"} turn.`);
            setIsBiddingPaused(false);
          }
        }, 1500);
      }
    }
  };

  const handleDiscard = (cardIndex) => {
    if (currentPlayer !== 0) return; const newHands = [...hands];
    newHands[0].splice(cardIndex, 1); newHands[0].push(upCard);
    newHands[0].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump));
    setHands(newHands); setUpCard(null); setBiddingDecisions([null, null, null, null]); setGameState('playing'); playSound('card_play');
    let leader = (dealer + 1) % 4; if (alonePlayer !== null && leader === ((alonePlayer + 2) % 4)) leader = (leader + 1) % 4;
    setCurrentPlayer(leader); setMessage(`${PLAYERS[leader].name === 'You' ? 'You lead' : PLAYERS[leader].name + ' leads'}.`);
  };

  const handlePlayCard = (cardIndex) => {
    if (gameState !== 'playing') return;
    const playerHand = hands[currentPlayer]; const cardToPlay = playerHand[cardIndex];
    const validPlays = getValidPlays(playerHand, trick, trump);
    const isPlayFollowsSuit = validPlays.some(c => c.id === cardToPlay.id);

    if (!isPlayFollowsSuit) {
      if (difficulty === 'normal' || currentPlayer !== 0) {
        if (currentPlayer === 0) setMessage("You must follow suit!"); return;
      } else {
        const leadSuit = trick.length > 0 ? getEffectiveSuit(trick[0].card, trump) : null;
        const hasLeadSuit = leadSuit && playerHand.some(c => getEffectiveSuit(c, trump) === leadSuit);
        if (hasLeadSuit) {
          const newHands = [...hands]; newHands[0].splice(cardIndex, 1); setHands(newHands);
          setTrick([...trick, { player: 0, card: cardToPlay }]);
          const randomQuote = FUNNY_RENEGE_QUOTES[Math.floor(Math.random() * FUNNY_RENEGE_QUOTES.length)];
          setCurrentRenegeQuote(randomQuote); playSound('renege_caught');
          setScores(prev => [prev[0], prev[1] + 2]); setGameState('renege_caught'); return;
        }
      }
    }

    const newHands = [...hands]; newHands[currentPlayer].splice(cardIndex, 1); setHands(newHands);
    const newTrick = [...trick, { player: currentPlayer, card: cardToPlay }]; setTrick(newTrick); playSound('card_play');

    const trickTargetSize = alonePlayer !== null ? 3 : 4;
    if (newTrick.length === trickTargetSize) {
      setMessage(`You played ${cardToPlay.rank}${cardToPlay.suit}. Evaluating trick...`); setGameState('trick_eval');
    } else {
      let next = (currentPlayer + 1) % 4; if (alonePlayer !== null && next === ((alonePlayer + 2) % 4)) next = (next + 1) % 4;
      setCurrentPlayer(next); setMessage(`You played ${cardToPlay.rank}${cardToPlay.suit}. ${PLAYERS[next].name === 'You' ? 'Your' : PLAYERS[next].name + "'s"} turn.`);
    }
  };

  useEffect(() => {
    if (currentPlayer === 0) return;
    if (['menu', 'trick_eval', 'round_over', 'game_over', 'finding_dealer', 'dealing_cards', 'no_trump_passed', 'renege_caught'].includes(gameState)) return;
    const isBiddingState = gameState === 'bid1' || gameState === 'bid2'; if (isBiddingPaused && isBiddingState) return; 
    if (gameState === 'playing' && alonePlayer !== null && currentPlayer === ((alonePlayer + 2) % 4)) return; 

    const timer = setTimeout(() => {
      const hand = hands[currentPlayer]; if (!hand || hand.length === 0) { setIsBiddingPaused(false); return; }
      const upCardSuit = upCard ? upCard.suit : null;

      if (gameState === 'bid1' && upCardSuit) {
        const suitCards = hand.filter(c => getEffectiveSuit(c, upCardSuit) === upCardSuit);
        const hasHigh = suitCards.some(c => ['J', 'A', 'K'].includes(c.rank));
        if (suitCards.length >= 2 && hasHigh) { handleBid(currentPlayer, 'order_up', null, botBidsAlone(hand, upCardSuit)); } 
        else { handleBid(currentPlayer, 'pass'); }
      } 
      else if (gameState === 'bid2') {
         let bestSuit = null; let maxCount = 0;
         SUITS.forEach(s => {
           if (upCardSuit && s !== upCardSuit) {
             const count = hand.filter(c => getEffectiveSuit(c, s) === s).length;
             if (count > maxCount) { maxCount = count; bestSuit = s; }
           }
         });
         if (maxCount >= 2 && Math.random() > 0.3) { handleBid(currentPlayer, 'call', bestSuit, botBidsAlone(hand, bestSuit)); } 
         else { handleBid(currentPlayer, 'pass'); }
      }
      else if (gameState === 'discard' && currentPlayer === dealer) {
        let worstIdx = 0; let worstVal = 9999;
        hand.forEach((c, idx) => {
            const val = getCardValue(c, trump, null); if (val < worstVal && getEffectiveSuit(c, trump) !== trump) { worstVal = val; worstIdx = idx; }
        });
        const newHands = [...hands]; newHands[currentPlayer].splice(worstIdx, 1); if (upCard) newHands[currentPlayer].push(upCard);
        newHands[currentPlayer].sort((a, b) => getSortValue(b, trump) - getSortValue(a, trump));
        setHands(newHands); setUpCard(null); setBiddingDecisions([null, null, null, null]); setGameState('playing'); playSound('card_play');
        let leader = (dealer + 1) % 4; if (alonePlayer !== null && leader === ((alonePlayer + 2) % 4)) leader = (leader + 1) % 4;
        setCurrentPlayer(leader); setMessage(`${PLAYERS[leader].name === 'You' ? 'You lead' : PLAYERS[leader].name + ' leads'}.`);
      }
      else if (gameState === 'playing') {
        const validPlays = getValidPlays(hand, trick, trump); const randomCard = validPlays[Math.floor(Math.random() * validPlays.length)];
        const cardIndex = hand.findIndex(c => c.id === randomCard.id);
        const newHands = [...hands]; newHands[currentPlayer].splice(cardIndex, 1); setHands(newHands);
        const newTrick = [...trick, { player: currentPlayer, card: randomCard }]; setTrick(newTrick); playSound('card_play');

        const trickTargetSize = alonePlayer !== null ? 3 : 4;
        if (newTrick.length === trickTargetSize) {
          setMessage(`${PLAYERS[currentPlayer].name} played ${randomCard.rank}${randomCard.suit}. Evaluating trick...`); setGameState('trick_eval');
        } else {
          let next = (currentPlayer + 1) % 4; if (alonePlayer !== null && next === ((alonePlayer + 2) % 4)) next = (next + 1) % 4;
          setCurrentPlayer(next); setMessage(`${PLAYERS[currentPlayer].name} played ${randomCard.rank}${randomCard.suit}. ${PLAYERS[next].name === 'You' ? 'Your' : PLAYERS[next].name + "'s"} turn.`);
        }
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentPlayer, gameState, hands, trick, trump, upCard, alonePlayer, dealer, isBiddingPaused]);

  useEffect(() => {
    if (gameState === 'trick_eval') {
      const evaluateDelay = setTimeout(() => {
        const leadSuit = getEffectiveSuit(trick[0].card, trump); let bestIndex = 0; let bestValue = -1;
        trick.forEach((play, index) => {
          const val = getCardValue(play.card, trump, leadSuit); if (val > bestValue) { bestValue = val; bestIndex = index; }
        });
        const winnerId = trick[bestIndex].player; const winningTeam = PLAYERS[winnerId].team;
        const newTricksTaken = [...tricksTaken]; newTricksTaken[winningTeam] += 1; setTricksTaken(newTricksTaken);
        setMessage(`${PLAYERS[winnerId].name} won the trick!`);
        if (hands[alonePlayer !== null ? alonePlayer : 0].length === 0) { setGameState('round_over'); } 
        else { playSound('trick_win'); setTrick([]); setGameState('playing'); setCurrentPlayer(winnerId); }
      }, 1500);
      return () => clearTimeout(evaluateDelay);
    }
  }, [gameState, trick, trump, tricksTaken, hands, alonePlayer]);

  useEffect(() => {
    if (gameState === 'round_over') {
      let newScores = [...scores]; let title = ""; let msg = ""; let isEuchre = false;
      const makerTeam = PLAYERS[maker].team; const defenderTeam = makerTeam === 0 ? 1 : 0; const makerTricks = tricksTaken[makerTeam];
      
      if (makerTricks >= 3) {
        if (makerTricks === 5) {
          if (alonePlayer !== null) {
            newScores[makerTeam] += 4; title = makerTeam === 0 ? "LONE WOLF MARCH!" : "LONE BOT MARCH!";
            msg = makerTeam === 0 ? "You swept all 5 tricks ALONE! +4 Pts" : "They swept all 5 tricks ALONE! +4 Pts";
          } else {
            newScores[makerTeam] += 2; title = makerTeam === 0 ? "YOUR TEAM MARCHED!" : "OPPONENTS MARCHED!";
            msg = makerTeam === 0 ? "Swept all 5 tricks. +2 Pts" : "They swept all 5 tricks. +2 Pts";
          }
        } else {
          newScores[makerTeam] += 1; title = makerTeam === 0 ? "HAND WON!" : "HAND LOST";
          msg = makerTeam === 0 ? `Your team took ${makerTricks} tricks. +1 Pt` : `Opponents took ${makerTricks} tricks. +1 Pt`;
        }
      } else {
        newScores[defenderTeam] += 2; isEuchre = true;
        if (defenderTeam === 0) { title = "⚡ EUCHRED! ⚡"; msg = "YOU EUCHRED THEM! +2 POINTS!"; } 
        else { title = "💀 EUCHRED! 💀"; msg = "YOUR TEAM GOT EUCHRED! OPPONENTS +2 POINTS!"; }
      }
      
      setScores(newScores); setRoundResult({ title, desc: msg, isEuchre }); setMessage(msg);
      if (isEuchre) { playSound(defenderTeam === 0 ? 'euchred_happy' : 'euchred_sad'); } else { playSound('hand_win'); }

      if ((newScores[0] === 9 && scores[0] < 9) || (newScores[1] === 9 && scores[1] < 9)) {
        setTimeout(() => playSound('in_the_barn'), 1200);
      }
      
      const scoreDelay = setTimeout(() => {
        if (newScores[0] >= 10 || newScores[1] >= 10) {
          setGameState('game_over'); setMessage(newScores[0] >= 10 ? 'YOU WON THE GAME!' : 'BOTS WON THE GAME!'); playSound(newScores[0] >= 10 ? 'game_won' : 'game_lost');
          setStats(prev => {
            const won = newScores[0] >= 10; const updated = { played: prev.played + 1, won: prev.won + (won ? 1 : 0), lost: prev.lost + (won ? 0 : 1) };
            try { localStorage.setItem('euchre_stats', JSON.stringify(updated)); } catch(e) {} return updated;
          });
        } else { startRound((dealer + 1) % 4); setCurrentRenegeQuote(null); }
      }, 4000);
      return () => clearTimeout(scoreDelay);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'renege_caught') {
      const timer = setTimeout(() => {
        if (scores[0] >= 10 || scores[1] >= 10) {
          setGameState('game_over'); setMessage(scores[0] >= 10 ? 'YOU WON THE GAME!' : 'BOTS WON THE GAME!'); playSound(scores[0] >= 10 ? 'game_won' : 'game_lost');
          setStats(prev => {
            const won = scores[0] >= 10; const updated = { played: prev.played + 1, won: prev.won + (won ? 1 : 0), lost: prev.lost + (won ? 0 : 1) };
            try { localStorage.setItem('euchre_stats', JSON.stringify(updated)); } catch(e) {} return updated;
          });
        } else { setCurrentRenegeQuote(null); startRound((dealer + 1) % 4); }
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [gameState, scores, dealer]);

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-700 via-green-900 to-gray-900 flex flex-col items-center justify-center text-white p-4 font-sans relative overflow-y-auto">
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
          <button onClick={() => { setShowStatsModal(true); playSound('click'); }} className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-1.5 px-3 sm:px-4 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] text-xs sm:text-sm tracking-wider transition-all hover:scale-105 active:scale-95 border border-yellow-200 flex items-center gap-1.5">
            <span className="text-sm leading-none">📊</span><span className="hidden xs:inline">STATS</span>
          </button>
        </div>
        <div className="relative z-10 flex flex-col items-center p-5 sm:p-10 my-2 bg-black/45 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl max-w-lg w-full">
          <h1 className="text-4xl sm:text-7xl font-black mb-4 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white via-yellow-200 to-amber-500 bg-clip-text text-transparent text-center select-none">AI EUCHRE</h1>
          <div className="flex gap-4 mb-4 bg-white/5 px-4 py-2 sm:px-6 sm:py-4 rounded-2xl shadow-inner border border-white/5 select-none">
              <span className="text-red-500 text-2xl sm:text-5xl drop-shadow-md">♥</span><span className="text-slate-200 text-2xl sm:text-5xl drop-shadow-md">♠</span><span className="text-red-500 text-2xl sm:text-5xl drop-shadow-md">♦</span><span className="text-slate-200 text-2xl sm:text-5xl drop-shadow-md">♣</span>
          </div>
          <p className="text-center mb-5 text-green-100/90 text-xs sm:text-base font-medium leading-relaxed max-w-sm">Play classic Euchre alongside highly strategic neural opponents. First team to 10 wins!</p>
          <div className="w-full mb-5 text-center">
            <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-400 font-extrabold mb-2">Select Deck Theme</h3>
            <div className="flex justify-center gap-2 sm:gap-3">
              {DECK_COLORS.map((deck) => (
                <button key={deck.id} onClick={() => { setSelectedDeckId(deck.id); playSound('click'); }} className={`w-7 h-10 sm:w-9 sm:h-12 rounded-lg border-2 shadow-lg relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 ${selectedDeckId === deck.id ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110' : 'border-white/10 hover:border-white/40'}`} title={deck.name}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${deck.bg}`} /><div className="absolute inset-[1px] border border-white/30 rounded"></div>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 italic">Active: {DECK_COLORS.find(d => d.id === selectedDeckId)?.name}</p>
          </div>
          <div className="w-full mb-6 text-center font-sans">
            <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-yellow-400 font-extrabold mb-2">Set Match Difficulty</h3>
            <div className="flex bg-black/40 p-1 rounded-full border border-white/5 max-w-xs mx-auto">
              <button onClick={() => { setDifficulty('normal'); playSound('click'); }} className={`flex-1 py-1.5 text-[10px] sm:text-xs font-black rounded-full tracking-wider transition-all duration-300 ${difficulty === 'normal' ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>NORMAL</button>
              <button onClick={() => { setDifficulty('hard'); playSound('click'); }} className={`flex-1 py-1.5 text-[10px] sm:text-xs font-black rounded-full tracking-wider transition-all duration-300 ${difficulty === 'hard' ? 'bg-gradient-to-r from-red-600 to-orange-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>HARD</button>
            </div>
            {difficulty === 'hard' ? (<p className="text-[10px] text-red-300 mt-2 px-2 italic leading-tight">Warning: AI checks your suit strictly! Play out of suit and bots score +2 Pts immediately!</p>) : (<p className="text-[10px] text-slate-400 mt-2 px-2 italic leading-tight">Perfect for friendly play. Suit restrictions are fully automated for you.</p>)}
          </div>
          <button onClick={handleStartGameRequest} className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-2.5 px-8 sm:py-4 sm:px-12 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] text-base sm:text-xl tracking-wider transition-all hover:scale-105 active:scale-95 border border-yellow-200 pointer-events-auto">START GAME</button>
        </div>
        {showWarningModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-2 border-red-500/50 p-6 sm:p-10 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.4)] text-center w-full max-w-md pointer-events-auto">
               <div className="text-5xl mb-4 animate-bounce">⚠️</div><h2 className="text-2xl sm:text-3xl font-black text-red-500 uppercase tracking-widest mb-3">RENEGING IS LIVE</h2>
               <div className="bg-red-950/20 rounded-xl p-4 border border-red-900/30 mb-6 text-left text-xs sm:text-sm text-slate-200 space-y-3 leading-relaxed">
                 <p>In Hard Mode, <strong className="text-yellow-400">suit lock gates are unlocked for you</strong>. If you play out of suit while holding that suit, bots catch you instantly, end the hand, and score <strong className="text-red-400">+2 Points</strong>.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-3">
                 <button onClick={() => { setShowWarningModal(false); playSound('click'); }} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-4 rounded-full border border-neutral-600 text-xs">GO BACK</button>
                 <button onClick={confirmStartNewGame} className="flex-1 bg-gradient-to-r from-red-600 to-orange-700 text-white font-black py-2 px-4 rounded-full border border-red-400 text-xs">I UNDERSTAND, DEAL!</button>
               </div>
            </div>
          </div>
        )}
        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-gradient-to-b from-slate-900 via-neutral-950 to-black border-2 border-yellow-500/50 p-6 rounded-3xl shadow-[0_0_80px_rgba(234,179,8,0.4)] text-center w-full max-w-sm pointer-events-auto relative">
               <h2 className="text-xl sm:text-3xl font-black text-yellow-400 uppercase tracking-widest mb-4">Player Stats</h2>
               <div className="grid grid-cols-2 gap-3 text-slate-200 mb-6">
                 <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"><span className="text-2xl sm:text-4xl font-black text-white">{stats.played}</span><span className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Matches</span></div>
                 <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"><span className="text-2xl sm:text-4xl font-black text-yellow-400">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</span><span className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Win Rate</span></div>
                 <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"><span className="text-2xl sm:text-4xl font-black text-green-400">{stats.won}</span><span className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Wins</span></div>
                 <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"><span className="text-2xl sm:text-4xl font-black text-red-400">{stats.lost}</span><span className="text-[9px] sm:text-xs uppercase tracking-widest text-slate-400 mt-1">Losses</span></div>
               </div>
               <div className="flex flex-col gap-2">
                 <button onClick={() => { setShowStatsModal(false); playSound('click'); }} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black py-2.5 px-4 rounded-full shadow-lg border border-yellow-300 text-xs tracking-wider">CLOSE</button>
                 <button onClick={() => { const r = { played: 0, won: 0, lost: 0 }; setStats(r); try { localStorage.setItem('euchre_stats', JSON.stringify(r)); } catch(e) {} playSound('card_flick'); }} className="w-full bg-transparent text-slate-400 font-bold py-1 px-4 text-[10px] tracking-wider mt-1">RESET STATS</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-800 via-green-900 to-slate-900 font-sans overflow-hidden text-white relative">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="absolute inset-0 flex flex-col justify-between" style={getSafeAreaStyles()}>
        <div className="p-2 xs:p-4 w-full flex justify-between items-start z-30 max-w-6xl mx-auto relative pointer-events-none">
          <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-xl xs:rounded-2xl p-1.5 xs:p-3 sm:p-4 shadow-xl flex flex-col min-w-[70px] xs:min-w-[110px] pointer-events-auto">
            <span className="font-black text-yellow-400 text-[10px] xs:text-xs sm:text-base tracking-wide whitespace-nowrap"><span className="hidden xs:inline">GOOD GUYS: </span><span className="xs:hidden">US: </span>{scores[0]}</span>
            <span className="text-green-300 text-[8px] xs:text-xs sm:text-sm font-extrabold mt-0.5 tracking-wider">TRICKS: {tricksTaken[0]}</span>
            {scores[0] === 9 && (<span className="text-[7px] xs:text-[9px] sm:text-xs text-yellow-300 font-black tracking-widest mt-1 animate-pulse text-center bg-yellow-950/45 px-1 py-0.5 rounded border border-yellow-500/20">BARN!</span>)}
          </div>
          {trick.length > 0 && trick[0] && (
            <div className="absolute top-1 sm:top-4 left-[24%] sm:left-[28%] flex flex-col items-center z-10 pointer-events-none transform -rotate-[10deg] scale-[0.45] xs:scale-[0.55] sm:scale-75 md:scale-90">
              <div className="bg-black/90 border border-slate-400/60 text-slate-200 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-t-lg mb-[-2px] z-10">Suit Led</div>
              <div className="bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 p-[3px] sm:p-1 rounded-xl">
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-[#fdfdfd] rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-300">
                   <div className="absolute top-1 left-1.5 flex flex-col items-center font-serif z-10"><span className={`text-sm sm:text-base leading-none ${getSuitColor(getEffectiveSuit(trick[0].card, trump))}`}>{getEffectiveSuit(trick[0].card, trump)}</span></div>
                   <span className={`text-5xl sm:text-6xl drop-shadow-md ${getSuitColor(getEffectiveSuit(trick[0].card, trump))} transform scale-110 z-20`}>{getEffectiveSuit(trick[0].card, trump)}</span>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-0 pointer-events-auto">
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 2 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-xl p-2 w-28 h-16 sm:w-44 sm:h-24 flex flex-col items-center justify-center text-center shadow-2xl">
                <span className="text-yellow-400 font-bold text-[9px] sm:text-sm tracking-widest uppercase">Sitting Out</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 2, trump)}>
                <div className={`flex -space-x-5 xs:-space-x-8 sm:-space-x-10 pt-2 pb-2 px-3 sm:px-10 relative ${getMakerInnerClasses(maker, 2, trump)}`}>
                   {getRenderedHand(2).map((_, i) => <div className="shadow-[0_2px_5px_rgba(0,0,0,0.4)]" key={`partner_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 2, "-bottom-2 -right-4 sm:-bottom-4 sm:-right-8")}
                </div>
              </div>
            )}
            {renderPlayerBadge(currentPlayer, gameState, 2, "Partner", maker, trump, "absolute bottom-[-10px] sm:bottom-[-15px] left-1/2 transform -translate-x-1/2 z-50")}
            {biddingDecisions[2] && (
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-2 py-1 rounded-xl border shadow-xl text-[9px] sm:text-xs font-black text-center ${biddingDecisions[2] === 'Pass' ? 'bg-black/90 border-slate-500/50 text-slate-300' : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'}`}><span className="uppercase">{biddingDecisions[2]}</span></div>
              </div>
            )}
          </div>
          {trump && (
            <div className="absolute top-1 sm:top-4 right-[24%] sm:right-[28%] flex flex-col items-center z-10 pointer-events-none transform rotate-[10deg] scale-[0.45] xs:scale-[0.55] sm:scale-75 md:scale-90">
              <div className="bg-black/90 border border-yellow-500/60 text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-t-lg mb-[-2px] z-10">Trump</div>
              <div className="bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 p-[3px] sm:p-1 rounded-xl">
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-[#fdfdfd] rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-300">
                   <div className="absolute top-1 left-1.5 flex flex-col items-center font-serif z-10"><span className={`text-sm sm:text-base leading-none ${getSuitColor(trump)}`}>{trump}</span></div>
                   <span className={`text-5xl sm:text-6xl drop-shadow-md ${getSuitColor(trump)} transform scale-110 z-20`}>{trump}</span>
                </div>
              </div>
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl xs:rounded-2xl p-1.5 xs:p-3 sm:p-4 shadow-xl flex flex-col text-right min-w-[70px] xs:min-w-[110px] pointer-events-auto">
            <span className="font-black text-red-400 text-[10px] xs:text-xs sm:text-base tracking-wide whitespace-nowrap"><span className="hidden xs:inline">BOT TEAM: </span><span className="xs:hidden">BOTS: </span>{scores[1]}</span>
            <span className="text-green-300 text-[8px] xs:text-xs sm:text-sm font-extrabold mt-0.5 tracking-wider">TRICKS: {tricksTaken[1]}</span>
            {scores[1] === 9 && (<span className="text-[7px] xs:text-[9px] sm:text-xs text-red-300 font-black tracking-widest mt-1 animate-pulse text-center bg-red-950/45 px-1 py-0.5 rounded border border-red-500/20">BARN!</span>)}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center perspective-1000 z-10 pointer-events-none game-table-container">
          <div className="absolute top-[18%] xs:top-[20%] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md flex justify-center pointer-events-none game-message-box">
            {!['finding_dealer', 'round_over', 'no_trump_passed', 'renege_caught'].includes(gameState) && (
              <div className="text-white text-[11px] xs:text-sm sm:text-base font-bold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-center w-full pointer-events-auto select-none">{message}</div>
            )}
          </div>
          <div className="absolute w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="absolute left-1 xs:left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 1 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-xl p-2 w-16 h-28 flex flex-col items-center justify-center text-center shadow-2xl rotate-90">
                <span className="text-yellow-400 font-bold text-[8px] tracking-widest uppercase">Out</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 1, trump)}>
                <div className={`flex flex-col -space-y-8 sm:-space-y-12 py-3 sm:py-10 px-2 sm:px-6 relative ${getMakerInnerClasses(maker, 1, trump)}`}>
                   {getRenderedHand(1).map((_, i) => <div className="rotate-90 transform shadow-[2px_0_5px_rgba(0,0,0,0.4)]" key={`bot1_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 1, "-bottom-2 -right-2 sm:-bottom-6 sm:-right-6")}
                </div>
              </div>
            )}
            {renderPlayerBadge(currentPlayer, gameState, 1, "Bot 1", maker, trump, "absolute left-5 xs:left-8 sm:left-14 -rotate-90 z-50")}
            {biddingDecisions[1] && (
              <div className="absolute left-16 xs:left-20 sm:left-36 top-1/2 -translate-y-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-2 py-1 rounded-xl border shadow-xl text-[9px] sm:text-xs font-black text-center ${biddingDecisions[1] === 'Pass' ? 'bg-black/90 border-slate-500/50 text-slate-300' : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'}`}><span className="uppercase">{biddingDecisions[1]}</span></div>
              </div>
            )}
          </div>

          <div className="absolute right-1 xs:right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-auto">
            {alonePlayer !== null && (alonePlayer + 2) % 4 === 3 && gameState !== 'discard' ? (
              <div className="bg-black/55 backdrop-blur-md border border-yellow-500/30 rounded-xl p-2 w-16 h-28 flex flex-col items-center justify-center text-center shadow-2xl rotate-90">
                <span className="text-yellow-400 font-bold text-[8px] tracking-widest uppercase">Out</span>
              </div>
            ) : (
              <div className={getMakerFrameClasses(maker, 3, trump)}>
                <div className={`flex flex-col -space-y-8 sm:-space-y-12 py-3 sm:py-10 px-2 sm:px-6 relative ${getMakerInnerClasses(maker, 3, trump)}`}>
                   {getRenderedHand(3).map((_, i) => <div className="-rotate-90 transform shadow-[-2px_0_5px_rgba(0,0,0,0.4)]" key={`bot2_${i}`}>{renderCardBack(activeDeckStyle)}</div>)}
                   {renderDealerCoin(dealer, 3, "-bottom-2 -left-2 sm:-bottom-6 sm:-left-6")}
                </div>
              </div>
            )}
            {renderPlayerBadge(currentPlayer, gameState, 3, "Bot 2", maker, trump, "absolute right-5 xs:right-8 sm:right-14 rotate-90 z-50")}
            {biddingDecisions[3] && (
              <div className="absolute right-16 xs:right-20 sm:right-36 top-1/2 -translate-y-1/2 z-[80] flex items-center justify-center animate-bounce">
                <div className={`backdrop-blur-md px-2 py-1 rounded-xl border shadow-xl text-[9px] sm:text-xs font-black text-center ${biddingDecisions[3] === 'Pass' ? 'bg-black/90 border-slate-500/50 text-slate-300' : 'bg-gradient-to-r from-green-700 to-teal-800 border-green-400 text-green-100'}`}><span className="uppercase">{biddingDecisions[3]}</span></div>
              </div>
            )}
          </div>

          <div className="w-32 h-32 xs:w-44 xs:h-44 sm:w-60 sm:h-60 rounded-full border border-white/10 bg-black/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative flex items-center justify-center backdrop-blur-sm z-10 pointer-events-auto game-table-felt">
            {gameState === 'finding_dealer' && (
              <>
                {findingDealerPhase === 'initial_pause' && (
                  <div className="absolute z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md border border-yellow-500/50 p-4 rounded-3xl w-48 xs:w-64 text-center">
                     <h2 className="text-sm xs:text-xl font-black text-yellow-400 mb-1 uppercase tracking-wider">First Jack Deals!</h2>
                  </div>
                )}
                {findingDealerPhase === 'dealing' && (
                  <div className="absolute z-0 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] border-2 sm:border-[5px] border-gray-900"><span className="text-gray-900 font-black text-[9px] sm:text-base tracking-widest">DEALER</span></div>
                  </div>
                )}
                {findingDealerPhase === 'found' && (
                  <div className="absolute z-50 flex flex-col items-center justify-center bg-black/80 border border-green-500/50 p-4 rounded-3xl w-48 xs:w-64 text-center">
                     <h2 className="text-sm xs:text-xl font-black text-green-400 mb-1 uppercase tracking-wider">Dealer Found</h2>
                  </div>
                )}
              </>
            )}

            {gameState === 'dealing_cards' && dealAnimationStep === 'shuffling' && (
              <div className="absolute z-40 flex items-center justify-center w-full h-full">
                <div className="relative w-11 h-16 xs:w-12 xs:h-18">
                  <div className="absolute inset-0 shadow-lg">{renderCardBack(activeDeckStyle)}</div>
                  <div className="absolute inset-0 shadow-lg animate-shuffle-left">{renderCardBack(activeDeckStyle)}</div>
                  <div className="absolute inset-0 shadow-lg animate-shuffle-right">{renderCardBack(activeDeckStyle)}</div>
                </div>
              </div>
            )}
            {gameState === 'dealing_cards' && dealAnimationStep === 'distributing' && (
              <div className="absolute z-40 flex items-center justify-center w-full h-full"><div className="relative w-11 h-16 xs:w-12 xs:h-18 shadow-2xl">{renderCardBack(activeDeckStyle)}</div></div>
            )}
            {gameState === 'dealing_cards' && dealAnimationStep === 'flipping' && upCard && (
              <div className="absolute z-50 flex flex-col items-center justify-center">
                <div className="perspective-1000 w-11 h-16 xs:w-12 xs:h-18 shadow-2xl">
                  <div className={`relative w-full h-full duration-700 ease-out transform-style-3d ${isUpCardFlipped ? 'rotate-y-0' : 'rotate-y-180'}`}>
                    <div className="absolute inset-0 backface-hidden z-10">{renderCard(upCard)}</div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180">{renderCardBack(activeDeckStyle)}</div>
                  </div>
                </div>
              </div>
            )}

            {(gameState === 'finding_dealer' ? dealerSequence : trick).map((play) => {
               let posClass = "";
               if (play.player === 0) posClass = "translate-y-8 xs:translate-y-12 sm:translate-y-24 z-40";
               if (play.player === 1) posClass = "-translate-x-10 xs:-translate-x-14 sm:-translate-x-28 z-20 -rotate-[15deg]";
               if (play.player === 2) posClass = "-translate-y-8 xs:-translate-y-12 sm:-translate-y-24 z-10 rotate-[8deg]";
               if (play.player === 3) posClass = "translate-x-10 xs:translate-x-14 sm:translate-x-28 z-30 rotate-[15deg]";
               
               return (
                 <div key={play.player} className={`absolute ${posClass} shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${gameState === 'finding_dealer' && play.card.rank === 'J' && play.player === jackWinnerId ? 'ring-2 ring-yellow-400 scale-105 z-50' : ''}`}>
                   {renderCard(play.card)}
                 </div>
               )
            })}

            {gameState === 'no_trump_passed' && noTrumpMessage && (
              <div className="absolute z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black border border-yellow-500/40 p-4 rounded-3xl w-64 text-center">
                 <h2 className="text-sm sm:text-xl font-black text-yellow-400 mb-1 uppercase">{noTrumpMessage.title}</h2>
                 <p className="text-[10px] sm:text-xs text-slate-200 leading-tight">{noTrumpMessage.desc}</p>
              </div>
            )}
            {gameState === 'round_over' && (
              <div className={`absolute z-50 flex flex-col items-center justify-center p-4 rounded-3xl text-center w-64 border bg-black/90 border-white/20 ${roundResult.isEuchre ? 'bg-gradient-to-br from-[#6b0202] to-black border-red-500 euchred-overlay-flashy' : ''}`}>
                 <h2 className={`text-base sm:text-xl font-black tracking-wider mb-1 ${roundResult.isEuchre ? 'text-red-500' : 'text-yellow-400'}`}>{roundResult.title}</h2>
                 <p className="text-xs font-bold text-white leading-relaxed">{roundResult.desc}</p>
              </div>
            )}
            {trick.length === 0 && !['round_over', 'finding_dealer', 'no_trump_passed', 'dealing_cards', 'renege_caught'].includes(gameState) && (
              <div className="flex flex-col items-center z-10">
                {['bid1', 'bid2', 'discard'].includes(gameState) && upCard && (
                   <div className="mb-1 text-center shadow-2xl rounded-lg">{renderCard(upCard)}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {gameState === 'renege_caught' && currentRenegeQuote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
            <div className="bg-gradient-to-br from-[#800] to-black border-4 border-red-500 p-6 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.8)] text-center w-full max-w-sm">
               <h2 className="text-xl font-black text-red-500 uppercase mb-3">{currentRenegeQuote.title}</h2>
               <p className="text-xs text-slate-100 font-extrabold mb-4">{currentRenegeQuote.desc}</p>
               <div className="bg-yellow-500 text-black text-[10px] font-black py-1.5 px-4 rounded-full">BOTS GET +2 PTS!</div>
            </div>
          </div>
        )}

        {isHandDecided() && funnySkipText && (
          <div className="absolute bottom-24 left-3 z-[80] pointer-events-auto">
            <button onClick={handleEarlyTermination} className="bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold py-1.5 px-3.5 rounded-full border border-red-400/40 text-[9px] tracking-wider uppercase"><span>{funnySkipText}</span></button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-12 pb-2 xs:pb-4 px-4 flex flex-col items-center z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-2 mb-2 relative w-full pointer-events-auto">
            {currentPlayer === 0 && ['bid1', 'bid2'].includes(gameState) && (
              <label className="flex items-center gap-1.5 cursor-pointer bg-black/60 px-4 py-1.5 rounded-full border border-yellow-500/30 text-[10px] sm:text-xs font-bold text-yellow-400 select-none">
                <input type="checkbox" checked={goAlone} disabled={isBiddingPaused} onChange={(e) => { setGoAlone(e.target.checked); playSound('click'); }} className="accent-yellow-500 w-3.5 h-3.5 cursor-pointer" />
                <span>GO ALONE 🚀</span>
              </label>
            )}

            {currentPlayer === 0 && gameState === 'bid1' && (
              <div className="flex gap-3">
                <button onClick={() => { if (upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit)) handleBid(0, 'order_up', null, goAlone); }} disabled={isBiddingPaused || !(upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit))} className={`bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black py-2 px-5 rounded-full shadow-md text-xs ${isBiddingPaused || !(upCard && hands[0].some(c => getEffectiveSuit(c, upCard.suit) === upCard.suit)) ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}>Order Up {upCard?.suit} {goAlone && "Alone"}</button>
                <button onClick={() => handleBid(0, 'pass')} disabled={isBiddingPaused} className="bg-gradient-to-b from-slate-600 to-slate-800 text-white font-black py-2 px-5 rounded-full text-xs">Pass</button>
              </div>
            )}

            {currentPlayer === 0 && gameState === 'bid2' && (
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUITS.filter(s => s !== upCard?.suit).map(suit => (
                  <button key={suit} onClick={() => handleBid(0, 'call', suit, goAlone)} disabled={isBiddingPaused} className="bg-gradient-to-b from-white to-gray-200 text-black font-black py-1.5 px-4 rounded-full text-[11px] flex items-center gap-1">Make <span className={`text-base ${getSuitColor(suit)} leading-none`}>{suit}</span> {goAlone && "Alone"}</button>
                ))}
                <button onClick={() => handleBid(0, 'pass')} disabled={isBiddingPaused} className="bg-gradient-to-b from-slate-600 to-slate-800 text-white font-black py-1.5 px-4 rounded-full text-[11px]">Pass</button>
              </div>
            )}

            {currentPlayer === 0 && gameState === 'discard' && dealer === 0 && (
               <div className="text-yellow-400 font-extrabold bg-black/60 border border-yellow-400/30 px-4 py-1.5 rounded-full text-xs animate-pulse">Discard a card from your hand below.</div>
            )}
          </div>

          <div className="flex flex-col items-center relative w-full max-w-3xl pointer-events-auto fanned-hand-container">
             <div className={getMakerFrameClasses(maker, 0, trump)}>
               <div className={`flex justify-center items-end h-24 xs:h-28 sm:h-48 pt-2 pb-2 px-4 relative w-max mx-auto ${getMakerInnerClasses(maker, 0, trump)}`}>
                 {renderPlayerBadge(currentPlayer, gameState, 0, "You", maker, trump, "absolute -bottom-3 sm:-bottom-6 left-1/2 transform -translate-x-1/2 z-[60]")}
                 {renderDealerCoin(dealer, 0, "top-2 right-1 sm:top-6 sm:right-4")}
                 {biddingDecisions[0] && (
                   <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-[80] flex items-center justify-center animate-bounce">
                     <div className="backdrop-blur-md px-2 py-1 rounded-xl border shadow-xl text-[9px] sm:text-xs font-black text-center bg-black/90 text-slate-300"><span className="uppercase">{biddingDecisions[0]}</span></div>
                   </div>
                 )}

                 {alonePlayer !== null && (alonePlayer + 2) % 4 === 0 && gameState !== 'discard' ? (
                   <div className="bg-black/55 rounded-2xl p-4 w-44 h-24 flex flex-col items-center justify-center text-center shadow-2xl"><span className="text-yellow-400 font-bold text-xs tracking-widest uppercase">Sitting Out</span></div>
                 ) : (
                   getRenderedHand(0).map((card, index) => {
                     let isPlayable = false;
                     if (gameState === 'discard' && dealer === 0) isPlayable = true;
                     if (gameState === 'playing') isPlayable = getValidPlays(hands[0], trick, trump).some(c => c.id === card.id);

                     const totalCards = getRenderedHand(0).length; const offset = index - (totalCards - 1) / 2;
                     const rotation = offset * 5; const translateY = Math.abs(offset) * 4; const zIndex = 10 + index;

                     return (
                       <div key={card.id} className="origin-bottom -ml-4 xs:-ml-6 first:ml-0 transition-transform duration-300 ease-out hover:-translate-y-6 z-10 hover:z-50" style={{ transform: `rotate(${rotation}deg) translateY(${translateY}px)`, zIndex: zIndex }}>
                         {renderCard(card, () => { if (gameState === 'discard' && dealer === 0) handleDiscard(index); else if (gameState === 'playing') handlePlayCard(index); }, isPlayable || gameState !== 'playing' || difficulty === 'hard')}
                       </div>
                     );
                   })
                 )}
               </div>
             </div>
          </div>
        </div>

        {gameState === 'game_over' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            {scores[0] >= 10 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[101]">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="absolute w-3 h-3 opacity-0" style={{ left: `${Math.random() * 100}%`, top: `-10%`, animation: `confettiFall ${Math.random() * 3 + 2}s linear infinite`, animationDelay: `${Math.random() * 2}s`, backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][Math.floor(Math.random()*4)] }} />
                ))}
              </div>
            )}
            <div className="bg-gradient-to-b from-slate-900 to-black p-10 rounded-3xl text-center w-full max-w-lg relative z-[105]">
               <h2 className={`text-4xl sm:text-6xl font-black mb-4 ${scores[0] >= 10 ? 'text-yellow-400' : 'text-blue-300'}`}>{scores[0] >= 10 ? 'YOU WON!' : 'YOU LOST'}</h2>
               <p className="text-lg sm:text-xl text-slate-300 mb-10">Final Score: {scores[0]} - {scores[1]}</p>
               <button onClick={confirmStartNewGame} className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black py-3 px-8 rounded-full border-2 border-yellow-200 w-full sm:w-auto">PLAY AGAIN</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}