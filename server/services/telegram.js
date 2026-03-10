const TelegramBot = require('node-telegram-bot-api');
const { User } = require('../models');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Хранилище временных кодов привязки: code → userId
// Код живёт 10 минут, после чего удаляется
const linkCodes = new Map();

let bot = null;

const initBot = () => {
    if (!TOKEN) {
        console.warn('TELEGRAM_BOT_TOKEN не задан — Telegram 2FA отключён');
        return;
    }

    bot = new TelegramBot(TOKEN, { polling: true });

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

const getBotUsername = () => bot ? bot.options?.username || null : null;

module.exports = { initBot, generateLinkCode, send2FACode };
