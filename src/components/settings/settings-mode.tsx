"use client";

import { HotkeyMapper } from "./HotkeyMapper";

export function SettingsMode() {
  return (
    <div className="p-3">
      <div className="mx-auto max-w-4xl">
        <HotkeyMapper />
      </div>
    </div>
  );
}
