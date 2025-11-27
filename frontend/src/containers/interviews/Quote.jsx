import { motion } from "framer-motion";

export default function Quote() {
  return (
    <motion.div
      className="italic text-center text-xl py-16 px-6 text-gray-700"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      Lorem ipsum dolor sit amet.
    </motion.div>
  );
}
