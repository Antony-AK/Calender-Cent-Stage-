import { Provider } from "react-redux";
import { store } from "./store";
import MyCalendar from "./Components/MyCalender"
import Sidebar from "./Components/Sidebar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css"
function App() {

  return (
    <>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
        <div className="flex items-center justify-center  min-h-screen w-[90%] h-auto mx-auto">
          <Sidebar />
          <MyCalendar />
        </div>
        </DndProvider>
      </Provider>

    </>
  )
}

export default App
