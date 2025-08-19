'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2, Plus, Coffee, Utensils, Wine, Cake } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItem {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  category: string
  price: number
  isAvailable: boolean
  isFeatured: boolean
  imageUrl?: string
  allergens?: string
  tags?: string
}

interface FormData {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: string
  price: number
  isAvailable: boolean
  isFeatured: boolean
  imageUrl: string
  allergens: string
  tags: string
}

const categories = [
  { value: 'coffee', label: 'Кафе', icon: Coffee },
  { value: 'food', label: 'Храна', icon: Utensils },
  { value: 'drink', label: 'Напитки', icon: Wine },
  { value: 'dessert', label: 'Десерти', icon: Cake }
]

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    category: 'coffee',
    price: 0,
    isAvailable: true,
    isFeatured: false,
    imageUrl: '',
    allergens: '',
    tags: ''
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu')
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data.menuItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Грешка при зареждане на менюто')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingItem ? `/api/admin/menu/${editingItem.id}` : '/api/admin/menu'
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingItem ? 'Артикулът е обновен!' : 'Артикулът е създаден!')
        setIsDialogOpen(false)
        resetForm()
        fetchMenuItems()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Грешка при запазване')
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast.error('Грешка при запазване')
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този артикул?')) return
    
    try {
      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Артикулът е изтрит!')
        fetchMenuItems()
      } else {
        toast.error('Грешка при изтриване')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Грешка при изтриване')
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description || '',
      descriptionEn: item.descriptionEn || '',
      category: item.category,
      price: item.price,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      imageUrl: item.imageUrl || '',
      allergens: item.allergens || '',
      tags: item.tags || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      category: 'coffee',
      price: 0,
      isAvailable: true,
      isFeatured: false,
      imageUrl: '',
      allergens: '',
      tags: ''
    })
    setEditingItem(null)
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : Coffee
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : 'Кафе'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-mokka-gy">Зареждане...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mokka-gy">Управление на меню</h1>
          <p className="text-mokka-gy/70">Създавайте и редактирайте артикули в менюто</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Нов артикул
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-mokka-tq/20 shadow-xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Редактиране на артикул' : 'Нов артикул'}
              </DialogTitle>
              <DialogDescription>
                Попълнете информацията за артикула
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Име (BG)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameEn">Име (EN)</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <category.icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Цена (в стотинки)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание (BG)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="descriptionEn">Описание (EN)</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL на изображение</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergens">Алергени (разделени със запетая)</Label>
                  <Input
                    id="allergens"
                    value={formData.allergens}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
                    placeholder="мляко, ядки, глютен"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Тагове (разделени със запетая)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="веган, без глютен"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="isAvailable">Достъпен</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="isFeatured">Препоръчан</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отказ
                </Button>
                <Button type="submit">
                  {editingItem ? 'Обнови' : 'Създай'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {menuItems.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category)
          return (
            <Card key={item.id} className="border-mokka-tq/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-mokka-tq/20 rounded-full flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-mokka-tq" />
                    </div>
                    <div>
                      <CardTitle className="text-mokka-gy">{item.name}</CardTitle>
                      {item.nameEn && (
                        <p className="text-sm text-mokka-gy/60">{item.nameEn}</p>
                      )}
                      <CardDescription className="text-mokka-gy/70">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-mokka-br text-mokka-br">
                      {(item.price / 100).toFixed(2)} лв
                    </Badge>
                    <Badge variant={item.isAvailable ? "default" : "secondary"}>
                      {item.isAvailable ? 'Достъпен' : 'Недостъпен'}
                    </Badge>
                    {item.isFeatured && (
                      <Badge variant="default" className="bg-mokka-tq text-white">
                        Препоръчан
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактирай
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Изтрий
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="border-mokka-tq text-mokka-tq">
                    {getCategoryLabel(item.category)}
                  </Badge>
                  {item.allergens && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-mokka-gy/70">Алергени:</span>
                      {item.allergens.split(',').map((allergen, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {allergen.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.tags && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-mokka-gy/70">Тагове:</span>
                      {item.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
