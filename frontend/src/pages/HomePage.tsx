import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { TOOLS } from '../constants';
import { motion } from 'framer-motion';
import { FileText, Zap, Shield, MousePointer2, CheckCircle2, Star } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function HomePage() {
  const [search, setSearch] = React.useState('');
  
  const filteredTools = TOOLS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center py-10 px-4 md:px-0 bg-transparent">
      <SEO 
        title="Free PDF Tools Online – Merge, Compress, Convert PDF | PDFMaster"
        description="Use free online PDF tools to merge, compress, convert, and edit PDFs instantly. No registration required, 100% secure and easy to use PDFMaster."
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "PDFMaster",
          "url": "https://pdfmaster.io",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pdfmaster.io/?s={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* Hero Section */}
      <section className="hero mb-10 w-full max-w-2xl text-center">
        <h1 className="text-[36px] font-[800] leading-tight text-zinc-900 tracking-[-0.03em] mb-3">
          The Ultimate PDF Toolkit
        </h1>
        <p className="text-[18px] text-zinc-500 leading-relaxed mb-8">
          Every tool you need to work with PDFs in one place. 100% free and easy to use.
        </p>
        
        <div className="mx-auto w-full max-w-[400px] relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            < LucideIcons.Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search for a tool (e.g. 'Merge' or 'Compress')..." 
            className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-6 text-[14px] outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="w-full max-w-[944px] mb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <LucideIcons.SearchX size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No tools found for "{search}"</p>
          </div>
        )}
      </section>

      {/* SEO Content Section */}
      <section className="w-full max-w-[944px] py-16 border-t border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-[32px] font-[800] text-zinc-900 leading-tight mb-6">
              Why Choose PDFMaster for Your Documents?
            </h2>
            <p className="text-zinc-600 mb-6 leading-relaxed">
              PDFMaster is designed to be the most accessible and powerful PDF toolkit on the web. Whether you need to <strong>merge PDF files</strong> for a report, <strong>compress PDFs</strong> for email, or <strong>convert JPG to PDF</strong> for documentation, we provide professional-grade tools for free.
            </p>
            <ul className="space-y-4">
              {[
                 { icon: <Zap className="text-rose-500" size={20}/>, text: "Lightning fast processing on all devices" },
                 { icon: <Shield className="text-rose-500" size={20}/>, text: "Secure SSL encryption for your safety" },
                 { icon: <CheckCircle2 className="text-rose-500" size={20}/>, text: "No registration or software installation" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[15px] font-medium text-zinc-700">
                  {item.icon}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 italic text-zinc-500">
            <Star className="text-yellow-400 mb-4" fill="currentColor" />
            <p className="text-[18px] mb-6">"PDFMaster changed how our team handles monthly reports. Merging takes seconds and the quality remains perfect. Highly recommended!"</p>
            <p className="text-[14px] font-bold text-zinc-900">— Sarah J., Project Manager</p>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-[24px] font-[800] text-zinc-900 mb-4">Complete PDF Management Solution</h2>
            <p className="text-zinc-600 leading-relaxed">
              Managing digital documents shouldn't be expensive or complicated. Our platform offers a wide range of features to suit any need. From students needing to <strong>combine PDF documents</strong> for assignments to businesses requiring <strong>secure PDF watermarking</strong>, PDFMaster is the reliable choice. Our tools work directly in your browser, meaning you can access them from anywhere, at any time, on any device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="text-[18px] font-bold text-zinc-900 mb-3">Optimize & Convert</h3>
              <p className="text-[14px] text-zinc-500 mb-4">Reduce file sizes without losing quality. Our compression algorithms ensure your documents remain readable while taking up minimal space.</p>
              <LucideIcons.ArrowRight className="text-brand" size={20} />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="text-[18px] font-bold text-zinc-900 mb-3">Organize & Edit</h3>
              <p className="text-[14px] text-zinc-500 mb-4">Merge multiple files, delete pages, or add annotations. Our interactive editor gives you full control over your PDF structure and content.</p>
              <LucideIcons.ArrowRight className="text-brand" size={20} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
