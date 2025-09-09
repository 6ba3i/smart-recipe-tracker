export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

export const validateNumber = (value, fieldName = 'Field', min = null, max = null) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  const number = Number(value);
  
  if (isNaN(number)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== null && number < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== null && number > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'Field') => {
  const numberValidation = validateNumber(value, fieldName);
  if (numberValidation) return numberValidation;
  
  if (Number(value) <= 0) {
    return `${fieldName} must be a positive number`;
  }
  
  return null;
};

export const validateCalories = (calories) => {
  return validateNumber(calories, 'Calories', 0, 10000);
};

export const validateServings = (servings) => {
  return validatePositiveNumber(servings, 'Servings');
};

export const validateCookingTime = (time) => {
  return validateNumber(time, 'Cooking time', 0, 1440); // Max 24 hours
};

export const validateRecipeName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Recipe name is required';
  }
  
  if (name.trim().length < 3) {
    return 'Recipe name must be at least 3 characters long';
  }
  
  if (name.trim().length > 100) {
    return 'Recipe name must not exceed 100 characters';
  }
  
  return null;
};

export const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return 'At least one ingredient is required';
  }
  
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    
    if (!ingredient.name || ingredient.name.trim().length === 0) {
      return `Ingredient ${i + 1} name is required`;
    }
    
    if (!ingredient.amount || ingredient.amount <= 0) {
      return `Ingredient ${i + 1} amount must be positive`;
    }
  }
  
  return null;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};