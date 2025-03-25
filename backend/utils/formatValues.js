/**
 * Format number to 2 decimal places
 * @param {number} amount 
 * @returns {number} - Formatted amount
 */
exports.formatAmountDecimal = (amount) => {
    return parseFloat(amount.toFixed(2));
};

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency - Default: USD
 * @returns {string} - Formatted currency string
 */
exports.formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Format percentage
 * @param {number} value 
 * @param {number} decimals - Default: 2
 * @returns {string} - Formatted percentage string
 */
exports.formatPercentage = (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num 
 * @returns {string} - Formatted number string
 */
exports.formatNumber = (num) => {
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}; 