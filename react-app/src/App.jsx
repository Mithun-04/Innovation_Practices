import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./Components/LoginForm";
import NavBar from "./Components/NavBar";
import HomePage from "./Components/HomePage";
import NewProd from "./Components/NewProd";
import Viewprod from "./Components/viewprod";
import Profile from "./Components/profile";
import ProductTrackingFilter from "./Components/filter";
import "./App.css";
import StatusUpdate from "./Components/StatusUpdate";


const App = () => {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <div className="mid">
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/newprod" element={<NewProd/>} />
            <Route path="/viewprod" element={<Viewprod />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/filter" element={<ProductTrackingFilter />} />

            <Route path="/status-update/:internalPO" element={<StatusUpdate />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;