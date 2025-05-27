chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-sheet",
    title: "Save selection to Sheet",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-sheet" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showPopupFromContext",
      selectedText: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendToSheet") {
    fetch("https://script.google.com/macros/s/AKfycbzEq0bZo9n453P55ChpMgB0TWKXuu28gJlSTv94Lm61ti1SD4mgMBtEfaL_d39No4Ch/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.metadata),
    })
      .then((response) => response.text())
      .then((text) => {
        if (text.includes('<!DOCTYPE')) {
          sendResponse({ status: "success" });
        } else {
          const result = JSON.parse(text);
          sendResponse(result);
        }
      })
      .catch((error) => sendResponse({ status: "error", message: error.message }));

    return true;
  }
});