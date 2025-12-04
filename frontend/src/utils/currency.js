// Currency conversion utilities

const CURRENCY_API_KEY = import.meta.env.VITE_CURRENCY_API_KEY || "";
const CURRENCY_API_URL = "https://openexchangerates.org/api/latest.json";

let exchangeRates = null;
let lastFetch = 0;
const CACHE_DURATION = 3600000; // 1 hour

export const currencyConverter = {
  // Fetch exchange rates
  fetchRates: async () => {
    const now = Date.now();
    if (exchangeRates && now - lastFetch < CACHE_DURATION) {
      return exchangeRates;
    }

    try {
      if (!CURRENCY_API_KEY) {
        console.warn("Currency API key not set, using fallback rates");
        // Fallback: 1:1 conversion
        exchangeRates = { USD: 1 };
        return exchangeRates;
      }

      const response = await fetch(
        `${CURRENCY_API_URL}?app_id=${CURRENCY_API_KEY}`
      );
      const data = await response.json();
      exchangeRates = data.rates;
      lastFetch = now;
      return exchangeRates;
    } catch (err) {
      console.error("Error fetching exchange rates:", err);
      // Fallback rates
      exchangeRates = { USD: 1 };
      return exchangeRates;
    }
  },

  // Convert amount from one currency to another
  convert: async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    const rates = await currencyConverter.fetchRates();
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;

    // Convert via USD
    const usdAmount = amount / fromRate;
    return (usdAmount * toRate).toFixed(2);
  },

  // Format currency
  format: (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount);
  }
};

export default currencyConverter;

