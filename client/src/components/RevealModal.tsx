import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AI_MODELS } from '@/lib/types';
import { motion } from 'framer-motion';

interface RevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: 'openai' | 'anthropic' | null;
}

export default function RevealModal({ isOpen, onClose, selectedModel }: RevealModalProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <span className="inline-block bg-orange-100 text-orange-500 font-medium px-4 py-2 rounded-full mb-4">
              AI Model Reveal
            </span>
            <h2 className="font-heading font-bold text-3xl mb-4">
              You Selected Itinerary {selectedModel === 'openai' ? 'A' : 'B'}!
            </h2>
            <p className="text-gray-600 text-base font-normal">
              Time to reveal which AI model created your preferred itinerary.
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* AI Model A */}
          <div className={`border rounded-xl overflow-hidden shadow-md bg-white p-5 ${selectedModel === 'openai' ? 'border-blue-500 border-2' : ''}`}>
            <motion.div 
              initial={false}
              animate={revealed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                <i className="fas fa-robot text-2xl"></i>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2 text-center">Itinerary A</h3>
              <p className="text-lg mb-4 text-center">Created by:</p>
              
              <div className={`bg-gray-100 rounded-lg p-4 mb-4 ${revealed ? 'block' : 'hidden'}`}>
                <p className="font-heading font-bold text-xl text-blue-600 text-center">{openAiModel.name}</p>
                <p className="text-gray-600 text-center">{openAiModel.description}</p>
              </div>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Focuses on cultural immersion</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Prioritizes local experiences</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Seeks hidden gems</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          {/* AI Model B */}
          <div className={`border rounded-xl overflow-hidden shadow-md bg-white p-5 ${selectedModel === 'anthropic' ? 'border-teal-500 border-2' : ''}`}>
            <motion.div 
              initial={false}
              animate={revealed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-3">
                <i className="fas fa-robot text-2xl"></i>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2 text-center">Itinerary B</h3>
              <p className="text-lg mb-4 text-center">Created by:</p>
              
              <div className={`bg-gray-100 rounded-lg p-4 mb-4 ${revealed ? 'block' : 'hidden'}`}>
                <p className="font-heading font-bold text-xl text-teal-600 text-center">{anthropicModel.name}</p>
                <p className="text-gray-600 text-center">{anthropicModel.description}</p>
              </div>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Efficient landmark coverage</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Luxury experience focus</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                  <span>Optimized for popular attractions</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-4">
          {!revealed ? (
            <Button 
              onClick={handleReveal} 
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-colors"
            >
              Reveal AI Models
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleCreateAnother} 
                className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors"
              >
                Create Another Itinerary
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-medium shadow-sm transition-colors"
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
