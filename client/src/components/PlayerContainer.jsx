import React, { useEffect, useState } from 'react'
import '../styles/PlayerContainer.css'
import CardHand from './CardHand'
import { GAME_STATES } from '../const'
import { useDispatch, useSelector } from 'react-redux'
import { doubleDown, hit, split, stand } from '../database/game.reducer'

const PlayerContainer = ({ playerState, playerIndex }) => {

    const dispatch = useDispatch();
    const gamePhase = useSelector(state => state.game.gamePhase);

    const [standDisabled, setStandDisabled] = useState(false);
    const [hitDisabled, setHitDisabled] = useState(false);
    const [doubleDisabled, setDoubleDisabled] = useState(false);
    const [splitDisabled, setSplitDisabled] = useState(true);
    const [stratVisibility, setStratVisibility] = useState(true);

    useEffect(
        () => {
            if (playerState.hand.length === 2 && playerState.hand[0].value === playerState.hand[1].value) {
                setSplitDisabled(_ => false);
            } else {
                setSplitDisabled(_ => true);
            }
        }, [playerState.hand]
    );

    useEffect(
        () => {
            if (gamePhase === GAME_STATES.GAME_OVER) {
                setDoubleDisabled(_ => true);
                setHitDisabled(_ => true);
                setSplitDisabled(_ => true);
                setStandDisabled(_ => true);
            }
            if (gamePhase === GAME_STATES.INITIAL_GAME) {
                setDoubleDisabled(_ => false);
                setHitDisabled(_ => false);
                setSplitDisabled(_ => false);
                setStandDisabled(_ => false);
            }
        }, [gamePhase]
    );

    const standHandler = () => {
        setStandDisabled(_ => true);
        setHitDisabled(_ => true);
        setDoubleDisabled(_ => true);
        setSplitDisabled(_ => true);
        setStratVisibility(_ => false);
        dispatch(stand({ playerIndex }))
    }

    const doubleHandler = () => {
        setDoubleDisabled(_ => true);
        setSplitDisabled(_ => true);
        setStandDisabled(_ => true);
        setHitDisabled(_ => true);
        setStratVisibility(_ => false);
        dispatch(doubleDown({ playerIndex }))
    }

    const hitHandler = () => {
        setDoubleDisabled(_ => true);
        setSplitDisabled(_ => true);
        dispatch(hit({ playerIndex }))
    }

    const splitHandler = () => {
        dispatch(split({ playerIndex }))
    }

    return (
        <div className='player-container'>
            <div className="player-score" style={{ position: 'absolute', left: 0 }}>{playerState.scoreFormatted}</div>
            <CardHand cards={playerState.hand} />
            <div className="basic-strategy-advice">{stratVisibility ? (playerState.score[1] < 21 ? playerState.basicStrategy : '') : ''}</div>
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