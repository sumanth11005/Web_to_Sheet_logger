console.log('Hello from content script');
// Create a confirmation popup
definePopup();

function definePopup() {
  const popup = document.createElement('div');
  popup.id = 'confirmation-popup';
  popup.style.position = 'fixed';
  popup.style.display = 'none';
  popup.style.zIndex = '1001';
  popup.style.padding = '15px';
  popup.style.backgroundColor = '#fff';
  popup.style.color = '#000';
  popup.style.border = '1px solid #ccc';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  popup.style.width = '300px';
  popup.style.top = '20px';
  popup.style.left = '50%';
  popup.style.transform = 'translateX(-50%)';
  popup.style.fontFamily = 'Arial, sans-serif';
  popup.style.fontSize = '14px';
  popup.style.lineHeight = '1.5';
  popup.innerHTML = `
    <p><strong>Selected Text:</strong> <span id="popup-text"></span></p>
    <p><strong>Page Title:</strong> <span id="popup-title"></span></p>
    <p><strong>Page URL:</strong> <span id="popup-url"></span></p>
    <p><strong>Timestamp:</strong> <span id="popup-timestamp"></span></p>
    <button id="send-to-sheet" style="
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    ">Send to Sheet</button>
    <button id="close-popup" style="
      margin-top: 10px;
      margin-left: 10px;
      padding: 5px 10px;
      background-color: #dc3545;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    ">Close</button>
  `;
  document.body.appendChild(popup);
}

// Initialize variables to track last saved text and timestamp
let lastSavedText = null;
let lastSavedTimestamp = 0;

// Function to show a toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  toast.style.zIndex = '1002';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Function to validate metadata before sending
function validateMetadata(metadata) {
  // Trim whitespace from selected text
  metadata.text = metadata.text.trim();

  // Ensure text is not empty
  if (!metadata.text) {
    alert('Please select some text before saving.');
    return false;
  }

  // Validate URL with regex
  const urlRegex = /^https?:\/\//;
  if (!urlRegex.test(metadata.url)) {
    alert('Invalid URL detected. Please ensure the URL starts with http:// or https://');
    return false;
  }

  // Ensure timestamp is in ISO format
  if (isNaN(Date.parse(metadata.timestamp))) {
    alert('Invalid timestamp. Please ensure the timestamp is in ISO format.');
    return false;
  }

  return true;
}

// Enhanced environment detection for specific platforms
function detectEnvironment() {
  if (document.contentType === 'application/pdf') {
    console.log('Environment detected: PDF Viewer');
  } else if (window.location.hostname.includes('docs.google.com')) {
    console.log('Environment detected: Google Docs');
  } else if (window.location.hostname.includes('twitter.com')) {
    console.log('Environment detected: Twitter');
  } else if (window.location.hostname.includes('wikipedia.org')) {
    console.log('Environment detected: Wikipedia');
  } else if (window.location.hostname.includes('mail.google.com')) {
    console.log('Environment detected: Gmail Compose Window');
  } else if (document.querySelector('[data-reactroot], [id^=app], [id^=root]')) {
    console.log('Environment detected: SPA (React/Vue)');
  } else if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    console.log('Environment detected: Strict CSP Site');
  } else {
    console.log('Environment detected: General Web Page');
  }
}

// Call the enhanced environment detection function
detectEnvironment();

// Add this listener to handle context menu triggers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showPopupFromContext") {
    const metadata = {
      text: request.selectedText,
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Populate and show existing popup
    document.getElementById('popup-text').textContent = metadata.text;
    document.getElementById('popup-title').textContent = metadata.title;
    document.getElementById('popup-url').textContent = metadata.url;
    document.getElementById('popup-timestamp').textContent = metadata.timestamp;
    document.getElementById('confirmation-popup').style.display = 'block';
  }
});

// Update the "Send to Sheet" button click handler
document.getElementById('send-to-sheet').onclick = async function () {
  const metadata = {
    text: document.getElementById('popup-text').textContent,
    title: document.getElementById('popup-title').textContent,
    url: document.getElementById('popup-url').textContent,
    timestamp: document.getElementById('popup-timestamp').textContent,
  };

  // Validate metadata before proceeding
  if (!validateMetadata(metadata)) {
    return;
  }

  // Retry logic with exponential backoff
  async function sendWithRetry(metadata, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Send metadata to the background script
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: "sendToSheet",
            metadata,
          }, (response) => {
            if (response && response.status === "success") {
              resolve(response);
            } else {
              reject(new Error(response?.message || "Unknown error occurred."));
            }
          });
        });

        // Success
        alert("Data successfully sent to Google Sheet.");
        return;
      } catch (error) {
        console.log(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt < retries) {
          showToast(`Retrying... (${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(3, attempt - 1) * 1000));
        } else {
          console.log("All retries failed. Saving to local storage.");
          chrome.storage.local.set({ failedSave: metadata }, () => {
            alert("Failed to send data. Saved locally for retry.");
          });
        }
      }
    }
  }

  // Call the retry logic
  sendWithRetry(metadata);
};

// Add functionality to close the popup
document.getElementById('close-popup').onclick = function () {
  document.getElementById('confirmation-popup').style.display = 'none';
};

// Debounce function to limit event firing
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Example: Debounce selection event
let handleSelection = debounce(() => {
  console.log("Selection event triggered.");
  // ...existing logic for handling selection...
}, 300);

document.addEventListener("selectionchange", handleSelection);

// Cleanup unused event listeners
window.addEventListener("beforeunload", () => {
  document.removeEventListener("selectionchange", handleSelection);
  console.log("Cleaned up event listeners.");
});

// Virtualize DOM elements (example for large lists)
function virtualizeList(container, items) {
  const visibleCount = 10; // Number of items to render
  const buffer = document.createElement("div");
  buffer.style.height = `${items.length * 20}px`; // Assume each item is 20px tall
  container.appendChild(buffer);

  container.addEventListener("scroll", () => {
    const start = Math.floor(container.scrollTop / 20);
    const end = Math.min(start + visibleCount, items.length);

    container.innerHTML = ""; // Clear container
    for (let i = start; i < end; i++) {
      const item = document.createElement("div");
      item.textContent = items[i];
      container.appendChild(item);
    }
  });
}

// Limit storage operations
function saveToStorage(key, value) {
  chrome.storage.local.get(key, (data) => {
    if (JSON.stringify(data[key]) !== JSON.stringify(value)) {
      chrome.storage.local.set({ [key]: value });
    }
  });
}

// Add memory usage console warnings
setInterval(() => {
  if (performance.memory) {
    const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    const totalMB = performance.memory.totalJSHeapSize / 1024 / 1024;
    console.log(`Memory usage: ${usedMB.toFixed(2)} MB / ${totalMB.toFixed(2)} MB`);
    if (usedMB / totalMB > 0.8) {
      console.warn("High memory usage detected!");
    }
  }
}, 5000);