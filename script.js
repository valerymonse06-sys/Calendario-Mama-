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

const decorations = ["🦋","🌸","🌼","🍁","🍄","✨","🎀","🧸"];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

/* ---------- CALENDARIO ---------- */
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

    if (events[dateKey]) {
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

/* ---------- EVENTOS ---------- */
function showEvents() {
  eventsList.innerHTML = "";

  if (!selectedDate || !events[selectedDate]) {
    eventsList.textContent = "No hay eventos este día";
    return;
  }

  events[selectedDate].forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";

    const text = document.createElement("div");
    text.className = "event-text";
    text.textContent = `🕒 ${ev.hora} – ${ev.texto}`;

    const actions = document.createElement("div");
    actions.className = "event-actions";

    const edit = document.createElement("span");
    edit.textContent = "✏️";
    edit.onclick = () => {
      const h = prompt("Hora:", ev.hora);
      const t = prompt("Evento:", ev.texto);
      if (!h || !t) return;

      events[selectedDate][index] = { hora: h, texto: t };
      saveEvents();
      showEvents();
      renderCalendar();
    };

    const del = document.createElement("span");
    del.textContent = "❌";
    del.onclick = () => {
      events[selectedDate].splice(index, 1);
      if (events[selectedDate].length === 0) delete events[selectedDate];
      saveEvents();
      showEvents();
      renderCalendar();
    };

    actions.appendChild(edit);
    actions.appendChild(del);

    item.appendChild(text);
    item.appendChild(actions);
    eventsList.appendChild(item);
  });
}

/* ---------- BOTÓN AGREGAR ---------- */
addEventBtn.onclick = () => {
  if (!selectedDate) {
    alert("Selecciona un día");
    return;
  }

  const hora = prompt("Hora:");
  const texto = prompt("Evento:");
  if (!hora || !texto) return;

  if (!events[selectedDate]) events[selectedDate] = [];
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
