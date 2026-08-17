"use client";

import * as React from "react";

const HISTORY_LIMIT = 30;

export function useUndo(initialValue = "", limit = HISTORY_LIMIT) {
  const [value, setValueState] = React.useState(initialValue);
  const [past, setPast] = React.useState<string[]>([]);
  const [future, setFuture] = React.useState<string[]>([]);

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (nextValue === value) {
        return;
      }
      setPast((prev) => {
        if (prev[prev.length - 1] === value) {
          return prev;
        }
        const nextPast = [...prev, value].slice(-limit);
        return nextPast;
      });
      setValueState(nextValue);
      setFuture([]);
    },
    [limit, value],
  );

  const resetValue = React.useCallback((nextValue: string) => {
    setValueState(nextValue);
    setPast([]);
    setFuture([]);
  }, []);

  const undo = React.useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((currentFuture) => [value, ...currentFuture].slice(0, limit));
      setValueState(previous);
      return prev.slice(0, -1);
    });
  }, [limit, value]);

  const redo = React.useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setPast((currentPast) => [...currentPast, value].slice(-limit));
      setValueState(next);
      return rest;
    });
  }, [limit, value]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        redo();
      }
    },
    [redo, undo],
  );

  return {
    value,
    setValue,
    resetValue,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    onKeyDown,
  };
}
