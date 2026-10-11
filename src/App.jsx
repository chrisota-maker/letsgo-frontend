import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyDay from "./pages/MyDay";
import ShareMyDay from "./pages/ShareMyDay";
import MyPeeps from "./pages/MyPeeps";
import DayView from "./pages/DayView";
import FindFriend from "./pages/FindFriend";
import ComingToMine from "./pages/ComingToMine";
import Joining from "./pages/Joining";

function App() {
  return(
    <>
      <Routes>
        <Route path ="/" element={<Login />} />
        <Route path ="/register" element={<Register />} />
        <Route path ="/day" element={<MyDay />} />
        <Route path ="/day/share" element={<ShareMyDay />} />
        <Route path ="/peeps" element={<MyPeeps />} />
        <Route path ="/peeps/day" element={<DayView />} />
        <Route path ="/peeps/find" element={<FindFriend />} />
        <Route path ="/responses" element={<ComingToMine />} />
        <Route path ="/responses/joining" element={<Joining />} />
      </Routes>
    </>
  );
}

export default App;
