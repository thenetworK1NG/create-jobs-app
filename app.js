
// Patch: Refresh API color field on logout
const originalLogout = window.logout;
window.logout = async function() {
  await originalLogout();
  // Reset color field to default after logout
  const colorIdEl = document.getElementById('colorId');
  if (colorIdEl) colorIdEl.value = 'green';
};
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcxQLLka_eZ5tduUW3zEAKKdKMvebeXRI",
  authDomain: "job-card-8bb4b.firebaseapp.com",
  databaseURL: "https://job-card-8bb4b-default-rtdb.firebaseio.com",
  projectId: "job-card-8bb4b",
  storageBucket: "job-card-8bb4b.firebasestorage.app",
  messagingSenderId: "355622785459",
  appId: "1:355622785459:web:fc49655132c77fb9cbfbc6",
  measurementId: "G-T7EET4NRQR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById('jobCardForm').addEventListener('submit', function(e) {
    // Prevent submit if not logged in
    if (!window.authState || !window.authState.username) {
        e.preventDefault();
        if (typeof showLoginModal === 'function') showLoginModal();
        return;
    }
    e.preventDefault();
    // If an Order Number is provided, automatically launch on the board as well
    const orderNumberEl = document.getElementById('orderNumber');
    const hasOrderNumber = orderNumberEl && orderNumberEl.value && orderNumberEl.value.trim().length > 0;
    saveToJobCardSystem(!!hasOrderNumber);
});

// Main function to save job card data
function saveToJobCardSystem(shouldLaunchApiTask = false) {
    // Validate required fields
    const customerName = document.getElementById('customerName').value.trim();
  const assignedTo = window.authState && window.authState.username ? window.authState.username : '';
  // User mapping for API fields
  const userApiMap = {
    'Neil':    { ownerId: 9, creatorId: 9, colorId: 'blue' },
    'Yolandie':{ ownerId: 6, creatorId: 6, colorId: 'purple' },
    'Andre':   { ownerId: 15, creatorId: 15, colorId: 'green' },
    'Francois':{ ownerId: 2, creatorId: 2, colorId: 'yellow' }
  };
  const userConfig = userApiMap[assignedTo] || { ownerId: 1, creatorId: 0, colorId: 'green' };
    if (!customerName) {
        document.getElementById('status').textContent = 'Customer Name is required.';
        return;
    }
    
    // Show loading state on buttons
    setButtonsLoading(true, shouldLaunchApiTask);
    
    // Gather all form data
    const date = document.getElementById('date').value;
    const customerCell = document.getElementById('customerCell').value;
    const email = document.getElementById('email').value;
    const orderNumber = document.getElementById('orderNumber') ? document.getElementById('orderNumber').value.trim() : '';
    const jobTotal = document.getElementById('jobTotal').value;
    const deposit = document.getElementById('deposit').value;
    const balanceDue = document.getElementById('balanceDue').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const jobDueDate = document.getElementById('jobDueDate').value;
    
    // Collect tickbox values
    const getCheckedValues = (name) =>
        Array.from(document.querySelectorAll(`input[name='${name}[]']:checked`)).map(cb => cb.value);
    const stickers = getCheckedValues('stickers');
    const other = getCheckedValues('other');
    const banner_canvas = getCheckedValues('banner_canvas');
    const boards = getCheckedValues('boards');

    // Build payload
  const payload = {
    customerName,
    date,
    customerCell,
    email,
    ...(orderNumber ? { orderNumber } : {}),
    jobTotal,
    deposit,
    balanceDue,
    jobDescription,
    jobDueDate,
    assignedTo,
    stickers,
    other,
    banner_canvas,
    boards,
    // API task fields
    title: customerName,
    project_id: 1, // Set your default project_id or make dynamic if needed
    color_id: userConfig.colorId,
    column_id: parseInt(document.getElementById('boardColumn')?.value) || 2,
    owner_id: userConfig.ownerId,
    creator_id: userConfig.creatorId,
    date_due: jobDueDate ? formatDateTime(jobDueDate) : '',
    description: jobDescription,
    priority: parseInt(document.getElementById('taskPriority')?.value) || 1,
    // Add more fields as needed, e.g. category_id, score, etc.
    // Example:
    // category_id: 0,
    // score: 0,
    // swimlane_id: null,
    // recurrence_status: null,
    // recurrence_trigger: null,
    // recurrence_factor: null,
    // recurrence_timeframe: null,
    // recurrence_basedate: null,
    // reference: '',
    // tags: [],
    date_started: date ? formatDateTime(date) : ''
  };

  function formatDateTime(dateStr) {
    // Accepts 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DD HH:MM' and returns 'YYYY-MM-DD HH:MM'
    if (!dateStr) return '';
    let d = dateStr.replace('T', ' ');
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      d += ' 00:00';
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(d)) {
      d = d.slice(0, 16);
    }
    return d;
  }

    // If we're going to launch an API task, make sure API form fields are populated
    if (shouldLaunchApiTask) {
        try {
            // Set sensible fallbacks regardless of toggle visibility
            const apiTaskTitleEl = document.getElementById('apiTaskTitle');
            if (apiTaskTitleEl && !apiTaskTitleEl.value.trim()) {
                apiTaskTitleEl.value = customerName;
            }
            const apiDueDateEl = document.getElementById('dateDue');
            if (apiDueDateEl && jobDueDate) {
                apiDueDateEl.value = jobDueDate;
            }
        } catch (_) { /* non-fatal */ }
    }

    // Save to Firebase
    push(ref(database, 'jobCards'), payload)
    .then((firebaseRef) => {
        const successMessage = shouldLaunchApiTask ? 
            'Saved to Job Card System! Creating API task...' : 
            'Saved to Job Card System successfully!';
        document.getElementById('status').textContent = successMessage;
        
        writeLog({user: assignedTo, action: 'created', jobName: customerName});
        
        // Show assignment notification
        showAssignmentNotification(assignedTo);
        
        // If should launch API task, do it now and pass the Firebase reference
        if (shouldLaunchApiTask) {
            setTimeout(() => {
                launchApiTask(firebaseRef);
            }, 1000); // Small delay to show the Firebase success message
        } else {
            // Reset buttons and show reset icon for save-only
            setButtonsLoading(false, false);
            scrollToTop();
            showResetIcon();
        }
    })
    .catch((error) => {
        document.getElementById('status').textContent = 'Error: ' + error.message;
        setButtonsLoading(false, shouldLaunchApiTask);
    });
}

