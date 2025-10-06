let flipCount = 0;
let bestScore = parseInt(sessionStorage.getItem('bestScore')) || null;
let shuffledEmojis = [];
let username = sessionStorage.getItem('username') || null;
let gameEnded = false;  

let pairCount;

const restartBtn = document.getElementById('restart'); 
const chooseCardMsg = document.getElementById('choose-card-msg');

restartBtn.style.display = 'none';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log(array);
    return array;
}

function createCards(reshuffle) {
    const allEmojis = ["&#129361;", "&#129373;", "&#127819;", "&#127815;", "&#127823;"];
    pairCount = allEmojis.length;
    document.getElementById('pair-count').textContent = `Liko porų: ${pairCount}`;
    const pairs = [...allEmojis, ...allEmojis];

    if (reshuffle) {
        shuffledEmojis = shuffleArray(pairs);
    }

    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = '';

    gameBoard.style.display = "flex";
    gameBoard.style.flexWrap = "wrap";

    shuffledEmojis.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');  

        card.addEventListener('click', function () {
            flipCard(card);
        });

        card.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">${emoji}</div>
        `;

        gameBoard.appendChild(card);
    });


}

let currentFlippedCards = [];
let isChecking = false;

function flipCard(card) {
    if (isChecking || card.classList.contains('flipped') || currentFlippedCards.length === 2) {
        return;
    }

    flipCount++;

    const flippedCountDisplay = document.getElementById('flipped-counts');
    flippedCountDisplay.textContent = `Apsivertimų skaičius: ${flipCount}`;

    card.classList.add('flipped');
    currentFlippedCards.push(card);

    restartBtn.style.display = 'inline-block'; 
    chooseCardMsg.style.display = 'none';

    if (currentFlippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    isChecking = true;

    const [card1, card2] = currentFlippedCards;
    const isMatch = card1.querySelector('.card-back').innerHTML === card2.querySelector('.card-back').innerHTML;

    if (isMatch) {
        setTimeout(() => {
            card1.style.visibility = 'hidden';
            card2.style.visibility = 'hidden';

            currentFlippedCards = [];
            isChecking = false;

            pairCount -= 1;
            document.getElementById('pair-count').textContent = `Liko porų: ${pairCount}`;

            if (document.querySelectorAll('.card:not([style*="visibility: hidden"])').length === 0) {
                showCongratulationsMessage(flipCount);
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');

            currentFlippedCards = [];
            isChecking = false;
        }, 500);
    }
}

function showCongratulationsMessage(flipCount) {
    const messageContainer = document.getElementById('congratulations-message');
    const finalScoreElement = document.getElementById('final-score');
    const gameBoard = document.getElementById('game-board');
    var newScore = false;

    if (bestScore === null || flipCount < bestScore) {
        bestScore = flipCount;
        sessionStorage.setItem('bestScore', bestScore);
        document.getElementById('best-score').textContent = `Rekordas apsivertimų: ${bestScore}`;
        newScore = true;
    }

    finalScoreElement.textContent = `Apsivertimų skaičius: ${flipCount}`;

    if (newScore) {
        finalScoreElement.innerHTML += ' <span style="color: green;">(Naujas Rekordas!)</span>';
        newScore = false;
    }

    restartBtn.style.display = 'none';
    gameBoard.style.display = 'none';
    messageContainer.style.display = 'block';
    gameEnded = true;
}

const usernameModal = document.getElementById("usernameModal");
const startGameBtn = document.getElementById("startGameBtn");

function startGame() {
    const usernameInput = document.getElementById("usernameInput");
    const usernameInputValue = usernameInput.value.trim();

    if (!username) {
        if (usernameInputValue) {
            sessionStorage.setItem('username', usernameInputValue);
            username = usernameInputValue;
            document.getElementById("game-container").style.display = "block";
            document.getElementById('usernameDisplay').textContent = username;
            usernameModal.style.display = "none";
            createCards(true);

            usernameInput.classList.remove("invalid");
            document.getElementById('required-field-msg').style.display = "none";
            document.getElementById('choose-card-msg').style.display = 'block';
        } else {
            usernameInput.classList.add("invalid");
            document.getElementById('required-field-msg').style.display = "block";
        }
    } else {
        document.getElementById("game-container").style.display = "block";
        document.getElementById('usernameDisplay').textContent = username;
        usernameModal.style.display = "none";
        createCards(true);
    }
}

startGameBtn.addEventListener("click", startGame);

function restartGame() {
    flipCount = 0;
    currentFlippedCards = [];
    isChecking = false;

    document.getElementById('flipped-counts').textContent = `Apsivertimų skaičius: 0`;
    document.getElementById('congratulations-message').style.display = 'none';

    const gameBoard = document.getElementById("game-board");
    gameBoard.style.display = "block"; 

    if (gameEnded) {
        createCards(true);
        gameEnded = false; 
    } else {
        restartBtn.style.display = 'none';
        createCards(false);
    }
}

restartBtn.addEventListener('click', () => {
    if (!gameEnded) {
        restartConfirmationModal.style.display = 'flex';
    } else {
        restartGame();
    }
});


confirmRestartBtn.addEventListener('click', () => {
    restartGame();
    restartConfirmationModal.style.display = 'none';
    setTimeout(() => {
        alert("Žaidimas pradėtas iš naujo.");
    }, 300);
});

cancelRestartBtn.addEventListener('click', () => {
    restartConfirmationModal.style.display = 'none';
});

if (bestScore !== null) {
    document.getElementById('best-score').textContent = `Rekordas apsivertimų: ${bestScore}`;
}

function changeUsername() {
    const newUsername = prompt("Įveskite naują vardą:");

    if (newUsername === null) {
        return;
    }

    const usernameChangedMsg = document.getElementById('usernameChangedMsg');
    const sameUsernameMsg = document.getElementById('sameUsernameMsg');
    const usernameInput = document.getElementById('usernameInput');
    const requiredFieldMsg = document.getElementById('emptyUsernameChange');

    if (!newUsername.trim()) { 
        usernameInput.classList.add("invalid");
        requiredFieldMsg.style.display = "block";
        usernameChangedMsg.style.display = "none";
        sameUsernameMsg.style.display = "none";
        setTimeout(() => {
            requiredFieldMsg.style.display = 'none';
        }, 10000);
    } else if (newUsername.trim() === username) {
        sameUsernameMsg.style.display = "block";
        usernameChangedMsg.style.display = "none";
        requiredFieldMsg.style.display = "none";
        setTimeout(() => {
            sameUsernameMsg.style.display = 'none';
        }, 10000);
    } else {
        sessionStorage.setItem('username', newUsername.trim());
        username = newUsername.trim();
        document.getElementById('usernameDisplay').textContent = username;

        usernameChangedMsg.style.display = 'block';
        sameUsernameMsg.style.display = "none";
        requiredFieldMsg.style.display = "none";
        setTimeout(() => {
            usernameChangedMsg.style.display = 'none';
        }, 10000);
    }
}

const showRulesBtn = document.getElementById('showRulesBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRulesBtn = document.getElementById('closeRulesBtn');

showRulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'block';
});

closeRulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'none';
});

document.getElementById('changeUsernameBtn').addEventListener('click', changeUsername);

window.onload = function () {
    if (username) {
        document.getElementById("game-container").style.display = "block";
        usernameModal.style.display = "none";
        document.getElementById('usernameDisplay').textContent = username;
        createCards(true);
    } else {
        usernameModal.style.display = "block";
    }
};
