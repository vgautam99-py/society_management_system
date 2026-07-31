import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  BellRing, 
  CreditCard,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Briefcase
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* Navigation */}
      <nav className="flex flex-col min-[550px]:flex-row items-center justify-between gap-4 px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 justify-center">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Society Management</span>
        </div>
        <div className="flex items-center gap-6 justify-center">
          <a href="#features" className="hidden min-[550px]:inline-block text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hidden min-[550px]:inline-block text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">How It Works</a>
          <Link to="/login" className="hidden min-[550px]:flex bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/20 items-center gap-2">
            Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

   
      <main className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          The ultimate tool for modern societies
        </div>
        <h1 className="text-4xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-tight">
          Manage your society <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">
            intelligently.
          </span>
        </h1>
        <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          A comprehensive suite of tools designed to streamline residential management, enhance security, and foster community engagement.
        </p>
        <div className="flex justify-center items-center gap-4">
          <Link to="/login" className="w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md shadow-slate-900/10 hover:shadow-lg flex items-center justify-center gap-2">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

  
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Tools at Your Fingertips</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Everything you need to run a modern residential complex efficiently and securely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary-400 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Resident Management</h3>
              <p className="text-slate-500 leading-relaxed">Comprehensive directory of residents, vehicle tracking, and automated onboarding processes.</p>
            </div>

          
            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary-400 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Visitor & Security</h3>
              <p className="text-slate-500 leading-relaxed">Pre-approve visitors, track deliveries, and manage staff entry with robust security protocols.</p>
            </div>

        
            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary-400 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Hub</h3>
              <p className="text-slate-500 leading-relaxed">Automated maintenance billing, transparent accounting, and integrated payment gateways.</p>
            </div>

          
            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary-400 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Complaint Resolution</h3>
              <p className="text-slate-500 leading-relaxed">Streamlined ticketing system for facility issues, with SLA tracking and status updates.</p>
            </div>

          
            <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary-400 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 group text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BellRing className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Digital Noticeboard</h3>
              <p className="text-slate-500 leading-relaxed">Instant broadcasting of important announcements, meeting minutes, and event invites.</p>
            </div>

            {/* Tool 6 */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary-600 to-teal-700 text-white shadow-xl shadow-primary-600/20 transform hover:-translate-y-1 transition-all text-left max-[550px]:text-center max-[550px]:flex max-[550px]:flex-col max-[550px]:items-center">
              <h3 className="text-2xl font-bold mb-4 mt-2">Ready to transform your society?</h3>
              <p className="text-primary-100 mb-8">Join hundreds of modern communities optimizing their daily operations.</p>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors justify-center">
                Get a Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pricing Plans Tailored for Your Society</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-semibold">Simple, transparent pricing. Get started with our one-month free trial today.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan 1: Free Trial */}
            <div className="bg-white border border-slate-200/65 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-primary-400 transition-all duration-300 group shadow-sm text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Free Trial</h3>
                <p className="text-xs text-slate-400 mb-4">1 Month Free Access</p>
                <div className="text-3xl font-bold text-slate-900 mb-6">₹0 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-500 font-semibold pl-1">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 50 Flats</li>
                  <li className="flex items-center gap-2">✓ Standard Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-slate-900 text-white text-center py-3 rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Plan 2: 3-Monthly */}
            <div className="bg-white border border-slate-200/65 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-primary-400 transition-all duration-300 group shadow-sm text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">3-Monthly</h3>
                <p className="text-xs text-slate-400 mb-4">Billed Quarterly (₹3,600)</p>
                <div className="text-3xl font-bold text-slate-900 mb-6">₹1,200 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-500 font-semibold pl-1">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 150 Flats</li>
                  <li className="flex items-center gap-2">✓ Priority Email Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-primary-600 text-white text-center py-3 rounded-xl font-semibold text-xs hover:bg-primary-700 transition-colors">
                Choose Plan
              </Link>
            </div>

            {/* Plan 3: 6-Monthly */}
            <div className="bg-white border border-slate-200/65 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-primary-400 transition-all duration-300 group shadow-sm text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">6-Monthly</h3>
                <p className="text-xs text-slate-400 mb-4">Billed Semi-Annually (₹5,760)</p>
                <div className="text-3xl font-bold text-slate-900 mb-6">₹960 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-slate-500 font-semibold pl-1">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 300 Flats</li>
                  <li className="flex items-center gap-2">✓ 24/7 Priority Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-primary-600 text-white text-center py-3 rounded-xl font-semibold text-xs hover:bg-primary-700 transition-colors">
                Choose Plan
              </Link>
            </div>

            {/* Plan 4: Yearly */}
            <div className="bg-blue-900 text-white border border-blue-800 p-8 rounded-3xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group relative overflow-hidden text-left max-[550px]:pl-10 max-[550px]:pr-6">
              <div className="absolute top-0 right-0 bg-teal-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Best Value</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Yearly Plan</h3>
                <p className="text-xs text-blue-200 mb-4">Billed Annually (₹9,600)</p>
                <div className="text-3xl font-bold text-white mb-6">₹800 <span className="text-xs text-blue-300 font-normal">/ month</span></div>
                <ul className="space-y-3 text-xs text-blue-100 font-semibold pl-1">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Unlimited Flats</li>
                  <li className="flex items-center gap-2">✓ Dedicated Account Manager</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-white text-blue-900 text-center py-3 rounded-xl font-semibold text-xs hover:bg-blue-50 transition-colors">
                Choose Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 max-[550px]:items-center max-[550px]:text-center">
            <div className="max-w-2xl max-[550px]:flex max-[550px]:flex-col max-[550px]:items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-primary-400 text-sm font-medium mb-6 justify-center">
                <TrendingUp className="w-4 h-4" />
                Simple & Effective
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 text-lg">A seamless experience for both society administrators and residents.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center relative">
              <div className="w-16 h-16 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Register Your Society</h3>
              <p className="text-slate-400 leading-relaxed">Admins create the society profile and configure settings like flats, blocks, and amenities.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center relative">
              <div className="w-16 h-16 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Onboard Residents</h3>
              <p className="text-slate-400 leading-relaxed">Residents receive invites, download the app, and verify their identity securely.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center relative">
              <div className="w-16 h-16 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Live Peacefully</h3>
              <p className="text-slate-400 leading-relaxed">Pay dues, raise complaints, and stay updated with notices right from your phone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary-500" />
          <span className="text-lg font-bold text-white tracking-tight">Society Management</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Society Management Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
