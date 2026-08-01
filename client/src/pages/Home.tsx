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
  Mail,
  Phone,
  MapPin,
  Lock
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-600 selection:text-white relative overflow-hidden">
      
      {/* Decorative gradient glow elements */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-0 w-[40rem] h-[40rem] bg-sky-100/30 rounded-full blur-3xl -z-10"></div>

      {/* Navigation Header */}
      <nav className="flex flex-col min-[550px]:flex-row items-center justify-between gap-4 px-6 md:px-12 py-6 max-w-7xl mx-auto border-b border-slate-200/50">
        <div className="flex items-center gap-3 justify-center cursor-pointer">
          <img src="/favicon.png" alt="TROPICS Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
          <span className="text-xl font-black tracking-tight text-slate-900 uppercase">TROPICS</span>
        </div>
        
        <div className="flex items-center gap-8 justify-center">
          <a href="#features" className="hidden min-[550px]:inline-block text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors">Features</a>
          <a href="#pricing" className="hidden min-[550px]:inline-block text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors">Pricing</a>
          <a href="#how-it-works" className="hidden min-[550px]:inline-block text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary-600 transition-colors">How It Works</a>
          <Link to="/login" className="flex bg-brand-gradient hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md items-center gap-2 hover:-translate-y-0.5">
            Login <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 md:px-12 pt-24 pb-28 max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          Introducing TROPICS Society Platform
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black text-slate-950 tracking-tighter mb-8 leading-[1.05]">
          Simplify Residential Living <br />
          <span className="text-brand-gradient block mt-1.5">
            Smart Living, Simplified.
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          A premium, responsive community hub for smart residential complexes. Coordinate billing statements, monitor gatekeeper logs, and post notice bulletins on a unified dashboard.
        </p>
        
        <div className="flex justify-center items-center gap-4">
          <Link to="/login" className="bg-brand-gradient hover:opacity-95 text-white px-8 py-4 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 hover:-translate-y-1">
            Get Started Now <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </main>

      {/* Features Showcase Section */}
      <section id="features" className="py-24 border-y border-slate-200/50 bg-[#fafafa] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Premium Features</h2>
            <div className="w-12 h-1 bg-brand-gradient mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-sm mt-4 font-medium">Everything needed to maintain oversight and manage housing functions seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-300 group text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Member Profiles</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Coordinate residents database logs, verify flat ownership, and manage staff operations instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-300 group text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visitor Checks</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Track guest entry logs, approve delivery entries, and secure parking assignments in real-time.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-300 group text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Billing Statements</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Issue quarterly invoices, track utility payments, and process checkout payments securely.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-300 group text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Complaints Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Residents file complaints online with photo attachments, tracking priority levels and status updates.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-500 hover:shadow-md transition-all duration-300 group text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <BellRing className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Announcements Board</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Post instant bulletins, distribute notice boards, and send high priority warnings to residents.</p>
            </div>

            {/* Feature 6 / CTA Card */}
            <div className="p-8 rounded-3xl bg-brand-gradient text-white shadow-lg flex flex-col justify-between text-left hover:scale-[1.02] transition-transform">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to transform your society?</h3>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed">Experience the ease of optimized security, organized bookkeeping, and simplified dashboards.</p>
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors w-full mt-6 justify-center shadow-md">
                Enter Portal <ArrowRight className="w-4 h-4 text-slate-900" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Plans Section with brand gradient accents */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Pricing Plans</h2>
            <div className="w-12 h-1 bg-brand-gradient mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-sm mt-4 font-medium">Select a subscription option to register your community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Plan 1: Free Trial */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-indigo-500 transition-all duration-300 shadow-sm text-left relative">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Free Trial</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">1 Month Free Access</p>
                <div className="text-3xl font-black text-slate-950 mb-6">₹0 <span className="text-xs text-slate-500 font-medium">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 50 Flats</li>
                  <li className="flex items-center gap-2">✓ Standard Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-slate-50 border border-slate-200 text-slate-800 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                Get Started
              </Link>
            </div>

            {/* Plan 2: Quarterly */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-indigo-500 transition-all duration-300 shadow-sm text-left relative">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Quarterly</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Billed Quarterly (₹3,600)</p>
                <div className="text-3xl font-black text-slate-950 mb-6">₹1,200 <span className="text-xs text-slate-500 font-medium">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 150 Flats</li>
                  <li className="flex items-center gap-2">✓ Priority Email Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-slate-50 border border-slate-200 text-slate-800 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                Choose Plan
              </Link>
            </div>

            {/* Plan 3: Half-Yearly */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl hover:border-indigo-500 transition-all duration-300 shadow-sm text-left relative">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Half-Yearly</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Billed Semiannually (₹5,760)</p>
                <div className="text-3xl font-black text-slate-950 mb-6">₹960 <span className="text-xs text-slate-500 font-medium">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Up to 300 Flats</li>
                  <li className="flex items-center gap-2">✓ 24/7 Priority Support</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-slate-50 border border-slate-200 text-slate-800 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                Choose Plan
              </Link>
            </div>

            {/* Plan 4: Yearly (Premium Gradient Card) */}
            <div className="bg-brand-gradient text-white border border-transparent p-8 rounded-3xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 right-0 bg-white text-slate-900 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">Best Value</div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Yearly Plan</h3>
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mb-6">Billed Annually (₹9,600)</p>
                <div className="text-3xl font-black text-white mb-6">₹800 <span className="text-xs text-indigo-200 font-medium">/ month</span></div>
                <ul className="space-y-3.5 text-xs text-indigo-100 font-medium border-t border-indigo-400/30 pt-6">
                  <li className="flex items-center gap-2">✓ Full Feature Access</li>
                  <li className="flex items-center gap-2">✓ Unlimited Flats</li>
                  <li className="flex items-center gap-2">✓ Dedicated Manager</li>
                </ul>
              </div>
              <Link to="/login" className="w-full mt-8 bg-white text-slate-900 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 transition-all cursor-pointer shadow">
                Choose Plan
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#fafafa] border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">How It Works</h2>
            <div className="w-12 h-1 bg-brand-gradient mx-auto mt-3 rounded-full"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-sm mt-4 font-medium">Streamlined workflows for both society administrators and residential members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative group hover:border-indigo-500 transition-colors">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-extrabold">1</div>
              <h3 className="text-base font-extrabold text-slate-950 mb-2">Register Society</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Admins set up the portal profile, specify blocks, flats, and add block settings.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative group hover:border-indigo-500 transition-colors">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-extrabold">2</div>
              <h3 className="text-base font-extrabold text-slate-950 mb-2">Onboard Members</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Admin creates login credentials for staff or residents to log in securely.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative group hover:border-indigo-500 transition-colors">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-sm font-extrabold">3</div>
              <h3 className="text-base font-extrabold text-slate-950 mb-2">Run Operations</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Broadcast notices, track visitor entry-exit status, process maintenance billing statements, and check statistics.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="TROPICS Logo" className="w-7 h-7 rounded-lg object-cover" />
              <span className="text-sm font-extrabold text-white tracking-tight uppercase">TROPICS</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium max-w-xs">
              Optimizing housing society bookkeeping, security controls, and residential administration through state of the art responsive architecture.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500">
              <li><a href="#features" className="hover:text-white transition-colors">Features List</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Subscription Options</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflows</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SLA Agreement</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Contact Support</h4>
            <ul className="space-y-2.5 text-[11px] font-semibold text-slate-500">
              <li className="flex items-center gap-2"><Mail size={12} /> support@tropics.com</li>
              <li className="flex items-center gap-2"><Phone size={12} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={12} /> New Delhi, India</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span>© {new Date().getFullYear()} TROPICS Society Platform. Secure responsive management system.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Security status</a>
            <span>•</span>
            <a href="#" className="hover:text-white">API access</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
