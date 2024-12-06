from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import math
import uvicorn

# Function to clean data (e.g., handle NaN or infinity)
def clean_data(data):
    for item in data:
        for key, value in item.items():
            if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                item[key] = None  # Replace NaN or infinity with None
    return data

# Create FastAPI app
app = FastAPI()

# CORS configuration
origins = ["http://localhost:3000"]  # Your React frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Excel file at startup for both routes
data = pd.read_excel('MenuList.xlsx')
cleaned_data = clean_data(data.to_dict(orient="records"))

# Dictionary to store food item details for /chat route
food_data = {
    str(row['Food Item']).lower(): row for _, row in data.iterrows() if isinstance(row['Food Item'], str)
}

# Route to get all menu items (for your frontend React app)
@app.get("/menu-items")
async def get_menu_items():
    return cleaned_data

# Route to handle chatbot requests based on food item query
@app.post("/chat")
async def handle_chat(request: Request):
    payload = await request.json()
    print("hello",payload)
    if not payload or "query" not in payload:
        return JSONResponse(content={"message": "No query provided"}, status_code=400)

    user_query = payload.get("query", "").strip().lower()
    print(user_query)
    # Logic to find the food details
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

# Main entry point for starting the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
