'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ArrowRightLeft, Box, RefreshCw, LogOut, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import { Button } from './ui/Button';

const navItems = [
    { href: '/', label: 'Inicio', icon: LayoutDashboard },
    { href: '/inventario', label: 'Inventario', icon: Package },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
];

export function Navigation() {
    const pathname = usePathname();
    const { clearAllData } = useData();
    const { user, logout } = useUser();
    const [isClearing, setIsClearing] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleClear = async () => {
        if (confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
            setIsClearing(true);
            try {
                await clearAllData();
                alert('Datos borrados correctamente.');
                setShowUserMenu(false);
            } catch (error) {
                console.error(error);
            } finally {
                setIsClearing(false);
            }
        }
    };

    return (
        <>
            {/* Desktop Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/60 backdrop-blur-xl z-50 px-6 hidden md:flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Box className="h-6 w-6" />
                        <span>Stock Resi</span>
                    </div>

                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                        isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Online</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 hover:bg-accent p-1.5 rounded-full transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {user?.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 border-b border-border/50 mb-2">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Usuario</p>
                                        <p className="text-sm font-bold truncate">{user}</p>
                                    </div>
                                    <button
                                        onClick={handleClear}
                                        disabled={isClearing}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className={cn("h-3.5 w-3.5", isClearing && "animate-spin")} />
                                        Reiniciar Sistema
                                    </button>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors mt-1"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border/50 bg-background/80 backdrop-blur-xl z-50 md:hidden flex items-center justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all text-muted-foreground",
                        showUserMenu && "text-primary"
                    )}
                >
                    <User className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
                </button>
            </nav>

            {/* Mobile User Menu Overlay */}
            {showUserMenu && (
                <div className="md:hidden fixed inset-0 z-[60] flex items-end justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-card border-t rounded-t-2xl p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {user?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Sesión de</p>
                                    <p className="text-lg font-bold">{user}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowUserMenu(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 text-destructive border-destructive/20 hover:bg-destructive/10"
                                onClick={handleClear}
                                disabled={isClearing}
                            >
                                <RefreshCw className={cn("h-5 w-5", isClearing && "animate-spin")} />
                                Reiniciar Sistema Completo
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start gap-3 h-12"
                                onClick={logout}
                            >
                                <LogOut className="h-5 w-5" />
                                Cerrar Sesión
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12"
                                onClick={() => setShowUserMenu(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header (Just for Logo) */}
            <header className="fixed top-0 left-0 right-0 h-14 border-b border-border/50 bg-background/60 backdrop-blur-xl z-50 px-4 flex md:hidden items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                    <Box className="h-5 w-5" />
                    <span>Stock Resi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Online</span>
                </div>
            </header>
        </>
    );
}
