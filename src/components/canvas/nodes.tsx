"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { CanvasNodeData } from "@/lib/store";
import { cn } from "@/lib/utils";

function getConfidenceStyles(confidence: CanvasNodeData["confidence"]) {
    switch (confidence) {
        case "settled":
            return "border-accent ring-1 ring-accent/30 text-foreground";
        case "exploring":
            return "border-dashed border-accent/60 text-foreground/90";
        case "troubled":
            return "border-danger ring-1 ring-danger/40 animate-pulse bg-danger/10 text-foreground";
        default:
            return "border-border text-foreground/90";
    }
}

function getValidationIcon(status: string | null) {
    if (status === "consistent") return <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-[10px] text-green-400 ring-1 ring-green-500/50">✓</div>;
    if (status === "warning") return <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] text-yellow-400 ring-1 ring-yellow-500/50">!</div>;
    if (status === "contradiction") return <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger/20 text-[10px] text-danger ring-1 ring-danger/50">✗</div>;
    return null;
}

function formatQualifier(qualifier: string): string {
    return qualifier.replace(/_/g, " ");
}

export function FoundationNode({ data, selected }: NodeProps<CanvasNodeData>) {
    return (
        <div
            className={cn(
                "relative flex h-[96px] w-[200px] flex-col items-center justify-center rounded-sm border px-4 py-3 text-center transition-all duration-300",
                "liquid-panel-strong shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
                selected ? "ring-2 ring-accent border-accent/50 shadow-glow" : "border-white/10"
            )}
        >
            <Handle id="top" type="target" position={Position.Top} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <Handle id="left" type="target" position={Position.Left} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <div className="line-clamp-2 text-[13px] font-semibold tracking-tight text-white leading-snug drop-shadow-md">
                {data.title}
            </div>
            <div className="mt-2 text-[9px] uppercase tracking-[0.15em] text-accent/80 font-bold">
                Core Truth
            </div>
            {data.is_locked && (
                <div className="absolute bottom-1 right-2 text-white/30 text-[10px]">🔒</div>
            )}
            {getValidationIcon(data.validation_status)}
            <Handle id="right" type="source" position={Position.Right} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <Handle id="bottom" type="source" position={Position.Bottom} className="w-8 h-1.5 rounded-full border-none bg-accent/30 hover:bg-accent hover:shadow-glow transition-all" />
        </div>
    );
}

export function DoctrineNode({ data, selected }: NodeProps<CanvasNodeData>) {
    const confidenceStyles = getConfidenceStyles(data.confidence);

    return (
        <div
            className={cn(
                "relative flex h-[130px] w-[130px] flex-col items-center justify-center rounded-full border p-5 text-center transition-all duration-300",
                "liquid-panel-strong shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
                confidenceStyles,
                selected ? "ring-2 ring-accent border-accent shadow-glow scale-105" : "hover:border-accent/50"
            )}
        >
            <Handle id="top" type="target" position={Position.Top} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <Handle id="left" type="target" position={Position.Left} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <span className="line-clamp-4 text-xs font-medium leading-relaxed tracking-wide drop-shadow-sm">
                {data.title}
            </span>
            {data.qualifier && (
                <div className="text-[8px] bg-white/10 rounded-full px-1.5 py-0.5 text-white/60 font-medium tracking-wide mt-1">
                    {formatQualifier(data.qualifier)}
                </div>
            )}
            {getValidationIcon(data.validation_status)}
            <Handle id="right" type="source" position={Position.Right} className="opacity-0 transition-opacity hover:opacity-100 bg-accent w-3 h-3 border-none" />
            <Handle id="bottom" type="source" position={Position.Bottom} className="w-8 h-1.5 rounded-full border-none bg-accent/30 hover:bg-accent hover:shadow-glow transition-all" />
        </div>
    );
}

export const canvasNodeTypes = { foundation: FoundationNode, doctrine: DoctrineNode };
