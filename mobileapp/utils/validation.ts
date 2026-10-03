export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateRegistration = (
  email: string,
  password: string
): string | null => {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (!isValidPassword(password)) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};
