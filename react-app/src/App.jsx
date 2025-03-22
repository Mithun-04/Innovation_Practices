import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./Components/LoginForm";
import NavBar from "./Components/NavBar";
import HomePage from "./Components/HomePage";
import NewProd from "./Components/NewProd";
import Viewprod from "./Components/viewprod";
import Profile from "./Components/profile";
import "./App.css";


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
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;