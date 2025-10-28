import React from 'react';
import './App.css';
import Items from './components/Items';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Items Management System</h1>
        <p className="App-subtitle">Take-Home Assessment - Optimized with Virtualization</p>
      </header>
      <main className="App-main">
        <Items />
      </main>
    </div>
  );
}

export default App;

