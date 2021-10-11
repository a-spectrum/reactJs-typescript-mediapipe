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

    const [turnState, setTurnState] = useState<number>(1);
    const [winner, setWinner] = useState<string>('none');
    const elementRef = React.useRef<HTMLElement>(null);
    const gameBoardRef = React.useRef<HTMLElement>(null);

    const updateGameState = () => {
        let children: HTMLCollection;
        gameBoardRef && gameBoardRef.current && (children = gameBoardRef.current.children);

        // @ts-ignore
        if (children) {
            // setTurnState(turnState === 1 ? 2 : 1);
            let container = document.getElementById('game-board-container');

            // Switch players
            let currentPlayer = elementRef.current?.getAttribute('data-turnstate');
            elementRef.current && elementRef.current.setAttribute(
                'data-turnstate',
                currentPlayer === '1' ? '2' : '1');

            setTimeout(() => {
                let tempArray: Array<string> = [...gameState];
                for (let i = 0; i < children.length; i++) {
                    // Update gamestate
                    let index = children[i].getAttribute('id')?.substr(5, 6);
                    let state = children[i].getAttribute('data-state');

                    if (typeof state === "string") {
                        index && (tempArray[parseInt(index)] = state);
                    }
                }
                setGameState(tempArray);
            }, 100)
        }
    }

    const checkGameWon = (gameState: Array<string>, winCondition: Array<number>) => {
        let decideWinner: string = 'none';
        gameState[winCondition[0]] === 'x'
        && gameState[winCondition[1]] === 'x'
        && gameState[winCondition[2]] === 'x' && (decideWinner = 'x');

        gameState[winCondition[0]] === 'o'
        && gameState[winCondition[1]] === 'o'
        && gameState[winCondition[2]] === 'o' && (decideWinner = 'o');

        return decideWinner;
    }

    const checkWinCondition = () => {
        const winCondition0 = [0, 1, 2];
        const winCondition3 = [0, 3, 6];
        const winCondition6 = [0, 4, 8];
        const winCondition4 = [1, 4, 7];
        const winCondition7 = [2, 4, 6];
        const winCondition5 = [2, 5, 8];
        const winCondition1 = [3, 4, 5];
        const winCondition2 = [6, 7, 8];
        const listWinCombinations = [
            winCondition0, winCondition1,
            winCondition2, winCondition3,
            winCondition4, winCondition5,
            winCondition6, winCondition7,
        ];

        listWinCombinations.forEach(combination => {
            let decideWinner: string = checkGameWon(gameState, combination);
            decideWinner !== 'none' && setWinner(decideWinner);
        })

    }

    useEffect(() => {
        elementRef.current?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            updateGameState();
        });
    }, [])

    useEffect(() => {
        console.log('GameState: ', gameState);
        checkWinCondition();
    }, [gameState, setGameState])

    useEffect(() => {
        console.log('Winner: ', winner);
    }, [winner])


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

        <Header title={'Boter, kaas & eieren'} text={'Setup'}/>
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
