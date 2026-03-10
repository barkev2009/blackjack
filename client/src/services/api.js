const BASE = process.env.REACT_APP_API_URL;

// credentials: 'include' — браузер автоматически отправляет httpOnly cookie
const req = (url, opts = {}) =>
    fetch(`${BASE}${url}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...opts.headers },
        ...opts,
    }).then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
        return data;
    });

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const apiMe         = ()                    => req('/auth/me');
export const apiRegister   = (username, email, password) =>
    req('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
export const apiVerifyEmail = (userId, code)       =>
    req('/auth/verify-email', { method: 'POST', body: JSON.stringify({ userId, code }) });
export const apiLogin      = (username, password)  =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
export const apiLogin2FA   = (userId, code)        =>
    req('/auth/login-2fa', { method: 'POST', body: JSON.stringify({ userId, code }) });
export const apiResendOtp  = (userId, purpose)     =>
    req('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ userId, purpose }) });
export const apiLogout     = ()                    =>
    req('/auth/logout', { method: 'POST' });

// ─── GAME ─────────────────────────────────────────────────────────────────────
export const apiLoadState  = ()                    => req('/game/state');
export const apiSaveState  = (bankroll, state)     =>
    req('/game/state', { method: 'POST', body: JSON.stringify({ bankroll, state }) });
export const apiResetGame  = ()                    =>
    req('/game/reset', { method: 'POST' });

// ─── TELEGRAM ─────────────────────────────────────────────────────────────────
export const apiTelegramLinkCode  = ()  => req('/auth/telegram/link-code', { method: 'POST' });
export const apiTelegramStatus    = ()  => req('/auth/telegram/status');
export const apiTelegramUnlink    = ()  => req('/auth/telegram/unlink', { method: 'POST' });

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────
export const apiForgotPassword = (email)                    =>
    req('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const apiResetPassword  = (userId, code, newPassword) =>
    req('/auth/reset-password',  { method: 'POST', body: JSON.stringify({ userId, code, newPassword }) });
