"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const salesData = [
  { name: "Ene", ventas: 4000, usuarios: 2400 },
  { name: "Feb", ventas: 3000, usuarios: 1398 },
  { name: "Mar", ventas: 2000, usuarios: 9800 },
  { name: "Abr", ventas: 2780, usuarios: 3908 },
  { name: "May", ventas: 1890, usuarios: 4800 },
  { name: "Jun", ventas: 2390, usuarios: 3800 },
  { name: "Jul", ventas: 3490, usuarios: 4300 },
]

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ventas: {
                  label: "Ventas",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ventas" fill="var(--color-ventas)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
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
                <Line type="monotone" dataKey="usuarios" stroke="var(--color-usuarios)" strokeWidth={3} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Tasa de Conversión</h4>
              <p className="text-2xl font-bold text-green-600">12.5%</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+2.1% vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Ticket Promedio</h4>
              <p className="text-2xl font-bold text-blue-600">$45.80</p>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <TrendingUp className="h-4 w-4" />
                <span>+$3.20 vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Satisfacción</h4>
              <p className="text-2xl font-bold text-purple-600">4.8/5</p>
              <div className="flex items-center gap-1 text-sm text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>+0.2 vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
