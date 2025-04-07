import { configureStore, createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
  name: "events",
  initialState: { items: [] },
  reducers: {
    setEvents: (state, action) => { state.items = action.payload; },
    addEvent: (state, action) => { state.items.push(action.payload); },
    moveEvent: (state, action) => {
      const event = state.items.find(e => e.id === action.payload.id);
      if (event) {
        event.start = action.payload.start;
        event.end = action.payload.end;
      }
    },
    updateEvent: (state, action) => {
      const index = state.items.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteEvent: (state, action) => {
      state.items = state.items.filter(e => e.id !== action.payload);
    }
  },
});

export const { setEvents, addEvent, moveEvent, updateEvent, deleteEvent } = eventSlice.actions;
export const store = configureStore({ reducer: { events: eventSlice.reducer } });
