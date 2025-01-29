import LoginForm from './Components/LoginForm';
import NavBar from './Components/NavBar';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
        <NavBar />
        <div className='mid'>
          <LoginForm className="login" />
        </div>
    
    </div>
  );
}

export default App;

