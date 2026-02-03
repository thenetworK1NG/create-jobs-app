// auth.js (CREATE)
// Lightweight auth flow reused from WEBSITE, adapted to avoid config dependency.
// Handles login/logout, session state, and CSRF token retrieval for the app.

const authState = {
    username: null
};

let authElements = {};
let csrfToken = '';
const API_BASE = 'https://maphefosigns.co.za/users/';

// Expose to global for module scripts
window.authState = authState;
window.csrfToken = csrfToken;

function ensureAuthElements() {
    // Helper to enable/disable all interactive elements
    function setFormInteractivity(enabled) {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            Array.from(form.elements).forEach(el => {
                if (el.id !== 'loginUserSelect' && el.id !== 'loginBtn' && el.id !== 'loginUserInput') {
                    el.disabled = !enabled;
                }
            });
        });
        // Also disable all buttons outside modal
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.closest('#loginModal')) {
                btn.disabled = !enabled;
            }
        });
    }
    window.setFormInteractivity = setFormInteractivity;
    authElements.loginModal = document.getElementById("loginModal");
    authElements.loginUserSelect = document.getElementById("loginUserSelect");
    authElements.loginBtn = document.getElementById("loginBtn");
    authElements.logoutBtn = document.getElementById("logoutBtn");
    if (authElements.logoutBtn) {
        authElements.logoutBtn.onclick = async function() {
            await logout();
        };
    }
    // Prefer page status container if present; fallback to modal-specific status
    authElements.status = document.getElementById("status") || document.getElementById("authStatus");

    const modalInnerNeeded = !authElements.loginUserSelect || !authElements.loginBtn;

    if (!authElements.loginModal) {
        const modalHtml = `
            <div id="loginModal" class="modal hidden" role="dialog" aria-labelledby="loginModalTitle" aria-modal="true" tabindex="-1" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35)">
                <div class="modal-content" style="background:#fff;padding:20px;border-radius:10px;min-width:320px;max-width:90vw;box-shadow:0 10px 30px rgba(0,0,0,0.15)">
                    <h3 id="loginModalTitle" style="margin-top:0">Select User</h3>
                    <select id="loginUserSelect" aria-label="Select user" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd"></select>
                    <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
                        <label style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:400;margin-right:auto;">
                            <input type="checkbox" id="stayLoggedIn" style="margin:0"> Stay logged in
                        </label>
                        <button id="loginBtn" class="themed-btn" style="padding:8px 14px;">Login</button>
                    </div>
                    <div id="authStatus" style="margin-top:8px;color:#b23c3c"></div>
                </div>
            </div>
        `;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstElementChild);
        authElements.loginModal = document.getElementById("loginModal");
    } else if (modalInnerNeeded) {
        authElements.loginModal.innerHTML = `
            <div class="modal-content" style="background:#fff;padding:20px;border-radius:10px;min-width:320px;max-width:90vw;box-shadow:0 10px 30px rgba(0,0,0,0.15)">
                <h3 id="loginModalTitle" style="margin-top:0">Select User</h3>
                <select id="loginUserSelect" aria-label="Select user" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd"></select>
                <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
                    <button id="loginBtn" class="themed-btn" style="padding:8px 14px;">Login</button>
                </div>
                <div id="authStatus" style="margin-top:8px;color:#b23c3c"></div>
            </div>
        `;
    }

    // Refresh element references after possible creation/population
    authElements.loginModal = document.getElementById("loginModal");
    authElements.loginUserSelect = document.getElementById("loginUserSelect");
    authElements.loginBtn = document.getElementById("loginBtn");
    authElements.logoutBtn = document.getElementById("logoutBtn") || (function(){
        const b = document.createElement('button'); b.id = 'logoutBtn'; b.style.display='none'; document.body.appendChild(b); return b; })();
    authElements.status = document.getElementById("status") || document.getElementById("authStatus");
}

document.addEventListener('DOMContentLoaded', function() {
    ensureAuthElements();
    initializeApp();
});

async function initializeApp() {
    // Check for persistent login
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        authState.username = storedUsername;
        sessionStorage.setItem("username", storedUsername);
        if (authElements.logoutBtn) authElements.logoutBtn.style.display = '';
        if (window.setFormInteractivity) setFormInteractivity(true);
        return;
    }
    // Always force login modal on load if not remembered
    authState.username = null;
    sessionStorage.removeItem("username");
    await showLoginModal();
}

async function getCsrfToken() {
    const response = await fetch(API_BASE + 'get_csrf_token.php', { credentials: 'include' });
    if (response.status === 401) throw new Error('Not authenticated');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    csrfToken = data.csrf_token || '';
    window.csrfToken = csrfToken;
    return csrfToken;
}

