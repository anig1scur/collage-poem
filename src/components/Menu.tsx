import React, { useContext } from 'react';
import { Action, Plugin } from '../core/fabric';
import { ReactFabricContext } from '../contexts';
import MenuActionItem, { MenuActionItemProps } from './MenuActionItem';
import { MenuPluginItem, MenuPluginItemProps } from './MenuPluginItem';

export type MenuProps = {
    onActionTaken: (action: Action) => void;
    onValueChange: (plugin: Plugin, value: boolean) => void;
    renderAction?: React.FC<MenuActionItemProps>;
    renderPlugin?: React.FC<MenuPluginItemProps>;

}

export function Menu(props: MenuProps) {
    const PluginRenderer = props.renderPlugin ?? MenuPluginItem;
    const ActionRenderer = props.renderAction ?? MenuActionItem;
    const context = useContext(ReactFabricContext);
    return (
        <div style={ { width: "32px", display: 'flex', flexDirection: 'column' } }>
            <div style={ { display: 'flex', flexDirection: 'column' } }>
                {
                    context.plugins.map(
                        (plugin) => <PluginRenderer
                            key={ plugin.getName() }
                            onValueChange={ props.onValueChange }
                            plugin={ plugin }
                            selected={ context.state.selectedPluginName === plugin.getName() }
                        />
                    )
                }
            </div>
            <div style={ { display: 'flex', flexDirection: 'column' } }>
                {
                    context.actions.map(
                        (action) => <ActionRenderer
                            action={ action }
                            key={ action.getName() }
                            onTakeAction={ props.onActionTaken }
                        />
                    )
                }
            </div>
        </div>
    )
}
export default Menu;
