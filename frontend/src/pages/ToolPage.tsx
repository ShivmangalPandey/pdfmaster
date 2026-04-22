import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import { Navbar, Footer } from '../components/Navigation';
import { Upload, File, X, Download, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../lib/utils';
import { FileInfo } from '../types';
import * as pdfjs from 'pdfjs-dist';
import { SEO } from '../components/SEO';
import { TOOL_SEO_CONTENT } from '../toolContent';

import { InteractivePdfEditor, PdfAnnotation } from '../components/InteractivePdfEditor';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find(t => t.id === toolId || t.href === `/${toolId}`);
  
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<Record<string, any>>({
    watermarkText: 'PDFMASTER',
    editText: 'Edited with PDFMaster',
    compressionLevel: 'medium',
  });

  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);

  if (!tool) return <div className="p-20 text-center font-bold">Tool not found</div>;

  const seo = TOOL_SEO_CONTENT[tool.id as keyof typeof TOOL_SEO_CONTENT] || {
    title: `${tool.name} Online – Free PDF Tools | PDFMaster`,
    metaDescription: tool.description,
    h1: tool.name,
    h2: `Optimized ${tool.name} Solution`,
    content: tool.description,
    faqs: []
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (fileList: File[]) => {
    const newFiles: FileInfo[] = fileList.map(file => ({
      id: Math.random().toString(36).substring(7),
      originalName: file.name,
      filename: file.name,
      size: file.size,
      mimetype: file.type,
      status: 'pending' as const,
      file: file,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const isImageTool = tool.id === 'jpg-to-pdf' || tool.id === 'ocr';
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => {
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isImage = f.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(f.name);
        return isImageTool ? (isPdf || isImage) : isPdf;
      });
      addFiles(droppedFiles);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleProcess = async (manualAnnotations?: PdfAnnotation[]) => {
    if (files.length === 0) return;
    setStatus('processing');
    setError(null);

    const activeAnnotations = manualAnnotations || annotations;

    try {
      if (tool.id === 'pdf-to-jpg') {
        // Client-side PDF to JPG logic
        const pdfFile = files[0]?.file;
        if (!pdfFile) throw new Error('No PDF file selected');
        
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        // Render 1st page to canvas
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error('Canvas context failed');
        await page.render({ canvasContext: context, viewport }).promise;
        
        const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
        setDownloadUrl(jpgUrl);
        setStatus('completed');
        return;
      }

      // Helper for safe JSON parsing
      const safeParseJson = async (response: Response) => {
        const contentType = response.headers.get("content-type");
        const text = await response.text();
        
        console.log(`🔌 API Response for ${response.url}: Status ${response.status}, Content-Type: ${contentType}`);

        if (contentType && contentType.includes("application/json")) {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("❌ JSON parse error:", e, "Raw text (first 500 chars):", text.substring(0, 500));
            return { _error: "Invalid JSON response from server", _raw: text.substring(0, 1000) };
          }
        }
        
        console.warn(`⚠️ Non-JSON response received. First 500 chars:`, text.substring(0, 500));
        return { 
          _error: `Server returned ${contentType || 'unknown type'} instead of JSON`, 
          _raw: text.substring(0, 1000), 
          _type: contentType,
          _isHtml: text.includes('<!doctype html>') || text.includes('<html')
        };
      };

      setStatus('uploading');
      // 1. Upload files
      const formData = new FormData();
      files.forEach(f => {
        if (f.file) {
          formData.append('files', f.file);
        }
      });

      console.log(`📤 Sending ${files.length} files to /api/upload...`);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await safeParseJson(uploadRes);

      if (!uploadRes.ok) {
        throw new Error(uploadData?.error || uploadData?._error ? `Upload failed (${uploadRes.status}): ${uploadData?._error || 'Unknown'}` : `Upload failed (${uploadRes.status})`);
      }
      
      if (!uploadData || !uploadData.files) {
        console.error("Invalid upload response:", uploadData);
        if (uploadData?._raw) {
          throw new Error(`Server returned non-JSON response: ${uploadData._raw.substring(0, 50)}...`);
        }
        throw new Error("Server returned an invalid response during upload (Missing files array)");
      }

      const uploadedFiles = uploadData.files;
      console.log(`✅ Upload successful, received ${uploadedFiles.length} file infos`);
      
      // 2. Process based on tool
      setStatus('processing');
      console.log(`⚙️ Processing tool: ${tool.id}`);
      const processRes = await fetch(`/api/tools/${tool.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileIds: uploadedFiles.map((f: any) => f.id),
          text: tool.id === 'edit' ? options.editText : options.watermarkText,
          level: options.compressionLevel,
          annotations: tool.id === 'edit' ? activeAnnotations : undefined,
        }),
      });

      const processData = await safeParseJson(processRes);

      if (!processRes.ok) {
        const errorMsg = processData?.error || processData?._error || `Processing failed (Status ${processRes.status})`;
        const details = processData?.details ? `\n\nBackend Stack: ${processData.details}` : '';
        const htmlContext = processData?._isHtml ? '\n\n⚠️ The server returned an HTML page instead of JSON. This usually indicates a 404 error, a server crash, or the server is still starting up. Please try again in 30 seconds.' : '';
        throw new Error(errorMsg + details + htmlContext);
      }

      if (!processData || !processData.downloadUrl) {
        throw new Error('Processing succeeded but server provided no download link');
      }

      console.log(`🎉 Processing complete! Download URL: ${processData.downloadUrl}`);
      setDownloadUrl(processData.downloadUrl);
      setResultData(processData);
      setStatus('completed');
    } catch (err: any) {
      console.error("Process handler error:", err);
      setError(err.message || 'An error occurred during processing');
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <SEO 
        title={seo.title}
        description={seo.metaDescription}
        canonical={tool.href}
        schemaData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": seo.h1,
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": seo.metaDescription,
          "mainEntity": seo.faqs.length > 0 ? {
            "@type": "FAQPage",
            "mainEntity": seo.faqs.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
          } : undefined
        }}
      />
      <Navbar />
      
      <main className="flex-1 py-16 px-10">
        <div className="mx-auto max-w-[944px]">
          <div className="mb-12 text-center">
            <h1 className="text-[36px] font-[800] tracking-[-0.03em] text-zinc-900 mb-2">{tool.name}</h1>
            <p className="text-[18px] text-zinc-500">{tool.description}</p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'idle' && files.length === 0 && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "group relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-zinc-200 p-12 transition-all hover:bg-rose-50/20",
                  isDragging ? "border-brand bg-rose-50/20" : "bg-white hover:border-brand"
                )}
              >
                <div className="mb-6 flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-rose-50 text-brand group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h2 className="mb-2 text-[20px] font-[700] text-zinc-900">Select PDF files</h2>
                <p className="mb-8 text-center text-[14px] text-zinc-500">
                  or drag and drop PDFs here
                </p>
                <button className="rounded-lg bg-brand px-10 py-3 text-[14px] font-[600] text-white transition-opacity hover:opacity-90">
                  Select Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={tool.id === 'merge' || tool.id === 'jpg-to-pdf'}
                  accept={tool.id === 'jpg-to-pdf' || tool.id === 'ocr' ? ".pdf,.jpg,.jpeg,.png" : ".pdf"}
                  className="hidden"
                />
              </motion.div>
            )}

            {files.length > 0 && status !== 'completed' && (
              <motion.div
                key="file-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {tool.id === 'edit' && files[0].file ? (
                  <InteractivePdfEditor 
                    file={files[0].file} 
                    isProcessing={status === 'processing' || status === 'uploading'}
                    onProcess={(annots) => handleProcess(annots)}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {files.map(file => (
                        <div key={file.id} className="group relative flex items-center gap-3 rounded-[12px] border border-zinc-200 bg-white p-4 transition-all hover:border-brand">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-brand">
                            <File size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-bold text-zinc-900">{file.originalName}</p>
                            <p className="text-[12px] text-zinc-500">{formatBytes(file.size)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {file.file && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = URL.createObjectURL(file.file!);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = file.originalName;
                                  a.click();
                                }}
                                title="Download original"
                                className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                              >
                                <Download size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-zinc-400 hover:text-brand transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-[74px] items-center justify-center gap-2 rounded-[12px] border border-dashed border-zinc-200 bg-white text-zinc-400 transition-all hover:border-brand hover:text-brand"
                      >
                        <Upload size={20} />
                        <span className="text-[14px] font-medium">Add more</span>
                      </button>
                    </div>

                    {/* Options Panel */}
                    {(tool.id === 'watermark' || tool.id === 'compress' || tool.id === 'protect' || tool.id === 'edit' || tool.id === 'merge') && (
                      <div className="rounded-[12px] border border-zinc-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Settings</h3>
                        
                        {tool.id === 'merge' && (
                          <div className="mb-4 rounded-lg bg-blue-50/50 p-4 text-[13px] text-blue-600">
                            <p className="font-bold">Pro Tip:</p>
                            <p>Select multiple files to merge them into a single document. If you only select one, we will verify its structure and optimize it.</p>
                          </div>
                        )}

                        {tool.id === 'edit' && (
                          <div className="space-y-2">
                            <label className="text-[14px] font-[600] text-zinc-700">Annotation Text</label>
                            <input 
                              type="text" 
                              value={options.editText}
                              onChange={(e) => setOptions(prev => ({ ...prev, editText: e.target.value }))}
                              placeholder="Enter text to add to pages..."
                              className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-[14px] outline-none focus:border-brand"
                            />
                            <p className="text-[12px] text-zinc-400 italic">This basic editor adds text to the top of all pages. Full visual editing coming soon.</p>
                          </div>
                        )}

                        {tool.id === 'watermark' && (
                          <div className="space-y-2">
                            <label className="text-[14px] font-[600] text-zinc-700">Watermark Text</label>
                            <input 
                              type="text" 
                              value={options.watermarkText}
                              onChange={(e) => setOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
                              className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-[14px] outline-none focus:border-brand"
                            />
                          </div>
                        )}
                        {tool.id === 'compress' && (
                          <div className="space-y-4">
                            <label className="text-[14px] font-[600] text-zinc-700">Compression Level</label>
                            <div className="grid grid-cols-3 gap-3">
                              {['low', 'medium', 'high'].map(lvl => (
                                <button
                                  key={lvl}
                                  onClick={() => setOptions(prev => ({ ...prev, compressionLevel: lvl }))}
                                  className={cn(
                                    "rounded-lg border px-4 py-2 text-[14px] font-bold capitalize transition-all",
                                    options.compressionLevel === lvl 
                                      ? "border-brand bg-rose-50 text-brand" 
                                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                                  )}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-4 py-8">
                      {status === 'idle' && (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => handleProcess()}
                            className="rounded-lg bg-brand px-12 py-4 text-[16px] font-[700] text-white shadow-lg shadow-brand/20 transition-all hover:opacity-90 active:scale-95"
                          >
                            {tool.id === 'edit' ? 'Apply & Download PDF' : `Process ${tool.name}`}
                          </button>
                          {tool.id === 'edit' && !options.editText && (
                            <p className="text-[12px] text-zinc-400">Click process to generate and download the PDF.</p>
                          )}
                        </div>
                      )}
                      
                      {(status === 'uploading' || status === 'processing') && (
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                          <Loader2 size={40} className="animate-spin" />
                          <p className="text-[14px] font-bold tracking-widest uppercase">{status}...</p>
                        </div>
                      )}

                      {status === 'error' && (
                        <div className="flex flex-col items-center gap-2 rounded-[12px] bg-red-50 p-6 text-red-600">
                          <AlertCircle size={32} />
                          <p className="font-bold">Error</p>
                          <p className="text-[12px]">{error}</p>
                          <button onClick={() => setStatus('idle')} className="mt-4 text-[12px] font-bold underline">Try Again</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {status === 'completed' && downloadUrl && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center rounded-[24px] border border-zinc-200 bg-white p-12 text-center shadow-xl shadow-zinc-200/40"
              >
                <div className="mb-6 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="mb-2 text-[28px] font-[800] tracking-[-0.02em] text-zinc-900">Success!</h2>
                <p className="mb-8 text-zinc-500">Your file has been processed successfully and is ready for download.</p>

                {tool.id === 'compress' && resultData && (
                  <div className="mb-8 w-full overflow-hidden rounded-[16px] border border-zinc-100 bg-zinc-50/50 p-6">
                    <div className="grid grid-cols-3 divide-x divide-zinc-200">
                      <div className="px-4">
                        <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Original</p>
                        <p className="text-[18px] font-extrabold text-zinc-900">{formatBytes(resultData.originalSize)}</p>
                      </div>
                      <div className="px-4">
                        <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Compressed</p>
                        <p className="text-[18px] font-extrabold text-brand">{formatBytes(resultData.compressedSize)}</p>
                      </div>
                      <div className="px-4">
                        <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Saving</p>
                        <p className="text-[20px] font-black text-emerald-600">{resultData.reductionPercentage}%</p>
                      </div>
                    </div>
                  </div>
                )}

                <a
                  href={downloadUrl}
                  download={resultData?.filename || (tool.id === 'pdf-to-jpg' ? 'converted.zip' : 'document.pdf')}
                  className="inline-flex items-center gap-3 rounded-xl bg-zinc-900 px-12 py-4 text-[16px] font-[700] text-white shadow-lg shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Download size={22} />
                  Download {tool.id === 'pdf-to-jpg' && (resultData?.filename?.endsWith('.zip')) ? 'Images (ZIP)' : (tool.id === 'pdf-to-jpg' ? 'Image (JPG)' : 'PDF')}
                </a>
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => { setStatus('idle'); setFiles([]); setDownloadUrl(null); setResultData(null); }}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-[14px] font-bold text-zinc-600 transition-all hover:bg-zinc-50"
                  >
                    <Upload size={18} />
                    Process another {tool.name}
                  </button>
                  <a 
                    href="/blog"
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-[14px] font-bold text-zinc-600 transition-all hover:bg-zinc-50"
                  >
                    Read Guides
                  </a>
                </div>

                <div className="mt-12 w-full border-t border-zinc-100 pt-8 text-left">
                  <p className="mb-4 text-[12px] font-bold text-zinc-400 uppercase tracking-widest">You might also need</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {tool.id !== 'merge' && (
                      <a href="/merge-pdf" className="group flex items-center justify-between rounded-xl border border-zinc-100 p-4 transition-all hover:border-brand hover:bg-rose-50/30">
                        <span className="font-bold text-zinc-700">Merge PDF</span>
                        <ArrowRight size={18} className="text-zinc-300 transition-all group-hover:translate-x-1 group-hover:text-brand" />
                      </a>
                    )}
                    {tool.id !== 'compress' && (
                      <a href="/compress-pdf" className="group flex items-center justify-between rounded-xl border border-zinc-100 p-4 transition-all hover:border-brand hover:bg-rose-50/30">
                        <span className="font-bold text-zinc-700">Compress PDF</span>
                        <ArrowRight size={18} className="text-zinc-300 transition-all group-hover:translate-x-1 group-hover:text-brand" />
                      </a>
                    )}
                    {tool.id !== 'edit' && (
                      <a href="/edit-pdf" className="group flex items-center justify-between rounded-xl border border-zinc-100 p-4 transition-all hover:border-brand hover:bg-rose-50/30">
                        <span className="font-bold text-zinc-700">Edit PDF</span>
                        <ArrowRight size={18} className="text-zinc-300 transition-all group-hover:translate-x-1 group-hover:text-brand" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deep Content Section for SEO */}
          <section className="mt-24 pt-16 border-t border-zinc-200">
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-[28px] font-[800] text-zinc-900 mb-6">{seo.h2}</h2>
              <p className="text-[16px] text-zinc-600 leading-relaxed mb-12">
                {seo.content}
              </p>

              {seo.faqs.length > 0 && (
                <div className="space-y-8 mt-16">
                  <h3 className="text-[20px] font-bold text-zinc-900 mb-6">Frequently Asked Questions</h3>
                  {seo.faqs.map((faq, idx) => (
                    <div key={idx} className="group border-b border-zinc-100 pb-6">
                      <h4 className="text-[15px] font-[700] text-zinc-800 mb-2">{faq.question}</h4>
                      <p className="text-[14px] text-zinc-500 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-20 p-8 rounded-3xl bg-rose-50/30 flex flex-col items-center text-center">
                <h3 className="text-[18px] font-bold text-zinc-900 mb-3">Need another tool?</h3>
                <p className="text-[14px] text-zinc-500 mb-6">Explore our full suite of professional PDF tools, all free and secure.</p>
                <Link to="/" className="text-brand font-bold hover:underline">View All Tool →</Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
