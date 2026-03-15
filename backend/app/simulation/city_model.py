import random
from mesa.space import ContinuousSpace
class CitizenAgent:
    """An agent representing a citizen/vehicle in the city."""
    def __init__(self, unique_id, model):
        self.unique_id = unique_id
        self.model = model
        self.pos = None 
        self.status = "moving" if random.random() < 0.8 else "idle"

    def step(self):
        if self.model.transit_demand > 20 and self.status == "moving":
            if random.random() < 0.1: 
                self.status = "idle"
                
        # Movement Logic
        if self.status == "moving":
            dx = random.uniform(-0.001, 0.001)
            dy = random.uniform(-0.001, 0.001)
            new_x = self.pos[0] + dx
            new_y = self.pos[1] + dy
            
            # Boundary check
            new_x = max(self.model.space.x_min, min(self.model.space.x_max, new_x))
            new_y = max(self.model.space.y_min, min(self.model.space.y_max, new_y))
            
            self.model.space.move_agent(self, (new_x, new_y))

class CityModel:
    """A completely custom model engine."""
    def __init__(self, num_agents, policy_params):
        self.num_agents = num_agents
        
        self.space = ContinuousSpace(
            x_max=85.85, y_max=20.32, 
            torus=False, 
            x_min=85.80, y_min=20.27
        )
        
        self.my_agents = []

        self.traffic_mod = policy_params.get("traffic_impact", 0) / 100
        self.pollution_mod = policy_params.get("pollution_impact", 0) / 100
        self.econ_mod = policy_params.get("economic_impact", 0) / 100
        self.transit_demand = policy_params.get("public_transit_demand", 0)

        self.pollution = 150.0
        self.traffic = 85.0
        self.economy = 500000.0

        for i in range(self.num_agents):
            a = CitizenAgent(i, self)
            self.my_agents.append(a)
            
            x = random.uniform(85.81, 85.84)
            y = random.uniform(20.28, 20.31)
            self.space.place_agent(a, (x, y))

    def step(self):
        """Advance the model by one step."""
        random.shuffle(self.my_agents)
        for a in self.my_agents:
            a.step()
        
        self.pollution += (self.pollution * self.pollution_mod * 0.02)
        self.traffic += (self.traffic * self.traffic_mod * 0.02)
        self.economy += (self.economy * self.econ_mod * 0.02)

        agent_data = []
        for a in self.my_agents:
            agent_data.append({
                "id": a.unique_id,
                "status": a.status,
                "coords": [a.pos[0], a.pos[1]]
            })

        return {
            "pollution_index": round(max(0, self.pollution), 2),
            "traffic_density": round(max(0, self.traffic), 2),
            "city_revenue": round(self.economy, 2),
            "agents": agent_data
        }