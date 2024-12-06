from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# Allow CORS for all domains (or specify certain domains for security)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],# Change to your React app's domain
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict this if you only need specific methods like POST
    allow_headers=["*"],
)

# Load the Excel file at startup
data = pd.read_excel('MenuList.xlsx')
food_data = {
    str(row['Food Item']).lower(): row for index, row in data.iterrows() if isinstance(row['Food Item'], str)
}

@app.post("/chat")
async def handle_chat(request: Request):
    payload = await request.json()
    print(payload)
    if not payload or "query" not in payload:
        return JSONResponse(content={"message": "No query provided"}, status_code=400)

    user_query = payload.get("query", "").strip().lower()
    print(user_query)
    # Logic to find the food details
    response = {}
    if user_query in food_data:
        response = {
            "food_name": user_query.title(),
            "category": food_data[user_query]["Category"],
            "description": food_data[user_query]["Description"],
            "taste": food_data[user_query]["Taste"],
            "photo": food_data[user_query]["Image"]
        }
    else:
        response = {"message": "Sorry, I don't have information on that food item."}

    return JSONResponse(content=response)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
