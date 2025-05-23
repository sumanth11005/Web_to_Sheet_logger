chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendToSheet") {
    fetch("https://script.google.com/macros/s/AKfycbycSnejl7fWG02ZOofWCSVQixhtyrRXWsly7oz-k4M33S9b_0xZmaamhO8oZT1DbBD1/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message.metadata),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        console.log("Success:", result);
        sendResponse({ status: "success", result });
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({ status: "error", message: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});