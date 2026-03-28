import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** True at Tailwind `lg` and up — keep in sync with tailwind default breakpoint. */
export function useMinWidthLg() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
