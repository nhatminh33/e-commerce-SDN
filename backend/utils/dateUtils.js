/**
 * Calculate number of days between two dates
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {number} - Number of days
 */
exports.calculateDaysInRange = (startDate, endDate) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUtc = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return Math.floor((endUtc - startUtc) / msPerDay) + 1; // +1 to include the end date
};

/**
 * Create an array of date strings (YYYY-MM-DD) within a range
 * @param {Date} startDate 
 * @param {number} daysCount 
 * @returns {string[]} - Array of date strings
 */
exports.createDateRangeArray = (startDate, daysCount) => {
    const dateArray = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < daysCount; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        dateArray.push(currentDate.toISOString().split('T')[0]);
    }
    
    return dateArray;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string} - Formatted date string
 */
exports.formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Get start and end date of a month
 * @param {number} year 
 * @param {number} month - 1-based month (1-12)
 * @returns {Object} - Object with start and end date
 */
exports.getMonthDateRange = (year, month) => {
    // Month is 1-based, so for January we use 0
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Get last day of month
    
    return {
        startDate,
        endDate
    };
};

/**
 * Get date range for the last N days
 * @param {number} days 
 * @returns {Object} - Object with start and end date
 */
exports.getLastNDaysRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return {
        startDate,
        endDate
    };
}; 