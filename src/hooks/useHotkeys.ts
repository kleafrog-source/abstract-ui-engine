"use client";

import * as React from "react";
import {
  loadHotkeyConfig,
  normalizeKeyboardEvent,
  type HotkeyActionId,
} from "@/lib/hotkeys";

type HotkeyCallbacks = Partial<Record<HotkeyActionId, () => void>>;

export function useHotkeys(callbacks: HotkeyCallbacks) {
  const callbacksRef = React.useRef(callbacks);

  React.useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const combo = normalizeKeyboardEvent(event);
      if (!combo) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.closest("[contenteditable='true']"));

      if (isEditable) {
        return;
      }

      const config = loadHotkeyConfig();
      const action = Object.entries(config).find(([, value]) => value === combo)?.[0] as
        | HotkeyActionId
        | undefined;

      if (!action) {
        return;
      }

      event.preventDefault();
      callbacksRef.current[action]?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
