import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  Wallet, 
  X, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

export const DemoPaymentGateway = ({ isOpen, amount, bookingId, onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0); // 0: input, 1: auth, 2: verify, 3: receipt, 4: success

  // Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Format CVV
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) setCardCvv(value);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setStep(1);
  };

  // Simulated Stepped Payment Pipeline
  useEffect(() => {
    if (!processing) return;

    const timer1 = setTimeout(() => setStep(2), 1500); // 1.5s -> stage 2
    const timer2 = setTimeout(() => setStep(3), 3000); // 3.0s -> stage 3
    const timer3 = setTimeout(() => setStep(4), 4000); // 4.0s -> stage 4 (success)
    
    const timer4 = setTimeout(() => {
      setProcessing(false);
      // Callback with mock transaction ID
      const mockPayId = 'pay_demo_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      onSuccess({
        razorpay_payment_id: mockPayId,
        razorpay_order_id: 'order_demo_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        razorpay_signature: 'sig_demo_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }, 5200); // 5.2s total close

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [processing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-border overflow-hidden flex flex-col md:flex-row min-h-[420px]">
        
        {/* CLOSE BUTTON */}
        {!processing && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded-full text-brand-navy hover:bg-brand-bg transition-colors border-0 bg-transparent cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* PROCESSING LOADER OVERLAY */}
        {processing && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in">
            {step < 4 ? (
              <Loader2 className="h-16 w-16 text-brand-blue animate-spin" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-brand-success animate-bounce scale-110" />
            )}

            <div className="space-y-1.5">
              {step === 1 && (
                <>
                  <h3 className="text-base font-bold text-brand-navy">Authorizing Payment...</h3>
                  <p className="text-xs text-brand-muted">Connecting securely to the digital gateway nodes.</p>
                </>
              )}
              {step === 2 && (
                <>
                  <h3 className="text-base font-bold text-brand-navy">Verifying with Bank...</h3>
                  <p className="text-xs text-brand-muted">Validating payment authentication parameters.</p>
                </>
              )}
              {step === 3 && (
                <>
                  <h3 className="text-base font-bold text-brand-navy">Generating Tax Receipt...</h3>
                  <p className="text-xs text-brand-muted">Signing cryptographic invoice parameters.</p>
                </>
              )}
              {step === 4 && (
                <>
                  <h3 className="text-base font-bold text-brand-success">Payment Successful!</h3>
                  <p className="text-xs text-brand-muted">Updating order logs. Redirecting to receipt dashboard...</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-brand-muted bg-brand-bg px-3 py-1.5 rounded-full border border-brand-border">
              <Lock className="h-3 w-3" /> 256-bit Secure Gateway SSL
            </div>
          </div>
        )}

        {/* SIDE MENU - TAB SWITCHES */}
        <div className="w-full md:w-2/5 bg-slate-900 text-slate-400 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div className="space-y-6 text-left">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Merchant Payee</span>
              <h3 className="text-sm font-bold text-white">TrackShip Pvt Ltd</h3>
              <p className="text-[10px] text-slate-500 font-mono">Ref: {bookingId?.substring(0, 10)}...</p>
            </div>

            <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border-0 text-left cursor-pointer transition-all shrink-0 ${
                  activeTab === 'card' ? 'bg-brand-blue text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
              <button
                onClick={() => setActiveTab('upi')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border-0 text-left cursor-pointer transition-all shrink-0 ${
                  activeTab === 'upi' ? 'bg-brand-blue text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-4 w-4" /> UPI
              </button>
              <button
                onClick={() => setActiveTab('netbank')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border-0 text-left cursor-pointer transition-all shrink-0 ${
                  activeTab === 'netbank' ? 'bg-brand-blue text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" /> Net Banking
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border-0 text-left cursor-pointer transition-all shrink-0 ${
                  activeTab === 'wallet' ? 'bg-brand-blue text-white shadow' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="h-4 w-4" /> Wallets
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[9px] text-slate-500 pt-6">
            <Lock className="h-3 w-3" /> Secure Sandbox Payment
          </div>
        </div>

        {/* DETAILS FORMS CONTAINER */}
        <div className="flex-1 p-6 flex flex-col justify-between text-left">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-brand-muted mb-4">Payment Details</h4>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              
              {/* TAB 1: CARD PAYMENT */}
              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-navy">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4321 8765 2341 9087"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="px-3 py-2 border border-brand-border rounded-lg text-xs font-mono text-brand-navy bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-navy">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="px-3 py-2 border border-brand-border rounded-lg text-xs font-mono text-brand-navy bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue text-center"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-navy">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="px-3 py-2 border border-brand-border rounded-lg text-xs font-mono text-brand-navy bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue text-center"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-navy">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="px-3 py-2 border border-brand-border rounded-lg text-xs text-brand-navy bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: UPI PAYMENT */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setUpiId('customer@gpay')} 
                      className={`p-2 border rounded-lg text-left text-xs font-bold transition-all bg-white cursor-pointer ${
                        upiId === 'customer@gpay' ? 'border-brand-blue text-brand-blue bg-blue-50/20' : 'border-brand-border text-brand-navy hover:bg-brand-bg'
                      }`}
                    >
                      Google Pay
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUpiId('customer@ybl')} 
                      className={`p-2 border rounded-lg text-left text-xs font-bold transition-all bg-white cursor-pointer ${
                        upiId === 'customer@ybl' ? 'border-brand-blue text-brand-blue bg-blue-50/20' : 'border-brand-border text-brand-navy hover:bg-brand-bg'
                      }`}
                    >
                      PhonePe
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-navy">Enter UPI VPA / ID</label>
                    <input 
                      type="text" 
                      placeholder="username@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="px-3 py-2 border border-brand-border rounded-lg text-xs font-mono text-brand-navy bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbank' && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-brand-navy block">Select Popular Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'AXIS'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 border rounded-lg text-xs font-bold transition-all bg-white text-center cursor-pointer ${
                          selectedBank === bank ? 'border-brand-blue text-brand-blue bg-blue-50/20 shadow-sm' : 'border-brand-border text-brand-navy hover:bg-brand-bg'
                        }`}
                      >
                        {bank} Bank
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: WALLETS */}
              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-brand-navy block">Select Wallet Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-2.5 border rounded-lg text-xs font-bold transition-all bg-white text-center cursor-pointer ${
                          selectedWallet === wallet ? 'border-brand-blue text-brand-blue bg-blue-50/20 shadow-sm' : 'border-brand-border text-brand-navy hover:bg-brand-bg'
                        }`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PAY CTA BUTTON */}
              <div className="pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  disabled={
                    (activeTab === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) ||
                    (activeTab === 'upi' && !upiId) ||
                    (activeTab === 'netbank' && !selectedBank) ||
                    (activeTab === 'wallet' && !selectedWallet)
                  }
                  className="w-full py-2.5 bg-brand-blue hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs cursor-pointer border-0 shadow-md shadow-brand-blue/20 hover:shadow-lg transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" /> Pay ₹{amount} Securely
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DemoPaymentGateway;
