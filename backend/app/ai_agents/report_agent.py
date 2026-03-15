import os
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def generate_impact_report(policy_text: str, initial_metrics: dict, final_metrics: dict):
    print("🧠 AI Analyst is writing the final report...")

    analyst = Agent(
        role='Chief Data Scientist & Urban Planner',
        goal='Summarize the multi-agent simulation results into a clear, executive-level impact report.',
        backstory='You analyze city simulation data and write concise, professional reports for government officials.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    report_task = Task(
        description=f'''
        Write a brief Executive Impact Report for the year 2035 based on this policy: "{policy_text}".
        
        Initial City State (2025):
        - Pollution Index: {initial_metrics['pollution']}
        - Traffic Density: {initial_metrics['traffic']}
        - City Revenue: ${initial_metrics['economy']}
        
        Final Simulated State (2035):
        - Pollution Index: {final_metrics['pollution']}
        - Traffic Density: {final_metrics['traffic']}
        - City Revenue: ${final_metrics['economy']}
        
        Provide the output in exactly 3 short, punchy paragraphs:
        1. Policy Overview & Execution
        2. Key Environmental & Traffic Impacts
        3. Economic Consequences & Final Verdict
        
        Do NOT use markdown like ** or ##. Just plain text paragraphs separated by empty lines.
        ''',
        expected_output="A three-paragraph executive summary in plain text.",
        agent=analyst
    )

    crew = Crew(agents=[analyst], tasks=[report_task], process=Process.sequential)
    result = crew.kickoff()
    
    return result.raw.strip()