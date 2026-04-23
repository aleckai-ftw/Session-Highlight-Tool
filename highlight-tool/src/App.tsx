
import { useState, useEffect } from 'react';
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

const STORAGE_KEY_START = 'timerStartTime';
const STORAGE_KEY_HIGHLIGHTS = 'timerHighlights';
const STORAGE_KEY_SESSION = 'timerSessionName';

function readStartTime(): number | null {
  const v = sessionStorage.getItem(STORAGE_KEY_START);
  return v ? parseInt(v, 10) : null;
}

function App() {
  const [timerRunning, setTimerRunning] = useState(() => readStartTime() !== null);
  const [elapsed, setElapsed] = useState(() => {
    const t = readStartTime();
    return t !== null ? Date.now() - t : 0;
  });
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    const v = sessionStorage.getItem(STORAGE_KEY_HIGHLIGHTS);
    return v ? JSON.parse(v) : [];
  });
  const [sessionName, setSessionName] = useState(
    () => sessionStorage.getItem(STORAGE_KEY_SESSION) ?? ''
  );
  const [showDescPrompt, setShowDescPrompt] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [descInput, setDescInput] = useState('');

  // Re-attach interval on mount if timer was already running
  useEffect(() => {
    const t = readStartTime();
    if (t !== null) {
      const id = window.setInterval(() => setElapsed(Date.now() - t), 200);
      setIntervalId(id);
      return () => window.clearInterval(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist highlights and session name whenever they change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_HIGHLIGHTS, JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_SESSION, sessionName);
  }, [sessionName]);

  // Timer logic
  const startTimer = () => {
    if (!timerRunning) {
      const now = Date.now();
      sessionStorage.setItem(STORAGE_KEY_START, now.toString());
      sessionStorage.setItem(STORAGE_KEY_HIGHLIGHTS, JSON.stringify([]));
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
      sessionStorage.removeItem(STORAGE_KEY_START);
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
          <div className="desc-card">
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
        </div>
      )}
    </div>
  );
}

export default App;
