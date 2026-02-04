'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Plus, Minus, TrendingUp, Package, ArrowRight, Activity } from "lucide-react";
import { useProducts } from '@/lib/storage';
import { TransactionModal } from '@/components/TransactionModal';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const { products, transactions, loading } = useProducts();
  const [modalType, setModalType] = useState<'IN' | 'OUT' | null>(null);

  // Calculate Stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
  const lowStockItems = products.filter(p => p.quantity <= p.minStock);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Producto eliminado';

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen del estado del inventario.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setModalType('OUT')}>
            <Minus className="h-4 w-4" /> Registrar Salida
          </Button>
          <Button className="gap-2" onClick={() => setModalType('IN')}>
            <Plus className="h-4 w-4" /> Registrar Entrada
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Items registrados</p>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Artículos requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos (Total)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Transacciones históricas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Alertas de Stock Bajo</CardTitle>
            <CardDescription>
              Productos que están por debajo del mínimo establecido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todo parece estar en orden.</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-destructive">{item.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ {item.minStock} {item.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos movimientos registrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                No hay movimientos recientes
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.type === 'IN' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {t.type === 'IN' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getProductName(t.productId)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(t.date), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${t.type === 'IN' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'IN' ? '+' : '-'}{t.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
