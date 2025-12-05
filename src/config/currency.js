/**
 * Currency Configuration
 *
 * This file manages the currency settings for the entire application.
 * You can change the currency dynamically by updating the CURRENCY object.
 */
import config from "../config/env";

const CURRENCY = {
  code: 'KWD',        // Currency code (USD, EUR, KWD, etc.)
  symbol: 'KWD',      // Currency symbol to display
  position: 'before', // 'before' or 'after' the amount
  decimals: 3,        // Number of decimal places (KWD uses 3 decimals)
  separator: '.',     // Decimal separator
  delimiter: ','      // Thousands delimiter
};

/**
 * Round price up to nearest 0.005 (ceiling to nearest half fils for KWD)
 * Always rounds UP to the next 0.005 increment
 * @param {number} amount - The amount to round
 * @returns {number} - Rounded amount (always rounded up)
 */
export const ceilingPrice = (amount) => {
  const num = parseFloat(amount) || 0;
  // Always round UP to nearest 0.005 (multiply by 200, ceiling, then divide by 200)
  return Math.ceil(num * 200) / 200;
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the currency symbol
 * @param {boolean} applyCeiling - Whether to apply ceiling rounding (default: true for KWD)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true, applyCeiling = true) => {
  let num = parseFloat(amount) || 0;
  
  // Apply ceiling rounding if enabled (for KWD, always round up to nearest 0.005)
  if (applyCeiling && CURRENCY.code === 'KWD') {
    num = ceilingPrice(num);
  }
  
  const formatted = num
    .toFixed(CURRENCY.decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY.delimiter)
    .replace(".", CURRENCY.separator);

  if (!includeSymbol) {
    return formatted;
  }

  return CURRENCY.position === "before"
    ? `${CURRENCY.symbol} ${formatted}`
    : `${formatted} ${CURRENCY.symbol}`;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = () => CURRENCY.symbol;

/**
 * Get currency code
 */
export const getCurrencyCode = () => CURRENCY.code;

/**
 * Update currency settings
 */
export const updateCurrency = (newSettings) => {
  Object.assign(CURRENCY, newSettings);
};

/**
 * Fetch currencies from API and update the default currency
 */
export const loadCurrencyFromAPI = async () => {
  try {
    const res = await fetch(`${config.API_BASE_URL}/front/currencies`);
    const data = await res.json();

    if (data.status && Array.isArray(data.data)) {
      // Find default currency
      const defaultCurrency = data.data.find((c) => c.is_default === 1);

      if (defaultCurrency) {
        // KWD always uses 3 decimal places
        const currencyCode = defaultCurrency.name || defaultCurrency.code || '';
        const decimals = currencyCode.toUpperCase() === 'KWD' ? 3 : (defaultCurrency.decimals || CURRENCY.decimals);
        
        updateCurrency({
          code: defaultCurrency.name,
          symbol: defaultCurrency.sign,
          value: defaultCurrency.value,
          decimals: decimals,
        });
      }
    }
  } catch (err) {
    console.error("Error loading currencies:", err);
  }
};

export default CURRENCY;
