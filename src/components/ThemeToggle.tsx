
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "arlearn-theme";

function getSystemPrefersDark() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem(THEME_KEY) === "dark" ||
      (localStorage.getItem(THEME_KEY) === null && getSystemPrefersDark())
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [dark]);

  return (
    <button
      className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition-colors"
      aria-label="Toggle dark mode"
      onClick={() => setDark((d) => !d)}
      type="button"
    >
      <Switch checked={dark} tabIndex={-1} onCheckedChange={setDark} />
      <span className="sr-only">Toggle dark mode</span>
      {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
