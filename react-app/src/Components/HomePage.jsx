
import './HomePage.css';
import { FaUser} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import filterIcon from "../assets/fil.png"; 


function HomePage() {

  const navigate = useNavigate();
  return (
    <div>
      <div className="home">
          <button className="create" onClick={() => navigate("/newprod")}>
              CREATE NEW PRODUCT
          </button>

          <button className="view" onClick={() => navigate("/viewprod")}>
              VIEW PRODUCTS
          </button>
      </div>
      <div>
          <button className='profile' onClick={()=> navigate("/profile")}>
              <FaUser className="icon" />
              MY PROFILE
          </button>
      </div>
      <div>
          <button className='filter' onClick={()=> navigate("/filter")}>
              <img src={filterIcon} alt="Filter Icon" className="filter-icon"/>
              FILTER PRODUCTS
          </button>
      </div>
    </div>
  );
}

export default HomePage;