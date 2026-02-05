'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter, AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useProducts } from '@/lib/storage';
import { AddProductForm } from '@/components/AddProductForm';
import { DeleteProductModal } from '@/components/DeleteProductModal';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function InventoryPage() {
    const { products } = useProducts();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (quantity: number, min: number) => {
        if (quantity === 0) return "text-destructive bg-destructive/10 border-destructive/20";
        if (quantity <= min) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-success bg-success/10 border-success/20";
    };

    const getExpirationStatus = (dateStr?: string) => {
        if (!dateStr) return null;
        const days = differenceInDays(parseISO(dateStr), new Date());
        if (days < 0) return { label: 'Caducado', color: 'text-destructive' };
        if (days < 7) return { label: `Vence en ${days} días`, color: 'text-amber-500' };
        return { label: `Vence: ${dateStr}`, color: 'text-muted-foreground' };
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventario</h1>
                    <p className="text-muted-foreground mt-1">Gestiona todos los productos y existencias.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteModal(true)}
                        className={cn("gap-2 flex-1 sm:flex-initial text-destructive border-destructive/20 hover:bg-destructive/10", (showAddForm || products.length === 0) && "hidden")}
                    >
                        <Trash2 className="h-4 w-4" /> Eliminar
                    </Button>
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className={cn("gap-2 flex-1 sm:flex-initial", showAddForm && "hidden")}
                    >
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </Button>
                </div>
            </div>

            {showAddForm && (
                <div className="max-w-2xl mx-auto">
                    <AddProductForm
                        onCancel={() => setShowAddForm(false)}
                        onSuccess={() => setShowAddForm(false)}
                    />
                </div>
            )}

            {showDeleteModal && (
                <DeleteProductModal onClose={() => setShowDeleteModal(false)} />
            )}

            {!showAddForm && (
                <>
                    <div className="flex items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar productos..."
                                className="pl-9 bg-background/50 border-transparent focus:border-primary focus:bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const expStatus = getExpirationStatus(product.expirationDate);

                            return (
                                <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </CardTitle>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className={cn("px-2.5 py-1 rounded-md text-xs font-bold border", getStatusColor(product.quantity, product.minStock))}>
                                                {product.quantity}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Min Stock:</span>
                                                <span>{product.minStock}</span>
                                            </div>

                                            {expStatus && (
                                                <div className={cn("flex items-center gap-2 text-xs font-medium", expStatus.color)}>
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {expStatus.label}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                <p>No se encontraron productos.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
