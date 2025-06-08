
'use client';

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
// import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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

// const MotionDiv = motion.div;
// const MotionSpan = motion.span;
const MotionDiv = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />);
MotionDiv.displayName = 'MotionDiv';

const MotionSpan = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => <span ref={ref} {...props} />);
MotionSpan.displayName = 'MotionSpan';


const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;


const SuggestionItem = memo(function SuggestionItem({
  suggestion,
  index,
  selectedIndex,
  onSelect,
  onHover,
  showPulse
}: SuggestionItemProps) {
  const isSelected = selectedIndex === index;
  const isNew = suggestion.isNew;

  return (
    <MotionDiv
      // ref={el => {
      //   if (el) (el as any).suggestionRefs = { current: el };
      // }}
      className={cn(
        'relative flex items-center px-4 py-3 text-sm cursor-pointer',
        'hover:bg-accent/50 transition-all duration-200',
        isSelected ? 'bg-accent/30' : 'bg-popover',
        isNew && 'border-l-2 border-primary/70',
        'group/suggestion'
      )}
      // initial={isNew ? { x: -5, opacity: 0 } : { x: 0, opacity: 1 }}
      // animate={{
      //   x: 0,
      //   opacity: 1,
      //   scale: isSelected ? 1.01 : 1,
      //   backgroundColor: isSelected ? 'hsl(var(--accent)/0.3)' : 'hsl(var(--popover))',
      //   transition: {
      //     backgroundColor: { duration: 0.1 },
      //     scale: { type: 'spring', stiffness: 500, damping: 30 }
      //   }
      // }}
      // whileHover={{
      //   scale: 1.01,
      //   backgroundColor: 'hsl(var(--accent)/0.2)',
      //   transition: { duration: 0.15 }
      // }}
      style={{
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        backgroundColor: isSelected ? 'hsl(var(--accent)/0.3)' : 'hsl(var(--popover))',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(suggestion);
        if ('vibrate' in navigator) {
          navigator.vibrate(5);
        }
      }}
      onMouseEnter={() => onHover(index)}
    >
      {showPulse && isNew && (
        <MotionDiv
          className="absolute inset-0 bg-primary/5 rounded-md"
          // initial={{ opacity: 0.5, scale: 1 }}
          // animate={{
          //   opacity: 0,
          //   scale: 1.05,
          //   transition: { duration: 0.5, ease: 'easeOut' }
          // }}
        />
      )}
      {isNew && (
        <MotionSpan
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/50"
          // initial={{ scaleY: 0.5, opacity: 0 }}
          // animate={{ scaleY: 1, opacity: 1 }}
          // transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
      <span className="truncate">{suggestion.text}</span>

      {isNew && (
        <MotionSpan
          className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
          // initial={{ scale: 0.8, opacity: 0 }}
          // animate={{ scale: 1, opacity: 1 }}
          // transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 20 }}
        >
          New
        </MotionSpan>
      )}
    </MotionDiv>
  );
});

const SuggestionList = memo(({
  suggestions,
  selectedIndex,
  onSelect,
  onHover,
  showPulse
}: SuggestionListProps) => (
  <MotionDiv
    className="absolute z-10 mt-2 w-full rounded-lg border bg-popover shadow-lg overflow-hidden"
    // initial={{ opacity: 0, y: 5, scale: 0.98 }}
    // animate={{ opacity: 1, y: 0, scale: 1 }}
    // exit={{ opacity: 0, y: 5, scale: 0.98 }}
    // transition={{ duration: 0.15, ease: "easeOut" }}
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
  // const controls = useAnimation();
  // const pulseAnimation = useAnimation();
  // const borderGlowAnimation = useAnimation();

  const controls = { start: () => {}, stop: () => {} }; // Mock animation controls
  const pulseAnimation = { start: () => {}, stop: () => {} }; // Mock animation controls
  const borderGlowAnimation = { start: () => {}, stop: () => {} }; // Mock animation controls


  const lastQueryLength = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (suggestions.length > 0 && suggestions.some(s => s.isNew)) {
      try {
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } catch (e) {
        console.warn('Vibration API not supported');
      }

      setShowPulseState(true);
      const timer = setTimeout(() => setShowPulseState(false), 500);
      return () => clearTimeout(timer);
    }
  }, [suggestions]);

  useEffect(() => {
    if (isLoading || isProcessing) {
      // borderGlowAnimation.start({
      //   background: [
      //     'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(99,102,241,0.1) 100%)',
      //     'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.4) 50%, rgba(99,102,241,0.2) 100%)',
      //     'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(99,102,241,0.1) 100%)',
      //   ],
      //   transition: {
      //     duration: 2,
      //     repeat: Infinity,
      //     ease: 'easeInOut'
      //   }
      // });
    } else {
      // borderGlowAnimation.start({
      //   background: 'transparent',
      //   transition: { duration: 0.3 }
      // });
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
    console.log('Fetching suggestions for query:', query);
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

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        let apiErrorDetails = `Failed to fetch suggestions: ${response.status} ${response.statusText}`;
        try {
          const parsedError = JSON.parse(errorText);
          if (parsedError && parsedError.details && typeof parsedError.details === 'string' && parsedError.details.includes('NEXT_PUBLIC_GEMINI_API is not configured')) {
            apiErrorDetails = 'Gemini API Key is missing. Please set NEXT_PUBLIC_GEMINI_API in your .env.local file.';
          } else if (parsedError && parsedError.error) {
            apiErrorDetails = parsedError.error;
          }
        } catch (e) {
          // JSON parsing failed, stick to original error message if errorText itself is not empty
          if (errorText.trim()) {
            apiErrorDetails = errorText;
          }
        }
        throw new Error(apiErrorDetails);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!data.suggestions) {
        console.warn('No suggestions in response:', data);
        return [];
      }

      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      return data.suggestions;
    } catch (error) {
      console.error('Error in fetchGeminiSuggestions:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

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

    if (trimmedQuery.length >= 3 && trimmedQuery.length !== lastQueryLength.current) {
      setIsProcessing(true);
      lastQueryLength.current = trimmedQuery.length;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        try {
          // await controls.start({
          //   borderColor: ['#4F46E5', '#A855F7', '#4F46E5'],
          //   transition: { duration: 1.5, repeat: Infinity }
          // });

          const geminiSuggestions = await fetchGeminiSuggestions(trimmedQuery);

          const newSuggestions = geminiSuggestions.map((text: string) => ({
            id: generateId(),
            text,
            frequency: 0.9,
            lastSelected: Date.now(),
            isNew: true
          }));

          setSuggestions(prev => {
            const updatedPrev = prev.map(s => ({ ...s, isNew: false }));
            return [...updatedPrev, ...newSuggestions];
          });

        } catch (error) {
          console.error('Error in fetchSuggestions:', error);
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred processing suggestions.";
          
          if (errorMessage.includes('Gemini API Key is missing')) {
            toast({
              title: 'API Configuration Error',
              description: errorMessage + " Topic suggestions will use defaults.",
              variant: 'destructive',
              duration: 7000, // Keep this toast longer
            } as any);
          } else {
            toast({
              title: 'Failed to load suggestions',
              description: 'Using default suggestions instead. Details: ' + errorMessage,
              variant: 'destructive',
            } as any);
          }

          const fallbackSuggestions: Suggestion[] = [
            {
              id: generateId(),
              text: `${trimmedQuery} best practices`,
              frequency: 0.9,
              lastSelected: Date.now(),
              fromHistory: true // Note: This was the line indicated in the original error source
            },
            {
              id: generateId(),
              text: `How to master ${trimmedQuery}`,
              frequency: 0.85,
              lastSelected: Date.now(),
              fromHistory: true
            },
          ];

          setSuggestions(fallbackSuggestions);
        } finally {
          setIsProcessing(false);
          // controls.stop();
        }
      }, 300);
    }
  }, [fetchGeminiSuggestions, controls, toast]);

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

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion.text);
    } else {
      onChange(suggestion.text);
    }
    setSuggestions([]);
    inputRef.current?.focus();
  }, [onSuggestionSelect, onChange]);

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
    const val = e.target.value;
    onChange(val);
    const trimmedValue = val.trim();

    if (!trimmedValue) {
      setSuggestions([]);
      return;
    }

    if (trimmedValue.length > 3) {
      // controls.start({
      //   borderColor: ['#4F46E5', '#A855F7', '#4F46E5'],
      //   transition: { duration: 1.5, repeat: Infinity }
      // });
      setIsProcessing(true);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (trimmedValue.length > 3) {
        fetchSuggestions(trimmedValue);
      } else if (trimmedValue.length > 0) {
        showTrendingTopics();
      }
    }, 300);
  }, [onChange, fetchSuggestions, controls, showTrendingTopics]);

  const showTrendingTopics = useCallback(() => {
    const trendingTopics: Suggestion[] = [
      {
        id: 'trend-1',
        text: 'Latest in AI Development',
        frequency: 0.92,
        lastSelected: Date.now(),
        fromHistory: true
      },
      {
        id: 'trend-2',
        text: 'Web3 and Blockchain Updates',
        frequency: 0.88,
        lastSelected: Date.now(),
        fromHistory: true
      },
      {
        id: 'trend-3',
        text: 'Cloud Native Technologies',
        frequency: 0.85,
        lastSelected: Date.now(),
        fromHistory: true
      }
    ];
    setSuggestions(trendingTopics);
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  return (
    <div className="relative w-full group">
      <MotionDiv
        className={cn(
          'relative rounded-lg transition-all duration-300 overflow-hidden',
          'border border-border group-hover:border-primary/30',
          (isLoading || isProcessing) ? 'border-transparent' : '',
          className
        )}
        ref={containerRef}
        // animate={borderGlowAnimation}
        // initial={{ background: 'transparent' }}
      >
        <MotionDiv
          className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"
          // animate={isProcessing ? {
          //   opacity: [0.3, 0.6, 0.3],
          //   transition: { duration: 2, repeat: Infinity }
          // } : { opacity: 0 }}
        />

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
              "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
              (isLoading || isProcessing) && "pr-10"
            )}
          />

          {(isLoading || isProcessing) && (
            <MotionDiv
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              // initial={{ opacity: 0, scale: 0.8 }}
              // animate={{ opacity: 1, scale: 1 }}
              // exit={{ opacity: 0, scale: 0.8 }}
            >
              <Icons.Spinner className="h-4 w-4 animate-spin text-primary" />
            </MotionDiv>
          )}
        </div>

        <AnimatePresence>
          {isLoading && (
            <MotionDiv
              className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              // initial={{ scaleX: 0, opacity: 0 }}
              // animate={{ scaleX: 1, opacity: 1 }}
              // exit={{ scaleX: 0, opacity: 0 }}
              // transition={{ duration: 0.3 }}
            />
          )}

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
