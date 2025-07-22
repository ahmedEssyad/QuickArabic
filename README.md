# QuickArabic - Arabic Transliteration Browser Extension

🎯 **Perfect for Arabic speakers who need to type Arabic on computers without Arabic keyboard support!**

QuickArabic instantly converts Latin text to Arabic characters using phonetic transliteration. Just type in English letters and convert to Arabic with a simple keyboard shortcut.

## ✨ Features

- **Instant Conversion**: Press `Ctrl+Space` to convert the current word to Arabic
- **Smart Preview**: See the conversion before applying it
- **Facebook Ready**: Works perfectly with Facebook posts, comments, and messages
- **Universal Compatibility**: Works on all websites - Gmail, Twitter, forums, etc.
- **Custom Mappings**: Add your own transliteration rules
- **RTL Support**: Automatic right-to-left text direction for Arabic text
- **No Internet Required**: Works completely offline

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   - Clone or download this repository
   - Extract to a folder on your computer

2. **Load in Chrome/Edge**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the QuickArabic folder

3. **Load in Firefox**
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select `manifest.json` from the QuickArabic folder

### Basic Usage

1. **Go to any website** (like Facebook.com)
2. **Click in a text field** and type Latin text: `ahlan wa sahlan`
3. **Press `Ctrl+Space`** to convert
4. **See the preview** showing: `ahlan wa sahlan` → `أهلاً وسهلاً`
5. **Click "Convert"** or wait 1 second for auto-conversion

## 📖 Transliteration Guide

### Basic Letters (FIXED & IMPROVED!)
| Latin | Arabic | Example | Notes |
|-------|--------|---------|-------|
| b | ب | `bab` → `باب` (door) | |
| t | ت | `tamr` → `تمر` (dates) | |
| th | ث | `thalatha` → `ثلاثة` (three) | |
| j | ج | `jamal` → `جمل` (camel) | |
| **h** | **ه** | **`bayt` → `بيته` (his house)** | **FIXED!** Regular Ha |
| **H** | **ح** | **`Hub` → `حب` (love)** | **NEW!** Emphatic Ha |
| kh | خ | `khayr` → `خير` (good) | |
| d | د | `dar` → `دار` (house) | |
| r | ر | `ruz` → `رز` (rice) | |
| s | س | `salam` → `سلام` (peace) | |
| sh | ش | `shams` → `شمس` (sun) | |
| f | ف | `fil` → `فيل` (elephant) | |
| q | ق | `qalam` → `قلم` (pen) | |
| k | ك | `kitab` → `كتاب` (book) | |
| l | ل | `layl` → `ليل` (night) | |
| m | م | `masjid` → `مسجد` (mosque) | |
| n | ن | `nahr` → `نهر` (river) | |
| w | و | `ward` → `ورد` (roses) | |
| y | ي | `yad` → `يد` (hand) | |

### Hamza Forms (CRITICAL NEW FEATURE!)
| Latin | Arabic | Example | Usage |
|-------|--------|---------|-------|
| **a2** | **أ** | **`a2hlan` → `أهلاً`** | **Alef + Hamza above** |
| **a3** | **إ** | **`a3la` → `إلى`** | **Alef + Hamza below** |
| **aa** | **آ** | **`aaman` → `آمان`** | **Alef + Madda** |
| **2** | **ء** | **`su2al` → `سؤال`** | **Hamza alone** |

### Special Characters
| Latin | Arabic | Note |
|-------|--------|------|
| 3 | ع | Chat convention for Ain |
| 7 | ح | Chat convention for Ha |
| gh | غ | `ghada` → `غدا` (tomorrow) |
| S | ص | Capital S for emphatic Sad |
| D | ض | Capital D for emphatic Dad |
| T | ط | Capital T for emphatic Ta |
| Z | ظ | Capital Z for emphatic Zah |

### Common Patterns
| Latin | Arabic | Meaning |
|-------|--------|---------|
| `al-` | `ال` | The (definite article) |
| `ah` | `ة` | Feminine ending |
| `allah` | `الله` | Allah |
| `salam` | `سلام` | Peace/Hello |
| `shukran` | `شكراً` | Thank you |

