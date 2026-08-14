"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addLexiconEntry, type AddEntryParams } from "@/lib/engine/client";
import { toast } from "sonner";

const CATEGORIES = [
  "layouts",
  "components",
  "styles",
  "typography",
  "interactions",
  "utilities",
] as const;

export function AddEntryDialog({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<AddEntryParams>({
    category: "components",
    name: "",
    semantic_description: "",
    tags: [],
    payload: "",
    css: "",
    family: "custom",
    conflicts: [],
  });
  const [tagsRaw, setTagsRaw] = React.useState("");
  const [conflictsRaw, setConflictsRaw] = React.useState("");

  const submit = async () => {
    if (!form.name || !form.semantic_description || !form.payload) {
      toast.error("Name, semantic description and payload are required.");
      return;
    }
    setLoading(true);
    try {
      const payload: AddEntryParams = {
        ...form,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        conflicts: conflictsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await addLexiconEntry(payload);
      toast.success(`Added "${form.name}" (${res.id}). Lexicon reindexed: ${res.total} entries.`);
      setOpen(false);
      setForm({
        category: "components",
        name: "",
        semantic_description: "",
        tags: [],
        payload: "",
        css: "",
        family: "custom",
        conflicts: [],
      });
      setTagsRaw("");
      setConflictsRaw("");
      onAdded?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add custom lexicon entry</DialogTitle>
          <DialogDescription>
            Persists to <code className="text-xs">data/lexicon/custom.json</code> and
            triggers an immediate reindex. The new entry is instantly searchable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as AddEntryParams["category"] })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-sm">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Family</Label>
              <Input
                value={form.family ?? ""}
                onChange={(e) => setForm({ ...form, family: e.target.value })}
                placeholder="custom"
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Neon Glow Button"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Semantic description (vectorized)</Label>
            <Textarea
              value={form.semantic_description}
              onChange={(e) => setForm({ ...form, semantic_description: e.target.value })}
              placeholder="Rich English description with fine visual nuance — this text gets embedded for semantic search."
              className="min-h-[70px] text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Payload (CSS classes / declarations)</Label>
            <Input
              value={form.payload}
              onChange={(e) => setForm({ ...form, payload: e.target.value })}
              placeholder="e.g. .btn-neon-glow"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CSS (optional)</Label>
            <Textarea
              value={form.css ?? ""}
              onChange={(e) => setForm({ ...form, css: e.target.value })}
              placeholder=".btn-neon-glow { box-shadow: 0 0 12px #0ff; }"
              className="min-h-[60px] font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="button, neon, glow"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Conflicts (comma-separated)</Label>
              <Input
                value={conflictsRaw}
                onChange={(e) => setConflictsRaw(e.target.value)}
                placeholder="surface:neon, elevation:glow"
                className="text-sm"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Adding…" : "Add & Reindex"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
