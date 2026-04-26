// src/components/A2UIRenderer.tsx
// FIX v3.6.1: Removed locally-duplicated `cn` helper; now imports from `@lib/utils`.
import React from "react";
import { motion } from "framer-motion";
import { A2UIElement, A2UIComponentType, AGUIEvent } from "@lib/adk/protocol";
import { cn } from "@lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface A2UIRendererProps {
  elements: A2UIElement[];
  onEvent: (event: AGUIEvent) => void;
}

interface ElementProps {
  text?: string;
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  actionData?: Record<string, unknown>;
  title?: string;
  value?: string | number;
  placeholder?: string;
  inputType?: string;
  items?: { icon?: string; label?: string; value?: string }[];
  data?: { value: number; label: string }[];
  maxValue?: number;
  checked?: boolean;
  options?: { value: string; label: string }[];
  trend?: "up" | "down" | "stable";
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({
  elements,
  onEvent,
}) => {
  const renderElement = (element: A2UIElement) => {
    const { id, type } = element;
    const props = (element.props || {}) as ElementProps;

    const handleAction = (action: string, data?: Record<string, unknown>) => {
      onEvent({
        elementId: id,
        action,
        data,
        timestamp: Date.now(),
      });
    };

    switch (type) {
      case A2UIComponentType.TEXT:
        return (
          <p
            key={id}
            className={cn(
              "text-sm font-medium text-slate-200 leading-relaxed",
              props.className || "text-slate-300"
            )}
          >
            {props.text || ""}
          </p>
        );

      case A2UIComponentType.BUTTON:
        return (
          <motion.button
            key={id}
            onClick={() => handleAction("click", props.actionData)}
            className={cn(
              "glass-2 px-6 py-3 rounded-2xl font-mono font-black uppercase tracking-wider text-sm transition-all backdrop-blur-3xl shadow-xl hover:shadow-2xl border border-white/20 active:scale-95 flex items-center gap-2",
              props.variant === "primary" || !props.variant
                ? "bg-gradient-to-r from-atlas-blue to-indigo-500 text-white border-atlas-blue/50 hover:from-atlas-blue/90 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                : "text-slate-300 hover:text-white hover:border-white/40 hover:bg-white/10",
              props.className || ""
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {props.label || "Button"}
          </motion.button>
        );

      case A2UIComponentType.CARD:
        return (
          <div
            key={id}
            className={cn(
              "glass-1 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl",
              props.className || ""
            )}
          >
            {props.title && (
              <motion.h3
                className="font-display text-lg font-black text-white uppercase tracking-wider mb-6 border-b border-white/10 pb-4 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {props.title}
              </motion.h3>
            )}
            {element.children && (
              <div className="space-y-6">
                {element.children.map((child) => renderElement(child))}
              </div>
            )}
          </div>
        );

      case A2UIComponentType.PROGRESS:
        return (
          <div key={id} className="w-full space-y-2">
            <div className="flex justify-between text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
              <span>{props.label || ""}</span>
              <span>{(props.value as number) || 0}%</span>
            </div>
            <div className="glass-2 h-2 w-full rounded-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
              <motion.div
                className="h-full bg-gradient-to-r from-atlas-blue to-indigo-500 rounded-2xl shadow-lg shadow-atlas-blue/30"
                initial={{ width: 0 }}
                animate={{ width: `${(props.value as number) || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        );

      case A2UIComponentType.INPUT:
        return (
          <div key={id} className="space-y-2 w-full">
            {props.label && (
              <label className="font-mono text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
                {props.label}
              </label>
            )}
            <input
              type={props.inputType || "text"}
              placeholder={props.placeholder}
              className={cn(
                "w-full glass-2 border border-white/20 rounded-2xl px-5 py-4 text-sm text-white backdrop-blur-3xl focus:outline-none focus:border-atlas-blue/50 focus:ring-2 focus:ring-atlas-blue/30 transition-all shadow-xl hover:shadow-2xl placeholder:text-slate-500",
                props.className || ""
              )}
              defaultValue={(props.value as string) || ""}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleAction("input_blur", { value: e.target.value })
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter")
                  handleAction("input_submit", {
                    value: (e.target as HTMLInputElement).value,
                  });
              }}
            />
          </div>
        );

      case A2UIComponentType.LIST:
        return (
          <ul key={id} className="space-y-2">
            {props.items?.map((item, idx: number) => (
              <motion.li
                key={`${id}_${idx}`}
                className="glass-2 flex items-center gap-3 p-4 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/5 cursor-pointer transition-all backdrop-blur-xl group shadow-lg hover:shadow-xl"
                onClick={() =>
                  handleAction("item_click", item as Record<string, unknown>)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon && (
                  <span className="text-atlas-blue text-lg">{item.icon}</span>
                )}
                <span className="text-sm font-mono font-semibold text-white group-hover:text-white/90 truncate">
                  {item.label || String(item)}
                </span>
              </motion.li>
            ))}
          </ul>
        );

      case A2UIComponentType.CHART:
        return (
          <motion.div
            key={id}
            className={cn(
              "glass-1 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl",
              props.className || ""
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.h4
              className="font-mono text-xs font-black uppercase text-slate-400 tracking-[0.3em] mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {props.title || "Data Analysis"}
            </motion.h4>
            <div className="flex items-end gap-4 h-40">
              {props.data?.map((val, idx: number) => (
                <motion.div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  onClick={() =>
                    handleAction("chart_click", {
                      index: idx,
                      data: val as Record<string, unknown>,
                    })
                  }
                  whileHover={{ y: -8 }}
                >
                  <motion.div
                    className="w-full glass-2 border-t-3 rounded-t-2xl group-hover:bg-atlas-blue/20 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-xl"
                    style={{
                      height: `${(val.value / (props.maxValue || 100)) * 100}%`,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  />
                  <span className="text-xs font-mono font-black text-slate-300 group-hover:text-white">
                    {val.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {val.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case A2UIComponentType.CHECKBOX:
        return (
          <motion.div
            key={id}
            className="glass-2 flex items-center gap-3 p-4 rounded-2xl border border-white/10 cursor-pointer group hover:border-white/30 hover:bg-white/5 transition-all backdrop-blur-xl shadow-lg hover:shadow-xl"
            onClick={() => handleAction("toggle", { checked: !props.checked })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-2xl border-2 flex items-center justify-center transition-all backdrop-blur-xl shadow-lg",
                props.checked
                  ? "bg-gradient-to-r from-atlas-blue to-indigo-500 border-atlas-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "border-white/30 bg-white/5 group-hover:border-white/50"
              )}
            >
              {props.checked && <Check className="w-4 h-4 text-white" />}
            </div>
            <span
              className={cn(
                "text-sm font-mono font-semibold",
                props.checked
                  ? "text-white"
                  : "text-slate-300 group-hover:text-white"
              )}
            >
              {props.label || ""}
            </span>
          </motion.div>
        );

      case A2UIComponentType.SELECT:
        return (
          <div key={id} className="space-y-2 w-full">
            {props.label && (
              <label className="font-mono text-xs font-black uppercase text-slate-400 tracking-wider block mb-3">
                {props.label}
              </label>
            )}
            <div className="relative">
              <select
                className={cn(
                  "w-full glass-2 border border-white/20 rounded-2xl px-5 py-4 text-sm text-white backdrop-blur-3xl focus:outline-none focus:border-atlas-blue/50 focus:ring-2 focus:ring-atlas-blue/30 appearance-none shadow-xl hover:shadow-2xl transition-all",
                  props.className || ""
                )}
                defaultValue={props.value as string}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleAction("select_change", { value: e.target.value })
                }
              >
                {(props.options as { value: string; label: string }[])?.map(
                  (opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        );

      case A2UIComponentType.CONTAINER:
        return (
          <div key={id} className={cn("space-y-6", props.className || "")}>
            {element.children && (
              <div className="space-y-4">
                {element.children.map((child) => renderElement(child))}
              </div>
            )}
          </div>
        );

      case A2UIComponentType.STAT:
        return (
          <motion.div
            key={id}
            className={cn(
              "glass-2 p-6 rounded-3xl border border-white/10 shadow-lg backdrop-blur-xl",
              props.className || ""
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
              {props.label || "Stat"}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-white font-display">
                {props.value || 0}
              </p>
              {props.trend && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    props.trend === "up"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : props.trend === "down"
                        ? "text-rose-400 bg-rose-500/10"
                        : "text-slate-400 bg-slate-500/10"
                  )}
                >
                  {props.trend === "up"
                    ? "↑"
                    : props.trend === "down"
                      ? "↓"
                      : "→"}
                </span>
              )}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            key={id}
            className="glass-2 p-4 rounded-2xl text-xs text-slate-500 italic border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Unknown component: {type}
          </motion.div>
        );
    }
  };

  return <div className="space-y-6">{elements.map(renderElement)}</div>;
};
