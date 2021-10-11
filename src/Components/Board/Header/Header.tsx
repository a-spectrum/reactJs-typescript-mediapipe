import React, {useEffect, useState} from 'react';
import './styles.css';

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
        <p className={'header__subtitle'}>Speler {currenPlayer}</p>
    </section>
}
