import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  return (
    <header className="min-h-[100dvh] flex flex-col justify-center items-center text-center px-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="will-change-transform flex flex-col justify-center items-center"
      >
        <motion.h1
          variants={item}
          className="text-4xl md:text-6xl mb-4 font-dela"
        >
          The Underground Squad.
        </motion.h1>

        <motion.p variants={item} className="text-lg max-w-md">
          Alongside major events, we spotlight Taiwan’s underground
          scenes—music, skateboarding, tattoo, graffiti—kept alive by creators
          shaping a more diverse culture.
        </motion.p>
      </motion.div>
    </header>
  );
}
