import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import AppContainer from './components/AppContainer';
import InputNotes from './pages/InputNotes';
import Roadmap from './pages/Roadmap';

function App() {

  return (
    <Routes>
      <Route path='/' element={<AppContainer />} >
        <Route index path='/' element={<Home />} />
        <Route index path='/inputNotes' element={<InputNotes />} />
        <Route index path='/roadmap' element={<Roadmap />} />
      </Route>
    </Routes>
  )
}

export default App
