// Edit these paths if you store sound files elsewhere in /public.
export const SUCCESS_SOUND_PATH = "/success.mp3";
export const ERROR_SOUND_PATH = "/error.mp3";

export function playScanSound(variant: "success" | "error") {
  if (typeof window === "undefined") return;

  const src = variant === "success" ? SUCCESS_SOUND_PATH : ERROR_SOUND_PATH;
  const audio = new Audio(src);
  audio.play().catch(() => {
    // Browsers may block autoplay until user interaction; fail silently.
  });
}
