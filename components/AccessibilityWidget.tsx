"use client";

import { useEffect, useMemo, useState } from "react";

type FontScale = "normal" | "large" | "xlarge";

const STORAGE_KEY = "rokko.accessibility.v1";

function getStoredPreferences() {
  if (typeof window === "undefined") {
    return { darkMode: false, fontScale: "normal" as FontScale, speechMode: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { darkMode: false, fontScale: "normal" as FontScale, speechMode: false };
    const parsed = JSON.parse(raw);
    return {
      darkMode: Boolean(parsed.darkMode),
      fontScale: ["normal", "large", "xlarge"].includes(parsed.fontScale)
        ? (parsed.fontScale as FontScale)
        : ("normal" as FontScale),
      speechMode: Boolean(parsed.speechMode),
    };
  } catch {
    return { darkMode: false, fontScale: "normal" as FontScale, speechMode: false };
  }
}

function pickMexicanSpanishVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "es-mx") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("es-mx")) ||
    voices.find((voice) => voice.name.toLowerCase().includes("mex")) ||
    null
  );
}

function speakWithMexicanSpanish(text: string, voices: SpeechSynthesisVoice[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  const voice = pickMexicanSpanishVoice(
    voices.length ? voices : window.speechSynthesis.getVoices(),
  );
  if (!voice) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang || "es-MX";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>("normal");
  const [speechMode, setSpeechMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceNotice, setVoiceNotice] = useState("");

  useEffect(() => {
    const stored = getStoredPreferences();
    setDarkMode(stored.darkMode);
    setFontScale(stored.fontScale);
    setSpeechMode(stored.speechMode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("rokko-dark", darkMode);
    document.documentElement.dataset.fontScale = fontScale;
    document.body.dataset.fontScale = fontScale;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ darkMode, fontScale, speechMode }),
    );
  }, [darkMode, fontScale, speechMode, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    function loadVoices() {
      setVoices(window.speechSynthesis.getVoices());
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const timeout = window.setTimeout(loadVoices, 700);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.clearTimeout(timeout);
    };
  }, []);

  const activeVoice = useMemo(() => pickMexicanSpanishVoice(voices), [voices]);

  const speakAccessibleText = useMemo(
    () => (text: string) => {
      const spoken = speakWithMexicanSpanish(text, voices);
      if (spoken) {
        setVoiceNotice("");
        return;
      }

      setVoiceNotice(
        "No encontramos una voz Espanol Mexico instalada. Instala el paquete de idioma Espanol (Mexico) en Windows o en el navegador para activar la lectura.",
      );
    },
    [voices],
  );

  useEffect(() => {
    if (!speechMode) {
      window.speechSynthesis?.cancel();
      return;
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("button, input, select, textarea, a")) return;

      const product = target.closest<HTMLElement>("[data-speakable-product]");
      if (!product) return;

      const name = product.dataset.speakName || "Prenda ROKKO";
      const description = product.dataset.speakDescription || "Sin descripcion disponible.";
      const price = product.dataset.speakPrice || "";
      const colors = product.dataset.speakColors || "";
      const sizes = product.dataset.speakSizes || "";
      speakAccessibleText(
        `${name}. ${description}. ${price ? `Precio desde ${price}.` : ""} ${
          colors ? `Colores disponibles: ${colors}.` : ""
        } ${sizes ? `Tallas disponibles: ${sizes}.` : ""}`,
      );
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [speechMode, speakAccessibleText]);

  const fontLabel = useMemo(() => {
    if (fontScale === "large") return "Grande";
    if (fontScale === "xlarge") return "Extra";
    return "Normal";
  }, [fontScale]);

  return (
    <div className="fixed bottom-4 left-4 z-[230] no-print sm:bottom-5 sm:left-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-brand-dark text-white shadow-[0_14px_38px_rgba(0,0,0,0.24)] transition hover:bg-accent-deep focus-visible:outline focus-visible:outline-4 focus-visible:outline-accent/35"
        aria-label={open ? "Cerrar opciones de accesibilidad" : "Abrir opciones de accesibilidad"}
        aria-expanded={open}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a2 2 0 1 0 0 .01M5 8h14M12 8v12M8 20l4-8 4 8" />
        </svg>
      </button>

      {open && (
        <section
          className="absolute bottom-16 left-0 max-h-[calc(100vh-7rem)] w-[min(calc(100vw-2rem),360px)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-white shadow-2xl"
          aria-label="Opciones de accesibilidad"
        >
          <div className="border-b border-border bg-brand-dark px-5 py-4 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent-light">
              ROKKO inclusivo
            </p>
            <h2 className="mt-1 text-lg font-black">Accesibilidad</h2>
          </div>

          <div className="space-y-4 p-5">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-2/70 px-4 py-3">
              <span>
                <span className="block text-sm font-black text-text">Tema oscuro</span>
                <span className="block text-xs font-semibold text-muted">Reduce brillo y mejora contraste.</span>
              </span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(event) => setDarkMode(event.target.checked)}
                className="h-5 w-5 accent-cyan-600"
              />
            </label>

            <div className="rounded-lg border border-border bg-surface-2/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-text">Tamano de fuente</p>
                  <p className="text-xs font-semibold text-muted">Actual: {fontLabel}</p>
                </div>
                <div className="flex rounded-lg border border-border bg-white p-1">
                  {(["normal", "large", "xlarge"] as FontScale[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={`h-9 min-w-10 rounded-md px-3 text-sm font-black transition ${
                        fontScale === scale
                          ? "bg-accent text-white"
                          : "text-muted hover:bg-accent-soft hover:text-accent-deep"
                      }`}
                    >
                      {scale === "normal" ? "A" : scale === "large" ? "A+" : "A++"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3">
              <span>
                <span className="block text-sm font-black text-accent-deep">Lector de prendas</span>
                <span className="block text-xs font-semibold text-muted">
                  Activalo y toca una prenda. Solo usara voz Espanol Mexico.
                </span>
              </span>
              <input
                type="checkbox"
                checked={speechMode}
                onChange={(event) => {
                  setSpeechMode(event.target.checked);
                  if (event.target.checked) {
                    speakAccessibleText(
                      "Lector de prendas activado. Toca una prenda para escuchar su descripcion.",
                    );
                  } else {
                    setVoiceNotice("");
                  }
                }}
                className="h-5 w-5 accent-cyan-600"
              />
            </label>

            <div className="rounded-lg border border-border bg-white px-4 py-3 text-xs font-semibold text-muted">
              Voz activa:{" "}
              <span className="font-black text-text">
                {activeVoice ? `${activeVoice.name} (${activeVoice.lang})` : "Espanol Mexico no instalado"}
              </span>
            </div>

            {voiceNotice && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-800">
                {voiceNotice}
              </div>
            )}

            {speechMode && (
              <button
                type="button"
                onClick={() => window.speechSynthesis?.cancel()}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm font-black text-muted transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent-deep"
              >
                Detener lectura
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
