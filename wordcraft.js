// ---------------------------------
// Constants & Globals
// ---------------------------------
const NUM_ROWS = 15, NUM_COLS = 15;
const directions = [
  { dr: 0, dc: 1, name: 'H' },
  { dr: 1, dc: 0, name: 'V' }
];
let boardData = [];
let players = [];
let currentPlayerIndex = 0;
const awardedWords = new Set();
let gameMode = "multiplayer";       // or "singleplayer"
let computerDifficulty = "beginner"; // updated from selection

// ---------------------------------
// DOM References
// ---------------------------------
const setupForm           = document.getElementById('setupForm');
const singlePlayerForm    = document.getElementById('singlePlayerForm');
const numPlayersInput     = document.getElementById('numPlayers');
const playerNamesDiv      = document.getElementById('playerNames');
const playerSetupDiv      = document.getElementById('playerSetup');
const gameDiv             = document.getElementById('game');
const boardDiv            = document.getElementById('board');
const scoreTableDiv       = document.getElementById('scoreTable');
const meaningGreetingDiv  = document.getElementById('meaningGreeting');
const meaningBoxDiv       = document.getElementById('meaningBox');
const currentPlayerDisplay= document.getElementById('currentPlayerDisplay');
const messageDiv          = document.getElementById('message');
const rulesOverlay        = document.getElementById('rulesOverlay');
const startGameButton     = document.getElementById('startGameButton');
const highScoreBox        = document.getElementById('highScoreBox');
const endGameButton       = document.getElementById('endGameButton');
const resetGameButton     = document.getElementById('resetGameButton');
const saveGameButton      = document.getElementById('saveGameButton');
const resumeGameButton    = document.getElementById('resumeGameButton');
const voiceSelect         = document.getElementById('voiceSelect');
const singlePlayerBtn     = document.getElementById('singlePlayerBtn');
const multiPlayerBtn      = document.getElementById('multiPlayerBtn');
const singlePlayerSetupDiv= document.getElementById('singlePlayerSetup');

// ---------------------------------
// Populate Speech Synthesis Voices
// ---------------------------------
function populateVoices() {
  const voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}
speechSynthesis.onvoiceschanged = populateVoices;
populateVoices();

// ---------------------------------
// Supported Languages for Translation
// ---------------------------------
const languageOptions = [
  { code: "hi", name: "Hindi" },
  { code: "pa", name: "Punjabi" },
  { code: "fr", name: "French" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "bn", name: "Bengali" },
  { code: "fa", name: "Persian" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "el", name: "Greek" }
].sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------
// High Score Box (localStorage)
// ---------------------------------
function updateHighScoreBox() {
  try {
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      const { name, score } = JSON.parse(storedHighScore);
      highScoreBox.innerHTML = `HIGHEST SCORER:<br>${name}<br>${score}`;
    } else {
      highScoreBox.innerHTML = `<em>No previous game recorded.</em>`;
    }
  } catch (e) {
    console.error("Error reading high score:", e);
    highScoreBox.innerHTML = `<em>Error loading high score.</em>`;
  }
}
updateHighScoreBox();

// ---------------------------------
// Show “Resume” if a saved game exists
// ---------------------------------
function checkForSavedGame() {
  if (localStorage.getItem("savedGameState")) {
    resumeGameButton.style.display = "inline-block";
  }
}
checkForSavedGame();

// ---------------------------------
// Mode Selection Handlers
// ---------------------------------
singlePlayerBtn.addEventListener('click', () => {
  gameMode = "singleplayer";
  document.getElementById('modeSelection').style.display = "none";
  setupForm.style.display = "none";
  singlePlayerSetupDiv.style.display = "block";
});
multiPlayerBtn.addEventListener('click', () => {
  gameMode = "multiplayer";
  document.getElementById('modeSelection').style.display = "none";
  singlePlayerSetupDiv.style.display = "none";
  setupForm.style.display = "block";
});

// ---------------------------------
// Single Player Setup Submission
// ---------------------------------
singlePlayerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const playerName = document.getElementById('singlePlayerName').value.trim() || "Player 1";
  computerDifficulty = document.getElementById('difficultySelect').value;
  players = [
    { name: playerName, color: "#0000FF", lang: "en", score: 0 },
    { name: "Computer", color: "#FF0000", lang: "en", score: 0, isComputer: true }
  ];
  playerSetupDiv.style.display = 'none';
  rulesOverlay.style.display = 'block';
});

