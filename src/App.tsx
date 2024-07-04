import "./App.scss"
import React, { useContext, useEffect } from 'react';
import { PropertyWindows, MenuPluginItemProps, Editor, MenuActionItemProps } from './components';
import { Property } from './core/fabric';
import { useWatch } from './hooks/useWatch';
import { ReactFabricContext } from './contexts';
import AssetsGallery from './components/assets-gallery';
import ControlTools from './components/control-tools';
import UpAndDown from './components/up-and-down';
import { douMatetials } from './utils/assets';

export type EditorAppProps = {
  RenderActionItem?: React.FC<MenuActionItemProps>,
  RenderPluginItem?: React.FC<MenuPluginItemProps>,
  RenderPropertyRendererMap?: Record<string, (property: Property<any>) => JSX.Element>;
  canvasId: string;
  height: number | string;
  width: number | string;
}
function EditorApp(props: EditorAppProps) {
  const context = useContext(ReactFabricContext);

  useWatch(context.pluginChange$);
  useWatch(context.commandManager.onChange$);

  useEffect(() => {
    return () => {
      context.destroy();
    }
  }, [context])


  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });


  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPC = windowSize.width >= 678;

  return (
    <div className={`collage-editor ${isPC?"pc" : ""}`}>
      <div className="canvas-wrapper" style={ { width: props.width, height: props.height } }>
        <Editor
          canvasId={ props.canvasId }
          height={ props.height }
          onCanvasReady={ (canvas) => {
            context.init(canvas);
          } }
          width={ props.width }
        />
      </div>
      {
        !isPC ? <UpAndDown
          upChildren={ <AssetsGallery assets={ douMatetials } current={ '2' } prefix="/collage-poem/assets/douban" /> }
          downChildren={ <ControlTools /> }
        /> : <div className="sidebar">
          <AssetsGallery assets={ douMatetials } current={ '2' } prefix="/collage-poem/assets/douban" />
          <ControlTools />
        </div>
      }
      <div className="safe-bottom" />
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
