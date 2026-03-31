// src/components/DependencyGraph.tsx
import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  type Node,
  type Edge,
  Handle,
  Position,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  MiniMap,
  Controls,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { SubTask, TaskStatus, Priority } from "@types";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import "@xyflow/react/dist/style.css";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Custom node typings */
interface TaskNodeData {
  task: SubTask;
  isActive: boolean;
  isBlocked: boolean;
  onNodeClick: (id: string) => void;
  isWhatIfEnabled: boolean;
  isInCascade: boolean;
  [key: string]: unknown;
}

type TaskNodeType = Node<TaskNodeData, "taskNode">;

const TaskNode = ({ data }: NodeProps<TaskNodeType>) => {
  const {
    task,
    isActive,
    isBlocked,
    onNodeClick,
    isWhatIfEnabled,
    isInCascade,
  } = data;

  const getStatusStyles = () => {
    if (isWhatIfEnabled) {
      if (isInCascade) {
        return "glass-1 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50 backdrop-blur-3xl";
      }
      return "glass-1 border-slate-800/50 bg-slate-900/40 opacity-30 grayscale cursor-not-allowed backdrop-blur-3xl";
    }

    if (isBlocked && task.status === TaskStatus.PENDING) {
      return "glass-1 border-slate-800/50 bg-slate-950/60 opacity-50 grayscale cursor-not-allowed backdrop-blur-3xl";
    }

    switch (task.status) {
      case TaskStatus.COMPLETED:
        return "glass-1 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] backdrop-blur-3xl";
      case TaskStatus.FAILED:
        return "glass-1 border-rose-500/30 backdrop-blur-3xl";
      case TaskStatus.IN_PROGRESS:
        return "glass-1 border-atlas-blue/60 shadow-[0_0_25px_rgba(59,130,246,0.2)] backdrop-blur-3xl";
      default:
        return "glass-1 border-slate-800/50 hover:border-slate-600/50 backdrop-blur-3xl";
    }
  };

  const getPriorityAccent = () => {
    switch (task.priority) {
      case Priority.HIGH:
        return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]";
      case Priority.MEDIUM:
        return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]";
      default:
        return "bg-atlas-blue shadow-[0_0_10px_rgba(59,130,246,0.6)]";
    }
  };

  return (
    <motion.div
      onClick={() => {
        if (!isWhatIfEnabled) {
          onNodeClick(task.id);
        }
      }}
      className={cn(
        "flex rounded-2xl border text-[10px] w-52 overflow-hidden transition-all duration-500 select-none relative group",
        getStatusStyles(),
        isActive
          ? "ring-2 ring-atlas-blue/70 ring-offset-4 ring-offset-slate-950/50 scale-110 z-50 shadow-[0_0_50px_rgba(59,130,246,0.4)]"
          : "hover:border-white/20 hover:shadow-xl",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("w-1.5 shrink-0", getPriorityAccent())} />
      <div className="flex-1 px-4 py-4 relative">
        <Handle type="target" position={Position.Top} className="!opacity-0" />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center opacity-60 font-mono text-[7px] tracking-[0.2em] uppercase">
            <span className="glass-2 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">
              #{task.id}
            </span>
            <span className="truncate max-w-[80px] capitalize">
              {task.category || "STRATEGIC"}
            </span>
          </div>
          <p
            className={cn(
              "font-display font-bold leading-snug line-clamp-2 min-h-[2.8em] tracking-tight",
              task.status === TaskStatus.COMPLETED
                ? "text-slate-400"
                : "text-white",
            )}
          >
            {task.description}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  task.status === TaskStatus.IN_PROGRESS
                    ? "animate-pulse bg-atlas-blue"
                    : task.status === TaskStatus.COMPLETED
                      ? "bg-emerald-400"
                      : "bg-slate-600",
                )}
              />
              <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 font-mono">
                {String(task.status).replace("-", " ")}
              </span>
            </div>
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!opacity-0"
        />
      </div>
    </motion.div>
  );
};

