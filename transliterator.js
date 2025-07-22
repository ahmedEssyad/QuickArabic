class ArabicTransliterator {
  constructor() {
    this.mapping = {
      // PRIORITY ORDER: Longer patterns first, then shorter ones
      
      // Common Arabic patterns and words (highest priority)
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      'inshallah': 'إن شاء الله',
      'mashallah': 'ما شاء الله',
      'astaghfirullah': 'أستغفر الله',
      
      // Definite articles (must come before 'al' alone)
      'al-': 'ال',
      'el-': 'ال',
      'il-': 'ال',
      
      // Multi-character combinations (longer first)
      'kh': 'خ',  // خ - Kha
      'gh': 'غ',  // غ - Ghayn  
      'sh': 'ش',  // ش - Sheen
      'th': 'ث',  // ث - Tha
      'dh': 'ذ',  // ذ - Thal
      'ch': 'تش', // چ - Che (Persian/Urdu)
      'zh': 'ژ',  // ژ - Zhe (Persian/Urdu)
      'ng': 'نغ', // نگ - Ng sound
      
      // Hamza forms - CRITICAL FIX!
      'aa': 'آ',   // آ - Alef with Madda
      'a2': 'أ',   // أ - Alef with Hamza above
      '2a': 'أ',   // أ - Alternative
      'a3': 'إ',   // إ - Alef with Hamza below  
      '3a': 'إ',   // إ - Alternative
      'o2': 'ؤ',   // ؤ - Waw with Hamza
      '2o': 'ؤ',   // ؤ - Alternative
      'i2': 'ئ',   // ئ - Ya with Hamza
      '2i': 'ئ',   // ئ - Alternative
      '2': 'ء',    // ء - Hamza alone
      
      // Basic consonants
      'b': 'ب',   // ب - Ba
      'p': 'پ',   // پ - Pa (Persian/Urdu)
      't': 'ت',   // ت - Ta
      'T': 'ط',   // ط - Ta (emphatic)
      'j': 'ج',   // ج - Jim
      'H': 'ح',   // ح - Ha (emphatic) - FIXED!
      'h': 'ه',   // ه - Ha (regular) - MAJOR FIX!
      'd': 'د',   // د - Dal
      'D': 'ض',   // ض - Dad (emphatic)
      'r': 'ر',   // ر - Ra
      'z': 'ز',   // ز - Zayn
      's': 'س',   // س - Seen
      'S': 'ص',   // ص - Sad (emphatic)
      'f': 'ف',   // ف - Fa
      'q': 'ق',   // ق - Qaf
      'k': 'ك',   // ك - Kaf
      'g': 'گ',   // گ - Gaf (Persian/Urdu)
      'l': 'ل',   // ل - Lam
      'm': 'م',   // م - Meem
      'n': 'ن',   // ن - Noon
      'w': 'و',   // و - Waw
      'y': 'ي',   // ي - Ya
      'v': 'ڤ',   // ڤ - Va (some dialects)
      
      // Emphatic/pharyngeal using numbers (chat Arabic)
      '3': 'ع',   // ع - Ayn
      '6': 'ط',   // ط - Ta (emphatic alternative)
      '7': 'ح',   // ح - Ha (alternative)
      '8': 'خ',   // خ - Kha (alternative)  
      '9': 'ق',   // ق - Qaf (alternative)
      '5': 'خ',   // خ - Kha (another alternative)
      '4': 'ذ',   // ذ - Thal (rare)
      
      // Vowels and long vowels
      'a': 'ا',   // ا - Alef
      'i': 'ي',   // ي - Ya (as vowel)
      'u': 'و',   // و - Waw (as vowel)
      'e': 'ي',   // ي - Ya (as E sound)
      'o': 'و',   // و - Waw (as O sound)
      
      // These will be handled specially at word endings only
      
      // Alternative spellings for difficult letters
      'x': 'كس',  // كس - X sound approximation
      'c': 'ك',   // ك - C as K
      
      // Regional variations
      'P': 'ف',   // ف - P approximation in Classical Arabic
      'V': 'ف',   // ف - V approximation in Classical Arabic
      'G': 'ج'    // ج - G as J in Egyptian Arabic
    };
    
    // Extended mappings for complete words and phrases
    this.extendedMapping = {
      // Islamic phrases (already in main mapping but kept for backward compatibility)
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'inshallah': 'إن شاء الله',
      'mashallah': 'ما شاء الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      'astaghfirullah': 'أستغفر الله',
      'lahaula': 'لا حول ولا قوة إلا بالله',
      'barakallahu': 'بارك الله',
      'jazakallahu': 'جزاك الله خيراً',
      
      // Greetings and common phrases
      'salam': 'سلام',
      'assalam': 'السلام',
      'assalamu3alaykum': 'السلام عليكم',
      'wa3alaykumassalam': 'وعليكم السلام',
      'ahlan': 'أهلاً',
      'ahlanwasahlan': 'أهلاً وسهلاً',
      'marhaba': 'مرحباً',
      'marhabik': 'مرحبك',  // feminine
      'shukran': 'شكراً',
      'kateer': 'كتير',
      'afwan': 'عفواً',
      '3afwan': 'عفواً',
      'habibi': 'حبيبي',
      'habibti': 'حبيبتي',
      'hayati': 'حياتي',
      'rohi': 'روحي',
      'albi': 'قلبي',
      
      // Family terms
      'abu': 'أبو',
      'um': 'أم',
      'ibn': 'ابن',
      'bint': 'بنت',
      'akh': 'أخ',
      'ukht': 'أخت',
      'baba': 'بابا',
      'mama': 'ماما',
      'teta': 'تيتا',
      'jiddo': 'جدو',
      
      // Question words and interrogatives
      'shu': 'شو',
      'sheno': 'شينو',
      'esh': 'إيش',
      'eish': 'إيش',
      'kayf': 'كيف',
      'kifak': 'كيفك',
      'kifik': 'كيفك', // feminine
      'shu2akhbarak': 'شو أخبارك',
      'wen': 'وين',
      'fein': 'فين',
      'meta': 'متى',
      'mata': 'متى',
      'lesh': 'ليش',
      'leih': 'ليه',
      'min': 'مين',
      'mino': 'مينو',
      
      // Common verbs
      'ruh': 'روح',
      'ta3al': 'تعال',
      'ta3ali': 'تعالي', // feminine
      'imshi': 'امشي',
      'aruh': 'أروح',
      'anam': 'أنام',
      'akul': 'آكل',
      'ashrab': 'أشرب',
      'ashouf': 'أشوف',
      'asma3': 'أسمع',
      'aktib': 'أكتب',
      'aqra': 'أقرأ',
      
      // Time and days
      'yom': 'يوم',
      'youm': 'يوم',
      'sahar': 'سهر',
      'leil': 'ليل',
      'sabah': 'صباح',
      'masa': 'مساء',
      'nahar': 'نهار',
      'sayi': 'صيف',
      'shita': 'شتا',
      
      // Numbers in Arabic
      'wahed': 'واحد',
      'itnen': 'اثنين',
      'tlate': 'تلاتة',
      'arba3': 'أربعة',
      'khamse': 'خمسة',
      'site': 'ستة',
      'saba3': 'سبعة',
      'tmane': 'تمانية',
      'tis3a': 'تسعة',
      '3ashara': 'عشرة',
      
      // Colors
      'abyad': 'أبيض',
      'aswad': 'أسود',
      'ahmar': 'أحمر',
      'akhdar': 'أخضر',
      'azraq': 'أزرق',
      'asfar': 'أصفر',
      'banafsaji': 'بنفسجي',
      'wardi': 'وردي',
      
      // Common adjectives
      'kibeer': 'كبير',
      'sgheer': 'صغير',
      'taweel': 'طويل',
      'qaseer': 'قصير',
      'helou': 'حلو',
      'helu': 'حلو',
      'jemeel': 'جميل',
      'jameel': 'جميل',
      'sa3b': 'صعب',
      'sahel': 'سهل',
      'jdeed': 'جديد',
      'qadeem': 'قديم',
      
      // Food and drink
      'khubz': 'خبز',
      'lahem': 'لحمة',
      'samak': 'سمك',
      'ruz': 'رز',
      'makarona': 'مكرونة',
      'salata': 'سلطة',
      'shawar': 'شاورما',
      'falafel': 'فلافل',
      'hommus': 'حمص',
      'tabbule': 'تبولة',
      'qahwe': 'قهوة',
      'shai': 'شاي',
      'mai': 'مي',
      'mayy': 'ميّ'
    };
    
    // Initialize settings
    this.loadSettings();
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        customMappings: {},
        enabledSites: [],
        triggerMethod: 'ctrl-space',
        previewEnabled: true
      });
      
      this.customMappings = result.customMappings;
      this.enabledSites = result.enabledSites;
      this.triggerMethod = result.triggerMethod;
      this.previewEnabled = result.previewEnabled;
    } catch (error) {
      console.log('QuickArabic: Using default settings');
      this.customMappings = {};
      this.enabledSites = [];
      this.triggerMethod = 'ctrl-space';
      this.previewEnabled = true;
    }
  }
  
  transliterate(text) {
    if (!text || typeof text !== 'string') return '';
    
    let result = text.toLowerCase().trim();
    
    // First check extended mappings for complete words
    const lowerText = result.toLowerCase();
    if (this.extendedMapping[lowerText]) {
      return this.extendedMapping[lowerText];
    }
    
    // Check custom mappings
    if (this.customMappings[lowerText]) {
      return this.customMappings[lowerText];
    }
    
    // SMART TRANSLITERATION: Handle word endings first, then do character-by-character
    result = this.handleWordEndings(result);
    result = this.handleCharacterMapping(result);
    result = this.handleDefiniteArticles(result);
    result = this.handleUnmappedCharacters(result);
    
    return result;
  }
  
  handleWordEndings(text) {
    // Handle ta marbuta endings correctly
    // Only at word boundaries, not in middle of words
    text = text.replace(/ah$/g, 'ة');     // word ending with ah → ة
    text = text.replace(/at$/g, 'ة');     // word ending with at → ة  
    text = text.replace(/eh$/g, 'ة');     // word ending with eh → ة
    text = text.replace(/it$/g, 'ة');     // word ending with it → ة
    
    // Handle hamza endings
    text = text.replace(/a2$/g, 'أ');     // word ending with a2 → أ
    text = text.replace(/2a$/g, 'أ');     // word ending with 2a → أ
    
    return text;
  }
  
  handleCharacterMapping(text) {
    // Create a copy of mapping without problematic endings
    const safeMapping = { ...this.mapping };
    
    // Remove endings that should only be at word boundaries
    delete safeMapping['ah'];
    delete safeMapping['at'];  
    delete safeMapping['eh'];
    delete safeMapping['it'];
    
    // Sort by length (longest first) for proper pattern matching
    const sortedKeys = Object.keys(safeMapping).sort((a, b) => b.length - a.length);
    
    // Apply each mapping pattern
    for (const latinChar of sortedKeys) {
      const arabicChar = safeMapping[latinChar];
      // Use word boundary-aware replacement for better accuracy
      text = text.replace(new RegExp(latinChar, 'g'), arabicChar);
    }
    
    return text;
  }
  
  handleDefiniteArticles(text) {
    // Handle definite articles at word beginnings
    text = text.replace(/^al-/g, 'ال');
    text = text.replace(/^el-/g, 'ال');
    text = text.replace(/^il-/g, 'ال');
    
    return text;
  }
  
  handleUnmappedCharacters(text) {
    // Keep spaces and punctuation
    return text.replace(/[a-zA-Z]/g, (char) => {
      // If it's still a Latin character, try some fallbacks
      const fallbacks = {
        'p': 'ب', // No P in Arabic, use B
        'v': 'ف', // No V in Arabic, use F
        'e': 'ي', // E often becomes I/Y
        'o': 'و'  // O often becomes W/U
      };
      return fallbacks[char.toLowerCase()] || char;
    });
  }
  
  // Method to get word boundaries for cursor-based conversion
  getWordAtPosition(text, position) {
    if (!text || position < 0 || position > text.length) {
      return { word: '', start: position, end: position };
    }
    
    // Define word boundary characters (anything that's not a letter or number)
    const wordBoundary = /[^a-zA-Z0-9\u0600-\u06FF]/;
    
    let start = position;
    let end = position;
    
    // Find start of word
    while (start > 0 && !wordBoundary.test(text[start - 1])) {
      start--;
    }
    
    // Find end of word
    while (end < text.length && !wordBoundary.test(text[end])) {
      end++;
    }
    
    return {
      word: text.substring(start, end),
      start: start,
      end: end
    };
  }
  
  // Check if current site is enabled
  isSiteEnabled(url) {
    if (this.enabledSites.length === 0) {
      return true; // If no specific sites configured, enable everywhere
    }
    
    return this.enabledSites.some(site => url.includes(site));
  }
  
  // Add custom mapping
  async addCustomMapping(latin, arabic) {
    this.customMappings[latin.toLowerCase()] = arabic;
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
  
  // Remove custom mapping
  async removeCustomMapping(latin) {
    delete this.customMappings[latin.toLowerCase()];
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  window.ArabicTransliterator = ArabicTransliterator;
}