import { createGame, TOTAL_PAIRS } from './game.js';
import { getScores, saveScore, formatDate } from './storage.js';

let movesEl;
let pairsEl;
let boardEl;
let modalOverlay;
let modalTitle;
let modalBody;
let modalActions;
let scoreSaved = false;
let game;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function clear(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function openModal(title, bodyNodes, buttons) {
  modalTitle.textContent = title;
  clear(modalBody);
  clear(modalActions);

  bodyNodes.forEach((node) => modalBody.append(node));

  buttons.forEach((item) => {
    const btn = el('button', item.className, item.text);
    btn.type = 'button';
    btn.addEventListener('click', item.onClick);
    modalActions.append(btn);
  });

  modalOverlay.hidden = false;
  document.body.classList.add('page--locked');
}

function closeModal() {
  if (modalOverlay.hidden) return;
  modalOverlay.hidden = true;
  document.body.classList.remove('page--locked');
}

function renderBoard(cards, onCardClick) {
  clear(boardEl);

  cards.forEach((card) => {
    const front = el('span', 'card__face card__face--front');
    const back = el('span', 'card__face card__face--back', card.symbol);
    const inner = el('span', 'card__inner');
    inner.append(front, back);

    const button = el('button', 'card');
    button.type = 'button';
    button.append(inner);
    button.addEventListener('click', () => onCardClick(card));

    card.button = button;
    game.updateCard(card);
    boardEl.append(button);
  });
}

function openVictoryModal(moves) {
  openModal(
    'Победа!',
    [
      el('p', 'modal__text', 'Поздравляем! Вы нашли все пары.'),
      el('p', 'modal__result', 'Ходов: ' + moves),
    ],
    [
      {
        text: 'Новая игра',
        className: 'btn btn--primary',
        onClick: startNewGame,
      },
      {
        text: 'Закрыть',
        className: 'btn btn--secondary',
        onClick: closeModal,
      },
    ]
  );
}

function openLeaderboard() {
  const scores = getScores().slice().sort((a, b) => {
    if (a.moves !== b.moves) return a.moves - b.moves;
    return new Date(a.date) - new Date(b.date);
  });

  const body = [];

  if (scores.length === 0) {
    body.push(el('p', 'modal__text', 'Пока нет результатов'));
  } else {
    const table = el('table', 'leaderboard');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Место', 'Ходы', 'Дата'].forEach((label) => {
      headRow.append(el('th', 'leaderboard__cell leaderboard__cell--head', label));
    });
    thead.append(headRow);

    const tbody = document.createElement('tbody');
    scores.forEach((score, index) => {
      const row = document.createElement('tr');
      row.append(
        el('td', 'leaderboard__cell', String(index + 1)),
        el('td', 'leaderboard__cell', String(score.moves)),
        el('td', 'leaderboard__cell', formatDate(score.date))
      );
      tbody.append(row);
    });

    table.append(thead, tbody);
    body.push(table);
  }

  openModal('Таблица лидеров', body, [
    {
      text: 'Закрыть',
      className: 'btn btn--secondary',
      onClick: closeModal,
    },
  ]);
}

function createModal() {
  modalOverlay = el('div', 'modal');
  modalOverlay.hidden = true;

  const dialog = el('div', 'modal__dialog');
  modalTitle = el('h2', 'modal__title');
  modalBody = el('div', 'modal__body');
  modalActions = el('div', 'modal__actions');

  dialog.append(modalTitle, modalBody, modalActions);
  modalOverlay.append(dialog);

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  dialog.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalOverlay.hidden) {
      closeModal();
    }
  });

  return modalOverlay;
}

function startNewGame() {
  closeModal();
  scoreSaved = false;
  game.startNewGame();
}

function buildPage() {
  const app = el('div', 'app');

  const header = el('header', 'header');
  header.append(el('h1', 'header__title', 'Memory Game'));

  const actions = el('div', 'header__actions');
  const newGameBtn = el('button', 'btn btn--primary', 'Новая игра');
  newGameBtn.type = 'button';
  newGameBtn.addEventListener('click', startNewGame);

  const leadersBtn = el('button', 'btn btn--ghost', 'Таблица лидеров');
  leadersBtn.type = 'button';
  leadersBtn.addEventListener('click', openLeaderboard);

  actions.append(newGameBtn, leadersBtn);
  header.append(actions);

  const stats = el('section', 'stats');
  const movesBox = el('div', 'stats__item');
  movesBox.append(el('span', 'stats__label', 'Ходы:'));
  movesEl = el('span', 'stats__value', '0');
  movesBox.append(movesEl);

  const pairsBox = el('div', 'stats__item');
  pairsBox.append(el('span', 'stats__label', 'Пары:'));
  pairsEl = el('span', 'stats__value', '0 из 8');
  pairsBox.append(pairsEl);

  stats.append(movesBox, pairsBox);

  boardEl = el('div', 'board');

  const main = el('main', 'app__main');
  main.append(stats, boardEl);

  app.append(header, main);
  document.body.append(app, createModal());

  game = createGame({
    onStats(moves, pairsFound) {
      movesEl.textContent = String(moves);
      pairsEl.textContent = pairsFound + ' из ' + TOTAL_PAIRS;
    },
    onBoard: renderBoard,
    onWin(moves) {
      if (!scoreSaved) {
        saveScore(moves);
        scoreSaved = true;
      }
      openVictoryModal(moves);
    },
  });

  startNewGame();
}

buildPage();
