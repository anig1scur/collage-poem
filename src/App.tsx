import "./App.css"
import React, { useContext, useEffect } from 'react';
import { useForceUpdate } from './hooks/useForceUpdate';
import { PropertyWindows, MenuPluginItemProps, Editor, MenuActionItemProps } from './components';
import { Property } from './core/fabric';
import { useWatch } from './hooks/useWatch';
import { ReactFabricContext } from './contexts';
import { Menu } from './components/Menu';
import AssetsGallery from './components/assets-gallery';
import ControlTools from './components/control-tools';
import { douMatetials } from './utils/assets';

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
            <div style={ { gridArea: 'editor' } } className="canvas-wrapper">
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
                <AssetsGallery assets={ douMatetials } current={ '2' } prefix="/collage-poem/assets/douban" />
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
            <ControlTools />
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
