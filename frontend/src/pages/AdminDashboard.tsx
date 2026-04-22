import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navigation';
import { BlogPost } from '../types/blog';
import { Plus, Edit2, Trash2, ExternalLink, LayoutDashboard, FileText, Image, Search, X, Check, Save } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchBlogs();
  }, [token, navigate]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: 'https://picsum.photos/seed/new/800/400',
      author: 'Admin',
      category: 'General',
      tags: [],
      readingTime: '5 min',
      seo: { title: '', description: '', keywords: [] }
    });
    setIsModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost({ ...post });
    setIsModalOpen(true);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!editingPost) return;
    try {
      const isNew = !editingPost.id;
      const url = isNew ? '/api/admin/blogs' : `/api/admin/blogs/${editingPost.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPost)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBlogs();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-[900] text-zinc-900 tracking-tight">Content Management</h1>
              <p className="text-zinc-500">Manage your SEO strategy and blog publication workflow</p>
            </div>
            <button 
              onClick={handleCreatePost}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-brand text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus size={20} /> New Blog Post
            </button>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
             <div className="bg-white p-6 rounded-[24px] border border-zinc-200">
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Articles</p>
               <p className="text-3xl font-[900] text-zinc-900">{blogs.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[24px] border border-zinc-200">
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Published</p>
               <p className="text-3xl font-[900] text-zinc-900">{blogs.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[24px] border border-zinc-200">
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Organic Reach</p>
               <p className="text-3xl font-[900] text-zinc-900">Growth 🚀</p>
             </div>
          </div>

          {/* Blogs List */}
          <div className="bg-white rounded-[32px] border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-[11px] font-[900] uppercase tracking-wider text-zinc-400 border-b border-zinc-200">
                    <th className="px-8 py-5">Article Info</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5">SEO Performance</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {blogs.map(blog => (
                    <tr key={blog.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={blog.featuredImage} className="h-12 w-12 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-zinc-900 group-hover:text-brand transition-colors">{blog.title}</p>
                            <p className="text-xs text-zinc-500">/{blog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-24 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[85%]"></div>
                           </div>
                           <span className="text-xs font-bold text-green-600 uppercase">Excellent</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditPost(blog)} className="p-3 text-zinc-400 hover:text-brand hover:bg-rose-50 rounded-xl transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeletePost(blog.id)} className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                          <a href={`/blog/${blog.slug}`} target="_blank" className="p-3 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-5xl max-h-full bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100">
              <h2 className="text-xl font-[900] tracking-tight">{editingPost.id ? 'Edit Article' : 'Compose Article'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-brand transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Title</label>
                    <input 
                      type="text" 
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({...editingPost, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})}
                      className="w-full rounded-2xl border border-zinc-200 px-6 py-4 text-sm font-bold shadow-sm outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Slug (Auto-generated)</label>
                    <input 
                      type="text" 
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({...editingPost, slug: e.target.value})}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-mono text-zinc-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1 text-brand">Content (Markdown Support)</label>
                    <textarea 
                      rows={12}
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                      className="w-full rounded-2xl border border-zinc-200 px-6 py-4 text-sm font-medium shadow-sm outline-none focus:border-brand transition-all resize-none"
                    />
                  </div>
               </div>

               <div className="space-y-8 bg-zinc-50 p-8 rounded-[24px]">
                  <div className="space-y-4">
                    <h4 className="text-xs font-[900] uppercase tracking-widest text-zinc-400">Metadata</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">Category</label>
                      <input 
                        type="text" 
                        value={editingPost.category}
                        onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">Excerpt</label>
                      <textarea 
                        rows={3}
                        value={editingPost.excerpt}
                        onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-brand resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-[900] uppercase tracking-widest text-brand">SEO Settings</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">Meta Title</label>
                      <input 
                        type="text" 
                        value={editingPost.seo?.title}
                        onChange={(e) => setEditingPost({...editingPost, seo: {...editingPost.seo!, title: e.target.value}})}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500">Meta Description</label>
                      <textarea 
                        rows={3}
                        value={editingPost.seo?.description}
                        onChange={(e) => setEditingPost({...editingPost, seo: {...editingPost.seo!, description: e.target.value}})}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-brand resize-none"
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="px-8 py-6 border-t border-zinc-100 bg-white flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 rounded-xl text-zinc-400 font-bold hover:text-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-10 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-xl shadow-zinc-200 hover:opacity-90 transition-all"
              >
                <Save size={18} /> Save & Publish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
