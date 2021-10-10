import React from 'react';
import './styles.css';

interface properties {
    title: string;
    text: string;
};

export function Header({title, text}: properties) {

    return <section className='header'>
        <h2>{title}</h2>
        <p>{text}</p>
    </section>
}
