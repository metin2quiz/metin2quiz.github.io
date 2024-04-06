var items = {};
var titles = [];

const questions = [
       {
              question: 'Bu eşyanın adı ne?',
              lookupKeyName: 'itemName'
       },
       {
              question: 'Bu eşyanın seviyesi kaç?',
              lookupKeyName: 'level'
       }
];

const category2Items = {
       'silahlar': ['silahlar'],
       'zirhlar': ['zirhlar'],
       'kasklar': ['kasklar'],
       'kalkanlar': ['kalkanlar'],
       'mucevherler': [
              'bilezikler',
              'ayakkabilar',
              'kupeler',
              'kolyeler',
              'eldivenler',
              'kemerler',
              'tilsimlar'
       ]
}

const clearScoreElement = document.getElementById('clear-score'),
       endgameElement = document.getElementById('endgame'),
       correctElement = document.getElementById('correct'),
       wrongElement = document.getElementById('wrong'),
       answersDivElement = document.getElementById('answers'),
       answerButtonElements = document.getElementsByClassName('answer-button'),
       itemImageElement = document.getElementById('item-image'),
       questionElement = document.getElementById('question');


const limitedModeElement = document.getElementById('limited-mode'),
       unlimitedModeElement = document.getElementById('unlimited-mode'),
       numberOfQuestionElement = document.getElementById('number-of-question');

const categoryElement = document.getElementById('category'),
       categories = document.getElementsByClassName('category');


async function fetchItems() {
       await fetch('../json/items.json')
              .then(result => result.json())
              .then(result => items = result);;
};

async function fetchTitles() {
       await fetch('../json/titles.json')
              .then(result => result.json())
              .then(result => titles = result);;
};

const getRandomCategoryItems = (data) => {
       const category = localStorage.getItem('category');
       if (category === 'hepsi') {
              const keys = Object.keys(data);
              const randomCategoryIndex = getRandomInt(keys.length);
              const randomCategoryName = keys[randomCategoryIndex];
              const randomCategory = items[randomCategoryName];
              return randomCategory;
       }

       const categories = category2Items[category];

       const selectedItems = categories.map(c => items[c]);
       const random = getRandomInt(selectedItems.length);

       return selectedItems[random];

};

const newQuestion = () => {
       const randomQuestion = getRandomQuestion();
       const randomCategoryItems = getRandomCategoryItems(items);

       const answerField = randomQuestion.lookupKeyName;

       randomCategoryItems.shuffle();

       const distinctItems = randomCategoryItems.distinct(answerField);
       const distinctItemsLength = distinctItems.length;

       const answers = [];
       let possibleAnswersCount = 4;

       if (distinctItemsLength >= 4) {
              for (let index = 0; index < 4; index++) {
                     const element = distinctItems[index];
                     answers.push(element);
              }
              answers.shuffle();
       }
       else {
              possibleAnswersCount = 4 - distinctItemsLength;
              answers.push(...distinctItems);
              answers.shuffle();
              const extraAnswers = [{ level: 'Seviye 110' }, { level: 'Seviye 90' }, { level: 'Seviye 87' }];
              extraAnswers.shuffle();
              for (let index = 0; index < possibleAnswersCount; index++) {
                     const element = extraAnswers[index];
                     answers.push(element);
              }
       }

       const correctAnswerIndex = getRandomInt(possibleAnswersCount);
       const correctItem = answers[correctAnswerIndex];

       questionElement.innerText = randomQuestion.question;

       const imageUrl = `https://tr-wiki.metin2.gameforge.com${correctItem.itemImage}`;
       itemImageElement.setAttribute('src', imageUrl);
       generateAnswers(answers, answerField, correctAnswerIndex);
};


const clearScore = () => {
       correctElement.innerText = 0;
       wrongElement.innerText = 0;
       storage.setItem('numberOfAnsweredQuestion', 0);
};

const generateAnswers = (answers = [], answerField = '', correctIndex = 0) => {
       answersDivElement.innerHTML = '';

       const uniqueAnswers = answers.distinct(answerField);
       uniqueAnswers.forEach((answer, index) => {
              const buttonElement = document.createElement('button');
              buttonElement.type = 'button';
              buttonElement.className = 'btn btn-secondary answer-button';
              if (index != 3)
                     buttonElement.classList.add('me-2');
              buttonElement.innerText = answer[answerField];
              buttonElement.setAttribute('data-cor', encode(answers[correctIndex][answerField]));
              buttonElement.addEventListener('click', checkAnswer);

              answersDivElement.appendChild(buttonElement);
       })

}

const getRandomQuestion = () => {
       const randomQuestionIndex = getRandomInt(questions.length);
       return questions[randomQuestionIndex];
}

function getRandomInt(max, exclude = []) {
       let randomNumber = Math.floor(Math.random() * max);
       while (exclude.includes(randomNumber)) {
              randomNumber = Math.floor(Math.random() * max);
       }

       return randomNumber;
}


