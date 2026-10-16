/**
 * api.js — centralised fetch wrapper for the Notes App backend.
 * Base URL reads from NEXT_PUBLIC_API_URL env var, falls back to localhost:5000.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('notes_token');
}

export function setToken(token) {
    localStorage.setItem('notes_token', token);
}

export function removeToken() {
    localStorage.removeItem('notes_token');
    localStorage.removeItem('notes_user');
}

export function getUser() {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(localStorage.getItem('notes_user'));
    } catch {
        return null;
    }
}

export function setUser(user) {
    localStorage.setItem('notes_user', JSON.stringify(user));
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(username, email, password) {
    const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

export async function apiLogin(email, password) {
    const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

export function apiLogout() {
    removeToken();
}

// ── Notes ────────────────────────────────────────────────────────────────────

export async function apiGetNotes() {
    const data = await request('/api/notes');
    return data.notes;
}

export async function apiGetNote(id) {
    const data = await request(`/api/notes/${id}`);
    return data.note;
}

export async function apiCreateNote(title, content = '') {
    const data = await request('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
    });
    return data.note;
}

export async function apiUpdateNote(id, title, content) {
    const data = await request(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
    });
    return data.note;
}

export async function apiDeleteNote(id) {
    return request(`/api/notes/${id}`, { method: 'DELETE' });
}
