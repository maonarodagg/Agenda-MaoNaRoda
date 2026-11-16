// Erro de autenticação com o código do Supabase (ex.: invalid_credentials).
export class AuthFailure extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.name = 'AuthFailure'
    this.code = code
  }
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar. Procure o link que enviamos na sua caixa de entrada.',
  user_already_exists: 'Já existe uma conta com este e-mail. Use "Entrar".',
  email_exists: 'Já existe uma conta com este e-mail. Use "Entrar".',
  weak_password: 'Senha fraca. Use pelo menos 8 caracteres.',
  same_password: 'A nova senha precisa ser diferente da atual.',
  over_email_send_rate_limit: 'Muitos e-mails enviados. Espere alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  email_address_invalid: 'E-mail inválido.',
  validation_failed: 'Confira os dados informados.',
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthFailure) return MESSAGES[error.code] ?? fallback
  return fallback
}
