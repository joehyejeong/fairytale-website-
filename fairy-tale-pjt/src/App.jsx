import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Name from './pages/Name/Name';
import CreateStory from './pages/CreateStory/CreateStory';
import CreatePlot from './pages/CreatePlot/CreatePlot';
import CreateImage from './pages/CreateImage/CreateImage';
import PrePlot from './pages/PrePlot/PrePlot';

function App() {
  return (
    <Router>
      <div className="w-screen h-screen overflow-hidden">
        <Layout>
          <Routes>
            <Route path="/" element={<Name />} />
            <Route path="/create-story" element={<CreateStory />} />
            <Route path="/create-plot" element={<CreatePlot />} />
            <Route path="/create-image" element={<CreateImage />} />
            <Route path="/pre-plot" element={<PrePlot />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;