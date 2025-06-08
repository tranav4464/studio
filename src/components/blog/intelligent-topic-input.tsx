
'use client';

// import { motion, AnimatePresence, useAnimation } from 'framer-motion'; // This line is commented out
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; // Corrected import path

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

// Mock framer-motion components if the import is commented out
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
      className={cn(
        'relative flex items-center px-4 py-3 text-sm cursor-pointer',
        'hover:bg-accent/50 transition-all duration-200',
        isSelected ? 'bg-accent/30' : 'bg-popover',
        isNew && 'border-l-2 border-primary/70',
        'group/suggestion'
      )}
      style={{
        // transform: isSelected ? 'scale(1.01)' : 'scale(1)', // Temporarily remove transform to simplify
        backgroundColor: isSelected ? 'hsl(var(--accent)/0.3)' : 'hsl(var(--popover))',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(suggestion);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(5);
        }
      }}
      onMouseEnter={() => onHover(index)}
    >
      {showPulse && isNew && (
        <MotionDiv
          className="absolute inset-0 bg-primary/5 rounded-md"
          // Removed framer-motion specific props
        />
      )}
      {isNew && (
        <MotionSpan
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/50"
          // Removed framer-motion specific props
        />
      )}
      <span className="truncate">{suggestion.text}</span>

      {isNew && (
        <MotionSpan
          className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
          // Removed framer-motion specific props
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
    // Removed framer-motion specific props
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
  const { toast } = useToast() as { toast: any }; // Type assertion for toast
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showPulseState, setShowPulseState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]); // Not currently used

  // Mocks for when framer-motion is commented out
  const controls = { start: () => {}, stop: () => {} };
  const pulseAnimation = { start: () => {}, stop: () => {} };
  const borderGlowAnimation = { start: () => {}, stop: () => {} };

  const lastQueryLength = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);


  const triggerHapticFeedback = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

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


  useEffect(() => {
    if (suggestions.length > 0 && suggestions.some(s => s.isNew)) {
      try {
        if (typeof window !== 'undefined' && navigator.vibrate) {
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
      // borderGlowAnimation.start({ ... });
    } else {
      // borderGlowAnimation.start({ background: 'transparent', ... });
    }
  }, [isLoading, isProcessing, borderGlowAnimation]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  // const getHistory = (): Record<string, HistoryEntry> => { // Not currently used
  //   if (typeof window === 'undefined') return {};
  //   try {
  //     const history = localStorage.getItem('topicHistory');
  //     return history ? JSON.parse(history) : {};
  //   } catch (error) {
  //     console.error('Error reading history from localStorage', error);
  //     return {};
  //   }
  // };

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
        const errorBody = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error('API Error response body:', errorBody);
        
        let apiErrorDetails = errorBody.error || `Failed to fetch suggestions: ${response.status} ${response.statusText}`;
        if (errorBody.details && (errorBody.details.includes('NEXT_PUBLIC_GEMINI_API is not configured') || errorBody.details.includes('GEMINI_API_KEY is not configured'))) {
          apiErrorDetails = 'Gemini API Key is missing. Please set GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API in your environment variables.';
        }
        throw new Error(apiErrorDetails);
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!data.suggestions) {
        console.warn('No suggestions in response:', data);
        return [];
      }

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
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
  }, []); // Removed toast from dependencies as it's stable

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
          // await controls.start({ ... });

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
              duration: 7000,
            });
          } else {
            toast({
              title: 'Failed to load suggestions',
              description: 'Using default suggestions instead. Details: ' + errorMessage,
              variant: 'destructive',
            });
          }
         

          const fallbackSuggestions: Suggestion[] = [
            {
              id: generateId(),
              text: `${trimmedQuery} best practices`,
              frequency: 0.9,
              lastSelected: Date.now(),
              fromHistory: true
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
      }, debounceDelay); // Use debounceDelay prop
    }
  }, [fetchGeminiSuggestions, controls, toast, debounceDelay]); // Added debounceDelay

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length >= 3) {
        // fetchSuggestions(value); // This is now handled by handleInputChange
      } else if (value.trim().length === 0) {
        setSuggestions([]);
      }
    }, debounceDelay); // Use debounceDelay prop

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions, debounceDelay]); // Added debounceDelay

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
    // Show trending topics if input is empty on focus
    if (!value.trim()) {
        showTrendingTopics();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click
    setTimeout(() => {
        if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
            setIsFocused(false);
        }
    }, 100);
  };

  const handleHover = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    const trimmedValue = val.trim();

    if (!trimmedValue) {
      setSuggestions([]); // Clear suggestions if input is empty
      return;
    }

    // if (trimmedValue.length >= 3) { // Condition for fetching
    //   controls.start({ /* animation properties */ });
    //   setIsProcessing(true);
    // }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (trimmedValue.length >= 3) {
        fetchSuggestions(trimmedValue);
      } else if (trimmedValue.length > 0) { // Show trending if some input but less than 3 chars
        // showTrendingTopics(); // Decide if this is desired behavior
      }
    }, debounceDelay);
  }, [onChange, fetchSuggestions, /* controls, */ showTrendingTopics, debounceDelay]);


  if (!hasMounted) {
    // Render a simpler version for SSR or return a placeholder to prevent hydration mismatch
    // This ensures the server and initial client render are identical for this component.
    return (
      <div className={cn('relative w-full group', className)}>
        <Input
          value={value}
          // onChange not strictly needed for SSR, but fine to keep
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className={cn(
            "w-full transition-all duration-200 bg-background/80 backdrop-blur-sm",
            "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
            // Avoid conditional classes based on state (isLoading, isProcessing) here
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <MotionDiv
        className={cn(
          'relative rounded-lg transition-all duration-300 overflow-hidden',
          'border border-border group-hover:border-primary/30',
           hasMounted && (isLoading || isProcessing) ? 'border-transparent' : '', // Conditional class now safe
          className
        )}
        ref={containerRef}
        // animate={borderGlowAnimation} // framer-motion prop removed
        // initial={{ background: 'transparent' }} // framer-motion prop removed
      >
        <MotionDiv
          // animate={pulseAnimation} // framer-motion prop removed
          className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"
          // initial={{ opacity: 0 }} // framer-motion prop removed
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
              hasMounted && (isLoading || isProcessing) && "pr-10" // Conditional class now safe
            )}
          />

          {hasMounted && (isLoading || isProcessing) && (
            <MotionDiv
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              // Removed framer-motion props
            >
              <Icons.Spinner className="h-4 w-4 animate-spin text-primary" />
            </MotionDiv>
          )}
        </div>

        <AnimatePresence>
          {hasMounted && isLoading && ( // Only render if mounted and loading
            <MotionDiv
              className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              // Removed framer-motion props
            />
          )}

          {hasMounted && suggestions.length > 0 && isFocused && ( // Only render if mounted and conditions met
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
