'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProducts } from '@/lib/storage';
import { useUser } from '@/context/UserContext';
import { TransactionModal } from '@/components/TransactionModal';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { products, transactions, loading } = useProducts();
  const { user } = useUser();
  const [modalType, setModalType] = useState<'IN' | 'OUT' | null>(null);

  // Cálculos de estadísticas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;

  const recentTransactions = transactions.slice(0, 5);
  const last24hTransactions = transactions.filter(t =>
    isAfter(parseISO(t.date), subDays(new Date(), 1))
  ).length;

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Desconocido';

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Cargando datos del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Cabecera de Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Hola, {user} 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Este es el resumen del estado actual de tu inventario.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setModalType('IN')}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-5"
          >
            <Plus className="h-5 w-5" /> Entrada
          </Button>
          <Button
            onClick={() => setModalType('OUT')}
            variant="secondary"
            className="shadow-lg shadow-secondary/10 gap-2 h-11 px-5"
          >
            <Minus className="h-5 w-5" /> Salida
          </Button>
        </div>
      </div>

      {/* Grid de Estadísticas Rápidas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 to-transparent shadow-sm ring-1 ring-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">Productos Totales</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">En catálogo activo</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden border-none shadow-sm ring-1",
          lowStockProducts > 0 ? "bg-amber-500/10 ring-amber-500/20" : "bg-success/10 ring-success/20"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              lowStockProducts > 0 ? "text-amber-600" : "text-success"
            )}>Stock Bajo</CardTitle>
            <AlertTriangle className={cn("h-5 w-5", lowStockProducts > 0 ? "text-amber-500" : "text-success")} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Requieren reposición</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden border-none shadow-sm ring-1",
          outOfStock > 0 ? "bg-destructive/10 ring-destructive/20" : "bg-card ring-border"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              outOfStock > 0 ? "text-destructive" : "text-muted-foreground"
            )}>Agotados</CardTitle>
            <Clock className={cn("h-5 w-5", outOfStock > 0 ? "text-destructive" : "text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Sin existencias</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-blue-500/10 shadow-sm ring-1 ring-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Actividad (24h)</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{last24hTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Movimientos detectados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Tabla de Alerta de Stock Bajo */}
        <Card className="lg:col-span-4 border-none shadow-xl bg-card">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-500">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Productos Críticos</CardTitle>
            </div>
            <CardDescription>Artículos que necesitan atención inmediata para evitar desabastecimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  ¡Todo el stock está en niveles óptimos!
                </div>
              ) : (
                products
                  .filter(p => p.quantity <= p.minStock)
                  .sort((a, b) => (a.quantity / a.minStock) - (b.quantity / b.minStock))
                  .slice(0, 4)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 group hover:bg-accent/50 transition-all border border-transparent hover:border-amber-500/30">
                      <div className="space-y-1">
                        <p className="font-bold text-base">{product.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={cn(
                            "text-lg font-black",
                            product.quantity === 0 ? "text-destructive" : "text-amber-500"
                          )}>
                            {product.quantity} <span className="text-xs font-medium text-muted-foreground">{product.unit}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">Mín: {product.minStock}</p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setModalType('IN')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos Movimientos Rápido */}
        <Card className="lg:col-span-3 border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Última Actividad
            </CardTitle>
            <CardDescription>Los registros más recientes realizados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTransactions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No hay movimientos recientes.
                </div>
              ) : (
                recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 p-5 hover:bg-accent/30 transition-colors">
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                      t.type === 'IN' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {t.type === 'IN' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {getProductName(t.productId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.user} • {format(parseISO(t.date), "HH:mm, d MMM", { locale: es })}
                      </p>
                    </div>
                    <div className={cn(
                      "text-sm font-black",
                      t.type === 'IN' ? "text-success" : "text-destructive"
                    )}>
                      {t.type === 'IN' ? '+' : '-'}{t.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals de Acción */}
      {modalType && (
        <TransactionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSuccess={() => setModalType(null)}
        />
      )}
    </div>
  );
}
