import React, {Fragment, useEffect, useState} from 'react';
import {Header} from './Header/Header';
import './styles.css';
import {Tile} from './Tile/Tile';
import cross from "./Tile/cross.svg";
import circle from "./Tile/circle.svg";

export function Board() {
    let timeMilliseconds = Date.now();

    const [gameState, setGameState] = useState([
        '', '', '',
        '', '', '',
        '', '', ''
    ]);

    const [turnState, setTurnState] = useState<number>(1);
    const [winner, setWinner] = useState<string>('none');
    const elementRef = React.useRef<HTMLElement>(null);
    const gameBoardRef = React.useRef<HTMLElement>(null);

    const button1Ref = React.useRef<HTMLButtonElement>(null);
    const button2Ref = React.useRef<HTMLButtonElement>(null);

    const [modelStarted, setModelStarted] = useState<boolean>(false);
    const [gameModeChosen, setGameModeChosen] = useState<string>('');
    const [turnCounter, setTurnCounter] = useState<number>(0);
    const [countdownWidth, setCountdownWidth] = useState<number>(500);

    let interval: NodeJS.Timeout;

    const updateGameState = () => {
        let children: HTMLCollection;
        gameBoardRef && gameBoardRef.current && (children = gameBoardRef.current.children);

        // @ts-ignore
        if (children) {
            // setTurnState(turnState === 1 ? 2 : 1);
            // let container = document.getElementById('game-board-container');

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

                // @ts-ignore
                let dataStore = JSON.parse(localStorage.getItem('maisie_tictactoe_testdata'));

                dataStore.at(-1).gamestate = dataStore.at(-1).gamestate.concat([{
                    timeChanged: new Date(Date.now()).toString(),
                    tempArray}]);
                localStorage.setItem('maisie_tictactoe_testdata', JSON.stringify(
                    dataStore
                ));
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
        console.log('GameState: ', gameState);
        // @ts-ignore
        setTurnCounter(elementRef?.current.getAttribute('data-turncounter'));
        checkWinCondition();
    }, [gameState])

    useEffect(() => {
        console.log('Turn counter: ', turnCounter);
        winner === 'none' && turnCounter > 8 && setWinner('both');
    }, [turnCounter])

    useEffect(() => {
        // console.log('Game mode chosen: ', gameModeChosen);
        document.getElementById('app-container')?.click();
    }, [gameModeChosen])

    useEffect(() => {
        console.log('Winner: ', winner);
        winner !== 'none' &&
        elementRef.current && elementRef.current.setAttribute(
            'data-gamefinished', 'true');
        // winner !== 'none' && setCountdownWidth(countdownWidth - 5)
        if(winner !== 'none') {
            // @ts-ignore
            let dataStore = JSON.parse(localStorage.getItem('maisie_tictactoe_testdata'));

            dataStore.at(-1).winner = winner;
            localStorage.setItem('maisie_tictactoe_testdata', JSON.stringify(
                dataStore
            ));
        }
    }, [winner])

    const resetGame = () => {
        // console.log('board reset')
        // // @ts-ignore
        // elementRef.current && elementRef.current.setAttribute(
        //     'data-gamefinished', 'false');
        // elementRef.current && elementRef.current.setAttribute('data-gamereset', 'false');
        // setWinner('none');
        // setGameModeChosen('');
        // setTurnCounter(0);
        // setGameState([
        //     '', '', '',
        //     '', '', '',
        //     '', '', ''
        // ]);

    }

    return <article
        className='container'
        data-turnstate={'1'}
        data-turncounter={'0'}
        data-gamefinished={'false'}
        data-gamereset={'false'}
        id={'game-board-container'}
        ref={elementRef}
        onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            !modelStarted && setModelStarted(true);
            modelStarted && updateGameState();
            elementRef.current && elementRef.current.getAttribute('data-gamereset') === 'true' && resetGame();
        }
        }
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

        {modelStarted && <Fragment>
            {gameModeChosen !== '' && winner === 'none' && <Header title={'Boter, kaas & eieren'} text={'Setup'}/>}

            {gameModeChosen !== '' && winner !== 'none' && winner !== 'both' &&
            <span className={'header__subtitle__container'}>
            <p className={'header__subtitle'}>De winnaar is speler {winner === 'o' ? ' 1' : ' 2'} </p>
                {winner === 'x' && <img src={cross} alt={'Player x claimed this tile'} className={'playerIcon'}/>}
                {winner === 'o' && <img src={circle} alt={'Player o claimed this tile'} className={'playerIcon'}/>}
                <p className={'header__subtitle header__subtitle__2'}> !</p>
            </span>
            }
            {gameModeChosen !== '' && winner === 'both' &&
            <h2>Jullie hebben gelijkgespeeld!</h2>
            }


            <section
                ref={gameBoardRef}
                className={'game-board'}
            >

                {gameModeChosen === '' && <Fragment>
                    <button className={'gamemodeButton'}
                            id={'gamemodebutton1'}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setGameModeChosen('1p');
                                // @ts-ignore
                                let dataStore = JSON.parse(localStorage.getItem('maisie_tictactoe_testdata'));
                                dataStore === null &&   localStorage.setItem('maisie_tictactoe_testdata', JSON.stringify(
                                    [{
                                        startTime: new Date(Date.now()).toString(),
                                        gamestate: [
                                            {
                                                timeChanged: new Date(Date.now()).toString(),
                                                gameState}
                                        ],
                                        winner: '',
                                        gameResetTime: null,
                                    }]
                                ));
                                // @ts-ignore
                                dataStore === null && (dataStore = JSON.parse(localStorage.getItem('maisie_tictactoe_testdata')));
                                dataStore.push({
                                    startTime: new Date(Date.now()).toString(),
                                    gamestate: [
                                        {
                                            timeChanged: new Date(Date.now()).toString(),
                                            gameState}
                                    ],
                                    winner: '',
                                    gameResetTime: null,
                                });
                                localStorage.setItem('maisie_tictactoe_testdata', JSON.stringify(
                                    dataStore
                                ));
                            }}
                            ref={button1Ref}
                            tabIndex={0}
                    ><p>Start het spel!</p>
                    </button>
                    {/*<button className={'gamemodeButton gmb2'}*/}
                    {/*        id={'gamemodebutton2'}*/}
                    {/*        onClick={(e) => {*/}

                    {/*            e.preventDefault();*/}
                    {/*            e.stopPropagation();*/}
                    {/*            setGameModeChosen('2p');*/}
                    {/*        }}*/}
                    {/*        tabIndex={0}*/}
                    {/*        ref={button2Ref}*/}
                    {/*> <p>Twee spelers</p>*/}
                    {/*</button>*/}
                </Fragment>
                }


                {gameModeChosen !== '' && <Fragment>
                    {gameState.map((tile, index) => {
                        return <Tile
                            key={index}
                            id={index}
                            position={tile}
                            turn={turnState}
                        />
                    })}
                </Fragment>

                }
            </section>
        </Fragment>
        }
    </article>
}
