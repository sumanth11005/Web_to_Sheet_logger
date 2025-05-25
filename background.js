chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendToSheet") {
    const sendToSheet = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbxHG9Ne8JVsIZCR3Hwn2ctMnTr8wvHUZX80xJqzH58LxcSf46jjFiFFaiRyo34MX2n2/exec", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message.metadata),
        });

        const text = await response.text(); // Get raw text first
        console.log("Raw response:", text);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Check if response is HTML
        if (text.trim().startsWith('<!DOCTYPE')) {
          console.warn('Received HTML response:', text.slice(0, 100));
          sendResponse({ status: "success", message: "Data saved to sheet, but received HTML response." });
          return;
        }

        const result = JSON.parse(text);
        console.log("Parsed result:", result);
        sendResponse({ status: "success", result });
      } catch (error) {
        console.error("Error during fetch:", error);
        sendResponse({ status: "error", message: error.message });
      }
    };

    sendToSheet().finally(() => {
      console.log("Request completed, resetting state if needed.");
    });

    return true; // Keep the message channel open for async response
  }
});