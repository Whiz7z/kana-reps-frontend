import { useSyncExternalStore } from "react";

const QUERY = "(hover: none) and (pointer: coarse)";

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

/** True when the primary input is a finger (phones, tablets) rather than a mouse. */
export function useIsTouchPrimary() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