// ---------------------------------
// Multiplayer Setup: dynamic fields
// ---------------------------------
numPlayersInput.addEventListener('change', function() {
  const num = parseInt(this.value);
  playerNamesDiv.innerHTML = '';
  if (num >= 2 && num <= 4) {
    for (let i = 0; i < num; i++) {
      const container   = document.createElement('div');
      const nameLabel   = document.createElement('label');
      nameLabel.textContent = "Player " + (i + 1) + " Name:";
      const nameInput   = document.createElement('input');
      nameInput.type    = "text";
      nameInput.required= true;
      nameInput.id      = "playerName" + i;

      const colorLabel  = document.createElement('label');
      colorLabel.textContent = " Color:";
      const colorSelect = document.createElement('select');
      colorSelect.required  = true;
      colorSelect.id        = "playerColor" + i;
      const predefinedColors = [
        { name: "Red",    value: "#FF0000" },
        { name: "Purple", value: "#800080" },
        { name: "Green",  value: "#008000" },
        { name: "Blue",   value: "#0000FF" }
      ];
      predefinedColors.forEach(color => {
        const option = document.createElement('option');
        option.value       = color.value;
        option.textContent = color.name;
        colorSelect.appendChild(option);
      });

      const langLabel   = document.createElement('label');
      langLabel.textContent = " Preferred Language:";
      const langSelect  = document.createElement('select');
      langSelect.required   = true;
      langSelect.id         = "playerLang" + i;
      languageOptions.forEach(lang => {
        const option = document.createElement('option');
        option.value       = lang.code;
        option.textContent = lang.name;
        langSelect.appendChild(option);
      });

      container.appendChild(nameLabel);
      container.appendChild(nameInput);
      container.appendChild(colorLabel);
      container.appendChild(colorSelect);
      container.appendChild(langLabel);
      container.appendChild(langSelect);
      playerNamesDiv.appendChild(container);
    }
  }
});

// ---------------------------------
// Multiplayer Setup Submission
// ---------------------------------
setupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const num = parseInt(numPlayersInput.value);
  players = [];
  for (let i = 0; i < num; i++) {
    const name  = document.getElementById('playerName' + i).value.trim() || ("Player " + (i + 1));
    const color = document.getElementById('playerColor' + i).value || "#000000";
    const lang  = document.getElementById('playerLang' + i).value || "en";
    players.push({ name, color, lang, score: 0 });
  }
  playerSetupDiv.style.display = 'none';
  rulesOverlay.style.display = 'block';
});

// ---------------------------------
// “Let’s Play!” clicked → initialize game
// ---------------------------------
startGameButton.addEventListener('click', function() {
  rulesOverlay.style.display = 'none';
  gameDiv.style.display = 'block';
  initBoard();
  initScoreTable();
  updateCurrentPlayerDisplay();
  saveGameState();
  if (gameMode === "singleplayer" && players[currentPlayerIndex].isComputer) {
    computerMove();
  }
});

// ---------------------------------
// End Game: compute highest scorer
// ---------------------------------
endGameButton.addEventListener('click', endGame);
function endGame() {
  if (players.length > 0) {
    const highest = players.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
    try {
      localStorage.setItem("highScore", JSON.stringify({ name: highest.name, score: highest.score }));
    } catch (e) {
      console.error("Error saving high score:", e);
    }
  }
  gameDiv.style.display = 'none';
  playerSetupDiv.style.display = 'block';
  localStorage.removeItem("savedGameState");
  updateHighScoreBox();
}

// ---------------------------------
// Reset Game: clear board & scores
// ---------------------------------
resetGameButton.addEventListener('click', resetGame);
function resetGame() {
  awardedWords.clear();
  players.forEach(player => player.score = 0);
  currentPlayerIndex = 0;
  initBoard();
  initScoreTable();
  updateCurrentPlayerDisplay();
  meaningGreetingDiv.innerHTML = "";
  meaningBoxDiv.innerHTML = "";
  clearMessage();
  saveGameState();
}

