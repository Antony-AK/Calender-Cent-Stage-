import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setEvents, moveEvent, deleteEvent } from "../store";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventModal from "./EventModal";
import CustomToolbar from "./CustomToolbar";
import EventBadge from "./EventBadge";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./CalenderStyle.css";
import { useDrop } from "react-dnd";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.items);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [detailsPosition, setDetailsPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("https://calender-cent-stage.onrender.com/events");
        dispatch(setEvents(res.data));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [dispatch]);

  useEffect(() => {
    const deletePastEvents = async () => {
      const now = moment(); 
  
      const pastEvents = events.filter((event) => {
        const eventStart = moment(event.start); 
        const eventEnd = moment(event.end); 
  
        return eventStart.isBefore(now) && eventEnd.isBefore(now);
      });
  
      for (const event of pastEvents) {
        try {
          await axios.delete(`https://calender-cent-stage.onrender.com/events/${event._id}`);
          dispatch(deleteEvent(event._id));
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      }
    };
  
    deletePastEvents();
  }, [events, dispatch]);
  

  const handleSelectEvent = (event, e) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowDetails(true);
    setShowModal(false);
  
    const rect = e.target.getBoundingClientRect();
    setDetailsPosition({
      top: rect.top + window.scrollY + 10, 
      left: rect.left + window.scrollX + 10, 
    });
  };
  

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start: convertToLocalTime(start),
        end: convertToLocalTime(end),
      };

      await axios.put(`https://calender-cent-stage.onrender.com/events/${event._id}`, updatedEvent);

      // Update Redux state
      dispatch(moveEvent({ id: event._id, start: new Date(start), end: new Date(end) }));
      dispatch(setEvents(events.map(e => (e._id === event._id ? updatedEvent : e))));

      alert("Event resized successfully!");
    } catch (error) {
      console.error("Error resizing event:", error);
    }
  };


  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start: convertToLocalTime(start),
        end: convertToLocalTime(end),
      };

      await axios.put(`https://calender-cent-stage.onrender.com/events/${event._id}`, updatedEvent);

      dispatch(moveEvent({ id: event._id, start: new Date(start), end: new Date(end) }));
      dispatch(setEvents(events.map(e => (e._id === event._id ? updatedEvent : e))));

      alert("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const convertToLocalTime = (utcDate) => {
    return moment(utcDate).format("YYYY-MM-DD HH:mm:ss");
  };

  const handleEventDropFromSidebar = async (event) => {
    if (!event || typeof event !== "object") {
      console.error("❌ Invalid event data", event);
      return;
    }

    let missingFields = [];
    if (!event.title) missingFields.push("title");
    if (!event.start) missingFields.push("start");
    if (!event.end) missingFields.push("end");

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(", ")}`, event);
      return;
    }

    const formattedEvent = {
      title: event.title,
      start: convertToLocalTime(event.start),
      end: convertToLocalTime(event.end),
      color: event.color || "#3498db",
    };

    try {
      const response = await axios.post(`https://calender-cent-stage.onrender.com/events`, formattedEvent);
      dispatch(addEvent(response.data));
      console.log("✅ Event successfully added:", response.data);
    } catch (error) {
      console.error("❌ Error adding event:", error.response ? error.response.data : error.message);
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: "event",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
  
      // Logic for the "week" view
      if (view === "week") {
        const daySlots = document.querySelectorAll(".rbc-day-slot");
        let targetSlot = null;
        let closestDayIndex = 0;
        let smallestDistance = Infinity;
  
        daySlots.forEach((slot, index) => {
          const rect = slot.getBoundingClientRect();
          const distance = Math.abs(offset.x - (rect.left + rect.width / 2));
          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestDayIndex = index;
            targetSlot = slot;
          }
        });
  
        if (!targetSlot) return;
  
        const slotRect = targetSlot.getBoundingClientRect();
        const adjustedY = offset.y - 32 / 2; 
        const yOffsetInSlot = adjustedY - slotRect.top;
        const slotHeight = targetSlot.offsetHeight;
  
        const totalMinutes = 24 * 60;
        const minutesOffset = Math.round((yOffsetInSlot / slotHeight) * totalMinutes);
  
        const baseDate = moment(date).startOf("week").add(closestDayIndex, "days");
        const startTime = baseDate.clone().startOf("day").add(minutesOffset, "minutes").toDate();
        const endTime = new Date(startTime.getTime() + 60 * 60000);
  
        const newEvent = {
          title: item.title || item.name || "Untitled",
          start: startTime,
          end: endTime,
          color: item.color || "#3498db",
        };
  
        handleEventDropFromSidebar(newEvent);
      }

      else if (view === "day") {
        const daySlot = document.querySelector(".rbc-day-slot");
        if (!daySlot) return;
  
        const rect = daySlot.getBoundingClientRect();
        const adjustedY = offset.y - 30 / 2; 
        const yOffsetInSlot = adjustedY - rect.top;
        const slotHeight = daySlot.offsetHeight;
  
        const totalMinutes = 24 * 60;
        const minutesOffset = Math.round((yOffsetInSlot / slotHeight) * totalMinutes);
  
        const startTime = moment(date).startOf("day").add(minutesOffset, "minutes").toDate();
        const endTime = new Date(startTime.getTime() + 60 * 60000); 
  
        const newEvent = {
          title: item.title || item.name || "Untitled",
          start: startTime,
          end: endTime,
          color: item.color || "#3498db",
        };
  
        handleEventDropFromSidebar(newEvent);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  return (
    <div ref={drop} className={`container flex w-[75%] mx-auto my-5 p-6 bg-white shadow-lg rounded-xl relative ${isOver ? "bg-gray-100" : ""}`}>
      <DnDCalendar
        localizer={localizer}
        events={events.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={({ start, end }) => {
          setSelectedSlot({ start, end });
          setSelectedEvent(null);
          setShowModal(true);
          setShowDetails(false);
        }}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        resizable
        onEventResize={handleEventResize}
        resizableAccessor={() => true}
        draggableAccessor={() => true}
        externalDragDrop={true}
        style={{ height: 600 }}
        className="rounded-lg shadow-md p-4 calendar-container"
        view={view}
        onView={(newView) => setView(newView)}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <EventBadge
              title={event.title}
              color={event.color || "bg-gray-300"}
              time={moment(event.start).format("hh:mm A")}
            />
          ),
        }}
        step={30}
        timeslots={2}
        draggable
        onDragStart={() => console.log("Drag started")}
        dragFromOutsideItem={() => {
          return { title: "New Event", start: new Date(), end: new Date(Date.now() + 60 * 60000) };
        }}
        onDropFromOutside={({ start, end, item }) => {
          handleEventDropFromSidebar({
            ...item,
            start: new Date(start),
            end: new Date(end)
          });
        }}
      />

      {showDetails && selectedEvent && (
        <div
          className="absolute bg-white p-4 shadow-lg rounded-md w-80 border z-40"
          style={{ top: detailsPosition.top, left: detailsPosition.left, transform: 'translateY(10px)',    }}
        >
          <button
            className="absolute top-3 right-3 text-red-500 text-sm hover:text-red-700"
            onClick={() => setShowDetails(false)}
          >
            ✖
          </button>
          <h2 className="text-lg font-bold">{selectedEvent.title}</h2>
          <p className="text-gray-600 my-2">
            <span className="font-medium text-gray-500 me-1">Date:</span>
            {moment(selectedEvent.start).format("MMMM Do YYYY")}
          </p>
          <p className="text-gray-600 space-y-2">
            <span className="font-medium text-gray-500 me-1">Timing:</span>
            {moment(selectedEvent.start).format("h:mm A")} - {moment(selectedEvent.end).format("h:mm A")}
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowDetails(false);
                setShowModal(true);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this event?")) {
                  try {
                    await axios.delete(`https://calender-cent-stage.onrender.com/events/${selectedEvent._id}`);
                    dispatch(deleteEvent(selectedEvent._id));
                    setShowDetails(false);
                  } catch (error) {
                    console.error("Error deleting event:", error);
                  }
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <EventModal
          show={showModal}
          onClose={() => setShowModal(false)}
          slot={selectedSlot}
          event={selectedEvent}
          onDelete={async (id) => {
            try {
              await axios.delete(`https://calender-cent-stage.onrender.com/events/${id}`);
              dispatch(deleteEvent(id));
            } catch (error) {
              console.error("Error deleting event:", error);
            }
          }}
        />
      )}
    </div>
  );
};

export default MyCalendar;
