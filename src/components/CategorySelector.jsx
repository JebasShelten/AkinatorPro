import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { generateCategories } from "../services/groqApi";

export default function CategorySelector({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customInput, setCustomInput] = useState("");

  const fetchCategories = async (query = "") => {
    setLoading(true);
    // Placeholder categories while API loads, styled for testing
    setCategories(["Tamil Cinema Actors", "Sci-Fi TV Characters", "Tech YouTubers", "Cricket Players"]);
    
    // Uncomment this when your Groq API key is active to fetch real data
    /*
    const data = await generateCategories(query);
    if (data && data.categories) {
      setCategories(data.categories);
    }
    */
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      fetchCategories(customInput);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-6"
    >
      <div className="liquid-glass w-full p-8 rounded-3xl text-center">
        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          Think of a Character
        </h1>
        <p className="text-emerald-100/70 mb-8">
          Choose a theme or generate your own, and I will read your mind.
        </p>

        {/* Custom Input Box */}
        <form onSubmit={handleCustomSubmit} className="relative w-full mb-8">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type a custom theme (e.g., 90s Villains)..."
            className="w-full bg-black/20 border border-emerald-500/30 rounded-full py-4 px-6 text-white placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400 transition-colors"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-full px-4 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-between w-full mb-4 px-2">
          <span className="text-sm font-medium text-emerald-200/50 uppercase tracking-wider">
            Suggested Categories
          </span>
          <button 
            onClick={() => fetchCategories()}
            disabled={loading}
            className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* AI Generated Category Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory(cat)}
              className="liquid-glass-interactive flex items-center justify-between p-4 rounded-xl text-left text-emerald-50 group"
            >
              <span>{cat}</span>
              <ChevronRight className="w-5 h-5 text-emerald-500/0 group-hover:text-emerald-400 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}