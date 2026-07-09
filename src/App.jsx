import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CategorySelector from "./components/CategorySelector";
import GameBoard from "./components/GameBoard";
// import GameBoard from "./components/GameBoard"; // We will import this in the next phase

export default function App() {
  const [gameState, setGameState] = useState("home"); // States: 'home', 'playing', 'result'
  const [selectedCategory, setSelectedCategory] = useState("");

  const startGame = (category) => {
    setSelectedCategory(category);
    setGameState("playing");
  };

  const resetGame = () => {
    setSelectedCategory("");
    setGameState("home");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Ambient background glows to enhance the glassmorphism effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-700/20 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="z-10 w-full p-4">
        <AnimatePresence mode="wait">
          {gameState === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CategorySelector onSelectCategory={startGame} />
            </motion.div>
          )}

          {gameState === "playing" && (
  <motion.div
    key="playing"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-4"
  >
    <GameBoard category={selectedCategory} onReset={resetGame} />
  </motion.div>
)}
        </AnimatePresence>
      </main>
    </div>
  );
}