// Function to set loading state on buttons
function setButtonsLoading(isLoading, isLaunchButton) {
    const saveOnlyBtn = document.getElementById('saveOnlyBtn');
    const saveAndLaunchBtn = document.getElementById('saveAndLaunchBtn');
    
    // Debug logging
    console.log('setButtonsLoading called:', { isLoading, isLaunchButton, saveOnlyBtn: !!saveOnlyBtn, saveAndLaunchBtn: !!saveAndLaunchBtn });
    
    if (isLoading) {
        if (isLaunchButton) {
            if (saveOnlyBtn) saveOnlyBtn.disabled = true;
            if (saveAndLaunchBtn) {
                saveAndLaunchBtn.disabled = true;
                saveAndLaunchBtn.innerHTML = '<span class="spinner"></span>Saving and Launching...';
            }
        } else {
            if (saveOnlyBtn) {
                saveOnlyBtn.disabled = true;
                saveOnlyBtn.innerHTML = '<span class="spinner"></span>Saving...';
            }
            if (saveAndLaunchBtn) saveAndLaunchBtn.disabled = true;
        }
    } else {
        if (saveOnlyBtn) {
            saveOnlyBtn.disabled = false;
            saveOnlyBtn.innerHTML = 'Save to Job Card System';
        }
        if (saveAndLaunchBtn) {
            saveAndLaunchBtn.disabled = false;
            saveAndLaunchBtn.innerHTML = 'Save to Job Card System and Launch on Board';
        }
    }
}

// Function to launch API task
async function launchApiTask(firebaseRef = null) {
    try {
        // Update status to show API task creation
        document.getElementById('status').textContent = 'Job card saved! Now creating API task...';
        
        // Create API task manually using the TaskCreator and pass Firebase reference
        await createApiTaskManually(firebaseRef);
        
    } catch (error) {
        console.error('Error launching API task:', error);
        document.getElementById('status').textContent = 'Job card saved, but API task creation failed: ' + error.message;
        setButtonsLoading(false, true);
        scrollToTop();
        showResetIcon();
    }
}

