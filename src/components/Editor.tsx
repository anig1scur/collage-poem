import React, { useEffect } from 'react';
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useFabricCanvas } from '../hooks/useFabricCanvas';

export type EditorProps = {
    onCanvasReady?: (canvas: fabric.Canvas) => void;
    width: number | string;
    height: number | string;
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

    // window.onresize = () => {

    //     const canvas = canvasRef.current;
    //     if (!canvas) return;

    //     const ratio = canvas.getWidth() / canvas.getHeight();
    //     const containerWidth = document.documentElement.clientWidth;
    //     const containerHeight = document.documentElement.clientHeight;
    //     canvas.setDimensions({ width: containerWidth * 0.9, height: containerHeight * 0.7 });
    // }

    return (
        <canvas height={ props.height } width={ props.width } id={ props.canvasId } ></canvas>
    )
}
export default Editor;