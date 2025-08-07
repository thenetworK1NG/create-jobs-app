// Task creation functionality
class TaskCreator {
    constructor() {
        this.form = document.getElementById('taskForm');
        this.responseOutput = document.getElementById('responseOutput');
        this.createButton = document.getElementById('createTaskBtn');
        this.testCorsButton = document.getElementById('testCorsBtn');
        this.openServerButton = document.getElementById('openServerBtn');
        this.serverInstructions = document.getElementById('serverInstructions');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.testCorsButton.addEventListener('click', this.testCors.bind(this));
        this.openServerButton.addEventListener('click', this.showServerInstructions.bind(this));
        
        // Handle custom proxy URL visibility
        const corsProxySelect = document.getElementById('corsProxyUrl');
        const customProxyGroup = document.getElementById('customProxyGroup');
        
        corsProxySelect.addEventListener('change', () => {
            customProxyGroup.style.display = corsProxySelect.value === 'custom' ? 'block' : 'none';
        });
        
        this.displayMessage('Ready to create tasks. Fill in the form and click "Create Task".', 'info');
    }

    async testCors() {
        const apiUrl = document.getElementById('apiUrl').value;
        if (!apiUrl) {
            this.displayMessage('Please enter an API URL first.', 'error');
            return;
        }

        this.displayMessage('Testing CORS with a simple GET request...', 'loading');

        try {
            const response = await fetch(apiUrl, { method: 'GET' });
            this.displayMessage(`✅ CORS test successful! Status: ${response.status}`, 'success');
        } catch (error) {
            if (error.message.includes('CORS')) {
                this.displayMessage(`❌ CORS test failed: ${error.message}\n\nTry enabling "Use CORS Proxy" or serve from a local web server.`, 'error');
            } else {
                this.displayMessage(`❌ Network test failed: ${error.message}`, 'error');
            }
        }
    }

    showServerInstructions() {
        this.serverInstructions.style.display = this.serverInstructions.style.display === 'none' ? 'block' : 'none';
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        this.setLoading(true);
        
        try {
            const taskData = this.collectFormData();
            const result = await this.createTask(taskData);
            this.handleResponse(result);
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Get all form values
        data.useCorsProxy = document.getElementById('useCorsProxy').checked;
        data.corsProxyUrl = document.getElementById('corsProxyUrl').value;
        data.customProxyUrl = document.getElementById('customProxyUrl').value;
        data.apiUrl = document.getElementById('apiUrl').value;
        data.apiUsername = document.getElementById('apiUsername').value;
        data.apiPassword = document.getElementById('apiPassword').value;
        data.title = document.getElementById('title').value;
        data.projectId = parseInt(document.getElementById('projectId').value);
        data.colorId = document.getElementById('colorId').value;
        data.columnId = parseInt(document.getElementById('columnId').value);
        data.ownerId = parseInt(document.getElementById('ownerId').value);
        data.creatorId = parseInt(document.getElementById('creatorId').value) || 0;
        data.dateDue = document.getElementById('dateDue').value;
        data.description = document.getElementById('description').value;
        data.categoryId = parseInt(document.getElementById('categoryId').value) || 0;
        data.score = parseInt(document.getElementById('score').value) || 0;
        data.priority = document.getElementById('priority').value ? parseInt(document.getElementById('priority').value) : null;
        data.reference = document.getElementById('reference').value;
        data.tags = this.parseTags(document.getElementById('tags').value);
        data.dateStarted = document.getElementById('dateStarted').value;

        return data;
    }

    parseTags(tagsString) {
        if (!tagsString.trim()) return [];
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    async createTask(data) {
        const taskData = {
            jsonrpc: "2.0",
            method: "createTask",
            id: Date.now(),
            params: {
                title: data.title,
                project_id: data.projectId,
                color_id: data.colorId,
                column_id: data.columnId,
                owner_id: data.ownerId,
                creator_id: data.creatorId,
                date_due: data.dateDue,
                description: data.description,
                category_id: data.categoryId,
                score: data.score,
                swimlane_id: null,
                priority: data.priority,
                recurrence_status: 0,
                recurrence_trigger: 0,
                recurrence_factor: 0,
                recurrence_timeframe: 0,
                recurrence_basedate: 0,
                reference: data.reference,
                tags: data.tags,
                date_started: data.dateStarted
            }
        };

        // Determine the URL to use
        let targetUrl = data.apiUrl;
        let proxyUsed = 'None';
        
        if (data.useCorsProxy) {
            let proxyBaseUrl = data.corsProxyUrl;
            
            // Handle custom proxy URL
            if (proxyBaseUrl === 'custom') {
                proxyBaseUrl = data.customProxyUrl;
                if (!proxyBaseUrl) {
                    throw new Error('Custom proxy URL is required when "Custom" is selected');
                }
            }
            
            // Different proxy services have different URL formats
            if (proxyBaseUrl.includes('allorigins.win')) {
                targetUrl = `${proxyBaseUrl}${encodeURIComponent(data.apiUrl)}`;
                proxyUsed = 'AllOrigins';
            } else if (proxyBaseUrl.includes('corsproxy.io')) {
                targetUrl = `${proxyBaseUrl}${encodeURIComponent(data.apiUrl)}`;
                proxyUsed = 'CORSProxy.io';
            } else if (proxyBaseUrl.includes('codetabs.com')) {
                targetUrl = `${proxyBaseUrl}${encodeURIComponent(data.apiUrl)}`;
                proxyUsed = 'CodeTabs';
            } else {
                // Default format (like cors-anywhere)
                targetUrl = `${proxyBaseUrl}${data.apiUrl}`;
                proxyUsed = 'CORS Anywhere';
            }
        }

        // Encode credentials to base64
        const authHeader = 'Basic ' + btoa(`${data.apiUsername}:${data.apiPassword}`);

        this.displayMessage(`Sending request to: ${targetUrl}\nProxy: ${proxyUsed}`, 'loading');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        };

        // Add specific headers based on proxy service
        if (data.useCorsProxy) {
            headers['X-Requested-With'] = 'XMLHttpRequest';
            
            // Some proxies need additional headers
            if (proxyUsed === 'AllOrigins') {
                // AllOrigins doesn't support POST with custom headers well
                // We'll need to use a different approach for this service
                delete headers['Authorization'];
                this.displayMessage('Note: AllOrigins may not support authentication headers', 'loading');
            }
        }

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            // If proxy fails, suggest alternatives
            if (data.useCorsProxy && error.message.includes('403')) {
                throw new Error(`Proxy service failed (${proxyUsed}): ${error.message}\n\nTry:\n1. Different proxy service\n2. Local server setup\n3. Browser extension for CORS`);
            }
            throw error;
        }
    }

