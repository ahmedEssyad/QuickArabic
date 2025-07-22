# Installation Guide - QuickArabic Extension

## 📋 Prerequisites

- **Supported Browsers**: Chrome 88+, Edge 88+, Firefox 78+
- **Operating Systems**: Windows, macOS, Linux
- **Permissions**: Developer mode access (for unpacked installation)

## 🚀 Installation Methods

### Method 1: Chrome Web Store (Coming Soon)
*This extension will be available on the Chrome Web Store soon for easy one-click installation.*

### Method 2: Manual Installation (Current)

#### For Chrome/Chromium/Edge:

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/QuickArabic.git
   # OR download and extract the ZIP file
   ```

2. **Open Extension Management**
   - Open Chrome/Edge
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner
   - You should see new buttons appear

4. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the QuickArabic folder
   - Select the folder (not a specific file)
   - Click "Open" or "Select Folder"

5. **Verify Installation**
   - You should see "QuickArabic" in your extensions list
   - The extension icon should appear in your browser toolbar
   - Status should show "Enabled"

#### For Firefox:

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/QuickArabic.git
   # OR download and extract the ZIP file
   ```

2. **Open Debug Page**
   - Type `about:debugging` in the address bar
   - Click "This Firefox" on the left sidebar

3. **Load Temporary Add-on**
   - Click "Load Temporary Add-on..." button
   - Navigate to the QuickArabic folder
   - Select the `manifest.json` file
   - Click "Open"

4. **Verify Installation**
   - Extension should appear in the list
   - Icon should be visible in the toolbar
   - Note: Firefox temporary add-ons are removed when browser restarts

#### Creating a Permanent Firefox Installation:

1. **Zip the Extension**
   ```bash
   cd QuickArabic
   zip -r quickarabic-extension.zip * -x "*.git*" "*.md" "*node_modules*"
   ```

2. **Self-Sign (Optional)**
   - Visit [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Create an account and self-sign the extension
   - Install the signed .xpi file

## 🔧 Post-Installation Setup

### 1. Initial Configuration

1. **Click the Extension Icon**
   - Look for the QuickArabic icon in your toolbar
   - If not visible, click the puzzle piece (Extensions) menu

2. **Check Status**
   - The popup should show "Active on this page" (green dot)
   - If red or yellow, check permissions or enabled sites

3. **Test Basic Functionality**
   - Go to any website (e.g., Facebook.com)
   - Click in a text field
   - Type "ahlan" and press `Ctrl+Space`
   - You should see a preview showing "ahlan" → "أهلاً"

### 2. Configure Shortcuts

1. **Chrome/Edge Shortcut Management**
   - Go to `chrome://extensions/shortcuts`
   - Find "QuickArabic"
   - Customize keyboard shortcuts if needed

2. **Firefox Shortcut Management**
   - Go to `about:addons`
   - Click the gear icon → "Manage Extension Shortcuts"
   - Configure shortcuts for QuickArabic

### 3. Verify Permissions

The extension needs these permissions:
- ✅ **Active Tab**: To work on the current webpage
- ✅ **Storage**: To save your settings and custom mappings
- ✅ **All URLs**: To work on any website you visit

If permission is denied:
1. Right-click extension icon → "Manage Extension"
2. Check that "Allow on all sites" is enabled

## 🧪 Testing Your Installation

### Quick Test Checklist:

1. **Basic Conversion Test**
   ```
   ✅ Go to facebook.com or gmail.com
   ✅ Type "salam" in any text field
   ✅ Press Ctrl+Space
   ✅ Should show preview: "salam" → "سلام"
   ✅ Click "Convert" or wait for auto-conversion
   ```

2. **Settings Test**
   ```
   ✅ Click extension icon
   ✅ Settings popup should open
   ✅ Status should show "Active on this page"
   ✅ Toggle switches should work
   ```

3. **Custom Mapping Test**
   ```
   ✅ In settings, add custom mapping: "habibti" → "حبيبتي"
   ✅ Test in text field: type "habibti", press Ctrl+Space
   ✅ Should convert to your custom mapping
   ```

4. **Multiple Sites Test**
   ```
   ✅ Test on Facebook (posts, comments, messages)
   ✅ Test on Gmail (compose, reply)
   ✅ Test on any blog comment section
   ✅ Test on Twitter/X compose
   ```

## ❌ Troubleshooting Installation Issues

### Common Problems:

#### "This extension may have been corrupted"
**Solution:**
- Re-download the extension files
- Ensure all files are present (check file list below)
- Try reloading the extension

#### Extension Icon Not Appearing
**Solution:**
- Check if extension is enabled in `chrome://extensions/`
- Pin the extension: Extensions menu → Pin QuickArabic
- Restart browser

#### "Cannot read property" Errors
**Solution:**
- Ensure you selected the correct folder (containing manifest.json)
- Check that all JavaScript files are present
- Clear browser cache and reload extension

#### Not Working on Some Sites
**Solution:**
- Check extension permissions
- Some sites (like chrome:// pages) don't allow extensions
- Refresh the page after installing

### Required Files Checklist:
```
QuickArabic/
├── manifest.json          ✅ Extension configuration
├── background.js         ✅ Service worker
├── content.js           ✅ Main functionality
├── content.css          ✅ Preview styling
├── transliterator.js    ✅ Conversion logic
├── popup.html          ✅ Settings interface
├── popup.css           ✅ Settings styling
├── popup.js            ✅ Settings logic
├── icons/              📁 Icon files (optional)
├── README.md           📄 Documentation
└── INSTALLATION.md     📄 This guide
```

## 🔄 Updating the Extension

### For Manual Installation:
1. Download the latest version
2. Extract to the same folder (overwrite old files)
3. Go to `chrome://extensions/`
4. Click refresh icon on QuickArabic extension
5. Check that version number updated

### For Web Store Installation:
- Extensions update automatically
- Manual update: Extensions → Developer mode → Update extensions

## 🗑️ Uninstallation

1. **Chrome/Edge:**
   - Go to `chrome://extensions/`
   - Find QuickArabic
   - Click "Remove"
   - Confirm deletion

2. **Firefox:**
   - Go to `about:addons`
   - Find QuickArabic
   - Click "..." → "Remove"
   - Confirm deletion

3. **Clean Up Settings (Optional):**
   - Extension settings are removed automatically
   - No manual cleanup needed

## 🔐 Security Notes

- **Source Code**: All code is open source and auditable
- **No Network Access**: Extension works completely offline
- **Data Privacy**: No user data is transmitted or collected
- **Local Storage**: Settings stored only in your browser

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** for common solutions
2. **Browser Console**: Press F12, check for error messages
3. **GitHub Issues**: Report bugs with details:
   - Browser version
   - Operating system  
   - Website where issue occurs
   - Steps to reproduce
   - Error messages (if any)

## ✅ Installation Success!

You should now be able to:
- ✨ Convert Latin text to Arabic on any website
- ⚙️ Access settings through the extension popup
- 🎯 Use keyboard shortcuts for quick conversion
- 🌐 Work seamlessly with Facebook, Gmail, and other sites

**Happy typing in Arabic! أهلاً وسهلاً** 🎉