/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu,
  X,
  Home,
  CheckCircle,
  ArrowRight,
  Star,
  Download, 
  Upload,
  Printer, 
  RotateCcw, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Box, 
  Layers, 
  Palette, 
  Maximize, 
  Hash, 
  DollarSign,
  FileText,
  Lock,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

interface QuoteItem {
  id: string;
  description: string;
  quantity: string;
  pricePerUnit: string;
}

interface FormData {
  customerName: string;
  companyName: string;
  address: string;
  contactNumber: string;
  email: string;
  items: QuoteItem[];
  laborCost: string;
  cuttingFee: string;
  transportationFee: string;
  discount: string;
  quoteNumber: string;
  customerId: string;
  validUntil: string;
  taxRate: string;
  otherFees: string;
  preparedBy: string;
  preparedFor: string;
  contactInfo: string;
  logoUrl: string;
  quotationTitle: string;
}

const createNewItem = (): QuoteItem => ({
  id: Math.random().toString(36).substr(2, 9),
  description: '',
  quantity: '1',
  pricePerUnit: '',
});

const initialFormData: FormData = {
  customerName: '',
  companyName: '',
  address: '',
  contactNumber: '',
  email: '',
  items: [createNewItem()],
  laborCost: '0',
  cuttingFee: '0',
  transportationFee: '0',
  discount: '0',
  quoteNumber: Math.floor(100000 + Math.random() * 900000).toString(),
  customerId: '123',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  taxRate: '0',
  otherFees: '0',
  preparedBy: 'FINEBONE, FAITHWINS.',
  preparedFor: '',
  contactInfo: '08065875856, E-mail: faithwins.finebone@gmail.com',
  logoUrl: 'https://raw.githubusercontent.com/VTQIT/metal-gear-map/main/M&N.jpg',
  quotationTitle: 'QUOTATION FOR PROCESSING AND INSTALLATION OF WOODEN KITCHEN CABINET AND ACCESSORIES.',
};

