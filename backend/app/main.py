from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from app.ai_agents.policy_agent import generate_simulation_parameters, load_city_context
from app.ai_agents.report_agent import generate_impact_report
from app.ai_agents.persona_agent import generate_citizen_reactions
from app.simulation.city_model import CityModel

app = FastAPI(title="AI FutureTwin Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "FutureTwin Core Engine is Online 🟢"}

@app.websocket("/ws/simulate")
async def websocket_simulation(websocket: WebSocket):
    await websocket.accept()
    print("🟢 Frontend connected to simulation stream!")
    
    try:
        request_data = await websocket.receive_text()
        data = json.loads(request_data)
        policy_text = data.get("policy_text", "")

        # 1.Processing Start & RAG Data
        await websocket.send_json({"status": "processing", "message": "🧠 AI Agent is grounding data with Real City Stats..."})
        policy_params = await asyncio.to_thread(generate_simulation_parameters, policy_text)
        
        city_data = load_city_context()
        base_metrics = city_data.get("current_metrics", {})
        start_pollution = base_metrics.get("pollution_aqi", 150.0)
        start_traffic = base_metrics.get("traffic_density_percent", 85.0)
        start_economy = base_metrics.get("economy_budget_usd", 500000.0)

        await websocket.send_json({"status": "processing", "message": "🗣️ Generating Citizen Personas..."})
        
        # persona agent Call
        tweets = await asyncio.to_thread(generate_citizen_reactions, policy_text)
        
        await websocket.send_json({
            "status": "ai_complete",
            "message": f"✅ Grounded in {city_data.get('city_name', 'City')} Data. Spawning Agents...",
            "ai_parameters": policy_params,
            "tweets": tweets  
        })

        # 2. Setup Mesa Simulation Engine
        city_simulation = CityModel(num_agents=50, policy_params=policy_params)
        city_simulation.pollution = start_pollution
        city_simulation.traffic = start_traffic
        city_simulation.economy = start_economy

        # 3. THE SIMULATION LOOP RUNNING
        for step in range(1, 101):
            step_data = city_simulation.step()
            live_state = {
                "status": "running",
                "step": step,
                "metrics": {
                    "pollution_index": step_data["pollution_index"],
                    "traffic_density": step_data["traffic_density"],
                    "city_revenue": step_data["city_revenue"]
                },
                "agent_updates": step_data["agents"]
            }
            await websocket.send_json(live_state)
            await asyncio.sleep(0.1)

        # 4. LOOP FINISHED - GENERATE FINAL REPORT
        await websocket.send_json({"status": "processing", "message": "📝 AI is generating Final Impact Report..."})
        
        initial_metrics = {"pollution": start_pollution, "traffic": start_traffic, "economy": start_economy}
        final_metrics = {
            "pollution": step_data["pollution_index"], 
            "traffic": step_data["traffic_density"], 
            "economy": step_data["city_revenue"]
        }
        
        final_report = await asyncio.to_thread(
            generate_impact_report, policy_text, initial_metrics, final_metrics
        )

        await websocket.send_json({
            "status": "completed", 
            "message": "🏁 Simulation 2035 Reached.",
            "report": final_report
        })
        print("🔴 Simulation completed.")
        
    except WebSocketDisconnect:
        print("⚠️ Client disconnected.")
    except Exception as e:
        print(f"❌ Error: {e}")
        await websocket.send_json({"status": "error", "message": str(e)})