function checkAnswer(element) {
       setButtonsDisabled();

       element = element.target;
       const correctAnswer = element.getAttribute('data-cor');

       if (decode(correctAnswer) === element.innerHTML) {
              let current = correctElement.innerHTML;
              correctElement.innerHTML = Number(current) + 1;
              element.classList.remove('btn-secondary');
              element.classList.add('btn-success');
       }
       else {
              let current = wrongElement.innerHTML;
              wrongElement.innerHTML = Number(current) + 1;
              element.classList.remove('btn-secondary');
              element.classList.add('btn-warning');
       }
       const numberOfAnsweredQuestion = storage.getItem('numberOfAnsweredQuestion');
       storage.setItem('numberOfAnsweredQuestion', +numberOfAnsweredQuestion + 1);

       const isGameOver = checkIfNumberOfQuestionExceed();
       if (isGameOver) {
              endGame()
              return;
       }

       setTimeout(() => {
              newQuestion();
       }, 1200)

}

function setButtonsDisabled() {
       for (let index = 0; index < answerButtonElements.length; index++) {
              const element = answerButtonElements[index];
              element.setAttribute('disabled', '1');
       }
}

function encode(data) {
       return window.btoa(encodeURIComponent(data));
}

function decode(data) {
       return decodeURIComponent(window.atob(data));
}

Array.prototype.distinct = function (key = undefined) {
       if (!key)
              return [...new Set(arr)];

       return [...new Map(this.map(item =>
              [item[key], item])).values()];
}

Array.prototype.shuffle = function () {
       this.sort(() => Math.random() - 0.5);
}

function setGameMode(element) {
       [limitedModeElement, unlimitedModeElement].forEach(el => el.classList.remove('shadow-success'));
       const gameMode = element.currentTarget.getAttribute('data-game-mode');
       setNumberOfQuestionDisabled(gameMode);
       storage.setItem('gameMode', gameMode);
       element.currentTarget.classList.toggle('shadow-success');
       setVisiblityEndgameButton();
}

function setNumberOfQuestionDisabled(gameMode) {
       if (gameMode === 'limited')
              numberOfQuestionElement.removeAttribute('disabled');
       else
              numberOfQuestionElement.setAttribute('disabled', 1);
}

function setNumberOfQuestion4Storage(event) {
       const target = event.currentTarget;
       const gameMode = target.getAttribute('data-game-mode');

       let value = 25;
       if (!gameMode || gameMode === 'limited')
              value = numberOfQuestionElement.value;
       else if (gameMode === 'unlimited')
              value = 99999;

       storage.setItem('numberOfQuestion', +value);
}

function checkIfNumberOfQuestionExceed() {
       const gameMode = storage.getItem('gameMode');
       if (gameMode === 'unlimeted')
              return false;

       const numberOfQuestion = +storage.getItem('numberOfQuestion');
       const numberOfAnsweredQuestion = +storage.getItem('numberOfAnsweredQuestion');

       if (numberOfAnsweredQuestion === 0)
              return false;

       if (numberOfAnsweredQuestion % numberOfQuestion === 0)
              return true;

       return false;
}

function showGameOverAlert(title, successRate) {
       Swal.fire({
              title: `<strong>${title.title}</strong>`,
              html: `${title.text}`,
              icon: "success",
              showCancelButton: true,
              confirmButtonText: "Baştan başlat",
              cancelButtonText: "Kapat",
              footer: `Soruları <strong>%${successRate.toFixed(2)}</strong> oranında doğru cevapladın.`
       }).then((result) => {
              restartGame();
       });
}

function getSuccessRate() {
       const numberOfAnsweredQuestion = +storage.getItem('numberOfAnsweredQuestion');
       const correct = +correctElement.innerText;

       if (numberOfAnsweredQuestion === 0)
              return 0;

       return correct / numberOfAnsweredQuestion * 100;
}

function getTitle(successRate) {
       const title = titles
              .find(t => successRate >= t.successRateMinimum && successRate <= t.successRateMiximum);
       return title;
}

function restartGame() {
       clearScore();
       newQuestion();
}

function setVisiblityEndgameButton() {
       const gameMode = storage.getItem('gameMode');
       if (gameMode === 'unlimited')
              endgameElement.classList.remove('display-none');
       else endgameElement.classList.add('display-none');
}

function endGame() {
       const successRate = getSuccessRate();
       const title = getTitle(successRate);
       showGameOverAlert(title, successRate);
       restartGame();
       return;
}

function setCategory(event) {
       Array.from(categories).forEach(el => el.classList.remove('shadow-success'));
       const target = event.currentTarget;
       const id = target.getAttribute('id');
       target.classList.toggle('shadow-success');
       localStorage.setItem('category', id);
       restartGame();
}

async function main() {
       await fetchItems();
       await fetchTitles();
       clearScoreElement.addEventListener('click', clearScore);
       endgameElement.addEventListener('click', endGame);
       unlimitedModeElement.addEventListener('click', setNumberOfQuestion4Storage);
       limitedModeElement.addEventListener('click', setNumberOfQuestion4Storage);
       [limitedModeElement, unlimitedModeElement].forEach(el => el.addEventListener('click', setGameMode));
       numberOfQuestionElement.addEventListener('change', setNumberOfQuestion4Storage);
       categoryElement.addEventListener('click', function () {
              const categoryModal = new bootstrap.Modal('#categoryModal');
              categoryModal.show();
       });

       const categoryArr = Array.from(categories);
       categoryArr.forEach(category => category.addEventListener('click', setCategory))

       storage.setItem('numberOfQuestion', 25);
       storage.setItem('numberOfAnsweredQuestion', 0);
       storage.setItem('category', 'hepsi');
       newQuestion();

}

main();
