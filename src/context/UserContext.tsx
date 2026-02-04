'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { User as UserIcon } from 'lucide-react';

interface UserContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('stock-resi-user');
        if (storedUser) setUser(storedUser);
        setLoading(false);
    }, []);

    const login = (username: string) => {
        localStorage.setItem('stock-resi-user', username);
        setUser(username);
    };

    const logout = () => {
        localStorage.removeItem('stock-resi-user');
        setUser(null);
    };

    if (loading) return null;

    if (!user) {
        return <LoginScreen onLogin={login} />;
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

function LoginScreen({ onLogin }: { onLogin: (user: string) => void }) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onLogin(name.trim());
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">¿Quién eres?</CardTitle>
                    <p className="text-sm text-muted-foreground">Ingresa tu nombre para registrar movimientos.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Ej. Juan, María, Admin..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center text-lg"
                            autoFocus
                        />
                        <Button type="submit" className="w-full" disabled={!name.trim()}>
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
