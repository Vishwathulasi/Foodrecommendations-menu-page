import React, { useState, useEffect } from 'react';
import HeaderPage from './HeaderPage';
import CategoryCard from './MenuCategories'; // Ensure the correct import for your CategoryCard
import sampleVideo from '../../Picture/Video.mp4';
import axios from 'axios';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [recommendedFood, setRecommendedFood] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Fetch data from FastAPI
  useEffect(() => {
    fetch('http://127.0.0.1:8000/menu-items')  // Your FastAPI URL
      .then((response) => response.json())
      .then((data) => {
        setMenuItems(data);
        // Extract unique categories from the data, excluding null or undefined values
        const uniqueCategories = [...new Set(data.map(item => item.Category).filter(category => category !== null && category !== undefined))];
        setCategories(uniqueCategories);
      })
      .catch((error) => console.error('Error fetching menu items:', error));
  }, []);

  // Fetch recommended food from the backend (every 2 minutes)
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

  const filteredItems = menuItems.filter(item =>
    (item['Food Item'] && item['Food Item'].toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.Category && item.Category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedItems = (items) => {
    switch (sortOption) {
      case 'price-asc':
        return [...items].sort((a, b) => a['Price (INR)'] - b['Price (INR)']);
      case 'price-desc':
        return [...items].sort((a, b) => b['Price (INR)'] - a['Price (INR)']);
      case 'rating-asc':
        return [...items].sort((a, b) => a.Rating - b.Rating);
      case 'rating-desc':
        return [...items].sort((a, b) => b.Rating - a.Rating);
      default:
        return items;
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <HeaderPage query={searchQuery} setQuery={setSearchQuery} />
      <div className="flex mt-9">
        <div className="w-2/4 p-4">
          <div className="bg-white rounded-xl shadow-lg">
            <video
              src={sampleVideo}
              autoPlay
              loop
              muted
              className="w-full h-auto rounded-t-lg" />
            <div className="p-4 text-center">
              <h3 className="text-lg font-bold">Welcome to DineSmart!</h3>
              <p className="text-gray-500">
                Enjoy our exclusive dishes while watching the best culinary techniques!
              </p>
            </div>
          </div>
        </div>
        <div className="w-2/4 p-4">
          <div className="flex justify-end mb-4">
            <select
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border border-gray-300 rounded"
              value={sortOption}>
              <option value="">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>
          </div>
          <div
            style={{
              maxHeight: '60vh', overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="scroll-container">
            {selectedCategory ? (
              <CategoryCard
                category={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortedItems={sortedItems} // Pass the sorting function
                menuItems={menuItems.filter(item => item.Category === selectedCategory)} // Filter menu items based on selected category
              />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {searchQuery ? (
                  sortedItems(filteredItems).map((item) => (
                    <div key={item['Item ID']} className="p-4 bg-white rounded-xl shadow-lg">
                      <img src={item.Image} alt={item['Food Item']} className="h-32 w-full object-cover rounded-t-lg" />
                      <h3 className="text-lg font-bold mt-2">{item['Food Item']}</h3>
                      <p className="text-gray-700">Category: {item.Category}</p>
                      <p className="text-gray-700">Description: {item.Description}</p>
                      <p className="text-gray-700">Price: ₹{item['Price (INR)'] ? item['Price (INR)'] : 'N/A'}</p>
                      <p className="text-gray-700">Rating: {item.Rating ? item.Rating : 'N/A'}</p>
                      <p className="text-gray-700">Taste: {item.Taste}</p>
                    </div>
                  ))
                ) : (
                  categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategorySelect(category)}
                      className="p-4 bg-white rounded-xl shadow-lg hover:bg-gray-200">
                      <h2 className="text-center text-lg font-bold">{category}</h2>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Logic */}
      {showPopup && recommendedFood && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Most Loved Dish of this Month...Try this!!</h3>
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

export default MenuPage;