// Manual API task creation as fallback
async function createApiTaskManually(firebaseRef = null) {
    try {
        // Create a new TaskCreator instance
        const taskCreator = new TaskCreator();
        
        // Check if the API form exists, if not, we have the data from the main form
    if (!taskCreator.form) {
            // Manually collect the data for API task creation
            const data = {
        // proxy-based flow: credentials handled server-side
        useCorsProxy: false,
        corsProxyUrl: '',
        apiUrl: '',
    // Deprecated: api credentials are no longer used client-side
    apiUsername: '',
    apiPassword: '',
                title: document.getElementById('apiTaskTitle') ? document.getElementById('apiTaskTitle').value : 'New Task',
                projectId: document.getElementById('projectId') ? parseInt(document.getElementById('projectId').value) : 1,
                colorId: document.getElementById('colorId') ? document.getElementById('colorId').value : 'green',
                columnId: document.getElementById('columnId') ? parseInt(document.getElementById('columnId').value) : 2,
                ownerId: document.getElementById('ownerId') ? parseInt(document.getElementById('ownerId').value) : 1,
                creatorId: document.getElementById('creatorId') ? parseInt(document.getElementById('creatorId').value) : 0,
                dateDue: document.getElementById('dateDue') ? document.getElementById('dateDue').value : '',
                description: document.getElementById('apiTaskDescription') ? document.getElementById('apiTaskDescription').value : '',
                categoryId: document.getElementById('categoryId') ? parseInt(document.getElementById('categoryId').value) : 0,
                score: document.getElementById('score') ? parseInt(document.getElementById('score').value) : 0,
                priority: document.getElementById('priority') && document.getElementById('priority').value ? parseInt(document.getElementById('priority').value) : null,
                reference: document.getElementById('reference') ? document.getElementById('reference').value : '',
                tags: [],
                dateStarted: document.getElementById('dateStarted') ? document.getElementById('dateStarted').value : ''
            };
            
            // Create the task using server proxy only
            const result = await taskCreator.createTask(data);
            
            if (result.result !== false && result.result !== null && result.result !== undefined) {
                // Update Firebase with the task ID if we have a Firebase reference
                if (firebaseRef) {
                    try {
                        await update(firebaseRef, { apiTaskId: result.result });
                        console.log('Firebase job updated with API task ID:', result.result);
                    } catch (error) {
                        console.error('Failed to update Firebase with task ID:', error);
                    }
                }
                
                document.getElementById('status').textContent = `✅ Job card saved and API task created successfully! Task ID: ${result.result}`;
            } else {
                document.getElementById('status').textContent = 'Job card saved, but API task creation failed.';
                if (result.error) {
                    console.error('API Error:', result.error);
                }
            }
        } else {
            // Use the existing form data collection method
            const taskData = taskCreator.collectFormData();
            // Proxy-based only; no client credentials
            taskData.useCorsProxy = false;
            const result = await taskCreator.createTask(taskData);
            
            if (result.result !== false && result.result !== null && result.result !== undefined) {
                // Update Firebase with the task ID if we have a Firebase reference
                if (firebaseRef) {
                    try {
                        await update(firebaseRef, { apiTaskId: result.result });
                        console.log('Firebase job updated with API task ID:', result.result);
                    } catch (error) {
                        console.error('Failed to update Firebase with task ID:', error);
                    }
                }
                
                document.getElementById('status').textContent = `✅ Job card saved and API task created successfully! Task ID: ${result.result}`;
            } else {
                document.getElementById('status').textContent = 'Job card saved, but API task creation failed.';
                if (result.error) {
                    console.error('API Error:', result.error);
                }
            }
        }
    } catch (error) {
        console.error('Error in createApiTaskManually:', error);
        document.getElementById('status').textContent = 'Job card saved, but API task creation failed: ' + error.message;
    } finally {
        // Always reset the button states and show completion actions
        setButtonsLoading(false, true);
        scrollToTop();
        showResetIcon();
    }
}

// Add log writing function (same as in view-jobs.js)
function writeLog({user, action, jobName, details}) {
    const logRef = ref(database, 'logs');
    const entry = {
        timestamp: Date.now(),
        user: user || '—',
        action,
        jobName: jobName || '—',
        details: details || ''
    };
    push(logRef, entry);
}

