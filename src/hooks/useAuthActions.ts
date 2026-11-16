import { authErrorMessage } from '../domain/authErrors'
import { requestPasswordReset, signInWithPassword, signUp, updatePassword } from '../services/auth'
import { useAsyncAction } from './useAsyncAction'

// Hooks das ações de autenticação, com mensagens em português.

const signInMessage = (e: unknown) => authErrorMessage(e, 'Não foi possível entrar. Tente de novo.')
const signUpMessage = (e: unknown) => authErrorMessage(e, 'Não foi possível criar a conta. Tente de novo.')
const resetMessage = (e: unknown) => authErrorMessage(e, 'Não foi possível enviar o link. Tente de novo.')
const updateMessage = (e: unknown) => authErrorMessage(e, 'Não foi possível trocar a senha. Tente de novo.')

export function useSignIn() {
  return useAsyncAction(signInWithPassword, signInMessage)
}

export function useSignUp() {
  return useAsyncAction(signUp, signUpMessage)
}

export function usePasswordResetRequest() {
  return useAsyncAction(requestPasswordReset, resetMessage)
}

export function useUpdatePassword() {
  return useAsyncAction(updatePassword, updateMessage)
}
