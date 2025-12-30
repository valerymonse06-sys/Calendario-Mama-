const daysContainer = document.getElementById("days");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");

let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem("events")) || {};

const decorations = ["⭐", "❤️", "⭕"];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function randomDecoration(seed) {
  return decorations[seed % decorations.length];
}

function renderCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  monthTitle.textContent = months[month];
  yearTitle.textContent = year;

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i < firstDay; i++) {
    daysContainer.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${month + 1}-${d}`;
    const div = document.createElement("div");
    div.className = "day";

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = d;

    div.appendChild(number);

    if (events[dateKey]) {
      const deco = document.createElement("div");
      deco.className = "decoration";
      deco.textContent = randomDecoration(d);
      div.appendChild(deco);
    }

    if (dateKey === selectedDate) {
      div.classList.add("selected");
    }

    div.onclick = () => {
      selectedDate = dateKey;
      showEvents();
      renderCalendar();
    };

    daysContainer.appendChild(div);
  }
}

function showEvents() {
  eventsList.innerHTML = "";

  if (!selectedDate || !events[selectedDate]) {
    eventsList.textContent = "No hay eventos este día";
    return;
  }

  events[selectedDate].forEach(ev => {
    const p = document.createElement("p");
    p.textContent = `🕒 ${ev.hora} – ${ev.texto}`;
    eventsList.appendChild(p);
  });
}

addEventBtn.onclick = () => {
  if (!selectedDate) {
    alert("Primero selecciona un día");
    return;
  }

  const hora = prompt("Hora (ej: 15:30)");
  if (!hora) return;

  const texto = prompt("¿Qué evento es?");
  if (!texto) return;

  if (!events[selectedDate]) {
    events[selectedDate] = [];
  }

  events[selectedDate].push({ hora, texto });
  saveEvents();
  showEvents();
  renderCalendar();
};

renderCalendar();