// Function to show assignment notification
function showAssignmentNotification(assignedName) {
    const notification = document.getElementById('assignmentNotification');
    const assignedNameElement = document.getElementById('assignedName');
    const notificationContent = notification.querySelector('.notification-content');
    
    if (notification && assignedNameElement && notificationContent) {
        // Remove any existing color classes
        notificationContent.classList.remove('yolandie', 'francois', 'andre', 'neil');
        
        // Add the appropriate color class based on the assigned person
        const lowerName = assignedName.toLowerCase();
        if (lowerName === 'yolandie') {
            notificationContent.classList.add('yolandie');
        } else if (lowerName === 'francois') {
            notificationContent.classList.add('francois');
        } else if (lowerName === 'andre') {
            notificationContent.classList.add('andre');
        } else if (lowerName === 'neil') {
            notificationContent.classList.add('neil');
        }
        
        // Set the assigned name
        assignedNameElement.textContent = assignedName;
        
        // Show the notification
        notification.classList.add('show');
        
        // Hide the notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Function to scroll to top of the form
function scrollToTop() {
    const container = document.querySelector('.container');
    if (container) {
        container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Function to show reset icon
function showResetIcon() {
    const saveLoadControls = document.getElementById('save-load-controls');
    if (saveLoadControls) {
        // Create reset icon if it doesn't exist
        let resetIcon = document.getElementById('resetIcon');
        if (!resetIcon) {
            resetIcon = document.createElement('button');
            resetIcon.id = 'resetIcon';
            resetIcon.className = 'reset-icon';
            resetIcon.setAttribute('aria-label', 'Reset Form');
            resetIcon.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
            `;
            resetIcon.addEventListener('click', resetForm);
            
            // Insert after the save menu button
            const saveMenuBtn = document.getElementById('saveMenuBtn');
            if (saveMenuBtn) {
                saveMenuBtn.parentNode.insertBefore(resetIcon, saveMenuBtn.nextSibling);
            } else {
                saveLoadControls.appendChild(resetIcon);
            }
        }
        
        // Show the reset icon
        resetIcon.style.display = 'flex';
        resetIcon.classList.add('show');
    }
}

// Function to reset the form
function resetForm() {
    const form = document.getElementById('jobCardForm');
    if (form) {
        form.reset();
        
        // Uncheck all checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear status
        const status = document.getElementById('status');
        if (status) {
            status.textContent = '';
        }
        
        // Hide reset icon
        const resetIcon = document.getElementById('resetIcon');
        if (resetIcon) {
            resetIcon.classList.remove('show');
            setTimeout(() => {
                resetIcon.style.display = 'none';
            }, 300);
        }
        
    // Also clear the API Task Description to keep both fields in sync
    const apiTaskDescriptionEl = document.getElementById('apiTaskDescription');
    if (apiTaskDescriptionEl) {
      apiTaskDescriptionEl.value = '';
    }
    // Also clear the API Due Date to keep fields in sync
    const apiDateDueEl = document.getElementById('dateDue');
    if (apiDateDueEl) apiDateDueEl.value = '';
  // Also clear the API Start Date to keep fields in sync
  const apiDateStartedEl = document.getElementById('dateStarted');
  if (apiDateStartedEl) apiDateStartedEl.value = '';
        
        // Show confirmation
        showResetConfirmation();
    }
}

// Function to show reset confirmation
function showResetConfirmation() {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = 'Form reset successfully!';
        status.classList.add('visible');
        setTimeout(() => {
            status.classList.remove('visible');
            status.textContent = '';
        }, 2000);
    }
}

// Keep API Task Description synced with Job Description as the user types
function setupDescriptionMirroring() {
  const jobDesc = document.getElementById('jobDescription');
  const apiDesc = document.getElementById('apiTaskDescription');
  if (!jobDesc || !apiDesc) return;

  // Initialize API description with current job description
  apiDesc.value = jobDesc.value || '';

  // Mirror on every input
  jobDesc.addEventListener('input', () => {
    apiDesc.value = jobDesc.value;
  });
}

// Example user data object (replace with your actual data structure)
let userData = {
  name: '',
  progress: 0,
  notes: ''
};

// Function to gather form data into userData
function gatherFormData() {
  const form = document.getElementById('jobCardForm');
  const getCheckedValues = (name) =>
    Array.from(document.querySelectorAll(`input[name='${name}[]']:checked`)).map(cb => cb.value);
  return {
    customerName: form.customerName.value,
    date: form.date.value,
    customerCell: form.customerCell.value,
    email: form.email.value,
    orderNumber: form.orderNumber ? form.orderNumber.value : '',
    jobTotal: form.jobTotal.value,
    deposit: form.deposit.value,
    balanceDue: form.balanceDue.value,
    jobDescription: form.jobDescription.value,
    jobDueDate: form.jobDueDate.value,
    assignedTo: form.assignedTo.value,
    stickers: getCheckedValues('stickers'),
    other: getCheckedValues('other'),
    banner_canvas: getCheckedValues('banner_canvas'),
    boards: getCheckedValues('boards')
  };
}

// Function to fill form fields from userData
function fillFormFromData(data) {
  const form = document.getElementById('jobCardForm');
  if (!form) return;
  form.customerName.value = data.customerName || '';
  form.date.value = data.date || '';
  form.customerCell.value = data.customerCell || '';
  form.email.value = data.email || '';
    if (form.orderNumber) form.orderNumber.value = data.orderNumber || '';
  form.jobTotal.value = data.jobTotal || '';
  form.deposit.value = data.deposit || '';
  form.balanceDue.value = data.balanceDue || '';
  form.jobDescription.value = data.jobDescription || '';
  // Keep API Task Description in sync when loading data
  const apiTaskDescriptionEl = document.getElementById('apiTaskDescription');
  if (apiTaskDescriptionEl) apiTaskDescriptionEl.value = data.jobDescription || '';
  form.jobDueDate.value = data.jobDueDate || '';
  // Also populate the API dateDue field so API form reflects the loaded due date
  const apiDateDueEl = document.getElementById('dateDue');
  if (apiDateDueEl) apiDateDueEl.value = data.jobDueDate || '';
  // Populate the API Start Date from the main Date field
  form.date.value = data.date || '';
  const apiDateStartedEl = document.getElementById('dateStarted');
  if (apiDateStartedEl) apiDateStartedEl.value = data.date || '';
  form.assignedTo.value = data.assignedTo || '';
  // Uncheck all checkboxes first
  ['stickers','other','banner_canvas','boards'].forEach(name => {
    document.querySelectorAll(`input[name='${name}[]']`).forEach(cb => {
      cb.checked = false;
    });
    (data[name] || []).forEach(val => {
      const cb = Array.from(document.querySelectorAll(`input[name='${name}[]']`)).find(cb => cb.value === val);
      if (cb) cb.checked = true;
    });
  });
}

// Mirror the Job Due Date and API Due Date fields both ways
function setupDueDateMirroring() {
  const jobDueEl = document.getElementById('jobDueDate');
  const apiDueEl = document.getElementById('dateDue');
  if (!jobDueEl && !apiDueEl) return;

  // When job due changes, update API due
  if (jobDueEl) {
    jobDueEl.addEventListener('input', () => {
      try {
        if (apiDueEl) apiDueEl.value = jobDueEl.value;
      } catch (e) { /* non-fatal */ }
    });
  }

  // If API due changed manually, reflect it back to job due
  if (apiDueEl) {
    apiDueEl.addEventListener('input', () => {
      try {
        if (jobDueEl) jobDueEl.value = apiDueEl.value;
      } catch (e) { /* non-fatal */ }
    });
  }
}

// Mirror the main Date field and the API Start Date field both ways
function setupStartDateMirroring() {
  const mainDateEl = document.getElementById('date');
  const apiStartEl = document.getElementById('dateStarted');
  if (!mainDateEl && !apiStartEl) return;

  if (mainDateEl) {
    mainDateEl.addEventListener('input', () => {
      try {
        if (apiStartEl) apiStartEl.value = mainDateEl.value;
      } catch (e) { /* non-fatal */ }
    });
  }

  if (apiStartEl) {
    apiStartEl.addEventListener('input', () => {
      try {
        if (mainDateEl) mainDateEl.value = apiStartEl.value;
      } catch (e) { /* non-fatal */ }
    });
  }
}

// Update saveUserData to gather form data
function saveUserData() {
  userData = gatherFormData();
  let filename = prompt('Enter a name for your save file:', 'user-save');
  if (!filename) filename = 'user-save';
  if (!filename.endsWith('.json')) filename += '.json';
  const dataStr = JSON.stringify(userData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Update loadUserDataFromFile to fill form
function loadUserDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const loadedData = JSON.parse(e.target.result);
      userData = loadedData;
      fillFormFromData(userData);
      alert('Progress loaded!');
    } catch (err) {
      alert('Failed to load file: Invalid format.');
    }
  };
  reader.readAsText(file);
}

// Function to setup assignment-based auto-fill for API fields
// Assignment auto-fill is no longer needed since assignment is based on logged-in user.
function setupAssignmentAutoFill() { return; }

// Function to show auto-fill notification
function showAssignmentAutoFillNotification(personName) {
    // Create or get notification element
    let notification = document.getElementById('autoFillNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'autoFillNotification';
        notification.className = 'auto-fill-notification';
        notification.innerHTML = `
            <div class="auto-fill-content">
                <div class="auto-fill-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="auto-fill-text">
                    <span class="auto-fill-title">API FIELDS UPDATED</span>
                    <span class="auto-fill-person" id="autoFillPersonName"></span>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
    }
    
    const personNameElement = document.getElementById('autoFillPersonName');
    if (personNameElement) {
        personNameElement.textContent = `Configured for ${personName}`;
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Auto-scroll functionality for form inputs
function setupAutoScroll() {
  // Get all focusable elements in the form
  const focusableElements = document.querySelectorAll('#jobCardForm input, #jobCardForm textarea, #jobCardForm select, #jobCardForm button, #jobCardForm input[type="checkbox"]');
  
  focusableElements.forEach(element => {
    element.addEventListener('focus', function() {
      // Add a small delay to ensure the focus is fully established
      setTimeout(() => {
        // Get the element's position relative to the viewport
        const rect = element.getBoundingClientRect();
        const container = document.querySelector('.container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate if the element is outside the visible area or not centered
        const isAbove = rect.top < containerRect.top + 100; // 100px buffer from top
        const isBelow = rect.bottom > containerRect.bottom - 100; // 100px buffer from bottom
        const isNotCentered = Math.abs(rect.top + rect.height/2 - (containerRect.top + containerRect.height/2)) > 50; // 50px tolerance for center
        
        if (isAbove || isBelow || isNotCentered) {
          // Center the element in the viewport
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // This centers the element vertically
            inline: 'center' // This centers the element horizontally
          });
        }
        
        // Add visual feedback for the focused element
        element.classList.add('focused');
        setTimeout(() => {
          element.classList.remove('focused');
        }, 1000);
      }, 50);
    });
    
    // Handle blur event
    element.addEventListener('blur', function() {
      this.classList.remove('focused');
    });
  });
  
  // Handle keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      // Add a small delay to allow the focus to change before scrolling
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('#jobCardForm')) {
          const rect = activeElement.getBoundingClientRect();
          const container = document.querySelector('.container');
          const containerRect = container.getBoundingClientRect();
          
          // Check if element is centered
          const isCentered = Math.abs(rect.top + rect.height/2 - (containerRect.top + containerRect.height/2)) < 50;
          
          if (!isCentered) {
            activeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center', // Center vertically
              inline: 'center' // Center horizontally
            });
          }
        }
      }, 10);
    }
  });
}

