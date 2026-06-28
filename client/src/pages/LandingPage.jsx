import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Bell, 
  LayoutDashboard, 
  QrCode, 
  Package, 
  Star, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Award,
  Download
} from 'lucide-react';
import Button from '../components/common/Button';
import heroImg from '../assets/hero.jpg';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Monitor scroll for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackingIdInput.trim())}`);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I track my parcel?",
      answer: "Simply enter your unique Tracking ID (e.g., TRK-xxxxxxxx-xxxx) in the live tracking search bar at the top of this page or navigate to our tracking portal. You can watch your agent move in real-time once the package is out for delivery."
    },
    {
      question: "How long does delivery take?",
      answer: "Depending on the delivery package chosen, delivery takes between 1-2 days (Express), 3-5 days (Standard), or 5-7 days (Basic)."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, bookings can be cancelled at any time from your customer dashboard as long as the parcel has not been picked up by the delivery agent."
    },
    {
      question: "Is payment secure?",
      answer: "Absolutely. Online payments are processed securely through our Razorpay checkout integration supporting cards, UPI, net banking, and wallets. For Pay on Delivery, customers can scan a dynamic UPI QR code displayed by the agent upon arrival."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-navy selection:bg-brand-blue selection:text-white font-sans scroll-smooth">
      
      {/* 1. STICKY NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 py-4'
      } border-b border-brand-border`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-brand-blue text-white p-1.5 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-brand-navy tracking-wide">TrackShip</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors">Features</a>
            <a href="#workflow" className="text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors">How It Works</a>
            <a href="#pricing" className="text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors">Pricing</a>
            <a href="#track" className="text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors">Track Parcel</a>
          </div>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-brand-blue hover:text-blue-700 transition-all px-4 py-2 bg-transparent border-0 cursor-pointer"
            >
              Login
            </button>
            <Button 
              onClick={() => navigate('/signup')} 
              className="px-5 py-2.5 text-xs font-semibold shadow-sm"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-brand-navy hover:bg-brand-bg rounded-lg border-0 bg-transparent cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-border px-4 py-4 space-y-4 shadow-inner">
            <div className="flex flex-col gap-3.5">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-xs font-semibold text-brand-navy hover:text-brand-blue"
              >
                Features
              </a>
              <a 
                href="#workflow" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-xs font-semibold text-brand-navy hover:text-brand-blue"
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-xs font-semibold text-brand-navy hover:text-brand-blue"
              >
                Pricing
              </a>
              <a 
                href="#track" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-xs font-semibold text-brand-navy hover:text-brand-blue"
              >
                Track Parcel
              </a>
            </div>
            <div className="border-t border-brand-border pt-4 flex gap-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} 
                className="flex-1 py-2 text-xs font-bold text-brand-blue border border-brand-blue rounded-lg bg-transparent cursor-pointer"
              >
                Login
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }} 
                className="flex-1 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-lg border-0 cursor-pointer shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-white via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Info */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue/10 px-3 py-1 rounded-full">
              <Award className="h-3.5 w-3.5" /> Trusted Courier Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-brand-navy leading-tight">
              Ship Smarter. <br />
              <span className="text-brand-blue">Track Faster.</span> <br />
              Deliver Better.
            </h1>
            <p className="text-sm md:text-base text-brand-muted max-w-xl leading-relaxed">
              TrackShip gives you real-time parcel tracking, automated SMS/email alerts, secure payments, and QR-based agent verification—all in one smart logistics interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-brand-blue/20 hover:shadow-lg transition-all cursor-pointer border-0 flex items-center justify-center gap-1"
              >
                Start Shipping <ArrowRight className="h-4 w-4" />
              </button>
              <a 
                href="#track" 
                className="px-6 py-3 bg-white hover:bg-brand-bg text-brand-navy border border-brand-border rounded-lg text-sm font-bold shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                Track Your Parcel
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs font-semibold text-brand-muted">
              <span className="flex items-center gap-1 text-brand-success">✓ Free to sign up</span>
              <span className="flex items-center gap-1 text-brand-success">✓ Instant digital tracking</span>
              <span className="flex items-center gap-1 text-brand-success">✓ QR authenticated delivery</span>
            </div>
          </div>

          {/* Hero Right Image Mock */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-brand-blue/10 rounded-3xl blur-2xl -z-10 translate-x-4 translate-y-4"></div>
              <img 
                src={heroImg} 
                alt="Courier Services Illustration" 
                className="rounded-3xl shadow-xl border border-brand-border w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE TRACK SECTION */}
      <section id="track" className="py-10 bg-brand-blue/5 border-y border-brand-blue/10">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-brand-navy">Track Any Parcel Right Now</h2>
          <p className="text-xs text-brand-muted">No login required — enter your dynamic 15-character Tracking ID below</p>
          
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Enter Tracking ID (e.g. TRK-xxxxxxxxx)" 
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-lg text-sm text-brand-navy bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue shadow-sm font-mono"
                required
              />
              <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-brand-muted" />
            </div>
            <button 
              type="submit" 
              className="px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md cursor-pointer border-0 flex items-center justify-center gap-1.5"
            >
              Track Now
            </button>
          </form>
          <p className="text-[10px] text-brand-muted">
            Example: <span className="font-mono font-bold select-all bg-white px-2 py-0.5 rounded border border-brand-border">TRK-20240615-ABC123</span>
          </p>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block">What We Offer</span>
            <h2 className="text-3xl font-black text-brand-navy">Everything You Need in One Platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all duration-200 group space-y-4">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">QR Code Pickup</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Agents verify and check-in bookings securely by scanning standard parcel barcodes. Zero paperwork, 100% digital verification.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all duration-200 group space-y-4">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Live Location Tracking</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Watch delivery agents move in real-time. Full map visualization powered by Leaflet API integration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all duration-200 group space-y-4">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Automated Alerts</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Receive transactional alerts automatically via Gmail SMTP and Twilio SMS at every milestone—pickup, transit, and delivery.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm hover:shadow-md hover:border-brand-blue/30 transition-all duration-200 group space-y-4">
              <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Multi-Role Dashboards</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Dedicated interfaces for Customers, Agents, and Administrators, tailored to each actor's specific capabilities.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="workflow" className="py-20 bg-brand-bg/50 border-t border-brand-border">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-brand-navy">How TrackShip Works</h2>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">From registration to doorstep delivery in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border space-y-4 shadow-sm relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-md">01</span>
              <div className="bg-brand-blue/5 text-brand-blue p-3 rounded-full w-fit mx-auto mt-2">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Book Your Parcel</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Submit recipient parameters, weights, and pickup locations. Choose online pay or Pay on Delivery to initiate.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border space-y-4 shadow-sm relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-md">02</span>
              <div className="bg-brand-blue/5 text-brand-blue p-3 rounded-full w-fit mx-auto mt-2">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Agent Pick Up</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                A verified delivery agent arrives at the pickup spot, scans the parcel's digital barcode check, and takes custody.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border space-y-4 shadow-sm relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-md">03</span>
              <div className="bg-brand-blue/5 text-brand-blue p-3 rounded-full w-fit mx-auto mt-2">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">Delivered to Door</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Track live as the package moves. Complete payments via scanning UPI QR displays, generating invoices automatically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. STATS SECTION */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-blue">50,000+</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Parcels Delivered</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-blue">1,200+</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verified Agents</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-blue">99.2%</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">On-Time Rate</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-blue">100+</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cities Covered</p>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <h2 className="text-3xl font-black text-brand-navy">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs text-brand-navy italic leading-relaxed">
                "TrackShip made managing my online store deliveries so much easier. The real-time geolocation mapping features are absolute lifesavers!"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Priya+Sharma&background=2563EB&color=fff&size=64" 
                  alt="Priya" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-bold text-xs text-brand-navy">Priya Sharma</h4>
                  <span className="text-[10px] text-brand-muted font-medium">Small Business Owner</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs text-brand-navy italic leading-relaxed">
                "The QR checkout system is brilliant. Our field agents are delighted by the simplicity, and the automatic email receipt generation is flawless."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Rahul+Verma&background=16A34A&color=fff&size=64" 
                  alt="Rahul" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-bold text-xs text-brand-navy">Rahul Verma</h4>
                  <span className="text-[10px] text-brand-muted font-medium">E-commerce Seller</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border text-left shadow-sm space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(4)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                <Star className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-xs text-brand-navy italic leading-relaxed">
                "I could track my parcel live on a map. Extremely smooth experience, and the digital UPI payment QR code at checkout worked flawlessly."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Anita+Singh&background=D97706&color=fff&size=64" 
                  alt="Anita" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-bold text-xs text-brand-navy">Anita Singh</h4>
                  <span className="text-[10px] text-brand-muted font-medium">Regular Shipper</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="py-20 bg-brand-bg/50 border-t border-brand-border">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-brand-navy">Simple, Transparent Pricing</h2>
            <p className="text-xs text-brand-muted">Pay only for what you ship. Zero hidden convenience fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Plan 1 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between text-left shadow-sm space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-brand-navy">Basic Plan</h3>
                  <p className="text-xs text-brand-muted">Standard domestic shipments</p>
                </div>
                <div className="text-3xl font-black text-brand-blue">
                  ₹49 <span className="text-xs font-semibold text-brand-muted">/ parcel</span>
                </div>
                <ul className="space-y-2.5 text-xs text-brand-navy">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Up to 1kg weight limits</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Standard delivery (5–7 days)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Email notification tracking</li>
                  <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-slate-200" /> Live map route tracking</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/signup')} variant="secondary" className="w-full text-xs">Get Started</Button>
            </div>

            {/* Plan 2: Recommended */}
            <div className="bg-white p-6 rounded-xl border-2 border-brand-blue flex flex-col justify-between text-left shadow-md space-y-6 relative scale-105">
              <span className="absolute -top-3 right-6 bg-brand-blue text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Most Popular</span>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-brand-navy">Standard Plan</h3>
                  <p className="text-xs text-brand-muted">Reliable commercial logistics</p>
                </div>
                <div className="text-3xl font-black text-brand-blue">
                  ₹99 <span className="text-xs font-semibold text-brand-muted">/ parcel</span>
                </div>
                <ul className="space-y-2.5 text-xs text-brand-navy">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Up to 5kg weight limits</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Express delivery (3–5 days)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Email + SMS notifications</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> QR pickup authentication</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/signup')} className="w-full text-xs shadow-md">Get Started</Button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white p-6 rounded-xl border border-brand-border flex flex-col justify-between text-left shadow-sm space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-brand-navy">Express Plan</h3>
                  <p className="text-xs text-brand-muted">Same-day priority delivery</p>
                </div>
                <div className="text-3xl font-black text-brand-blue">
                  ₹199 <span className="text-xs font-semibold text-brand-muted">/ parcel</span>
                </div>
                <ul className="space-y-2.5 text-xs text-brand-navy">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Up to 20kg weight limits</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Next-day priority shipping</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Live GPS map route updates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-success" /> Fully insured coverage</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/signup')} variant="secondary" className="w-full text-xs">Get Started</Button>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-brand-navy">Frequently Asked Questions</h2>
            <p className="text-xs text-brand-muted">Find answers to commonly asked questions about logistics bookings</p>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-brand-border rounded-lg bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 font-semibold text-xs md:text-sm text-brand-navy text-left bg-transparent border-0 cursor-pointer focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {activeFaq === index ? <ChevronUp className="h-4 w-4 text-brand-blue" /> : <ChevronDown className="h-4 w-4 text-brand-blue" />}
                </button>
                {activeFaq === index && (
                  <div className="px-4 pb-4 text-xs text-brand-muted leading-relaxed border-t border-brand-bg pt-2.5 bg-brand-bg/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA BANNER SECTION */}
      <section className="py-16 bg-gradient-to-r from-brand-blue to-blue-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Ready to Ship Your First Parcel?</h2>
          <p className="text-xs md:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
            Join thousands of individuals and small businesses who trust TrackShip to manage their logistics securely.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button 
              onClick={() => navigate('/signup')} 
              className="px-6 py-3 bg-white hover:bg-slate-100 text-brand-blue font-bold rounded-lg text-sm transition-all shadow-md cursor-pointer border-0"
            >
              Create Free Account
            </button>
            <a 
              href="mailto:support@trackship.com"
              className="px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-white rounded-lg text-sm font-bold transition-all text-center flex items-center justify-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-brand-navy text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Footer Logo & Brand info */}
          <div className="md:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="bg-brand-blue text-white p-1 rounded-md">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-wide">TrackShip</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Reliable, secure, and smart courier management solutions for modern merchants and logistics agencies.
            </p>
          </div>

          {/* Footer Columns Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-300">Product</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-300">Company</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><a href="#workflow" className="hover:text-white transition-colors">About Us</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Logistics Partners</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-widest text-slate-300">Support</h4>
              <ul className="space-y-2 list-none p-0 m-0">
                <li><a href="#track" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:support@trackship.com" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy & Terms</span></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
          <p>© 2026 TrackShip. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
            <span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
