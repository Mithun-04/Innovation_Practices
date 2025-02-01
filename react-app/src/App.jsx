import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./Components/LoginForm";
import NavBar from "./Components/NavBar";
import HomePage from "./Components/HomePage";
import NewProd from "./Components/NewProd";
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
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;