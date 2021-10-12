import React, {useEffect, useState} from 'react';
import './styles.css';
import cross from './cross.svg';
import circle from './circle.svg';

interface properties {
    id: number;
    position: string;
    turn: number;
};

export function Tile({id, position, turn}: properties) {
    const elementRef = React.useRef<HTMLDivElement>(null);

    const [tileColor, setTileColor] = useState<string>('');
    const [clickClass, setClickClass] = useState<string>('');
    const [isHovered, setIsHovered] = useState<boolean>();
    const [turnState, setTurnState] = useState<string>(' ');


    useEffect(() => {
        // isHovered ?
            // setTileColor(' tile-red') :
            // setTileColor('');

    }, [isHovered])

    useEffect(() => {
        elementRef.current?.addEventListener('mouseenter', () => {
            // console.log('Event triggered');
            setIsHovered(true);
        });
        elementRef.current?.addEventListener('mouseleave', () => {
            // console.log('Event triggered');
            setIsHovered(false);
        });
        elementRef.current?.addEventListener('click', (e) => {
            // console.log('Event triggered');
            e.stopPropagation();
            e.preventDefault();
            // setClickClass(' tile-yellow-border');
            // Set the current player
            let container = document.getElementById('game-board-container');
            let currentPlayer = container?.getAttribute('data-turnstate')
            // console.log('From tile: player & which tile clicked', currentPlayer, id);
            setTurnState(currentPlayer === '1'? 'o': 'x');
            container?.click();
        });
    }, [])

    // useEffect(() => {
    //     setTileColor(position === 'x' ? ' tile-green' : '');
    //     setTurnState(position);
    // }, [position])

    return <div
        className={'tile' + tileColor + clickClass}
        data-state={turnState}
        id={'tile-' + id.toString()}
        // onClick={() => {
        //     setTileColor(' tile-blue');
        // }}
        ref={elementRef}
        tabIndex={0}
    >
        {turnState === 'x' && <img src={cross} />}
        {turnState === 'o' && <img src={circle} />}
    </div>
}
