axios.defaults.headers.common["Authorization"] = "crOAxtb2nvt4HvqrTlUr9bKq";

const api_url = "https://mock-api.driven.com.br/api/vm/buzzquizz/quizzes/";

let playedArray = 0;
let playCounter = 0;
let correctPlayCounter = 0;

let chosenQuizzId, accuracy;

const userQuizz = {
  title: "",
  image: "",
  questions: [],
  levels: [],
};

let userQuizzAdress = [];

let localQuizzesString = localStorage.getItem("quizzes");
if (localQuizzesString !== null) {
  userQuizzAdress = JSON.parse(localQuizzesString);
}

// Gets user-made quizzes and, if it exists, display it
// Gets quizzes made by third-party stored server-side, and then displays it

function getAllQuizz() {
  document.querySelector(".loading-screen").classList.remove("hidden");
  document.querySelector(".home-page").classList.add("hidden");

  const promise = axios.get(api_url);

  promise.then(displayAllQuizz);

  promise.catch(console.error("bad request getAllQuizz()"));
}

function displayAllQuizz(array) {
  document.querySelector(".loading-screen").classList.add("hidden");
  document.querySelector(".home-page").classList.remove("hidden");

  const elementUser = document.querySelector(".add-quizz");
  const elementAll = document.querySelector(".all-quizz");
  elementUser.innerHTML = "";
  elementAll.innerHTML = "";
  let temp = 0;
  for (let i = 0; i < array.data.length; i++) {
    let temp2 = 0;
    if (userQuizzAdress[temp2] !== undefined) {
      for (let j = 0; j < userQuizzAdress.length; j++) {
        if (array.data[i].id === userQuizzAdress[j].id) {
          console.log(array.data[i]);
          console.log(array.data);
          elementUser.innerHTML += `
        <div data-test="my-quiz" class="quizz-container" onclick="getQuizz(${array.data[i].id})">
          <img src="${array.data[i].image}" />
          <h3>${array.data[i].title}</h3>
        </div>
        `;
          temp++;
          temp2 = 1;
        }
      }
    }
    if (temp === 1 && temp2 === 1) {
      elementUser.parentElement.classList.add("user-quizz-Used");
      elementUser.parentElement.classList.remove("user-quizz");
      elementUser.parentElement.querySelector("h3").innerHTML = "Seus Quizzes";
      elementUser.parentElement.querySelector("button.noUserQuizz").classList.add("hidden");
      elementUser.parentElement.querySelector("button.withUserQuizz").classList.remove("hidden");
    } else if (temp2 === 0) {
      elementAll.innerHTML += `
      <div data-test="others-quiz" class="quizz-container" onclick="getQuizz(${array.data[i].id})">
        <img src="${array.data[i].image}" />
        <h3>${array.data[i].title}</h3>
      </div>
      `;
    }
  }
}

function getQuizz(id) {
  document.querySelector(".loading-screen").classList.remove("hidden");
  document.querySelector(".home-page").classList.add("hidden");
  document.querySelector(".quizz-page").classList.add("hidden");

  const promise = axios.get(api_url + id);

  chosenQuizzId = id;

  promise.then(displayQuizz);

  promise.catch(console.error("bad request getQuizz()"));
}

function displayQuizzUserPage(id) {
  const promise = axios.get(api_url + id);

  promise.then(displayQuizz);

  promise.catch(console.error("bad request displayQuizzPage(id)"));

  document.querySelector(".sendQuizz").classList.toggle("hidden");
  document.querySelector(".quizz-page").classList.toggle("hidden");
}

function hideQuizzPage() {
  document.querySelector(".home-page").classList.remove("hidden");
  document.querySelector(".quizz-page").classList.add("hidden");
  document.querySelector(".quizz-result").classList.add("hidden");

  chosenQuizzId = null;

  getAllQuizz();
}

