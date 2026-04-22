import { Link } from 'react-router-dom';
import { FileText, Github, LogIn } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-[72px] w-full border-b border-zinc-200 bg-white px-4 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 text-[20px] md:text-[22px] font-[800] text-brand tracking-[-0.02em]">
          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-md bg-brand text-white text-[16px] font-bold">
            P
          </div>
          <span className="hidden sm:inline">PDFMaster</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-zinc-500">
        <Link to="/merge-pdf" className="transition-colors hover:text-brand">Merge PDF</Link>
        <Link to="/compress-pdf" className="transition-colors hover:text-brand">Compress</Link>
        <Link to="/blog" className="transition-colors hover:text-brand">Blog</Link>
        <Link to="/#tools" className="transition-colors hover:text-brand">All Tools</Link>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link 
          to="/#tools" 
          className="rounded-lg bg-brand px-4 md:px-6 py-[10px] text-[14px] font-[600] text-white transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[22px] font-[800] text-brand tracking-[-0.02em]">
              <div className="flex h-[32px] w-[32px] items-center justify-center rounded-md bg-brand text-white text-[16px] font-bold">
                P
              </div>
              PDFMaster
            </div>
            <p className="max-w-[300px] text-[14px] text-zinc-500 leading-relaxed">
              Every tool you need to work with PDFs in one place. 100% free and easy to use.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/merge-pdf" className="text-[14px] text-zinc-600 hover:text-brand">Merge PDF</Link></li>
                <li><Link to="/compress-pdf" className="text-[14px] text-zinc-600 hover:text-brand">Compress PDF</Link></li>
                <li><Link to="/blog" className="text-[14px] text-zinc-600 hover:text-brand">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[14px] text-zinc-600 hover:text-brand">Privacy</a></li>
                <li><a href="#" className="text-[14px] text-zinc-600 hover:text-brand">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-100 text-center text-[12px] text-zinc-400">
          © {new Date().getFullYear()} PDFMaster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
