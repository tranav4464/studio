import React from "react";

interface Comment {
  id: string;
  text: string;
  selection: string;
  author: string;
}

interface CommentSidebarProps {
  comments: Comment[];
  onDelete: (id: string) => void;
}

export default function CommentSidebar({ comments, onDelete }: CommentSidebarProps) {
  return (
    <aside className="w-72 border-l bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="font-semibold mb-2">Comments</div>
      {comments.length === 0 && <div className="text-muted-foreground">No comments yet.</div>}
      {comments.map(comment => (
        <div key={comment.id} className="mb-4 p-2 border rounded bg-white dark:bg-zinc-900">
          <div className="text-xs text-muted-foreground mb-1">{comment.author}</div>
          <div className="mb-1 italic">“{comment.selection}”</div>
          <div>{comment.text}</div>
          <button className="text-xs text-red-600 mt-1" onClick={() => onDelete(comment.id)}>Delete</button>
        </div>
      ))}
    </aside>
  );
} 