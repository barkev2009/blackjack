const router = require('express').Router();
const { GameState } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Все роуты защищены JWT
router.use(authMiddleware);

// ─── LOAD STATE ───────────────────────────────────────────────────────────────
// GET /api/game/state
router.get('/state', async (req, res) => {
    try {
        const gs = await GameState.findOne({ where: { userId: req.user.id } });
        if (!gs) return res.status(404).json({ error: 'Состояние не найдено' });
        res.json({ bankroll: gs.bankroll, state: gs.state });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── SAVE STATE ───────────────────────────────────────────────────────────────
// POST /api/game/state
router.post('/state', async (req, res) => {
    try {
        const { bankroll, state } = req.body;
        if (bankroll === undefined || !state)
            return res.status(400).json({ error: 'bankroll и state обязательны' });

        const [gs] = await GameState.findOrCreate({
            where: { userId: req.user.id },
            defaults: { bankroll: 2000, state: {} },
        });
        await gs.update({ bankroll, state });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── RESET (банкролл обнулился) ───────────────────────────────────────────────
// POST /api/game/reset
router.post('/reset', async (req, res) => {
    try {
        const gs = await GameState.findOne({ where: { userId: req.user.id } });
        if (!gs) return res.status(404).json({ error: 'Состояние не найдено' });
        await gs.update({ bankroll: 2000, state: {} });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