// Enhanced tab navigation with visual feedback
function setupEnhancedTabNavigation() {
  const focusableElements = document.querySelectorAll('#jobCardForm input, #jobCardForm textarea, #jobCardForm select, #jobCardForm button, #jobCardForm input[type="checkbox"]');
  
  focusableElements.forEach(element => {
    // Add focus styles
    element.addEventListener('focus', function() {
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#a084ee';
      this.style.outline = `2px solid ${primaryColor}`;
      this.style.outlineOffset = '2px';
      this.style.boxShadow = '0 0 0 3px var(--theme-shadow, rgba(160, 132, 238, 0.2))';
      
      // Add a subtle animation for better visual feedback
      this.style.transform = 'scale(1.02)';
      this.style.transition = 'transform 0.2s ease';
    });
    
    element.addEventListener('blur', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
      this.style.boxShadow = '';
      this.style.transform = 'scale(1)';
    });
  });
}

// Function to handle form section highlighting
function setupSectionHighlighting() {
  const formSections = document.querySelectorAll('.form-section');
  
  formSections.forEach(section => {
    const inputs = section.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#a084ee';
        section.style.borderLeft = `4px solid ${primaryColor}`;
        section.style.boxShadow = '0 4px 16px var(--theme-shadow, rgba(160, 132, 238, 0.15))';
        section.style.transition = 'all 0.3s ease';
      });
      
      input.addEventListener('blur', function() {
        // Check if any other input in this section is focused
        const hasFocus = Array.from(inputs).some(input => input === document.activeElement);
        if (!hasFocus) {
          const computedStyle = getComputedStyle(document.documentElement);
          const primaryColor = computedStyle.getPropertyValue('--theme-primary').trim() || '#a084ee';
          section.style.borderLeft = `4px solid ${primaryColor}33`;
          section.style.boxShadow = '0 2px 8px var(--theme-shadow, rgba(160, 132, 238, 0.06))';
        }
      });
    });
  });
}

