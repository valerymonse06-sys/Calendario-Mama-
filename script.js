const daysContainer = document.getElementById("days");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let currentDate = new Date();
let selectedDate = null;

let events = JSON.parse(localStorage.getItem("events")) || {};

const decorations = ["⭐", "❤️", "⭕"];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
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
    daysContainer.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${month + 1}-${d}`;

    const day = document.createElement("div");
    day.className = "day";

    if (dateKey === selectedDate) {
      day.classList.add("selected");
    }

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = d;
    day.appendChild(number);

    if (events[dateKey] && events[dateKey].length > 0) {
      const deco = document.createElement("div");
      deco.className = "decoration";
      deco.textContent = decorations[d % decorations.length];
      day.appendChild(deco);
    }

    day.onclick = () => {
      selectedDate = dateKey;
      showEvents();
      renderCalendar();
    };

    daysContainer.appendChild(day);
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
    alert("Primero selecciona un día del calendario");
    return;
  }

  const hora = prompt("Hora (ej: 08:30)");
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

prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  selectedDate = null;
  showEvents();
  renderCalendar();
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  selectedDate = null;
  showEvents();
  renderCalendar();
};

renderCalendar();
