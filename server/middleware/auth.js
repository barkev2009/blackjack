const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET не задан в .env — сервер не может быть запущен безопасно');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_NAME = 'bj_token';

const COOKIE_OPTS = {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    21 * 24 * 60 * 60 * 1000, // 3 недели в мс
    path:      '/',
};

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalid or expired' });
    }
};

const signToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: '21d' });

const setTokenCookie = (res, payload) => {
    const token = signToken(payload);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
};

const clearTokenCookie = (res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
};

module.exports = { authMiddleware, signToken, setTokenCookie, clearTokenCookie };
