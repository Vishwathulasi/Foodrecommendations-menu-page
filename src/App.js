import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./Component/MenuPage/MenuPage";
import FeedbackPage from "./Component/Feedbackpage"; // Import FeedbackPage component
import RecommendedPopupPage from "./Component/RecommendedPopupPage";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Define Routes for different pages */}
        <Routes>
          <Route path="/" element={<MenuPage />} /> {/* Set MenuPage as the starting page */}
          <Route path="/feed-back-page" element={<FeedbackPage />} /> 
          <Route path="/Recommend-pop-up" element={<RecommendedPopupPage/>} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
