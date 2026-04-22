import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import BlogListingPage from './pages/BlogListingPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { Navbar, Footer } from './components/Navigation';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex min-h-screen flex-col font-sans selection:bg-rose-100 selection:text-brand">
            <Routes>
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <HomePage />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/blog" element={<BlogListingPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/:toolId" element={<ToolPage />} />
            </Routes>
          </div>
        </Router>
    </HelmetProvider>
  );
}
