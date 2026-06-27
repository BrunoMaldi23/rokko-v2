"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "rokko-admin-theme";

export function useAdminTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Leer preferencia guardada o detectar del sistema
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsMounted(true);
  }, []);

  function applyTheme(newTheme: Theme) {
    const adminElement = document.querySelector("[data-admin]");
    if (adminElement) {
      adminElement.setAttribute("data-theme", newTheme);
    }
    localStorage.setItem(STORAGE_KEY, newTheme);
  }

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  }

  return { theme, toggleTheme, isMounted };
}
