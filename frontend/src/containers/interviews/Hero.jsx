import { motion } from "framer-motion";

export default function Hero() {
  return (
    <header className="min-h-screen flex flex-col justify-center items-center text-center px-6">
      <motion.h1
        className="text-4xl md:text-6xl mb-4 font-dela"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        The Underground Squad.
      </motion.h1>
      <motion.p
        className="text-lg max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Alongside major events, we spotlight Taiwan’s underground scenes—music,
        skateboarding, tattoo, graffiti—kept alive by creators shaping a more
        diverse culture.
      </motion.p>
    </header>
  );
}