// ---------------------------------
// Save Game State (localStorage)
// ---------------------------------
function saveGameState() {
  const boardState = boardData.map(row => row.map(cell => ({
    letter: cell.letter,
    bgColor: cell.bgColor || ""
  })));
  const state = {
    inGame: true,
    boardState,
    players,
    currentPlayerIndex,
    awardedWords: Array.from(awardedWords)
  };
  localStorage.setItem("savedGameState", JSON.stringify(state));
}

// ---------------------------------
// Resume Game (if saved state exists)
// ---------------------------------
function resumeGame() {
  const stateStr = localStorage.getItem("savedGameState");
  if (!stateStr) return;
  const state = JSON.parse(stateStr);
  players = state.players;
  currentPlayerIndex = state.currentPlayerIndex;
  awardedWords.clear();
  state.awardedWords.forEach(word => awardedWords.add(word));
  playerSetupDiv.style.display = 'none';
  rulesOverlay.style.display = 'none';
  gameDiv.style.display = 'block';
  initBoard(state.boardState);
  initScoreTable();
  updateCurrentPlayerDisplay();
}
resumeGameButton.addEventListener('click', resumeGame);

// ---------------------------------
// Initialize the 15×15 Board
// ---------------------------------
function initBoard(savedBoardState) {
  boardDiv.innerHTML = '';
  boardData = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    boardData[row] = [];
    for (let col = 0; col < NUM_COLS; col++) {
      const cellInput = document.createElement('input');
      cellInput.type = 'text';
      cellInput.maxLength = 1;
      cellInput.dataset.row = row;
      cellInput.dataset.col = col;

      if (savedBoardState && savedBoardState[row] && savedBoardState[row][col]) {
        const savedCell = savedBoardState[row][col];
        cellInput.value = savedCell.letter;
        if (savedCell.letter) {
          cellInput.disabled = true;
          cellInput.style.border = "3px solid " + players[currentPlayerIndex].color;
          if (savedCell.bgColor) {
            cellInput.style.backgroundColor = savedCell.bgColor;
          }
        }
      }

      cellInput.addEventListener('input', async function() {
        const r = parseInt(this.dataset.row);
        const c = parseInt(this.dataset.col);
        const val = this.value.toUpperCase();
        if (!/^[A-Z]$/.test(val)) {
          this.value = '';
          boardData[r][c].letter = '';
          return;
        }
        boardData[r][c].letter = val;
        this.style.border = "3px solid " + players[currentPlayerIndex].color;
        this.disabled = true;
        clearMessage();

        let wordAwarded = false;
        for (const dir of directions) {
          const block = getContiguousBlock(r, c, dir.dr, dir.dc);
          if (block.word.length < 2) continue;
          if (!awardedWords.has(block.word)) {
            try {
              const dictResultWhole = await checkDictionary(block.word);
              if (dictResultWhole.valid) {
                const pointsAwarded = block.word.length;
                players[currentPlayerIndex].score += pointsAwarded;
                awardedWords.add(block.word);
                for (const cell of block.cells) {
                  boardData[cell.row][cell.col].element.style.backgroundColor = players[currentPlayerIndex].color;
                  boardData[cell.row][cell.col].bgColor = players[currentPlayerIndex].color;
                }
                speakText(block.word, 'en-US');
                const translation = await getTranslation(dictResultWhole.meaning, players[currentPlayerIndex].lang);
                showScoreMessage(block.word, dictResultWhole, players[currentPlayerIndex].lang, translation, pointsAwarded, players[currentPlayerIndex].color, players[currentPlayerIndex].name);
                wordAwarded = true;
                break;
              }
            } catch (err) {
              console.error("Error during whole-word dictionary check:", err);
            }
          }
          if (!wordAwarded) {
            let newIdx = block.cells.findIndex(cell => cell.row == r && cell.col == c);
            if (newIdx === -1) newIdx = 0;
            outer: for (let len = block.word.length; len >= 2; len--) {
              for (let i = 0; i <= newIdx; i++) {
                let j = i + len - 1;
                if (j >= block.word.length) continue;
                if (i <= newIdx && newIdx <= j) {
                  const candidate = block.word.substring(i, j + 1);
                  if (awardedWords.has(candidate) || (candidate.endsWith('S') && awardedWords.has(candidate.slice(0, -1)))) {
                    continue;
                  }
                  try {
                    const dictResult = await checkDictionary(candidate);
                    if (dictResult.valid) {
                      if (candidate.endsWith('S')) {
                        const singular = candidate.slice(0, -1);
                        const singularResult = await checkDictionary(singular);
                        if (singularResult.valid) {
                          awardedWords.add(candidate);
                          showMessage(`Word "<strong>${candidate}</strong>" is considered the same as "<strong>${singular}</strong>" – No points awarded.`);
                          wordAwarded = true;
                          break outer;
                        }
                      }
                      const pointsAwarded = candidate.length;
                      players[currentPlayerIndex].score += pointsAwarded;
                      awardedWords.add(candidate);
                      for (let k = i; k <= j; k++) {
                        boardData[block.cells[k].row][block.cells[k].col].element.style.backgroundColor = players[currentPlayerIndex].color;
                        boardData[block.cells[k].row][block.cells[k].col].bgColor = players[currentPlayerIndex].color;
                      }
                      speakText(candidate, 'en-US');
                      const translation = await getTranslation(dictResult.meaning, players[currentPlayerIndex].lang);
                      showScoreMessage(candidate, dictResult, players[currentPlayerIndex].lang, translation, pointsAwarded, players[currentPlayerIndex].color, players[currentPlayerIndex].name);
                      wordAwarded = true;
                      break outer;
                    }
                  } catch (err) {
                    console.error("Error during dictionary check:", err);
                  }
                }
              }
            }
          }
          if (wordAwarded) break;
        }
        updateScoreTable();
        nextTurn();
        updateCurrentPlayerDisplay();
        saveGameState();
      });

      boardDiv.appendChild(cellInput);
      boardData[row][col] = {
        letter: (savedBoardState && savedBoardState[row] && savedBoardState[row][col]) ? savedBoardState[row][col].letter : '',
        element: cellInput,
        bgColor: (savedBoardState && savedBoardState[row] && savedBoardState[row][col]) ? savedBoardState[row][col].bgColor : ""
      };
    }
  }
}

