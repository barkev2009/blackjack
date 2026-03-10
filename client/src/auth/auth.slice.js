import { createSlice } from '@reduxjs/toolkit';

// Токен больше не хранится на клиенте — он в httpOnly cookie.
// Храним только username для отображения в UI.
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        username: null,
        isAuth:   false,
        checked:  false, // true после проверки /auth/me при загрузке
    },
    reducers: {
        setAuth: (state, action) => {
            state.username = action.payload.username;
            state.isAuth   = true;
            state.checked  = true;
        },
        logout: (state) => {
            state.username = null;
            state.isAuth   = false;
            state.checked  = true;
        },
        setChecked: (state) => {
            state.checked = true;
        },
    },
});

export const { setAuth, logout, setChecked } = authSlice.actions;
export default authSlice.reducer;
