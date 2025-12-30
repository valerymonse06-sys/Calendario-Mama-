const daysContainer = document.getElementById("days");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const notebook = document.querySelector(".notebook");

let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem("events")) || {};

const decorations = ["🦋","🌸","🍄","✨","🎀","🧸","🪐","🌼","🍁"];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function animatePage() {
  notebook.classList.remove("animate");
  void notebook.offsetWidth;
  notebook.classList.add("animate");
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

    if (dateKey === selectedDate) day.classList.add("selected");

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    day.appendChild(num);

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

function showEvents() {
  eventsList.innerHTML = "";

  if (!selectedDate || !events[selectedDate]) {
    eventsList.textContent = "No hay eventos este día";
    return;
  }

  events[selectedDate].forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";

    const text = document.createElement("span");
    text.textContent = `🕒 ${ev.hora} – ${ev.texto}`;

    const actions = document.createElement("span");

    const edit = document.createElement("span");
    edit.textContent = "✏️";
    edit.onclick = () => {
      const h = prompt("Editar hora:", ev.hora);
      const t = prompt("Editar evento:", ev.texto);
      if (!h || !t) return;
      events[selectedDate][index] = { hora: h, texto: t };
      saveEvents();
      showEvents();
      renderCalendar();
    };

    const del = document.createElement("span");
    del.textContent = "❌";
    del.onclick = () => {
      if (!confirm("¿Eliminar evento?")) return;
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

addEventBtn.onclick = () => {
  if (!selectedDate) {
    alert("Selecciona un día primero");
    return;
  }

  const hora = prompt("Hora (ej: 08:30)");
  const texto = prompt("Evento");
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
  animatePage();
  showEvents();
  renderCalendar();
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  selectedDate = null;
  animatePage();
  showEvents();
  renderCalendar();
};

renderCalendar();
