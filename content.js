console.log('Hello from content script');
// Create a floating "Save" button
const saveButton = document.createElement('button');
saveButton.textContent = 'Save';
saveButton.style.position = 'absolute';
saveButton.style.display = 'none'; // Initially hidden
saveButton.style.zIndex = '1000';
saveButton.style.padding = '5px 10px';
saveButton.style.backgroundColor = '#007bff';
saveButton.style.color = '#fff';
saveButton.style.border = 'none';
saveButton.style.borderRadius = '5px';
saveButton.style.cursor = 'pointer';
saveButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
document.body.appendChild(saveButton);

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

// Event listener for text selection
document.addEventListener('mouseup', function () {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the button near the selection
    saveButton.style.top = `${window.scrollY + rect.bottom + 5}px`;
    saveButton.style.left = `${window.scrollX + rect.left}px`;
    saveButton.style.display = 'block';

    // Save the selected text when the button is clicked
    saveButton.onclick = function () {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        const metadata = {
          text: selectedText,
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };

        // Populate the popup with metadata
        document.getElementById('popup-text').textContent = metadata.text;
        document.getElementById('popup-title').textContent = metadata.title;
        document.getElementById('popup-url').textContent = metadata.url;
        document.getElementById('popup-timestamp').textContent = metadata.timestamp;

        // Show the popup
        const popup = document.getElementById('confirmation-popup');
        popup.style.display = 'block';

        // Handle "Send to Sheet" button click
        document.getElementById('send-to-sheet').onclick = function () {
          console.log('Sending to sheet:', metadata);

          // Add loading state
          const sendButton = document.getElementById('send-to-sheet');
          sendButton.textContent = 'Sending...';
          sendButton.disabled = true;

          chrome.runtime.sendMessage(
            {
              action: "sendToSheet",
              metadata,
            },
            (response) => {
              if (response.status === "success") {
                alert("Data sent to sheet successfully!");
                popup.style.display = 'none';
              } else {
                alert(`Failed to send data: ${response.message}`);
              }
            }
          );

          // Reset button state
          sendButton.textContent = 'Send to Sheet';
          sendButton.disabled = false;
        };

        // Handle "Close" button click
        document.getElementById('close-popup').onclick = function () {
          popup.style.display = 'none';
        };
      }
      saveButton.style.display = 'none'; // Hide the button after saving
    };
  } else {
    // Hide the button if no text is selected
    saveButton.style.display = 'none';
  }
});

// Hide the button when clicking elsewhere
document.addEventListener('mousedown', function (event) {
  if (!saveButton.contains(event.target)) {
    saveButton.style.display = 'none';
  }
});