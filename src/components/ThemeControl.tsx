"use client";

import { useSyncExternalStore } from "react";
import styles from "./ThemeControl.module.css";

export type ThemePreference = "system" | "light" | "dark";

const storageKey = "passe-theme";
const listeners = new Set<() => void>();
let memoryPreference: ThemePreference = "dark";
let storageUnavailable = false;

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function readDocumentPreference(): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.getAttribute("data-theme");
  return isThemePreference(value) ? value : null;
}

function getPreference(): ThemePreference {
  if (typeof window === "undefined") return "dark";
  if (storageUnavailable) return memoryPreference;

  try {
    const stored = window.localStorage.getItem(storageKey);
    return isThemePreference(stored) ? stored : "dark";
  } catch {
    storageUnavailable = true;
    memoryPreference = readDocumentPreference() ?? memoryPreference;
    return memoryPreference;
  }
}

function applyPreference(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = preference;
}

function notifySubscribers(): void {
  for (const listener of listeners) listener();
}

function setPreference(preference: ThemePreference): void {
  memoryPreference = preference;
  try {
    window.localStorage.setItem(storageKey, preference);
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
  applyPreference(preference);
  notifySubscribers();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== storageKey && event.key !== null) return;
  memoryPreference = isThemePreference(event.newValue) ? event.newValue : "dark";
  storageUnavailable = false;
  applyPreference(memoryPreference);
  notifySubscribers();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getServerPreference(): ThemePreference {
  return "dark";
}

export default function ThemeControl() {
  const preference = useSyncExternalStore(
    subscribe,
    getPreference,
    getServerPreference,
  );

  return (
    <div className={styles.control}>
      <label className={styles.label} htmlFor="theme-preference">
        Colour theme
      </label>
      <select
        className={styles.select}
        id="theme-preference"
        name="theme-preference"
        value={preference}
        onChange={(event) => {
          const value = event.currentTarget.value;
          if (isThemePreference(value)) setPreference(value);
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
