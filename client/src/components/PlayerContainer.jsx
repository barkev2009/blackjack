import React, { useEffect, useState } from 'react'
import '../styles/PlayerContainer.css'
import CardHand from './CardHand'
import { useGameContext } from '../context/GameContext'

const PlayerContainer = ({ playerState, handIndex }) => {

    const { hit, stand, doubleDown, split } = useGameContext();
    const [standDisabled, setStandDisabled] = useState(false);
    const [hitDisabled, setHitDisabled] = useState(false);
    const [doubleDisabled, setDoubleDisabled] = useState(false);
    const [splitDisabled, setSplitDisabled] = useState(true);

    useEffect(
        () => {
            if (playerState.hand.length === 2 && playerState.hand[0].value === playerState.hand[1].value) {
                setSplitDisabled(false);
            } else {
                setSplitDisabled(true);
            }
        }, [playerState.hand]
    );

    const standHandler = () => {
        setStandDisabled(true);
        setHitDisabled(true);
        setDoubleDisabled(true);
        setSplitDisabled(true);
        stand(handIndex);
    }

    const doubleHandler = () => {
        setDoubleDisabled(true);
        setSplitDisabled(true);
        setStandDisabled(true);
        setHitDisabled(true);
        doubleDown(handIndex);
    }

    const hitHandler = () => {
        setDoubleDisabled(true);
        setSplitDisabled(true);
        hit(handIndex);
    }

    const splitHandler = () => {
        split(handIndex);
    }

    return (
        <div className='player-container'>
            <div className="player-score" style={{ position: 'absolute', left: 0 }}>{playerState.scoreFormatted}</div>
            <CardHand cards={playerState.hand} />
            <div className="blackjack-buttons">
                <button className='stand-button' onClick={standHandler} disabled={standDisabled || playerState.score[0] >= 21}>Stand</button>
                <button className='split-button' onClick={splitHandler} disabled={splitDisabled}>Split</button>
                <button className='double-button' onClick={doubleHandler} disabled={doubleDisabled || playerState.score[0] >= 21}>Double down</button>
                <button className='hit-button' onClick={hitHandler} disabled={hitDisabled || playerState.score[0] >= 21}>Hit</button>
            </div>
        </div>
    )
}

export default PlayerContainer