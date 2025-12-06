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