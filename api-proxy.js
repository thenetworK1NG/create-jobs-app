// api-proxy.js (CREATE)
// Minimal Kanboard JSON-RPC client using the same proxy + auth as WEBSITE

const createApiConfig = {
    apiProxyUrl: "https://maphefosigns.co.za/users/kanboard_proxy.php",
    defaultProjectId: 1
};

async function callKanboard(method, params = {}, _retryCount = 0) {
    // Ensure logged in first
    if (!window.authState || !window.authState.username) {
        await window.showLoginModal();
        if (_retryCount >= 2) throw new Error('Authentication failed after multiple attempts');
        return callKanboard(method, params, _retryCount + 1);
    }

    // Ensure CSRF token
    if (!window.csrfToken) {
        try { await window.getCsrfToken(); } catch (_) {}
    }

    const response = await fetch(createApiConfig.apiProxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': window.csrfToken || ''
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1,
            csrf_token: window.csrfToken || ''
        }),
        credentials: 'include'
    });

    if (response.status === 401) {
        window.authState.username = null;
        sessionStorage.removeItem('username');
        window.csrfToken = '';
        await window.showLoginModal();
        if (_retryCount >= 2) throw new Error('Authentication failed after multiple attempts');
        return callKanboard(method, params, _retryCount + 1);
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.error) {
        const msg = data.error.message || data.error;
        if (/Session expired|invalid user|401|403/i.test(msg)) {
            window.authState.username = null;
            sessionStorage.removeItem('username');
            window.csrfToken = '';
            await window.showLoginModal();
            if (_retryCount >= 2) throw new Error('Authentication failed after multiple attempts');
            return callKanboard(method, params, _retryCount + 1);
        }
        throw new Error(msg);
    }
    return data.result;
}

// High-level helper for task creation
async function createTaskKanboard(taskData) {
    // Normalize fields like WEBSITE api.js
    const data = { ...taskData };
    ["column_id", "owner_id", "category_id", "priority", "swimlane_id", "color_id", "score"].forEach(k => {
        if (data[k] === "" || data[k] === undefined || data[k] === null) delete data[k];
    });
    ["project_id", "column_id", "owner_id", "category_id", "priority", "swimlane_id", "score", "date_due"].forEach(k => {
        if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
            const n = Number(data[k]);
            if (!Number.isNaN(n)) data[k] = n;
        }
    });
    if (typeof data.tags === 'string') {
        const arr = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (arr.length === 0) delete data.tags; else data.tags = arr;
    }
    return await callKanboard('createTask', data);
}

// Accept the raw data shape used in CREATE/app.js and normalize here
async function createKanboardTaskFromApp(raw) {
    const data = {
        title: raw.title,
        project_id: raw.projectId,
        color_id: raw.colorId,
        column_id: raw.columnId,
        owner_id: raw.ownerId,
        creator_id: raw.creatorId,
        date_due: raw.dateDue,
        description: raw.description,
        category_id: raw.categoryId,
        score: raw.score,
        priority: raw.priority,
        reference: raw.reference,
        tags: raw.tags,
        date_started: raw.dateStarted
    };
    return await createTaskKanboard(data);
}

// Expose globals for module access
window.callKanboard = callKanboard;
window.createTaskKanboard = createTaskKanboard;
window.createKanboardTaskFromApp = createKanboardTaskFromApp;
