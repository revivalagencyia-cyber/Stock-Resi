export type Category = 'Farmacia' | 'Higiene' | 'Limpieza' | 'Alimentación';

export interface Product {
    id: string;
    name: string;
    category: Category;
    quantity: number;
    minStock: number;
    unit: string;
    expirationDate?: string; // ISO date string
    updatedAt: string;
}

export interface Transaction {
    id: string;
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    date: string;
    notes?: string;
    user?: string;
}

export const CATEGORIES: Category[] = ['Farmacia', 'Higiene', 'Limpieza', 'Alimentación'];
