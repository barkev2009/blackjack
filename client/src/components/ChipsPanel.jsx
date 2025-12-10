import React from 'react'
import '../styles/ChipsPanel.css';
import Chip from './Chip';
import { chipset } from '../const';

const ChipsPanel = () => {

    return (
        <div className='chips-panel'>
            <div className="chips-panel-inner">
                {chipset.map(({ chipColor, value, label, isComplex }, idx) => <Chip key={`chip-${idx}`} color={chipColor} value={value} label={label} isComplex={isComplex} />)}
            </div>
        </div>
    )
}

export default ChipsPanel