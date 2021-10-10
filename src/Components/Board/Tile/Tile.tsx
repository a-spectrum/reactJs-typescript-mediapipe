import React, { useEffect, useState } from 'react';
import './styles.css';

interface properties {
    id: number;
    position: string;
};

export function Tile({id, position}: properties) {
    const [tileColor, setTileColor] = useState('');  

    useEffect(() => {
        setTileColor(position === 'x' ? ' tile-green' : '');
    }, [position])

    return <div 
        className={'tile' + tileColor} 
        id={'tile-' + id.toString()} 
        onClick={() => {
            setTileColor(' tile-blue');
        }}
        tabIndex={0}
    >
        <span>{position}</span>
    </div>
}
