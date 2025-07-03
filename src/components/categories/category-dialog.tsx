"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product, CreateCategoryData, Category } from "@/lib/types/business"

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category | null
    onSave: (data: CreateCategoryData) => Promise<void>
  }

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    color: "",
    active: true,
  })

  useEffect(() => {
    if (open) {
      if (category) {
        // Edit mode
        setFormData({
          name: category.name,
          description: category.description || "",
          color: category.color || "",
          active: category.active,
        })
      } else {
        // Create mode
        setFormData({
          name: "",
          description: "",
          color: "",
          active: true,
        })
      }
    }
  }, [open, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast.error("Nome do produto é obrigatório")
        return
      }

      await onSave(formData)
      
      toast.success(
        category 
          ? "Categoria atualizada com sucesso!" 
          : "Categoria criada com sucesso!"
      )
      
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      toast.error("Erro ao salvar categoria")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof CreateCategoryData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    handleInputChange("active", checked)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Edite as informações da categoria'
              : 'Preencha as informações para criar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome da categoria"
                required
              />
            </div>
            

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descrição detalhada da categoria..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Ativo</Label>
            </div>


            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className="w-16 h-10 p-1"
                />
              </div>
            </div>
                <DialogFooter>
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    >
                    Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading 
                        ? "Salvando..." 
                        : (category ? "Atualizar" : "Criar")
                    }
                    </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  )
} 