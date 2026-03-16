const https = require('https');
const TelegramBot = require('node-telegram-bot-api');
const { User } = require('../models');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Хранилище временных кодов привязки: code → userId
// Код живёт 10 минут, после чего удаляется
const linkCodes = new Map();

let bot = null;

const setupHandlers = () => {
    bot.on('polling_error', (err) => {
        if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
            console.warn('Telegram 409: ждём завершения предыдущего инстанса...');
            bot.stopPolling().then(() => {
                setTimeout(() => bot.startPolling(), 3000);
            });
        } else {
            console.error('Telegram polling error:', err.message);
        }
    });

    // Пользователь пишет /start <code> — привязываем chat_id
    bot.onText(/\/start(?:\s+(\S+))?/, async (msg, match) => {
        const chatId = String(msg.chat.id);
        const code   = match[1];

        if (!code) {
            bot.sendMessage(chatId,
                '👋 Привет! Для привязки аккаунта BlackJack Pro перейди в приложение и нажми "Привязать Telegram".'
            );
            return;
        }

        const entry = linkCodes.get(code);
        if (!entry || entry.expiresAt < Date.now()) {
            bot.sendMessage(chatId, '❌ Код недействителен или истёк. Запросите новый в приложении.');
            return;
        }

        try {
            const user = await User.findByPk(entry.userId);
            if (!user) {
                bot.sendMessage(chatId, '❌ Пользователь не найден.');
                return;
            }

            // Проверяем что этот chat_id ещё не привязан к другому аккаунту
            const existing = await User.findOne({ where: { telegramChatId: chatId } });
            if (existing && existing.id !== user.id) {
                bot.sendMessage(chatId, '❌ Этот Telegram аккаунт уже привязан к другому пользователю.');
                return;
            }

            await user.update({ telegramChatId: chatId });
            linkCodes.delete(code);

            bot.sendMessage(chatId,
                `✅ Аккаунт *${user.username}* успешно привязан!\n\nТеперь я буду присылать вам коды для входа. 🃏`,
                { parse_mode: 'Markdown' }
            );
        } catch (e) {
            console.error('Telegram link error:', e);
            bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
        }
    });

    console.log('Telegram bot started');

    // Graceful shutdown: останавливаем polling до того как процесс умрёт,
    // чтобы новый инстанс не получал 409 Conflict
    const stop = () => {
        if (bot) {
            bot.stopPolling().finally(() => process.exit(0));
            setTimeout(() => process.exit(0), 3000); // fallback
        } else {
            process.exit(0);
        }
    };
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
};

const initBot = () => {
    if (!TOKEN) {
        console.warn('TELEGRAM_BOT_TOKEN не задан — Telegram 2FA отключён');
        return;
    }

    // Сбрасываем предыдущую сессию на стороне Telegram перед стартом polling.
    // Без этого Telegram держит старое long-poll соединение до ~10 секунд,
    // из-за чего новый инстанс получает 409 Conflict.
    const resetUrl = `https://api.telegram.org/bot${TOKEN}/deleteWebhook?drop_pending_updates=true`;
    https.get(resetUrl, () => {
        bot = new TelegramBot(TOKEN, { polling: true });
        setupHandlers();
    }).on('error', () => {
        bot = new TelegramBot(TOKEN, { polling: true });
        setupHandlers();
    });
};

// Генерируем временный код для привязки (6 символов, буквы+цифры)
const generateLinkCode = (userId) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    linkCodes.set(code, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });
    // Чистим истёкшие
    for (const [k, v] of linkCodes) {
        if (v.expiresAt < Date.now()) linkCodes.delete(k);
    }
    return code;
};

// Отправить 2FA код пользователю
const send2FACode = async (chatId, code) => {
    if (!bot) throw new Error('Telegram bot не инициализирован');
    await bot.sendMessage(chatId,
        `🔐 *Код входа в BlackJack Pro:*\n\n\`${code}\`\n\n_Действителен 10 минут_`,
        { parse_mode: 'Markdown' }
    );
};

module.exports = { initBot, generateLinkCode, send2FACode };