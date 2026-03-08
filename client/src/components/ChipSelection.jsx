import React from 'react'
import '../styles/ChipSelection.css'
import { useDispatch, useSelector } from 'react-redux'
import ChipsHeap from './ChipsHeap'
import { gameSlice } from '../game/game.slice'

const ChipSelection = () => {

    const bet = useSelector(state => state.game.bet);
    const dispatch = useDispatch();

    const clearHandler = () => {
        dispatch(gameSlice.actions.clearBet())
    }

    const dealHandler = () => {
        dispatch(gameSlice.actions.initializeRound())
        dispatch(gameSlice.actions.initialBankrollDecrement())
    }

    return (
        <div className='chip-selection'>
            <div className="selection-data">
                <ChipsHeap />
                <div className="chips-bet">{bet.toLocaleString()}</div>
                <div className="chips-buttons">
                    <button className='clear-button' onClick={clearHandler}>Clear</button>
                    <button className='deal-button' onClick={dealHandler}>Deal</button>
                </div>
            </div>
        </div>
    )
}

export default ChipSelection