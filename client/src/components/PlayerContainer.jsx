import React, { useState } from 'react'
import '../styles/PlayerContainer.css'
import CardHand from './CardHand'
import { useGameContext } from '../context/GameContext'

const PlayerContainer = () => {

    const { playerHand, hit, stand, doubleDown, playerScoreFormatted, playerScore } = useGameContext();
    const [standDisabled, setStandDisabled] = useState(false);
    const [hitDisabled, setHitDisabled] = useState(false);
    const [doubleVisible, setDoubleVisible] = useState(true);
    const [splitVisible, setSplitVisible] = useState(false);

    const standHandler = () => {
        setStandDisabled(true);
        setHitDisabled(true);
        setDoubleVisible(false);
        stand();
    }

    const doubleHandler = () => {
        setDoubleVisible(false);
        setStandDisabled(true);
        doubleDown();
    }

    return (
        <div className='player-container'>
            <div className="player-score" style={{ position: 'absolute', left: 0 }}>{playerScoreFormatted}</div>
            <CardHand cards={playerHand} />
            <div className="blackjack-buttons">
                <button className='stand-button' onClick={standHandler} disabled={standDisabled || playerScore[0] >= 21}>Stand</button>
                <button className='split-button' style={{display: splitVisible ? 'inline' : 'none'}}>Split</button>
                <button className='double-button' onClick={doubleHandler} style={{display: doubleVisible ? 'inline' : 'none'}}>Double down</button>
                <button className='hit-button' onClick={hit} disabled={hitDisabled || playerScore[0] >= 21}>Hit</button>
            </div>
        </div>
    )
}

export default PlayerContainer