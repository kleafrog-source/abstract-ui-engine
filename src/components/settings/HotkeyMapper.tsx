"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";
import {
  DEFAULT_HOTKEYS,
  HOTKEY_ACTIONS,
  HOTKEY_PRESETS,
  loadHotkeyConfig,
  saveHotkeyConfig,
  type HotkeyConfig,
} from "@/lib/hotkeys";

export function HotkeyMapper() {
  const [config, setConfig] = React.useState<HotkeyConfig>(DEFAULT_HOTKEYS);

  React.useEffect(() => {
    setConfig(loadHotkeyConfig());
  }, []);

  const updateHotkey = (actionId: keyof HotkeyConfig, value: string) => {
    const next = { ...config, [actionId]: value };
    setConfig(next);
    saveHotkeyConfig(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Keyboard className="h-4 w-4 text-primary" />
          Ulanzi Hotkey Presets
        </CardTitle>
        <CardDescription>
          Assign safe preset combinations to core actions. The mapping is stored in localStorage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {HOTKEY_ACTIONS.map((action) => (
          <div key={action.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_220px] md:items-center">
            <div className="space-y-1">
              <div className="text-sm font-medium">{action.label}</div>
              <div className="text-xs text-muted-foreground">
                Current preset <Badge variant="outline" className="ml-1 font-mono">{config[action.id]}</Badge>
              </div>
            </div>
            <Select value={config[action.id]} onValueChange={(value) => updateHotkey(action.id, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                {HOTKEY_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          Preset blocks: `CAS+A..T`, `CAS+1..0`, `CA+J..Y`, `CS+F1..F10`.
        </div>
      </CardContent>
    </Card>
  );
}
