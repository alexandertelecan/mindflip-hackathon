const DEFAULT_DURATION = 3; //minutes
const DEFAULT_GAME_CONFIG = {
  images: [],
  score: 0,
  isRunning: false,
  timer: null,
  timeRemaining: null,
  currentImageElement: null,
  currentImageId: null,
};
const getRandomQuery = () => {
  const queries = [
    { label: "animals", value: "cute%20animals" },
    { label: "cars", value: "cars" },
    { label: "art", value: "art" },
    { label: "flowers", value: "flowers" },
    { label: "planes", value: "planes" },
    { label: "computers", value: "computers" },
  ];

  const randomIndex = Math.floor(Math.random() * queries.length);
  return queries[randomIndex];
};

const apis = {
  unsplash: {
    url: (query) => {
      return `https://api.unsplash.com/search/photos?query=${query}&per_page=12`;
    },
    config: {
      method: "GET",
      headers: {
        "Accept-Version": "v1",
        Authorization: "Client-ID 7Y-GwECJhlHJKbL9666sw_SllN07ZZy0Jf8YwZvlzzU",
      },
    },
  },
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const getImages = async () => {};

const DOM = {
  elements: {
    startGameButton: document.querySelector("#start-game"),
    cardsContainer: document.querySelector(".cards-container"),
    score: document.querySelector("#score"),
    timer: document.querySelector("#timer"),
    category: document.querySelector("#category"),
  },
  actions: {
    createCards: (images) => {
      DOM.elements.cardsContainer.innerHTML = "";
      images.forEach((image) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.addEventListener("mousedown", (e) => {
          GAME.selectCard(card, image.id);
        });
        card.innerHTML = ` <div class="card-inner">
        <div class="card-front">
          <img src="/images/brain.png" alt="brainIcon" />
        </div>
        <div class="card-back" style="background-image: url('${image.urls.small}'); background-size: cover; background-position: center;"></div>
      </div>`;

        DOM.elements.cardsContainer.appendChild(card);
      });
    },
    hideCards: (cardOne, cardTwo) => {
      const newCardOne = cardOne.cloneNode(true);
      const newCardTwo = cardTwo.cloneNode(true);
      cardOne.parentNode.replaceChild(newCardOne, cardOne);
      cardTwo.parentNode.replaceChild(newCardTwo, cardTwo);
      newCardOne.classList.add("hide");
      newCardTwo.classList.add("hide");
    },
    gameOver: () => {
      DOM.elements.cardsContainer.innerHTML = "";
    },
    setScore: (score) => {
      DOM.elements.score.textContent = `${GAME.score} points`;
    },
    setTimer: (timeRemaining) => {
      const minutes = Math.floor(timeRemaining / 1000 / 60);
      const seconds = Math.floor((timeRemaining / 1000) % 60);
      DOM.elements.timer.textContent = `0${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    },
    setCategory: (category) => {
      DOM.elements.category.textContent = category;
    },
  },
};

const GAME = {
  ...DEFAULT_GAME_CONFIG,
  getImages: async (createCards) => {
    const { url, config } = apis.unsplash;
    const randomQuery = getRandomQuery();
    const response = await fetch(url(randomQuery.value), config);
    const data = await response.json();
    const photos = data.results;
    const shuffledImages = shuffleArray([...photos, ...photos]);
    GAME.images = shuffledImages;
    DOM.actions.setCategory(randomQuery.label);
    createCards(shuffledImages);
  },
  selectCard: (cardElement, photoId) => {
    if (GAME.currentImageElement === null) {
      GAME.currentImageElement = cardElement;
      GAME.currentImageId = photoId;
      return;
    }
    if (
      GAME.currentImageElement === cardElement ||
      GAME.currentImageId !== photoId
    ) {
      GAME.currentImageElement = null;
      GAME.currentImageId = null;
      return;
    } else if (GAME.currentImageId === photoId) {
      DOM.actions.hideCards(GAME.currentImageElement, cardElement);
      GAME.images = GAME.images.filter((image) => image.id !== photoId);
      GAME.currentImageElement = null;
      GAME.currentImageId = null;
      GAME.score++;
      DOM.actions.setScore(GAME.score);
      if (GAME.images.length < 1) {
        GAME.gameOver();
      }
    }
  },
  setTimer: () => {
    GAME.timeRemaining = DEFAULT_DURATION * 60 * 1000;
    DOM.actions.setTimer(GAME.timeRemaining);
    GAME.timer = setInterval(() => {
      GAME.timeRemaining -= 1000;
      DOM.actions.setTimer(GAME.timeRemaining);
      if (GAME.timeRemaining < 1) {
        GAME.gameOver();
      }
    }, 1000);
  },
  startGame: () => {
    clearInterval(GAME.timer);
    for (let [key, value] of Object.entries(DEFAULT_GAME_CONFIG)) {
      GAME[key] = value;
    }
    GAME.isRunning = true;
    GAME.images = [];
    GAME.getImages(DOM.actions.createCards);
    DOM.actions.createCards(GAME.images);
    GAME.setTimer();
  },
  gameOver: () => {
    DOM.actions.gameOver();
    clearInterval(GAME.timer);
    for (let [key, value] of Object.entries(DEFAULT_GAME_CONFIG)) {
      GAME[key] = value;
    }
  },
};
DOM.elements.startGameButton.addEventListener("click", GAME.startGame);
GAME.startGame();