async function checkLogin() {
    if (!authState.username) {
        await showLoginModal();
        return true;
    }
    try {
        await getCsrfToken();
        if (typeof clearError === 'function') clearError();
        return true;
    } catch (err) {
        authState.username = null;
        sessionStorage.removeItem("username");
        await showLoginModal();
        if (typeof clearError === 'function') clearError();
        return true;
    }
}

async function showLoginModal() {
    return new Promise((resolve, reject) => {
        if (authElements.loginModal) {
            authElements.loginModal.classList.remove("hidden");
            authElements.loginModal.style.display = 'flex';
            authElements.loginModal.style.justifyContent = 'center';
            authElements.loginModal.style.alignItems = 'center';
            authElements.loginModal.style.position = 'fixed';
            authElements.loginModal.style.inset = '0';
            authElements.loginModal.style.background = 'rgba(0,0,0,0.35)';
            if (authElements.logoutBtn) authElements.logoutBtn.style.display = 'none';
            if (window.setFormInteractivity) setFormInteractivity(false);
        }
        if (typeof clearError === 'function') clearError();

        fetch(API_BASE + "get_users.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ init_token: "your_initial_token" })
        })
        .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
        .then(users => {
            if (users.error) throw new Error(users.error);
            if (authElements.loginUserSelect) {
                authElements.loginUserSelect.innerHTML = users.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join("");
            }
        })
        .catch(err => {
            console.error('Failed to load users:', err);
            showError("Failed to load users: " + err.message + ". You can also type a username.");
            // Create a fallback text input if not present
            if (authElements.loginModal && !document.getElementById('loginUserInput')) {
                const inputWrap = document.createElement('div');
                inputWrap.style.marginTop = '8px';
                inputWrap.innerHTML = `<input id="loginUserInput" type="text" placeholder="Enter username" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd" aria-label="Username" />`;
                // Insert after select or at end
                const content = authElements.loginModal.querySelector('.modal-content');
                const selectEl = authElements.loginModal.querySelector('#loginUserSelect');
                if (selectEl && selectEl.parentNode) {
                    selectEl.parentNode.insertBefore(inputWrap, selectEl.nextSibling);
                } else if (content) {
                    content.insertBefore(inputWrap, content.querySelector('#status') || null);
                }
            }
        });

        if (authElements.loginBtn) {
            authElements.loginBtn.onclick = async () => {
                const inputEl = document.getElementById('loginUserInput');
                const username = (authElements.loginUserSelect && authElements.loginUserSelect.value) || (inputEl && inputEl.value) || '';
                const stayLoggedIn = document.getElementById('stayLoggedIn')?.checked;
                if (!username) { showError("Please select a user"); return; }
                try {
                    const res = await fetch(API_BASE + "login_api.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username }),
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    if (data.success) {
                        authState.username = username;
                        sessionStorage.setItem("username", username);
                        if (stayLoggedIn) {
                            localStorage.setItem("username", username);
                        } else {
                            localStorage.removeItem("username");
                        }
                        csrfToken = data.csrf_token || csrfToken;
                        window.csrfToken = csrfToken;
                        authElements.loginModal.classList.add("hidden");
                        authElements.loginModal.style.display = 'none';
                        if (authElements.logoutBtn) authElements.logoutBtn.style.display = '';
                        if (window.setFormInteractivity) setFormInteractivity(true);
                        resolve();
                    } else {
                        showError(data.error || "Login failed");
                    }
                } catch (err) {
                    console.error('Login error:', err);
                    showError("Login error: " + err.message);
                }
            };
        }

        if (authElements.loginModal) {
        authElements.loginModal.onkeydown = e => {
                if (e.key === "Escape") {
            authElements.loginModal.classList.add("hidden");
            authElements.loginModal.style.display = 'none';
                    reject(new Error("Login cancelled"));
                }
            };
        }
    });
}

async function logout() {
    try {
        if (csrfToken) {
            try {
                await fetch(API_BASE + "logout.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ csrf_token: csrfToken }),
                    credentials: 'include'
                });
            } catch (_) {}
        }
    } finally {
        authState.username = null;
        sessionStorage.removeItem("username");
        localStorage.removeItem("username");
        csrfToken = '';
        window.csrfToken = csrfToken;
    }
    if (authElements.logoutBtn) authElements.logoutBtn.style.display = 'none';
    if (window.setFormInteractivity) setFormInteractivity(false);
    await showLoginModal();
}

function showError(msg) {
    if (authElements.status) {
        authElements.status.innerHTML = `<div class="status-message error">${escapeHtml(msg)}</div>`;
    } else {
        console.error("Error:", msg);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Expose functions
window.checkLogin = checkLogin;
window.showLoginModal = showLoginModal;
window.logout = logout;
window.getCsrfToken = getCsrfToken;
