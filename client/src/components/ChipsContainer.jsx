import React from 'react'
import ChipsPanel from './ChipsPanel';
import '../styles/ChipsContainer.css';
import ChipSelection from './ChipSelection';
import { useSelector } from 'react-redux';
import { useGameContext } from '../context/GameContext';
import { GAME_STATES } from '../const';

const ChipsContainer = () => {

    const bet = useSelector(state => state.chips.bet);
    const { gamePhase } = useGameContext();

    return (
        <div className='chips-container'>
            {bet > 0 && gamePhase === GAME_STATES.BETTING && <ChipSelection />}
            {gamePhase === GAME_STATES.BETTING && <ChipsPanel />}
        </div>
    )
}

export default ChipsContainer