// ---------------------------------
// Initialize Score Table
// ---------------------------------
function initScoreTable() {
  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  const scoreRow  = document.createElement('tr');

  players.forEach(player => {
    const th = document.createElement('th');
    th.textContent = player.name;
    th.style.backgroundColor = player.color;
    headerRow.appendChild(th);
    const td = document.createElement('td');
    td.textContent = player.score;
    scoreRow.appendChild(td);
  });

  table.appendChild(headerRow);
  table.appendChild(scoreRow);
  scoreTableDiv.innerHTML = '';
  scoreTableDiv.appendChild(table);
}

// ---------------------------------
// Update Score Table
// ---------------------------------
function updateScoreTable() {
  const table = scoreTableDiv.querySelector('table');
  if (!table) return;
  const scoreRow = table.rows[1];
  players.forEach((player, idx) => {
    scoreRow.cells[idx].textContent = player.score;
  });
}

// ---------------------------------
// Update Current Player Display
// ---------------------------------
function updateCurrentPlayerDisplay() {
  currentPlayerDisplay.textContent = `${players[currentPlayerIndex].name}'s turn`;
}

// ---------------------------------
// Next Turn
// ---------------------------------
function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateCurrentPlayerDisplay();
  saveGameState();
  if (gameMode === "singleplayer" && players[currentPlayerIndex].isComputer) {
    computerMove();
  }
}

