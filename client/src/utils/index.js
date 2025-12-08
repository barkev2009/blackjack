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

export const createShoe = (deckNumber = 6) => {
    let shoe = [];
    for (let i = 0; i < deckNumber; i++) {
        const deck = createDeck();
        shoe = [...shoe, ...deck];
    }
    // return shuffleArray(shoe)
    return [
        // { suit: 'clubs', value: 2, label: '10', count: 1 },
        // { suit: 'clubs', value: 2, label: '10', count: 1 },
        // { suit: 'clubs', value: 1, label: 'A', count: -1 },
        // { suit: 'clubs', value: 10, label: 'A', count: -1 }
    ].concat(shuffleArray(shoe));
}