export interface PasswordStrength {
  score: number; // 0-4 (0: muito fraca, 1: fraca, 2: regular, 3: forte, 4: muito forte)
  feedback: string[];
  isValid: boolean;
  color: string;
  label: string;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  
  // Critérios de força
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isLongEnough = password.length >= 12;
  
  // Calcular pontuação
  if (hasMinLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChars) score++;
  if (isLongEnough) score++;
  
  // Reduzir pontuação para senhas muito simples
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /123123/,
    /abc123/i
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
  }
  
  // Feedback baseado nos critérios não atendidos
  if (!hasMinLength) {
    feedback.push("Use pelo menos 8 caracteres");
  }
  if (!hasUpperCase) {
    feedback.push("Inclua pelo menos uma letra maiúscula");
  }
  if (!hasLowerCase) {
    feedback.push("Inclua pelo menos uma letra minúscula");
  }
  if (!hasNumbers) {
    feedback.push("Inclua pelo menos um número");
  }
  if (!hasSpecialChars) {
    feedback.push("Inclua pelo menos um caractere especial (!@#$%^&*)");
  }
  // Só sugerir 12+ caracteres se a senha ainda não for forte (score < 4)
  if (!isLongEnough && hasMinLength && score < 4) {
    feedback.push("Para maior segurança, use 12 ou mais caracteres");
  }
  
  // Determinar força final
  let strengthData: { color: string; label: string; isValid: boolean };
  
  if (score <= 1) {
    strengthData = { 
      color: "text-red-600 dark:text-red-400", 
      label: "Muito Fraca", 
      isValid: false 
    };
  } else if (score <= 2) {
    strengthData = { 
      color: "text-orange-600 dark:text-orange-400", 
      label: "Fraca", 
      isValid: false 
    };
  } else if (score <= 3) {
    strengthData = { 
      color: "text-yellow-600 dark:text-yellow-400", 
      label: "Regular", 
      isValid: true 
    };
  } else if (score <= 4) {
    strengthData = { 
      color: "text-blue-600 dark:text-blue-400", 
      label: "Forte", 
      isValid: true 
    };
  } else {
    strengthData = { 
      color: "text-green-600 dark:text-green-400", 
      label: "Muito Forte", 
      isValid: true 
    };
  }
  
  return {
    score,
    feedback,
    ...strengthData
  };
}

export const PASSWORD_REQUIREMENTS = [
  "Mínimo de 8 caracteres",
  "Pelo menos uma letra maiúscula",
  "Pelo menos uma letra minúscula", 
  "Pelo menos um número",
  "Pelo menos um caractere especial (!@#$%^&*)"
];