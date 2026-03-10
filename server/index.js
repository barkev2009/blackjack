require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const { initBot } = require('./services/telegram');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5007;

sequelize.authenticate()
    .then(() => {
        console.log('DB connected');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        initBot(); // Запускаем Telegram бота
        if (process.env.NODE_ENV === 'production') {
            const options = {
                key:  fs.readFileSync('/etc/letsencrypt/live/barkev2009-portfolio.ru/privkey.pem'),
                cert: fs.readFileSync('/etc/letsencrypt/live/barkev2009-portfolio.ru/cert.pem'),
                ca:   fs.readFileSync('/etc/letsencrypt/live/barkev2009-portfolio.ru/chain.pem'),
            };
            https.createServer(options, app).listen(PORT, () => {
                console.log(`HTTPS server running on port ${PORT}`);
            });
        } else {
            http.createServer(app).listen(PORT, () => {
                console.log(`HTTP server running on port ${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('Startup error:', err);
        process.exit(1);
    });
