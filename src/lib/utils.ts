import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica se um erro é um erro de redirecionamento do Next.js
 * O Next.js lança um erro especial NEXT_REDIRECT para interromper a execução
 * e fazer redirecionamentos em Server Actions
 */
export function isNextRedirectError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  
  // Verifica se é o erro NEXT_REDIRECT do Next.js
  return (
    error.message.includes('NEXT_REDIRECT') ||
    error.constructor.name === 'NEXT_REDIRECT' ||
    // Verifica se tem a propriedade digest que o Next.js usa para redirecionamentos
    (error as any).digest?.includes('NEXT_REDIRECT')
  )
}