// Function to ensure optimal centering
function ensureOptimalCentering() {
  const container = document.querySelector('.container');
  const body = document.body;
  
  // Ensure the container is centered on the page
  if (container) {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
  }
  
  // Ensure the body maintains center alignment
  body.style.display = 'flex';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';
  body.style.minHeight = '100vh';
}

// Set up event listeners for save/load buttons
window.addEventListener('DOMContentLoaded', function() {
  // Keyboard shortcut to show API Integration button (Ctrl+Shift+A)
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const apiToggleContainer = document.getElementById('apiToggleContainer');
      if (apiToggleContainer) {
        const isHidden = apiToggleContainer.style.display === 'none';
        apiToggleContainer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          apiToggleContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  });

  // Helper to set API color field to user-mapped color
  function setApiColorForUser() {
    const assignedTo = window.authState && window.authState.username ? window.authState.username : '';
    const userApiMap = {
      'Neil':    { colorId: 'blue' },
      'Yolandie':{ colorId: 'purple' },
      'Andre':   { colorId: 'green' },
      'Francois':{ colorId: 'yellow' }
    };
    const userConfig = userApiMap[assignedTo] || { colorId: 'green' };
    const colorIdEl = document.getElementById('colorId');
    if (colorIdEl) colorIdEl.value = userConfig.colorId;
  }
  // Initialize the Enhanced Task Creator and store reference
  window.enhancedTaskCreatorInstance = new EnhancedTaskCreator();
  
  // Add event listener for the "Save and Launch" button
  const saveAndLaunchBtn = document.getElementById('saveAndLaunchBtn');
  if (saveAndLaunchBtn) {
    console.log('Save and Launch button found, adding event listener');
    saveAndLaunchBtn.addEventListener('click', function() {
      console.log('Save and Launch button clicked');
      saveToJobCardSystem(true); // Save and launch API task
    });
  } else {
    console.log('Save and Launch button not found');
  }
  
  // Add event listener for the API Toggle button
  const toggleApiBtn = document.getElementById('toggleApiBtn');
  if (toggleApiBtn) {
    toggleApiBtn.addEventListener('click', function() {
      const demoSection = document.getElementById('demoFeaturesSection');
      if (demoSection) {
        const isHidden = demoSection.style.display === 'none';
        demoSection.style.display = isHidden ? 'block' : 'none';
        // Set color field to user-mapped color when showing
        if (isHidden) setApiColorForUser();
        // Update button text
        this.textContent = isHidden ? 'Hide API Integration' : 'Show API Integration';
        // Scroll to the section if showing it
        if (isHidden) {
          setTimeout(() => {
            demoSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
        }
      }
    });
  }
  // Set color field on load (in case API section is already visible)
  setApiColorForUser();
  
  // Setup assignment-based API field auto-population
  setupAssignmentAutoFill();
  
  // Setup auto-scroll functionality
  setupAutoScroll();
  setupEnhancedTabNavigation();
  setupSectionHighlighting();
  // Live mirror Job Description -> API Task Description
  setupDescriptionMirroring();
  // Mirror due date fields between main form and API form
  setupDueDateMirroring();
  // Mirror main Date <-> API Start Date
  setupStartDateMirroring();
  
  // Ensure optimal centering setup
  ensureOptimalCentering();
  
  // Sparkle effect for checkboxes (enhanced)
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    // Only wrap if not already wrapped
    if (!cb.parentElement.classList.contains('sparkle-checkbox')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'sparkle-checkbox';
      cb.parentElement.insertBefore(wrapper, cb);
      wrapper.appendChild(cb);
      // Move label text if present
      if (cb.nextSibling) {
        wrapper.appendChild(cb.nextSibling);
      }
      // Add sparkle span
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      // Add 5 dots for multi-sparkle
      for (let i = 1; i <= 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'sparkle-dot dot' + i;
        sparkle.appendChild(dot);
      }
      wrapper.appendChild(sparkle);
    }
  });
  // Animate sparkle and pop on check
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
      if (cb.checked) {
        const wrapper = cb.parentElement;
        const sparkle = wrapper.querySelector('.sparkle');
        if (sparkle) {
          sparkle.classList.remove('sparkle-animate');
          void sparkle.offsetWidth;
          sparkle.classList.add('sparkle-animate');
        }
        // Pop effect
        wrapper.classList.remove('pop');
        void wrapper.offsetWidth;
        wrapper.classList.add('pop');
        setTimeout(() => wrapper.classList.remove('pop'), 400);
      }
    });
  });

  // Save icon pulse effect
  const saveMenuBtn = document.getElementById('saveMenuBtn');
  const saveLoadMenu = document.getElementById('saveLoadMenu');
  const saveIcon = document.getElementById('saveIcon');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const loadInput = document.getElementById('loadInput');
  const status = document.getElementById('status');

  if (saveMenuBtn && saveLoadMenu && saveIcon) {
    saveMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Bounce and pulse icon
      saveIcon.classList.remove('bounce');
      saveMenuBtn.classList.remove('pulse');
      void saveIcon.offsetWidth;
      void saveMenuBtn.offsetWidth;
      saveIcon.classList.add('bounce');
      saveMenuBtn.classList.add('pulse');
      // Animate menu
      if (saveLoadMenu.style.display === 'none' || saveLoadMenu.style.display === '') {
        saveLoadMenu.style.display = 'block';
        saveLoadMenu.classList.remove('animated-out');
        saveLoadMenu.classList.add('animated-in');
      } else {
        saveLoadMenu.classList.remove('animated-in');
        saveLoadMenu.classList.add('animated-out');
        setTimeout(() => { saveLoadMenu.style.display = 'none'; }, 220);
      }
    });
    // Hide menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!saveLoadMenu.contains(e.target) && e.target !== saveMenuBtn) {
        if (saveLoadMenu.style.display === 'block') {
          saveLoadMenu.classList.remove('animated-in');
          saveLoadMenu.classList.add('animated-out');
          setTimeout(() => { saveLoadMenu.style.display = 'none'; }, 220);
        }
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      saveUserData();
      saveLoadMenu.classList.remove('animated-in');
      saveLoadMenu.classList.add('animated-out');
      setTimeout(() => { saveLoadMenu.style.display = 'none'; }, 220);
    });
  }
  if (loadBtn && loadInput) {
    loadBtn.addEventListener('click', function(e) {
      loadInput.click();
      saveLoadMenu.classList.remove('animated-in');
      saveLoadMenu.classList.add('animated-out');
      setTimeout(() => { saveLoadMenu.style.display = 'none'; }, 220);
    });
    loadInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        loadUserDataFromFile(e.target.files[0]);
      }
    });
  }

  // Animate status message
  function showStatus(msg) {
    if (!status) return;
    status.textContent = msg;
    status.classList.add('visible');
    setTimeout(() => {
      status.classList.remove('visible');
    }, 2200);
  }

  // Add event listener for Office View Home button
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', function() {
      window.open('https://thenetwork1ng.github.io/Office-view/', '_blank');
    });
  }
});

