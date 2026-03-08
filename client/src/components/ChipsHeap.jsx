import React from 'react'
import '../styles/ChipsHeap.css';
import { useSelector } from 'react-redux';
import Chip from './Chip';

const ChipsHeap = () => {

    const chips = useSelector(state => state.game.chips);

    return (
        <div className="chip-heap">
            {chips.map(({ color, value, label, style }, idx) =>
                <Chip key={idx} color={color} value={value} label={label} style={style} />
            )}
        </div>
    )
}

export default ChipsHeap