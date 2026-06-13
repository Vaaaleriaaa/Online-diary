export const validateGradeLetter = (letter) => {
  const russianLetterRegex = /^[А-Я]$/i;
  
  if (!letter || letter.trim() === '') {
    return { isValid: false, message: 'Буква класса обязательна' };
  }
  
  const trimmedLetter = letter.trim().toUpperCase();
  
  if (!russianLetterRegex.test(trimmedLetter)) {
    return { isValid: false, message: 'Буква класса должна быть одной русской буквой (А-Я)' };
  }
  
  return { isValid: true, message: '', value: trimmedLetter };
};