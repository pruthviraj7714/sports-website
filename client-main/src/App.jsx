import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import Home from './Components/Home';
import AddPlayer from './Components/AddPlayer';
import Matches from './Components/Matches'; // New import
import PlayersPage from './Components/PlayersPage';
import AddMatch from './Components/AddMatch';
import EditMatchPage from './Components/EditMatchPage';

function App() {
  return (
    <Router>
      <div className='flex flex-col'>
        <Header />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/addplayer' element={<AddPlayer/>} />
          <Route path='/matches' element={<Matches/>} />
          <Route path='/clubs/:clubId/players' element={<PlayersPage/>} /> 
          <Route path='/matches/add' element={<AddMatch/>} />
          <Route path='/match/edit/:matchId' element={<EditMatchPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App