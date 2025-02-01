
import './HomePage.css';
import { FaUser} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function HomePage() {

  const navigate = useNavigate();
  return (
    <div>
      <div className="home">
          <button className="create" onClick={() => navigate("/newprod")}>
              CREATE NEW PRODUCT
          </button>

          <button className="view">
              VIEW PRODUCTS
          </button>
      </div>
      <div>
          <button className='profile'>
              <FaUser className="icon" />
              MY PROFILE
          </button>
      </div>
    </div>
  );
}

export default HomePage;