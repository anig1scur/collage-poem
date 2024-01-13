import React, { useContext } from 'react';
import { Property } from "../core/fabric";
import { ReactFabricContext } from '../contexts';
import { ExposedProperty } from './ExposedProperty';

export type PropertyWindowsProps = {
    customPropertyRenderer?: {
        [key: string]: (property: Property<any>) => JSX.Element;
    };
    windowTitle: string;
};
export function PropertyWindows(props: PropertyWindowsProps) {
    const context = useContext(ReactFabricContext);
    const { properties } = context;
    const child = properties.length === 0 ?
        <div>Empty</div> :
        <>
            { properties
                .filter((property) => property.scope == 'global' || property.scope.getName() === context.state.selectedPluginName)
                .map((p) => {
                    return props.customPropertyRenderer?.[p.type] !== undefined ? props.customPropertyRenderer[p.type](p) : <ExposedProperty key={ p.name } property={ p } />;
                }) }
        </>

    return <div>
        {/* <h5>{ props.windowTitle }</h5> */}
        { child }
    </div>
}
export default PropertyWindows;
