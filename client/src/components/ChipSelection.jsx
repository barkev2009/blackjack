import React from 'react'
import '../styles/ChipSelection.css'
import { useDispatch, useSelector } from 'react-redux'
import { clearSum } from '../database/chips.reducer'
import ChipsHeap from './ChipsHeap'

const ChipSelection = () => {

    const chipSum = useSelector(state => state.chips.sum);
    const dispatch = useDispatch();

    const clearHandler = () => {
        dispatch(clearSum())
    }

    return (
        <div className='chip-selection'>
            <div className="selection-data">
                <ChipsHeap />
                <div className="chips-sum">{chipSum.toLocaleString()}</div>
                <div className="chips-buttons">
                    <button className='clear-button' onClick={clearHandler}>Clear</button>
                    <button className='deal-button'>Deal</button>
                </div>
            </div>
        </div>
    )
}

export default ChipSelection