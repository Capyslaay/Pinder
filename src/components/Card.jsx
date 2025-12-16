import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function Card({ politician, onSwipe, style }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Rotate based on x position
    const rotate = useTransform(x, [-200, 200], [-30, 30]);

    // Opacity for "Like" / "Nope" / "Super Like" overlays
    const opacityRight = useTransform(x, [50, 150], [0, 1]);
    const opacityLeft = useTransform(x, [-50, -150], [0, 1]);
    const opacityUp = useTransform(y, [-50, -150], [0, 1]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('right');
        } else if (info.offset.x < -100) {
            onSwipe('left');
        } else if (info.offset.y < -100) {
            onSwipe('up');
        }
    };

    return (
        <motion.div
            style={{ x, y, rotate, touchAction: 'none', ...style }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="absolute w-80 h-[28rem] bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-200"
            whileHover={{ scale: 1.02 }}
        >
            <div className="relative w-full h-full">
                {/* Image */}
                <img
                    src={politician.image}
                    alt={politician.name}
                    className="w-full h-full object-cover pointer-events-none"
                />

                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
                    <h2 className="text-2xl font-bold">{politician.name}</h2>
                </div>

                {/* Swipe Indicators */}
                <motion.div style={{ opacity: opacityRight }} className="absolute top-8 left-8 border-4 border-green-500 rounded-lg p-2 transform -rotate-12">
                    <span className="text-green-500 font-bold text-2xl uppercase tracking-widest">OIKEISTO</span>
                </motion.div>

                <motion.div style={{ opacity: opacityLeft }} className="absolute top-8 right-8 border-4 border-red-500 rounded-lg p-2 transform rotate-12">
                    <span className="text-red-500 font-bold text-2xl uppercase tracking-widest">VASEMMISTO</span>
                </motion.div>

                <motion.div style={{ opacity: opacityUp }} className="absolute bottom-24 left-1/2 -translate-x-1/2 border-4 border-blue-500 rounded-lg p-2">
                    <span className="text-blue-500 font-bold text-2xl uppercase tracking-widest">KESKUSTA</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
