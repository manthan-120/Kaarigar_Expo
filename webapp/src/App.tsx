import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Visitor from "./pages/Visitor";
import Kaarigar from "./pages/Kaarigar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Logged-in user */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Role dashboards - we'll build these next */}
        <Route
          path="/visitor"
          element={<Visitor/>}
        />

        <Route
          path="/kaarigar"
          element={<Kaarigar/>}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;