## ⚙️ Settings & Customization

### Keyboard Shortcuts
- **Ctrl+Space**: Convert current word/selection (default)
- **Double Spacebar**: Alternative trigger method
- **Ctrl+Shift+A**: Toggle extension on/off

### Custom Mappings
Add your own transliteration rules:
1. Click the extension icon
2. Go to "Custom Mappings" section  
3. Enter Latin text and Arabic equivalent
4. Click "Add"

### Website Settings
- **Enable on all sites**: Works everywhere (default)
- **Site-specific**: Choose which websites to enable

### Preview Settings
- **Show preview**: See conversion before applying (recommended)
- **Auto-convert**: Skip preview and convert immediately

## 🌍 Common Use Cases

### Facebook Posts
```
Type: bismillah habibi, shu akbarak?
Press: Ctrl+Space on each word
Result: بسم الله حبيبي، شو أخبارك؟
```

### Greetings
```
ahlan wa sahlan → أهلاً وسهلاً (welcome)
kayf halak → كيف حالك (how are you)
allah ma3ik → الله معك (God be with you)
```

### Common Words (FIXED EXAMPLES!)
```
✅ CORRECT NOW:
ahlan → أهلان (welcome) - NOT ةلان  
marhaba → مرحبا (hello) - NOT مرحبة
habibi → حبيبي (my dear)  
sabah → صباح (morning) - NOT صبة

✅ WORDS WITH TA MARBUTA (ة) AT END:
madrasah → مدرسة (school)
sayyarah → سيارة (car)  
kitabah → كتابة (writing)

✅ HAMZA FORMS:
a2hlan → أهلان (welcome with hamza)
a3la → إلى (to/towards)
```

## 🛠️ Technical Details

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+  
- ✅ Firefox 78+
- ✅ Safari (with WebExtensions support)

### Supported Input Types
- Standard text inputs (`<input type="text">`)
- Text areas (`<textarea>`)
- Content-editable divs (Facebook, Gmail, etc.)
- Rich text editors
- Comment boxes and forums

### Privacy & Security
- **Completely offline** - no data sent to servers
- **No tracking** - no analytics or user data collection
- **Local storage only** - settings stored in browser
- **Open source** - all code is auditable

## 🔧 Troubleshooting

### Extension Not Working?
1. **Refresh the page** after installing
2. **Check if enabled** - click extension icon to see status
3. **Try different field** - some websites block extensions
4. **Check permissions** - ensure extension has access to the site

### Conversion Issues?
1. **Select the text** first if word detection fails
2. **Use custom mappings** for uncommon transliterations
3. **Check trigger method** - try double-spacebar instead
4. **Disable preview** for instant conversion

### Facebook-Specific Issues?
1. **Click in the text box** first to focus
2. **Try typing and converting word by word**
3. **Use the post composer** (not inline editing)
4. **Refresh Facebook** if it stops working

## 📱 Mobile Support

While this is a browser extension (desktop/laptop only), the transliteration mappings can be adapted for mobile:
- Use similar mappings in mobile keyboard apps
- Consider Gboard or SwiftKey with Arabic phonetic layouts
- Mobile app development possible using same logic

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Bug Reports
1. Open an issue on GitHub
2. Include browser version and website URL
3. Describe the expected vs actual behavior
4. Include console errors if any

### Feature Requests
- Better dialect support
- More keyboard shortcuts
- UI improvements
- Additional transliteration systems

### Development
1. Fork the repository
2. Make your changes
3. Test on multiple browsers
4. Submit a pull request

## 📄 License

MIT License - feel free to modify and distribute.

## 🆘 Support

- **GitHub Issues**: Report bugs and feature requests
- **Email**: [Contact developer]
- **Documentation**: This README and in-extension help

---

**Made with ❤️ for the Arabic-speaking community worldwide**

*Helping preserve and promote Arabic language in the digital age* 🌟