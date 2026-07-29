import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, Landmark, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

function Checkout() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');

  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/29',
    cvv: '123',
    name: ''
  });

  const [upiDetails, setUpiDetails] = useState({
    vpa: ''
  });

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/bills/public/${billId}`);
        setBill(res.data.data);
        if (res.data.data.status === 'paid') {
          setSuccess(true);
        }
      } catch (err) {
        toast.error('Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate Razorpay processing delay (1.5 seconds)
    setTimeout(async () => {
      try {
        const mockTxnId = `TXN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
        await axios.post(`${import.meta.env.VITE_API_URL}/bills/${billId}/complete-payment`, {
          paymentMethod,
          transactionId: mockTxnId
        });
        toast.success('Payment completed successfully!');
        setSuccess(true);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Payment processing failed.');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Opening secure checkout portal...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-100">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Invalid Invoice Link</h2>
          <p className="text-slate-500 text-sm mt-1">This payment transaction has expired or the invoice ID is invalid.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md text-center border border-slate-150 animate-scale-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Payment Successful!</h2>
          <p className="text-slate-500 text-sm mt-2">
            The transaction for <strong>{bill.title}</strong> of amount <strong>₹{bill.amount.toLocaleString()}</strong> has been completed.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 my-6 text-xs text-slate-600 text-left space-y-1.5">
            <p><strong>Paid By:</strong> {bill.resident?.name || 'Resident'}</p>
            <p><strong>Flat:</strong> {bill.flat?.flatNumber} - Block {bill.flat?.block}</p>
            <p><strong>Transaction Ref:</strong> {bill.transactionId || 'MOCK-TXN-SUCCESS'}</p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
          >
            Access My Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
        
        {/* Invoice Summary Pane */}
        <div className="bg-[#1e3a8a] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Landmark size={18} className="text-blue-200" />
              </div>
              <span className="font-bold text-sm tracking-widest text-blue-200 uppercase">SMS Portal Checkout</span>
            </div>

            <div className="pt-8">
              <span className="text-xs font-semibold uppercase text-blue-300 tracking-wider">Amount Payable</span>
              <h1 className="text-4xl font-black mt-1">₹{bill.amount.toLocaleString()}</h1>
              <p className="text-blue-200/60 text-xs mt-2">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4 text-sm">
              <div>
                <p className="text-blue-300/60 text-xs font-semibold">INVOICE TITLE</p>
                <p className="font-semibold text-white mt-0.5">{bill.title}</p>
              </div>
              <div>
                <p className="text-blue-300/60 text-xs font-semibold">RESIDENT DETAILS</p>
                <p className="font-semibold text-white mt-0.5">{bill.resident?.name}</p>
                <p className="text-blue-200/60 text-xs mt-0.5">Flat {bill.flat?.flatNumber} - Block {bill.flat?.block}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-12 flex items-center gap-2 text-xs text-blue-300/80 font-medium">
            <ShieldCheck size={16} /> Secure Payment Processing via Razorpay Core Simulator
          </div>
        </div>

        {/* Payment Checkout Pane */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-xl font-black text-slate-800">Secure Payment Gateway</h2>
          <p className="text-slate-500 text-xs mt-1">Choose a simulated payment option below to finalize payment.</p>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3 my-6">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                paymentMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Sparkles size={16} /> UPI / VPA
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <CreditCard size={16} /> Credit / Debit Card
            </button>
          </div>

          {/* Forms */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {paymentMethod === 'upi' ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UPI ID / VPA Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. resident@ybl"
                    value={upiDetails.vpa}
                    onChange={(e) => setUpiDetails({ vpa: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
                  />
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2.5">
                  <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    This UPI request simulates the instant validation webhook. Enter any mock VPA format to continue.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Resident Name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4111 2222 3333 4444"
                    value={cardDetails.number}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="12/29"
                      value={cardDetails.expiry}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CVV Code</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardDetails.cvv}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying Transaction...
                </>
              ) : (
                <>
                  Simulate Payment Gateway
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
