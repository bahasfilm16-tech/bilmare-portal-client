import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Search, Download, AlertTriangle,
  CheckCircle2, HelpCircle, FileText, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import * as XLSX from 'xlsx-js-style';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

interface Claim {
  id: string;
  claim: string;
  report: string;
  category: string;
  sourceDoc: string;
  sourcePage: string;
  verificationDate: Date;
  verifier: string;
  status: string;
  currentYearValue: string;
  lastYearValue: string;
  lastYearSource: string;
}

const mapClaim = (c: any): Claim => ({
  id: c.id,
  claim: c.claim ?? '',
  report: c.report ?? '',
  category: c.category ?? '',
  sourceDoc: c.source_doc ?? '',
  sourcePage: c.source_page ?? '',
  verificationDate: c.verification_date ? new Date(c.verification_date) : new Date(),
  verifier: c.verifier ?? '',
  status: c.status ?? 'Unverified',
  currentYearValue: c.current_year_value ?? '',
  lastYearValue: c.last_year_value ?? '',
  lastYearSource: c.last_year_source ?? '',
});

export const CrossReference = () => {
  const { project, addToast } = useAppContext();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cross_references')
        .select('*')
        .eq('project_id', project.id)
        .order('no', { ascending: true });
      if (!error && data && data.length > 0) setClaims(data.map(mapClaim));
      setLoading(false);
    };
    if (project?.id) fetchClaims();
  }, [project?.id]);

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch =
        claim.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.sourceDoc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || claim.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [claims, searchTerm, categoryFilter, statusFilter]);

  const inconsistentCount = claims.filter(c => c.status === 'Inconsistent').length;
  const consistentCount = claims.filter(c => c.status === 'Consistent').length;
  const unverifiedCount = claims.filter(c => c.status === 'Unverified').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Consistent': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Consistent</Badge>;
      case 'Inconsistent': return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Inconsistent</Badge>;
      case 'Unverified': return <Badge variant="secondary"><HelpCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const styleHeader = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: { top: { style: 'thin', color: { rgb: '3730A3' } }, bottom: { style: 'thin', color: { rgb: '3730A3' } }, left: { style: 'thin', color: { rgb: '3730A3' } }, right: { style: 'thin', color: { rgb: '3730A3' } } } };
    const styleTitle = { font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: '1E1B4B' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const styleSubtitle = { font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '6B7280' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const getRowStyle = (isEven: boolean) => ({ font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } }, fill: { fgColor: { rgb: isEven ? 'F5F3FF' : 'FFFFFF' } }, alignment: { vertical: 'top', wrapText: true }, border: { bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } });
    const styleConsistent = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '047857' } }, fill: { fgColor: { rgb: 'D1FAE5' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleInconsistent = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: 'FEE2E2' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleUnverified = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '6B7280' } }, fill: { fgColor: { rgb: 'F3F4F6' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const wsData: any[][] = [];
    wsData.push([{ v: '🔗 Cross-Reference Matrix', s: styleTitle }, '', '', '', '', '', '', '']);
    wsData.push([{ v: `Digenerate pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')} WIB`, s: styleSubtitle }, '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '']);
    wsData.push([{ v: 'TOTAL CLAIMS', s: { font: { name: 'Calibri', sz: 9, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'F9FAFB' } } } }, { v: 'CONSISTENT', s: { font: { name: 'Calibri', sz: 9, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'F9FAFB' } } } }, { v: 'INCONSISTENT', s: { font: { name: 'Calibri', sz: 9, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'F9FAFB' } } } }, { v: 'UNVERIFIED', s: { font: { name: 'Calibri', sz: 9, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'F9FAFB' } } } }, '', '', '', '']);
    wsData.push([{ v: claims.length, s: { font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '4F46E5' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'EEF2FF' } } } }, { v: consistentCount, s: { font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '047857' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'D1FAE5' } } } }, { v: inconsistentCount, s: { font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'FEE2E2' } } } }, { v: unverifiedCount, s: { font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: 'F3F4F6' } } } }, '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '']);
    wsData.push([{ v: 'ID', s: styleHeader }, { v: 'Claim in Draft', s: styleHeader }, { v: 'Location', s: styleHeader }, { v: 'Category', s: styleHeader }, { v: 'Source Document', s: styleHeader }, { v: 'Source Page', s: styleHeader }, { v: 'Status', s: styleHeader }, { v: 'Verifier', s: styleHeader }]);
    claims.forEach((c, idx) => {
      const isEven = idx % 2 === 0;
      const base = getRowStyle(isEven);
      const statusStyle = c.status === 'Consistent' ? styleConsistent : c.status === 'Inconsistent' ? styleInconsistent : styleUnverified;
      wsData.push([{ v: c.id, s: { ...base, font: { ...base.font, bold: true } } }, { v: c.claim, s: base }, { v: c.report, s: { ...base, alignment: { horizontal: 'center', vertical: 'top' } } }, { v: c.category, s: { ...base, alignment: { horizontal: 'center', vertical: 'top' } } }, { v: c.sourceDoc, s: base }, { v: c.sourcePage, s: { ...base, alignment: { horizontal: 'center', vertical: 'top' } } }, { v: c.status, s: statusStyle }, { v: c.verifier, s: base }]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 10 }, { wch: 50 }, { wch: 14 }, { wch: 14 }, { wch: 38 }, { wch: 12 }, { wch: 16 }, { wch: 18 }];
    ws['!rows'] = [{ hpt: 30 }, { hpt: 16 }, { hpt: 8 }, { hpt: 16 }, { hpt: 24 }, { hpt: 8 }, { hpt: 36 }, ...claims.map(() => ({ hpt: 50 }))];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }];
    ws['!autofilter'] = { ref: 'A7:H7' };
    XLSX.utils.book_append_sheet(wb, ws, 'Cross-Reference Matrix');
    XLSX.writeFile(wb, `CrossReference_Bilmare_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    addToast('Export Excel berhasil!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cross-Reference Matrix</h1>
          <p className="text-slate-500 mt-1">Traceability map of material claims to source documents.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      {inconsistentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Cross-Document Inconsistencies Detected</h3>
            <p className="text-sm text-red-700 mt-1">Found {inconsistentCount} claims that do not match the verified source documents. Please review and resolve.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Consistent</p><p className="text-2xl font-bold text-emerald-600">{consistentCount}</p></div><CheckCircle2 className="w-8 h-8 text-emerald-200" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Inconsistent</p><p className="text-2xl font-bold text-red-600">{inconsistentCount}</p></div><AlertTriangle className="w-8 h-8 text-red-200" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Unverified</p><p className="text-2xl font-bold text-slate-500">{unverifiedCount}</p></div><HelpCircle className="w-8 h-8 text-slate-200" /></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search claims or sources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div className="flex gap-3 flex-wrap w-full md:w-auto">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="All">All Categories</option>
              <option value="Finansial">Finansial</option>
              <option value="ESG">ESG</option>
              <option value="Tata Kelola">Tata Kelola</option>
              <option value="Operasional">Operasional</option>
              <option value="Strategis">Strategis</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="All">All Statuses</option>
              <option value="Consistent">Consistent</option>
              <option value="Inconsistent">Inconsistent</option>
              <option value="Unverified">Unverified</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All'); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table — wajib overflow-x-auto */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
            <span className="text-sm text-slate-500">Memuat data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead className="min-w-[200px]">Claim in Draft</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead className="min-w-[160px]">Source Document</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}
                    className={`cursor-pointer transition-colors ${claim.status === 'Inconsistent' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedClaim(claim)}>
                    <TableCell className="font-medium text-slate-900">{claim.id}</TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900 line-clamp-2" title={claim.claim}>{claim.claim}</p>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1 block">{claim.category}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="bg-white">{claim.report}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="truncate max-w-[160px]">
                          <p className="text-sm text-slate-700 truncate">{claim.sourceDoc}</p>
                          <p className="text-xs text-slate-500">Hal. {claim.sourcePage}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  </TableRow>
                ))}
                {filteredClaims.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">No claims match your filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title={`Claim Verification: ${selectedClaim?.id}`} className="max-w-3xl">
        {selectedClaim && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2"><Badge variant="outline">{selectedClaim.category}</Badge>{getStatusBadge(selectedClaim.status)}</div>
              <div className="text-right"><p className="text-xs text-slate-500">Verified by {selectedClaim.verifier}</p><p className="text-xs text-slate-500">{format(selectedClaim.verificationDate, 'dd MMM yyyy')}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4" /> Draft Report ({selectedClaim.report})</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-800 italic leading-relaxed">"{selectedClaim.claim}"</p>
                  <div className="mt-4 pt-4 border-t border-slate-200"><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Extracted Value</p><p className="text-lg font-bold text-slate-900">{selectedClaim.currentYearValue}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4" /> Source Document</h4>
                <div className={`border rounded-lg p-4 ${selectedClaim.status === 'Inconsistent' ? 'bg-red-50 border-red-200' : selectedClaim.status === 'Consistent' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-sm font-medium text-slate-900 mb-1">{selectedClaim.sourceDoc}</p>
                  <p className="text-xs text-slate-500 mb-4">Halaman {selectedClaim.sourcePage}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200/50"><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Verified Value</p><p className={`text-lg font-bold ${selectedClaim.status === 'Inconsistent' ? 'text-red-700' : 'text-emerald-700'}`}>{selectedClaim.currentYearValue}</p></div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Year-over-Year Comparison</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Last Year (2023)</TableHead><TableHead>Current Year (2024)</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{selectedClaim.category}</TableCell>
                      <TableCell>{selectedClaim.lastYearValue}<span className="block text-[10px] text-slate-500">{selectedClaim.lastYearSource}</span></TableCell>
                      <TableCell className={selectedClaim.status === 'Inconsistent' ? 'text-red-600 font-medium' : 'text-emerald-700 font-medium'}>{selectedClaim.currentYearValue}</TableCell>
                      <TableCell className="text-xs text-slate-500">{selectedClaim.sourceDoc}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
