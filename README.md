# AdBlock_Chrome_Extention_Source

StreamGuard: Advanced Ad & Popup Blocker
<p align="center">
  <img src="assets/icon128.png" alt="StreamGuard Logo" width="128" height="128">
</p>
<p align="center">
  <strong>Block ads, bypass detection, and enjoy uninterrupted video streaming</strong>
</p>
<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#customization">Customization</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#privacy">Privacy</a>
</p>
🌟 Features
StreamGuard is a powerful Chrome extension designed to provide a seamless browsing experience by:

✅ Blocking advertisements, popups, overlays, and auto-playing banners on video streaming websites
✅ Bypassing adblock detection - websites won't know you're using it
✅ Ensuring videos play without interruption or redirection
✅ Blocking tracking scripts and external JavaScript that serve ads
✅ Intelligently cleaning the DOM to remove unwanted elements
✅ Working silently in the background with minimal resource usage

📥 Installation
Option 1: Chrome Web Store (Recommended)

Visit the StreamGuard Chrome Web Store page
Click "Comming Soon"
Confirm the installation

Option 2: Manual Installation (Developer Mode)

Download the latest release from the Releases page
Unzip the file to a location on your computer
Open Chrome and navigate to chrome://extensions/
Enable "Developer mode" using the toggle in the top-right corner
Click "Load unpacked" and select the unzipped extension folder
StreamGuard is now installed and ready to use

🔍 How It Works
StreamGuard uses a multi-layered approach to provide comprehensive protection:
1. Network Level Protection
Uses Chrome's declarativeNetRequest API to block requests to ad servers before they load.
javascriptCopy// Sample rule from ad-domains.json
{
  "id": 1,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "||doubleclick.net^",
    "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
  }
}
2. DOM Cleaning
Removes intrusive elements from the page using intelligent selection and heuristic detection.
3. Adblock Detection Bypassing
Employs sophisticated techniques to avoid detection:

Creates fake ad elements that appear to exist
Overrides JavaScript methods used for detection
Intercepts and neutralizes anti-adblock scripts

4. Video Playback Enhancement
Ensures videos play smoothly by removing overlays and fixing controls.
⚙️ Customization
StreamGuard comes with an easy-to-use interface allowing you to:

Enable/disable protection globally
Whitelist specific websites
Toggle advanced filtering options
Enable debug mode for troubleshooting

For developers who want to modify the extension:

Clone this repository
Make your desired changes:

Add domains to rules/ad-domains.json to block additional ad servers
Modify selectors in content-scripts/dom-cleaner.js to target specific site elements
Add site-specific handling in background.js


Load the modified extension using Developer mode

📸 Screenshots
<p align="center">
  <img src="screenshots/screenshot1.png" alt="StreamGuard in action" width="700">
</p>
<p align="center">
  <img src="screenshots/screenshot2.png" alt="StreamGuard popup interface" width="350">
</p>
🔒 Privacy
StreamGuard is designed with privacy in mind:

All processing happens locally on your device
No data is transmitted externally
No browsing history or personal information is collected
No analytics or tracking code included

See our full Privacy Policy for more details.
🛠️ Technical Details

Built with JavaScript using Chrome's Extension Manifest V3
Uses declarativeNetRequest for efficient request blocking
Content scripts are injected at different document lifecycle stages for optimal performance
Modular design allows for easy maintenance and updates

🔄 Updates
StreamGuard is actively maintained. To update:

If installed from the Chrome Web Store, updates are automatic
If manually installed, download the latest release and reinstall using the same method

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
⭐ Support
If you find StreamGuard useful, please:

Star this repository
Report issues or suggest improvements via Issues
Consider contributing to the project
Share with others who might benefit from it

🤝 Contributing
Contributions are welcome! See CONTRIBUTING.md for guidelines.
📋 Disclaimer
This extension is intended for personal use to improve browsing experience. Users should respect website terms of service and consider supporting content creators through legitimate means such as subscriptions.

<p align="center">
  Made with ❤️ by <a href="https://github.com/Samansalari">Saman</a>
</p>
