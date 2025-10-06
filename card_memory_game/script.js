let flipCount = 0;
let bestScore = parseInt(sessionStorage.getItem('bestScore')) || null;
let shuffledEmojis = [];
let username = sessionStorage.getItem('username') || null;
let gameEnded = false;
let pairCount = 0;
let currentFlippedCards = [];
let isChecking = false;
let usernameTimeout;

const restartBtn = document.getElementById('restart');
const chooseCardMsg = document.getElementById('choose-card-msg');
const gameBoard = document.getElementById('game-board');
const usernameModal = document.getElementById("username-modal");
const startGameBtn = document.getElementById("start-game-btn");
const usernameInput = document.getElementById("username-input");
const usernameDisplay = document.getElementById('username-display');
const finalScoreElement = document.getElementById('final-score');
const messageCongrats = document.getElementById('congratulations-message');
const messages = {
    changed: document.getElementById('username-changed-msg'),
    same: document.getElementById('same-username-msg'),
    empty: document.getElementById('empty-username-change')
};
const confirmRestartBtn = document.getElementById('confirm-restart-btn');
const cancelRestartBtn = document.getElementById('cancel-restart-btn');
const restartConfirmationModal = document.getElementById('restart-confirmation-modal');
const showRulesBtn = document.getElementById('show-rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');
const rulesModal = document.getElementById('rules-modal');

restartBtn.style.display = 'none';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showMessage(messageKey, duration = 10000) {
    clearTimeout(usernameTimeout);
    Object.values(messages).forEach(msg => msg.style.display = 'none'); 
    messages[messageKey].style.display = 'block';
    usernameTimeout = setTimeout(() => {
        messages[messageKey].style.display = 'none';
    }, duration);
}

function showGameBoard() {
    gameBoard.style.display = 'flex';
}

function hideGameBoard() {
    gameBoard.style.display = 'none';
}

function updatePairCount() {
    document.getElementById('pair-count').textContent = `Liko porų: ${pairCount}`;
}

function updateFlipCount() {
    document.getElementById('flipped-counts').textContent = `Apsivertimų skaičius: ${flipCount}`;
}


function createCards(reshuffle = true) {
    const allEmojis = ["&#129361;", "&#129373;", "&#127819;", "&#127815;", "&#127823;"];
    pairCount = allEmojis.length;
    updatePairCount();

    const pairs = [...allEmojis, ...allEmojis];
    if (reshuffle || !shuffledEmojis.length) {
        shuffledEmojis = shuffleArray(pairs);
    }

    gameBoard.innerHTML = '';
    showGameBoard();

    shuffledEmojis.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">${emoji}</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (isChecking || card.classList.contains('flipped') || currentFlippedCards.length === 2) return;

    flipCount++;
    updateFlipCount();
    card.classList.add('flipped');
    currentFlippedCards.push(card);

    restartBtn.style.display = 'inline-block';
    chooseCardMsg.style.display = 'none';

    if (currentFlippedCards.length === 2) checkMatch();
}

function checkMatch() {
    isChecking = true;
    const [card1, card2] = currentFlippedCards;
    const isMatch = card1.querySelector('.card-back').innerHTML === card2.querySelector('.card-back').innerHTML;

    setTimeout(() => {
        if (isMatch) {
            card1.style.visibility = 'hidden';
            card2.style.visibility = 'hidden';
            pairCount--;
            updatePairCount();
            if (document.querySelectorAll('.card:not([style*="visibility: hidden"])').length === 0) {
                showCongratulationsMessage(flipCount);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        currentFlippedCards = [];
        isChecking = false;
    }, 500);
}

function showCongratulationsMessage(flipCount) {
    let newScore = false;

    if (!bestScore || flipCount < bestScore) {
        bestScore = flipCount;
        sessionStorage.setItem('bestScore', bestScore);
        document.getElementById('best-score').textContent = `Rekordas apsivertimų: ${bestScore}`;
        newScore = true;
    }

    finalScoreElement.innerHTML = `Apsivertimų skaičius: ${flipCount}${newScore ? ' <span style="color: green;">(Naujas Rekordas!)</span>' : ''}`;
    restartBtn.style.display = 'none';
    hideGameBoard();
    messageCongrats.style.display = 'block';
    gameEnded = true;
}

function startGame() {
    const usernameInputValue = usernameInput.value.trim();

    if (!username) {
        if (!usernameInputValue) {
            usernameInput.classList.add("invalid");
            document.getElementById('required-field-msg').style.display = "block";
            return;
        }
        sessionStorage.setItem('username', usernameInputValue);
        username = usernameInputValue;
    }

    document.getElementById("game-container").style.display = "flex";
    usernameModal.style.display = "none";
    usernameDisplay.textContent = username;
    createCards(true);
    chooseCardMsg.style.display = 'block';
    usernameInput.classList.remove("invalid");
    document.getElementById('required-field-msg').style.display = "none";
}

function changeUsername() {
    const newUsername = prompt("Įveskite naują vardą:");
    if (newUsername === null) return;

    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
        showMessage('empty');
        return;
    }

    if (trimmedUsername === username) {
        showMessage('same');
        return;
    }

    username = trimmedUsername;
    sessionStorage.setItem('username', username);
    usernameDisplay.textContent = username;
    showMessage('changed');
}

function restartGame() {
    flipCount = 0;
    currentFlippedCards = [];
    isChecking = false;
    updateFlipCount();
    messageCongrats.style.display = 'none';
    showGameBoard();

    createCards(gameEnded);
    gameEnded = false;
    restartBtn.style.display = 'none';
}

startGameBtn.addEventListener("click", startGame);

restartBtn.addEventListener('click', () => {
    if (!gameEnded) restartConfirmationModal.style.display = 'flex';
    else restartGame();
});

confirmRestartBtn.addEventListener('click', () => {
    restartGame();
    restartConfirmationModal.style.display = 'none';
});

cancelRestartBtn.addEventListener('click', () => {
    restartConfirmationModal.style.display = 'none';
});

document.getElementById('change-username-btn').addEventListener('click', changeUsername);

showRulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'block';
});
closeRulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'none';
});

window.onload = () => {
    if (username) {
        document.getElementById("game-container").style.display = "flex";
        usernameModal.style.display = "none";
        usernameDisplay.textContent = username;
        createCards(true);
    } else {
        usernameModal.style.display = "block";
    }

    if (bestScore !== null) {
        document.getElementById('best-score').textContent = `Rekordas apsivertimų: ${bestScore}`;
    }
};