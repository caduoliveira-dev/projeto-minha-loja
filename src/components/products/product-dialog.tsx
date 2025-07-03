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
import { Product, CreateProductData } from "@/lib/types/business"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSave: (data: CreateProductData) => Promise<void>
}

export function ProductDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSave 
}: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    cost_price: 0,
    sale_price: 0,
    stock_quantity: 0,
    moves_stock: true,
  })

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        // Edit mode
        setFormData({
          name: product.name,
          description: product.description || "",
          cost_price: product.cost_price,
          sale_price: product.sale_price,
          stock_quantity: product.stock_quantity,
          moves_stock: product.moves_stock,
        })
      } else {
        // Create mode
        setFormData({
          name: "",
          description: "",
          cost_price: 0,
          sale_price: 0,
          stock_quantity: 0,
          moves_stock: true,
        })
      }
    }
  }, [open, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast.error("Nome do produto é obrigatório")
        return
      }

      if (formData.cost_price < 0) {
        toast.error("Preço de custo não pode ser negativo")
        return
      }

      if (formData.sale_price < 0) {
        toast.error("Preço de venda não pode ser negativo")
        return
      }

      if (formData.moves_stock && formData.stock_quantity < 0) {
        toast.error("Quantidade em estoque não pode ser negativa")
        return
      }

      await onSave(formData)
      
      toast.success(
        product 
          ? "Produto atualizado com sucesso!" 
          : "Produto criado com sucesso!"
      )
      
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast.error("Erro ao salvar produto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof CreateProductData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    handleInputChange("moves_stock", checked)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? "Atualize as informações do produto" 
              : "Preencha as informações para criar um novo produto"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Notebook Dell Inspiron"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo (R$)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => handleInputChange("cost_price", parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => handleInputChange("sale_price", parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="moves_stock"
              checked={formData.moves_stock}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="moves_stock">Controlar estoque</Label>
          </div>

          {formData.moves_stock && (
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange("stock_quantity", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          )}

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
                : (product ? "Atualizar" : "Criar")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 