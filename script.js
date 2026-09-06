(() => {
  "use strict";

  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;

  const WORDS = [
    "apple", "brave", "chair", "delta", "eagle", "flame", "grape", "house",
    "input", "joker", "knife", "lemon", "mango", "night", "ocean", "piano",
    "queen", "river", "stone", "table", "unity", "value", "world", "youth",
    "zebra", "beach", "cloud", "dream", "earth", "field", "green", "heart",
    "image", "jelly", "koala", "light", "music", "novel", "olive", "peace",
  ];

  const KEY_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  const boardEl = document.getElementById("board");
  const keyboardEl = document.getElementById("keyboard");
  const statusEl = document.getElementById("status");
  const announcerEl = document.getElementById("sr-announcer");
  const newGameBtn = document.getElementById("new-game-btn");
  const howToBtn = document.getElementById("how-to-btn");
  const howToPanel = document.getElementById("how-to-panel");

  let answer = "";
  let currentGuess = "";
  let guesses = [];
  let gameOver = false;
  const keyStates = {};

  function pickWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function announce(message) {
    announcerEl.textContent = "";
    window.requestAnimationFrame(() => {
      announcerEl.textContent = message;
    });
  }

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function buildBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < MAX_GUESSES; r++) {
      const row = document.createElement("div");
      row.className = "board-row";
      row.setAttribute("role", "row");
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.setAttribute("role", "gridcell");
        tile.setAttribute("id", `tile-${r}-${c}`);
        tile.setAttribute("aria-label", "空白");
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    KEY_ROWS.forEach((rowKeys) => {
      const row = document.createElement("div");
      row.className = "keyboard-row";
      rowKeys.forEach((key) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "key";
        btn.dataset.key = key;
        if (key === "ENTER" || key === "BACKSPACE") {
          btn.classList.add("wide");
          btn.textContent = key === "ENTER" ? "確定" : "削除";
          btn.setAttribute(
            "aria-label",
            key === "ENTER" ? "確定（Enter）" : "1文字削除（Backspace）"
          );
        } else {
          btn.textContent = key;
        }
        btn.addEventListener("click", () => handleKey(key));
        keyboardEl.appendChild(btn);
        row.appendChild(btn);
      });
      keyboardEl.appendChild(row);
    });
  }

  function updateBoardRow(rowIndex) {
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.getElementById(`tile-${rowIndex}-${c}`);
      const char = currentGuess[c] || "";
      tile.textContent = char;
      tile.setAttribute("aria-label", char ? char.toUpperCase() : "空白");
    }
  }

  function evaluateGuess(guess) {
    const result = new Array(WORD_LENGTH).fill("absent");
    const answerChars = answer.split("");
    const guessChars = guess.split("");
    const used = new Array(WORD_LENGTH).fill(false);

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] === "correct") continue;
      const idx = answerChars.findIndex(
        (ch, j) => ch === guessChars[i] && !used[j]
      );
      if (idx !== -1) {
        result[i] = "present";
        used[idx] = true;
      }
    }

    return result;
  }

  const STATE_LABEL = { correct: "正解", present: "含まれる", absent: "含まれない" };
  const STATE_MARK = { correct: "✓", present: "〜", absent: "✗" };
  const STATE_RANK = { absent: 0, present: 1, correct: 2 };

  function renderEvaluatedRow(rowIndex, guess, result) {
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.getElementById(`tile-${rowIndex}-${c}`);
      const state = result[c];
      const char = guess[c].toUpperCase();
      tile.classList.add(state);
      tile.innerHTML = "";
      const letterSpan = document.createElement("span");
      letterSpan.textContent = char;
      const markSpan = document.createElement("span");
      markSpan.className = "mark";
      markSpan.setAttribute("aria-hidden", "true");
      markSpan.textContent = STATE_MARK[state];
      tile.appendChild(letterSpan);
      tile.appendChild(markSpan);
      tile.setAttribute("aria-label", `${char}: ${STATE_LABEL[state]}`);

      const prevRank = STATE_RANK[keyStates[char]] ?? -1;
      if (STATE_RANK[state] > prevRank) {
        keyStates[char] = state;
      }
    }
    updateKeyboardStates();
  }

  function updateKeyboardStates() {
    const buttons = keyboardEl.querySelectorAll(".key");
    buttons.forEach((btn) => {
      const key = btn.dataset.key;
      const state = keyStates[key];
      btn.classList.remove("correct", "present", "absent");
      if (state) {
        btn.classList.add(state);
        btn.setAttribute("aria-label", `${key}: ${STATE_LABEL[state]}`);
      }
    });
  }

  function handleKey(key) {
    if (gameOver) return;

    if (key === "ENTER") {
      submitGuess();
      return;
    }

    if (key === "BACKSPACE") {
      currentGuess = currentGuess.slice(0, -1);
      updateBoardRow(guesses.length);
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      currentGuess += key.toLowerCase();
      updateBoardRow(guesses.length);
    }
  }

  function submitGuess() {
    if (currentGuess.length < WORD_LENGTH) {
      setStatus(`あと${WORD_LENGTH - currentGuess.length}文字入力してください。`);
      announce("文字数が足りません。");
      return;
    }

    const result = evaluateGuess(currentGuess);
    renderEvaluatedRow(guesses.length, currentGuess, result);
    guesses.push(currentGuess);

    const isWin = result.every((r) => r === "correct");

    if (isWin) {
      gameOver = true;
      const msg = `正解です！ ${guesses.length}回目で当てました。`;
      setStatus(msg);
      announce(msg);
      return;
    }

    if (guesses.length >= MAX_GUESSES) {
      gameOver = true;
      const msg = `残念、正解は「${answer.toUpperCase()}」でした。`;
      setStatus(msg);
      announce(msg);
      return;
    }

    setStatus(`${guesses.length}/${MAX_GUESSES}回目。次の単語を入力してください。`);
    announce(`推測${guesses.length}回目を確定しました。`);
    currentGuess = "";
  }

  function startNewGame() {
    answer = pickWord();
    currentGuess = "";
    guesses = [];
    gameOver = false;
    Object.keys(keyStates).forEach((k) => delete keyStates[k]);
    buildBoard();
    updateKeyboardStates();
    setStatus("5文字の英単語を推測してください。1文字目から入力できます。");
    announce("新しいゲームを開始しました。");
  }

  document.addEventListener("keydown", (e) => {
    if (howToPanel && !howToPanel.hidden) return;
    const key = e.key;
    if (key === "Enter") {
      handleKey("ENTER");
    } else if (key === "Backspace") {
      handleKey("BACKSPACE");
    } else if (/^[a-zA-Z]$/.test(key)) {
      handleKey(key.toUpperCase());
    }
  });

  newGameBtn.addEventListener("click", startNewGame);

  howToBtn.addEventListener("click", () => {
    const isHidden = howToPanel.hidden;
    howToPanel.hidden = !isHidden;
    howToBtn.setAttribute("aria-expanded", String(isHidden));
  });

  buildKeyboard();
  startNewGame();
})();
