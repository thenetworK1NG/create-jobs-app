// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
    e.preventDefault();
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        document.getElementById('status').textContent = 'Customer Name is required.';
        return;
    }
    // Show assignment modal
    document.getElementById('assignModal').style.display = 'flex';
});

// Assignment modal logic
const assignModal = document.getElementById('assignModal');
const closeAssignModalBtn = document.getElementById('closeAssignModalBtn');
const assignToSelect = document.getElementById('assignToSelect');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');

closeAssignModalBtn.addEventListener('click', () => {
    assignModal.style.display = 'none';
});

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

confirmAssignBtn.addEventListener('click', () => {
    const assignedTo = assignToSelect.value;
    if (!assignedTo) {
        assignToSelect.style.border = '2px solid #b23c3c';
        return;
    }
    assignToSelect.style.border = '';
    assignModal.style.display = 'none';
    // Gather all form data
    const customerName = document.getElementById('customerName').value.trim();
    const date = document.getElementById('date').value;
    const customerCell = document.getElementById('customerCell').value;
    const email = document.getElementById('email').value;
    const jobTotal = document.getElementById('jobTotal').value;
    const deposit = document.getElementById('deposit').value;
    const balanceDue = document.getElementById('balanceDue').value;
    const jobDescription = document.getElementById('jobDescription').value;
    // Collect tickbox values
    const getCheckedValues = (name) =>
        Array.from(document.querySelectorAll(`input[name='${name}[]']:checked`)).map(cb => cb.value);
    const stickers = getCheckedValues('stickers');
    const other = getCheckedValues('other');
    const banner_canvas = getCheckedValues('banner_canvas');
    const boards = getCheckedValues('boards');

    push(ref(database, 'jobCards'), {
        customerName,
        date,
        customerCell,
        email,
        jobTotal,
        deposit,
        balanceDue,
        jobDescription,
        assignedTo,
        stickers,
        other,
        banner_canvas,
        boards
    })
    .then(() => {
        document.getElementById('status').textContent = 'Saved successfully!';
        writeLog({user: assignedTo, action: 'created', jobName: customerName});
        
        // Show assignment notification
        showAssignmentNotification(assignedTo);
        
        // Scroll to top of the form (but don't clear)
        scrollToTop();
        
        // Show reset icon
        showResetIcon();
    })
    .catch((error) => {
        document.getElementById('status').textContent = 'Error: ' + error.message;
    });
});

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
    jobTotal: form.jobTotal.value,
    deposit: form.deposit.value,
    balanceDue: form.balanceDue.value,
    jobDescription: form.jobDescription.value,
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
  form.jobTotal.value = data.jobTotal || '';
  form.deposit.value = data.deposit || '';
  form.balanceDue.value = data.balanceDue || '';
  form.jobDescription.value = data.jobDescription || '';
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
      this.style.outline = '2px solid #a084ee';
      this.style.outlineOffset = '2px';
      this.style.boxShadow = '0 0 0 3px rgba(160, 132, 238, 0.2)';
      
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
        section.style.borderLeft = '4px solid #a084ee';
        section.style.boxShadow = '0 4px 16px rgba(160, 132, 238, 0.15)';
        section.style.transition = 'all 0.3s ease';
      });
      
      input.addEventListener('blur', function() {
        // Check if any other input in this section is focused
        const hasFocus = Array.from(inputs).some(input => input === document.activeElement);
        if (!hasFocus) {
          section.style.borderLeft = '4px solid #a084ee33';
          section.style.boxShadow = '0 2px 8px rgba(160, 132, 238, 0.06)';
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
  // Setup auto-scroll functionality
  setupAutoScroll();
  setupEnhancedTabNavigation();
  setupSectionHighlighting();
  
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

  // Patch status updates in form submit and job save
  const form = document.getElementById('jobCardForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const customerName = document.getElementById('customerName').value.trim();
      if (!customerName) {
        showStatus('Customer Name is required.');
        return;
      }
      document.getElementById('assignModal').style.display = 'flex';
    });
  }

  // Patch job save success/error
  const origPush = window.pushToDatabase;
  window.pushToDatabase = function(...args) {
    return origPush(...args).then(() => {
      showStatus('Saved successfully!');
    }).catch((error) => {
      showStatus('Error: ' + error.message);
    });
  };

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