import React from "react";

const EventBadge = ({ title, time, color }) => {
  return (
    <div
      className="flex items-center gap-2 text-white px-3 py-1 my-1 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex-wrap"
      style={{ backgroundColor: color || "#3b82f6", minHeight: "40px" }} 
    >
      <div className="flex flex-col">
        <p className="text-sm font-semibold">{title}</p>
        {time && <p className="text-xs opacity-80">{time}</p>}
      </div>
    </div>
  );
};

export default EventBadge;
