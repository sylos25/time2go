"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input id="company-name" defaultValue="Time2Go" placeholder="Ingrese el nombre de la empresa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email de Contacto</Label>
              <Input
                id="contact-email"
                type="email"
                defaultValue="info@time2go.com"
                placeholder="Ingrese el email de contacto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={4}
              defaultValue="Plataforma líder en gestión de eventos y experiencias culturales"
              placeholder="Ingrese la descripción de la empresa"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">Recibir notificaciones sobre eventos importantes</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-notifications">Notificaciones Push</Label>
              <p className="text-sm text-muted-foreground">Recibir notificaciones push en el navegador</p>
            </div>
            <Switch id="push-notifications" />
          </div>

          <div className="pt-6 border-t">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
