// 这是一个可以滑上滑下的组件，上面的下来，下面的上去。
// 主要是仿 https://piggy.lol/media/84e166b8-1086-46cb-a24c-fd22a8742f6d/RPReplay_Final1705338415.mov


import React, { useEffect, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';


type UpAndDownProps = {
    bgColor?: string;
    headerBgColor?: string;
    upChildren?: React.ReactNode;
    downChildren?: React.ReactNode;
    title: string;
    upIcon?: React.ReactNode;
    downIcon?: React.ReactNode;
}

const UpAndDown: React.FC<UpAndDownProps> = (props) => {
    const {
        upChildren,
        downChildren,
        title,
        upIcon = <ArrowUpIcon className='w-6 h-6' />,
        downIcon = <ArrowDownIcon className='w-6 h-6' />,
    } = props;

    let isDragging = false, curTarget = 'up', isUp = true;

    function pointerDown(event: PointerEvent) {
        isDragging = true;
        curTarget = (event.target as HTMLDivElement).dataset.target || 'up';
    }

    function pointerUp(e: PointerEvent) {
        const up = upRef.current;
        const down = downRef.current;

        if (!isDragging || !up || !down) return;

        if (isUp) {
            up.style.transform = `translateY(0)`;
            down.style.transform = `translateY(100%)`;
        }
        else {
            up.style.transform = `translateY(100%)`;
            down.style.transform = `translateY(0)`;
        }

        isDragging = false;

    }

    function pointerMove(event: PointerEvent) {
        const {
            target,
            movementY,
        } = event;


        const vertical = Math.abs(movementY) > 10;
        if (!vertical) return;

        isUp = curTarget === 'up' && movementY < 0 || curTarget === 'down' && movementY > 0;

        const el = target as HTMLDivElement;
        if (!el) return;
        const rect = el.getBoundingClientRect();

        if (isDragging) {
            const up = upRef.current;
            const down = downRef.current;

            if (!up || !down) return;

            let percent = Math.abs(movementY / rect.height);

            let min = Math.max(0, percent * 100);
            let max = Math.min(100, 100 - percent * 100);

            if (isUp) {
                up.style.transform = `translateY(${ min }%)`;
                down.style.transform = `translateY(${ max }%)`;
            } else {
                up.style.transform = `translateY(${ max }%)`;
                down.style.transform = `translateY(${ min }%)`;
            }
        }

    }

    useEffect(() => {
        const up = upRef.current;
        const down = downRef.current;
        if (!up || !down) return;

        [up, down].forEach((el) => {
            el.addEventListener('pointerdown', pointerDown);
            el.addEventListener('pointerup', pointerUp);
            el.addEventListener('pointerout', pointerUp);
            el.addEventListener('pointerleave', pointerUp);
            el.addEventListener('pointermove', pointerMove);
        })
    }, [])


    const upRef = useRef<HTMLDivElement>(null);
    const downRef = useRef<HTMLDivElement>(null);


    return (
        <div className='up-and-down relative h-dynamic-screen	 overflow-y-hidden text-center text-white  '>
            <div className='up h-96 bg-red-500 absolute w-full select-none bottom-0 padding-4' ref={ upRef } data-target='up'>
            <div className='flex justify-between items-center'>
                    {title}
               {upIcon}
            </div>

                { upChildren }
            </div>
            <div className='down bg-blue-400 absolute w-full select-none padding-4 transform translate-y-full bottom-0 h-36' ref={ downRef } data-target='down'>
               
               {title}
                {downIcon}

                { downChildren }
            </div>

        </div>
    );
}

export default UpAndDown;
