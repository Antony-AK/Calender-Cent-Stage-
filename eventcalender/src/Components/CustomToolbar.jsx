import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";

const CustomToolbar = ({ label, onNavigate, onView, events = [], setFilteredEvents }) => {
  const [activeView, setActiveView] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewChange = (view) => {
    setActiveView(view);
    onView(view);
  };

  const handleSearch = () => {
    if (!Array.isArray(events)) return; 
    if (typeof setFilteredEvents !== "function") return; 

    const term = searchTerm.toLowerCase().trim();

    if (term === "") {
      setFilteredEvents(events); 
    } else {
      const filtered = events.filter((event) =>
        event?.title?.toLowerCase().includes(term)
      );
      setFilteredEvents(filtered);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-5">
        <button
          onClick={() => onNavigate("PREV")}
          className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-400"
        >
          <FaArrowLeft />
        </button>

        <span className="text-xl font-semibold">{label}</span>

        <button
          onClick={() => onNavigate("NEXT")}
          className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-400"
        >
          <FaArrowRight />
        </button>
      </div>

      <div>
        {["month", "week", "day"].map((view) => (
          <button
            key={view}
            onClick={() => handleViewChange(view)}
            className={`px-3 py-2 mx-1 rounded-lg ${
              activeView === view
                ? "bg-red-600 text-white"
                : "bg-gray-200 hover:bg-red-600 hover:text-white"
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative w-60 h-8 flex items-center">
        <input
          type="text"
          className="bg-gray-200 rounded-lg px-4 py-2 w-full h-full outline-none pl-10"
          placeholder="Search events"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <FaSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
};

export default CustomToolbar;
