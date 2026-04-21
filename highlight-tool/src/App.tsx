
import { useState } from 'react';
import './App.css';

type Highlight = {
  timestamp: number;
  description: string;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

function App() {
  const [timerRunning, setTimerRunning] = useState(false);
  // Removed unused startTime state
  const [elapsed, setElapsed] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [showDescPrompt, setShowDescPrompt] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [descInput, setDescInput] = useState('');

  // Timer logic
  const startTimer = () => {
    if (!timerRunning) {
      const now = Date.now();
      setElapsed(0);
      setHighlights([]);
      setTimerRunning(true);
      const id = window.setInterval(() => {
        setElapsed(Date.now() - now);
      }, 200);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      if (intervalId) window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleHighlight = () => {
    if (timerRunning) {
      setPendingTimestamp(elapsed);
      setShowDescPrompt(true);
      setDescInput('');
    }
  };

  const saveHighlight = () => {
    if (pendingTimestamp !== null && descInput.trim()) {
      setHighlights([...highlights, { timestamp: pendingTimestamp, description: descInput.trim() }]);
      setShowDescPrompt(false);
      setPendingTimestamp(null);
      setDescInput('');
    }
  };

  const cancelHighlight = () => {
    setShowDescPrompt(false);
    setPendingTimestamp(null);
    setDescInput('');
  };

  // CSV Export
  const exportCSV = () => {
    const date = new Date();
    const sessionDate = date.toISOString();
    let csv = `Session Name,${sessionName}\nDate,${sessionDate}\n\nTimestamp,Description\n`;
    highlights.forEach(h => {
      csv += `${formatTime(h.timestamp)},"${h.description.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionName || 'session'}-${date.toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="timer-app">
      <h1>Session Highlight Timer</h1>
      <div className="timer-display">{formatTime(elapsed)}</div>
      <div className="controls">
        <button className="btn-start" onClick={startTimer} disabled={timerRunning}>Start</button>
        <button className="btn-stop" onClick={stopTimer} disabled={!timerRunning}>Stop</button>
        <button className="btn-highlight" onClick={handleHighlight} disabled={!timerRunning}>Highlight</button>
      </div>
      <div className="session-name">
        <label>
          Session Name: <input value={sessionName} onChange={e => setSessionName(e.target.value)} />
        </label>
      </div>
      <div className="highlights-list">
        <h2>Highlights</h2>
        <ul>
          {highlights.map((h, i) => (
            <li key={i}><b>{formatTime(h.timestamp)}</b>: {h.description}</li>
          ))}
        </ul>
      </div>
      <button className="btn-save" onClick={exportCSV} disabled={timerRunning || highlights.length === 0}>Export CSV</button>

      {showDescPrompt && (
        <div className="desc-prompt">
          <div>
            <label>
              Description for {formatTime(pendingTimestamp ?? 0)}:
              <input
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
                autoFocus
              />
            </label>
          </div>
          <div className="desc-actions">
            <button className="btn-save" onClick={saveHighlight} disabled={!descInput.trim()}>Save</button>
            <button className="btn-cancel" onClick={cancelHighlight}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
