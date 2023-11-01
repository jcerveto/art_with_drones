import logo from './logo.svg';
import './App.css';

import { Home } from './Home';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Art with drones</h1>
      </header>

      <Home />

      <footer>
        <p>© 2023 Art with drones</p>
        <p>SD - Sistemas Distribuidos - UA - Univeritat d'Alacant</p>
        <p>Joan Cerveto Serrano</p>
      </footer>
    </div>
  );
}

export default App;
