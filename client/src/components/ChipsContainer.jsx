import React from 'react'
import ChipsPanel from './ChipsPanel';
import '../styles/ChipsContainer.css';
import ChipSelection from './ChipSelection';
import { useSelector } from 'react-redux';

const ChipsContainer = () => {

    const bet = useSelector(state => state.chips.bet);

    return (
        <div className='chips-container'>
            {bet > 0 && <ChipSelection />}
            <ChipsPanel />
        </div>
    )
}

export default ChipsContainer