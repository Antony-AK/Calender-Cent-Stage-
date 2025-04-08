import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setEvents, moveEvent, deleteEvent } from "../store";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventModal from "./EventModal";
import CustomToolbar from "./CustomToolbar";
import EventBadge from "./EventBadge";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.items);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState("month");
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

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const updatedEvent = { ...event, start, end };
      await axios.put(`https://calender-cent-stage.onrender.com/events/${event._id}`, updatedEvent);

      dispatch(moveEvent({ id: event._id, start, end }));
      dispatch(setEvents(events.map(e => e._id === event._id ? { ...e, start, end } : e)));

      alert("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleSelectEvent = (event, e) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowDetails(true);
    setShowModal(false);

    const rect = e.target.getBoundingClientRect();
    setDetailsPosition({
      top: rect.top + window.scrollY + 30,
      left: rect.left + window.scrollX + 30,
    });
  };

  return (
    <div className="container mx-auto my-5 p-6 bg-white shadow-lg rounded-xl relative">
      <DndProvider backend={HTML5Backend}>
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
          draggableAccessor={() => true}
          resizableAccessor={() => true}
          style={{ height: 600 }}
          className="rounded-lg shadow-md p-4"
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
          resizable
          onDragStart={() => console.log("Drag started")}
          onDropFromOutside={() => console.log("Dropped event")}
        />
      </DndProvider>

      {showDetails && selectedEvent && (
        <div 
          className="absolute bg-white p-4 shadow-lg rounded-md w-80 border z-40" 
          style={{ top: detailsPosition.top, left: detailsPosition.left }}
        >
          {/* ❌ Close Button */}
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
          <p className="mt-2">
            <span className="font-medium text-gray-500 me-1">Category: </span>  
            {selectedEvent.category || "No category mentioned"}
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