// ---------------------------------
// Computer Move (Single Player)
// ---------------------------------
async function computerMove() {
  let candidateCells = [];
  for (let r = 0; r < NUM_ROWS; r++) {
    for (let c = 0; c < NUM_COLS; c++) {
      if (!boardData[r][c].letter) {
        if ((r > 0 && boardData[r - 1][c].letter) ||
            (r < NUM_ROWS - 1 && boardData[r + 1][c].letter) ||
            (c > 0 && boardData[r][c - 1].letter) ||
            (c < NUM_COLS - 1 && boardData[r][c + 1].letter)) {
          candidateCells.push({ r, c });
        }
      }
    }
  }
  if (candidateCells.length === 0) {
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        if (!boardData[r][c].letter) {
          candidateCells.push({ r, c });
        }
      }
    }
  }
  candidateCells.sort(() => Math.random() - 0.5);

  const letterDistribution = "ETAOINSHRDLCUMWFGYPBVKJXQZ";
  if (computerDifficulty === 'beginner' && Math.random() < 0.5) {
    const randomCell   = candidateCells[Math.floor(Math.random() * candidateCells.length)];
    const randomLetter = letterDistribution[Math.floor(Math.random() * letterDistribution.length)];
    makeComputerMove(randomCell, randomLetter);
    return;
  }

  const lettersToTry = (computerDifficulty === 'beginner')
                       ? letterDistribution.slice(0, 5)
                       : letterDistribution;

  for (let cell of candidateCells) {
    for (let letter of lettersToTry) {
      boardData[cell.r][cell.c].letter = letter;
      let validCandidate = false;
      for (let dir of directions) {
        const block = getContiguousBlock(cell.r, cell.c, dir.dr, dir.dc);
        if (block.word.length >= 2) {
          const dictResult = await checkDictionary(block.word);
          if (dictResult.valid) {
            validCandidate = true;
            break;
          }
        }
      }
      boardData[cell.r][cell.c].letter = "";
      if (validCandidate) {
        makeComputerMove(cell, letter);
        return;
      }
    }
  }

  const randomCell   = candidateCells[Math.floor(Math.random() * candidateCells.length)];
  const randomLetter = letterDistribution[Math.floor(Math.random() * letterDistribution.length)];
  makeComputerMove(randomCell, randomLetter);
}

function makeComputerMove(cell, letter) {
  let delay;
  if (computerDifficulty === 'beginner')    delay = 2000;
  else if (computerDifficulty === 'intermediate') delay = 1500;
  else if (computerDifficulty === 'advanced')     delay = 1000;

  setTimeout(() => {
    const cellElement = boardData[cell.r][cell.c].element;
    cellElement.value = letter;
    cellElement.dispatchEvent(new Event('input'));
  }, delay);
}

// ---------------------------------
// Get Contiguous Block in a Direction
// ---------------------------------
function getContiguousBlock(r, c, dr, dc) {
  let startRow = r, startCol = c;
  while (true) {
    const prevRow = startRow - dr;
    const prevCol = startCol - dc;
    if (prevRow < 0 || prevRow >= NUM_ROWS || prevCol < 0 || prevCol >= NUM_COLS) break;
    if (!boardData[prevRow][prevCol].letter) break;
    startRow = prevRow;
    startCol = prevCol;
  }
  let word = "";
  const cells = [];
  let curRow = startRow, curCol = startCol;
  while (curRow >= 0 && curRow < NUM_ROWS && curCol >= 0 && curCol < NUM_COLS) {
    const letter = boardData[curRow][curCol].letter;
    if (!letter) break;
    word += letter;
    cells.push({ row: curRow, col: curCol });
    curRow += dr;
    curCol += dc;
  }
  return { startRow, startCol, word, cells };
}

// ---------------------------------
// Dictionary API Check (English)
// ---------------------------------
async function checkDictionary(word) {
  const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word.toLowerCase();
  const response = await fetch(url);
  if (!response.ok) {
    return { valid: false };
  }
  const data = await response.json();
  let result = {
    valid: true,
    meaning: "No definition available.",
    origin: "Not available",
    phonetic: "Not available",
    usage: "Not available",
    noun: "Not available",
    verb: "Not available",
    adjective: "Not available",
    derived: "Not available",
    history: "Not available"
  };
  try {
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      if (entry.meanings && entry.meanings.length > 0) {
        const defObj = entry.meanings[0].definitions[0];
        if (defObj && defObj.definition) {
          result.meaning = defObj.definition;
          if (result.meaning.toLowerCase().includes("abbreviation")) {
            return { valid: false };
          }
          result.usage = defObj.example || "Not available";
        }
        entry.meanings.forEach(m => {
          if (m.partOfSpeech === "noun" && m.definitions.length > 0 && m.definitions[0].example) {
            result.noun = m.definitions[0].example;
          }
          if (m.partOfSpeech === "verb" && m.definitions.length > 0 && m.definitions[0].example) {
            result.verb = m.definitions[0].example;
          }
          if (m.partOfSpeech === "adjective" && m.definitions.length > 0 && m.definitions[0].example) {
            result.adjective = m.definitions[0].example;
          }
        });
      }
      if (entry.origin) {
        result.origin = entry.origin;
      }
      if (entry.phonetics && entry.phonetics.length > 0 && entry.phonetics[0].text) {
        result.phonetic = entry.phonetics[0].text;
      }
    }
  } catch (e) {
    console.error("Error parsing dictionary data:", e);
  }
  return result;
}

