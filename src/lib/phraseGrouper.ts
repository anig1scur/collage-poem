import type { Word } from 'tesseract.js';
import type { Phrase } from '$lib/services/canvasService';

export function groupWordsIntoPhrases(words: Word[]): Phrase[] {
    if (!words.length) return [];

    const phrases: Phrase[] = [];
    let currentPhraseWords: Word[] = [];
    const delimiters = ['，', '。', '！', '？', ' ', ',', '.', '!', '?', ':', '：'];
    const maxLength = 20;

    const finalizeCurrentPhrase = () => {
        if (currentPhraseWords.length > 0) {
            const combinedText = currentPhraseWords.map(w => w.text).join('');
            if (combinedText.trim().length > 1) { // Only save meaningful phrases
                const combinedBbox = {
                    x0: Math.min(...currentPhraseWords.map(w => w.bbox.x0)),
                    y0: Math.min(...currentPhraseWords.map(w => w.bbox.y0)),
                    x1: Math.max(...currentPhraseWords.map(w => w.bbox.x1)),
                    y1: Math.max(...currentPhraseWords.map(w => w.bbox.y1))
                };
                phrases.push({ text: combinedText, bbox: combinedBbox });
            }
        }
        currentPhraseWords = [];
    };

    words.forEach((currentWord) => {
        if (currentPhraseWords.length === 0) {
            currentPhraseWords.push(currentWord);
            return;
        }

        const firstWordOfPhrase = currentPhraseWords[0];
        const previousWord = currentPhraseWords[currentPhraseWords.length - 1];
        
        // Use Y-center for more reliable line checking
        const currentWordYCenter = (currentWord.bbox.y0 + currentWord.bbox.y1) / 2;
        const phraseY0 = firstWordOfPhrase.bbox.y0;
        const phraseY1 = firstWordOfPhrase.bbox.y1;
        
        const lineHeightTolerance = (phraseY1 - phraseY0) * 0.3;
        
        const onSameLine = currentWordYCenter > (phraseY0 - lineHeightTolerance) && currentWordYCenter < (phraseY1 + lineHeightTolerance);

        const combinedTextSoFar = currentPhraseWords.map(w => w.text).join('');
        const endsWithDelimiter = delimiters.includes(previousWord.text.slice(-1));
        const isTooLong = combinedTextSoFar.length >= maxLength;

        if (!onSameLine || endsWithDelimiter || isTooLong) {
            finalizeCurrentPhrase();
        }
        // Always add the word to a new or existing phrase
        currentPhraseWords.push(currentWord);
    });

    finalizeCurrentPhrase();
    return phrases;
}