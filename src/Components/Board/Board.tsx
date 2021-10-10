import React, { useState } from 'react';
import { Header } from './Header/Header';
import './styles.css';
import { Tile } from './Tile/Tile';

export function Board() {    
    const [gameState, setGameState] = useState([
        '','','',
        '','x','',
        '','',''
    ]);

    return <article className='container'>
        <button onClick={() => {
            document.getElementById('tile-8')?.click();
            // document.getElementById('tile-6')?.focus(); Doesn't work as expected
            console.log(document.getElementById('tile-8')?.offsetLeft);
            console.log(document.getElementById('tile-8')?.offsetTop);
            console.log(document.getElementById('tile-8')?.offsetWidth);
            console.log(document.getElementById('tile-8')?.offsetHeight);
        }}>Make 8 blue</button>

        <Header title={'Tic Tac Toe'} text={'Setup'} />
        <section  className='game-board'>
        {
            gameState.map((tile, index) => {
                return <Tile 
                key={index + 1} 
                id={index + 1} 
                position={tile} />
            })
        }
        </section>
    </article>
}
