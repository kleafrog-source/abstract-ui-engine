export const HOTKEY_ACTIONS = [
  { id: "generate", label: "Generate Page" },
  { id: "export", label: "Export Standalone" },
  { id: "toggleMode", label: "Toggle Architect/Genesis" },
  { id: "clearLocks", label: "Clear Locks" },
] as const;

export type HotkeyActionId = (typeof HOTKEY_ACTIONS)[number]["id"];

export type HotkeyConfig = Record<HotkeyActionId, string>;

const blockA = Array.from({ length: 20 }, (_, index) =>
  `CAS+${String.fromCharCode(65 + index)}`,
);
const blockB = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((digit) => `CAS+${digit}`);
const blockC = Array.from({ length: 16 }, (_, index) =>
  `CA+${String.fromCharCode(74 + index)}`,
);
const blockD = Array.from({ length: 10 }, (_, index) => `CS+F${index + 1}`);

export const HOTKEY_PRESETS = [...blockA, ...blockB, ...blockC, ...blockD];

export const HOTKEY_STORAGE_KEY = "abstract-ui-engine.hotkeys";

export const DEFAULT_HOTKEYS: HotkeyConfig = {
  generate: "CAS+A",
  export: "CAS+S",
  toggleMode: "CA+J",
  clearLocks: "CS+F1",
};

export function loadHotkeyConfig(): HotkeyConfig {
  if (typeof window === "undefined") {
    return DEFAULT_HOTKEYS;
  }

  try {
    const raw = window.localStorage.getItem(HOTKEY_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_HOTKEYS;
    }
    const parsed = JSON.parse(raw) as Partial<HotkeyConfig>;
    return {
      ...DEFAULT_HOTKEYS,
      ...Object.fromEntries(
        Object.entries(parsed).filter(
          ([key, value]) =>
            HOTKEY_ACTIONS.some((action) => action.id === key) &&
            typeof value === "string" &&
            HOTKEY_PRESETS.includes(value),
        ),
      ),
    } as HotkeyConfig;
  } catch {
    return DEFAULT_HOTKEYS;
  }
}

export function saveHotkeyConfig(config: HotkeyConfig): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HOTKEY_STORAGE_KEY, JSON.stringify(config));
}

export function normalizeKeyboardEvent(event: KeyboardEvent): string | null {
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key.toUpperCase();
  const hasCtrl = event.ctrlKey;
  const hasAlt = event.altKey;
  const hasShift = event.shiftKey;

  if (hasCtrl && hasAlt && hasShift && /^[A-Z0-9]$/.test(key)) {
    return `CAS+${key}`;
  }
  if (hasCtrl && hasAlt && !hasShift && /^[A-Z]$/.test(key)) {
    return `CA+${key}`;
  }
  if (hasCtrl && !hasAlt && hasShift && /^F([1-9]|10)$/.test(key)) {
    return `CS+${key}`;
  }
  return null;
}
