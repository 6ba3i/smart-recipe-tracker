export const formatCalories = (calories) => {
  if (typeof calories !== 'number' || isNaN(calories)) {
    return '0 cal';
  }
  return `${Math.round(calories)} cal`;
};

export const formatMacronutrient = (grams, unit = 'g') => {
  if (typeof grams !== 'number' || isNaN(grams)) {
    return `0${unit}`;
  }
  return `${Math.round(grams * 10) / 10}${unit}`;
};

export const formatCookingTime = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) {
    return 'N/A';
  }
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const formatServings = (servings) => {
  if (typeof servings !== 'number' || isNaN(servings) || servings <= 0) {
    return 'N/A';
  }
  
  return servings === 1 ? '1 serving' : `${servings} servings`;
};

export const formatPrice = (price, currency = 'USD') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
};

export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateObj);
};

export const formatPercentage = (value, total, decimals = 1) => {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return '0%';
  }
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatNumber = (number, options = {}) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  const defaultOptions = {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0
  };
  
  return number.toLocaleString('en-US', { ...defaultOptions, ...options });
};

export const formatRecipeTitle = (title, maxLength = 50) => {
  if (!title || typeof title !== 'string') {
    return 'Untitled Recipe';
  }
  
  const cleanTitle = title.trim();
  
  if (cleanTitle.length <= maxLength) {
    return cleanTitle;
  }
  
  return cleanTitle.substring(0, maxLength - 3) + '...';
};

export const formatIngredientAmount = (amount, unit) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return unit || '';
  }
  
  const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
  return unit ? `${formattedAmount} ${unit}` : formattedAmount;
};

