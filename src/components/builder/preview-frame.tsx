"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from "lucide-react";

export type Viewport = "mobile" | "tablet" | "desktop";

const WIDTHS: Record<Viewport, string> = {
  mobile: "390px",
  tablet: "820px",
  desktop: "100%",
};

export function PreviewFrame({
  html,
  loading,
  title = "Live Preview",
}: {
  html: string;
  loading?: boolean;
  title?: string;
}) {
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [reloadKey, setReloadKey] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const openInNewTab = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className="flex items-center gap-1">
            <ToggleGroup
              type="single"
              value={viewport}
              onValueChange={(v) => v && setViewport(v as Viewport)}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="mobile" aria-label="Mobile viewport">
                <Smartphone className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" aria-label="Tablet viewport">
                <Tablet className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Desktop viewport">
                <Monitor className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setReloadKey((k) => k + 1)}
              aria-label="Reload preview"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={openInNewTab}
              disabled={!html}
              aria-label="Open preview in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2">
        <div className="flex h-full items-start justify-center overflow-auto rounded-md border bg-muted/20 p-2">
          {loading && !html ? (
            <div className="flex h-40 w-full items-center justify-center text-xs text-muted-foreground">
              <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
              Assembling page…
            </div>
          ) : (
            <iframe
              key={reloadKey}
              ref={iframeRef}
              title={title}
              srcDoc={html}
              className="h-full rounded border bg-white shadow-sm transition-[width] duration-300"
              style={{
                width: WIDTHS[viewport],
                minHeight: "100%",
                height: viewport === "desktop" ? "100%" : "100%",
              }}
              sandbox="allow-scripts"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
