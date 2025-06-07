'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export interface FileDropZoneProps {
  onFileProcessed?: (result: any) => void;
  className?: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

export function FileDropZone({
  onFileProcessed,
  className,
  acceptedTypes = ['application/pdf', 'text/plain', 'text/markdown'],
  maxSizeMB = 10,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const controls = useAnimation();
  const progressInterval = useRef<NodeJS.Timeout>();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
      controls.start({
        scale: 1.2,
        transition: { type: 'spring', stiffness: 400, damping: 20 }
      });
    }
  }, [isDragging, controls]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the drop zone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
    controls.start({ scale: 1 });
  }, [controls]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Process the uploaded file
  const processFile = useCallback(async (file: File) => {
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|md)$/i)) {
      setError('File type not supported');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Simulate processing with progress
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(progressInterval.current);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    try {
      // In a real app, you would upload the file to your API here
      // const result = await uploadFile(file);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate processing completion
      clearInterval(progressInterval.current);
      setProgress(100);
      
      // Simulate extracted data
      const mockResults = [
        { id: '1', type: 'heading', content: 'Document Analysis Complete', confidence: 0.95 },
        { id: '2', type: 'text', content: `Processed: ${file.name}` },
        { id: '3', type: 'stats', content: `Pages: ${Math.ceil(file.size / 5000)}` },
      ];
      
      setResults(mockResults);
      onFileProcessed?.(mockResults);
    } catch (err) {
      setError('Failed to process file');
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval.current);
    }
  }, [acceptedTypes, maxSizeMB, onFileProcessed]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    controls.start({ scale: 1 });

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [controls, processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFile]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Particle animation on drop
  const renderParticles = () => {
    const particles = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      particles.push(
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/50 rounded-full"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: 0,
            scale: [1, 1.5, 0.5]
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
            delay: i * 0.02
          }}
        />
      );
    }
    
    return particles;
  };

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        ref={dropZoneRef}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          'flex flex-col items-center justify-center space-y-4',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isProcessing && 'pointer-events-none',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={controls}
        whileTap={{ scale: 0.98 }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
        />

        {isProcessing ? (
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Icons.Spinner className="h-5 w-5 animate-spin text-primary" />
              <span>Analyzing document...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        ) : (
          <>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <Icons.Upload className="h-8 w-8 text-muted-foreground" />
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {renderParticles()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isDragging ? 'Drop to analyze' : 'Drag & drop files here'}
              </h3>
              <p className="text-sm text-muted-foreground">
                or{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: {acceptedTypes.map(t => t.split('/')[1]).join(', ')} (max {maxSizeMB}MB)
              </p>
            </div>
          </>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {(results.length > 0 || error) && (
          <motion.div 
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  className="p-4 border rounded-lg bg-card shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {result.type}
                    </span>
                    {result.confidence && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{result.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
