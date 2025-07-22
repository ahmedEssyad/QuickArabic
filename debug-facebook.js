// Debug script for Facebook text insertion issues
// To use: paste this into Facebook's browser console (F12)

function debugQuickArabic() {
    console.log('🔍 QuickArabic Facebook Debug Tool');
    
    // Find all possible text input elements on Facebook
    const textElements = document.querySelectorAll([
        '[contenteditable="true"]',
        '[role="textbox"]', 
        'textarea',
        'input[type="text"]',
        '.notranslate',
        '[data-testid*="status"]',
        '[data-testid*="composer"]'
    ].join(','));
    
    console.log(`Found ${textElements.length} text input elements:`);
    
    textElements.forEach((el, index) => {
        console.log(`${index + 1}. Element:`, el);
        console.log(`   - Tag: ${el.tagName}`);
        console.log(`   - ContentEditable: ${el.contentEditable}`);
        console.log(`   - Classes: ${el.className}`);
        console.log(`   - Data attributes: ${Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => `${a.name}="${a.value}"`).join(', ')}`);
        console.log(`   - Text content: "${el.textContent?.substring(0, 50)}..."`);
        console.log('---');
    });
    
    // Test simple text insertion
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.contentEditable === 'true' || activeElement.tagName === 'TEXTAREA')) {
        console.log('🎯 Active element found:', activeElement);
        
        // Test if we can insert Arabic text
        const testArabic = 'أهلاً';
        
        try {
            // Method 1: execCommand
            const success1 = document.execCommand('insertText', false, testArabic);
            console.log(`✅ execCommand result: ${success1}`);
            
            // Method 2: Direct manipulation
            activeElement.textContent = activeElement.textContent + testArabic;
            console.log(`✅ Direct textContent manipulation completed`);
            
            // Method 3: Paste simulation
            const clipboardEvent = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true
            });
            clipboardEvent.clipboardData.setData('text/plain', testArabic);
            const pasteResult = activeElement.dispatchEvent(clipboardEvent);
            console.log(`✅ Paste event result: ${pasteResult}`);
            
        } catch (error) {
            console.error('❌ Text insertion test failed:', error);
        }
        
    } else {
        console.log('⚠️ No active text element found. Click in a text field first.');
    }
    
    return {
        textElements,
        activeElement,
        totalElements: textElements.length
    };
}

// Auto-run debug
debugQuickArabic();

// Make it available globally
window.debugQuickArabic = debugQuickArabic;