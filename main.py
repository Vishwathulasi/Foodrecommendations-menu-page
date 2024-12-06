from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Allow CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your React app URL for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the MenuList Excel file
menu_df = pd.read_excel('MenuList.xlsx')

# Preprocess Data
menu_df['combined_features'] = menu_df['Taste'].fillna('unknown') + " " + menu_df['Description'].fillna('')

# Vectorization
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(menu_df['combined_features'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

class RecommendationRequest(BaseModel):
    dish_name: str
    num_recommendations: int = 5

@app.post("/recommend/")
async def recommend_dishes(request: RecommendationRequest):
    try:
        idx = menu_df[menu_df['Food Item'] == request.dish_name].index[0]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Get recommended dish indices
        dish_indices = [i[0] for i in sim_scores[1:request.num_recommendations + 1]]

        # Prepare the recommended dishes with images
        recommended_dishes = menu_df.iloc[dish_indices][['Food Item', 'Image']].to_dict(orient='records')
        print("hello hi how ")
        print(recommended_dishes)
        return {"recommended_dishes": recommended_dishes}

    except IndexError:
        return {"recommended_dishes": []}  # Return empty if the dish name is not found
    except Exception as e:
        return {"error": str(e)}  # Handle other errors

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
