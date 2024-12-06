import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import HeaderPage from './MenuPage/HeaderPage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState([]);
  const [foodCategory, setFoodCategory] = useState('');
  const [allFoodItems, setAllFoodItems] = useState([]);
  const navigate = useNavigate();

  // Load feedbacks from localStorage when the component mounts
  useEffect(() => {
    const savedFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    setFeedbacks(savedFeedbacks);
  }, []);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get('http://localhost:8000/menu-items');
        setAllFoodItems(response.data);
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };
    fetchFoodItems();
  }, []);

  const handleFoodSelection = (foodItem) => {
    setSelectedFood((prevSelectedFood) => {
      if (prevSelectedFood.includes(foodItem)) {
        return prevSelectedFood.filter((item) => item !== foodItem);
      } else {
        return [...prevSelectedFood, foodItem];
      }
    });
  };

  const handleCategorySelection = (category) => {
    setFoodCategory(category);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!message || rating === 0 || selectedFood.length === 0) {
      setError('Please provide feedback, a rating, and select food items.');
      return;
    }

    const newFeedback = {
      name: name.trim() || 'Anonymous',
      phone: phone.trim(),
      rating,
      message: message.trim(),
      selectedFood,
      date: new Date().toLocaleString(),
    };

    try {
      await axios.post('http://localhost:5000/submit-feedback', newFeedback);

      const updatedFeedbacks = [newFeedback, ...feedbacks];
      setFeedbacks(updatedFeedbacks);
      localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));

      setName('');
      setPhone('');
      setRating(0);
      setMessage('');
      setSelectedFood([]);
      setFoodCategory('');
      setError('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('There was an error submitting your feedback. Please try again later.');
    }
  };

  return (
    <div>
      <HeaderPage />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Feedback</h2>
          <form onSubmit={handleFeedbackSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 border rounded-lg focus:outline-none border-gray-300"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-3 px-4 border rounded-lg focus:outline-none border-gray-300"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Your feedback"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full py-3 px-4 border rounded-lg focus:outline-none border-gray-300"
              ></textarea>
            </div>

            {/* Food Category Selection */}
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => handleCategorySelection('Dessert')}
                className={`py-2 px-4 mr-2 rounded-lg ${foodCategory === 'Dessert' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Dessert
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelection('Appetizer')}
                className={`py-2 px-4 mr-2 rounded-lg ${foodCategory === 'Appetizer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Appetizer
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelection('Main Course')}
                className={`py-2 px-4 mr-2 rounded-lg ${foodCategory === 'Main Course' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Main Course
              </button>
            </div>

            {/* Display food items based on selected category */}
            {foodCategory && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Select Food Items ({foodCategory})</h3>
                <div className="grid grid-cols-2 gap-4">
                  {allFoodItems
                    .filter((item) => item.Category === foodCategory)
                    .map((item) => (
                      <div key={item['Food Item']} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item['Food Item']}
                          checked={selectedFood.includes(item['Food Item'])}
                          onChange={() => handleFoodSelection(item['Food Item'])}
                          className="mr-2"
                        />
                        <label htmlFor={item['Food Item']} className="text-gray-700">{item['Food Item']}</label>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    className={`cursor-pointer ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Submit Feedback
            </button>
          </form>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300 mt-6"
          >
            All Reviews
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 mt-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300"
          >
            Go to Menu
          </button>
        </div>
      </div>

      {/* Modal for all reviews */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-6">All Reviews</h3>
            <div className="max-h-96 overflow-y-auto">
              {feedbacks.map((feedback, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold">{feedback.name}</p>
                  <p className="text-sm">{feedback.message}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500">{feedback.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">Food Items: {feedback.selectedFood.join(', ')}</p>
                  <p className="text-xs text-gray-500">{feedback.date}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 mt-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
