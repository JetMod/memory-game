const STORAGE_KEY = 'memory-game-scores';

export function getScores() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export function saveScore(moves) {
  const scores = getScores();
  scores.push({
    moves,
    date: new Date().toISOString(),
  });

  scores.sort((a, b) => {
    if (a.moves !== b.moves) return a.moves - b.moves;
    return new Date(a.date) - new Date(b.date);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
}

export function formatDate(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return day + '.' + month + '.' + d.getFullYear();
}
