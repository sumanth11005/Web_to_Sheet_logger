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
      console.log('Selected text:', selectedText);
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