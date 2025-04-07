import { Provider } from "react-redux";
import { store } from "./store";
import MyCalendar from "./Components/MyCalender"
import "./App.css"
function App() {

  return (
    <>
     <Provider store={store}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <MyCalendar />
      </div>
    </Provider>
 
    </>
  )
}

export default App
