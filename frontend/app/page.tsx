import Link from "next/link";
import { ArrowRight, Globe, BrainCircuit, Activity, ShieldCheck, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* NAVBAR */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              AI FutureTwin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-sm text-slate-400 hover:text-white transition-colors">
              GitHub
            </a>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm font-medium mb-8">
          <ShieldCheck className="w-4 h-4" /> Built for National Level Hackathon 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Predict the Future.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400">
            Before You Build It.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Governments spend billions on guesswork. AI FutureTwin uses Agentic AI and Real-World RAG Data to simulate the socio-economic impact of urban policies on a living, 3D digital society.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/dashboard" 
            className="group bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Launch Simulation Engine 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#how-it-works"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-8 py-4 rounded-xl font-medium border border-slate-800 transition-colors"
          >
            How it works
          </a>
        </div>

        {/* HERO IMAGE PLACEHOLDER / DECORATION */}
        <div className="mt-20 w-full max-w-4xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          <div className="w-full h-64 md:h-96 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center">
            {/* A cool glowing grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
            <Activity className="w-20 h-20 text-slate-800" />
            <div className="absolute bottom-4 left-4 text-slate-500 text-sm font-mono">System // Online</div>
          </div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">How AI FutureTwin Works</h2>
          <p className="text-slate-400">A complete pipeline from natural language to mathematical prediction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. RAG + Policy Translation</h3>
            <p className="text-slate-400 leading-relaxed">
              We pull real 2026 city datasets. Our LLM Agent reads your natural language policy and mathematically calculates modifiers based on reality, not assumptions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. Agentic Spatial Modeling</h3>
            <p className="text-slate-400 leading-relaxed">
              We deploy thousands of autonomous AI citizens onto a 3D MapLibre grid. Watch them react, move, and change behaviors in real-time via WebSockets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Automated AI Reporting</h3>
            <p className="text-slate-400 leading-relaxed">
              No need to stare at raw data. When the simulation ends, our Data Analyst Agent automatically writes an executive PDF summary of the economic and environmental impacts.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-8 text-center text-slate-500 text-sm">
        Built with Next.js, FastAPI, CrewAI, and MapLibre for Hackathon 2026.
      </footer>
    </div>
  );
}