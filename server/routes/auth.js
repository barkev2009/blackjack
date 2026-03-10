const router    = require('express').Router();
const bcrypt    = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { Op }    = require('sequelize');
const { User, OtpCode, GameState }      = require('../models');
const { generateCode, sendOtp }         = require('../services/email');
const { generateLinkCode, send2FACode } = require('../services/telegram');
const { setTokenCookie, clearTokenCookie, authMiddleware } = require('../middleware/auth');

const otpLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: 'Too many requests' } });

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', otpLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ error: 'Все поля обязательны' });

        const exists = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
        if (exists) {
            if (exists.email === email)
                return res.status(409).json({ error: 'Эта почта уже зарегистрирована' });
            return res.status(409).json({ error: 'Этот логин уже занят' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ username, email, passwordHash, isVerified: false });
        await GameState.create({ userId: user.id, bankroll: 2000, state: {} });

        // Верификация почты
        const code = generateCode();
        await OtpCode.create({ userId: user.id, code, purpose: 'verify_email', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
        await sendOtp(email, code, 'verify_email');

        res.json({ message: 'Регистрация успешна. Проверьте почту.', userId: user.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const otp = await OtpCode.findOne({ where: { userId, code, purpose: 'verify_email', used: false } });
        if (!otp || otp.expiresAt < new Date())
            return res.status(400).json({ error: 'Неверный или просроченный код' });

        await otp.update({ used: true });
        const user = await User.findByPk(userId);
        await user.update({ isVerified: true });

        setTokenCookie(res, { id: user.id, username: user.username });
        // Сообщаем клиенту привязан ли Telegram
        res.json({ username: user.username, telegramLinked: !!user.telegramChatId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── LOGIN step 1 ─────────────────────────────────────────────────────────────
router.post('/login', otpLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'Введите логин и пароль' });

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });

        if (!user.isVerified)
            return res.status(403).json({ error: 'Почта не подтверждена', userId: user.id, needVerify: true });

        const code = generateCode();
        await OtpCode.update({ used: true }, { where: { userId: user.id, purpose: 'login_2fa', used: false } });
        await OtpCode.create({ userId: user.id, code, purpose: 'login_2fa', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        if (user.telegramChatId) {
            // Telegram 2FA
            await send2FACode(user.telegramChatId, code);
            res.json({ message: 'Код отправлен в Telegram', userId: user.id, via: 'telegram' });
        } else {
            // Fallback — email
            await sendOtp(user.email, code, 'login_2fa');
            res.json({ message: 'Код отправлен на почту', userId: user.id, via: 'email' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── LOGIN step 2 (2FA) ───────────────────────────────────────────────────────
router.post('/login-2fa', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const otp = await OtpCode.findOne({ where: { userId, code, purpose: 'login_2fa', used: false } });
        if (!otp || otp.expiresAt < new Date())
            return res.status(400).json({ error: 'Неверный или просроченный код' });

        await otp.update({ used: true });
        const user = await User.findByPk(userId);

        setTokenCookie(res, { id: user.id, username: user.username });
        res.json({ username: user.username, telegramLinked: !!user.telegramChatId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
router.post('/resend-otp', otpLimiter, async (req, res) => {
    try {
        const { userId, purpose } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

        await OtpCode.update({ used: true }, { where: { userId, purpose, used: false } });
        const code = generateCode();
        await OtpCode.create({ userId, code, purpose, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        if (purpose === 'login_2fa' && user.telegramChatId) {
            await send2FACode(user.telegramChatId, code);
        } else {
            await sendOtp(user.email, code, purpose);
        }

        res.json({ message: 'Код отправлен повторно' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── TELEGRAM: получить код для привязки ─────────────────────────────────────
router.post('/telegram/link-code', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user.telegramChatId)
            return res.status(400).json({ error: 'Telegram уже привязан' });

        const code = generateLinkCode(user.id);
        const botName = process.env.TELEGRAM_BOT_NAME || 'your_bot';
        res.json({ code, botUrl: `https://t.me/${botName}?start=${code}` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── TELEGRAM: проверить статус привязки ─────────────────────────────────────
router.get('/telegram/status', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ linked: !!user.telegramChatId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── TELEGRAM: отвязать ───────────────────────────────────────────────────────
router.post('/telegram/unlink', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        await user.update({ telegramChatId: null });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
router.post('/forgot-password', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Введите почту' });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Указанной почты не было найдено.' });

        await OtpCode.update({ used: true }, { where: { userId: user.id, purpose: 'reset_password', used: false } });
        const code = generateCode();
        await OtpCode.create({ userId: user.id, code, purpose: 'reset_password', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
        await sendOtp(email, code, 'reset_password');

        res.json({ message: 'Код для сброса пароля отправлен на почту', userId: user.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { userId, code, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6)
            return res.status(400).json({ error: 'Пароль минимум 6 символов' });

        const otp = await OtpCode.findOne({ where: { userId, code, purpose: 'reset_password', used: false } });
        if (!otp || otp.expiresAt < new Date())
            return res.status(400).json({ error: 'Неверный или просроченный код' });

        await otp.update({ used: true });
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await User.update({ passwordHash }, { where: { id: userId } });

        res.json({ message: 'Пароль успешно изменён' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
    clearTokenCookie(res);
    res.json({ ok: true });
});

// ─── ME ───────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ username: req.user.username, telegramLinked: !!user?.telegramChatId });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
