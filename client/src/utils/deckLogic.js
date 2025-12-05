// Создание колоды карт
export const createDeck = (numDecks = 1) => {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const deck = [];
  for (let d = 0; d < numDecks; d++) {
    for (let suit of suits) {
      for (let value of values) {
        deck.push({
          suit,
          value,
          code: `${value}${suit}`,
          isHidden: false,
          numericValue: getNumericValue(value)
        });
      }
    }
  }
  return shuffleDeck(deck);
};

// Получить числовое значение карты
const getNumericValue = (value) => {
  if (value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(value)) return 10;
  return parseInt(value);
};

// Перемешивание колоды
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Подсчет очков руки
export const calculateScore = (hand) => {
  let score = 0;
  let aces = 0;
  
  hand.forEach(card => {
    if (card.isHidden) return;
    
    if (card.value === 'A') {
      aces += 1;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  });
  
  // Корректировка тузов
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  
  return score;
};

// Взять карту из колоды
export const drawCard = (deck) => {
  if (deck.length === 0) {
    return { card: null, newDeck: [] };
  }
  const newDeck = [...deck];
  const card = newDeck.pop();
  return { card, newDeck };
};

// Проверка возможности Double Down
export const canDoubleDown = (hand, playerBalance, bet) => {
  return hand.length === 2 && playerBalance >= bet;
};

// Проверка возможности Split
export const canSplit = (hand, playerBalance, bet) => {
  return hand.length === 2 && 
         hand[0].value === hand[1].value && 
         playerBalance >= bet;
};

// Проверка на Blackjack
export const hasBlackjack = (hand) => {
  return hand.length === 2 && calculateScore(hand) === 21;
};

// Базовая стратегия (Basic Strategy)
export const getBasicStrategyAdvice = (playerHand, dealerCard) => {
  const playerScore = calculateScore(playerHand);
  const dealerValue = getDealerValue(dealerCard);
  const isSoft = hasAce(playerHand) && playerScore <= 21;
  
  if (playerHand.length === 2 && playerHand[0].value === playerHand[1].value) {
    return getPairAdvice(playerHand[0].value, dealerValue);
  }
  
  if (isSoft) {
    return getSoftAdvice(playerScore, dealerValue);
  }
  
  return getHardAdvice(playerScore, dealerValue);
};

const getDealerValue = (dealerCard) => {
  if (!dealerCard) return 2;
  if (dealerCard.value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(dealerCard.value)) return 10;
  return parseInt(dealerCard.value);
};

const hasAce = (hand) => {
  return hand.some(card => card.value === 'A' && !card.isHidden);
};

const getPairAdvice = (pairValue, dealerValue) => {
  const adviceMap = {
    'A': 'Всегда сплит',
    '10': 'Никогда не сплит (стоять)',
    '9': dealerValue === 7 || dealerValue === 10 || dealerValue === 11 ? 'Стоять' : 'Сплит',
    '8': 'Всегда сплит',
    '7': dealerValue >= 2 && dealerValue <= 7 ? 'Сплит' : 'Хит',
    '6': dealerValue >= 2 && dealerValue <= 6 ? 'Сплит' : 'Хит',
    '5': 'Никогда не сплит (дабл, если возможно, иначе хит)',
    '4': dealerValue >= 5 && dealerValue <= 6 ? 'Сплит' : 'Хит',
    '3': dealerValue >= 2 && dealerValue <= 7 ? 'Сплит' : 'Хит',
    '2': dealerValue >= 2 && dealerValue <= 7 ? 'Сплит' : 'Хит'
  };
  return adviceMap[pairValue] || 'Стоять';
};

const getSoftAdvice = (playerScore, dealerValue) => {
  if (playerScore >= 20) return 'Стоять';
  if (playerScore === 19) return dealerValue === 6 ? 'Дабл' : 'Стоять';
  if (playerScore === 18) {
    if (dealerValue >= 2 && dealerValue <= 6) return 'Дабл';
    if (dealerValue === 7 || dealerValue === 8) return 'Стоять';
    return 'Хит';
  }
  if (playerScore === 17) return dealerValue >= 3 && dealerValue <= 6 ? 'Дабл' : 'Хит';
  if (playerScore <= 16) return dealerValue >= 4 && dealerValue <= 6 ? 'Дабл' : 'Хит';
  return 'Хит';
};

const getHardAdvice = (playerScore, dealerValue) => {
  if (playerScore >= 17) return 'Стоять';
  if (playerScore >= 13 && playerScore <= 16) {
    return dealerValue >= 2 && dealerValue <= 6 ? 'Стоять' : 'Хит';
  }
  if (playerScore === 12) {
    return dealerValue >= 4 && dealerValue <= 6 ? 'Стоять' : 'Хит';
  }
  if (playerScore === 11) return 'Дабл, если возможно, иначе хит';
  if (playerScore === 10) return dealerValue >= 2 && dealerValue <= 9 ? 'Дабл, если возможно, иначе хит' : 'Хит';
  if (playerScore === 9) return dealerValue >= 3 && dealerValue <= 6 ? 'Дабл, если возможно, иначе хит' : 'Хит';
  return 'Хит';
};