'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CATEGORIES, Category, Product } from '@/lib/types';
import { X, Plus, Save } from 'lucide-react';
import { useProducts } from '@/lib/storage';

interface AddProductFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function AddProductForm({ onCancel, onSuccess }: AddProductFormProps) {
    const { addProduct } = useProducts();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        quantity: 1,
        minStock: 1,
        unit: 'unidades',
        expirationDate: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            addProduct({
                name: formData.name,
                category: formData.category,
                quantity: Number(formData.quantity),
                minStock: Number(formData.minStock),
                unit: formData.unit,
                expirationDate: formData.expirationDate || undefined,
            });
            onSuccess();
        } catch (error) {
            console.error("Error adding product", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" /> Agregar Producto
                </h2>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input
                            id="name"
                            placeholder="Ej. Leche Entera"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <select
                            id="category"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiration">Caducidad</Label>
                        <Input
                            id="expiration"
                            type="date"
                            value={formData.expirationDate}
                            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad Actual</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="minStock">Stock Mínimo</Label>
                        <Input
                            id="minStock"
                            type="number"
                            min="1"
                            required
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" /> Guardar
                    </Button>
                </div>
            </form>
        </div>
    );
}
