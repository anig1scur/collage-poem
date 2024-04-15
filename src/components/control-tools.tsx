import React, { FC, useContext } from "react";
import { ReactFabricContext } from '../contexts';

function Button(props: { action: string }) {
    const { action } = props;

    const context = useContext(ReactFabricContext);

    return (
        <div className="button" onClick={ () => {

            context?.commandManager.addCommand({
                type: 'reset-canvas',
                data: void 0,
            });

        } } >{ action }</div>
    )
}

const ControlTools: FC = () => {
    const context = useContext(ReactFabricContext);

    return (
        <div className="flex flex-col gap-5">
            {
                ["reset", "save", "load"].map((action, i) => (
                    <Button action={ action } key={ i } />
                ))
            }
        </div>
    )
}


export default ControlTools;
