import React from 'react';
import '../styles/DealerContainer.css';
import CardHand from './CardHand';
import ScoreDisplay from './ScoreDisplay';
import { useSelector } from 'react-redux';

const DealerContainer = () => {
    const dealerState = useSelector(state => state.game.dealerState);
    const showCardValues = useSelector(state => state.game.showCardValues);

    return (
        <div className="dealer-container">
            <div className="dealer-label">Dealer</div>
            <CardHand cards={dealerState.hand} showCardValues={showCardValues} />
            <ScoreDisplay scoreFormatted={dealerState.scoreFormatted} cardCount={dealerState.hand.length} className="dealer-score" flipDelay={150} />
        </div>
    );
};

export default DealerContainer;
