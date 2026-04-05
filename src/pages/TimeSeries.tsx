import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Download, Filter
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import * as XLSX from 'xlsx-js-style';
import { format } from 'date-fns';

export const TimeSeries = () => {
  const { timeSeriesMetrics, addToast } = useAppContext();
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredMetrics = categoryFilter === 'All'
    ? timeSeriesMetrics
    : timeSeriesMetrics.filter(m => m.category === categoryFilter);

  const getValue = (metric: any, year: string): number => metric.data?.[year] ?? 0;

  const calculateYoY = (current: number, previous: number) => {
    if (!previous || previous === 0) return <span className="text-slate-400 text-sm">N/A</span>;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return (
      <span className={`flex items-center gap-1 text-sm font-medium justify-end ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      </span>
    );
  };

  const getTrendIcon = (metric: any) => {
    const v2023 = getValue(metric, '2023');
    const v2024 = getValue(metric, '2024');
    if (v2024 > v2023) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (v2024 < v2023) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const formatValue = (val: number) => {
    if (!val && val !== 0) return '—';
    return val.toLocaleString('id-ID');
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const styleTitle = { font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: '1E1B4B' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const styleSubtitle = { font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '6B7280' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const styleHeader = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: { top: { style: 'thin', color: { rgb: '3730A3' } }, bottom: { style: 'thin', color: { rgb: '3730A3' } }, left: { style: 'thin', color: { rgb: '3730A3' } }, right: { style: 'thin', color: { rgb: '3730A3' } } } };
    const styleRowEven = { font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } }, fill: { fgColor: { rgb: 'EEF2FF' } }, alignment: { vertical: 'center', wrapText: true }, border: { bottom: { style: 'thin', color: { rgb: 'C7D2FE' } }, left: { style: 'thin', color: { rgb: 'C7D2FE' } }, right: { style: 'thin', color: { rgb: 'C7D2FE' } } } };
    const styleRowOdd = { font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } }, fill: { fgColor: { rgb: 'FFFFFF' } }, alignment: { vertical: 'center', wrapText: true }, border: { bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } };
    const styleHighlight = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '3730A3' } }, fill: { fgColor: { rgb: 'E0E7FF' } }, alignment: { horizontal: 'right', vertical: 'center' }, border: { bottom: { style: 'thin', color: { rgb: 'C7D2FE' } }, left: { style: 'thin', color: { rgb: 'C7D2FE' } }, right: { style: 'thin', color: { rgb: 'C7D2FE' } } } };
    const wsData: any[][] = [];
    wsData.push([{ v: '📊 Time-Series Archive — Multi-Year Performance Data', s: styleTitle }, '', '', '', '', '', '', '']);
    wsData.push([{ v: `Digenerate pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')} WIB`, s: styleSubtitle }, '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '']);
    wsData.push([{ v: 'Metric Name', s: styleHeader }, { v: 'Category', s: styleHeader }, { v: 'Unit', s: styleHeader }, { v: 'Methodology', s: styleHeader }, { v: '2022', s: styleHeader }, { v: '2023', s: styleHeader }, { v: '2024 (Current)', s: { ...styleHeader, fill: { fgColor: { rgb: '6366F1' } } } }, { v: 'YoY Change', s: styleHeader }]);
    timeSeriesMetrics.forEach((m, idx) => {
      const isEven = idx % 2 === 0;
      const base = isEven ? styleRowEven : styleRowOdd;
      const v2022 = getValue(m, '2022');
      const v2023 = getValue(m, '2023');
      const v2024 = getValue(m, '2024');
      const yoy = v2023 > 0 ? ((v2024 - v2023) / v2023 * 100).toFixed(1) + '%' : 'N/A';
      wsData.push([{ v: m.name, s: { ...base, font: { ...base.font, bold: true } } }, { v: m.category, s: { ...base, alignment: { horizontal: 'center', vertical: 'center' } } }, { v: m.unit, s: { ...base, alignment: { horizontal: 'center', vertical: 'center' } } }, { v: m.methodology ?? '', s: base }, { v: v2022, s: { ...base, alignment: { horizontal: 'right', vertical: 'center' } } }, { v: v2023, s: { ...base, alignment: { horizontal: 'right', vertical: 'center' } } }, { v: v2024, s: styleHighlight }, { v: yoy, s: { ...base, alignment: { horizontal: 'center', vertical: 'center' } } }]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 35 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
    ws['!rows'] = [{ hpt: 30 }, { hpt: 16 }, { hpt: 8 }, { hpt: 36 }, ...timeSeriesMetrics.map(() => ({ hpt: 22 }))];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }];
    ws['!autofilter'] = { ref: 'A4:H4' };
    XLSX.utils.book_append_sheet(wb, ws, 'Time-Series Data');
    XLSX.writeFile(wb, `TimeSeries_Bilmare_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    addToast('Export Excel berhasil!', 'success');
  };

  const categories = ['All', ...Array.from(new Set(timeSeriesMetrics.map(m => m.category).filter(Boolean)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time-Series Archive</h1>
          <p className="text-slate-500 mt-1">Multi-year performance data for consistency checking.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700">Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredMetrics.length}</span> metrics
          </div>
        </CardContent>
      </Card>

      {/* Table — wajib overflow-x-auto */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Metric Name</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Unit</TableHead>
                <TableHead className="text-right hidden md:table-cell">2022</TableHead>
                <TableHead className="text-right">2023</TableHead>
                <TableHead className="text-right bg-indigo-50/50">2024 (Current)</TableHead>
                <TableHead className="text-right">YoY</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetrics.map((metric) => {
                const v2022 = getValue(metric, '2022');
                const v2023 = getValue(metric, '2023');
                const v2024 = getValue(metric, '2024');
                return (
                  <TableRow key={metric.id} className="hover:bg-slate-50">
                    <TableCell>
                      <p className="font-medium text-slate-900">{metric.name}</p>
                      {metric.methodology && <p className="text-xs text-slate-400 mt-0.5 hidden md:block">{metric.methodology}</p>}
                      {/* Show category on mobile */}
                      <p className="text-xs text-slate-500 mt-0.5 sm:hidden">{metric.category} · {metric.unit}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="bg-white">{metric.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 text-sm">{metric.unit}</TableCell>
                    <TableCell className="text-right text-slate-600 hidden md:table-cell">{formatValue(v2022)}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatValue(v2023)}</TableCell>
                    <TableCell className="text-right font-semibold text-indigo-900 bg-indigo-50/30">{formatValue(v2024)}</TableCell>
                    <TableCell className="text-right">{calculateYoY(v2024, v2023)}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell"><div className="flex justify-center">{getTrendIcon(metric)}</div></TableCell>
                  </TableRow>
                );
              })}
              {filteredMetrics.length === 0 && (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-slate-500">No metrics found for the selected category.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Data Integrity Notes</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              {[
                'Data keuangan 2024 berdasarkan laporan keuangan audited yang dirilis pada Maret 2025.',
                'Metrik lingkungan (emisi GRK) 2023 telah dikoreksi sesuai pembaruan metodologi GHG Protocol.',
                'Metrik sosial (turnover karyawan) tidak termasuk tenaga kerja sementara dan kontrak.',
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p>{note}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Verification Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[{ label: '2024 Data Verified', value: 85, color: 'bg-emerald-500' }, { label: 'Historical Data Consistency', value: 100, color: 'bg-indigo-500' }].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{item.label}</span><span className="font-medium text-slate-900">{item.value}%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.value}%` }} /></div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100"><p className="text-xs text-slate-500 italic">* Verifikasi dilakukan terhadap dokumen sumber yang ada di Document Vault.</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
