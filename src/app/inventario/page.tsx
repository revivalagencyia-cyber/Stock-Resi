'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter, AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useData } from '@/context/DataContext';
import { AddProductForm } from '@/components/AddProductForm';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function InventoryPage() {
    const { products, deleteProduct } = useData();
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation(); // Evitar clics accidentales en la tarjeta
        if (confirm(`¿Eliminar "${name.toUpperCase()}" por completo?`)) {
            await deleteProduct(id);
        }
    };

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
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventario</h1>
                    <p className="text-muted-foreground mt-1">Gestión centralizada de stock.</p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className={cn("gap-2 w-full sm:w-auto h-11", showAddForm && "hidden")}
                >
                    <Plus className="h-5 w-5" /> Nuevo Producto
                </Button>
            </div>

            {showAddForm && (
                <div className="max-w-2xl mx-auto animate-in slide-in-from-top duration-300">
                    <AddProductForm
                        onCancel={() => setShowAddForm(false)}
                        onSuccess={() => setShowAddForm(false)}
                    />
                </div>
            )}

            {!showAddForm && (
                <>
                    <div className="flex items-center gap-4 bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Escribe el nombre del producto..."
                                className="pl-9 h-11 bg-background/50 border-transparent focus:border-primary focus:bg-background rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                        {filteredProducts.map((product) => {
                            const expStatus = getExpirationStatus(product.expirationDate);

                            return (
                                <Card key={product.id} className="group relative overflow-hidden transition-all hover:shadow-xl hover:border-primary/40 rounded-2xl border-border/50 bg-card/50">
                                    <div className="absolute top-2 right-2 flex gap-1 items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, product.id, product.name)}
                                            className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </button>
                                    </div>

                                    <CardHeader className="p-5 pb-3">
                                        <div className="space-y-2 pr-10">
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                                                {product.name}
                                            </CardTitle>
                                            <div className="flex">
                                                <span className="inline-flex items-center rounded-lg border bg-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 pt-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Existencias</p>
                                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-lg font-black border", getStatusColor(product.quantity, product.minStock))}>
                                                    {product.quantity}
                                                    <span className="text-[10px] font-bold uppercase opacity-80">{product.unit}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Mínimo</p>
                                                <p className="text-sm font-bold">{product.minStock} {product.unit}</p>
                                            </div>
                                        </div>

                                        {expStatus && (
                                            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border bg-accent/20", expStatus.color)}>
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                {expStatus.label.toUpperCase()}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                                <div className="max-w-xs mx-auto space-y-3">
                                    <Search className="h-10 w-10 mx-auto opacity-20" />
                                    <p className="text-lg font-medium italic">No se ha encontrado nada con ese nombre.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
