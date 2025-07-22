# Facebook Testing Instructions

## Current Status
The console shows:
- ✅ `QuickArabic: Facebook detected - using passive mode`
- ✅ `QuickArabic: Setting up ultra-passive Facebook mode` 
- ✅ `QuickArabic: Skipping preview creation for Facebook`

But there's still a null error: `Cannot read properties of null (reading 'querySelector')`

## Simplified Test Steps

### 1. Verify Ultra-Passive Mode is Active
Open Facebook and check console should show:
```
QuickArabic: Facebook detected - using passive mode
QuickArabic: Setting up ultra-passive Facebook mode
QuickArabic: Skipping preview creation for Facebook
```

### 2. Test Basic Selection Conversion
1. **Type in Facebook:** `ahlan habibi`
2. **Select text manually** (drag with mouse to highlight)
3. **Press Ctrl+Space**
4. **Expected results:**
   - Console: `QuickArabic: Facebook ultra-passive triggered`
   - Console: `QuickArabic: "ahlan habibi" → "أهلان حبيبي"`
   - Either: Text converts directly OR copy dialog appears

### 3. If Still Getting Errors
The remaining Facebook errors might be from:
- Facebook's own internal conflicts
- Extension trying to load standard mode alongside passive mode
- Multiple content script injections

## Alternative: Extension Popup Method
If Facebook continues to cause issues:

1. **Click extension icon** (while on Facebook)
2. **Scroll to "Test Conversion" section**
3. **Type:** `ahlan habibi kayf halak`
4. **Click "Convert"**
5. **Copy the Arabic result:** `أهلان حبيبي كيف حالك`
6. **Paste into Facebook manually**

This method is 100% reliable and avoids all Facebook conflicts.

## Expected Console Output (Success)
```
QuickArabic: Extension loaded
QuickArabic: Facebook detected - using passive mode
QuickArabic: Setting up ultra-passive Facebook mode
QuickArabic: Skipping preview creation for Facebook
// User selects text and presses Ctrl+Space
QuickArabic: Facebook ultra-passive triggered
QuickArabic: "ahlan habibi" → "أهلان حبيبي"
QuickArabic: Facebook insertion succeeded!
```

## If Errors Persist
Facebook may be fundamentally incompatible with browser extensions that modify text. In that case, the extension popup method is the recommended workflow for Facebook users.