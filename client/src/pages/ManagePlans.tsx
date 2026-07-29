import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ShieldCheck, Zap, Calendar, Award, Sparkles, CheckCircle } from 'lucide-react';
import { Badge, Button, Spinner } from '../component/ui';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  billingText: string;
  features: string[];
  isPopular?: boolean;
}

const PRICING_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    durationMonths: 1,
    billingText: '1 Month Free Access',
    features: [
      'Full Feature Access',
      'Up to 50 Flats Management',
      'Standard Email Support',
      'Community Notice Board',
      'Basic Billing System',
    ],
  },
  {
    id: '3-monthly',
    name: '3-Monthly',
    price: 1200,
    durationMonths: 3,
    billingText: 'Billed Quarterly (₹3,600)',
    features: [
      'Full Feature Access',
      'Up to 150 Flats Management',
      'Priority Email Support',
      'Automated Billing Invoices',
      'Staff Attendance Portal',
    ],
  },
  {
    id: '6-monthly',
    name: '6-Monthly',
    price: 960,
    durationMonths: 6,
    billingText: 'Billed Semi-Annually (₹5,760)',
    features: [
      'Full Feature Access',
      'Up to 300 Flats Management',
      '24/7 Priority Support',
      'Automated Billing Invoices',
      'Staff Attendance Portal',
      'Real-time Socket Notifications',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 800,
    durationMonths: 12,
    billingText: 'Billed Annually (₹9,600)',
    features: [
      'Full Feature Access',
      'Unlimited Flats Management',
      'Dedicated Account Manager',
      'Automated Billing Invoices',
      'Staff Attendance Portal',
      'Real-time Socket Notifications',
      'Custom Society Banner & Brand colors',
    ],
    isPopular: true,
  },
];

const ManagePlans = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const fetchProfileDetails = async () => {
    try {
      const userId = Cookies.get('id');
      if (!userId) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        withCredentials: true,
      });
      setProfileData(res.data.data);
    } catch (err) {
      toast.error('Failed to load active plan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    try {
      setUpdatingPlan(plan.id);

      // 1. If it's a Free Trial plan, bypass Razorpay checkout directly
      if (plan.price === 0) {
        const planStartDate = new Date();
        const planEndDate = new Date();
        planEndDate.setDate(planEndDate.getDate() + plan.durationMonths * 30);

        const res = await axios.patch(
          `${import.meta.env.VITE_API_URL}/profile`,
          {
            planName: plan.name,
            planStartDate,
            planEndDate,
          },
          { withCredentials: true }
        );

        toast.success(`Plan upgraded to "${plan.name}" successfully!`);
        setProfileData(res.data.data);
        return;
      }

      // 2. If it's a paid plan, initialize Razorpay checkout flow
      // Create backend payment order
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        { planName: plan.name },
        { withCredentials: true }
      );

      const orderData = orderResponse.data;

      // Launch Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TFNC4bWHR8oOTF',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SMS Portal',
        description: `${plan.name} Subscription Upgrade`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setUpdatingPlan(plan.id);
            // Verify payment signature on backend and apply upgrade
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: plan.name,
              },
              { withCredentials: true }
            );

            toast.success(`Subscription plan upgraded to "${plan.name}" successfully!`);
            setProfileData(verifyResponse.data.data);
          } catch (verifyErr: any) {
            toast.error(verifyErr.response?.data?.message || 'Payment signature verification failed.');
          } finally {
            setUpdatingPlan(null);
          }
        },
        prefill: {
          name: profileData?.name || '',
          email: profileData?.email || '',
          contact: profileData?.phone || '',
        },
        theme: {
          color: '#1e3a8a', // Matching primary blue branding sidebar color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize subscription upgrade.');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentPlanName = profileData?.planName || 'Free Trial';
  const isExpired = profileData?.planEndDate && new Date(profileData.planEndDate).getTime() < Date.now();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-blue-600" size={24} />
            Subscription & Pricing Plans
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Select or upgrade your society management subscription plan to gain unlimited community building access.
          </p>
        </div>
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award size={120} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-teal-400" size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Current Plan Registry</span>
          </div>
          <h2 className="text-3xl font-extrabold">{currentPlanName}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-blue-100 font-semibold">
            <span className="flex items-center gap-1"><Calendar size={14} /> Active Since: {profileData?.planStartDate ? new Date(profileData.planStartDate).toLocaleDateString() : new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> Expires On: {profileData?.planEndDate ? new Date(profileData.planEndDate).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span className="text-xs text-blue-200 font-medium">Subscription Status</span>
          <Badge 
            variant={isExpired ? 'danger' : 'success'} 
            className="font-bold text-xs uppercase px-3 py-1 shadow-md"
          >
            {isExpired ? 'Expired' : 'Active & Running'}
          </Badge>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = currentPlanName?.toLowerCase() === plan.name?.toLowerCase();
          
          return (
            <div 
              key={plan.id} 
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
                isCurrent 
                  ? 'border-blue-600 ring-2 ring-blue-500/10' 
                  : plan.isPopular 
                    ? 'border-indigo-200' 
                    : 'border-slate-200'
              }`}
            >
              {plan.isPopular && !isCurrent && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle size={10} /> Active
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.billingText}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                  <span className="text-3xl font-extrabold text-slate-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-500 font-semibold pt-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                      <span className="text-blue-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <button 
                    disabled 
                    className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-xs border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Active Plan
                  </button>
                ) : (
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    isLoading={updatingPlan === plan.id}
                    className={`w-full py-3 rounded-xl font-bold text-xs ${
                      plan.isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Activate Plan
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagePlans;
