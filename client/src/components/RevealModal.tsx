import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AI_MODELS } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface RevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: 'openai' | 'anthropic' | null;
}

export default function RevealModal({ isOpen, onClose, selectedModel }: RevealModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setRevealed(false);
        setAnimationComplete(false);
      }, 300);
    }
  }, [isOpen]);

  const handleReveal = () => {
    setRevealed(true);
    // Check if the user guessed correctly - they picked OpenAI and it is OpenAI, or they picked Anthropic and it is Anthropic
    const correctGuess = (selectedModel === 'openai' && openAiModel.name.includes('GPT')) || 
                        (selectedModel === 'anthropic' && anthropicModel.name.includes('Claude'));
    setIsCorrect(correctGuess);
    
    // Set animation complete after delay
    setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);
  };

  const handleCreateAnother = () => {
    setRevealed(false);
    onClose();
    // Scroll to the form section
    const formSection = document.getElementById('create-itinerary');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!selectedModel) return null;

  const openAiModel = AI_MODELS.openai;
  const anthropicModel = AI_MODELS.anthropic;
  
  // Determine which model the user selected
  const selectedModelData = selectedModel === 'openai' ? openAiModel : anthropicModel;
  const otherModelData = selectedModel === 'openai' ? anthropicModel : openAiModel;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden p-0 rounded-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 pb-6">
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 filter blur-2xl"></div>
            <div className="absolute top-40 -left-20 w-60 h-60 rounded-full bg-white/10 filter blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-4"
            >
              <Badge className="bg-white/20 text-white hover:bg-white/30 px-4 py-1.5 text-sm rounded-full backdrop-blur-sm">
                AI Model Reveal
              </Badge>
            </motion.div>
            
            <motion.h2 
              className="font-heading font-bold text-4xl mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              You Selected Itinerary {selectedModel === 'openai' ? 'A' : 'B'}!
            </motion.h2>
            
            <motion.p 
              className="text-white/80 text-center max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Let's see which AI model created your preferred itinerary
            </motion.p>
            
            <AnimatePresence>
              {revealed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-500/20 backdrop-blur-sm' : 'bg-amber-500/20 backdrop-blur-sm'} mx-auto max-w-xl`}
                >
                  {isCorrect ? (
                    <div className="flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-green-500/30 flex items-center justify-center mr-3">
                        <i className="fas fa-trophy text-yellow-300"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">Great job! You correctly identified the AI model!</p>
                        <p className="text-sm text-white/70">Your AI detection skills are impressive</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-amber-500/30 flex items-center justify-center mr-3">
                        <i className="fas fa-surprise text-amber-300"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">Interesting choice! AI models can be tricky to tell apart.</p>
                        <p className="text-sm text-white/70">Both models created impressive itineraries</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Selected Model */}
            <motion.div 
              className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                selectedModel === 'openai' 
                  ? 'bg-gradient-to-b from-blue-50 to-white border border-blue-200'
                  : 'bg-gradient-to-b from-teal-50 to-white border border-teal-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`py-6 px-4 ${
                selectedModel === 'openai' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                  : 'bg-gradient-to-r from-teal-600 to-teal-700'
              } text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-28 h-28 opacity-15">
                  <i className="fas fa-crown text-7xl absolute top-2 -right-2 transform rotate-15"></i>
                </div>
                
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">
                        {selectedModel === 'openai' ? 'A' : 'B'}
                      </span>
                    </div>
                    <motion.div 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    >
                      <i className="fas fa-check text-xs text-white"></i>
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-xl">Your Selection</h3>
                    <p className="text-white/80 text-sm">Itinerary {selectedModel === 'openai' ? 'A' : 'B'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center mb-5">
                  <AnimatePresence>
                    {!revealed ? (
                      <motion.div 
                        className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center"
                        exit={{ scale: 0.5, opacity: 0 }}
                        key="hidden-logo"
                      >
                        <i className="fas fa-question text-gray-400 text-5xl"></i>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className={`w-24 h-24 rounded-full ${
                          selectedModel === 'openai' ? 'bg-blue-100' : 'bg-teal-100'
                        } flex items-center justify-center`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, rotate: [0, 10, 0] }}
                        transition={{ type: "spring", duration: 0.6 }}
                        key="shown-logo"
                      >
                        <i className={`${
                          selectedModel === 'openai' ? 'fas fa-robot text-blue-600' : 'fas fa-brain text-teal-600'
                        } text-5xl`}></i>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <AnimatePresence>
                  {revealed && (
                    <motion.div 
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className={`font-bold text-2xl mb-1 ${
                        selectedModel === 'openai' ? 'text-blue-600' : 'text-teal-600'
                      }`}>
                        {selectedModelData.name}
                      </h3>
                      <p className="text-gray-600">{selectedModelData.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-3">
                  <motion.div 
                    className={`p-3 rounded-lg ${
                      selectedModel === 'openai' ? 'bg-blue-50' : 'bg-teal-50'
                    } border ${
                      selectedModel === 'openai' ? 'border-blue-100' : 'border-teal-100'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: revealed ? 0.5 : 0.2 }}
                  >
                    <div className="flex">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        selectedModel === 'openai' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'
                      }`}>
                        <i className="fas fa-star-half-alt"></i>
                      </div>
                      <div>
                        <p className="font-medium">Strength</p>
                        <p className="text-sm text-gray-600">{selectedModelData.strength}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className={`p-3 rounded-lg ${
                      selectedModel === 'openai' ? 'bg-blue-50' : 'bg-teal-50'
                    } border ${
                      selectedModel === 'openai' ? 'border-blue-100' : 'border-teal-100'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: revealed ? 0.6 : 0.3 }}
                  >
                    <div className="flex">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        selectedModel === 'openai' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'
                      }`}>
                        <i className="fas fa-bullseye"></i>
                      </div>
                      <div>
                        <p className="font-medium">Focus</p>
                        <p className="text-sm text-gray-600">{selectedModelData.focus}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Other Model (The one not selected) */}
            <motion.div 
              className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: revealed ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="py-5 px-4 bg-gray-100 text-gray-800 relative overflow-hidden">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-gray-700 font-medium">
                      {selectedModel === 'openai' ? 'B' : 'A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Other AI</h3>
                    <p className="text-gray-600 text-sm">Itinerary {selectedModel === 'openai' ? 'B' : 'A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center mb-5">
                  <AnimatePresence>
                    {!revealed ? (
                      <motion.div 
                        className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"
                        exit={{ scale: 0.5, opacity: 0 }}
                        key="hidden-other-logo"
                      >
                        <i className="fas fa-question text-gray-400 text-4xl"></i>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className={`w-20 h-20 rounded-full ${
                          selectedModel !== 'openai' ? 'bg-blue-50' : 'bg-teal-50'
                        } flex items-center justify-center`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                        key="shown-other-logo"
                      >
                        <i className={`${
                          selectedModel !== 'openai' ? 'fas fa-robot text-blue-500' : 'fas fa-brain text-teal-500'
                        } text-4xl opacity-80`}></i>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <AnimatePresence>
                  {revealed && (
                    <motion.div 
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className={`font-bold text-xl mb-1 ${
                        selectedModel !== 'openai' ? 'text-blue-500' : 'text-teal-500'
                      }`}>
                        {otherModelData.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{otherModelData.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-3">
                  <motion.div 
                    className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: revealed ? 0.7 : 0.4 }}
                  >
                    <div className="flex">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-600">
                        <i className="fas fa-star-half-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Strength</p>
                        <p className="text-xs text-gray-600">{revealed ? otherModelData.strength : "????"}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: revealed ? 0.8 : 0.5 }}
                  >
                    <div className="flex">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-600">
                        <i className="fas fa-bullseye text-sm"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Focus</p>
                        <p className="text-xs text-gray-600">{revealed ? otherModelData.focus : "????"}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom content */}
          {revealed && animationComplete && (
            <motion.div 
              className="mt-8 p-5 rounded-xl bg-indigo-50 border border-indigo-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="font-semibold text-lg mb-3 flex items-center text-indigo-700">
                <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
                Did you know?
              </h3>
              <p className="text-gray-700">
                Different AI models have distinct approaches to creating itineraries. {openAiModel.name} often excels at 
                creating diverse, creative suggestions, while {anthropicModel.name} frequently provides 
                more detailed and structured guidance. Which did you prefer?
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <motion.div 
            className="flex flex-col sm:flex-row sm:justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {!revealed ? (
              <Button 
                onClick={handleReveal} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-medium shadow-md transition-colors"
              >
                <i className="fas fa-magic mr-2"></i>
                Reveal AI Models
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleCreateAnother} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-5 rounded-xl font-medium shadow-md transition-colors"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Create Another Itinerary
                </Button>
                <Button 
                  onClick={onClose} 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-5 rounded-xl font-medium shadow-sm transition-colors"
                >
                  Close
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
