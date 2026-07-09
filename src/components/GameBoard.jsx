import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedText from "./AnimatedText";
import { getNextAction } from "../services/groqApi";

const MAX_QUESTIONS = 20;

export default function GameBoard({ category, onReset }) {
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Game States
  const [gameState, setGameState] = useState("asking"); // asking, guessing, failed, success
  const [guess, setGuess] = useState(null);
  const [guessImage, setGuessImage] = useState("");
  const [userFinalAnswer, setUserFinalAnswer] = useState("");

  // Initialize the first question
  useEffect(() => {
    fetchNextStep([]);
  }, []);

  const fetchNextStep = async (currentHistory) => {
    setLoading(true);
    
    // Check if we hit the limit to save API credits
    if (currentHistory.length >= MAX_QUESTIONS) {
      setGameState("failed");
      setLoading(false);
      return;
    }

    const action = await getNextAction(category, currentHistory);
    
    if (action) {
      if (action.type === "guess") {
        setGuess(action.character);
        fetchWikipediaImage(action.character);
        setGameState("guessing");
      } else {
        setCurrentQuestion(action.text);
      }
    } else {
      // Fallback for API failure
      setCurrentQuestion("I lost my train of thought. Shall we try again?");
    }
    
    setLoading(false);
  };

  const handleAnswer = (answerText) => {
    const updatedHistory = [...history, { q: currentQuestion, a: answerText }];
    setHistory(updatedHistory);
    fetchNextStep(updatedHistory);
  };

  // Free API to grab a quick image for the character (e.g., actor or fictional character)
  const fetchWikipediaImage = async (name) => {
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
      const data = await res.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pages[pageId].thumbnail) {
        setGuessImage(pages[pageId].thumbnail.source);
      }
    } catch (error) {
      console.error("Image fetch failed", error);
    }
  };

  const submitDefeat = (e) => {
    e.preventDefault();
    console.log("User was thinking of:", userFinalAnswer);
    // Here you could save this to a Supabase database to improve the AI later
    setGameState("success");
  };

  const answerButtons = ["Yes", "No", "Don't Know", "Probably", "Probably Not"];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="liquid-glass w-full p-8 rounded-3xl min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        
        {loading && gameState === "asking" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* QUESTION STATE */}
          {gameState === "asking" && (
            <motion.div 
              key="asking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full justify-between"
            >
              <div className="mb-4 flex justify-between text-emerald-300/50 text-sm font-medium">
                <span>Category: {category}</span>
                <span>Question {history.length + 1} / {MAX_QUESTIONS}</span>
              </div>
              
              <div className="flex-grow flex items-center justify-center my-8">
                {currentQuestion && <AnimatedText text={currentQuestion} />}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {answerButtons.map((btn) => (
                  <motion.button
                    key={btn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, backgroundColor: "rgba(46, 204, 113, 0.4)" }}
                    onClick={() => handleAnswer(btn)}
                    disabled={loading}
                    className="liquid-glass-interactive py-3 px-4 rounded-xl text-emerald-50 font-medium tracking-wide border-emerald-500/30 hover:bg-emerald-500/20"
                  >
                    {btn}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* GUESSING STATE */}
          {gameState === "guessing" && (
            <motion.div 
              key="guessing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center h-full justify-center"
            >
              <h3 className="text-xl text-emerald-200 mb-4">I think I know it...</h3>
              
              {guessImage ? (
                <img src={guessImage} alt={guess} className="w-48 h-48 object-cover rounded-2xl border-2 border-emerald-400 mb-6 shadow-[0_0_30px_rgba(46,204,113,0.3)]" />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-black/30 border-2 border-emerald-500/30 mb-6 flex items-center justify-center text-emerald-500/50">
                  No Image Found
                </div>
              )}

              <h2 className="text-4xl font-bold text-white mb-8"><AnimatedText text={`Is it ${guess}?`} /></h2>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setGameState("success")}
                  className="flex-1 liquid-glass-interactive bg-emerald-500/20 hover:bg-emerald-500/40 py-4 rounded-xl text-white font-bold"
                >
                  Yes! You got it.
                </button>
                <button 
                  onClick={() => {
                    handleAnswer(`No, it is not ${guess}`);
                    setGameState("asking");
                  }}
                  className="flex-1 liquid-glass-interactive bg-red-500/10 hover:bg-red-500/30 border-red-500/30 py-4 rounded-xl text-white font-bold"
                >
                  No, wrong.
                </button>
              </div>
            </motion.div>
          )}

          {/* FAILED STATE (Give up screen) */}
          {gameState === "failed" && (
            <motion.div 
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center justify-center h-full"
            >
              <h2 className="text-3xl font-bold text-emerald-400 mb-4">You stumped me!</h2>
              <p className="text-emerald-100/70 mb-6">I couldn't guess it within the limit. Who were you thinking of?</p>
              
              <form onSubmit={submitDefeat} className="w-full relative">
                <input
                  type="text"
                  required
                  value={userFinalAnswer}
                  onChange={(e) => setUserFinalAnswer(e.target.value)}
                  placeholder="E.g. Steve Harrington..."
                  className="w-full bg-black/20 border border-emerald-500/30 rounded-full py-4 px-6 text-white mb-4 focus:outline-none focus:border-emerald-400"
                />
                <button type="submit" className="w-full liquid-glass-interactive bg-emerald-500/30 py-3 rounded-full text-white font-bold">
                  Submit Answer
                </button>
              </form>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {gameState === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center justify-center h-full"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Great Game!</h2>
              <button 
                onClick={onReset}
                className="liquid-glass-interactive bg-emerald-500/40 px-8 py-4 rounded-full text-white font-bold shadow-[0_0_20px_rgba(46,204,113,0.4)]"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {gameState === "asking" && (
        <button onClick={onReset} className="mt-6 text-sm text-emerald-400/50 hover:text-emerald-400 transition-colors">
          End Game Early
        </button>
      )}
    </div>
  );
}