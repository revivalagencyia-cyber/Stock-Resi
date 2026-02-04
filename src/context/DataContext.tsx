'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

const STORAGE_KEYS = {
    PRODUCTS: 'stock-resi-products',
    TRANSACTIONS: 'stock-resi-transactions',
};

const TABLE_PRODUCTS = 'products';
const TABLE_TRANSACTIONS = 'transactions';

interface DataContextType {
    products: Product[];
    transactions: Transaction[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<Product>;
    updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'updatedAt'>>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<Transaction>;
    clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            // 1. Try Supabase
            if (supabase) {
                try {
                    const { data: pData, error: pError } = await supabase.from(TABLE_PRODUCTS).select('*');
                    const { data: tData, error: tError } = await supabase.from(TABLE_TRANSACTIONS).select('*').order('date', { ascending: false });

                    if (!pError && pData) setProducts(pData);
                    if (!tError && tData) setTransactions(tData);

                    // Realtime
                    const channel = supabase
                        .channel('db-changes')
                        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_PRODUCTS }, (payload) => {
                            if (payload.eventType === 'INSERT') setProducts(prev => [...prev, payload.new as Product]);
                            if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
                            if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_TRANSACTIONS }, (payload) => {
                            if (payload.eventType === 'INSERT') setTransactions(prev => [payload.new as Transaction, ...prev]);
                            if (payload.eventType === 'DELETE') setTransactions([]); // For bulk clear
                        })
                        .subscribe();

                    setLoading(false);
                    return () => {
                        if (supabase) {
                            supabase.removeChannel(channel);
                        }
                    };
                } catch (error) {
                    console.error("Supabase error (falling back to local):", error);
                }
            }

            // 2. Fallback to LocalStorage (if Supabase not configured or failed)
            if (!supabase) {
                try {
                    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
                    const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

                    if (storedProducts) setProducts(JSON.parse(storedProducts));
                    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
                } catch (e) {
                    console.error("Local storage error:", e);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();

        // Listen for storage events (only relevant for local storage mode really)
        const handleStorageChange = (e: StorageEvent) => {
            if (!supabase && (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.TRANSACTIONS)) {
                const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
                if (storedProducts) setProducts(JSON.parse(storedProducts));
                const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
                if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Save Helpers
    const saveProducts = async (newProducts: Product[], operation: 'INSERT' | 'UPDATE' | 'DELETE', item?: Product) => {
        setProducts(newProducts); // Optimistic update

        if (supabase && item) {
            if (operation === 'INSERT') await supabase.from(TABLE_PRODUCTS).insert(item);
            if (operation === 'UPDATE') await supabase.from(TABLE_PRODUCTS).update(item).eq('id', item.id);
            if (operation === 'DELETE') await supabase.from(TABLE_PRODUCTS).delete().eq('id', item.id);
        } else {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
        }
    };

    const saveTransactions = async (newTransactions: Transaction[], newItem?: Transaction) => {
        setTransactions(newTransactions); // Optimistic update

        if (supabase && newItem) {
            await supabase.from(TABLE_TRANSACTIONS).insert(newItem);
        } else {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
        }
    };

    // Actions
    const addProduct = async (product: Omit<Product, 'id' | 'updatedAt'>) => {
        const newProduct: Product = {
            ...product,
            id: crypto.randomUUID(),
            updatedAt: new Date().toISOString(),
        };
        await saveProducts([...products, newProduct], 'INSERT', newProduct);
        return newProduct;
    };

    const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'updatedAt'>>) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const updatedProduct = { ...product, ...updates, updatedAt: new Date().toISOString() };
        const newProducts = products.map(p => p.id === id ? updatedProduct : p);
        await saveProducts(newProducts, 'UPDATE', updatedProduct);
    };

    const deleteProduct = async (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const newProducts = products.filter(p => p.id !== id);
        await saveProducts(newProducts, 'DELETE', product);
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const product = products.find(p => p.id === transaction.productId);
        if (!product) throw new Error("Product not found");

        const newQuantity = transaction.type === 'IN'
            ? product.quantity + transaction.quantity
            : product.quantity - transaction.quantity;

        if (newQuantity < 0) throw new Error("Insufficient stock");

        // Update product
        const updatedProduct = { ...product, quantity: newQuantity, updatedAt: new Date().toISOString() };
        const updatedProducts = products.map(p => p.id === transaction.productId ? updatedProduct : p);
        await saveProducts(updatedProducts, 'UPDATE', updatedProduct);

        // Add transaction
        const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: user || 'Anónimo',
        };

        const newTransactions = [newTransaction, ...transactions];
        await saveTransactions(newTransactions, newTransaction);

        return newTransaction;
    };

    const clearAllData = async () => {
        if (supabase) {
            await supabase.from(TABLE_TRANSACTIONS).delete().neq('id', '0');
            await supabase.from(TABLE_PRODUCTS).delete().neq('id', '0');
        } else {
            localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
            localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        }
        setProducts([]);
        setTransactions([]);
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
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
