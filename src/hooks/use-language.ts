import { useCallback, useEffect, useState } from "react";

export type Language = "bg" | "en";
const KEY = "formae-language";

/** Site language shared across pages; remembered in the browser. */
export function useLanguage() {
  const [language, setState] = useState<Language>("bg");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "bg" || saved === "en") setState(saved);
  }, []);
  const setLanguage = useCallback((lang: Language) => {
    setState(lang);
    try { window.localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
  }, []);
  return [language, setLanguage] as const;
}
