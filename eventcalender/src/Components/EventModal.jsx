import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addEvent, updateEvent } from "../store";
import { FaTimes, FaCalendarAlt, FaClock, FaEdit } from "react-icons/fa";

const EventModal = ({ show, onClose, event }) => {
  const parseDateTime = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const dateObj = new Date(dateTime);
    if (isNaN(dateObj)) return { date: "", time: "" }; 
    return {
      date: dateObj.toISOString().split("T")[0], 
      time: dateObj.toISOString().split("T")[1]?.slice(0, 5), 
    };
  };

  const { date: initialStartDate, time: initialStartTime } = parseDateTime(event?.start);
  const { date: initialEndDate, time: initialEndTime } = parseDateTime(event?.end);

  const [title, setTitle] = useState(event?.title || "");
  const [category, setCategory] = useState(event?.category || "");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [color, setColor] = useState(event?.color || "blue");

  const dispatch = useDispatch();

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setCategory(event.category || "");
      const { date: newStartDate, time: newStartTime } = parseDateTime(event.start);
      const { date: newEndDate, time: newEndTime } = parseDateTime(event.end);
      setStartDate(newStartDate);
      setStartTime(newStartTime);
      setEndDate(newEndDate);
      setEndTime(newEndTime);
      setColor(event.color || "blue");
    }
  }, [event]);

  const handleSave = async () => {
    if (!title.trim() || !startDate || !endDate || !startTime || !endTime) {
      alert("Please fill all fields.");
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    const newEvent = { title, category, start, end, color };

    try {
      if (event) {
        const res = await axios.put(`https://calender-cent-stage.onrender.com/events/${event._id}`, newEvent);
        dispatch(updateEvent(res.data));
        alert("Event updated successfully!");
      } else {
        const res = await axios.post("https://calender-cent-stage.onrender.com/events", newEvent);
        dispatch(addEvent(res.data));
        alert("Event added successfully!");
      }
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Try again!");
    }
  };


  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{event ? "Edit Event" : "Add Event"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={18} />
          </button>
        </div>

        <label className="block text-sm mb-1">Event Title</label>
        <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-3" />

        <label className="block text-sm mb-1">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded mb-3">
          {['exercise', 'eating', 'work', 'relax', 'family', 'social'].map((cat) => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Start Date</label>
            <div className="flex items-center border p-2 rounded">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input type="date" className="w-full bg-transparent outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Start Time</label>
            <div className="flex items-center border p-2 rounded">
              <FaClock className="text-gray-500 mr-2" />
              <input type="time" className="w-full bg-transparent outline-none" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">End Date</label>
            <div className="flex items-center border p-2 rounded">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input type="date" className="w-full bg-transparent outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">End Time</label>
            <div className="flex items-center border p-2 rounded">
              <FaClock className="text-gray-500 mr-2" />
              <input type="time" className="w-full bg-transparent outline-none" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-sm mb-2">Color</p>
          <div className="flex gap-2">
            {["red", "blue", "green", "yellow", "purple", "orange"].map((col) => (
              <label key={col} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="color" value={col} checked={color === col} onChange={() => setColor(col)} />
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: col }}></span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
        
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded flex items-center">
            <FaEdit className="mr-1" /> {event ? "Update" : "Create"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default EventModal;
