export interface ValidationError {
  field: string
  message: string
}

export const validateEmail = (email: string): string | null => {
  if (!email) return "L'email è obbligatoria"
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Inserisci un'email valida"
  }
  
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return "La password è obbligatoria"
  
  if (password.length < 6) {
    return "La password deve contenere almeno 6 caratteri"
  }
  
  return null
}

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string
): string | null => {
  if (!confirmation) return "Conferma la password"
  
  if (password !== confirmation) {
    return "Le password non corrispondono"
  }
  
  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} è obbligatorio`
  }
  return null
}