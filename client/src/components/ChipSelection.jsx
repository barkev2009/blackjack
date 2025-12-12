import React from 'react'
import '../styles/ChipSelection.css'
import { useDispatch, useSelector } from 'react-redux'
import { clearBet } from '../database/chips.reducer'
import ChipsHeap from './ChipsHeap'
import { initializeRound } from '../database/game.reducer'

const ChipSelection = () => {

    const bet = useSelector(state => state.chips.bet);
    const dispatch = useDispatch();

    const clearHandler = () => {
        dispatch(clearBet())
    }

    const dealHandler = () => {
        dispatch(initializeRound())
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