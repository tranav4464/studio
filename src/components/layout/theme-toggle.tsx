
"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null until the component is mounted to avoid hydration mismatch
    return <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled><Icons.Sun className="h-4 w-4" /></Button>;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8 rounded-full"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Icons.Moon className="h-4 w-4 transition-all" />
      ) : (
        <Icons.Sun className="h-4 w-4 transition-all" />
      )}
    </Button>
  );
}
