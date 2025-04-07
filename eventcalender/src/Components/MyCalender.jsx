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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/events");
        dispatch(setEvents(res.data));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [dispatch]);

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const oldDate = moment(event.start).format("YYYY-MM-DD");
      const newDate = moment(start).format("YYYY-MM-DD");
  
      if (oldDate !== newDate) {
        alert("Event changed successfully!");
      }
  
      const updatedEvent = { ...event, start, end };
      await axios.put(`http://localhost:5000/events/${event._id}`, updatedEvent);
      dispatch(moveEvent({ id: event._id, start, end }));
  
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };
  

  return (
    <div className="container mx-auto my-5 p-6 bg-white shadow-lg rounded-xl">
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
        }}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setSelectedSlot(null);
          setShowModal(true);
        }}
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

      {showModal && (
        <EventModal
          show={showModal}
          onClose={() => setShowModal(false)}
          slot={selectedSlot}
          event={selectedEvent}
          onDelete={async (id) => {
            try {
              await axios.delete(`http://localhost:5000/events/${id}`);
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