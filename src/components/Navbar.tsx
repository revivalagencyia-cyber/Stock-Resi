'use client';

import { Menu, X, Box } from 'lucide-react';
import { Button } from './ui/Button';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="xl:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/60 backdrop-blur-xl z-50 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                    <Box className="h-5 w-5" />
                    <span>Stock Resi</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative z-50"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </header>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 xl:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 xl:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onNavigate={() => setIsOpen(false)} />
            </div>
        </>
    );
}
