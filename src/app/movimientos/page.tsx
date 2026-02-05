'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Calendar, Download } from "lucide-react";
import { useProducts } from "@/lib/storage";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/Button";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TransactionsPage() {
    const { transactions, products } = useProducts();

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Reporte de Movimientos - Stock Resi", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

        const tableData = transactions.map(t => [
            format(parseISO(t.date), "dd/MM/yyyy HH:mm"),
            products.find(p => p.id === t.productId)?.name || 'Desconocido',
            t.type === 'IN' ? 'Entrada' : 'Salida',
            t.quantity,
            t.user || '-',
            t.notes || '-'
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Fecha', 'Producto', 'Tipo', 'Cant.', 'Usuario', 'Notas']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Primary color
            styles: { fontSize: 8 },
        });

        doc.save(`reporte-movimientos-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    // Basic stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const transactionsThisMonth = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const incomingCount = transactionsThisMonth.filter(t => t.type === 'IN').length;
    const outgoingCount = transactionsThisMonth.filter(t => t.type === 'OUT').length;

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Producto Desconocido';

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Movimientos</h1>
                    <p className="text-muted-foreground mt-1">Historial de entradas y salidas de stock.</p>
                </div>
                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 w-full sm:w-auto justify-center">
                    <Download className="h-4 w-4" /> Exportar Reporte
                </Button>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium uppercase tracking-wider text-muted-foreground">Entradas (Mes)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{incomingCount}</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium uppercase tracking-wider text-muted-foreground">Salidas (Mes)</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outgoingCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-card">
                <CardHeader className="pb-4">
                    <CardTitle>Historial Completo</CardTitle>
                    <CardDescription>Lista detallada de todas las transacciones.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <ArrowRightLeft className="h-12 w-12 mb-4 opacity-10" />
                            <p className="text-lg font-medium">No hay movimientos registrados aún.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {/* Desktop Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 bg-muted/30 p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                <div className="col-span-2">Fecha</div>
                                <div className="col-span-1 text-center">Hora</div>
                                <div className="col-span-3">Producto</div>
                                <div className="col-span-2 text-center">Tipo</div>
                                <div className="col-span-2 text-right">Cantidad</div>
                                <div className="col-span-2 text-right">Usuario</div>
                            </div>

                            {/* Transactions Rows */}
                            {transactions.map((t) => (
                                <div key={t.id} className="p-4 hover:bg-accent/30 transition-colors">
                                    {/* Mobile Layout */}
                                    <div className="md:hidden space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-bold text-base leading-tight">
                                                    {getProductName(t.productId)}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(parseISO(t.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.type === 'IN' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                {t.type === 'IN' ? 'Entrada' : 'Salida'}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-accent/30 rounded-lg p-2">
                                            <div className="text-xs text-muted-foreground">
                                                <span className="font-medium mr-1 uppercase text-[9px]">Por:</span> {t.user || '-'}
                                            </div>
                                            <div className={`text-sm font-black ${t.type === 'IN' ? 'text-success' : 'text-destructive'}`}>
                                                {t.type === 'IN' ? '+' : '-'}{t.quantity}
                                            </div>
                                        </div>
                                        {t.notes && <p className="text-xs text-muted-foreground italic pl-1 border-l-2 border-primary/20">{t.notes}</p>}
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 items-center text-sm font-medium">
                                        <div className="col-span-2 text-muted-foreground">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {format(parseISO(t.date), 'dd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-center text-muted-foreground tabular-nums">
                                            {format(parseISO(t.date), 'HH:mm')}
                                        </div>
                                        <div className="col-span-3 font-bold group-hover:text-primary transition-colors">
                                            {getProductName(t.productId)}
                                            {t.notes && <p className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">{t.notes}</p>}
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${t.type === 'IN' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                {t.type === 'IN' ? 'Entrada' : 'Salida'}
                                            </span>
                                        </div>
                                        <div className={`col-span-2 text-right font-black tabular-nums ${t.type === 'IN' ? 'text-success' : 'text-destructive'}`}>
                                            {t.type === 'IN' ? '+' : '-'}{t.quantity}
                                        </div>
                                        <div className="col-span-2 text-right text-muted-foreground text-xs font-semibold">
                                            {t.user || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