// ---------------------------------
// Get Translation using MyMemory API
// ---------------------------------
async function getTranslation(text, targetLang) {
  const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=en|" + targetLang;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (e) {
    console.error("Translation error:", e);
  }
  return "Translation not available.";
}

// ---------------------------------
// Show Detailed Meaning Box
// ---------------------------------
function showScoreMessage(word, dictResult, targetLangCode, translatedMeaning, pointsAwarded, playerColor, formingPlayer) {
  const targetLangObj = languageOptions.find(lang => lang.code === targetLangCode);
  const targetLangName = targetLangObj ? targetLangObj.name : targetLangCode.toUpperCase();
  const safeEnglish     = dictResult.meaning.replace(/'/g, "\\'");
  const safeTranslation = translatedMeaning.replace(/'/g, "\\'");
  const englishSpeaker  = `<span class="speaker" onclick="speakText('${safeEnglish}', 'en-US')">🔊</span>`;
  const targetSpeaker   = `<span class="speaker" onclick="speakText('${safeTranslation}', '${targetLangCode}')">🔊</span>`;
  meaningGreetingDiv.innerHTML = `Hey ${formingPlayer}! You found a great word!`;
  const meaningBoxHTML = 
      `<div align="left" style="font-size:20px; font-weight:bold; margin-bottom:8px;">
         Word Formed: ${word} – ${dictResult.phonetic} – Score: ${pointsAwarded} points
       <div>${englishSpeaker} English Meaning: ${dictResult.meaning}</div>
       <div>${targetSpeaker} ${targetLangName} Meaning: ${translatedMeaning}</div>
       <div><strong>Origin:</strong> ${dictResult.origin}</div>
       <div><strong>Usage:</strong> ${dictResult.usage}</div>
       <div><strong>Noun:</strong> ${dictResult.noun}</div>
       <div><strong>Verb:</strong> ${dictResult.verb}</div>
       <div><strong>Adjective:</strong> ${dictResult.adjective}</div>
       <div><strong>Derived Words:</strong> Not available</div>
       <div><strong>Word History:</strong> Not available</div>
       </div>`;
  meaningBoxDiv.innerHTML = meaningBoxHTML;
}

// ---------------------------------
// Show Generic Message
// ---------------------------------
function showMessage(text) {
  messageDiv.innerHTML = text;
  messageDiv.style.display = 'block';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

// ---------------------------------
// Clear Generic Message
// ---------------------------------
function clearMessage() {
  messageDiv.innerHTML = "";
  messageDiv.style.display = 'none';
}

// ---------------------------------
// Speak Text (SpeechSynthesis API)
// ---------------------------------
function speakText(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoiceName = voiceSelect.value;
  const voices = speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.name === selectedVoiceName);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}
window.speakText = speakText;

// ---------------------------------
// Save Game Button Listener
// ---------------------------------
saveGameButton.addEventListener('click', saveGameState);

// ---------------------------------
// Users Online Counter
// ---------------------------------
let usersOnline = 20;
function updateUsersOnline() {
  let change   = Math.floor(Math.random() * 3) + 1;
  let increase = Math.random() < 0.5;
  if (increase) {
    usersOnline += change;
  } else {
    usersOnline -= change;
  }
  if (usersOnline < 15) usersOnline = 15;
  if (usersOnline > 25) usersOnline = 25;
  document.getElementById("users-online").textContent = usersOnline;
}
updateUsersOnline();
setInterval(updateUsersOnline, 5000);