    handleResponse(result) {
        console.log("API Response:", result);

        let message = `API Response:\n${JSON.stringify(result, null, 2)}\n\n`;

        if (result.result !== false && result.result !== null && result.result !== undefined) {
            message += `✅ Task created successfully with ID: ${result.result}`;
            this.displayMessage(message, 'success');
        } else {
            message += `❌ Failed to create task.`;
            if (result.error) {
                message += `\nError: ${JSON.stringify(result.error, null, 2)}`;
            }
            this.displayMessage(message, 'error');
        }
    }

    handleError(error) {
        console.error("Request error:", error);
        
        let errorMessage = `❗ Request failed:\n${error.message}\n\n`;
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'This might be due to:\n';
            errorMessage += '• CORS policy restrictions\n';
            errorMessage += '• Invalid API URL\n';
            errorMessage += '• Network connectivity issues\n';
            errorMessage += '• API server being down\n\n';
            errorMessage += 'Try checking the browser console for more details.';
        }
        
        this.displayMessage(errorMessage, 'error');
    }

    displayMessage(message, type = 'info') {
        this.responseOutput.textContent = message;
        this.responseOutput.className = type;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.createButton.disabled = true;
            this.createButton.innerHTML = '<span class="spinner"></span>Creating Task...';
        } else {
            this.createButton.disabled = false;
            this.createButton.innerHTML = 'Create Task';
        }
    }
}

// Utility functions
const utils = {
    // Format date to YYYY-MM-DD format expected by the API
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    },

    // Validate form data before submission
    validateFormData(data) {
        const errors = [];

        if (!data.title.trim()) {
            errors.push('Task title is required');
        }

        if (!data.apiUrl.trim()) {
            errors.push('API URL is required');
        }

        if (!data.apiUsername.trim()) {
            errors.push('API Username is required');
        }

        if (!data.apiPassword.trim()) {
            errors.push('API Password/Token is required');
        }

        if (isNaN(data.projectId) || data.projectId <= 0) {
            errors.push('Valid Project ID is required');
        }

        if (isNaN(data.columnId) || data.columnId <= 0) {
            errors.push('Valid Column ID is required');
        }

        if (isNaN(data.ownerId) || data.ownerId <= 0) {
            errors.push('Valid Owner ID is required');
        }

        return errors;
    },

    // Save form data to localStorage
    saveFormData(data) {
        try {
            const dataToSave = { ...data };
            delete dataToSave.apiPassword; // Don't save password
            localStorage.setItem('taskCreatorFormData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save form data to localStorage:', error);
        }
    },

    // Load form data from localStorage
    loadFormData() {
        try {
            const savedData = localStorage.getItem('taskCreatorFormData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.warn('Could not load form data from localStorage:', error);
        }
        return null;
    },

    // Populate form with saved data
    populateForm(data) {
        if (!data) return;

        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element && data[key] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });
    }
};

// Enhanced TaskCreator with form persistence
class EnhancedTaskCreator extends TaskCreator {
    constructor() {
        super();
        this.loadSavedData();
    }

    loadSavedData() {
        const savedData = utils.loadFormData();
        if (savedData) {
            utils.populateForm(savedData);
        }
    }

    collectFormData() {
        const data = super.collectFormData();
        
        // Validate data
        const errors = utils.validateFormData(data);
        if (errors.length > 0) {
            throw new Error('Validation failed:\n' + errors.join('\n'));
        }

        // Save form data (excluding password)
        utils.saveFormData(data);

        return data;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedTaskCreator();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskCreator, utils };
}
