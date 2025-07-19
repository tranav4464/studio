'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Trending topics cache
const TRENDING_TOPICS = [
  'AI and Machine Learning Trends',
  'Sustainable Technology',
  'Digital Marketing Strategies',
  'Remote Work Best Practices',
  'Cybersecurity Essentials',
  'Cloud Computing Solutions',
  'Data Privacy Regulations',
  'Blockchain Technology',
  'Web Development Frameworks',
  'Mobile App Development',
];

interface IntelligentTopicInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function IntelligentTopicInput({
  value,
  onChange,
  label = 'Topic',
  placeholder = 'Enter your blog topic...',
}: IntelligentTopicInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsProcessing(true);
    setShowSuggestions(true);

    // Simulate processing delay
    const timer = setTimeout(() => {
      const filteredTopics = TRENDING_TOPICS.filter(topic =>
        topic.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredTopics);
      setIsProcessing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="topic">{label}</Label>
      <div className="relative">
        <motion.div
          className={cn(
            'relative rounded-md',
            isProcessing && 'animate-pulse'
          )}
          animate={{
            boxShadow: isProcessing
              ? '0 0 0 2px rgba(99, 102, 241, 0.2)'
              : '0 0 0 0px rgba(99, 102, 241, 0)',
          }}
          transition={{ duration: 0.5 }}
        >
          <Input
            id="topic"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'pr-8 transition-all duration-200',
              isProcessing && 'border-primary/50'
            )}
            onFocus={() => setShowSuggestions(true)}
          />
          {isProcessing && (
            <motion.div
              className="absolute right-2 top-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-2 mt-1 overflow-hidden">
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    custom={index}
                    variants={suggestionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm transition-colors duration-200"
                    onClick={() => {
                      onChange(suggestion);
                      setShowSuggestions(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 