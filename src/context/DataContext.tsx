'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

interface DataContextType {
    products: Product[];
    transactions: Transaction[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'updatedAt'>>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // 1. CARGA INICIAL DE DATOS
    useEffect(() => {
        const loadInitialData = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                const { data: pData } = await supabase.from('products').select('*').order('name');
                const { data: tData } = await supabase.from('transactions').select('*').order('date', { ascending: false });

                if (pData) setProducts(pData as Product[]);
                if (tData) setTransactions(tData as Transaction[]);
            } catch (err) {
                console.error("Error cargando base de datos:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();

        // 2. ESCUCHA ÚNICA EN TIEMPO REAL (La única que actualiza la pantalla)
        if (supabase) {
            const channel = supabase.channel('global_sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                    console.log('Cambio en Productos:', payload.eventType);
                    if (payload.eventType === 'INSERT') {
                        setProducts(prev => {
                            if (prev.some(p => p.id === payload.new.id)) return prev;
                            return [...prev, payload.new as Product].sort((a, b) => a.name.localeCompare(b.name));
                        });
                    }
                    if (payload.eventType === 'UPDATE') {
                        setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
                    }
                    if (payload.eventType === 'DELETE') {
                        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                    }
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
                    console.log('Nuevo Movimiento detectado');
                    setTransactions(prev => {
                        if (prev.some(t => t.id === payload.new.id)) return prev;
                        return [payload.new as Transaction, ...prev];
                    });
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, []);

    // 3. AÑADIR PRODUCTO (Solo envía a la nube)
    const addProduct = async (productData: Omit<Product, 'id' | 'updatedAt'>) => {
        if (!supabase) return;
        const newProduct = { ...productData, updatedAt: new Date().toISOString() };
        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) throw error;
    };

    // 4. ACTUALIZAR PRODUCTO (Solo envía a la nube)
    const updateProduct = async (id: string, updates: Partial<Product>) => {
        if (!supabase) return;
        const fullUpdates = { ...updates, updatedAt: new Date().toISOString() };
        const { error } = await supabase.from('products').update(fullUpdates).eq('id', id);
        if (error) throw error;
    };

    // 5. BORRAR PRODUCTO (Optimista e instantáneo)
    const deleteProduct = async (id: string) => {
        if (!supabase) return;

        // Lo quitamos de la pantalla inmediatamente
        setProducts(prev => prev.filter(p => p.id !== id));

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            console.error("Error al eliminar de Supabase:", error);
            // Si hubo error, podríamos recargar para asegurar consistencia
            const { data } = await supabase.from('products').select('*').order('name');
            if (data) setProducts(data as Product[]);
        }
    };

    // 6. REGISTRAR MOVIMIENTO (Solo envía a la nube)
    const addTransaction = async (txData: Omit<Transaction, 'id' | 'date'>) => {
        if (!supabase) return;

        const product = products.find(p => p.id === txData.productId);
        if (!product) throw new Error("Producto no encontrado");

        const newQuantity = Number(product.quantity) + (txData.type === 'IN' ? Number(txData.quantity) : -Number(txData.quantity));
        if (newQuantity < 0) throw new Error("Stock insuficiente");

        // Actualizamos stock y registramos transacción
        const { error: pError } = await supabase.from('products').update({ quantity: newQuantity, updatedAt: new Date().toISOString() }).eq('id', txData.productId);
        if (pError) throw pError;

        const newTx = { ...txData, date: new Date().toISOString(), user: user || 'Sistema' };
        const { error: tError } = await supabase.from('transactions').insert([newTx]);
        if (tError) throw tError;
    };

    const clearAllData = async () => {
        if (!supabase) return;
        await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    };

    return (
        <DataContext.Provider value={{
            products,
            transactions,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            addTransaction,
            clearAllData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
}
