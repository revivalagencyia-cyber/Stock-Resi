'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ArrowRightLeft, Settings, Box, RefreshCw, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import { Button } from './ui/Button';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/inventario', label: 'Inventario', icon: Package },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const { clearAllData } = useData();
    const { user, logout } = useUser();
    const [isClearing, setIsClearing] = useState(false);

    const handleClear = async () => {
        if (confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
            setIsClearing(true);
            try {
                await clearAllData();
                alert('Datos borrados correctamente.');
            } catch (error) {
                console.error(error);
            } finally {
                setIsClearing(false);
            }
        }
    };

    return (
        <aside className="h-full w-64 border-r border-border/50 bg-background xl:bg-background/60 xl:backdrop-blur-xl flex flex-col">
            <div className="flex h-16 items-center border-b border-border/50 px-6">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Box className="h-6 w-6" />
                    <span>Stock Resi</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2 p-4 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            {user?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate">{user}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-2">Mantenimiento</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-8 gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleClear}
                        disabled={isClearing}
                    >
                        <RefreshCw className={cn("h-3 w-3", isClearing && "animate-spin")} />
                        Reiniciar Sistema
                    </Button>
                </div>

                <div className="flex items-center gap-2 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sistema Online</span>
                </div>
            </div>
        </aside>
    );
}