const nodeTypes: NodeTypes = { taskNode: TaskNode };

interface DependencyGraphProps {
  tasks: SubTask[];
  activeTaskId: string | null;
  onTaskSelect: (id: string) => void;
  isTaskBlocked: (task: SubTask, allTasks: SubTask[]) => boolean;
  onConnect?: (source: string, target: string) => void;
  isWhatIfEnabled?: boolean;
  simulationResult?: { cascade: string[]; riskScore: number } | null;
  onSimulateFailure?: (id: string) => void;
}

const DependencyGraph = ({
  tasks,
  activeTaskId,
  onTaskSelect,
  isTaskBlocked,
  isWhatIfEnabled = false,
  simulationResult = null,
  onSimulateFailure,
}: DependencyGraphProps) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const depths: Record<string, number> = {};

    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      if (depths[id] !== undefined) return depths[id];

      const task = tasks.find((t) => t.id === id);
      if (!task || !task.dependencies?.length) {
        depths[id] = 0;
        return 0;
      }

      visited.add(id);
      const depDepths = task.dependencies.map((depId) =>
        getDepth(depId, new Set(visited)),
      );
      const depth = Math.max(...depDepths, 0) + 1;
      depths[id] = depth;
      return depth;
    };

    tasks.forEach((t) => getDepth(t.id));

    const depthGroups: Record<number, string[]> = {};
    Object.entries(depths).forEach(([id, depth]) => {
      (depthGroups[depth] ??= []).push(id);
    });

    const nodes: Node<TaskNodeData, "taskNode">[] = tasks.map((task) => {
      const depth = depths[task.id] ?? 0;
      const group = depthGroups[depth] ?? [];
      const i = group.indexOf(task.id);
      const offset = (i - (group.length - 1) / 2) * 260;

      return {
        id: task.id,
        type: "taskNode",
        position: { x: offset, y: depth * 180 },
        data: {
          task,
          isActive: activeTaskId === task.id,
          isBlocked: isTaskBlocked(task, tasks),
          onNodeClick:
            isWhatIfEnabled && onSimulateFailure
              ? onSimulateFailure
              : onTaskSelect,
          isWhatIfEnabled,
          isInCascade: (simulationResult?.cascade ?? []).includes(task.id),
        },
      };
    });

    const edges: Edge[] = [];
    tasks.forEach((task) => {
      (task.dependencies ?? []).forEach((depId) => {
        const dep = tasks.find((t) => t.id === depId);
        const complete = dep?.status === TaskStatus.COMPLETED;

        edges.push({
          id: `e-${depId}-${task.id}`,
          source: depId,
          target: task.id,
          animated: complete,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: complete ? "#10b981" : "#64748b",
          },
          style: {
            stroke: complete ? "#10b981" : "#475569",
            strokeWidth: 2.5,
            opacity: complete ? 1 : 0.4,
          },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [
    tasks,
    activeTaskId,
    onTaskSelect,
    isTaskBlocked,
    isWhatIfEnabled,
    simulationResult,
    onSimulateFailure,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes as Node[]);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full min-h-[500px] w-full glass-1 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl relative shadow-2xl group"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.05}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={40}
          size={1}
          color="rgba(148, 163, 184, 0.1)"
        />
        <MiniMap<TaskNodeType>
          nodeColor={(n: TaskNodeType) => {
            const t = n.data?.task;
            if (t?.status === TaskStatus.COMPLETED) return "#10b981";
            if (t?.status === TaskStatus.IN_PROGRESS) return "#3b82f6";
            return "#475569";
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          className="!bg-slate-950/80 !border-slate-800/50 !rounded-2xl !overflow-hidden !shadow-2xl backdrop-blur-xl"
          style={{ height: 120, width: 180 }}
        />
        <Controls
          className="!bg-slate-950/80 !border-slate-800/50 !backdrop-blur-xl !rounded-2xl !shadow-2xl !m-4 hover:shadow-3xl transition-all"
        />
      </ReactFlow>
    </motion.div>
  );
};

export default DependencyGraph;
