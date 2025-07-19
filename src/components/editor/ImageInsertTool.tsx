import React from "react";

export default function ImageInsertTool() {
  return (
    <div className="mb-4">
      <div className="font-semibold mb-2">Insert Image</div>
      <input type="file" accept="image/*" className="mb-2" />
      <div className="text-muted-foreground">Drag & drop or select an image to insert.</div>
    </div>
  );
} 