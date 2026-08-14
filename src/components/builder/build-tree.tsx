"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, ChevronRight } from "lucide-react";
import type { BuildTreeNode } from "@/lib/engine/types";

export function BuildTree({ node }: { node: BuildTreeNode | null }) {
  if (!node) {
    return (
      <div className="p-4 text-xs text-muted-foreground">
        Build tree appears after generation.
      </div>
    );
  }
  return (
    <ScrollArea className="h-[260px]">
      <div className="p-2 text-xs">
        <TreeNode node={node} depth={0} />
      </div>
    </ScrollArea>
  );
}

function TreeNode({ node, depth }: { node: BuildTreeNode; depth: number }) {
  const [open, setOpen] = React.useState(depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;
  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded px-1 py-0.5 hover:bg-muted/50 ${
          hasChildren ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft: depth * 12 }}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="truncate font-medium">{node.label}</span>
        {node.locked && (
          <Lock className="h-3 w-3 shrink-0 text-primary" />
        )}
        {typeof node.score === "number" && (
          <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
            {node.score.toFixed(2)}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div>
          {node.children!.map((c, i) => (
            <TreeNode key={c.id + i} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
