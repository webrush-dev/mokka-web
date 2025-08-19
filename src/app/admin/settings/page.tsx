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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Trash2, Plus, Clock, Calendar, Settings as SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'

interface BusinessHours {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
  note?: string
}

interface Holiday {
  id: string
  name: string
  nameEn?: string
  date: string
  isClosed: boolean
  openTime?: string
  closeTime?: string
  note?: string
}

interface Setting {
  id: string
  key: string
  value: string
  description?: string
}

const daysOfWeek = [
  { value: 0, label: 'Неделя' },
  { value: 1, label: 'Понеделник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Сряда' },
  { value: 4, label: 'Четвъртък' },
  { value: 5, label: 'Петък' },
  { value: 6, label: 'Събота' }
]

export default function SettingsPage() {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hours')

  // Business Hours state
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false)
  const [editingHours, setEditingHours] = useState<BusinessHours | null>(null)
  const [hoursFormData, setHoursFormData] = useState({
    dayOfWeek: 1,
    openTime: '08:00',
    closeTime: '22:00',
    isOpen: true,
    note: ''
  })

  // Holidays state
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    nameEn: '',
    date: '',
    isClosed: true,
    openTime: '',
    closeTime: '',
    note: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [hoursRes, holidaysRes, settingsRes] = await Promise.all([
        fetch('/api/admin/settings/hours'),
        fetch('/api/admin/settings/holidays'),
        fetch('/api/admin/settings/general')
      ])

      if (hoursRes.ok) {
        const hoursData = await hoursRes.json()
        setBusinessHours(hoursData.businessHours)
      }

      if (holidaysRes.ok) {
        const holidaysData = await holidaysRes.json()
        setHolidays(holidaysData.holidays)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Грешка при зареждане на настройките')
    } finally {
      setIsLoading(false)
    }
  }

  // Business Hours handlers
  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingHours ? `/api/admin/settings/hours/${editingHours.id}` : '/api/admin/settings/hours'
      const method = editingHours ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hoursFormData)
      })

      if (response.ok) {
        toast.success(editingHours ? 'Работното време е обновено!' : 'Работното време е създадено!')
        setIsHoursDialogOpen(false)
        resetHoursForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Грешка при запазване')
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      toast.error('Грешка при запазване')
    }
  }

  const handleHoursEdit = (hours: BusinessHours) => {
    setEditingHours(hours)
    setHoursFormData({
      dayOfWeek: hours.dayOfWeek,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isOpen: hours.isOpen,
      note: hours.note || ''
    })
    setIsHoursDialogOpen(true)
  }

  const resetHoursForm = () => {
    setHoursFormData({
      dayOfWeek: 1,
      openTime: '08:00',
      closeTime: '22:00',
      isOpen: true,
      note: ''
    })
    setEditingHours(null)
  }

  // Holidays handlers
  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingHoliday ? `/api/admin/settings/holidays/${editingHoliday.id}` : '/api/admin/settings/holidays'
      const method = editingHoliday ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayFormData)
      })

      if (response.ok) {
        toast.success(editingHoliday ? 'Празникът е обновен!' : 'Празникът е създаден!')
        setIsHolidayDialogOpen(false)
        resetHolidayForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Грешка при запазване')
      }
    } catch (error) {
      console.error('Error saving holiday:', error)
      toast.error('Грешка при запазване')
    }
  }

  const handleHolidayEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setHolidayFormData({
      name: holiday.name,
      nameEn: holiday.nameEn || '',
      date: holiday.date.split('T')[0],
      isClosed: holiday.isClosed,
      openTime: holiday.openTime || '',
      closeTime: holiday.closeTime || '',
      note: holiday.note || ''
    })
    setIsHolidayDialogOpen(true)
  }

  const resetHolidayForm = () => {
    setHolidayFormData({
      name: '',
      nameEn: '',
      date: '',
      isClosed: true,
      openTime: '',
      closeTime: '',
      note: ''
    })
    setEditingHoliday(null)
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
      <div>
        <h1 className="text-2xl font-bold text-mokka-gy">Настройки</h1>
        <p className="text-mokka-gy/70">Управлявайте работното време, празници и общи настройки</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hours" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Работно време</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Празници</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Общи</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-mokka-gy">Работно време</h2>
            <Dialog open={isHoursDialogOpen} onOpenChange={setIsHoursDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetHoursForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добави работно време
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-mokka-tq/20 shadow-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingHours ? 'Редактиране на работно време' : 'Ново работно време'}
                  </DialogTitle>
                  <DialogDescription>
                    Задайте работното време за конкретен ден
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleHoursSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="dayOfWeek">Ден от седмицата</Label>
                    <Select
                      value={hoursFormData.dayOfWeek.toString()}
                      onValueChange={(value) => setHoursFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map(day => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openTime">Отваряне</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={hoursFormData.openTime}
                        onChange={(e) => setHoursFormData(prev => ({ ...prev, openTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime">Затваряне</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={hoursFormData.closeTime}
                        onChange={(e) => setHoursFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isOpen"
                      checked={hoursFormData.isOpen}
                      onCheckedChange={(checked) => setHoursFormData(prev => ({ ...prev, isOpen: checked }))}
                    />
                    <Label htmlFor="isOpen">Отворено</Label>
                  </div>

                  <div>
                    <Label htmlFor="note">Бележка</Label>
                    <Input
                      id="note"
                      value={hoursFormData.note}
                      onChange={(e) => setHoursFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Например: Кухнята затваря в 21:00"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsHoursDialogOpen(false)}>
                      Отказ
                    </Button>
                    <Button type="submit">
                      {editingHours ? 'Обнови' : 'Създай'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {businessHours.map((hours) => (
              <Card key={hours.id} className="border-mokka-tq/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="border-mokka-br text-mokka-br">
                        {daysOfWeek.find(d => d.value === hours.dayOfWeek)?.label}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-mokka-gy/60" />
                        <span className="text-mokka-gy">
                          {hours.openTime} - {hours.closeTime}
                        </span>
                      </div>
                      <Badge variant={hours.isOpen ? "default" : "secondary"}>
                        {hours.isOpen ? 'Отворено' : 'Затворено'}
                      </Badge>
                      {hours.note && (
                        <span className="text-sm text-mokka-gy/70">{hours.note}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHoursEdit(hours)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактирай
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-mokka-gy">Празници</h2>
            <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetHolidayForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добави празник
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-mokka-tq/20 shadow-xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingHoliday ? 'Редактиране на празник' : 'Нов празник'}
                  </DialogTitle>
                  <DialogDescription>
                    Задайте празничен ден и работното време
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleHolidaySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Име (BG)</Label>
                      <Input
                        id="name"
                        value={holidayFormData.name}
                        onChange={(e) => setHolidayFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nameEn">Име (EN)</Label>
                      <Input
                        id="nameEn"
                        value={holidayFormData.nameEn}
                        onChange={(e) => setHolidayFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={holidayFormData.date}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isClosed"
                      checked={holidayFormData.isClosed}
                      onCheckedChange={(checked) => setHolidayFormData(prev => ({ ...prev, isClosed: checked }))}
                    />
                    <Label htmlFor="isClosed">Затворено</Label>
                  </div>

                  {!holidayFormData.isClosed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="openTime">Отваряне</Label>
                        <Input
                          id="openTime"
                          type="time"
                          value={holidayFormData.openTime}
                          onChange={(e) => setHolidayFormData(prev => ({ ...prev, openTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="closeTime">Затваряне</Label>
                        <Input
                          id="closeTime"
                          type="time"
                          value={holidayFormData.closeTime}
                          onChange={(e) => setHolidayFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="note">Бележка</Label>
                    <Input
                      id="note"
                      value={holidayFormData.note}
                      onChange={(e) => setHolidayFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Например: Новогодишен ден"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsHolidayDialogOpen(false)}>
                      Отказ
                    </Button>
                    <Button type="submit">
                      {editingHoliday ? 'Обнови' : 'Създай'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {holidays.map((holiday) => (
              <Card key={holiday.id} className="border-mokka-br/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="border-mokka-br text-mokka-br">
                        {new Date(holiday.date).toLocaleDateString('bg-BG')}
                      </Badge>
                      <div>
                        <h4 className="font-medium text-mokka-gy">{holiday.name}</h4>
                        {holiday.nameEn && (
                          <p className="text-sm text-mokka-gy/60">{holiday.nameEn}</p>
                        )}
                      </div>
                      <Badge variant={holiday.isClosed ? "secondary" : "default"}>
                        {holiday.isClosed ? 'Затворено' : 'Отворено'}
                      </Badge>
                      {!holiday.isClosed && holiday.openTime && holiday.closeTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-mokka-gy/60" />
                          <span className="text-sm text-mokka-gy">
                            {holiday.openTime} - {holiday.closeTime}
                          </span>
                        </div>
                      )}
                      {holiday.note && (
                        <span className="text-sm text-mokka-gy/70">{holiday.note}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHolidayEdit(holiday)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактирай
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-mokka-gy">Общи настройки</h2>
            <p className="text-mokka-gy/70">Системни настройки и конфигурации</p>
          </div>

          <div className="grid gap-4">
            {settings.map((setting) => (
              <Card key={setting.id} className="border-mokka-gy/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-mokka-gy">{setting.key}</h4>
                      {setting.description && (
                        <p className="text-sm text-mokka-gy/70">{setting.description}</p>
                      )}
                      <p className="text-sm text-mokka-gy/60 mt-1 font-mono bg-mokka-cr/50 p-2 rounded">
                        {setting.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
