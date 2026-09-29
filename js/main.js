const home = document.querySelector(".home");
const topicList = document.querySelector(".topic-list");
const topics = Array.from(document.querySelectorAll(".topic"));
const undoButton = document.querySelector('[data-history-action="undo"]');
const redoButton = document.querySelector('[data-history-action="redo"]');
const entryMap = document.querySelector(".entry-map");
const entryLinks = Array.from(document.querySelectorAll(".map-card[href$='.html']"));
const homeInfoPanel = document.querySelector("[data-home-info-panel]");
const homeInfoToggle = document.querySelector("[data-home-info-toggle]");
const homeInfoClose = document.querySelector("[data-home-info-close]");
let activeTopic = topics.length - 1;
let rollTimer;
let lastWheelAt = 0;
let history = [activeTopic];
let historyIndex = 0;
let mapOpen = false;
let isHistoryMove = false;

function updateHistoryButtons() {
  undoButton.disabled = historyIndex === 0 && !mapOpen;
  redoButton.disabled = historyIndex === history.length - 1;
}

function rememberSelection(index) {
  if (isHistoryMove || history[historyIndex] === index) {
    return;
  }

  history = history.slice(0, historyIndex + 1);
  history.push(index);
  historyIndex = history.length - 1;
  updateHistoryButtons();
}

function setMapOpen(isOpen) {
  mapOpen = isOpen;
  document.body.classList.toggle("can-pan-map", isOpen);
  entryMap.classList.toggle("is-visible", isOpen && activeTopic === 0);

  if (isOpen) {
    window.setTimeout(() => window.scrollTo({ left: window.innerWidth * 0.32, behavior: "smooth" }), 120);
  } else {
    window.scrollTo({ left: 0, behavior: "smooth" });
  }

  updateHistoryButtons();
}

function restoreMapFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("map") === "principal" || window.location.hash === "#principal-map";
}

function setActiveTopic(index) {
  const nextIndex = Math.max(0, Math.min(index, topics.length - 1));

  if (nextIndex !== activeTopic) {
    setMapOpen(false);
  }

  activeTopic = nextIndex;
  topicList.style.setProperty("--active-topic", activeTopic);
  topicList.dataset.activeTopic = activeTopic;

  topics.forEach((topic, topicIndex) => {
    const distance = Math.abs(topicIndex - activeTopic);
    topic.classList.toggle("is-selected", distance === 0);
    topic.classList.toggle("is-near", distance === 1);
    topic.classList.toggle("is-far", distance === 2);
    topic.classList.toggle("is-hidden-soft", distance > 2);
  });

  updateHistoryButtons();
}

function rollTo(index) {
  if (mapOpen) {
    return;
  }

  window.clearTimeout(rollTimer);
  rollTimer = window.setTimeout(() => setActiveTopic(index), 70);
}

function moveTopic(direction) {
  if (mapOpen) {
    return;
  }

  rollTo(activeTopic + direction);
}

document.addEventListener("wheel", (event) => {
  if (mapOpen && window.matchMedia("(max-width: 900px)").matches) {
    return;
  }

  event.preventDefault();

  if (mapOpen) {
    const horizontalDelta = event.deltaX || event.deltaY;
    window.scrollBy({ left: horizontalDelta * 0.1, behavior: "smooth" });
    return;
  }

  const now = window.performance.now();
  const delta = Math.abs(event.deltaY);

  if (delta < 42 || now - lastWheelAt < 460) {
    return;
  }

  lastWheelAt = now;
  moveTopic(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveTopic(1);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveTopic(-1);
  }
});

entryLinks.forEach((entryLink) => {
  entryLink.addEventListener("click", () => {
    history.replaceState({ map: "principal" }, "", "index.html?map=principal");
  });
});

function setHomeInfoOpen(isOpen) {
  if (!homeInfoPanel || !homeInfoToggle) {
    return;
  }

  homeInfoPanel.classList.toggle("is-open", isOpen);
  if (isOpen) {
    homeInfoPanel.classList.add("has-opened");
  }
  homeInfoToggle.setAttribute("aria-expanded", String(isOpen));
  homeInfoToggle.setAttribute("aria-label", isOpen ? "Cerrar informacion del glosario" : "Abrir informacion del glosario");

  const content = homeInfoPanel.querySelector(".home-info-content");
  if (content) {
    content.setAttribute("aria-hidden", String(!isOpen));
  }
}

if (homeInfoToggle) {
  homeInfoToggle.addEventListener("click", () => setHomeInfoOpen(true));
}

if (homeInfoClose) {
  homeInfoClose.addEventListener("click", () => setHomeInfoOpen(false));
}

topics.forEach((topic) => {
  const index = Number(topic.dataset.topicIndex);

  topic.addEventListener("click", () => {
    if (index !== activeTopic || mapOpen) {
      return;
    }

    rememberSelection(activeTopic);
    setMapOpen(true);
  });

  topic.addEventListener("focus", () => {
    if (!mapOpen) {
      setActiveTopic(index);
    }
  });
});

undoButton.addEventListener("click", () => {
  if (mapOpen) {
    setMapOpen(false);
    return;
  }

  if (historyIndex === 0) {
    return;
  }

  isHistoryMove = true;
  historyIndex -= 1;
  setActiveTopic(history[historyIndex]);
  isHistoryMove = false;
  updateHistoryButtons();
});

redoButton.addEventListener("click", () => {
  if (historyIndex === history.length - 1) {
    return;
  }

  isHistoryMove = true;
  historyIndex += 1;
  setActiveTopic(history[historyIndex]);
  isHistoryMove = false;
  updateHistoryButtons();
});

if (restoreMapFromUrl()) {
  setActiveTopic(0);
  setMapOpen(true);
  window.history.replaceState({}, "", "index.html");
  window.setTimeout(() => {
    if (homeInfoPanel && !homeInfoPanel.classList.contains("is-open")) {
      homeInfoPanel.classList.add("is-ready");
    }
  }, 620);
} else {
  setActiveTopic(topics.length - 1);
  updateHistoryButtons();
  window.setTimeout(() => setActiveTopic(3), 620);
  window.setTimeout(() => setActiveTopic(2), 1080);
  window.setTimeout(() => setActiveTopic(1), 1560);
  window.setTimeout(() => setActiveTopic(0), 2080);

  window.setTimeout(() => {
    if (homeInfoPanel && !homeInfoPanel.classList.contains("is-open")) {
      homeInfoPanel.classList.add("is-ready");
    }
  }, 2920);
}



