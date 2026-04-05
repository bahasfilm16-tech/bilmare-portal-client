import React, { useState } from 'react';
import {
  Search, ChevronDown, ChevronUp, BookOpen, FileText, ShieldAlert
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const FAQ = () => {
  const { faqs } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified': return <Badge variant="success">Verified</Badge>;
      case 'Draft': return <Badge variant="secondary">Draft</Badge>;
      case 'Needs Update': return <Badge variant="warning">Needs Update</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getSensitivityBadge = (sensitivity: string) => {
    if (sensitivity === 'Sensitive') {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <ShieldAlert className="w-3 h-3" /> Sensitive
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">IR FAQ Databook</h1>
        <p className="text-slate-600">
          Kumpulan jawaban terverifikasi untuk pertanyaan umum investor dan pemangku kepentingan, memastikan konsistensi pesan di seluruh laporan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{faqs.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total FAQs</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{faqs.filter(f => f.status === 'Verified').length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Verified</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{faqs.filter(f => f.status !== 'Verified').length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Draft / Needs Update</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertanyaan atau jawaban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-full md:w-48"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <Card
            key={faq.id}
            className={`transition-all duration-200 ${expandedId === faq.id ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:border-indigo-200 hover:shadow-sm'}`}
          >
            <div
              className="p-5 cursor-pointer flex items-start justify-between gap-4"
              onClick={() => toggleExpand(faq.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {faq.category}
                  </Badge>
                  {getStatusBadge(faq.status)}
                  {getSensitivityBadge(faq.sensitivity)}
                </div>
                <h3 className={`text-base font-medium transition-colors ${expandedId === faq.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {faq.question}
                </h3>
              </div>
              <div className="shrink-0 mt-1">
                {expandedId === faq.id
                  ? <ChevronUp className="w-5 h-5 text-indigo-500" />
                  : <ChevronDown className="w-5 h-5 text-slate-400" />
                }
              </div>
            </div>

            {expandedId === faq.id && (
              <CardContent className="px-5 pb-5 pt-0 border-t border-slate-100">
                <div className="pt-4">
                  <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
                {faq.reference && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">Referensi: </span>
                    <span className="text-xs font-medium text-indigo-600">{faq.reference}</span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Tidak ada FAQ ditemukan</h3>
            <p className="text-slate-500 mt-1 text-sm">Coba ubah kata kunci atau filter kategori.</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};