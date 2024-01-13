import React, { useEffect, CSSProperties } from 'react';
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useFabricCanvas } from '../hooks/useFabricCanvas';

export type EditorProps = {
    onCanvasReady?: (canvas: fabric.Canvas) => void;
    width: number;
    height: number;
    canvasId: string;
}

export function Editor(props: EditorProps) {
    const forceUpdate = useForceUpdate();
    const { fabricCanvas: canvasRef } = useFabricCanvas({ canvasId: props.canvasId });
    const canvas = canvasRef.current;

    useEffect(() => {
        if (!canvas) return;
        props.onCanvasReady?.(canvas);
    }, [!!canvas])

    useEffect(() => {
        forceUpdate();
    }, [])


    return (
        <canvas
            height={ props.height } width={ props.width } id={ props.canvasId } ></canvas>
    )
}
export default Editor;