// Note: You must include the Firebase JS SDK in your HTML before this script:
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

// Task creation functionality from demo
class TaskCreator {
    constructor() {
        this.form = document.getElementById('apiTaskForm');
        this.responseOutput = document.getElementById('responseOutput');
        this.createButton = document.getElementById('createTaskBtn');
        this.testCorsButton = document.getElementById('testCorsBtn');
        this.openServerButton = document.getElementById('openServerBtn');
        this.serverInstructions = document.getElementById('serverInstructions');
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.testCorsButton.addEventListener('click', this.testCors.bind(this));
        this.openServerButton.addEventListener('click', this.showServerInstructions.bind(this));
        
        // No need for custom proxy URL visibility handling since we only have CORSProxy.io
        
        this.displayMessage('Ready to create tasks. Fill in the form and click "Create API Task".', 'info');
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
        const data = {};

        // Get all form values with null checks
        const useCorsProxyEl = document.getElementById('useCorsProxy');
        const corsProxyUrlEl = document.getElementById('corsProxyUrl');
        const apiUrlEl = document.getElementById('apiUrl');
    // Deprecated inputs removed: apiUsername/apiPassword are not used client-side
        const apiTaskTitleEl = document.getElementById('apiTaskTitle');
        const projectIdEl = document.getElementById('projectId');
        const colorIdEl = document.getElementById('colorId');
        const columnIdEl = document.getElementById('columnId');
        const ownerIdEl = document.getElementById('ownerId');
        const creatorIdEl = document.getElementById('creatorId');
        const dateDueEl = document.getElementById('dateDue');
        const apiTaskDescriptionEl = document.getElementById('apiTaskDescription');
        const categoryIdEl = document.getElementById('categoryId');
        const scoreEl = document.getElementById('score');
        const priorityEl = document.getElementById('priority');
        const referenceEl = document.getElementById('reference');
        const tagsEl = document.getElementById('tags');
        const dateStartedEl = document.getElementById('dateStarted');

        data.useCorsProxy = useCorsProxyEl ? useCorsProxyEl.checked : true;
        data.corsProxyUrl = corsProxyUrlEl ? corsProxyUrlEl.value : 'https://corsproxy.io/?';
        data.apiUrl = apiUrlEl ? apiUrlEl.value : '';
    // Do not include API credentials in client-side payload
        data.title = apiTaskTitleEl ? apiTaskTitleEl.value : '';
        data.projectId = projectIdEl ? parseInt(projectIdEl.value) : 1;
        data.colorId = colorIdEl ? colorIdEl.value : 'green';
        data.columnId = columnIdEl ? parseInt(columnIdEl.value) : 2;
        data.ownerId = ownerIdEl ? parseInt(ownerIdEl.value) : 1;
        data.creatorId = creatorIdEl ? parseInt(creatorIdEl.value) || 0 : 0;
        data.dateDue = dateDueEl ? dateDueEl.value : '';
        data.description = apiTaskDescriptionEl ? apiTaskDescriptionEl.value : '';
        data.categoryId = categoryIdEl ? parseInt(categoryIdEl.value) || 0 : 0;
        data.score = scoreEl ? parseInt(scoreEl.value) || 0 : 0;
        data.priority = priorityEl && priorityEl.value ? parseInt(priorityEl.value) : null;
        data.reference = referenceEl ? referenceEl.value : '';
        data.tags = tagsEl ? this.parseTags(tagsEl.value) : [];
        data.dateStarted = dateStartedEl ? dateStartedEl.value : '';

        return data;
    }