// Display chosen quizz
function displayQuizz(array) {
  window.scrollTo(0, 0);

  document.querySelector(".loading-screen").classList.add("hidden");
  document.querySelector(".home-page").classList.remove("hidden");

  document.querySelector(".quizz-page").classList.remove("hidden");
  document.querySelector(".home-page").classList.add("hidden");
  document.querySelector(".quizz-result").classList.add("hidden");

  document.querySelector(".quizz-header").innerHTML = "";
  document.querySelector(".quizz-body").innerHTML = "";
  document.querySelector(".quizz-result").innerHTML = "";

  const element = document.querySelector(".quizz-body");

  const title = document.getElementsByClassName("quizz-title");

  const questionGroup = array.data.questions;

  let i = 0;

  let j = 0;

  playedArray = [];
  playCounter = 0;
  correctPlayCounter = 0;

  document.querySelector(".quizz-header").innerHTML = `
    <img src="${array.data.image}" />
    <h2>${array.data.title}</h2>
  `;

  shuffle(questionGroup);

  for (const entry of questionGroup) {
    const questionContainer = document.getElementsByClassName("answer-group");

    const questionItem = entry.answers;

    element.innerHTML += `
    <div class="quizz-question-container" data-test="question">
      <div class="quizz-title" data-test="question-title"><p>${entry.title}</p></div>
      <div class="answer-group"></div>
    </div>
    `;

    title[i].style.backgroundColor = `${entry.color}`;

    title[i].style.color = `${getContrastYIQ(entry.color)}`;

    shuffle(questionItem);

    questionItem.index = i;

    playedArray.push(questionItem);

    for (const answer of questionItem) {
      questionContainer[i].innerHTML += `
        <div class="answer-item" onclick="playGame(${i}, ${j}, ${answer.isCorrectAnswer})" data-test='answer'>
          <div class="quizz-image"><img src="${answer.image}" /></div>
          <h3 class="item-text" data-test="answer-text">${answer.text}</h3>
        </div>
        `;

      j++;
    }

    i++;
  }
}

function playGame(i, j, answer) {
  const questionContainer = document.getElementsByClassName("answer-group");

  const chosenAnswer = document.getElementsByClassName("answer-item");

  const itemArray = playedArray.find((item) => item.index === i);

  questionContainer[i].innerHTML = "";

  for (const answer of itemArray) {
    if (answer.isCorrectAnswer === false) {
      questionContainer[i].innerHTML += `
        <div class="answer-item" data-test="answer">
          <div class="quizz-image blur"><img src="${answer.image}" /></div>
          <h3 class="item-text wrong" data-test="answer-text">${answer.text}</h3>
        </div>
        `;
    } else {
      questionContainer[i].innerHTML += `
        <div class="answer-item" data-test="answer">
          <div class="quizz-image blur"><img src="${answer.image}" /></div>
          <h3 class="item-text correct" data-test="answer-text">${answer.text}</h3>
        </div>
        `;
    }
  }

  chosenAnswer[j].childNodes[1].classList.remove("blur");

  if (answer === true) {
    correctPlayCounter++;
  }

  playCounter++;

  autoScroll(i);

  resultGameDisplay();
}

function resultGameDisplay() {
  if (playCounter === playedArray.length) {
    document.querySelector(".quizz-result").classList.remove("hidden");

    accuracy = Math.round((correctPlayCounter * 100) / playCounter);

    const promise = axios.get(api_url + chosenQuizzId);

    promise.then(resultGame);

    promise.catch(console.error("resultGameDisplay()"));

    playCounter = 0;
    correctPlayCounter = 0;
  }
}

function resultGame(array) {
  const element = document.querySelector(".quizz-result");

  const resultArray = array.data.levels;

  const resultArrayOrdered = resultArray.sort(function (a, b) {
    return parseFloat(a.minValue) - parseFloat(b.minValue);
  });

  let newArray = [];
  
  let i = 0;

  for (const entry of resultArrayOrdered) {
    newArray.push(entry.minValue);
  }

  let index = binarySearch(newArray, accuracy);

  if (index[0] == -1) {
    index = [0];
  } else if (accuracy === 0) {
    index = [0];
  } else if (index.length === 2) {
    index.pop();
  }

  for (const entry of resultArrayOrdered) {
    if (index == i) {
      element.innerHTML += `
    <div class="result-quizz-container">
      <div class="quizz-result-title" data-test="level-title"><p>${accuracy}% de acerto: ${entry.title}</p></div>
      <div class="result-container">
         <div class="result-image" data-test="level-img"><img src="${entry.image}"></div>
         <div class="result-text" data-test="level-text"><p>${entry.text}</p></div>
       </div>
    </div>
    `;
    }
    i++;
  }

  autoScrollResult();
}

