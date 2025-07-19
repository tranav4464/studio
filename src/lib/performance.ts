import React, { useState, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

/**
 * Debounce a function call to limit how often it can be triggered
 * @param func The function to debounce
 * @param wait Time to wait in milliseconds
 * @param options Options for debouncing
 * @returns Debounced function
 */
export function useDebounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): (...args: Parameters<F>) => void {
  return debounce(func, wait, options);
}

/**
 * Throttle a function call to limit how often it can be executed
 * @param func The function to throttle
 * @param wait Time to wait in milliseconds between executions
 * @param options Options for throttling
 * @returns Throttled function
 */
export function useThrottle<F extends (...args: any[]) => any>(
  func: F,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): (...args: Parameters<F>) => void {
  return throttle(func, wait, options);
}

/**
 * Memoize a function to cache its results
 * @param func The function to memoize
 * @param resolver Function to resolve the cache key
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => any
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a virtualized list for large datasets
 * @param items Array of items to virtualize
 * @param itemHeight Height of each item in pixels
 * @param containerRef Reference to the container element
 * @param overscan Number of items to render outside the viewport
 * @returns Object containing visible items and container props
 */
interface VirtualizationResult<T> {
  visibleItems: { index: number; item: T }[];
  containerProps: React.HTMLAttributes<HTMLDivElement>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
}

export function useVirtualization<T>(
  items: T[], 
  itemHeight: number, 
  containerRef: React.RefObject<HTMLElement>,
  overscan = 5
): VirtualizationResult<T> {
  const [scrollTop, setScrollTop] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);
  
  // Calculate the total height of the container
  const totalHeight = items.length * itemHeight;
  
  // Calculate which items are visible
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );
  
  // Get the visible items
  const visibleItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      index: startIndex + index,
      item,
    }));
    
  // Container props for the virtualized list
  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'auto',
    },
    onScroll: (e) => {
      setScrollTop((e.target as HTMLElement).scrollTop);
    },
  };
  
  // Set up resize observer and initial height
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateHeight = () => {
      setHeight(container.clientHeight);
    };
    
    // Initial height
    updateHeight();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);
  
  return {
    visibleItems,
    containerProps,
    totalHeight,
    startIndex,
    endIndex,
  } as const;
}

/**
 * Optimize expensive calculations with requestIdleCallback
 * @param callback Function to execute when the browser is idle
 * @param options Options for the idle callback
 * @returns A function to cancel the idle callback
 */
export function useIdleCallback(
  callback: () => void,
  options?: IdleRequestOptions
) {
  React.useEffect(() => {
    const handle = window.requestIdleCallback(callback, options);
    return () => window.cancelIdleCallback(handle);
  }, [callback, options]);
}

/**
 * Use Intersection Observer to detect when elements are in view
 * @param ref Reference to the element to observe
 * @param options Options for the Intersection Observer
 * @returns Boolean indicating if the element is in view
 */
export function useInView(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isInView, setIsInView] = React.useState(false);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  
  return isInView;
}

/**
 * Measure the performance of a function
 * @param fn Function to measure
 * @param name Name for the measurement
 * @returns The result of the function and performance metrics
 */
export function withPerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string = 'function'
): { result: ReturnType<T>; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
  
  return {
    result,
    duration: end - start,
  };
}
