import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle, Download, Search,
  MessageSquare, History, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import * as XLSX from 'xlsx-js-style';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

export const GapRegister = () => {
  const { gapFindings, updateFindingStatus, addToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [clientResponse, setClientResponse] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  const filteredFindings = useMemo(() => {
    return gapFindings.filter(finding => {
      const matchesSearch =
        finding.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        finding.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || finding.status === statusFilter;
      const matchesRisk = riskFilter === 'All' || finding.riskLevel === riskFilter;
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [gapFindings, searchTerm, statusFilter, riskFilter]);

  const stats = {
    total: gapFindings.length,
    highRisk: gapFindings.filter(f => f.riskLevel === 'High').length,
    open: gapFindings.filter(f => f.status === 'Open').length,
    resolved: gapFindings.filter(f => f.status === 'Resolved').length,
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High': return <Badge variant="destructive">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      case 'Low': return <Badge variant="success">Low</Badge>;
      default: return <Badge>{risk}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <Badge variant="destructive">Open</Badge>;
      case 'Client Acknowledged': return <Badge variant="warning">Acknowledged</Badge>;
      case 'In Resolution': return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">In Resolution</Badge>;
      case 'Resolved': return <Badge variant="success">Resolved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleSaveResponse = async () => {
    if (!clientResponse.trim()) { addToast('Response tidak boleh kosong', 'error'); return; }
    setSavingResponse(true);
    try {
      const { error } = await supabase
        .from('gap_findings')
        .update({ client_response: clientResponse.trim(), status: 'Client Acknowledged' })
        .eq('id', selectedFinding.id);
      if (error) throw error;
      await updateFindingStatus(selectedFinding.id, 'Client Acknowledged');
      setSelectedFinding({ ...selectedFinding, status: 'Client Acknowledged' });
      setClientResponse('');
      addToast('Respons berhasil disimpan', 'success');
    } catch (err: any) {
      addToast('Gagal menyimpan respons: ' + err.message, 'error');
    } finally {
      setSavingResponse(false);
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const styleTitle = { font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: '1E1B4B' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const styleSubtitle = { font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '6B7280' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    const styleHeader = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: { top: { style: 'thin', color: { rgb: '3730A3' } }, bottom: { style: 'thin', color: { rgb: '3730A3' } }, left: { style: 'thin', color: { rgb: '3730A3' } }, right: { style: 'thin', color: { rgb: '3730A3' } } } };
    const styleRowEven = () => ({ font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } }, fill: { fgColor: { rgb: 'EEF2FF' } }, alignment: { vertical: 'top', wrapText: true }, border: { bottom: { style: 'thin', color: { rgb: 'C7D2FE' } }, left: { style: 'thin', color: { rgb: 'C7D2FE' } }, right: { style: 'thin', color: { rgb: 'C7D2FE' } } } });
    const styleRowOdd = () => ({ font: { name: 'Calibri', sz: 10, color: { rgb: '1F2937' } }, fill: { fgColor: { rgb: 'FFFFFF' } }, alignment: { vertical: 'top', wrapText: true }, border: { bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } });
    const styleRiskHigh = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleRiskMedium = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: 'D97706' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleRiskLow = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '059669' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleStatusOpen = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'DC2626' } }, fill: { fgColor: { rgb: 'FEE2E2' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleStatusAck = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'B45309' } }, fill: { fgColor: { rgb: 'FEF3C7' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleStatusResolution = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '4338CA' } }, fill: { fgColor: { rgb: 'EEF2FF' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleStatusResolved = { font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '047857' } }, fill: { fgColor: { rgb: 'D1FAE5' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    const styleStats = { font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '4F46E5' } }, fill: { fgColor: { rgb: 'EEF2FF' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin', color: { rgb: 'C7D2FE' } }, bottom: { style: 'thin', color: { rgb: 'C7D2FE' } }, left: { style: 'thin', color: { rgb: 'C7D2FE' } }, right: { style: 'thin', color: { rgb: 'C7D2FE' } } } };
    const styleStatsLabel = { font: { name: 'Calibri', sz: 9, color: { rgb: '6B7280' } }, alignment: { horizontal: 'center', vertical: 'center' }, fill: { fgColor: { rgb: 'F9FAFB' } } };

    const wsData: any[][] = [];
    wsData.push([{ v: '📋 Gap Register & Findings Report', s: styleTitle }, '', '', '', '', '', '', '', '', '']);
    wsData.push([{ v: `Digenerate pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm')} WIB`, s: styleSubtitle }, '', '', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '', '', '']);
    wsData.push([{ v: 'TOTAL FINDINGS', s: styleStatsLabel }, { v: 'HIGH RISK', s: styleStatsLabel }, { v: 'OPEN', s: styleStatsLabel }, { v: 'RESOLVED', s: styleStatsLabel }, '', '', '', '', '', '']);
    wsData.push([{ v: stats.total, s: styleStats }, { v: stats.highRisk, s: { ...styleStats, font: { ...styleStats.font, color: { rgb: 'DC2626' } } } }, { v: stats.open, s: { ...styleStats, font: { ...styleStats.font, color: { rgb: 'D97706' } } } }, { v: stats.resolved, s: { ...styleStats, font: { ...styleStats.font, color: { rgb: '059669' } } } }, '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '', '', '']);
    wsData.push([{ v: 'ID', s: styleHeader }, { v: 'Risk Level', s: styleHeader }, { v: 'Report', s: styleHeader }, { v: 'Section', s: styleHeader }, { v: 'Description', s: styleHeader }, { v: 'Type', s: styleHeader }, { v: 'Status', s: styleHeader }, { v: 'Date Found', s: styleHeader }, { v: 'Details', s: styleHeader }, { v: 'Recommendation', s: styleHeader }]);
    gapFindings.forEach((f, idx) => {
      const isEven = idx % 2 === 0;
      const baseStyle = isEven ? styleRowEven() : styleRowOdd();
      const riskStyle = f.riskLevel === 'High' ? styleRiskHigh : f.riskLevel === 'Medium' ? styleRiskMedium : styleRiskLow;
      const statusStyle = f.status === 'Open' ? styleStatusOpen : f.status === 'Client Acknowledged' ? styleStatusAck : f.status === 'In Resolution' ? styleStatusResolution : styleStatusResolved;
      wsData.push([{ v: f.id, s: { ...baseStyle, font: { ...baseStyle.font, bold: true } } }, { v: f.riskLevel, s: riskStyle }, { v: f.report, s: { ...baseStyle, alignment: { horizontal: 'center', vertical: 'top' } } }, { v: f.section ?? '', s: baseStyle }, { v: f.description, s: baseStyle }, { v: f.type, s: baseStyle }, { v: f.status, s: statusStyle }, { v: format(f.dateFound, 'dd MMM yyyy'), s: { ...baseStyle, alignment: { horizontal: 'center', vertical: 'top' } } }, { v: f.detail ?? '', s: baseStyle }, { v: f.recommendation ?? '', s: baseStyle }]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 28 }, { wch: 42 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 55 }, { wch: 55 }];
    ws['!rows'] = [{ hpt: 30 }, { hpt: 16 }, { hpt: 8 }, { hpt: 16 }, { hpt: 24 }, { hpt: 8 }, { hpt: 36 }, ...gapFindings.map(() => ({ hpt: 60 }))];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }];
    ws['!autofilter'] = { ref: 'A7:J7' };
    XLSX.utils.book_append_sheet(wb, ws, 'Gap Register');
    XLSX.writeFile(wb, `Gap_Register_Bilmare_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    addToast('Export Excel berhasil!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gap Register & Findings</h1>
          <p className="text-slate-500 mt-1">Disclosure Risk and Gap Register.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Total Findings</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></div><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-slate-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">High Risk</p><p className="text-2xl font-bold text-red-600">{stats.highRisk}</p></div><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Open</p><p className="text-2xl font-bold text-amber-600">{stats.open}</p></div><div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-500" /></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Resolved</p><p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p></div><div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search findings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div className="flex gap-3 flex-wrap w-full md:w-auto">
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="All">All Risks</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Client Acknowledged">Acknowledged</option>
              <option value="In Resolution">In Resolution</option>
              <option value="Resolved">Resolved</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter('All'); setRiskFilter('All'); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table — scroll horizontal di mobile */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="hidden sm:table-cell">Report</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFindings.map((finding) => (
                <TableRow key={finding.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedFinding(finding)}>
                  <TableCell className="font-medium text-slate-900">{finding.id}</TableCell>
                  <TableCell>{getRiskBadge(finding.riskLevel)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{finding.report}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px] sm:max-w-xs truncate" title={finding.description}>{finding.description}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-600">{finding.type}</TableCell>
                  <TableCell>{getStatusBadge(finding.status)}</TableCell>
                </TableRow>
              ))}
              {filteredFindings.length === 0 && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No findings match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedFinding} onClose={() => { setSelectedFinding(null); setClientResponse(''); }} title={`Finding Details: ${selectedFinding?.id}`} className="max-w-2xl">
        {selectedFinding && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">{getRiskBadge(selectedFinding.riskLevel)}{getStatusBadge(selectedFinding.status)}</div>
              <span className="text-sm text-slate-500">Found: {format(selectedFinding.dateFound, 'dd MMM yyyy')}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedFinding.description}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                <span className="font-medium text-slate-700">{selectedFinding.report}</span>
                <span>•</span><span>{selectedFinding.section}</span>
                <span>•</span><span>{selectedFinding.type}</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Details</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedFinding.detail}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Bilmare Recommendation</h4>
              <p className="text-sm text-indigo-800 leading-relaxed">{selectedFinding.recommendation}</p>
            </div>
            {selectedFinding.status !== 'Resolved' && (
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Client Response</h4>
                <textarea value={clientResponse} onChange={(e) => setClientResponse(e.target.value)}
                  placeholder="Provide context, clarification, or action plan..."
                  className="w-full h-24 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3" />
                <div className="flex justify-end gap-2 flex-wrap">
                  {selectedFinding.status === 'Client Acknowledged' && (
                    <Button variant="outline" onClick={async () => { await updateFindingStatus(selectedFinding.id, 'In Resolution'); setSelectedFinding({ ...selectedFinding, status: 'In Resolution' }); }}>
                      Mark as In Resolution
                    </Button>
                  )}
                  <Button onClick={handleSaveResponse} disabled={savingResponse}>
                    {savingResponse ? 'Menyimpan...' : 'Save Response'}
                  </Button>
                </div>
              </div>
            )}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><History className="w-4 h-4" /> Resolution History</h4>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                <div className="relative flex items-start gap-4"><div className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-white z-10 shrink-0 mt-1" /><div><p className="text-sm font-medium text-slate-900">Finding Opened</p><p className="text-xs text-slate-500">By Bilmare Team • {format(selectedFinding.dateFound, 'dd MMM yyyy')}</p></div></div>
                {selectedFinding.status !== 'Open' && (<div className="relative flex items-start gap-4"><div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white z-10 shrink-0 mt-1" /><div><p className="text-sm font-medium text-slate-900">Client Acknowledged</p><p className="text-xs text-slate-500">By Client • {format(new Date(), 'dd MMM yyyy')}</p></div></div>)}
                {selectedFinding.status === 'Resolved' && (<div className="relative flex items-start gap-4"><div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white z-10 shrink-0 mt-1" /><div><p className="text-sm font-medium text-slate-900">Resolved</p><p className="text-xs text-slate-500">By Bilmare Team • {format(new Date(), 'dd MMM yyyy')}</p></div></div>)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
