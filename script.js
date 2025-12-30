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

const decorations = ["🦋","🌸","🍄","✨","🎀","🧸","🪐","🌼"];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

/* CALENDARIO */
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

/* EVENTOS */
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
    edit.textContent = " ✏️";
    edit.onclick = () => {
      const nuevaHora = prompt("Editar hora:", ev.hora);
      if (!nuevaHora) return;

      const nuevoTexto = prompt("Editar evento:", ev.texto);
      if (!nuevoTexto) return;

      events[selectedDate][index] = { hora: nuevaHora, texto: nuevoTexto };
      saveEvents();
      showEvents();
      renderCalendar();
    };

    const del = document.createElement("span");
    del.textContent = " ❌";
    del.onclick = () => {
      if (!confirm("¿Eliminar este evento?")) return;
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

/* AGREGAR EVENTO */
addEventBtn.onclick = () => {
  if (!selectedDate) {
    alert("Selecciona un día primero");
    return;
  }

  const hora = prompt("Hora del evento:");
  if (!hora) return;

  const texto = prompt("¿Qué evento es?");
  if (!texto) return;

  if (!events[selectedDate]) events[selectedDate] = [];
  events[selectedDate].push({ hora, texto });

  saveEvents();
  showEvents();
  renderCalendar();
};

/* CAMBIO DE MES */
prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

nextBtn.o
