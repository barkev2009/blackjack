const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const PURPOSES = {
    verify_email:   { subject: 'BlackJack Pro — подтверждение почты',  label: 'Ваш код подтверждения регистрации' },
    login_2fa:      { subject: 'BlackJack Pro — код входа',            label: 'Ваш код двухфакторной аутентификации' },
    reset_password: { subject: 'BlackJack Pro — сброс пароля',         label: 'Ваш код для сброса пароля' },
};

const sendOtp = async (email, code, purpose) => {
    const { subject, label } = PURPOSES[purpose] || { subject: 'BlackJack Pro — код', label: 'Ваш код' };

    await transporter.sendMail({
        from: `"BlackJack Pro" <${process.env.SMTP_USER}>`,
        to:   email,
        subject,
        html: `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;
                        background:#0d1f15;color:#e8dcc8;border-radius:12px;">
                <h2 style="color:#c9a84c;margin-top:0;">♠ BlackJack Pro</h2>
                <p>${label}:</p>
                <div style="font-size:2.5rem;font-weight:700;letter-spacing:12px;
                            color:#7fffaa;margin:16px 0;">${code}</div>
                <p style="color:#888;font-size:0.85rem;">Код действителен 10 минут.<br>
                Если вы не запрашивали этот код — проигнорируйте письмо.</p>
            </div>
        `,
    });
};

module.exports = { generateCode, sendOtp };
