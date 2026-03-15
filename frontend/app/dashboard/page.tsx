"use client";

import { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Play,
  Activity,
  Wind,
  BrainCircuit,
  MapPin,
  FileText,
  Download,
  ShieldCheck,
} from "lucide-react";

import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";

const INITIAL_VIEW_STATE = {
  longitude: 85.8245,
  latitude: 20.2961,
  zoom: 14,
  pitch: 45,
  bearing: 0,
};

export default function Dashboard() {
  const [policy, setPolicy] = useState("");
  const [status, setStatus] = useState("idle");
  const [aiParams, setAiParams] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [currentTweet, setCurrentTweet] = useState<string>("");
  const feedRef = useRef<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "ws://127.0.0.1:8000";
  const startSimulation = () => {
    if (!policy.trim()) return;

    setChartData([]);
    setAgents([]);
    setAiParams(null);
    setStatus("processing");
    setCurrentTweet(""); // Reset tweet on new run

    const ws = new WebSocket(`${backendUrl}/ws/simulate`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ policy_text: policy }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "processing") {
        setStatus("processing");
      } else if (data.status === "ai_complete") {
        setAiParams(data.ai_parameters);
        if (data.tweets) {
            feedRef.current = data.tweets;
        }
      } else if (data.status === "running") {
        setStatus("running");
        
        setChartData((prev) => [
          ...prev,
          {
            step: data.step,
            pollution: data.metrics.pollution_index,
            traffic: data.metrics.traffic_density,
            economy: data.metrics.city_revenue,
          },
        ]);

        if (data.agent_updates) {
          setAgents(data.agent_updates);
        }

        if (data.step === 5 && feedRef.current[0]) setCurrentTweet(`📝 ${feedRef.current[0]}`);
        if (data.step === 30 && feedRef.current[1]) setCurrentTweet(`🚕 ${feedRef.current[1]}`);
        if (data.step === 55 && feedRef.current[2]) setCurrentTweet(`👩‍🎓 ${feedRef.current[2]}`);
        if (data.step === 80 && feedRef.current[3]) setCurrentTweet(`📉 ${feedRef.current[3]}`);
        
      } else if (data.status === "completed") {
        setStatus("completed");
        setReport(data.report);
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setStatus("idle");
    };
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const layers = [
    new ScatterplotLayer({
      id: "live-agents",
      data: agents,
      getPosition: (d: any) => d.coords,
      getFillColor: (d: any) =>
        d.status === "moving" ? [52, 211, 153, 200] : [244, 63, 94, 200],
      getRadius: 15,
      radiusUnits: "meters",
      radiusMinPixels: 4,
      radiusMaxPixels: 12,
      transitions: {
        getPosition: 100,
      },
    }),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
            AI FutureTwin
          </h1>
          <p className="text-slate-400 mt-1">
            Multi-Agent World Simulation Engine
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              RAG Grounded: Bhubaneswar '26 Dataset
            </span>
          </div>
          
          {status === "running" && currentTweet && (
            <div className="mb-6 bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-4 shadow-lg animate-fade-in">
              <div className="bg-blue-500/20 px-3 py-1 rounded-md">
                <span className="text-blue-400 font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" /> Live Citizen Feed
                </span>
              </div>
              <p className="text-slate-200 italic font-medium">
                "{currentTweet}"
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <div
              className={`w-3 h-3 rounded-full ${status === "running" ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}
            ></div>
            <span className="text-sm text-slate-300 capitalize">
              System: {status}
            </span>
          </div>
        </div>
      </header>

      {/* CONTROL PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl z-10 relative">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Input New City Policy (Year 2026)
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g., Make all public transport free and ban diesel vehicles..."
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            disabled={status === "processing" || status === "running"}
          />
          <button
            onClick={startSimulation}
            disabled={
              status === "processing" || status === "running" || !policy.trim()
            }
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "processing" ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Run Simulation
          </button>
        </div>

        {/* ⚠️ FIX: Quick Start Chips placed correctly below the input box */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-slate-500 mr-2 flex items-center">Try these:</span>
          {[
            "Make all public transport free and ban diesel vehicles",
            "Provide 50% subsidy on Electric Vehicles by 2030",
            "Implement a 4-day work week to reduce traffic",
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setPolicy(suggestion)}
              disabled={status === "processing" || status === "running"}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* AI REASONING OUTPUT */}
        {aiParams && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h3 className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
              <BrainCircuit className="w-4 h-4" /> Gemini AI Policy Translation Complete
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
                <span className="text-slate-500 block mb-1">Traffic Impact</span>
                <span className="font-mono text-blue-400">{aiParams.traffic_impact}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
                <span className="text-slate-500 block mb-1">Pollution Impact</span>
                <span className="font-mono text-emerald-400">{aiParams.pollution_impact}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
                <span className="text-slate-500 block mb-1">Economy Impact</span>
                <span className="font-mono text-rose-400">{aiParams.economic_impact}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-md border border-slate-800">
                <span className="text-slate-500 block mb-1">Transit Demand</span>
                <span className="font-mono text-purple-400">+{aiParams.public_transit_demand}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DASHBOARD GRID (MAP + CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl relative overflow-hidden h-[400px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-950/80 p-2 rounded-md border border-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Live Drone View: Bhubaneswar</span>
          </div>

          <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
            <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" reuseMaps />
          </DeckGL>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-4 h-4 text-emerald-400" />
              <h2 className="text-md font-semibold text-slate-200">Pollution Index</h2>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="step" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", color: "#fff" }} />
                  <Line type="monotone" dataKey="pollution" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-md font-semibold text-slate-200">Traffic Density</h2>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="step" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", color: "#fff" }} />
                  <Line type="monotone" dataKey="traffic" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL REPORT MODAL */}
      {report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">AI Future Impact Report: 2035</h2>
                  <p className="text-sm text-slate-400">Executive Summary</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setReport(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Save as PDF
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
                <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block mb-1">
                  Simulated Policy
                </span>
                <p className="text-slate-200 italic">"{policy}"</p>
              </div>

              {report.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-slate-300 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}