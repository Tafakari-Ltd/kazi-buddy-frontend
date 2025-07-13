import { motion } from "framer-motion";

export const Preloader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 space-y-4">
    <motion.svg
      className="w-12 h-12 text-[#800000]"
      viewBox="0 0 50 50"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      aria-label="Loading spinner"
    >
      <circle
        className="opacity-25"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="90 150"
        strokeDashoffset="0"
        animate={{ strokeDashoffset: [0, -220] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      />
    </motion.svg>

    <motion.h1
      className="text-2xl font-bold text-[#800000] tracking-wide select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
    >
      kazibuddy
    </motion.h1>
  </div>
);
