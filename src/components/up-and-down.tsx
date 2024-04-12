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
        console.log(_currentY)
        if (Math.abs(_currentY) < 20) {
            isUpShowing = !isUpShowing;
        }

        if (active) {
            console.log('dragEnd', isUpShowing)
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

        // if (!active) return;

        var _currentY = e.clientY - initialY;

        if ((canDown && _currentY < 0) || (canUp && _currentY > 0)) {
            active = false;
        }


        if (active) {
            e.preventDefault();

            if (isUpShowing) {
                setTranslate(upRef.current!, 0, `calc(min(50%, ${ _currentY }px))`);
                setTranslate(downRef.current!, 0, `calc(max(-100%, -${ _currentY / 2 }px))`);
            }

            else {
                setTranslate(upRef.current!, 0, `calc(max(50% + ${ _currentY }px, 0px))`);
                setTranslate(downRef.current!, 0, `calc(min(-100% - ${ _currentY / 2 }px, 0px))`);
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
        // upAndDown.addEventListener('pointerleave', dragEnd);
        // upAndDown.addEventListener('pointerout', dragEnd);
        upAndDown.addEventListener('pointermove', drag);
    }, [])


    const upRef = useRef<HTMLDivElement>(null);
    const downRef = useRef<HTMLDivElement>(null);
    const upAndDownRef = useRef<HTMLDivElement>(null);


    return (
        <div ref={ upAndDownRef } className='up-and-down smooth-trans relative h-96 max-h-96 text-center text-white -bottom-24'>
            <div className='up max-h-96 h-96 absolute w-full select-none bottom-0 padding-4 will-change-transform ease-in-out' ref={ upRef }>
                <div className='flex justify-between items-center'>
                    { title }
                    { upIcon }
                </div>
                { upChildren }
            </div>
            <div className='down max-h-24 absolute w-full select-none padding-4 bottom-0 h-24 ease-in-out' ref={ downRef }>
                { title }
                { downIcon }
                { downChildren }
            </div>
        </div>
    );
}

export default UpAndDown;
