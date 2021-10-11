import React, {useEffect, useState} from 'react';
import {Header} from './Header/Header';
import './styles.css';
import {Tile} from './Tile/Tile';

export function Board() {
    const [gameState, setGameState] = useState([
        '', '', '',
        '', '', '',
        '', '', ''
    ]);

    const [turnState, setTurnState] = useState(1);
    const elementRef = React.useRef<HTMLElement>(null);
    const gameBoardRef = React.useRef<HTMLElement>(null);

    const updateGameState = () => {
        let children: HTMLCollection;
        gameBoardRef && gameBoardRef.current && (children = gameBoardRef.current.children);

        // @ts-ignore
        if(children) {
            // setTurnState(turnState === 1 ? 2 : 1);
            let container = document.getElementById('game-board-container');

            // Switch players
            let currentPlayer = elementRef.current?.getAttribute('data-turnstate');
            elementRef.current && elementRef.current.setAttribute(
                'data-turnstate',
                currentPlayer === '1' ? '2': '1');

            for(let i = 0; i < children.length; i++) {
                // Update gamestate
                let tempArray: Array<string> = gameState;
                // let index: string = children[i].getAttribute('id')?.substr(5,6);
                // let state = children[i].getAttribute('data-state');

                // tempArray[index] = state;
                setGameState(tempArray);
            }
        }
    }

    useEffect(() => {
        elementRef.current?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            updateGameState();
        });
    }, [])

    useEffect(() => {
        console.log(gameState);
    }, [gameState])

    return <article
        className='container'
        data-turnstate={'1'}
        id={'game-board-container'}
        ref={elementRef}
    >
        {/*<button onClick={() => {*/}
        {/*    document.getElementById('tile-8')?.click();*/}
        {/*    const mouseoverEvent = new Event('mouseover');*/}

        {/*    document.getElementById('tile-1')?.dispatchEvent(mouseoverEvent);*/}
        {/*    // console.log(document.getElementById('tile-8')?.offsetLeft);*/}
        {/*    // console.log(document.getElementById('tile-8')?.offsetTop);*/}
        {/*    // console.log(document.getElementById('tile-8')?.offsetWidth);*/}
        {/*    // console.log(document.getElementById('tile-8')?.offsetHeight);*/}
        {/*}}>Make 8 blue</button>*/}

        <Header title={'Tic Tac Toe'} text={'Setup'}/>
        <section
            ref={gameBoardRef}
            className={'game-board'}
        >
            {
                gameState.map((tile, index) => {
                    return <Tile
                        key={index}
                        id={index}
                        position={tile}
                        turn={turnState}
                    />
                })
            }
        </section>
    </article>
}
