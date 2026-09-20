import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ToastContainer } from './components/Toast.jsx';

import { Home } from './pages/Home.jsx';
import { SendPage } from './pages/Send.jsx';
import { ReceivePage } from './pages/Receive.jsx';
import { ShareResult } from './pages/ShareResult.jsx';
import { ShareView } from './pages/ShareView.jsx';
import { About } from './pages/About.jsx';
import { HowItWorks } from './pages/HowItWorks.jsx';
import { Privacy } from './pages/Privacy.jsx';
import { Terms } from './pages/Terms.jsx';
import { Faq } from './pages/Faq.jsx';

export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/share/:token" element={<ShareResult />} />
          <Route path="/s/:token" element={<ShareView />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
