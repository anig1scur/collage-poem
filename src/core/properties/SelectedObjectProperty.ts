import { fabric } from 'fabric';
import { Property, PropertyScope, FabricContext } from '../fabric';


export abstract class SelectedObjectProperty<T> extends Property<T> {
    constructor(name: string, type: string, scope: PropertyScope, private defaultValue: any) {
        super(name, type, scope);
    }
    onInit(context: FabricContext): void {
        const canvas = this.context?.canvas;
        if (!canvas) throw new Error('Canvas is null');
        canvas.on('selection:created', this.onChange);
        canvas.on('selection:updated', this.onChange);
        canvas.on('selection:cleared', this.onChange);
    }
    onChange = () => {
        this.change$.next(this.getValue())
    }
    destroy(): void {
        const canvas = this.context?.canvas;
        if (!canvas) throw new Error('Canvas is null');
        canvas.off('selection:created', this.onChange);
        canvas.off('selection:updated', this.onChange);
        canvas.off('selection:cleared', this.onChange);
    }
    abstract getValueFromSelectedObject(obj: fabric.Object): T;
    abstract getObjectProperty(obj: fabric.Object, value: T): fabric.IObjectOptions | null;
    getValue(): T {
        const canvas = this.context?.canvas;
        const selectedObject = canvas?.getActiveObject();
        if (selectedObject) {
            return this.getValueFromSelectedObject(selectedObject);
        } else {
            return this.defaultValue;
        }
    }
    setValueInternal(value: T): void {
        const canvas = this.context?.canvas;
        if (!canvas) throw new Error('Canvas is null');
        const selectedObject = canvas.getActiveObject();
        if (selectedObject && selectedObject.name) {
            const property = this.getObjectProperty(selectedObject, value);
            if (property === null) return;
            this.context?.commandManager.addCommand({
                type: 'update-object',
                data: {
                    id: selectedObject.name,
                    options: property
                }
            })
        }
    }
}
