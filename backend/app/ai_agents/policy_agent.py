import os
import json
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    verbose=True,
    temperature=0.2,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def load_city_context():
    """Reads the real-world dataset to ground the AI (Lightweight RAG)"""
    file_path = os.path.join(os.path.dirname(__file__), '../../data/city_stats.json')
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print("⚠️ Data file not found, using fallbacks.")
        return {"city_name": "Generic City", "current_metrics": {}}

def generate_simulation_parameters(policy_text: str):
    
    # 1. LOAD REAL DATA CONTEXT
    city_data = load_city_context()
    context_str = json.dumps(city_data, indent=2)
    
    print(f"🧠 AI Agent grounding reasoning in real data for {city_data.get('city_name')}...")

    policy_translator = Agent(
        role='Chief Data Scientist & Urban Planner',
        goal='Convert natural language urban policies into exact numerical percentage modifiers based on current city data.',
        backstory='You rely on hard data. You read current city statistics and calculate realistic future impacts of proposed policies. You ALWAYS respond with valid JSON.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 2. INJECT DATA INTO PROMPT
    translation_task = Task(
        description=f'''
        Current City Context (Real Data):
        {context_str}
        
        Analyze this proposed policy: "{policy_text}"
        
        Given the city's current real-world metrics, how will this policy impact the city over 10 years?
        Return ONLY a valid JSON object with these exact keys and numerical values (between -100 and +100 representing percentage change):
        - "traffic_impact" 
        - "pollution_impact" 
        - "economic_impact" 
        - "public_transit_demand" 
        
        CRITICAL: Do NOT include markdown tags like ```json. Output ONLY the raw curly braces.
        ''',
        expected_output='A valid JSON object with 4 integer keys.',
        agent=policy_translator
    )

    crew = Crew(agents=[policy_translator], tasks=[translation_task], process=Process.sequential)
    result = crew.kickoff()
    
    clean_result = result.raw.strip().replace('```json', '').replace('```', '')
    
    try:
        return json.loads(clean_result)
    except json.JSONDecodeError:
        return {"traffic_impact": 0, "pollution_impact": 0, "economic_impact": 0, "public_transit_demand": 0}