import { fabric } from 'fabric';
import { fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { FabricContextUser, IDestroyable, Property } from '..';
import { EditorObject } from './EditorObject';
import { Plugin, FabricCommandManager } from '..';
import { IEvent } from 'fabric/fabric-impl';
import { Action } from './Action';

export class BaseState {
  editorObjects: EditorObject[];
  objectMap: Map<fabric.Object, EditorObject>;
  selectedPluginName: string;
  constructor() {
    this.editorObjects = [];
    this.objectMap = new Map();
    this.selectedPluginName = '';
  }
}

export class FabricContext implements IDestroyable {
  public canvas?: fabric.Canvas;
  public commandManager: FabricCommandManager;
  public plugins: Plugin[];
  public actions: Action[];
  public properties: Property[];
  public state: BaseState;
  private destroyable: IDestroyable[];
  public pluginChange$ = new Subject<void>();
  constructor() {
    this.state = new BaseState();
    this.commandManager = new FabricCommandManager(this);
    this.plugins = [];
    this.actions = [];
    this.properties = [];
    this.destroyable = [];
  }

  subscribeToEvents(
    eventName: string,
    fabricContextUser: FabricContextUser,
  ): Observable<IEvent<Event>> {
    if (!this.canvas) {
      throw new Error('Canvas is not initialized');
    }
    return fromEvent(this.canvas, eventName).pipe(
      takeUntil(fabricContextUser.destroy$),
    );
  }

  isInit = false;
  init(canvas: fabric.Canvas) {
    if (this.isInit) throw new Error('FabricContext is already initialized');
    this.isInit = true;
    this.canvas = canvas;
    this.plugins.forEach((p) => p.init(this));
    this.properties.forEach((p) => p.init(this));
    this.actions.forEach((a) => a.init(this));
    this.setupFabricConfig();
  }

  deleteSelectedObjects() {
    const canvas = this.canvas;
    if (!canvas) throw new Error('Canvas is null');

    let selection = canvas.getActiveObjects();
    selection.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  setupFabricConfig() {
    // style for selection
    fabric.Object.prototype.set({
      transparentCorners: false,
      borderColor: '#D6CCAA',
      cornerColor: '#FFF',
      borderScaleFactor: 2,
      cornerStyle: 'circle',
      cornerStrokeColor: '#B39470',
      borderOpacityWhenMoving: 0,
      objectCaching: true,
    //   objectCaching: false,
      selectable: true
    });

    fabric.Canvas.prototype.selectionColor ='#D6CCAA3a';

    // delete button
    const deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyle: 'pointer',
      mouseUpHandler: (mouseEvent: MouseEvent, target: fabric.Transform) => {
        if (target.action === 'rotate') return true;
        this.deleteSelectedObjects();
        return true;
      },
      render: (
        ctx: CanvasRenderingContext2D,
        left: number,
        top: number,
        styleOverride: any,
        fabricObject: fabric.Object,
      ) => {
        const size = this.canvas?.getZoom() || 1;
        const sizeIcon = 36 * size;
        const sizeBorder = 16 * size;
        const sizeOffset = sizeBorder - sizeIcon;
        var img = document.createElement('img');
        img.src = './assets/delete.svg';
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle ?? 0));
        ctx.drawImage(img, sizeOffset, sizeOffset, sizeIcon, sizeIcon);
        ctx.restore();
      },
    });

    fabric.Object.prototype.controls.deleteControl = deleteControl;
    fabric.Group.prototype.controls.deleteControl = deleteControl;
  }

  registerPlugin(plugin: Plugin) {
    if (this.isInit) {
      plugin.init(this);
    }
    this.plugins.push(plugin);
    this.registerFabricContextUser(plugin);
    this.pluginChange$.next();
  }

  registerAction(action: Action) {
    if (this.isInit) {
      action.init(this);
    }
    this.actions.push(action);
    this.registerFabricContextUser(action);
  }

  registerProperty(property: Property) {
    if (this.isInit) {
      property.init(this);
    }
    this.properties.push(property);
    this.registerFabricContextUser(property);
  }

  registerFabricContextUser(fabricContextUser: FabricContextUser) {
    this.destroyable.push(fabricContextUser);
  }

  destroy(): void {
    this.destroyable.forEach((d) => d.destroy());
    this.canvas?.clear();
    this.state.editorObjects = [];
    this.state.objectMap = new Map();
  }
  reset(): void {
    this.canvas?.clear();
    this.state.editorObjects.forEach((eo) => eo.destroy());
    this.state.editorObjects = [];
    this.state.objectMap = new Map();
  }

  getPluginByName(name: string): Plugin | undefined {
    return this.plugins.find((p) => p.getName() === name);
  }

  selectPluginByName(name: string) {
    const plugin = this.getPluginByName(name);
    if (!plugin) {
      throw new Error(`Plugin with name ${name} not found`);
    }
    this.selectPlugin(plugin);
  }

  selectPlugin(plugin: Plugin) {
    const previousPluginName = this.state.selectedPluginName;

    this.plugins.forEach((p) => {
      if (p.getName() === previousPluginName) {
        p.setSelected(false);
      }
      if (p.getName() === plugin.getName()) {
        p.setSelected(true);
      }
    });
    this.state.selectedPluginName = plugin.getName();
    this.pluginChange$.next();
  }

  getEditorObjectFromFabricObject(object: fabric.Object): EditorObject | null {
    return this.state.objectMap.get(object) || null;
  }

  addObject(object: fabric.Object) {
    if (object.name === undefined)
      throw new Error('Object name should not be undefined');
    if (this.getEditorObjectById(object.name as string)) {
      throw new Error(`Object with name (${object.name}) already exists`);
    }
    const id = object.name as string;
    this.canvas?.add(object);
    const editorObject = new EditorObject(id, object);
    this.destroyable.push(editorObject);
    this.state.editorObjects.push(editorObject);
    this.state.objectMap.set(object, editorObject);
  }

  getMaxOffsetY() {
    return this.state.editorObjects.reduce((max, eo) => {
      const { top = 0 } = eo.fabricObject;
      return Math.max(max, top);
    }, 0);
  }

  private removeObject(object: fabric.Object) {
    const { objectMap, editorObjects } = this.state;
    const editorObject = objectMap.get(object);
    if (!editorObject) {
      throw new Error('Object not found');
    }
    if (editorObject.parent) {
      editorObject.setParent(null);
    }
    if (editorObject.children.length > 0) {
      editorObject.children.forEach((c) => this.removeObject(c.fabricObject));
    }
    objectMap.delete(object);
    editorObjects.splice(editorObjects.indexOf(editorObject), 1);
    editorObject.destroy();
    this.destroyable.splice(this.destroyable.indexOf(editorObject), 1);
    this.canvas?.remove(object);
  }

  removeObjectById(objectId: string) {
    const object = this.getEditorObjectById(objectId)?.fabricObject;
    if (object) {
      this.removeObject(object);
    }
  }

  moveObjectById(objectId: string, left: number, top: number) {
    const editorObject = this.getEditorObjectByIdOrThrow(objectId);
    const object = editorObject.fabricObject;
    const { left: objectLeft = 0, top: objectTop = 0 } = object;
    const displacement = {
      dLeft: left - objectLeft,
      dTop: top - objectTop,
    };
    object.set({
      left,
      top,
    });
    editorObject.moveChildren(displacement);
  }

  updateObjectById<T extends fabric.IObjectOptions>(
    objectId: string,
    objectOptions: T,
  ) {
    const object = this.getEditorObjectById(objectId)?.fabricObject;
    if (object) {
      object.setOptions(objectOptions);
      // this.canvas?.requestRenderAll();
    }
  }

  getEditorObjectById(id: string): EditorObject | undefined {
    return this.state.editorObjects.find((o) => o.id === id);
  }

  getEditorObjectByIdOrThrow(id: string): EditorObject {
    const object = this.state.editorObjects.find((o) => o.id === id);
    if (!object) {
      throw new Error(`Object with id ${id} not found`);
    }
    return object;
  }

  setParentById(childId: string, parentId: string) {
    const parent = this.getEditorObjectByIdOrThrow(parentId);
    const child = this.getEditorObjectByIdOrThrow(childId);
    child.setParent(parent);
  }
}
