import asyncio
import websockets
import json

async def test_simulation():
    
    uri = "ws://127.0.0.1:8000/ws/simulate" 
    
    try:
        async with websockets.connect(uri) as websocket:
            test_request = {"policy_text": "Make all public transport free and ban diesel vehicles"}
            await websocket.send(json.dumps(test_request))
            print(f"Sent: {test_request}")

            while True:
                try:
                    response = await websocket.recv()
                    data = json.loads(response)
                    
                    if data["status"] == "processing":
                        print(f"\n⏳ {data['message']}")
                    elif data["status"] == "ai_complete":
                        print(f"\n✅ AI Output: {data['ai_parameters']}")
                    elif data["status"] == "running":
                        if data["step"] % 10 == 0:
                            print(f"Step {data['step']} -> Metrics: {data['metrics']}")
                    elif data["status"] == "completed":
                        print(f"\n🏁 {data['message']}")
                        break
                except websockets.exceptions.ConnectionClosed:
                    print("\n🔴 Connection closed by server.")
                    break
    except TimeoutError:
        print("\n❌ TimeoutError: Could not connect to the server.")
        print("Make sure your FastAPI server is running on port 8000 in ANOTHER terminal using:")
        print("uvicorn app.main:app --reload")
    except ConnectionRefusedError:
         print("\n❌ ConnectionRefusedError: Server is not running.")

if __name__ == "__main__":
    asyncio.run(test_simulation())