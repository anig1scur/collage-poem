import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import EditorApp from './App';
import { SelectPlugin, CreateRectPlugin, CreateCirclePlugin } from './lib/plugins';
import { LoadAction, SaveAction, ShowGridAction, UndoAction } from './lib/actions';
import { LeftProperty, FillProperty, EveryObjectProperty, TopProperty, HeightProperty, SelectableProperty, WidthProperty, NameProperty } from './lib/properties';
import { Property, Action, FabricContext, Plugin } from "./lib/core";
import { ListObjectTree, MenuActionItemProps, MenuPluginItemProps } from "./components";
import { Bars3Icon, Bars4Icon, CircleStackIcon, FolderArrowDownIcon, ReceiptPercentIcon, RectangleGroupIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { ReactFabricContext } from "./provider-consumer";

const plugins: Plugin[] = [
    new SelectPlugin('Selection'),
    new CreateRectPlugin('Create Rect'),
    new CreateCirclePlugin('Create Circle'),
]

const actions: Action[] = [
    new UndoAction('Undo'),
    new SaveAction('Save', (text) => { window.localStorage.setItem('fabric', text) }),
    new LoadAction('Load', () => { return window.localStorage.getItem('fabric') ?? null }),
    new ShowGridAction('Show Grid'),
]

const properties = [
    new EveryObjectProperty("All Objects", "every-object-property", "global"),
    new NameProperty("Name", "string", plugins[0], ""),
    new LeftProperty("X", "number", plugins[0], 0),
    new TopProperty("Y", "number", plugins[0], 0),
    new WidthProperty("Width", "number", plugins[0], 0),
    new HeightProperty("Height", "number", plugins[0], 0),
    new FillProperty("Fill Color", "color", plugins[0], "#000001"),
    new SelectableProperty("Selectable", "boolean", plugins[0], true),
];

function getIconFor(item: Plugin | Action) {
    switch (item.getName()) {
        case 'Selection':
            return ShieldExclamationIcon;
        case 'Create Rect':
            return ReceiptPercentIcon;
        case 'Create Circle':
            return CircleStackIcon;
        case 'Show Grid':
            return RectangleGroupIcon
        case 'Undo':
            return Bars3Icon;
        case 'Save':
            return Bars4Icon;
        case 'Load':
            return FolderArrowDownIcon;
        default:
            return Bars3Icon
    }
}

function CustomPluginItem(props: MenuPluginItemProps) {
    const { plugin, selected } = props;
    const color = selected ? 'primary' : 'secondary';
    const Icon = getIconFor(plugin);
    return (
        <Icon
            color={ color }
            onClick={ () => { props.onValueChange(plugin, true) } }
            style={ { padding: 5 } }
        />
    )
}

function CustomActionItem(props: MenuActionItemProps) {
    const { action, onTakeAction } = props;
    const color = 'secondary';
    const Icon = getIconFor(action);
    return (
        <Icon
            color={ color }
            onClick={ () => { onTakeAction(action) } }
            style={ { padding: 5 } }
        />
    )
}


const App = () => {

    useEffect(() => {
        document.body.classList.add('light');
    }, [])

    const context = new FabricContext();
    plugins.forEach((plugin) => { context.registerPlugin(plugin) });
    properties.forEach((property) => { context.registerProperty(property) })
    actions.forEach((action) => { context.registerAction(action) })

    return <ReactFabricContext.Provider value={ context }>
        <EditorApp
            RenderActionItem={ CustomActionItem }
            RenderPluginItem={ CustomPluginItem }
            RenderPropertyRendererMap={
                {
                    'every-object-property': (property: Property) => {
                        return <ListObjectTree getObjectName={ (eo) => eo.data.getKey('name', eo.id) as string } property={ property as EveryObjectProperty } />
                    }
                }
            }
            canvasId="canvas"
            height={ 500 }
            width={ 750 }
        ></EditorApp>
    </ReactFabricContext.Provider>
}

const element = document.getElementById("root");
if (element == null) {
    throw new Error("Root element not found");
}

const root = createRoot(element);

root.render(<App />)