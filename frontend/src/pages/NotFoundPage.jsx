import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 2], opacity: [0.1, 0.05, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
            className="w-[800px] h-[800px] rounded-full bg-indigo-500 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
         />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center text-white p-8 max-w-md"
      >
        <motion.div
           animate={{ y: [0, -15, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
           className="w-32 h-32 mx-auto mb-8 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20"
        >
           <span className="text-5xl font-black text-indigo-400 font-manrope">404</span>
        </motion.div>

        <h1 className="text-4xl font-extrabold mb-4 font-manrope bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
           Unauthorized Space
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
           You seemed to have drifted off your designated orbit. This sector is restricted or doesn't exist.
        </p>

        <button 
           onClick={() => navigate('/')}
           className="btn-primary px-8 py-3 rounded-xl font-bold tracking-wide shadow-indigo-500/25 hover:shadow-indigo-500/40 relative overflow-hidden group w-full sm:w-auto"
        >
           <span className="relative z-10 flex items-center justify-center gap-2">
             Back to Login
           </span>
        </button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;