    parseTags(tagsString) {
        if (!tagsString.trim()) return [];
        return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    async createTask(data) {
        // If WEBSITE-style auth is present, ensure login first and use proxy client
        try {
            if (typeof checkLogin === 'function') {
                await checkLogin();
            }
        } catch (e) {
            throw new Error('Login required to create tasks.');
        }

        // Proxy flow (no API specifics here)
        if (typeof createKanboardTaskFromApp === 'function') {
            const resultId = await createKanboardTaskFromApp(data);
            return { jsonrpc: '2.0', result: resultId, id: Date.now() };
        }
        throw new Error('Server proxy not available. Please ensure api-proxy.js is loaded.');
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
            this.createButton.innerHTML = 'Create API Task';
        }
    }
}

// Utility functions
const apiUtils = {
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

    // Credentials/url not required in proxy mode

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
    saveApiFormData(data) {
        try {
            const dataToSave = { ...data };
            delete dataToSave.apiPassword; // Don't save password
            localStorage.setItem('taskCreatorFormData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save form data to localStorage:', error);
        }
    },

    // Load form data from localStorage
    loadApiFormData() {
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
    populateApiForm(data) {
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
        if (this.form) {
            this.loadSavedData();
        }
    }

    loadSavedData() {
        const savedData = apiUtils.loadApiFormData();
        if (savedData) {
            apiUtils.populateApiForm(savedData);
        }
    }

    collectFormData() {
        const data = super.collectFormData();
        
        // Validate data
        const errors = apiUtils.validateFormData(data);
        if (errors.length > 0) {
            throw new Error('Validation failed:\n' + errors.join('\n'));
        }

        // Save form data (excluding password)
        apiUtils.saveApiFormData(data);

        return data;
    }
} 