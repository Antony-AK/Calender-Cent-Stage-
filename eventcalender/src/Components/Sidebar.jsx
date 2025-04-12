import { useEffect, useState } from "react";
import axios from "axios";
import { useDrag } from "react-dnd";

const Sidebar = ({ onGoalSelect }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await axios.get("https://calender-cent-stage.onrender.com/goals");
        setGoals(res.data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };
    fetchGoals();
  }, []);


  const handleGoalSelect = async (goal) => {
    setSelectedGoal(goal);
  
    try {
      const res = await axios.get(`https://calender-cent-stage.onrender.com/goals/${goal._id}/events`);
      console.log("Fetched Events:", res.data); 
  
      setEvents(res.data); 
      if (onGoalSelect) {
        onGoalSelect(res.data, goal.color);
      }
    } catch (error) {
      console.error("Error fetching events for selected goal:", error);
      setEvents([]); 
      if (onGoalSelect) {
        onGoalSelect([], goal.color);
      }
    }
  };
  
  
  

  return (
    <div className="w-60 h-[600px] p-4 bg-gray-100 overflow-y-auto shadow-md">
      <h2 className="text-lg font-semibold mb-4">Goals</h2>
      <ul>
        {goals.map((goal) => (
          <li
            key={goal._id}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedGoal?._id === goal._id ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => handleGoalSelect(goal)}
          >
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: goal.color }}
            ></span>
            {goal.title}
          </li>
        ))}
      </ul>

      {selectedGoal && (
        <div className="mt-4 p-3 bg-white shadow rounded">
          <h3 className="text-md font-semibold mb-2">Tasks</h3>
          <ul>
            {events.length > 0 ? (
              events.map((event) => <DraggableEvent key={event._id} event={event} />)
            ) : (
              <p className="text-gray-500">No events found</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;



const DraggableEvent = ({ event }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "event",
    item: { id: event._id, title: event.title, start: event.start, end: event.end, color: event.color },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <li
      ref={drag}
      className={`p-2 bg-gray-200 rounded mb-2 cursor-pointer ${
        isDragging ? "opacity-50" : ""
      }` } style={{ backgroundColor: event.color, color: "white" }}
    >
      {event.title}
    </li>
  );
};





