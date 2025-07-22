# Testing Guide - QuickArabic Extension

## 🧪 Step-by-Step Testing Instructions

### Phase 1: Installation Testing

#### 1.1 Load Extension in Chrome
```bash
1. Open Chrome browser
2. Go to: chrome://extensions/
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select your QuickArabic folder
6. Verify: Extension appears with green "Enabled" status
```

#### 1.2 Verify Extension Icon
```bash
✅ Check: Extension icon appears in toolbar
✅ Check: Right-click icon → "Manage extension" works
✅ Check: Click icon opens settings popup
```

### Phase 2: Basic Functionality Testing

#### 2.1 Simple Text Input Test
```bash
1. Go to: https://www.google.com
2. Click in the search box
3. Type: "salam"
4. Press: Ctrl+Space
5. Expected: Preview popup shows "salam" → "سلام"
6. Click: "Convert" button
7. Expected: Text changes to "سلام"
```

#### 2.2 Settings Test
```bash
1. Click extension icon
2. Verify: Status shows "Active on this page" (green dot)
3. Test: Toggle "Enable Extension" off/on
4. Test: Change trigger method to "Double Spacebar"
5. Test: Toggle "Show Preview" off/on
6. Expected: All settings save and work immediately
```

### Phase 3: Advanced Testing

#### 3.1 Facebook Testing (Primary Target)
```bash
1. Go to: https://facebook.com (login if needed)
2. Find: Status update box or comment field
3. Type: "ahlan wa sahlan habibi"
4. Test each word:
   - "ahlan" + Ctrl+Space → "أهلان"
   - "wa" + Ctrl+Space → "وا" 
   - "sahlan" + Ctrl+Space → "سهلان"
   - "habibi" + Ctrl+Space → "حبيبي"
5. Expected: Each conversion works in Facebook's rich text editor
```

#### 3.2 Gmail Testing
```bash
1. Go to: https://gmail.com
2. Click: "Compose" new email
3. In subject line: Type "marhaba" + Ctrl+Space → "مرحباً"
4. In email body: Type "kayf halak" + Ctrl+Space → "كيف حالك"
5. Expected: Works in both subject and body fields
```

#### 3.3 Multi-Word Selection Test
```bash
1. Any text field
2. Type: "bismillah alhamdulillah"
3. Select all text (Ctrl+A)
4. Press: Ctrl+Space
5. Expected: Preview shows entire phrase conversion
6. Expected: "بسم الله الحمد لله"
```

### Phase 4: Edge Case Testing

#### 4.1 Mixed Content Test
```bash
1. Type: "hello salam world"
2. Place cursor in word "salam"
3. Press: Ctrl+Space
4. Expected: Only "salam" converts to "سلام"
5. Result: "hello سلام world"
```

#### 4.2 RTL Direction Test
```bash
1. After converting Arabic text
2. Check: Text direction automatically becomes right-to-left
3. Check: Cursor positioning works correctly
4. Type more: Mixed Arabic and English
5. Expected: Proper text flow and direction
```

#### 4.3 Special Characters Test
```bash
Test these mappings:
- "3alam" → "علام" (using number 3)
- "7ayat" → "حياة" (using number 7)  
- "ghada" → "غدا" (gh combination)
- "shams" → "شمس" (sh combination)
- "al-bayt" → "البيت" (definite article)
```

### Phase 5: Custom Mappings Test

#### 5.1 Add Custom Mapping
```bash
1. Click extension icon
2. In "Custom Mappings" section:
3. Latin text: "habibti"
4. Arabic text: "حبيبتي"  
5. Click: "Add"
6. Test: Type "habibti" + Ctrl+Space
7. Expected: Converts to "حبيبتي" (not default mapping)
```

#### 5.2 Remove Custom Mapping
```bash
1. Find your custom mapping in the list
2. Click: "Remove" button
3. Test: Type "habibti" + Ctrl+Space again
4. Expected: Uses default transliteration rules
```

