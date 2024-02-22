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


    let active = false;
    var currentX: number;
    var currentY: number;
    var initialX: number;
    var initialY: number;
    var xOffset = 0;
    var yOffset = 0;
    let upHeight: number = 0;
    let downHeight: number = 0;


    function setTranslate(xPos: number, yPos: number, el: HTMLDivElement) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

    function getSlope(x1: number, y1: number, x2: number, y2: number) {
        return (y2 - y1) / (x2 - x1);
    }


    function dragStart(e: PointerEvent) {

        initialX = e.clientX;
        initialY = e.clientY;

        // if (e.target === upAndDownRef.current) {
        active = true;
        // }
    }

    function dragEnd(e: PointerEvent) {
        xOffset = currentX;
        yOffset = currentY;
        active = false;
    }

    function drag(e: PointerEvent) {
        if (active) {
            e.preventDefault();


            var _currentX = e.clientX - initialX;
            var _currentY = e.clientY - initialY;


            if (Math.abs(_currentY / _currentX) < 0.8 && Math.abs(_currentY) > 25) {
                return;
            }

            console.log(yOffset);

            currentY = _currentY + yOffset;

            if (yOffset > 0) {
                // setTranslate(0, Math.min(Math.abs(currentY), downHeight), downRef.current!);
                setTranslate(0, -Math.min(currentY, upHeight), upRef.current!)
            }
            else {
                // setTranslate(0, -Math.min(currentY, downHeight), downRef.current!);
                setTranslate(0, Math.min(currentY, upHeight), upRef.current!)
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

        upAndDown.addEventListener('pointerdown', dragStart);
        upAndDown.addEventListener('pointerup', dragEnd);
        // upAndDown.addEventListener('pointerout', dragEnd);
        upAndDown.addEventListener('pointermove', drag);
    }, [])


    const upRef = useRef<HTMLDivElement>(null);
    const downRef = useRef<HTMLDivElement>(null);
    const upAndDownRef = useRef<HTMLDivElement>(null);


    return (
        // <div className='up-and-down-container'>
        <div ref={ upAndDownRef } className='up-and-down relative h-d-screen overflow-y-hidden text-center text-white  '>
            <div className='up h-96 bg-red-500 absolute w-full select-none bottom-0 padding-4' ref={ upRef }>
                <div className='flex justify-between items-center'>
                    { title }
                    { upIcon }
                </div>
                { upChildren }
            </div>
            <div className='down bg-blue-400 absolute w-full select-none padding-4 transform translate-y-full bottom-0 h-36' ref={ downRef }>

                { title }
                { downIcon }

                { downChildren }
            </div>
        </div>
        // </div>
    );
}

export default UpAndDown;
