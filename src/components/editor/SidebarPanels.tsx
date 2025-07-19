import React from "react";

export default function SidebarPanels() {
  return (
    <aside className="w-[340px] border-l bg-zinc-50 dark:bg-zinc-950 p-4 hidden lg:block">
      <div className="mb-6">
        <div className="font-semibold mb-2">SEO Checklist</div>
        <div className="text-muted-foreground">SEO checklist placeholder</div>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Tone Analyzer</div>
        <div className="text-muted-foreground">Tone analyzer placeholder</div>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Blog Stats</div>
        <div className="text-muted-foreground">Stats panel placeholder</div>
      </div>
      <div>
        <div className="font-semibold mb-2">One-Click Fixes</div>
        <button className="block w-full mb-2 bg-blue-100 text-blue-800 rounded px-2 py-1">Grammar Cleanup</button>
        <button className="block w-full mb-2 bg-blue-100 text-blue-800 rounded px-2 py-1">Shorten Sentences</button>
        <button className="block w-full bg-blue-100 text-blue-800 rounded px-2 py-1">Remove Filler Words</button>
      </div>
    </aside>
  );
} 