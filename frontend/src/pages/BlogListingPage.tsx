import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/Navigation';
import { BlogPost } from '../types/blog';
import { format } from 'date-fns';
import { Clock, Tag, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Recently';
    }
  };

  const categories = ['All', ...new Set(blogs.map(b => b.category))];

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <SEO 
        title="PDFMaster Blog – Document Tips, Tricks & Tutorials"
        description="Stay updated with the latest PDF tutorials, productivity hacks, and document management tips on the official PDFMaster blog."
        canonical="/blog"
      />
      <Navbar />
      
      <main className="flex-1 py-16 px-4 md:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-[800] tracking-tight text-zinc-900 mb-4">Latest Insights</h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">Master your documents with our professional guides and industry tips.</p>
          </header>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Search articles or tags..." 
                className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-6 text-sm outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto md:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? "bg-brand text-white shadow-lg shadow-brand/20" 
                      : "bg-white text-zinc-600 border border-zinc-200 hover:border-brand/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-white border border-zinc-200 rounded-[24px] h-[400px]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {filteredBlogs.map((blog, idx) => (
                <motion.article 
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex flex-col bg-white rounded-[24px] border border-zinc-200 overflow-hidden hover:border-brand/40 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all"
                >
                  <Link to={`/blog/${blog.slug}`} className="block relative h-64 overflow-hidden">
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-brand">
                        {blog.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 mb-4">
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {blog.readingTime}</span>
                      <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                    <Link to={`/blog/${blog.slug}`}>
                      <h2 className="text-2xl font-[800] text-zinc-900 mb-3 group-hover:text-brand transition-colors leading-tight">
                        {blog.title}
                      </h2>
                    </Link>
                    <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-1">
                      {blog.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {blog.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-zinc-400">#{tag}</span>
                      ))}
                    </div>
                    <Link 
                      to={`/blog/${blog.slug}`} 
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all"
                    >
                      Read Full Article <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!loading && filteredBlogs.length === 0 && (
            <div className="text-center py-24">
              <p className="text-zinc-400 text-lg">No articles found matching your criteria.</p>
              <button onClick={() => {setSearch(''); setSelectedCategory('All');}} className="mt-4 text-brand font-bold underline px-4 py-2">Clear all filters</button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
