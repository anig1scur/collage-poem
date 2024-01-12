import "./App.css"
import React, { useContext, useEffect } from 'react';
import { useForceUpdate } from './hooks/useForceUpdate';
import { PropertyWindows, MenuPluginItemProps, Editor, MenuActionItemProps } from './components';
import { Property } from './lib/core';
import { useWatch } from './hooks/useWatch';
import { ReactFabricContext } from './provider-consumer';
import { Menu } from './components/Menu';

export type EditorAppProps = {
    RenderActionItem?: React.FC<MenuActionItemProps>,
    RenderPluginItem?: React.FC<MenuPluginItemProps>,
    RenderPropertyRendererMap?: Record<string, (property: Property<any>) => JSX.Element>;
    canvasId: string;
    height: number;
    width: number;
}
function EditorApp(props: EditorAppProps) {
    const forceUpdate = useForceUpdate();
    const context = useContext(ReactFabricContext);

    useWatch(context.pluginChange$);
    useWatch(context.commandManager.onChange$);

    useEffect(() => {
        return () => {
            context.destroy();
        }
    }, [context])

    return (
        <div
            className="collage-editor">
            <div style={ { gridArea: 'editor' } }>
                <Editor
                    canvasId={ props.canvasId }
                    height={ props.height }
                    onCanvasReady={ (canvas) => {
                        context.init(canvas);
                    } }
                    width={ props.width }
                />
            </div>
            <div style={ { gridArea: 'menu' } }>
                <Menu
                    onActionTaken={ (action) => {
                        action.execute();
                    } }
                    onValueChange={ (plugin, _) => {
                        context.selectPlugin(plugin)
                        forceUpdate();
                    } }
                    renderAction={ props.RenderActionItem }
                    renderPlugin={ props.RenderPluginItem }
                />
            </div>
            {
                props.RenderPropertyRendererMap && (
                    <div style={ { gridArea: 'property-windows' } }>
                        <PropertyWindows
                            customPropertyRenderer={ props.RenderPropertyRendererMap }
                            windowTitle='Exposed Properties'
                        />
                    </div>
                ) }
        </div>
    )
}
export default EditorApp;
