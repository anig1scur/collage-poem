// 这是一个可以滑上滑下的组件，上面的下来，下面的上去。
// 主要是仿 https://piggy.lol/media/84e166b8-1086-46cb-a24c-fd22a8742f6d/RPReplay_Final1705338415.mov


import React, { useEffect, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';


type UpAndDownProps = {
    bgColor?: string;
    headerBgColor?: string;
    upChildren?: React.ReactNode;
    downChildren?: React.ReactNode;
    title?: string;
    upIcon?: React.ReactNode;
    downIcon?: React.ReactNode;
}

const UpAndDown: React.FC<UpAndDownProps> = (props) => {
    const {
        upChildren,
        downChildren,
        upIcon = <ArrowUpIcon className='w-6 h-6' />,
        downIcon = <ArrowDownIcon className='w-6 h-6' />,
    } = props;


    let active = false;
    var initialX: number;
    var initialY: number;
    let isUpShowing = true;

    function setTranslate(el: HTMLDivElement, xPos: number | string, yPos: number | string) {
        el.style.transform = "translate3d(" + xPos + ", " + yPos + ", 0)";
    }

    function dragStart(e: PointerEvent) {

        initialX = e.clientX;
        initialY = e.clientY;
        active = true;
        upRef.current?.classList.remove('smooth-trans')
        downRef.current?.classList.remove('smooth-trans')
    }

    function dragEnd(e: PointerEvent) {

        var _currentY = e.clientY - initialY;

        if (Math.abs(_currentY) < 30) {
            isUpShowing = !isUpShowing;
        }

        if (active) {
            e.stopPropagation();
            if (isUpShowing) {
                setTranslate(upRef.current!, 0, '50%');
                setTranslate(downRef.current!, 0, '-100%');
                isUpShowing = false;
            }
            else {
                setTranslate(upRef.current!, 0, 0);
                setTranslate(downRef.current!, 0, 0);
                isUpShowing = true;
            }
            active = false;
        }
        upRef.current?.classList.add('smooth-trans')
        downRef.current?.classList.add('smooth-trans')
    }

    function drag(e: PointerEvent) {

        var canDown = isUpShowing;
        var canUp = !canDown;

        var _currentY = e.clientY - initialY;
        var _currentX = e.clientX - initialX;

        if ((canDown && _currentY < 0) || (canUp && _currentY > 0) || Math.abs(_currentY / _currentX) <= 0.4) {
            active = false;
        }


        if (active) {
            e.stopPropagation();
            e.preventDefault();

            if (isUpShowing) {
                setTranslate(upRef.current!, 0, `calc(min(50%, ${ _currentY * 0.6 }px))`);
                setTranslate(downRef.current!, 0, `calc(max(-100%, -${ _currentY *0.3 }px))`);
            }

            else {
                setTranslate(upRef.current!, 0, `calc(max(50% + ${ _currentY * 0.6 }px, 0px))`);
                setTranslate(downRef.current!, 0, `calc(min(-100% - ${ _currentY *0.3 }px, 0px))`);
            }
        }
    }


    useEffect(() => {
        const up = upRef.current;
        const down = downRef.current;

        const upAndDown = upAndDownRef.current;

        if (!up || !down || !upAndDown) return;

        upAndDown.addEventListener('pointerdown', dragStart);
        upAndDown.addEventListener('pointerup', dragEnd);
        upAndDown.addEventListener('pointercancel', e => {
            e.stopPropagation();
            e.preventDefault();

            drag(e);
            dragEnd(e);
        });
        // upAndDown.addEventListener('pointerout', dragEnd);
        upAndDown.addEventListener('pointermove', drag);
    }, [])


    const upRef = useRef<HTMLDivElement>(null);
    const downRef = useRef<HTMLDivElement>(null);
    const upAndDownRef = useRef<HTMLDivElement>(null);


    return (
        <div ref={ upAndDownRef } className='up-and-down smooth-trans relative block h-64 max-h-64 text-center text-white -bottom-16'>
            <div className='up max-h-64 h-64 absolute w-full select-none bottom-0 padding-4 will-change-transform ease-in-out' ref={ upRef }>
                <div className='flex justify-center items-center bg-orange-400 mb-2'>
                    { upIcon }
                </div>
                { upChildren }
            </div>
            <div className='down max-h-16 absolute w-full select-none padding-4 bottom-0 h-16 ease-in-out' ref={ downRef }>
                <div className='flex justify-center items-center bg-orange-400 mb-2'>
                    { downIcon }
                </div>
                { downChildren }
            </div>
        </div>
    );
}

export default UpAndDown;
