import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

const AILoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-electric-glow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Dumbbell className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <h3 className="font-display text-lg font-semibold text-foreground">Generating Your Plan</h3>
        <motion.div className="flex items-center gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
        <p className="text-sm text-muted-foreground">Our AI is crafting a personalized workout plan...</p>
      </div>
    </div>
  );
};

export default AILoadingAnimation;
