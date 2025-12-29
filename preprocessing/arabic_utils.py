import re

def remove_diacritics(text: str) -> str:
    """
    Remove Arabic diacritics (Tashkeel) from text.
    Target characters:
    - Fathatan, Dammatan, Kasratan
    - Fatha, Damma, Kasra
    - Shadda, Sukun
    - Tatweel (Kashida)
    """
    # Range for basic diacritics, including tatweel and various mark characters
    tashkeel_pattern = re.compile(r'[\u064B-\u065F\u0640\u0670\u0652\u0651\u0650\u064F\u064E\u064D\u064C\u064B]')
    return tashkeel_pattern.sub('', text)

def normalize_alef(text: str) -> str:
    """
    Normalize Alef variations to bare Alef.
    Converts:
    - Alif with Hamza Above (أ)
    - Alif with Hamza Below (إ)
    - Alif with Madda Above (آ)
    to simple Alif (ا)
    """
    text = re.sub(r'[أإآ]', 'ا', text)
    # We consciously keep Alif Maqsura (ى) distinct from Ya (ي) as per standard Quranic typing,
    # but some normalizations map ى to ا. Given instructions, we stick to Alef normalization.
    return text

def normalize_arabic(text: str) -> str:
    """
    Full normalization pipeline:
    1. Remove diacritics
    2. Normalize Alef
    3. Remove punctuation
    4. Normalize whitespace
    """
    # Remove diacritics first
    text = remove_diacritics(text)
    
    # Normalize Alef
    text = normalize_alef(text)
    
    # Remove punctuation using a comprehensive regex
    # Includes standard Arabic and English punctuation
    punctuation_pattern = re.compile(r'[،؛؟\.,!?;:\-"\'\[\]\{\}\(\)]')
    text = punctuation_pattern.sub(' ', text)
    
    # Normalize whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def trim_istiadzah(text: str) -> str:
    """
    Detects and removes Isti'adzah (A'udhu billah...) from the beginning of the text.
    Strategy:
    1. Check if "Bismillah" matches. If so, return everything from Bismillah onwards
       (assuming user recited Isti'adzah then Bismillah, and we want to align with Bismillah-started textual reference).
    2. Fallback: If no Bismillah found (or it's not detected due to errors), check for Isti'adzah pattern at start and trim it.
    """
    
    # 1. Search for Bismillah (most reliable anchor)
    # Regex for Bismillah allowing characters in between (diacritics)
    # \u0628(Ba)...\u0633(Sin)...\u0645(Meem)...\u0627\u0644\u0644\u0647(Allah)
    bismillah_pattern = re.compile(r'[\u0628][\u064B-\u065F]*[\u0633][\u064B-\u065F]*[\u0645][\u064B-\u065F]*\s*[\u0627\u0644\u0644\u0647]', re.UNICODE)
    
    b_match = bismillah_pattern.search(text)
    if b_match:
        # If Bismillah is found
        # Check if it's not the very start (meaning something precedes it - likely Isti'adzah or silence/noise transcription)
        if b_match.start() > 2: # Allow small buffer
             # We assume everything before Bismillah is irrelevant (Isti'adzah or noise)
             # Verify if preceding part looks somewhat like Arabic or just return from Bismillah
             return text[b_match.start():]
    
    # 2. Fallback: Check for "A'udhu" pattern at the very start
    # Pattern: Match Start -> Alif-Ain-Waw-Dhal (A'udhu) ... -> Ra-Jim-Ya-Meem (Rajim)
    # \u0639 = Ain, \u0648 = Waw, \u0630 = Dhal, \u0631 = Ra, \u062c = Jim, \u064a = Ya, \u0645 = Meem
    
    raw_istiadzah_regex = re.compile(
        r'^\s*[\u0627\u0623\u0625\u0622][\u064B-\u065F]*[\u0639][\u064B-\u065F]*[\u0648][\u064B-\u065F]*[\u0630][\u064B-\u065F]*.*?' # A'udhu... starts
        r'[\u0631][\u064B-\u065F]*[\u062c][\u064B-\u065F]*[\u064a][\u064B-\u065F]*[\u0645][\u064B-\u065F]*', # ...Rajim ends
        re.DOTALL | re.UNICODE
    )
    
    match = raw_istiadzah_regex.match(text)
    if match:
        # Detected Isti'adzah at start.
        # Return everything after the match.
        return text[match.end():].strip()
        
    return text
