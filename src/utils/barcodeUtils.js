/**
 * barcodeUtils.js – Pure JS Code 128B barcode encoder
 * Converts text strings to barcode bar patterns for SVG rendering.
 * No external dependencies needed.
 */

// Code 128 bar patterns (each is an 11-module binary pattern, stop is 13)
// Stored as strings to preserve leading zeros (though Code128 patterns don't have them)
const BARS = [
    '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
    '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
    '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
    '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
    '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
    '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
    '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
    '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
    '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
    '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
    '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
    '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
    '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
    '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
    '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
    '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
    '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
    '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
    '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
    '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
    '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
    '11010011100', '1100011101011', // Stop pattern (13 modules)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

/**
 * Encode a string using Code 128B encoding
 * @param {string} text - The text to encode
 * @returns {string} Binary string of bars (1=black, 0=white)
 */
function encodeCode128B(text) {
    if (!text || text.length === 0) return '';

    const codes = [];
    // Start with Code B
    codes.push(START_CODE_B);

    // Encode each character
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) - 32; // Code 128B offset
        if (charCode < 0 || charCode > 95) {
            // Skip unsupported characters
            continue;
        }
        codes.push(charCode);
    }

    // Calculate checksum
    let checksum = codes[0]; // Start code value
    for (let i = 1; i < codes.length; i++) {
        checksum += codes[i] * i;
    }
    checksum = checksum % 103;
    codes.push(checksum);

    // Add stop code
    codes.push(STOP_CODE);

    // Convert codes to bar pattern string
    let binaryString = '';
    for (let i = 0; i < codes.length; i++) {
        binaryString += BARS[codes[i]];
    }

    return binaryString;
}

/**
 * Generate bar specifications from binary string for SVG rendering
 * @param {string} binaryString - Binary string (1=black, 0=white)
 * @param {number} moduleWidth - Width of each module in pixels (default 0.7)
 * @param {number} height - Height of bars in pixels (default 18)
 * @returns {Array<{x: number, w: number, h: number}>} Array of bar specs (only black bars)
 */
function generateBarSpecs(binaryString, moduleWidth = 0.7, height = 18) {
    if (!binaryString) return [];

    const bars = [];
    let x = 0;
    let currentBarStart = -1;
    let currentBarWidth = 0;

    for (let i = 0; i <= binaryString.length; i++) {
        const bit = i < binaryString.length ? binaryString[i] : '0';

        if (bit === '1') {
            if (currentBarStart < 0) {
                currentBarStart = x;
                currentBarWidth = moduleWidth;
            } else {
                currentBarWidth += moduleWidth;
            }
        } else {
            if (currentBarStart >= 0) {
                bars.push({
                    x: currentBarStart,
                    w: currentBarWidth,
                    h: height,
                });
                currentBarStart = -1;
                currentBarWidth = 0;
            }
        }
        x += moduleWidth;
    }

    return bars;
}

/**
 * Get total barcode width in pixels
 * @param {string} binaryString - Binary string
 * @param {number} moduleWidth - Width of each module
 * @returns {number} Total width in pixels
 */
function getBarcodeWidth(binaryString, moduleWidth = 0.7) {
    return binaryString.length * moduleWidth;
}

export { encodeCode128B, generateBarSpecs, getBarcodeWidth };
