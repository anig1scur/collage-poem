import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useContext } from 'react';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { EditorObject } from '../../core/fabric';
import { EveryObjectProperty } from '../../core/properties/EveryObjectProperty';
import { ReactFabricContext } from '../../contexts';

export function ListObjectTree({ getObjectName, property }: { getObjectName: (eo: EditorObject) => string, property: EveryObjectProperty; }): JSX.Element {
    const forceUpdate = useForceUpdate();
    const context = React.useContext(ReactFabricContext);
    const parentObjects: EditorObject[] = (context.state.editorObjects ?? [] as EditorObject[])
        .filter((o: EditorObject) => o.parent == null);

    return <div>
        <h5>{ property.name } ({ context.state.editorObjects.length ?? 0 })</h5>
        <div>
            { parentObjects.map((p) =>
                <DisplayParentEditorObject
                    canvas={ context.canvas }
                    getObjectName={ getObjectName }
                    key={ p.id }
                    object={ p }
                    onClickAction={ () => { forceUpdate() } }
                    onDropAction={ () => { forceUpdate() } } />) }
        </div>
    </div>;
}


export function DisplayParentEditorObject(props: { canvas?: fabric.Canvas; getObjectName: (eo: EditorObject) => string, object: EditorObject; onClickAction: () => void, onDropAction: () => void }) {
    const { canvas, getObjectName, object } = props;
    const context = useContext(ReactFabricContext);
    function allowDrop(ev: React.DragEvent<HTMLDivElement>) {
        ev.preventDefault();
    }
    const name = getObjectName(object);
    return <div
        draggable
        key={ name }

        onDragOverCapture={ allowDrop }
        onDragStartCapture={ (e) => {
            e.dataTransfer.setData('text', object.id);
            props.onDropAction();
        } }
        onDropCapture={ (e) => {
            const data = e.dataTransfer.getData('text');
            context.commandManager.addCommand({
                data: { childId: data, parentId: object.id },
                type: 'set-parent',
            })
        } }
    >
        <div style={ {
            backgroundColor: canvas?.getActiveObject()?.name === object.id ? 'lightblue' : 'white',
            display: 'flex',
            flexDirection: 'row',
        } }>
            <div
                onClick={ (e) => {
                    canvas?.setActiveObject(object.fabricObject);
                    canvas?.requestRenderAll();
                    props.onClickAction();
                } }>
                { name }
            </div>
            <TrashIcon fontSize='small' onClick={ () => {
                context.commandManager.addCommand({
                    data: { id: object.id },
                    type: 'remove-object',
                })
            } } />

        </div>
        <div style={ { paddingLeft: 10 } }>
            { object.children.map((child) =>
                <DisplayParentEditorObject
                    canvas={ canvas }
                    getObjectName={ props.getObjectName }
                    key={ child.id }
                    object={ child }
                    onClickAction={ props.onClickAction }
                    onDropAction={ props.onDropAction }
                />) }
        </div>
    </div>;
}
