import { useEffect } from 'react';

const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const LABELS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const CardPreloader = () => {
    useEffect(() => {
        const base = process.env.PUBLIC_URL + '/static/cards/';
        LABELS.forEach(label => {
            SUITS.forEach(suit => {
                const img = new Image();
                img.src = `${base}${label}-${suit}.png`;
            });
        });
        // Рубашка
        const shirt = new Image();
        shirt.src = process.env.PUBLIC_URL + '/static/shirt.png';
    }, []);
    return null;
};

export default CardPreloader;
