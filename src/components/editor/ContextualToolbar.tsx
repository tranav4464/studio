'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Code2 as CodeIcon,
} from 'lucide-react';

interface ContextualToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onFormat: (format: string) => void;
}

export function ContextualToolbar({
  isVisible,
  position,
  onFormat,
}: ContextualToolbarProps) {
  const toolbarVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 bg-background border rounded-lg shadow-lg p-1"
          style={{
            left: position.x,
            top: position.y - 50,
          }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={toolbarVariants}
        >
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('bold')}
              className="h-8 w-8"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('italic')}
              className="h-8 w-8"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('underline')}
              className="h-8 w-8"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('link')}
              className="h-8 w-8"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('image')}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('bulletList')}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('orderedList')}
              className="h-8 w-8"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('blockquote')}
              className="h-8 w-8"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormat('code')}
              className="h-8 w-8"
            >
              <CodeIcon className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 