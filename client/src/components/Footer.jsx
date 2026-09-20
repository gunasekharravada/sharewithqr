import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Clock, Lock, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Temp<span className="text-blue-500">Share</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Share anything temporarily. Access via 6-digit OTP or QR code. 
              Files and text disappear completely once they expire.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-400" /> Secure Transit</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> Auto-Purge</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> Zero Signup</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/send" className="hover:text-blue-400 transition-colors">Send Files & Text</Link></li>
              <li><Link to="/receive" className="hover:text-blue-400 transition-colors">Receive a Share</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Trust & Privacy</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About TempShare</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TempShare. All rights reserved. Share Now. Gone When You're Done.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online Temporary Storage Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