export default function App() {
  const [view, setView] = useState<'home' | 'login'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', companyName: '' });
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxable: 0,
    taxAmount: 0,
    totalCost: 0,
    finalPrice: 0,
  });
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = [
      { username: 'Noel', password: 'admin@userNOEL' },
      { username: 'admin', password: 'admin@user' }
    ];

    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);

    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user.username);
      setLoginError('');
      setIsSidebarOpen(false);
      // If company name was provided, update the form data
      if (loginData.companyName) {
        setFormData(prev => ({ ...prev, companyName: loginData.companyName }));
      }
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setView('home');
    setLoginData({ username: '', password: '', companyName: '' });
  };

  useEffect(() => {
    const saved = localStorage.getItem('mn_saved_quotes');
    if (saved) {
      try {
        setSavedQuotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved quotes');
      }
    }
  }, []);

  const saveQuote = () => {
    const newQuote = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      total: totals.finalPrice
    };
    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    localStorage.setItem('mn_saved_quotes', JSON.stringify(updated));
    alert('Quote saved successfully to CMS!');
  };

  const loadQuote = (quote: any) => {
    setFormData(quote);
    setShowSavedQuotes(false);
  };

  const deleteQuote = (id: number) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('mn_saved_quotes', JSON.stringify(updated));
  };

  useEffect(() => {
    const itemsSubtotal = formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.pricePerUnit) || 0;
      return sum + (qty * price);
    }, 0);

    const labor = parseFloat(formData.laborCost) || 0;
    const cutting = parseFloat(formData.cuttingFee) || 0;
    const transport = parseFloat(formData.transportationFee) || 0;
    const disc = parseFloat(formData.discount) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const other = parseFloat(formData.otherFees) || 0;

    const subtotal = itemsSubtotal;
    const taxable = subtotal + labor + cutting + transport + other; 
    const taxAmount = (taxable * taxRate) / 100;
    const totalCost = taxable + taxAmount;
    const finalPrice = totalCost - disc;

    setTotals({
      subtotal,
      taxable,
      taxAmount,
      totalCost,
      finalPrice,
    });
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createNewItem()]
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      quoteNumber: Math.floor(100000 + Math.random() * 900000).toString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJPG = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Quote-${formData.quoteNumber}-${formData.customerName || 'Client'}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLoggedIn && view === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 tracking-tight">Smile Quotation Generator</span>
              </div>
              
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[70] shadow-2xl p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-slate-900">Menu</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-2 flex-1">
                  <button 
                    onClick={() => { setView('home'); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-emerald-600 font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </button>
                  <button 
                    onClick={() => { setView('login'); setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    Admin Login
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-4 px-4">Support</p>
                  <a href="mailto:faithwins.finebone@gmail.com" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-emerald-600 transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <Star className="w-3 h-3 fill-emerald-700" />
                  Professional Quotation System
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                  Quotation Form <span className="text-emerald-600">Genarator</span>.
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                  Professional, precise, and professional-grade quotation generator designed specifically for freelancer, or small business owner.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setView('login')}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex -space-x-3 items-center">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    ))}
                    <div className="pl-6 text-sm font-medium text-slate-500">
                      Trusted by <span className="text-slate-900 font-bold">50+</span> installers
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-[2rem] blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sample Quotation</span>
                  </div>
                  <div className="p-4 sm:p-8">
                    <img 
                      src="https://raw.githubusercontent.com/VTQIT/metal-gear-map/main/Quote-289799-Client.jpg" 
                      alt="Sample Quotation" 
                      className="w-full rounded-xl shadow-sm border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features */}
            <div className="mt-24 grid sm:grid-cols-3 gap-8">
              {[
                { title: 'Instant JPG', desc: 'Download professional quotations as high-quality images ready for WhatsApp or Email.', icon: Download },
                { title: 'Mobile Ready', desc: 'Fully responsive design works perfectly on phones, tablets, and webviews.', icon: Maximize },
                { title: 'Smart CMS', desc: 'Save and manage your quotations in a secure dashboard for easy retrieval.', icon: LayoutDashboard },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                    <feature.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Marketing Section */}
            <div className="mt-24 rounded-[3rem] bg-slate-900 p-12 sm:p-20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/20 blur-[120px]" />
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                    Scale your cabinet business with <span className="text-emerald-400">precision.</span>
                  </h2>
                  <div className="space-y-4 mb-8">
                    {['Professional Branding', 'Automatic Calculations', 'Client Management', 'Secure Access'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setView('login')}
                    className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all transform hover:-translate-y-1"
                  >
                    Start for Free
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <img src="https://picsum.photos/seed/marketing1/400/600" className="rounded-2xl shadow-2xl transform -rotate-3" referrerPolicy="no-referrer" />
                  <img src="https://picsum.photos/seed/marketing2/400/600" className="rounded-2xl shadow-2xl transform rotate-3 mt-12" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">Smile Quotation Generator</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Smile Quotation Generator. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  if (!isLoggedIn && view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10"
        >
          <div className="bg-emerald-600 p-10 text-center relative overflow-hidden">
            <button 
              onClick={() => setView('home')}
              className="absolute top-6 left-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6 backdrop-blur-md">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
            <p className="text-emerald-100 mt-2 font-medium">Secure access for authorized installers</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {loginError}
              </motion.div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
                  placeholder="Enter username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Company Name</label>
              <div className="relative">
                <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
                  placeholder="Enter company name"
                  value={loginData.companyName}
                  onChange={(e) => setLoginData({ ...loginData, companyName: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] mt-4"
            >
              Sign In to Dashboard
            </button>
            <p className="text-center text-slate-400 text-xs font-medium">
              Forgot credentials? Contact <a href="#" className="text-emerald-600 hover:underline">Support</a>
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Admin Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase leading-none">Admin Dashboard</p>
              <p className="text-sm font-bold text-slate-700">Welcome, {currentUser}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setShowSavedQuotes(!showSavedQuotes)}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all flex-1 sm:flex-none justify-center ${showSavedQuotes ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileText className="w-4 h-4" />
              {showSavedQuotes ? 'Back' : 'Saved Quotes'}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50 flex-1 sm:flex-none justify-center"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {showSavedQuotes ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Saved Quotations (CMS)</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {savedQuotes.length} Total Quotes
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Quote #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savedQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        No saved quotes found.
                      </td>
                    </tr>
                  ) : (
                    savedQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-emerald-600">{quote.quoteNumber}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{quote.customerName}</div>
                          <div className="text-xs text-slate-400">{quote.companyName}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(quote.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">₱{formatCurrency(quote.total)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => loadQuote(quote)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold text-xs uppercase tracking-wider"
                          >
                            Load
                          </button>
                          <button 
                            onClick={() => deleteQuote(quote.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-wider"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Modular Cabinet Quotation Generator
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Professional business-style quotation generator with multi-item support.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              {/* Form Section */}
              <div className="space-y-6">
                {/* Quote Metadata */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-600">
                      <FileText className="w-5 h-5" />
                      Quote Details
                    </h2>
                    <button 
                      onClick={saveQuote}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Save to CMS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quote #</label>
                  <input type="text" name="quoteNumber" value={formData.quoteNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer ID</label>
                  <input type="text" name="customerId" value={formData.customerId} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valid Until</label>
                  <input type="date" name="validUntil" value={formData.validUntil} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tax Rate (%)</label>
                  <input type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" placeholder="ACME Corp" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" placeholder="123 Street, City" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" placeholder="0912 345 6789" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" placeholder="john@example.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-emerald-600">
                  <Box className="w-5 h-5" />
                  Quote Items
                </h2>
                <button 
                  onClick={addItem}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all"
                >
                  <Hash className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase">Item #{index + 1}</span>
                    {formData.items.length > 1 && (
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Remove Item"
                      >
                        <RotateCcw className="w-4 h-4 rotate-45" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input 
                        type="text" 
                        value={item.description} 
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded border border-slate-200 text-sm" 
                        placeholder="e.g. Sheet of 3/4 coffee brown HDF Plywood"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qty</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 rounded border border-slate-200 text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (₱)</label>
                        <input 
                          type="number" 
                          value={item.pricePerUnit} 
                          onChange={(e) => handleItemChange(item.id, 'pricePerUnit', e.target.value)}
                          className="w-full px-3 py-2 rounded border border-slate-200 text-sm" 
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600">
                <Palette className="w-5 h-5" />
                Quotation Branding
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Logo</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all text-sm text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span>Upload Local Logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">OR URL:</span>
                      <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} className="flex-1 px-3 py-2 rounded border border-slate-200 text-sm" placeholder="https://..." />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Main Title</label>
                  <textarea name="quotationTitle" value={formData.quotationTitle} onChange={(e: any) => handleInputChange(e)} className="w-full px-3 py-2 rounded border border-slate-200 text-sm h-20" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600">
                <DollarSign className="w-5 h-5" />
                Additional Costs & Info
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Labour (₱)</label>
                  <input type="number" name="laborCost" value={formData.laborCost} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cutting Fee (₱)</label>
                  <input type="number" name="cuttingFee" value={formData.cuttingFee} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transportation (₱)</label>
                  <input type="number" name="transportationFee" value={formData.transportationFee} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount (₱)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prepared By</label>
                  <input type="text" name="preparedBy" value={formData.preparedBy} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Info</label>
                  <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-slate-200 text-sm" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDownloadJPG} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded shadow transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download JPG
              </button>
              <button onClick={handlePrint} className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded border border-slate-200 transition-all flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button onClick={handleReset} className="bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-6 rounded border border-red-100 transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="xl:sticky xl:top-8 h-fit">
            <div className="bg-white shadow-2xl overflow-hidden rounded-xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center xl:hidden">
                <span className="text-xs font-bold text-slate-500 uppercase">Quotation Preview</span>
                <span className="text-[10px] text-slate-400 italic">Scroll horizontally to view full page</span>
              </div>
              <div className="overflow-x-auto">
                <div 
                  ref={previewRef}
                  id="quotation-preview"
                  className="bg-white p-4 sm:p-8 flex flex-col min-h-[1100px] text-black border border-black w-[800px] sm:w-full mx-auto"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                {/* Title and Logo */}
                <div className="flex items-center gap-4 border border-black p-2 mb-4">
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/mncabinet/200/200';
                      }}
                    />
                  </div>
                  <div className="flex-grow text-center">
                    <h2 className="text-lg font-bold uppercase leading-tight">
                      {formData.quotationTitle}
                    </h2>
                  </div>
                </div>

                {/* Table Header */}
                <table className="w-full border-collapse border border-black text-[12px]">
                  <thead>
                    <tr className="font-bold">
                      <th className="border border-black px-1 py-1 w-10 text-center">S/N</th>
                      <th className="border border-black px-1 py-1 w-12 text-center">QTY</th>
                      <th className="border border-black px-2 py-1 text-center uppercase">Description</th>
                      <th className="border border-black px-2 py-1 w-24 text-center uppercase">Amt/Unit</th>
                      <th className="border border-black px-2 py-1 w-24 text-center uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-black px-1 py-1 text-center">{index + 1}</td>
                        <td className="border border-black px-1 py-1 text-center">{item.quantity}</td>
                        <td className="border border-black px-2 py-1">{item.description || '[Item Description]'}</td>
                        <td className="border border-black px-2 py-1 text-right">{formatCurrency(parseFloat(item.pricePerUnit) || 0)}</td>
                        <td className="border border-black px-2 py-1 text-right">
                          {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.pricePerUnit) || 0))}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Empty rows to fill space */}
                    {[...Array(Math.max(0, 15 - formData.items.length))].map((_, i) => (
                      <tr key={i}>
                        <td className="border border-black px-1 py-4"></td>
                        <td className="border border-black px-1 py-4"></td>
                        <td className="border border-black px-2 py-4"></td>
                        <td className="border border-black px-2 py-4"></td>
                        <td className="border border-black px-2 py-4"></td>
                      </tr>
                    ))}

                    {/* Subtotal Row */}
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 text-right font-bold italic">Total</td>
                      <td className="border border-black px-2 py-1 bg-slate-100"></td>
                      <td className="border border-black px-2 py-1 text-right font-bold bg-slate-200">
                        {formatCurrency(totals.subtotal)}
                      </td>
                    </tr>

                    {/* Summary Section */}
                    <tr className="font-bold">
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 underline uppercase">SUMMARY</td>
                      <td className="border border-black px-1 py-1"></td>
                      <td className="border border-black px-1 py-1"></td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 uppercase">MATERIAL COST</td>
                      <td className="border border-black px-1 py-1"></td>
                      <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(totals.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 uppercase">CUTTING OF SHEETS INTO PARTS</td>
                      <td className="border border-black px-1 py-1"></td>
                      <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(parseFloat(formData.cuttingFee) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 uppercase">TRANSPORTATION</td>
                      <td className="border border-black px-1 py-1"></td>
                      <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(parseFloat(formData.transportationFee) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 uppercase">LABOUR</td>
                      <td className="border border-black px-1 py-1"></td>
                      <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(parseFloat(formData.laborCost) || 0)}</td>
                    </tr>

                    {/* Section Total */}
                    <tr>
                      <td className="border border-black px-1 py-1" colSpan={2}></td>
                      <td className="border border-black px-2 py-1 text-right font-bold uppercase italic">Section total</td>
                      <td className="border border-black px-2 py-1 text-center font-bold text-lg">₱</td>
                      <td className="border border-black px-2 py-1 text-right font-bold text-lg bg-slate-200">
                        {formatCurrency(totals.finalPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Info */}
                <div className="mt-8 space-y-1 text-[13px]">
                  <div className="flex gap-2">
                    <span className="font-bold w-32 uppercase">Prepared By:</span>
                    <span className="font-bold uppercase text-blue-800">{formData.preparedBy}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold w-32 uppercase">Contact:</span>
                    <span className="text-blue-600 italic">{formData.contactInfo}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold w-32 uppercase">Prepared For:</span>
                    <span className="font-bold uppercase">{formData.customerName || '[Customer Name]'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    )}
  </div>

  <style>{`
        /* Fix for html2canvas oklch error - override Tailwind v4 colors with hex */
        #quotation-preview .bg-slate-100 { background-color: #f1f5f9 !important; }
        #quotation-preview .bg-slate-200 { background-color: #e2e8f0 !important; }
        #quotation-preview .bg-slate-50 { background-color: #f8fafc !important; }
        #quotation-preview .text-blue-800 { color: #1e40af !important; }
        #quotation-preview .text-blue-600 { color: #2563eb !important; }
        
        #quotation-preview .bg-white { background-color: #ffffff !important; }
        #quotation-preview .text-black { color: #000000 !important; }
        #quotation-preview .border-black { border-color: #000000 !important; }
        
        @media print {
          body * { visibility: hidden; }
          .xl\\:sticky { position: static !important; }
          #quotation-preview, #quotation-preview * { visibility: visible; }
          #quotation-preview {
            position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
