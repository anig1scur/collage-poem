import React from 'react';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { EveryObjectProperty } from '../../lib/properties/EveryObjectProperty';
import { EditorObject } from "../../lib/core";

export function ListObject({ property }: { property: EveryObjectProperty; }): JSX.Element {
    return <div>
        <h5>{ property.name }</h5>
        <div>
            { property.getValue().map((p: EditorObject) => {
                return <DisplayEditorObject canvas={ property.context?.canvas } key={
                    p.id
                } object={ p }></DisplayEditorObject>;
            }) }
        </div>
    </div>;
}


export function DisplayEditorObject(props: { canvas?: fabric.Canvas; object: EditorObject; }) {
    const forceUpdate = useForceUpdate();
    const { canvas, object } = props;
    return <div
        key={ object.id }
        onClick={ (e) => {
            canvas?.setActiveObject(object.fabricObject);
            // canvas?.requestRenderAll();
            forceUpdate();
        } }
        style={ {
            padding: 5,
        } }>
        <div>{ object.id }</div>
    </div>;
}
