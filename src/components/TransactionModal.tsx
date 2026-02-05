'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useProducts } from '@/lib/storage';
import { X, Save, ArrowRightLeft } from 'lucide-react';

interface TransactionModalProps {
    type: 'IN' | 'OUT';
    onClose: () => void;
    onSuccess: () => void;
}

export function TransactionModal({ type, onClose, onSuccess }: TransactionModalProps) {
    const { products, addTransaction } = useProducts();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: 1,
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addTransaction({
                productId: formData.productId,
                type: type,
                quantity: Number(formData.quantity),
                notes: formData.notes,
            });
            onSuccess();
        } catch (error) {
            console.error("Error adding transaction", error);
            alert(error instanceof Error ? error.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 md:p-6 shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-border/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                        {type === 'IN' ? 'Registrar Entrada' : 'Registrar Salida'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product">Producto</Label>
                        <select
                            id="product"
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        >
                            <option value="" disabled>Selecciona un producto</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">
                                    {p.name} ({p.quantity} {p.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (Opcional)</Label>
                        <Input
                            id="notes"
                            placeholder="Ej. Compra semanal, Uso diario..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.productId}
                            className={`gap-2 ${type === 'OUT' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
                        >
                            <Save className="h-4 w-4" /> {type === 'IN' ? 'Añadir Stock' : 'Confirmar Salida'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
