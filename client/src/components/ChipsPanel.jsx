import React from 'react'
import '../styles/ChipsPanel.css';
import Chip from './Chip';
import { chipset } from '../const';

const ChipsPanel = () => {

    return (
        <div className='chips-panel'>
            <div className="chips-panel-inner">
                {chipset.map(({ chipColor, value, label }) => <Chip color={chipColor} value={value} label={label} />)}
            </div>
        </div>
    )
}

export default ChipsPanel