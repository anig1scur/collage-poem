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


    let upHeight: number, downHeight: number;
    let isDragging = false, curTarget: string | undefined, isUp = true,
        startX = 0, endX = 0, startY = 0, endY = 0;

    function getSlope(x1: number, y1: number, x2: number, y2: number) {
        return (y2 - y1) / (x2 - x1);
    }

    function pointerDown(event: PointerEvent) {
        isDragging = true;
        startY = event.clientY;
        startX = event.clientX;
        curTarget = (event.target as HTMLDivElement).dataset.target;
    }

    function pointerUp(e: PointerEvent) {
        isDragging = false;
        const up = upRef.current;
        const down = downRef.current;
        endY = e.clientY;
        endX = e.clientX;

        if (!up || !down || !curTarget) return;

        let direction = startY > endY ? 'up' : 'down';
        if (curTarget === direction) return;

        const vertical = Math.abs(getSlope(startX, startY, endX, endY)) > 6;

        if (!vertical || (Math.abs(endY - startY) < 100 && Math.abs(endY - startY) / (curTarget === 'up' ? upHeight : downHeight) < 0.5)) {
            if (curTarget === 'up') {
                up.style.transform = `translateY(100%)`;
                down.style.transform = `translateY(0px)`;
            }
            else {

                up.style.transform = `translateY(0px)`;
                down.style.transform = `translateY(100%)`;

               

            }
            return
        }


        isUp = curTarget === 'up' && startY > endY || curTarget === 'down' && startY < endY;
        if (isUp) {
            up.style.transform = `translateY(0px)`;
            down.style.transform = `translateY(100%)`;
        }
        else {
            up.style.transform = `translateY(100%)`;
            down.style.transform = `translateY(0px)`;
        }

        curTarget = undefined;

    }

    function pointerMove(event: PointerEvent) {
        const {
            target,
        } = event;

        endY = event.clientY;
        endX = event.clientX;

        const el = target as HTMLDivElement;
        if (!el) return;


        const vertical = Math.abs(getSlope(startX, startY, endX, endY)) > 6;
        if (!vertical) return;

        let direction = startY > endY ? 'up' : 'down';
        if (curTarget === direction) return;

        isUp = direction === 'up';

        if (isDragging) {
            const up = upRef.current;
            const down = downRef.current;

            if (!up || !down) return;

            let move = Math.abs(endY - startY);
            if (isUp) {
                // up less
                // down more
                up.style.transform = `translateY(${ Math.abs(move - upHeight) }px)`;
                down.style.transform = `translateY(${ move }px)`;
            } else {
                console.log('qweqw')
                up.style.transform = `translateY(${ upHeight - move }px)`;
                down.style.transform = `translateY(${ Math.abs(move - downHeight) }px)`;
            }
        }

    }

    useEffect(() => {
        const up = upRef.current;
        const down = downRef.current;

        const upAndDown = upAndDownRef.current;

        if (!up || !down || !upAndDown) return;
        upHeight = up.getBoundingClientRect().height;
        downHeight = down.getBoundingClientRect().height;

        [upAndDown].forEach((el) => {
            el.addEventListener('pointerdown', pointerDown);
            el.addEventListener('pointerup', pointerUp);
            el.addEventListener('pointerout', pointerUp);
            el.addEventListener('pointermove', pointerMove);
        })
    }, [])


    const upRef = useRef<HTMLDivElement>(null);
    const downRef = useRef<HTMLDivElement>(null);
    const upAndDownRef = useRef<HTMLDivElement>(null);


    return (
        <div ref={upAndDownRef} className='up-and-down relative h-d-screen overflow-y-hidden text-center text-white  '>
            <div className='up h-96 bg-red-500 absolute w-full select-none bottom-0 padding-4' ref={ upRef } data-target='up'>
                <div className='flex justify-between items-center'>
                    { title }
                    { upIcon }
                </div>

                { upChildren }
            </div>
            <div className='down bg-blue-400 absolute w-full select-none padding-4 transform translate-y-full bottom-0 h-36' ref={ downRef } data-target='down'>

                { title }
                { downIcon }

                { downChildren }
            </div>

        </div>
    );
}

export default UpAndDown;
