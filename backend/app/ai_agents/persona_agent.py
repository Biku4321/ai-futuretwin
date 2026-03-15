# backend/app/ai_agents/persona_agent.py
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7, 
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def generate_citizen_reactions(policy_text: str):
    """Generates 4 realistic tweets/reactions from different city personas."""
    print("🗣️ Generating Live Citizen Feed...")
    
    prompt = f"""
    A new city policy has been announced: "{policy_text}".
    Generate 4 short, realistic "tweets" (max 15 words each) from different citizens reacting to this. 
    Personas to use: 1 Taxi Driver, 1 College Student, 1 Small Business Owner, 1 Environmentalist.
    Make some positive and some negative.
    Return ONLY a valid JSON array of strings. Example: ["tweet 1", "tweet 2"]
    """
    
    response = llm.invoke(prompt)
    clean_result = response.content.strip().replace('```json', '').replace('```', '')
    
    try:
        return json.loads(clean_result)
    except:
        return [
            "This policy is going to change everything! #CityUpdate",
            "Not sure how this will affect my daily commute. 🚕",
            "Great step for the environment! 🌳",
            "Who is going to pay for this? Taxes will go up! 📉"
        ]