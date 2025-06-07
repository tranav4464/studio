'use client';

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type Suggestion = {
  id: string;
  text: string;
  isNew?: boolean;
  frequency?: number;
  lastSelected?: number;
  fromHistory?: boolean;
  isSelected?: boolean;
  isExpanding?: boolean;
  isLifted?: boolean;
  isDimmed?: boolean;
  zIndex?: number;
  relevance?: number;
};

type HistoryEntry = {
  selections: Record<string, number>;
  timestamp: number;
};

type SuggestionItemProps = {
  suggestion: Suggestion;
  index: number;
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
  showPulse: boolean;
};

type SuggestionListProps = {
  suggestions: Suggestion[];
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
  showPulse: boolean;
};

type IntelligentTopicInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  debounceDelay?: number;
  showPulse?: boolean;
};

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const SuggestionItem = memo(({ 
  suggestion, 
  index, 
  selectedIndex, 
  onSelect,
  onHover,
  showPulse
}: SuggestionItemProps) => (
  <MotionDiv
    ref={el => { 
      if (el) (el as any).suggestionRefs = { current: el };
    }}
    className={cn(
      'relative flex items-center px-4 py-3 text-sm cursor-pointer',
      'hover:bg-accent/50 transition-colors',
      selectedIndex === index ? 'bg-accent/30' : 'bg-popover',
      suggestion.isNew && 'border-l-2 border-primary/70'
    )}
    initial={suggestion.isNew ? { x: -5, opacity: 0 } : { x: 0, opacity: 1 }}
    animate={{ 
      x: 0, 
      opacity: 1,
      backgroundColor: selectedIndex === index ? 'hsl(var(--accent)/0.3)' : 'hsl(var(--popover))',
    }}
    transition={{
      x: { duration: 0.2, ease: "easeOut" },
      backgroundColor: { duration: 0.1 }
    }}
    onMouseDown={(e) => {
      e.preventDefault();
      onSelect(suggestion);
    }}
    onMouseEnter={() => onHover(index)}
  >
    {suggestion.isNew && (
      <MotionSpan 
        className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/50"
        initial={{ scaleY: 0.5, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
    <span className="truncate">{suggestion.text}</span>
    
    {suggestion.isNew && (
      <MotionSpan
        className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
      >
        New
      </MotionSpan>
    )}
    
    {showPulse && suggestion.isNew && (
      <MotionSpan
        className="absolute inset-0 rounded-md bg-primary/5"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    )}
  </MotionDiv>
));

const SuggestionList = memo(({ 
  suggestions, 
  selectedIndex,
  onSelect,
  onHover,
  showPulse
}: SuggestionListProps) => (
  <MotionDiv
    className="absolute z-10 mt-2 w-full rounded-lg border bg-popover shadow-lg overflow-hidden"
    initial={{ opacity: 0, y: 5, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 5, scale: 0.98 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
  >
    {suggestions.map((suggestion, index) => (
      <SuggestionItem 
        key={suggestion.id}
        suggestion={suggestion}
        index={index}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        onHover={onHover}
        showPulse={showPulse}
      />
    ))}
  </MotionDiv>
));

export function IntelligentTopicInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = 'Search topics...',
  className,
  debounceDelay = 300,
  showPulse = true,
}: IntelligentTopicInputProps) {
  const { toast } = useToast() as { toast: any };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showPulseState, setShowPulseState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const controls = useAnimation();
  const lastQueryLength = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const pulseAnimation = useAnimation();
  const borderGlowAnimation = useAnimation();
  
  // Trigger micro-vibration when new suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0 && suggestions.some(s => s.isNew)) {
      try {
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } catch (e) {
        console.warn('Vibration API not supported');
      }
      
      // Trigger pulse animation
      setShowPulseState(true);
      const timer = setTimeout(() => setShowPulseState(false), 500);
      return () => clearTimeout(timer);
    }
  }, [suggestions]);
  
  // Border glow animation during processing
  useEffect(() => {
    if (isLoading || isProcessing) {
      borderGlowAnimation.start({
        background: [
          'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(99,102,241,0.1) 100%)',
          'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.4) 50%, rgba(99,102,241,0.2) 100%)',
          'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(99,102,241,0.1) 100%)',
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      });
    } else {
      borderGlowAnimation.start({
        background: 'transparent',
        transition: { duration: 0.3 }
      });
    }
  }, [isLoading, isProcessing, borderGlowAnimation]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const getHistory = (): Record<string, HistoryEntry> => {
    if (typeof window === 'undefined') return {};
    try {
      const history = localStorage.getItem('topicHistory');
      return history ? JSON.parse(history) : {};
    } catch (error) {
      console.error('Error reading history from localStorage', error);
      return {};
    }
  };

  const fetchGeminiSuggestions = useCallback(async (query: string) => {
    try {
      const response = await fetch('/api/gemini/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          count: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      // Add haptic feedback on new suggestions
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      return data.suggestions || [];
    } catch (error) {
      console.error('Error fetching Gemini suggestions:', error);
      throw error;
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    // Show trending topics when input is empty
    if (!trimmedQuery) {
      const trendingTopics: Suggestion[] = [
        { 
          id: generateId(), 
          text: 'Latest trends in AI', 
          frequency: 0.9, 
          lastSelected: Date.now(),
          fromHistory: true 
        },
        { 
          id: generateId(), 
          text: 'Sustainable technology', 
          frequency: 0.85, 
          lastSelected: Date.now(),
          fromHistory: true
        },
      ];
      setSuggestions(trendingTopics);
      return;
    }

    // Only fetch new suggestions if query length >= 3 and different from last query
    if (trimmedQuery.length >= 3 && trimmedQuery.length !== lastQueryLength.current) {
      setIsProcessing(true);
      lastQueryLength.current = trimmedQuery.length;
      
      // Clear any existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Set a new debounce timer
      debounceTimer.current = setTimeout(async () => {
        try {
          // Start loading animation
          await controls.start({
            borderColor: ['#4F46E5', '#A855F7', '#4F46E5'],
            transition: { duration: 1.5, repeat: Infinity }
          });
          
          // Fetch suggestions from Gemini API
          const geminiSuggestions = await fetchGeminiSuggestions(trimmedQuery);
          
          // Add new suggestions with animation properties
          const newSuggestions = geminiSuggestions.map((text: string) => ({
            id: generateId(),
            text,
            frequency: 0.9, // Default frequency
            lastSelected: Date.now(),
            isNew: true
          }));
          
          setSuggestions(prev => {
            // Mark previous suggestions as not new
            const updatedPrev = prev.map(s => ({ ...s, isNew: false }));
            return [...updatedPrev, ...newSuggestions];
          });
          
        } catch (error) {
          console.error('Error in fetchSuggestions:', error);
          toast({
            title: 'Failed to load suggestions',
            description: 'Using default suggestions instead',
            variant: 'destructive',
          } as any);
          
          // Fallback to local suggestions
          const fallbackSuggestions: Suggestion[] = [
            { 
              id: generateId(), 
              text: `${trimmedQuery} best practices`,
              frequency: 0.9,
              lastSelected: Date.now()
            },
            { 
              id: generateId(), 
              text: `How to master ${trimmedQuery}`,
              frequency: 0.85,
              lastSelected: Date.now()
            },
          ];
          
          setSuggestions(fallbackSuggestions);
        } finally {
          setIsProcessing(false);
          controls.stop();
        }
      }, 300); // 300ms debounce
    }
  }, [fetchGeminiSuggestions, controls]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length >= 3) {
        fetchSuggestions(value);
      } else if (value.trim().length === 0) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion.text);
    } else {
      onChange(suggestion.text);
    }
    setSuggestions([]);
    inputRef.current?.focus();
  }, [onSuggestionSelect, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        break;
    }
  }, [suggestions, selectedIndex, handleSuggestionSelect]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  const handleHover = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);

    // Clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, debounceDelay);
  }, [debounceDelay, onChange, fetchSuggestions]);

  return (
    <div className="relative w-full">
      <MotionDiv 
        className={cn(
          'relative rounded-lg transition-all duration-300',
          'border border-border',
          (isLoading || isProcessing) && 'border-transparent',
          className
        )}
        ref={containerRef}
        animate={borderGlowAnimation}
        initial={{ background: 'transparent' }}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "w-full transition-all duration-200 bg-background/80 backdrop-blur-sm",
              (isLoading || isProcessing) && "pr-10"
            )}
          />
          {(isLoading || isProcessing) && (
            <MotionDiv 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Icons.Spinner className="h-4 w-4 animate-spin text-primary" />
            </MotionDiv>
          )}
        </div>
      
        <AnimatePresence>
          {/* Loading indicator */}
          {isLoading && (
            <MotionDiv 
              className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Suggestion list */}
          {suggestions.length > 0 && isFocused && (
            <SuggestionList 
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onSelect={handleSuggestionSelect}
              onHover={handleHover}
              showPulse={showPulseState}
            />
          )}
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
}
