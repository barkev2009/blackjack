import React from 'react'
import '../styles/ChipsPanel.css';
import Chip from './Chip';

const ChipsPanel = () => {

    const chipsData = [
        { color: 'violet', value: 1, label: 1 },
        { color: 'blue', value: 10, label: 10 },
        { color: 'red', value: 100, label: 100 },
        { color: 'light-green', value: 1000, label: '1K' },
        { color: 'brown', value: 5000, label: '5K' },
        { color: 'yellow', value: 10000, label: '10K' },
    ]

    return (
        <div className='chips-panel'>
            <div className="chips-panel-inner">
                {chipsData.map(({ color, value, label }) => <Chip color={color} value={value} label={label} />)}
            </div>
        </div>
    )
}

export default ChipsPanel