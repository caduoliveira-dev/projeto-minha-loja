'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  {
    label: 'Pelo menos 6 caracteres',
    test: (password) => password.length >= 6,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Pelo menos um número',
    test: (password) => /\d/.test(password),
  },
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [validRequirements, setValidRequirements] = useState<boolean[]>([])

  useEffect(() => {
    const valid = requirements.map(req => req.test(password))
    setValidRequirements(valid)
  }, [password])

  if (!password) return null

  const strength = validRequirements.filter(Boolean).length
  const strengthPercentage = (strength / requirements.length) * 100

  const getStrengthColor = () => {
    if (strengthPercentage <= 25) return 'bg-red-500'
    if (strengthPercentage <= 50) return 'bg-orange-500'
    if (strengthPercentage <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {strength}/{requirements.length}
        </span>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {validRequirements[index] ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-red-500" />
            )}
            <span className={validRequirements[index] ? 'text-green-600' : 'text-red-600'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 