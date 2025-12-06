import React from 'react'
import ChipsPanel from './ChipsPanel';
import '../styles/ChipsContainer.css';
import ChipSelection from './ChipSelection';
import { useSelector } from 'react-redux';

const ChipsContainer = () => {

    const chipSum = useSelector(state => state.chips.sum);

    return (
        <div className='chips-container'>
            {chipSum > 0 && <ChipSelection />}
            <ChipsPanel />
        </div>
    )
}

export default ChipsContainer