export const MIN_PASSWORD_LENGTH = 8

// Devolve a mensagem de erro, ou null se estiver tudo certo.
export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (password !== confirmation) return 'As senhas não conferem.'
  return null
}