function autoScroll(i) {
  setTimeout(() => {
    const element = document.getElementsByClassName("quizz-question-container");
    element[i].nextElementSibling.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, 2000);
}

function autoScrollResult() {
  setTimeout(() => {
    const element = document.querySelector(".result-quizz-container");
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, 2000);
}

function binarySearch(array, input) {
  let m = 0;
  let n = array.length - 1;
  while (m <= n) {
    let k = (n + m) >> 1;
    let cmp = input - array[k];
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return [k, k + 1];
    }
  }
  return [n];
}

function shuffle(array) {
  let i = array.length,
    j,
    temp;
  while (--i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[j];
    array[j] = array[i];
    array[i] = temp;
  }
}

function getContrastYIQ(hexcolor) {
  let r = parseInt(hexcolor.substring(1, 3), 16);
  let g = parseInt(hexcolor.substring(3, 5), 16);
  let b = parseInt(hexcolor.substring(5, 7), 16);
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function addQuizz() {
  document.querySelector(".home-page").classList.add("hidden");
  document.querySelector(".addQuizz.hidden").classList.remove("hidden");
}

/* Função para checar se a URL é valida*/
function checkUrl(string) {
  let givenURL;
  try {
    givenURL = new URL(string);
  } catch (error) {
    console.log("error is", error);
    return false;
  }
  return true;
}

/* Função para checar se a cor está em um formato HEX valido*/
function isHexColor(hex) {
  let isHex = hex.match(/[A-F-0-9]/gi);
  if (hex[0] === "#" && isHex.length === 6) {
    return true;
  }
  return false;
}

function openInput(element) {
  if (element.classList.contains("questionPage")) {
    let questionOpened = document.querySelector(".questions .opened");

    questionOpened.classList.add("hidden");
    questionOpened.classList.remove("opened");
    questionOpened.previousElementSibling.querySelector("button").classList.toggle("hidden");
  } else if (element.classList.contains("levelPage")) {
    let levelOpened = document.querySelector(".levels .opened");

    levelOpened.classList.add("hidden");
    levelOpened.classList.remove("opened");
    levelOpened.previousElementSibling.querySelector("button").classList.toggle("hidden");
  }

  element.parentNode.nextElementSibling.classList.remove("hidden");

  element.parentNode.nextElementSibling.classList.add("opened");

  element.parentElement.parentElement.scrollIntoView({ block: "start" });
  element.classList.toggle("hidden");
}

function renderUserQuestions(object) {
  let displayQuestion = "";
  let displayButton = "";
  const questionsFront = document.querySelector(".questionsQuizz > .questions");
  questionsFront.innerHTML = "";
  for (let i = 0; i < object.questions.length; i++) {
    if (i === 0) {
      displayQuestion = "opened";
      displayButton = "hidden";
    } else {
      displayQuestion = "hidden";
      displayButton = "";
    }
    questionsFront.innerHTML += `
        <ul data-test="question-ctn" class="question${i + 1} inputs">
          <div class="toggleButton">
            <h3>Pergunta ${i + 1}</h3>
            <button data-test="toggle" class="${displayButton} questionPage" type="button" onclick="openInput(this)"><img src="./assets/button-img.png" alt=""></button>
            </div>
            <div class="${displayQuestion}">
            <span class="space"></span>
            <li><input data-test="question-input" class="textQuestion" type="text" placeholder="Texto da pergunta" /></li>
            <li><input data-test="question-color-input" class="colorQuestion" type="text"
                placeholder="Cor de fundo da pergunta" />
            </li>
            <span class="space"></span>
            <h3>Resposta Correta</h3>
            <span class="space"></span>
            <li><input data-test="correct-answer-input" class="correctAnswer" type="text"
                placeholder="Resposta correta" />
            </li>
            <li><input data-test="correct-img-input" class="correctImg" type="text" placeholder="URL da imagem" />
            </li>
            <span class="space"></span>
            <h3>Respostas Incorretas</h3>
            <span class="space"> </span>
            <li><input data-test="wrong-answer-input" class="wrongAnswer1" type="text"
                placeholder="Resposta incorreta 1" />
            </li>
            <li><input data-test="wrong-img-input" class="wrongImg1" type="text" placeholder="URL da imagem 1" /></li>
            <span class="space"></span>
            <li><input data-test="wrong-answer-input" class="wrongAnswer2" type="text"
                placeholder="Resposta incorreta 2" />
            </li>
            <li><input data-test="wrong-img-input" class="wrongImg2" type="text" placeholder="URL da imagem 2" /></li>
            <span class="space"></span>
            <li><input data-test="wrong-answer-input" class="wrongAnswer3" type="text"
                placeholder="Resposta incorreta 3" />
            </li>
            <li><input data-test="wrong-img-input" class="wrongImg3" type="text" placeholder="URL da imagem 3" /></li>
          </div>
        </ul>`;
  }
}

function renderUserLevel(object) {
  let displayLevel = "";
  let displayButton = "";
  const levelsFront = document.querySelector(".levelQuizz > .levels");
  levelsFront.innerHTML = "";
  for (let i = 0; i < object.levels.length; i++) {
    if (i === 0) {
      displayLevel = "opened";
      displayButton = "hidden";
    } else {
      displayLevel = "hidden";
      displayButton = "";
    }
    levelsFront.innerHTML += `
      <ul data-test="level-ctn" class="level${i + 1} inputs">
        <div class="toggleButton">
          <h3>Nível ${i + 1}</h3>
          <button data-test="toggle" class="${displayButton} levelPage" type="button" onclick="openInput(this)"><img src="./assets/button-img.png" alt=""></button>
        </div>
        <div class="${displayLevel}">
          <span class="space"></span>
          <li><input data-test="level-input" class="textLevel" type="text" placeholder="Título do nível" />
          </li>
          <li><input data-test="level-percent-input" class="percentLevel" type="text"
            placeholder="% de acerto mínima" />
          </li>
          <li><input data-test="level-img-input" class="imgLevel" type="text"
            placeholder="URL da imagem do nível" />
          </li>
          <li><textarea data-test="level-description-input" class="descriptionLevel" type="text"
            placeholder="Descrição do nível" rows="5"></textarea>
          </li>
        </div>
      </ul>
      `;
  }
}

function sendQuizz(){
  const loadingFront = document.querySelector(".loading-screen").classList;
  const levelsFront = document.querySelector(".levelQuizz").classList;
  const sendFront = document.querySelector(".sendQuizz.hidden").classList;

  let quizzData = {
    id: "",
    key: "",
  };

  const sendQuizPromise = axios.post(api_url, userQuizz);
  sendQuizPromise.then((response) => {
    quizzData.id = response.data.id;
    quizzData.key = response.data.key;
    userQuizzAdress.push(quizzData);

    let localQuizzArdress = JSON.stringify(userQuizzAdress);
    localStorage.setItem("quizzes", localQuizzArdress);

    loadingFront.add("hidden");
    sendFront.remove("hidden");
    renderSenderLevel(userQuizz, quizzData);
    }
  );

  sendQuizPromise.catch(()=>{
    alert("Ertro no Servidor tente novamente")
    sendFront.add("hidden");
    levelsFront.remove("hidden");
  });
}

function renderSenderLevel(object,object2) {
  const element = document.querySelector(".userSendQuizz");
  element.innerHTML = "";
  element.innerHTML += `
  <div data-test="success-banner" id="${object2.id}" class="userQuizzContainer" onclick="toQuizz()">
      <img src="${object.image}" />
      <h3>${object.title}</h3>
  </div>
  `;
}

function toQuestions() {
  userQuizz.title = "";
  userQuizz.image = "";
  userQuizz.questions.length = 0;
  userQuizz.levels.length = 0;

  const inputTitle = document.querySelector(".quizzTitle");
  const inputImg = document.querySelector(".quizzImg");
  const inputNQuestions = document.querySelector(".nquestions");
  const inputNLevels = document.querySelector(".nlevels");

  const titleFront = document.querySelector(".titleQuizz").classList;
  const questionsFront = document.querySelector(".questionsQuizz.hidden").classList;

  if (
    inputTitle.value.length >= 20 &&
    inputTitle.value.length <= 65 &&
    checkUrl(inputImg.value) &&
    inputNQuestions.value > 2 &&
    Number.isInteger(Number(inputNQuestions.value)) &&
    inputNLevels.value > 1 &&
    Number.isInteger(Number(inputNLevels.value))
  ) {
    userQuizz.title = inputTitle.value;
    userQuizz.image = inputImg.value;
    userQuizz.questions.length = inputNQuestions.value;
    userQuizz.levels.length = inputNLevels.value;

    inputTitle.value = "";
    inputImg.value = "";
    inputNQuestions.value = "";
    inputNLevels.value = "";

    titleFront.add("hidden");
    questionsFront.remove("hidden");

    renderUserQuestions(userQuizz);
  } else {
    alert("Por favor preencha os dados corretamente.");
    inputTitle.value = "";
    inputImg.value = "";
    inputNQuestions.value = "";
    inputNLevels.value = "";
  }
}

function toLevels() {
  const questionsFront = document.querySelector(".questionsQuizz").classList;
  const levelsFront = document.querySelector(".levelQuizz.hidden").classList;

  for (let i = 0; i < userQuizz.questions.length; i++) {
    let question = {
      title: "",
      color: "",
      answers: [],
    };

    const inputQuestion = document.querySelector(`.question${i + 1} .textQuestion`);
    const inputColor = document.querySelector(`.question${i + 1} .colorQuestion`);

    if (inputQuestion.value.length >= 20 && isHexColor(inputColor.value)) {
      question.title = inputQuestion.value;
      question.color = inputColor.value;

      inputQuestion.value = "";
      inputColor.value = "";
    } else {
      alert("Por favor preencha os dados corretamente.");
      inputQuestion.value = "";
      inputColor.value = "";
      return;
    }

    const inputCorrectAnswer = document.querySelector(`.question${i + 1} .correctAnswer`);
    const inputCorrectImg = document.querySelector(`.question${i + 1} .correctImg`);

    if (inputCorrectAnswer.value !== "" && checkUrl(inputCorrectImg.value)) {
      let answer = {};
      answer.text = inputCorrectAnswer.value;
      answer.image = inputCorrectImg.value;
      answer.isCorrectAnswer = true;
      question.answers.push(answer);
      inputCorrectAnswer.value = "";
      inputCorrectImg.value = "";
    } else {
      alert("Por favor preencha os dados corretamente.");
      inputCorrectAnswer.value = "";
      inputCorrectImg.value = "";
      return;
    }
    for (let k = 1; k < 4; k++) {
      const inputWrongAnswer = document.querySelector(`.question${i + 1} .wrongAnswer${k}`);
      const inputWrongImg = document.querySelector(`.question${i + 1} .wrongImg${k}`);
      if (inputWrongAnswer.value !== "" && checkUrl(inputWrongImg.value)) {
        let answer = {};
        answer.text = inputWrongAnswer.value;
        answer.image = inputWrongImg.value;
        answer.isCorrectAnswer = false;
        question.answers.push(answer);
        inputCorrectAnswer.value = "";
        inputCorrectImg.value = "";
      } else if (k === 1) {
        alert("Por favor preencha os dados corretamente.");
        inputWrongAnswer.value = "";
        inputWrongImg.value = "";
        return;
      }
    }
    userQuizz.questions[i] = question;
  }

  questionsFront.add("hidden");
  levelsFront.remove("hidden");
  renderUserLevel(userQuizz);
}

function toSend() {
  const levelsFront = document.querySelector(".levelQuizz").classList;
  const loadingFront = document.querySelector(".loading-screen.hidden").classList;

  let temp = 0;
  for (let i = 0; i < userQuizz.levels.length; i++) {
    const level = {
      title: "",
      image: "",
      text: "",
      minValue: Number,
    };

    const inputLevel = document.querySelector(`.level${i + 1} .textLevel`);
    const inputPercent = document.querySelector(`.level${i + 1} .percentLevel`);
    const inputImgLevel = document.querySelector(`.level${i + 1} .imgLevel`);
    const inputDescriptionLevel = document.querySelector(`.level${i + 1} .descriptionLevel`);

    if (Number(inputPercent.value) === 0) {
      temp = 1;
    }

    if (
      inputLevel.value.length >= 10 &&
      Number(inputPercent.value) >= 0 &&
      Number(inputPercent.value) <= 100 &&
      checkUrl(inputImgLevel.value) &&
      inputDescriptionLevel.value.length >= 30
    ) {
      level.title = inputLevel.value;
      level.image = inputImgLevel.value;
      level.text = inputDescriptionLevel.value;
      level.minValue = inputPercent.value;

      inputLevel.value = "";
      inputPercent.value = "";
      inputImgLevel.value = "";
      inputDescriptionLevel.value = "";
    } else {
      alert("Por favor preencha os dados corretamente.");
      inputLevel.value = "";
      inputPercent.value = "";
      inputImgLevel.value = "";
      inputDescriptionLevel.value = "";
      return;
    }
    userQuizz.levels[i] = level;
    if (i === userQuizz.levels.length - 1 && temp === 0) {
      alert("Por favor preencha os dados corretamente.");
      inputLevel.value = "";
      inputPercent.value = "";
      inputImgLevel.value = "";
      inputDescriptionLevel.value = "";
      return;
    }
  }

  levelsFront.add("hidden");
  loadingFront.remove("hidden");
  sendQuizz();
  
}

function toQuizz() {
  let quizzID = document.querySelector(".userQuizzContainer").id;
  const sendFront = document.querySelector(".sendQuizz").classList;
  sendFront.add("hidden")
  getQuizz(quizzID);
}

document.addEventListener("DOMContentLoaded", function () {
  getAllQuizz();
});

function toHome() {
  window.location.reload();
}

/* to Bonus

          <button data-test="edit" class="edit" type="button" onclick="deleteQuizz()"><img src="./assets/button-img.png" alt=""></button>
          <button data-test="delete" class="delete" type="button" onclick="deleteQuizz()"><ion-icon name="trash-outline"></ion-icon></button>

*/
