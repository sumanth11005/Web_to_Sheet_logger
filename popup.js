document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
});

document.getElementById('retry-failed-saves').onclick = function () {
  chrome.storage.local.get('failedSave', (data) => {
    if (data.failedSave) {
      const metadata = data.failedSave;
      chrome.storage.local.remove('failedSave', () => {
        alert('Retrying failed save...');
        chrome.runtime.sendMessage({
          action: "sendToSheet",
          metadata,
        }, (response) => {
          if (response && response.status === "success") {
            alert("Retry successful. Data sent to Google Sheet.");
          } else {
            alert(`Retry failed: ${response?.message || "Unknown error occurred."}`);
          }
        });
      });
    } else {
      alert('No failed saves to retry.');
    }
  });
};