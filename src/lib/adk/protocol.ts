/**
 * A2UI (Agent-to-User Interface) Protocol v3.5.0 - Glassmorphic Edition
 * Type-safe contract for Atlas agent swarm ↔ React glassmorphic renderer
 */

import { A2UIMessage, A2UIElement, A2UIComponentType, AGUIEvent, AGUIAction } from "@types";

/**
 * Protocol constants matching your glassmorphic system
 */
export const A2UI_PROTOCOL_VERSION = "1.1" as const;
export const GLASSMORPHIC_DEFAULTS = {
  className: "glass-2 backdrop-blur-3xl",
  variant: "glass" as const,
} as const;

/**
 * Production-grade validation + sanitization
 */
export function validateA2UIMessage(data: unknown): A2UIMessage | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const msg = data as Partial<A2UIMessage>;

  // Protocol version (glassmorphic edition)
  if (msg.version !== "1.1") {
    console.warn(`[A2UI] Version mismatch: expected "1.1", got "${msg.version}"`);
    return null;
  }

  // Elements array validation
  if (!Array.isArray(msg.elements) || msg.elements.length === 0) {
    return null;
  }

  const validElements: A2UIElement[] = msg.elements
    .filter(validateElement)
    .map(sanitizeElement);

  if (validElements.length === 0) {
    return null;
  }

  return {
    version: "1.1",
    timestamp: msg.timestamp || Date.now(),
    elements: validElements,
    sessionId: msg.sessionId
  };
}

function validateElement(el: unknown): el is Partial<A2UIElement> {
  if (!el || typeof el !== "object" || Array.isArray(el)) return false;

  const element = el as Partial<A2UIElement>;
  return (
    typeof element.id === "string" && element.id.length > 0 &&
    typeof element.type === "string"
  );
}

function sanitizeElement(el: Partial<A2UIElement>): A2UIElement {
  const props = el.props as Record<string, unknown> | undefined;
  return {
    id: el.id || `a2ui-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: el.type as A2UIComponentType,
    props: {
      ...props,
      className: (props?.className as string) || GLASSMORPHIC_DEFAULTS.className,
      variant: (props?.variant as string) || GLASSMORPHIC_DEFAULTS.variant,
    },
    children: (el as { children?: unknown[] }).children?.filter(validateElement).map(sanitizeElement) || [],
  } as A2UIElement;
}

/**
 * Type guards for safe runtime access
 */
export function isValidA2UIElement(el: unknown): el is A2UIElement {
  return validateElement(el);
}

export function isValidA2UIMessage(msg: unknown): msg is A2UIMessage {
  return !!validateA2UIMessage(msg);
}

/**
 * Quick glassmorphic message builder (convenience)
 */
export const createGlassMessage = (elements: A2UIElement[]): A2UIMessage => ({
  version: A2UI_PROTOCOL_VERSION,
  timestamp: Date.now(),
  elements,
});

export { A2UIComponentType };
export type { A2UIMessage, A2UIElement, AGUIEvent, AGUIAction };
