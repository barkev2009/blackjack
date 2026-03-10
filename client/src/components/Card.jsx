import React, { useRef, useState, useEffect } from 'react';
import '../styles/Card.css';

const Card = ({ value, suit, label, style, count, face = true, showCount = false, animIndex = 0, isClearing = false, isDealing = false }) => {
    const cardName = `${label}-${suit}`;
    const imageSrc = `${process.env.PUBLIC_URL}/static/cards/${cardName}.png`;
    const shirtSrc = `${process.env.PUBLIC_URL}/static/shirt.png`;

    const prevFaceRef = useRef(face);
    const [displayFace, setDisplayFace] = useState(face);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!prevFaceRef.current && face) {
            prevFaceRef.current = face;
            const img = imgRef.current;
            if (!img) { setDisplayFace(true); return; }

            // Используем Web Animations API — нет проблем с классами и reflow
            const flipOut = img.animate(
                [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
                { duration: 150, easing: 'ease-in', fill: 'forwards' }
            );

            flipOut.onfinish = () => {
                setDisplayFace(true);
                // После смены src — flip-in
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        img.animate(
                            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
                            { duration: 150, easing: 'ease-out', fill: 'forwards' }
                        ).onfinish = () => {
                            img.style.transform = '';
                        };
                    });
                });
            };

            return () => flipOut.cancel();
        }
        prevFaceRef.current = face;
        setDisplayFace(face);
    }, [face]); // eslint-disable-line

    let className = 'card-wrap';
    let animStyle = {};

    if (isClearing) {
        className += ' card-clearing';
        animStyle = { animationDelay: `${animIndex * 40}ms` };
    } else if (isDealing) {
        className += ' card-dealing';
        animStyle = { animationDelay: `${animIndex * 120}ms` };
    }

    return (
        <div className={className} style={{ position: 'absolute', ...style, ...animStyle }}>
            <img
                ref={imgRef}
                src={displayFace ? imageSrc : shirtSrc}
                alt={displayFace ? `${label} of ${suit}` : 'card back'}
                className="card"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            {displayFace && showCount && (
                <div className="card-count-badge">{count > 0 ? `+${count}` : count}</div>
            )}
        </div>
    );
};

export default Card;
