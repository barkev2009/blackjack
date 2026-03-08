import { GAME_DECISIONS } from "../const";

export const getRandomRotationAngle = () => {
    const arr = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return arr[Math.floor(Math.random() * arr.length)]
}

export const getLeftAdjustment = (idx) => {
    if (idx % 3 === 0) {
        return '25%'
    }
    if (idx % 3 === 1) {
        return 'calc(25% - 3px)'
    }
    if (idx % 3 === 2) {
        return 'calc(25% + 3px)'
    }
}

export const createDeck = () => {
    const suits = ['spades', 'diamonds', 'clubs', 'hearts'];
    const labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 1];
    const counts = [1, 1, 1, 1, 1, 0, 0, 0, -1, -1, -1, -1, -1];
    const deck = [];

    for (const suit of suits) {
        for (let i = 0; i < values.length; i++) {
            deck.push({
                suit,
                value: values[i],
                label: labels[i],
                count: counts[i],
            })
        }
    }
    return deck;
}

/**
 * Перемешивает массив объектов с использованием алгоритма Фишера-Йетса
 * Модифицирует исходный массив!
 * @param {Array} array - Массив объектов для перемешивания
 * @returns {Array} - Перемешанный массив (исходный массив изменен)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Генерируем случайный индекс от 0 до i
        const j = Math.floor(Math.random() * (i + 1));

        // Меняем элементы местами
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const hardBSAdvice = (dealerLabel, playerScore) => {
    if (playerScore >= 17) {
        return GAME_DECISIONS.STAND
    }
    if (playerScore >= 13 && playerScore <= 16) {
        return ['2', '3', '4', '5', '6'].includes(dealerLabel) ? GAME_DECISIONS.STAND : GAME_DECISIONS.HIT
    }
    if (playerScore === 12) {
        return ['4', '5', '6'].includes(dealerLabel) ? GAME_DECISIONS.STAND : GAME_DECISIONS.HIT
    }
    if (playerScore === 11) {
        return GAME_DECISIONS.DOUBLE_DOWN
    }
    if (playerScore === 10) {
        return ['10', 'A'].includes(dealerLabel) ? GAME_DECISIONS.HIT : GAME_DECISIONS.DOUBLE_DOWN
    }
    if (playerScore === 9) {
        return ['3', '4', '5', '6'].includes(dealerLabel) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT
    }
    if (playerScore <= 8) {
        return GAME_DECISIONS.HIT
    }
    return ''
}

const softBSAdvice = (dealerLabel, playerScore) => {
    if (playerScore === 9) {
        return GAME_DECISIONS.STAND
    }
    if (playerScore === 8) {
        return dealerLabel === '6' ? GAME_DECISIONS.DOUBLE_DOWN_S : GAME_DECISIONS.STAND
    }
    if (playerScore === 7) {
        if (['2', '3', '4', '5', '6'].includes(dealerLabel)) {
            return GAME_DECISIONS.DOUBLE_DOWN_S
        } else if (['7', '8'].includes(dealerLabel)) {
            return GAME_DECISIONS.STAND
        } else {
            return GAME_DECISIONS.HIT
        }
    }
    if (playerScore === 6) {
        return ['3', '4', '5', '6'].includes(dealerLabel) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT
    }
    if (playerScore === 5 || playerScore === 4) {
        return ['4', '5', '6'].includes(dealerLabel) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT
    }
    if (playerScore === 3 || playerScore === 2) {
        return ['5', '6'].includes(dealerLabel) ? GAME_DECISIONS.DOUBLE_DOWN : GAME_DECISIONS.HIT
    }
    return ''
}

const splitBSAdvice = (das, dealerLabel, playerLabel, playerScore) => {
    if (['8', 'A'].includes(playerLabel)) {
        return GAME_DECISIONS.SPLIT
    }
    if (['10', 'J', 'Q', 'K'].includes(playerLabel)) {
        return hardBSAdvice(dealerLabel, playerScore)
    }
    if (playerLabel === '9') {
        return ['7', 'A', '10', 'J', 'Q', 'K'].includes(dealerLabel) ? hardBSAdvice(dealerLabel, playerScore) : GAME_DECISIONS.SPLIT
    }
    if (playerLabel === '7') {
        return ['8', '9', 'A', '10', 'J', 'Q', 'K'].includes(dealerLabel) ? hardBSAdvice(dealerLabel, playerScore) : GAME_DECISIONS.SPLIT
    }
    if (playerLabel === '6') {
        if (['3', '4', '5', '6'].includes(dealerLabel)) {
            return GAME_DECISIONS.SPLIT
        } else if (dealerLabel === '2') {
            return das ? GAME_DECISIONS.SPLIT : hardBSAdvice(dealerLabel, playerScore)
        } else {
            return hardBSAdvice(dealerLabel, playerScore)
        }
    }
    if (playerLabel === '5') {
        return hardBSAdvice(dealerLabel, playerScore);
    }
    if (playerLabel === '4') {
        return ['5', '6'].includes(dealerLabel) ? (das ? GAME_DECISIONS.SPLIT : hardBSAdvice(dealerLabel, playerScore)) : hardBSAdvice(dealerLabel, playerScore);
    }
    if (['2', '3'].includes(playerLabel)) {
        if (['4', '5', '6', '7'].includes(dealerLabel)) {
            return GAME_DECISIONS.SPLIT
        } else if (['2', '3'].includes(dealerLabel)) {
            return das ? GAME_DECISIONS.SPLIT : hardBSAdvice(dealerLabel, playerScore)
        } else {
            return hardBSAdvice(dealerLabel, playerScore)
        }
    }
    return ''
}

export const giveBSAdvice = (dealerLabel, playerHand, playerScores, das) => {
    if (playerHand.length === 2 && playerHand[0].label === playerHand[1].label) {
        return splitBSAdvice(das, dealerLabel, playerHand[0].label, playerScores[0])
    }
    if (playerScores[0] !== playerScores[1]) {
        return softBSAdvice(dealerLabel, playerScores[0] - 1)
    } else {
        return hardBSAdvice(dealerLabel, playerScores[0])
    }
}

export const determineGameResult = (chipsState, gameState) => {

}

export const createShoe = (deckNumber = 6) => {
    let shoe = [];
    for (let i = 0; i < deckNumber; i++) {
        const deck = createDeck();
        shoe = [...shoe, ...deck];
    }
    // return shuffleArray(shoe)
    return [

        // У дилера блэкджек
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 7, label: '7', count: 0 },

        // У дилера SOFT 17
        // { suit: 'clubs', value: 6, label: '6', count: 1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        
        // У игрока SOFT 17
        // { suit: 'clubs', value: 6, label: '6', count: 1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 6, label: '6', count: 1 },

        // У игрока 21, не блэкджек
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 2, label: '2', count: 1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 7, label: '7', count: 0 },
        // { suit: 'clubs', value: 4, label: '4', count: 1 },

        // У игрока блэкджек 
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 10, label: '10', count: -1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },

        // Множественные сплиты
        // { suit: 'clubs', value: 8, label: '8', count: 0 },
        // { suit: 'diamonds', value: 8, label: '8', count: 0 },
        // { suit: 'spades', value: 8, label: '8', count: 0 },
        // { suit: 'hearts', value: 8, label: '8', count: 0 },
        // { suit: 'clubs', value: 8, label: '8', count: 0 },
        // { suit: 'diamonds', value: 8, label: '8', count: 0 },
        // { suit: 'spades', value: 8, label: '8', count: 0 },
        // { suit: 'hearts', value: 8, label: '8', count: 0 }
    ].concat(shuffleArray(shoe));
}