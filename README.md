# Web to Sheet Logger  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Chrome extension that saves highlighted text with metadata to Google Sheets.

## Features ✨
- Text selection detection
- Metadata capture (URL, title, timestamp)
- Google Sheets integration via Apps Script
- Duplicate prevention (30-second cooldown)
- Context menu integration

## Installation 🛠️
1. Download [WebToSheetLogger_Suman.zip]
2. Unzip the file
3. Go to `chrome://extensions`
4. Enable "Developer mode" (toggle top-right)
5. Click "Load unpacked" → Select unzipped folder

## Usage Guide 🖱️
1. Select text → Right-click → **Save selection to Sheet**
2. Confirm metadata in popup
3. Click "Send to Sheet"

![Demo GIF](demo.gif) (replace with actual path)

## Development 🔧
- Clone the repository
- Modify `content.js`, `background.js`, or `popup.html` as needed
- Test changes by reloading the unpacked extension in Chrome

## License 📜
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
