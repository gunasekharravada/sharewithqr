import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Download, HelpCircle, Info, Menu, X, ShieldCheck, Sparkles } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Send', path: '/send', icon: Send },
    { name: 'Receive', path: '/receive', icon: Download },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'About', path: '/about', icon: Info },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Temp<span className="text-blue-500">Share</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase -mt-1">
                Temporary Online Sharing
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-white bg-slate-800/80 border border-slate-700/60 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/receive"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Enter Code
            </Link>
            <Link
              to="/send"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              Send Something
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-6 space-y-2 backdrop-blur-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(item.path)
                    ? 'text-white bg-blue-600/20 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 text-blue-400" />}
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 flex flex-col gap-2 border-t border-slate-800 mt-2">
            <Link
              to="/send"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/25"
            >
              <Send className="w-4 h-4" />
              Start Sharing Now
            </Link>
            <Link
              to="/receive"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-center text-sm font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Receive with Code / QR
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
