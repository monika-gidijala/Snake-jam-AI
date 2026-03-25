/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Trophy, Gamepad2, Volume2, Zap, Circle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  color: string;
}

// --- Constants ---
const TRACKS: Track[] = [
  {
    id: 1,
    title: "V0ID_DRIFT",
    artist: "SYS_ERR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#00FFFF", // Cyan
  },
  {
    id: 2,
    title: "NE0N_PULSE",
    artist: "NULL_PTR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#FF00FF", // Magenta
  },
  {
    id: 3,
    title: "BIT_CRUSH",
    artist: "R00T_USR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#00FFFF", // Cyan
  },
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function App() {
  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  // --- Game Logic ---
  const generateFood = () => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setGameStarted(true);
    generateFood();
  };

  const moveSnake = () => {
    if (isGameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setGameStarted(false);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const loop = (time: number) => {
      if (time - lastMoveTimeRef.current > 120) {
        moveSnake();
        lastMoveTimeRef.current = time;
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, isGameOver, direction, food]);

  return (
    <div className="min-h-screen bg-black text-cyan font-pixel noise-bg scanlines flex flex-col items-center justify-center p-4 selection:bg-magenta selection:text-black">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="z-10 mb-12 text-center"
      >
        <div className="glitch-tear text-4xl md:text-6xl font-black mb-4" data-text="MACHINE_SNAKE_V1.0">
          MACHINE_SNAKE_V1.0
        </div>
        <div className="text-[10px] md:text-xs tracking-[0.5em] text-magenta animate-pulse">
          [ STATUS: UNSTABLE // AUTH: GRANTED ]
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full">
        
        {/* Left Panel: Stats */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="border-2 border-cyan p-4 bg-black/50 backdrop-blur-md">
            <div className="text-[10px] text-magenta mb-2 flex items-center gap-2">
              <Terminal size={12} /> DATA_STREAM
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[8px] opacity-50">SCORE_VAL</div>
                <div className="text-2xl text-cyan">{score.toString().padStart(6, '0')}</div>
              </div>
              <div>
                <div className="text-[8px] opacity-50">HIGH_SCR_VAL</div>
                <div className="text-2xl text-magenta">{highScore.toString().padStart(6, '0')}</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-magenta p-4 bg-black/50 backdrop-blur-md flex-1">
            <div className="text-[10px] text-cyan mb-4 flex items-center gap-2">
              <Zap size={12} /> SYSTEM_LOG
            </div>
            <div className="font-digital text-[10px] space-y-2 opacity-70">
              <p>{`> INITIALIZING_CORE...`}</p>
              <p>{`> SNAKE_LEN: ${snake.length}`}</p>
              <p>{`> POS_X: ${snake[0].x}`}</p>
              <p>{`> POS_Y: ${snake[0].y}`}</p>
              <p className="text-magenta animate-pulse">{`> WARNING: BUFFER_OVERFLOW_NEAR`}</p>
            </div>
          </div>
        </div>

        {/* Center: Game */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative border-4 border-cyan p-2 bg-black shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            <div 
              className="grid bg-[#0a0a0a]"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(90vw, 500px)',
                height: 'min(90vw, 500px)'
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div 
                    key={i} 
                    className="w-full h-full flex items-center justify-center border-[0.5px] border-white/5"
                  >
                    {isHead ? (
                      <div className="w-full h-full bg-cyan shadow-[0_0_10px_#00FFFF]" />
                    ) : isSnake ? (
                      <div className="w-[80%] h-[80%] bg-cyan/40" />
                    ) : isFood ? (
                      <div className="w-[60%] h-[60%] bg-magenta animate-ping shadow-[0_0_15px_#FF00FF]" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Overlays */}
            <AnimatePresence>
              {!gameStarted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20"
                >
                  <div className="glitch-tear text-3xl md:text-5xl font-black mb-8 text-magenta" data-text={isGameOver ? "CORE_CRASHED" : "INIT_SEQUENCE"}>
                    {isGameOver ? "CORE_CRASHED" : "INIT_SEQUENCE"}
                  </div>
                  
                  <button 
                    onClick={resetGame}
                    className="border-4 border-cyan px-8 py-4 text-xl hover:bg-cyan hover:text-black transition-all active:scale-95 group"
                  >
                    <span className="group-hover:animate-bounce inline-block">
                      {isGameOver ? "REB00T_SYSTEM" : "EXECUTE_PROGRAM"}
                    </span>
                  </button>

                  <div className="mt-8 font-digital text-[10px] opacity-40">
                    [ USE_ARROWS_OR_WASD_TO_NAVIGATE ]
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Audio */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="border-2 border-cyan p-4 bg-black/50 backdrop-blur-md">
            <div className="text-[10px] text-magenta mb-4 flex items-center gap-2">
              <Music size={12} /> AUDIO_PROC
            </div>
            
            <div className="mb-6">
              <div className="text-[8px] opacity-50 mb-1">TRACK_ID</div>
              <div className="text-sm truncate text-cyan">{currentTrack.title}</div>
              <div className="text-[8px] text-magenta mt-1">{currentTrack.artist}</div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <button onClick={prevTrack} className="text-cyan hover:text-magenta transition-colors">
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 border-2 border-cyan flex items-center justify-center hover:bg-cyan hover:text-black transition-all"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button onClick={nextTrack} className="text-cyan hover:text-magenta transition-colors">
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex gap-1 h-8 items-end">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isPlaying ? [4, 24, 8, 20, 4] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.3 + Math.random() * 0.5 }}
                  className="flex-1 bg-magenta"
                />
              ))}
            </div>
          </div>

          <div className="border-2 border-magenta p-4 bg-black/50 backdrop-blur-md flex-1">
            <div className="text-[10px] text-cyan mb-4 flex items-center gap-2">
              <Volume2 size={12} /> PLAYLIST_DIR
            </div>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left p-2 text-[8px] border ${
                    currentTrackIndex === idx 
                    ? 'border-cyan bg-cyan/10 text-cyan' 
                    : 'border-white/10 text-white/40 hover:border-magenta'
                  }`}
                >
                  {`[0${track.id}] ${track.title}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 mt-12 font-digital text-[8px] opacity-30 flex gap-8">
        <span>© 2026 MACHINE_CORP</span>
        <span>ENCRYPTION: AES-256</span>
        <span>LOCATION: UNKNOWN</span>
      </footer>

      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
      />
    </div>
  );
}
