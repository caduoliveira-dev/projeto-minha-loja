'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface PhoneInputProps {
  id: string
  name: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function PhoneInput({ 
  id, 
  name, 
  placeholder = "(11) 99999-9999", 
  required = false,
  value: externalValue,
  onChange: externalOnChange
}: PhoneInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue)
    }
  }, [externalValue])

  const formatPhone = (input: string) => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '')
    
    // Aplica a máscara
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatPhone(input)
    setValue(formatted)
    
    if (externalOnChange) {
      // Passa apenas os números para o componente pai
      const numbers = input.replace(/\D/g, '')
      externalOnChange(numbers)
    }
  }

  return (
    <Input
      id={id}
      name={name}
      type="tel"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
      maxLength={15}
    />
  )
} 