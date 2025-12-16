import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card from './Card';
import { politicians } from '../data/politicians';
import { demoPoliticians } from '../data/demoData';

export default function Game() {
    const [cards, setCards] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
    const [logoClicks, setLogoClicks] = useState(0);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Initialize Game (Random 20)
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        // Filter for politicians with images first (simple hack: check if url is not placeholder or specific wikimedia url pattern)
        // Actually, just shuffle all and take 20. But priority for images is requested.
        const withImages = politicians.filter(p => !p.image.includes('placehold.co'));
        const withoutImages = politicians.filter(p => p.image.includes('placehold.co'));

        // Shuffle helper
        const shuffle = (array) => array.sort(() => Math.random() - 0.5);

        let deck = [...shuffle(withImages), ...shuffle(withoutImages)];
        setCards(deck.slice(0, 20));
        setScore(0);
        setGameOver(false);
        setIsDemoMode(false);
        setLogoClicks(0);
    };

    const activateDemoMode = () => {
        setIsDemoMode(true);
        setCards([...demoPoliticians]); // Use the demo stack
        setScore(0);
        setGameOver(false);
    };

    const handleLogoClick = () => {
        const newCount = logoClicks + 1;
        setLogoClicks(newCount);
        if (newCount === 3) {
            activateDemoMode();
        }
    };

    const handleSwipe = (direction, politician) => {
        let isCorrect = false;

        if (direction === 'left' && politician.alignment === 'left') isCorrect = true;
        if (direction === 'right' && politician.alignment === 'right') isCorrect = true;
        if (direction === 'up' && politician.alignment === 'center') isCorrect = true;

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }

        // Clear feedback after short delay
        setTimeout(() => setFeedback(null), 800);

        // Remove card
        setCards(prev => prev.filter(c => c.id !== politician.id));
    };

    useEffect(() => {
        if (cards.length === 0 && !isDemoMode) { // Logic slightly redundant but keeps useEffect consistent
            if (score > 0 || cards.length === 0) setGameOver(true); // Initial load quirk prevent
        }
        if (cards.length === 0) setGameOver(true);
    }, [cards]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

            {/* Demo Indicator */}
            {isDemoMode && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black font-bold px-2 py-1 rounded text-xs uppercase tracking-widest z-50">
                    Demo Mode
                </div>
            )}

            {/* feedback overlay */}
            <AnimatePresence>
                {feedback && (
                    <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`rounded-full p-10 border-8 ${feedback === 'correct' ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'}`}
                        >
                            <h1 className={`text-6xl font-black uppercase tracking-tighter transform -rotate-12 ${feedback === 'correct' ? 'text-green-400' : 'text-red-500'}`}>
                                {feedback === 'correct' ? 'OIKEIN!' : 'VÄÄRIN!'}
                            </h1>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="absolute top-8 z-10 text-center cursor-pointer select-none" onClick={handleLogoClick}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl">🔥</span>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                        PINDER
                    </h1>
                </div>
                <div className="bg-black/40 px-6 py-2 rounded-full border border-white/10">
                    <p className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Pisteet: {score}
                    </p>
                </div>
            </div>

            <div className="relative w-full max-w-sm h-[32rem] flex items-center justify-center mt-10">
                <AnimatePresence>
                    {cards.length > 0 ? (
                        cards.slice(-3).map((politician, index) => (
                            <Card
                                key={politician.id}
                                politician={politician}
                                onSwipe={(dir) => handleSwipe(dir, politician)}
                                style={{ zIndex: index, position: 'absolute' }}
                            />
                        ))
                    ) : (
                        <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
                            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Peli Ohi!</h2>
                            <p className="text-2xl mb-8 font-medium">Lopulliset Pisteet: {score}</p>
                            <button
                                onClick={startNewGame}
                                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full font-bold text-xl text-white hover:scale-105 transition-transform shadow-lg hover:shadow-pink-500/50"
                            >
                                Pelaa Uudelleen ↺
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-8 flex gap-4 text-xs font-bold tracking-widest opacity-60">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/50 text-red-400">
                    <span>← VASEMMISTO</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/50 text-blue-400">
                    <span>KESKUSTA ↑</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/50 text-green-400">
                    <span>OIKEISTO →</span>
                </div>
            </div>
        </div>
    );
}
