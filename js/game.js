const SYMBOLS = ['🦊', '🦉', '🦌', '🐿️', '🍄', '🌲', '🍃', '🌙'];
const TOTAL_PAIRS = 8;
const MISMATCH_DELAY = 1000;

function shuffle(arr) {
  const list = arr.slice();
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

function createDeck() {
  const deck = [];
  SYMBOLS.forEach((symbol) => {
    deck.push({ symbol });
    deck.push({ symbol });
  });

  return shuffle(deck).map((item, index) => ({
    id: index,
    symbol: item.symbol,
    isFlipped: false,
    isMatched: false,
    button: null,
  }));
}

function createGame(handlers) {
  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let moves = 0;
  let pairsFound = 0;
  let isLocked = false;
  let isFinished = false;
  let mismatchTimer = null;

  function clearMismatchTimer() {
    if (mismatchTimer != null) {
      clearTimeout(mismatchTimer);
      mismatchTimer = null;
    }
  }

  function updateCard(card) {
    if (!card.button) return;
    const open = card.isFlipped || card.isMatched;
    card.button.classList.toggle('card--flipped', open);
    card.button.classList.toggle('card--matched', card.isMatched);
  }

  function startNewGame() {
    clearMismatchTimer();
    moves = 0;
    pairsFound = 0;
    firstCard = null;
    secondCard = null;
    isLocked = false;
    isFinished = false;
    cards = createDeck();
    handlers.onStats(moves, pairsFound);
    handlers.onBoard(cards, onCardClick);
  }

  function onCardClick(card) {
    if (isFinished || isLocked) return;
    if (card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    updateCard(card);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    if (firstCard.id === card.id) return;

    secondCard = card;
    moves += 1;
    handlers.onStats(moves, pairsFound);

    if (firstCard.symbol === secondCard.symbol) {
      firstCard.isMatched = true;
      secondCard.isMatched = true;
      updateCard(firstCard);
      updateCard(secondCard);
      pairsFound += 1;
      handlers.onStats(moves, pairsFound);
      firstCard = null;
      secondCard = null;

      if (pairsFound === TOTAL_PAIRS) {
        isFinished = true;
        handlers.onWin(moves);
      }
    } else {
      isLocked = true;
      const a = firstCard;
      const b = secondCard;

      mismatchTimer = setTimeout(() => {
        mismatchTimer = null;
        a.isFlipped = false;
        b.isFlipped = false;
        updateCard(a);
        updateCard(b);
        firstCard = null;
        secondCard = null;
        isLocked = false;
      }, MISMATCH_DELAY);
    }
  }

  return {
    startNewGame,
    updateCard,
  };
}
