"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";

const modes = [
  { label: "system", element: <Monitor className="h-4 w-4" /> },
  { label: "light", element: <Sun className="h-4 w-4" /> },
  { label: "dark", element: <Moon className="h-4 w-4" /> },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  if (!rendered) return null;
  return (
    <ToggleGroup
      type="single"
      defaultValue={theme}
      onValueChange={(selected) => setTheme(selected)}
    >
      {modes.map((mode) => (
        <ToggleGroupItem
          key={mode.label}
          value={mode.label}
          aria-label={mode.label}
        >
          {mode.element}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
