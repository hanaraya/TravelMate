import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setRevealed(false);
      }, 300);
    }
  }, [isOpen]);

  const handleReveal = () => {
    setRevealed(true);
    // Check if the user guessed correctly - they picked OpenAI and it is OpenAI, or they picked Anthropic and it is Anthropic
    const correctGuess = (selectedModel === 'openai' && openAiModel.name.includes('GPT')) || 
                        (selectedModel === 'anthropic' && anthropicModel.name.includes('Claude'));
    setIsCorrect(correctGuess);
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
      <DialogContent className="max-w-3xl overflow-hidden p-0 rounded-xl">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <DialogTitle className="text-3xl font-bold mb-2">
            You Selected Itinerary {selectedModel === 'openai' ? 'A' : 'B'}!
          </DialogTitle>
          <DialogDescription className="text-white/90 text-base">
            Let's see which AI model created your preferred itinerary
          </DialogDescription>

          {revealed && isCorrect && (
            <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 mx-auto max-w-md">
              <div className="flex items-center">
                <div className="mr-3 bg-green-500/20 w-8 h-8 rounded-full flex items-center justify-center">
                  <span role="img" aria-label="trophy" className="text-yellow-300 text-xl">🏆</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">Great job! You correctly identified the AI model!</p>
                  <p className="text-sm text-white/80">Your AI detection skills are impressive</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Model */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-100">
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <span className="font-bold">{selectedModel === 'openai' ? 'A' : 'B'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">Your Selection</h3>
                    <p className="text-sm text-white/80">Itinerary {selectedModel === 'openai' ? 'A' : 'B'}</p>
                  </div>
                  {revealed && (
                    <div className="ml-auto">
                      <span className="bg-yellow-400 text-yellow-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-center mb-4">
                  {!revealed ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">?</span>
                    </div>
                  ) : (
                    <div>
                      {selectedModel === 'openai' ? (
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm5.9 6.4c1.769 0 3.1 1.331 3.1 3.1s-1.331 3.1-3.1 3.1-3.1-1.331-3.1-3.1 1.331-3.1 3.1-3.1zm-5.9 4.2c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4c0 1.286-.611 2.428-1.556 3.164.344.401.556.91.556 1.466 0 1.105-.895 2-2 2-.766 0-1.43-.432-1.766-1.063-.078-.02-.156-.037-.234-.037-.214 0-.414.097-.547.267-.133.17-.173.39-.107.592.248.751.691 1.398 1.254 1.86-1.279 1.247-3.025 2.018-4.95 2.018-3.866 0-7-3.134-7-7s3.134-7 7-7c2.125 0 4.028.945 5.318 2.437-1.159 1.24-1.518 2.325-1.518 3.563 0 .478.078.926.215 1.349z"/>
                            </svg>
                          </span>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z"/>
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {revealed && (
                  <div className="text-center mb-4">
                    <h3 className={`font-bold text-xl ${selectedModel === 'openai' ? 'text-blue-600' : 'text-teal-600'}`}>
                      {selectedModel === 'openai' ? 'GPT-4o' : 'Claude 3.7 Sonnet'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedModel === 'openai' 
                        ? "OpenAI's advanced language model" 
                        : "Anthropic's most capable AI assistant"}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${selectedModel === 'openai' ? 'bg-blue-50' : 'bg-teal-50'}`}>
                    <div className="flex">
                      <div className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${selectedModel === 'openai' ? 'text-blue-600' : 'text-teal-600'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Strength</p>
                        <p className="text-sm text-gray-600">
                          {selectedModel === 'openai' 
                            ? 'Focuses on cultural immersion' 
                            : revealed ? 'Efficient landmark coverage' : '????'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${selectedModel === 'openai' ? 'bg-blue-50' : 'bg-teal-50'}`}>
                    <div className="flex">
                      <div className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${selectedModel === 'openai' ? 'text-blue-600' : 'text-teal-600'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Focus</p>
                        <p className="text-sm text-gray-600">
                          {selectedModel === 'openai' 
                            ? 'Local Experiences' 
                            : revealed ? 'Iconic Experiences' : '????'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other Model */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-gray-100 p-4 text-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium">{selectedModel === 'openai' ? 'B' : 'A'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Other AI</h3>
                    <p className="text-sm text-gray-600">Itinerary {selectedModel === 'openai' ? 'B' : 'A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-center mb-4">
                  {!revealed ? (
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">?</span>
                    </div>
                  ) : (
                    <div>
                      {selectedModel !== 'openai' ? (
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                          <span className="text-blue-500 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm5.9 6.4c1.769 0 3.1 1.331 3.1 3.1s-1.331 3.1-3.1 3.1-3.1-1.331-3.1-3.1 1.331-3.1 3.1-3.1zm-5.9 4.2c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4c0 1.286-.611 2.428-1.556 3.164.344.401.556.91.556 1.466 0 1.105-.895 2-2 2-.766 0-1.43-.432-1.766-1.063-.078-.02-.156-.037-.234-.037-.214 0-.414.097-.547.267-.133.17-.173.39-.107.592.248.751.691 1.398 1.254 1.86-1.279 1.247-3.025 2.018-4.95 2.018-3.866 0-7-3.134-7-7s3.134-7 7-7c2.125 0 4.028.945 5.318 2.437-1.159 1.24-1.518 2.325-1.518 3.563 0 .478.078.926.215 1.349z"/>
                            </svg>
                          </span>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center">
                          <span className="text-teal-500 text-3xl">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z"/>
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {revealed && (
                  <div className="text-center mb-4">
                    <h3 className={`font-bold text-xl ${selectedModel !== 'openai' ? 'text-blue-500' : 'text-teal-500'}`}>
                      {selectedModel !== 'openai' ? 'GPT-4o' : 'Claude 3.7 Sonnet'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedModel !== 'openai' 
                        ? "OpenAI's advanced language model" 
                        : "Anthropic's most capable AI assistant"}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${revealed ? 'bg-gray-50' : 'bg-gray-50 opacity-70'}`}>
                    <div className="flex">
                      <div className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Strength</p>
                        <p className="text-sm text-gray-600">
                          {revealed 
                            ? (selectedModel !== 'openai' ? 'Focuses on cultural immersion' : 'Efficient landmark coverage')
                            : '????'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${revealed ? 'bg-gray-50' : 'bg-gray-50 opacity-70'}`}>
                    <div className="flex">
                      <div className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Focus</p>
                        <p className="text-sm text-gray-600">
                          {revealed 
                            ? (selectedModel !== 'openai' ? 'Local Experiences' : 'Iconic Experiences')
                            : '????'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {revealed && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800 mb-1">Did you know?</p>
                  <p className="text-sm text-gray-700">
                    Different AI models have distinct approaches to creating itineraries. GPT-4o often excels at creating diverse, 
                    creative suggestions, while Claude 3.7 Sonnet frequently provides more detailed and structured guidance.
                    Which did you prefer?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          {!revealed ? (
            <Button 
              onClick={handleReveal}
              className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Reveal AI Models
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={handleCreateAnother} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2"
              >
                Create Another Itinerary
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 text-gray-700 rounded-lg px-4 py-2"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}