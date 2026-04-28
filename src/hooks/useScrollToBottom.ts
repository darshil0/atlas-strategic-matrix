import { useRef, useEffect, useCallback, RefObject } from "react";

/**
 * Hook to handle automatic scrolling to the bottom of a container.
 */
export function useScrollToBottom<T extends HTMLElement>(
  dependencies: unknown[]
): [RefObject<T | null>, () => void] {
  const ref = useRef<T>(null);

  const scrollToBottom = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [dependencies, scrollToBottom]);

  return [ref, scrollToBottom];
}
