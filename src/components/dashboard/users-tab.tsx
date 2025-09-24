"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  events: number
  joined: string
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", email: "juan@email.com", events: 5, joined: "2024-01-15" },
  { id: 2, name: "María González", email: "maria@email.com", events: 12, joined: "2024-02-20" },
  { id: 3, name: "Carlos Rodríguez", email: "carlos@email.com", events: 8, joined: "2024-03-10" },
  { id: 4, name: "Ana López", email: "ana@email.com", events: 15, joined: "2024-01-05" },
  { id: 5, name: "Pedro Martínez", email: "pedro@email.com", events: 3, joined: "2024-04-12" },
  { id: 6, name: "Laura Sánchez", email: "laura@email.com", events: 9, joined: "2024-03-25" },
]

export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filtrar usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.events}</TableCell>
                  <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios que coincidan con la búsqueda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
