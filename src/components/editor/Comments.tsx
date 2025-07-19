"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Send, MessageSquare, X, User, Check, CheckCircle } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  resolved?: boolean;
  selection?: {
    from: number;
    to: number;
    text: string;
  };
};

type CommentsProps = {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
};

export function Comments({
  comments,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  currentUser,
}: CommentsProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(content);
      setContent("");
      
      // Focus the textarea after submission
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [content, onAddComment, toast]);
  
  const handleResolve = useCallback(async (commentId: string) => {
    try {
      await onResolveComment(commentId);
      toast({
        title: "Comment resolved",
        description: "The comment has been marked as resolved.",
      });
    } catch (error) {
      console.error("Failed to resolve comment:", error);
      toast({
        title: "Failed to resolve comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [onResolveComment, toast]);
  
  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await onDeleteComment(commentId);
      toast({
        title: "Comment deleted",
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [onDeleteComment, toast]);
  
  const unresolvedComments = comments.filter(comment => !comment.resolved);
  const resolvedComments = comments.filter(comment => comment.resolved);

  return (
    <div className="h-full flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
          {unresolvedComments.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
              {unresolvedComments.length}
            </span>
          )}
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {unresolvedComments.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium text-muted-foreground">Active Comments</h4>
            <div className="space-y-4">
              {unresolvedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUser.id}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
        
        {resolvedComments.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Resolved Comments ({resolvedComments.length})
            </h4>
            <div className="space-y-4">
              {resolvedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUser.id}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
        
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm mt-1">Add a comment using the input below</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type CommentItemProps = {
  comment: Comment;
  currentUserId: string;
  onResolve: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

function CommentItem({ comment, currentUserId, onResolve, onDelete }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  const isAuthor = comment.author.id === currentUserId;
  
  const handleResolve = async () => {
    try {
      setIsResolving(true);
      await onResolve(comment.id);
    } finally {
      setIsResolving(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-lg border ${
        comment.resolved 
          ? "bg-gray-50 dark:bg-gray-800/50 border-dashed" 
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>
              {comment.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {!comment.resolved && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleResolve}
              disabled={isResolving}
              title="Resolve comment"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          
          {(isAuthor || comment.resolved) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete comment"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      
      {comment.selection && !comment.resolved && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-sm p-2 rounded mb-2 border border-blue-100 dark:border-blue-800/50">
          <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Selected text:</div>
          <div className="text-ellipsis overflow-hidden whitespace-nowrap">
            {comment.selection.text.length > 100 
              ? `${comment.selection.text.substring(0, 97)}...` 
              : comment.selection.text}
          </div>
        </div>
      )}
      
      <div className={`text-sm ${comment.resolved ? "text-muted-foreground" : ""}`}>
        {comment.content}
      </div>
      
      {comment.resolved && (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleResolve}
              disabled={isResolving}
            >
              {isResolving ? "Reopening..." : "Reopen"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
