'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Trash2, X, Search, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

interface DeleteProductModalProps {
    onClose: () => void;
}

export function DeleteProductModal({ onClose }: DeleteProductModalProps) {
    const { products, deleteProduct } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que quieres eliminar "${name}"? Esta acción borrará también todos sus movimientos y no se puede deshacer.`)) {
            setIsDeleting(id);
            try {
                await deleteProduct(id);
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el producto");
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex items-center justify-between bg-destructive/5">
                    <div className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Eliminar Producto</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 bg-accent/30 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar producto a eliminar..."
                            className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive/50 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredProducts.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                            <AlertCircle className="h-8 w-8 opacity-20" />
                            <p className="text-sm font-medium">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-destructive/5 group transition-colors border border-transparent hover:border-destructive/10"
                                >
                                    <div className="min-w-0 pr-4">
                                        <p className="font-bold text-sm truncate uppercase tracking-tight">{product.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{product.category} • {product.quantity} {product.unit}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5 transition-all shrink-0"
                                        onClick={() => handleDelete(product.id, product.name)}
                                        disabled={isDeleting === product.id}
                                    >
                                        <Trash2 className={cn("h-4 w-4", isDeleting === product.id && "animate-pulse")} />
                                        <span className="hidden sm:inline">Eliminar</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/30">
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        Cerrar panel
                    </Button>
                </div>
            </div>
        </div>
    );
}
