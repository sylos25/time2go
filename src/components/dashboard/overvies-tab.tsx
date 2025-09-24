"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Ticket } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

interface Event {
  id: number
  name: string
  date: string
  attendees: number
  status: "Activo" | "Vendido" | "Próximo"
}

const salesData = [
  { name: "Ene", ventas: 4000, usuarios: 2400 },
  { name: "Feb", ventas: 3000, usuarios: 1398 },
  { name: "Mar", ventas: 2000, usuarios: 9800 },
  { name: "Abr", ventas: 2780, usuarios: 3908 },
  { name: "May", ventas: 1890, usuarios: 4800 },
  { name: "Jun", ventas: 2390, usuarios: 3800 },
  { name: "Jul", ventas: 3490, usuarios: 4300 },
]

const eventData = [
  { name: "Conciertos", value: 400 },
  { name: "Festivales", value: 300 },
  { name: "Teatro", value: 200 },
  { name: "Deportes", value: 100 },
]

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"]

const recentEvents: Event[] = [
  { id: 1, name: "Festival de Rock", date: "2024-08-15", attendees: 2500, status: "Activo" },
  { id: 2, name: "Obra de Teatro", date: "2024-08-20", attendees: 150, status: "Vendido" },
  { id: 3, name: "Concierto Jazz", date: "2024-08-25", attendees: 800, status: "Activo" },
  { id: 4, name: "Exposición Arte", date: "2024-09-01", attendees: 300, status: "Próximo" },
]

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1 text-sm">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>{Math.abs(change)}% vs mes anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const getStatusVariant = (status: Event["status"]) => {
  switch (status) {
    case "Activo":
      return "default"
    case "Vendido":
      return "destructive"
    case "Próximo":
      return "secondary"
    default:
      return "default"
  }
}

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ventas"
          value="$124,500"
          change={12.5}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <StatCard title="Eventos Activos" value="45" change={8.2} icon={Calendar} color="bg-blue-100 text-blue-600" />
        <StatCard
          title="Usuarios Nuevos"
          value="1,234"
          change={-3.4}
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Tickets Vendidos"
          value="8,567"
          change={15.8}
          icon={Ticket}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas y Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ventas: {
                  label: "Ventas",
                  color: "hsl(var(--chart-1))",
                },
                usuarios: {
                  label: "Usuarios",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="ventas" stroke="var(--color-ventas)" strokeWidth={2} />
                <Line type="monotone" dataKey="usuarios" stroke="var(--color-usuarios)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                conciertos: { label: "Conciertos", color: COLORS[0] },
                festivales: { label: "Festivales", color: COLORS[1] },
                teatro: { label: "Teatro", color: COLORS[2] },
                deportes: { label: "Deportes", color: COLORS[3] },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={eventData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                >
                  {eventData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Asistentes</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.attendees.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
