import React, {useEffect, useState} from 'react';
import './styles.css';
import cross from "../Tile/cross.svg";
import circle from "../Tile/circle.svg";

interface properties {
    title: string;
    text: string;
};

export function Header({title, text}: properties) {
    const elementRef = React.useRef<HTMLDivElement>(null);
    const [currenPlayer, setCurrentPlayer] = useState<string>('1');

    useEffect(() => {
        elementRef.current?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            let container = document.getElementById('game-board-container');
            let newCurrentPlayer = container?.getAttribute('data-turnstate');
            newCurrentPlayer && setCurrentPlayer(newCurrentPlayer);
        });
    }, [])

    return <section ref={elementRef} id={'header-scoreboard'} className='header'>
        <h1 className={'header__title'}>{title}</h1>
        <p className={'header__subtitle'}>Speler {currenPlayer} mag een vak kiezen</p>
        {currenPlayer === '2' && <img src={cross} alt={'Player x claimed this tile'} className={'playerIcon'} />}
        {currenPlayer === '1' && <img src={circle} alt={'Player o claimed this tile'} className={'playerIcon'} />}
    </section>
}
