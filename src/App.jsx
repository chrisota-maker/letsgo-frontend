import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
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

        <Route element={<Layout />}>
          <Route path ="/day" element={<MyDay />} />
          <Route path ="/day/share" element={<ShareMyDay />} />
          <Route path ="/peeps" element={<MyPeeps />} />
          <Route path ="/peeps/day" element={<DayView />} />
          <Route path ="/peeps/find" element={<FindFriend />} />
          <Route path ="/responses" element={<ComingToMine />} />
          <Route path ="/responses/joining" element={<Joining />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;


//Note there is a gap in the token process where we do not check if localstorage already has a token and skips the login page and goes straight to /day aka MyDay page. So current state a user has to log in everytime. 