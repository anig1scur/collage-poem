import clsx from 'clsx';
import React, { FC, useState, useContext } from "react";
import { ReactFabricContext } from '../contexts';
import { getRandomUid } from '@/core/utils';

type AssetsProps = {
    [key: string]: string[]
}

type GalleryProps = {
    assets: AssetsProps
    current: string
    prefix?: string
}

export const AssetsGallery: FC<GalleryProps> = ({ assets, current, prefix }) => {

    const context = useContext(ReactFabricContext);
    const [currentGallery, setCurrentGallery] = useState(current)

    const renderGallery = (dir: string, pics: string[]) => {
        return (
            <div className="flex flex-wrap h-[320px] overflow-x-hidden overflow-y-auto gap-1 p-1 scrollbar scrollbar-thumb-brown70  scrollbar-track-brown10 ">
                { pics.map((pic, i) => (
                    <img key={ `${ dir }_${ i }` } className='cursor-pointer h-10 object-contain hover:scale-105 inline-block' onClick={ (e) => {
                        const img = e.target as HTMLImageElement;
                        context.commandManager.addCommand({
                            type: 'create-object',
                            data: {
                                objectType: "image",
                                src: img,
                                options: {
                                    name: getRandomUid(),
                                    scaleX: 0.8,
                                    scaleY: 0.8,
                                    top: Math.min(context.getMaxOffsetY() + 100, context.canvas?.height || 1440) - 40,
                                    left: context.canvas?.width ? context.canvas.width / 2 - img.width / 2 : 0,
                                }
                            }
                        })

                    } } src={ `${ prefix ? `${ prefix }/` : '' }${ dir }/${ pic }` } alt={ pic } />
                )) }
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between items-end">
                { Object.keys(assets).map((key, i) => (
                    <div key={ i }
                        onClick={ () => setCurrentGallery(key) }
                        className={
                            clsx('label', key === currentGallery ? 'text-brown70 text-5xl' : '')
                        }>
                        { key }
                    </div>
                )) }
            </div>
            { renderGallery(currentGallery, assets[currentGallery]) }
        </div>
    )
}

export default AssetsGallery
