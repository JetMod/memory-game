# Memory Game

Простая игра на поиск пар. На поле 16 карточек (8 пар) — нужно найти все совпадения за минимум ходов.

Сделано для задания RS School: https://github.com/rolling-scopes-school/tasks/tree/master/tasks/memory-game

## Как запустить

Нужен локальный сервер, потому что подключены ES modules:

```bash
python3 -m http.server 5500
```

Потом открыть в браузере: http://localhost:5500

## Что внутри

- `index.html` — пустой body, всё собирается через JS
- `css/style.css` — стили (BEM)
- `js/game.js` — логика игры
- `js/storage.js` — таблица лидеров в localStorage
- `js/app.js` — интерфейс и модалки

Стек: HTML, CSS, JS без библиотек.
