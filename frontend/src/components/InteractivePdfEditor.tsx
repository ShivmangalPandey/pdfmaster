import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Trash2, 
  Move, 
  Check, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  MousePointer2,
  Settings2,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PdfAnnotation {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  pageIndex: number;
  fontSize: number;
  color: string;
  isWatermark?: boolean;
}

interface InteractivePdfEditorProps {
  file: File;
  onProcess: (annotations: PdfAnnotation[]) => void;
  isProcessing: boolean;
}

export const InteractivePdfEditor: React.FC<InteractivePdfEditorProps> = ({ file, onProcess, isProcessing }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.5);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // Editor State
  const [editMode, setEditMode] = useState<'add' | 'select'>('add');
  const [currentText, setCurrentText] = useState('New Text');
  const [currentSize, setCurrentSize] = useState(16);
  const [currentColor, setCurrentColor] = useState('#000000');

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoading(false);
      }
    };
    loadPdf();
  }, [file]);

  const renderPage = useCallback(async (pageIdx: number) => {
    if (!pdf || !canvasRefs.current[pageIdx]) return;
    
    const page = await pdf.getPage(pageIdx + 1);
    const canvas = canvasRefs.current[pageIdx]!;
    const context = canvas.getContext('2d')!;
    
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext : any= {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
  }, [pdf, scale]);

  useEffect(() => {
    if (pdf) {
      // For simplicity, we renders only current page and its neighbors
      renderPage(currentPage - 1);
    }
  }, [pdf, currentPage, renderPage]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIdx: number) => {
    if (editMode === 'select') {
      setSelectedId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation: PdfAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      text: currentText,
      x,
      y,
      pageIndex: pageIdx,
      fontSize: currentSize,
      color: currentColor,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedId(newAnnotation.id);
    setEditMode('select');
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateAnnotation = (id: string, updates: Partial<PdfAnnotation>) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const selectedAnnotation = annotations.find(a => a.id === selectedId);

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-bottom border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
            <button 
              onClick={() => setEditMode('add')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all",
                editMode === 'add' ? "bg-brand text-white" : "text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <Plus size={16} />
              Add Text
            </button>
            <button 
              onClick={() => setEditMode('select')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-bold transition-all",
                editMode === 'select' ? "bg-brand text-white" : "text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <MousePointer2 size={16} />
              Select & Edit
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-200" />

          {selectedAnnotation ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              <input 
                type="text" 
                value={selectedAnnotation.text}
                onChange={(e) => updateAnnotation(selectedId!, { text: e.target.value })}
                className="w-48 px-3 py-1.5 text-[13px] rounded-lg border border-zinc-200 outline-none focus:border-brand"
                placeholder="Annotation text..."
              />
              <select 
                value={selectedAnnotation.fontSize}
                onChange={(e) => updateAnnotation(selectedId!, { fontSize: parseInt(e.target.value) })}
                className="px-2 py-1.5 text-[13px] rounded-lg border border-zinc-200"
              >
                {[12, 14, 16, 18, 20, 24, 32, 48].map(s => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
              <input 
                type="color" 
                value={selectedAnnotation.color}
                onChange={(e) => updateAnnotation(selectedId!, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
              />
              <button 
                onClick={() => removeAnnotation(selectedId!)}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-zinc-400 text-[13px] italic">
              {editMode === 'add' ? 'Click on PDF to place text' : 'Select an annotation to edit'}
            </div>
          )}
        </div>

        <button 
          onClick={() => onProcess(annotations)}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-[14px] font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          Apply Changes
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex overflow-hidden bg-zinc-100/50">
        {/* Sidebar/Page Navigator */}
        <div className="w-64 border-r border-zinc-200 bg-white overflow-y-auto p-4 space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Pages</h4>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: numPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "aspect-[3/4] rounded-lg border-2 transition-all p-1 bg-zinc-50 flex items-center justify-center relative",
                  currentPage === i + 1 ? "border-brand shadow-md" : "border-zinc-100 hover:border-zinc-300"
                )}
              >
                <span className="text-[10px] font-bold text-zinc-400">P{i + 1}</span>
                {annotations.some(a => a.pageIndex === i) && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative scrollbar-thin scrollbar-thumb-zinc-300" ref={containerRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-brand" size={48} />
              <p className="text-zinc-500 font-medium">Loading document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 min-w-max">
              {/* Only render pages around the current one for performance */}
              {Array.from({ length: numPages }).map((_, i) => {
                const isVisible = Math.abs(i - (currentPage - 1)) <= 1;
                if (!isVisible) return null;

                return (
                  <div 
                    key={i} 
                    className={cn(
                      "relative shadow-2xl bg-white border border-zinc-200 transition-opacity",
                      currentPage === i + 1 ? "opacity-100" : "opacity-30 pointer-events-none scale-95 blur-sm"
                    )}
                  >
                    <canvas 
                      ref={el => { canvasRefs.current[i] = el; }}
                      className="block pointer-events-none"
                    />
                    
                    {/* Interactive overlay */}
                    <div 
                      className={cn(
                        "absolute inset-0 overflow-hidden",
                        editMode === 'add' ? "cursor-crosshair" : "cursor-default"
                      )}
                      onClick={(e) => handlePageClick(e, i)}
                    >
                      {/* Active Annotations */}
                      {annotations.filter(a => a.pageIndex === i).map(a => (
                        <motion.div
                          key={a.id}
                          drag={editMode === 'select' && selectedId === a.id}
                          dragMomentum={false}
                          onDragEnd={(_, info) => {
                            const rect = canvasRefs.current[i]!.getBoundingClientRect();
                            const newX = a.x + (info.delta.x / rect.width) * 100;
                            const newY = a.y + (info.delta.y / rect.height) * 100;
                            updateAnnotation(a.id, { x: newX, y: newY });
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(a.id);
                            setEditMode('select');
                          }}
                          style={{
                            left: `${a.x}%`,
                            top: `${a.y}%`,
                            color: a.color,
                            fontSize: `${a.fontSize}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          className={cn(
                            "absolute whitespace-nowrap px-1 py-0.5 rounded cursor-move select-none transition-all",
                            selectedId === a.id ? "ring-2 ring-brand ring-offset-2 bg-brand/10 z-10" : "hover:bg-zinc-100/50 z-0"
                          )}
                        >
                          {a.text}
                          {selectedId === a.id && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900 text-white p-1 rounded-md shadow-lg pointer-events-none">
                              <Move size={10} />
                              <span className="text-[9px] font-bold">DRAG</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                        PAGE {i + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
