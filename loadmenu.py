from fastapi import FastAPI
from typing import List
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

class MenuItem(BaseModel):
    id: int
    name: str
    category: str
    price_inr: float
    rating: float
    image: str
    description: str
    taste: str

# Load menu items from Excel file
def load_menu_items():
    df = pd.read_excel('MenuList.xlsx')  # Adjust the path if necessary
    menu_items = [
        MenuItem(
            id=row['Item ID'],
            name=row['Food Item'],
            category=row['Category'],
            price_inr=row['Price (INR)'],
            rating=row['Rating'],
            image=row['Image'],
            description=row['Description'],
            taste=row['Taste']
        )
        for _, row in df.iterrows()
    ]
    return menu_items

# Load menu items at startup
menu_items = load_menu_items()

@app.get("/api/menuItems", response_model=List[MenuItem])
def get_menu_items():
    return menu_items
