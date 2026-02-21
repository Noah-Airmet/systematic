import { useCallback } from "react";
import { BaseEdge, EdgeProps, getBezierPath, useStore, Position, getSmoothStepPath } from "reactflow";

function getEdgeParams(source: any, target: any) {
    const sourceW = source.width || 200;
    const sourceH = source.height || 96;
    const targetW = target.width || 130;
    const targetH = target.height || 130;

    // React Flow provides positionAbsolute for absolute canvas coordinates
    const sCtx = (source.positionAbsolute?.x || source.position.x) + sourceW / 2;
    const sCty = (source.positionAbsolute?.y || source.position.y) + sourceH / 2;
    const tCtx = (target.positionAbsolute?.x || target.position.x) + targetW / 2;
    const tCty = (target.positionAbsolute?.y || target.position.y) + targetH / 2;

    const dx = tCtx - sCtx;
    const dy = tCty - sCty;

    let sourcePos: Position, targetPos: Position;
    let sx: number, sy: number, tx: number, ty: number;

    if (Math.abs(dx) > Math.abs(dy)) {
        // horizontal connection
        if (dx > 0) {
            sourcePos = Position.Right;
            targetPos = Position.Left;
            sx = (source.positionAbsolute?.x || source.position.x) + sourceW;
            sy = sCty;
            tx = (target.positionAbsolute?.x || target.position.x);
            ty = tCty;
        } else {
            sourcePos = Position.Left;
            targetPos = Position.Right;
            sx = (source.positionAbsolute?.x || source.position.x);
            sy = sCty;
            tx = (target.positionAbsolute?.x || target.position.x) + targetW;
            ty = tCty;
        }
    } else {
        // vertical connection
        if (dy > 0) {
            sourcePos = Position.Bottom;
            targetPos = Position.Top;
            sx = sCtx;
            sy = (source.positionAbsolute?.y || source.position.y) + sourceH;
            tx = tCtx;
            ty = (target.positionAbsolute?.y || target.position.y);
        } else {
            sourcePos = Position.Top;
            targetPos = Position.Bottom;
            sx = sCtx;
            sy = (source.positionAbsolute?.y || source.position.y);
            tx = tCtx;
            ty = (target.positionAbsolute?.y || target.position.y) + targetH;
        }
    }

    return { sx, sy, tx, ty, sourcePos, targetPos };
}

export function DynamicEdge({
    id,
    source,
    target,
    markerEnd,
    style,
    data,
    label
}: EdgeProps) {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} id={id} />
            {label && (
                <foreignObject
                    width={120}
                    height={40}
                    x={labelX - 60}
                    y={labelY - 20}
                    className="edgebutton-foreignobject overflow-visible"
                    requiredExtensions="http://www.w3.org/1999/xhtml"
                >
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="rounded-md bg-black/90 border border-white/15 px-2 py-1 text-[10px] font-bold text-white shadow-sm whitespace-nowrap">
                            {label}
                        </div>
                    </div>
                </foreignObject>
            )}
        </>
    );
}
