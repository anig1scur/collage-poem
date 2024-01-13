import { fabric } from 'fabric';
import { SelectedObjectProperty } from './SelectedObjectProperty';


export class WidthProperty extends SelectedObjectProperty<number | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return obj.width;
    }
    getObjectProperty(obj: fabric.Object, value: number | undefined): fabric.IObjectOptions | null {
        const number = Number.parseInt(value as any);
        return !isNaN(number) ? { width: number } : null;
    }
}

export class TopProperty extends SelectedObjectProperty<number | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return obj.top;
    }
    getObjectProperty(obj: fabric.Object, value: number | undefined): fabric.IObjectOptions | null {
        const number = Number.parseInt(value as any);
        return !isNaN(number) ? { top: number } : null;
    }
}

export class LeftProperty extends SelectedObjectProperty<number | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return obj.left;
    }
    getObjectProperty(obj: fabric.Object, value: number | undefined): fabric.IObjectOptions | null {
        const number = Number.parseInt(value as any);
        return !isNaN(number) ? { left: number } : null;
    }
}


export class HeightProperty extends SelectedObjectProperty<number | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return obj.height;
    }
    getObjectProperty(obj: fabric.Object, value: number | undefined): fabric.IObjectOptions | null {
        const number = Number.parseInt(value as any);
        return !isNaN(number) ? { height: number } : null;
    }
}

export class SelectableProperty extends SelectedObjectProperty<boolean | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return this.context?.getEditorObjectFromFabricObject(obj)?.fabricObject.selectable;
    }
    getObjectProperty(obj: fabric.Object, value: boolean | undefined): fabric.IObjectOptions | null {
        const editorObject = this.context?.getEditorObjectFromFabricObject(obj);
        return editorObject ? {
                selectable: !!value
            } : null;
    }
}

export class FillProperty extends SelectedObjectProperty<string | undefined> {
    getValueFromSelectedObject(obj: fabric.Object) {
        return obj.fill?.toString();
    }
    getObjectProperty(obj: fabric.Object, value: string | undefined): fabric.IObjectOptions | null {
        return { fill: value }
    }
}
