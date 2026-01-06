
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import OnCourse from './views/OnCourse';
import Merch from './views/Merch';
import Tournaments from './views/Tournaments';
import Wallet from './views/Wallet';
import TournamentSetup from './views/TournamentSetup';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/on-course" element={<OnCourse />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournament-setup" element={<TournamentSetup />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/merch" element={<Merch />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
