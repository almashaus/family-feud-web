interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface PasswordRequirements {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
}

/**
 * Validates email format using regex
 */
function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim() === "") {
    errors.push("Email is required");
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  if (email.length > 254) {
    errors.push("Email is too long (max 254 characters)");
  }

  if (email.startsWith(".") || email.endsWith(".")) {
    errors.push("Email cannot start or end with a period");
  }

  if (email.includes("..")) {
    errors.push("Email cannot contain consecutive periods");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates password based on configurable requirements
 */
function validatePassword(
  password: string,
  requirements: PasswordRequirements = {}
): ValidationResult {
  const errors: string[] = [];

  const {
    minLength = 6,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
  } = requirements;

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (password.length > 128) {
    errors.push("Password is too long (max 128 characters)");
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates both email and password together
 */
function validateCredentials(
  email: string,
  password: string,
  passwordRequirements?: PasswordRequirements
) {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password, passwordRequirements);

  return {
    isEamilValid: emailValidation.isValid,
    isPasswordVaild: passwordValidation.isValid,
    errors: {
      emailError: emailValidation.errors,
      passwordError: passwordValidation.errors,
    },
  };
}

export {
  validateEmail,
  validatePassword,
  validateCredentials,
  type ValidationResult,
  type PasswordRequirements,
};
