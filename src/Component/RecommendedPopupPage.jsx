import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecommendedPopupPage = () => {
  const [recommendedFood, setRecommendedFood] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Fetch recommended food from backend
  const fetchRecommendedFood = async () => {
    try {
      const response = await axios.get('http://localhost:5000/recommended-food');
      setRecommendedFood(response.data.recommendedFood);
      setShowPopup(true); // Show popup each time we fetch new recommendation
    } catch (error) {
      console.error('Error fetching recommended food:', error);
    }
  };

  // Set an interval to fetch recommended food every 2 minutes (120000 ms)
  useEffect(() => {
    fetchRecommendedFood(); // Fetch initially when component mounts
    const intervalId = setInterval(fetchRecommendedFood, 120000); // Fetch every 2 minutes (120000 ms)

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  return (
    <div>
      <h2>Recommended Food Page</h2>
      {showPopup && recommendedFood && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Recommended Food</h3>
            <p>{recommendedFood}</p>
            <button
              onClick={() => setShowPopup(false)} // Close the popup
              className="mt-4 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedPopupPage;
