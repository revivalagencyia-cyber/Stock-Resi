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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Movimientos</h1>
                    <p className="text-muted-foreground mt-1">Historial de entradas y salidas de stock.</p>
                </div>
                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                    <Download className="h-4 w-4" /> Exportar Reporte
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas (Mes)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{incomingCount}</div>
                        <p className="text-xs text-muted-foreground">Movimientos registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Salidas (Mes)</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outgoingCount}</div>
                        <p className="text-xs text-muted-foreground">Registros de consumo</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial Completo</CardTitle>
                    <CardDescription>Lista detalla de todas las transacciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border border-dashed rounded-lg">
                            <ArrowRightLeft className="h-10 w-10 mb-2 opacity-20" />
                            <p>No hay movimientos registrados aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium text-muted-foreground text-sm">
                                <div className="col-span-2">Fecha</div>
                                <div className="col-span-1">Hora</div>
                                <div className="col-span-3">Producto</div>
                                <div className="col-span-2">Tipo</div>
                                <div className="col-span-2 text-right">Cantidad</div>
                                <div className="col-span-2 text-right">Usuario</div>
                            </div>
                            {transactions.map((t) => (
                                <div key={t.id} className="grid grid-cols-12 gap-4 items-center p-4 border-b last:border-0 hover:bg-accent/50 transition-colors text-sm">
                                    <div className="col-span-2 text-muted-foreground">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {format(parseISO(t.date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-muted-foreground">
                                        {format(parseISO(t.date), 'HH:mm')}
                                    </div>
                                    <div className="col-span-3 font-medium">
                                        {getProductName(t.productId)}
                                        {t.notes && <p className="text-xs text-muted-foreground truncate">{t.notes}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${t.type === 'IN' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                            {t.type === 'IN' ? 'Entrada' : 'Salida'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right font-bold">
                                        {t.quantity}
                                    </div>
                                    <div className="col-span-2 text-right text-muted-foreground text-xs">
                                        {t.user || '-'}
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