### Phase 6: Website Compatibility Testing

Test on these popular sites:
```bash
✅ Facebook.com - Posts, comments, messages
✅ Gmail.com - Compose, reply, subject
✅ Twitter.com/X.com - Tweet compose
✅ LinkedIn.com - Post updates, comments  
✅ Reddit.com - Comment boxes
✅ WhatsApp Web - Message input
✅ Discord.com - Chat input
✅ YouTube.com - Comment sections
```

### Phase 7: Browser Testing

#### 7.1 Chrome Testing
```bash
1. Follow installation steps for Chrome
2. Run all Phase 2-6 tests
3. Check: All features work correctly
```

#### 7.2 Firefox Testing  
```bash
1. Go to: about:debugging
2. Load temporary add-on
3. Run basic functionality tests
4. Note: Some differences in popup styling expected
```

#### 7.3 Edge Testing
```bash
1. Follow Chrome steps (same process)
2. Go to: edge://extensions/
3. Test core functionality
```

### Phase 8: Performance Testing

#### 8.1 Speed Test
```bash
1. Type long text: "salam salam salam salam salam"
2. Select all
3. Press: Ctrl+Space
4. Expected: Conversion completes within 100ms
5. No lag or freezing
```

#### 8.2 Memory Test
```bash
1. Open browser task manager (Shift+Esc in Chrome)
2. Find QuickArabic extension process
3. Use extension normally for 10+ conversions
4. Expected: Memory usage stays stable (under 10MB)
```

## 🐛 Common Issues & Solutions

### Issue: Extension Not Loading
```bash
Solution:
1. Check all files are in QuickArabic folder
2. Verify manifest.json is valid JSON
3. Reload extension in chrome://extensions/
4. Check browser console (F12) for errors
```

### Issue: Ctrl+Space Not Working
```bash
Solution:
1. Check if another app uses Ctrl+Space
2. Try on different websites
3. Check extension permissions
4. Test with double-spacebar trigger instead
```

### Issue: Preview Not Showing
```bash
Solution:
1. Check if preview is enabled in settings
2. Try different text field
3. Check for CSS conflicts (F12 → Elements)
4. Disable other extensions temporarily
```

### Issue: Facebook Not Working
```bash
Solution:  
1. Refresh Facebook page
2. Click directly in text area first
3. Try in different Facebook sections (posts vs comments)
4. Clear browser cache
```

## ✅ Test Results Checklist

Print this and check off each test:

**Installation:**
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Settings popup opens

**Basic Functionality:**
- [ ] Simple word conversion works
- [ ] Ctrl+Space trigger works
- [ ] Preview popup appears and functions
- [ ] Convert/Cancel buttons work

**Facebook Testing:**
- [ ] Works in status update
- [ ] Works in comments  
- [ ] Works in messages
- [ ] RTL direction applied

**Advanced Features:**
- [ ] Multi-word selection works
- [ ] Custom mappings save/load
- [ ] Website enable/disable works
- [ ] Double spacebar trigger works

**Browser Compatibility:**
- [ ] Chrome works fully
- [ ] Firefox works (basic test)
- [ ] Edge works (if available)

**Performance:**
- [ ] No noticeable lag
- [ ] Memory usage reasonable
- [ ] No crashes or freezes

## 🎯 Success Criteria

Your extension passes testing if:
- ✅ Converts basic Arabic words correctly
- ✅ Works on Facebook (primary requirement)
- ✅ Settings save and load properly
- ✅ No console errors
- ✅ Performance is smooth
- ✅ RTL text direction works

## 📞 If Tests Fail

1. **Check Browser Console**: F12 → Console tab for errors
2. **Verify File Structure**: All files present and correct
3. **Test Step by Step**: Isolate which feature fails
4. **Check Permissions**: Extension has access to websites
5. **Try Different Site**: Some sites block certain features

Good luck testing! 🚀