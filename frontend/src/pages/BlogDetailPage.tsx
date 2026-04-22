import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/Navigation';
import { BlogPost } from '../types/blog';
import { format } from 'date-fns';
import { Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from '../components/SEO';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = blog?.title || '';
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return format(date, 'MMMM do, yyyy');
    } catch (e) {
      return 'Recently';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="text-brand font-bold underline">Back to Blog</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SEO 
        title={blog.seo?.title || `${blog.title} | PDFMaster Blog`}
        description={blog.seo?.description || blog.excerpt}
        canonical={`/blog/${blog.slug}`}
        ogType="article"
      />
      <Navbar />

      <article className="flex-1">
        {/* Progress Bar */}
        <motion.div 
          className="fixed top-0 left-0 h-1 bg-brand z-[100]"
          style={{ width: '0%' }} // Note: In a real app we'd use useScroll
        />

        {/* Hero Section */}
        <header className="relative py-20 bg-zinc-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src={blog.featuredImage} 
              alt="" 
              className="w-full h-full object-cover opacity-30 blur-sm scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to all articles
            </Link>
            <div className="flex justify-center flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-brand mb-6">
              <span>{blog.category}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 flex items-center gap-1.5"><Clock size={14}/> {blog.readingTime} read</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] leading-tight mb-8 tracking-tight">
              {blog.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-zinc-400 font-medium">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                <User size={20} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-bold">{blog.author}</p>
                <p className="text-xs">{formatDate(blog.publishedAt)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="mx-auto max-w-7xl px-6 py-20 flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <div className="flex-1 max-w-3xl prose prose-zinc lg:prose-xl">
            <div className="markdown-body">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
            
            {/* Social Share sticky small buttons for mobile */}
            <div className="mt-16 pt-10 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Share this story</span>
              <div className="flex gap-4">
                <button onClick={() => handleShare('twitter')} className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-brand transition-all"><Twitter size={20}/></button>
                <button onClick={() => handleShare('facebook')} className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-brand transition-all"><Facebook size={20}/></button>
                <button onClick={() => handleShare('linkedin')} className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-brand transition-all"><Linkedin size={20}/></button>
                <button onClick={() => handleShare('copy')} className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-brand transition-all relative">
                   {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-12">
            <div className="sticky top-28 space-y-12">
              {/* Share */}
              <div className="hidden lg:block bg-[#f8fafc] p-8 rounded-[24px]">
                <h4 className="text-xs font-[900] uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                  <Share2 size={14} /> Share Article
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleShare('twitter')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:border-brand hover:text-brand transition-all font-bold text-sm">
                    Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:border-brand hover:text-brand transition-all font-bold text-sm">
                    Facebook
                  </button>
                </div>
                <button 
                  onClick={() => handleShare('copy')} 
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:border-brand hover:text-brand transition-all font-bold text-sm"
                >
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Related Tools - CTA */}
              <div className="bg-brand text-white p-8 rounded-[24px] shadow-2xl shadow-brand/20">
                <h4 className="text-xs font-[900] uppercase tracking-widest text-brand-foreground/60 mb-4">Related Tools</h4>
                <div className="space-y-4">
                  {blog.tags.some(t => t.toLowerCase().includes('merge')) && (
                    <Link to="/merge-pdf" className="block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all group">
                      <p className="text-sm font-bold mb-1">Combine PDFs</p>
                      <p className="text-xs opacity-60">Join multiple files into one professional document.</p>
                    </Link>
                  )}
                  {blog.tags.some(t => t.toLowerCase().includes('compress')) && (
                    <Link to="/compress-pdf" className="block p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all group">
                      <p className="text-sm font-bold mb-1">Reduce Size</p>
                      <p className="text-xs opacity-60">Optimize your PDFs for email sharing.</p>
                    </Link>
                  )}
                  <Link to="/" className="block text-center py-4 bg-white text-brand rounded-xl font-[800] text-sm hover:scale-[1.02] transition-transform">
                    View All Tools
                  </Link>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-zinc-900 text-white p-8 rounded-[24px]">
                <h4 className="text-xs font-[900] uppercase tracking-widest text-zinc-500 mb-4">Stay Updated</h4>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Join 10,000+ readers getting our monthly PDF productivity tips.</p>
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand"
                  />
                  <button className="w-full py-3 bg-brand text-white rounded-xl font-bold text-sm">Subscribe</button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </div>
  );
}
