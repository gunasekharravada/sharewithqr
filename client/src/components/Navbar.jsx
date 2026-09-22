import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Send', path: '/send' },
  { name: 'Receive', path: '/receive' }
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close the mobile menu on navigation and on Escape
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex min-h-[44px] items-center gap-2.5 rounded-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Temp<span className="text-blue-400">Share</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={`inline-flex min-h-[40px] items-center rounded-lg px-4 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-900 hover:text-white md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="fade-up border-t border-slate-800 bg-slate-950 md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
