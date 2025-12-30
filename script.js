const daysContainer = document.getElementById("days");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const notebook = document.querySelector(".notebook");
const notesArea = document.getElementById("notesArea");

let currentDate = new Date();
let selectedDate = null;
let events = {};
let notes = "";

// Constantes
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DECORATIONS = ["🦋", "🌸", "🍄", "✨", "🎀", "🧸", "🪐", "🌼", "🍁"];

// Cargar datos guardados
function loadData() {
  try {
    events = JSON.parse(localStorage.getItem("events")) || {};
    notes = localStorage.getItem("notes") || "";
    if (notesArea) notesArea.value = notes;
  } catch (error) {
    console.error("Error al cargar datos:", error);
    events = {};
    notes = "";
  }
}

// Guardar eventos
function saveEvents() {
  try {
    localStorage.setItem("events", JSON.stringify(events));
  } catch (error) {
    console.error("Error al guardar eventos:", error);
    alert("No se pudieron guardar los cambios");
  }
}

// Guardar notas
function saveNotes() {
  try {
    localStorage.setItem("notes", notesArea.value);
  } catch (error) {
    console.error("Error al guardar notas:", error);
  }
}

// Generar clave de fecha consistente
function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Animación de página
function animatePage() {
  notebook.classList.remove("animate");
  void notebook.offsetWidth; // Forzar reflow
  notebook.classList.add("animate");
}

// Renderizar calendario
function renderCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = MONTHS[month];
  yearTitle.textContent = year;

  // Obtener primer día (lunes = 1, domingo = 7)
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;

  const lastDate = new Date(year, month + 1, 0).getDate();

  // Días vacíos al inicio
  for (let i = 1; i < adjustedFirstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day empty";
    daysContainer.appendChild(emptyDay);
  }

  // Días del mes
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = getDateKey(year, month, d);

    const day = document.createElement("div");
    day.className = "day";
    day.setAttribute("data-date", dateKey);

    // Marcar día actual
    if (isCurrentMonth && d === today.getDate()) {
      day.classList.add("today");
    }

    // Marcar día seleccionado
    if (dateKey === selectedDate) {
      day.classList.add("selected");
    }

    // Número del día
    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    day.appendChild(num);

    // Decoración si hay eventos
    if (events[dateKey] && events[dateKey].length > 0) {
      const deco = document.createElement("div");
      deco.className = "decoration";
      deco.textContent = DECORATIONS[d % DECORATIONS.length];
      deco.title = `${events[dateKey].length} evento(s)`;
      day.appendChild(deco);
    }

    // Evento click
    day.onclick = () => selectDay(dateKey);

    daysContainer.appendChild(day);
  }
}

// Seleccionar día
function selectDay(dateKey) {
  selectedDate = dateKey;
  showEvents();
  renderCalendar();
}

// Mostrar eventos del día seleccionado
function showEvents() {
  eventsList.innerHTML = "";

  if (!selectedDate) {
    eventsList.textContent = "Selecciona un día";
    return;
  }

  if (!events[selectedDate] || events[selectedDate].length === 0) {
    eventsList.textContent = "No hay eventos este día";
    return;
  }

  // Ordenar eventos por hora
  const sortedEvents = [...events[selectedDate]].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  sortedEvents.forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";

    const text = document.createElement("span");
    text.className = "event-text";
    text.textContent = `🕒 ${ev.hora} – ${ev.texto}`;

    const actions = document.createElement("span");
    actions.className = "event-actions";

    // Botón editar
    const edit = document.createElement("button");
    edit.className = "event-btn edit-btn";
    edit.textContent = "✏️";
    edit.title = "Editar evento";
    edit.onclick = (e) => {
      e.stopPropagation();
      editEvent(index);
    };

    // Botón eliminar
    const del = document.createElement("button");
    del.className = "event-btn delete-btn";
    del.textContent = "❌";
    del.title = "Eliminar evento";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteEvent(index);
    };

    actions.appendChild(edit);
    actions.appendChild(del);
    item.appendChild(text);
    item.appendChild(actions);
    eventsList.appendChild(item);
  });
}

// Editar evento
function editEvent(index) {
  const ev = events[selectedDate][index];
  const hora = prompt("Editar hora (ej: 08:30):", ev.hora);
  
  if (hora === null) return; // Usuario canceló
  
  const texto = prompt("Editar evento:", ev.texto);
  
  if (texto === null) return; // Usuario canceló

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  events[selectedDate][index] = { hora: hora.trim(), texto: texto.trim() };
  saveEvents();
  showEvents();
  renderCalendar();
}

// Eliminar evento
function deleteEvent(index) {
  if (!confirm("¿Eliminar este evento?")) return;

  events[selectedDate].splice(index, 1);
  
  // Si no quedan eventos, eliminar el día
  if (events[selectedDate].length === 0) {
    delete events[selectedDate];
  }

  saveEvents();
  showEvents();
  renderCalendar();
}

// Agregar evento
function addEvent() {
  if (!selectedDate) {
    alert("Selecciona un día primero");
    return;
  }

  const hora = prompt("Hora (ej: 08:30):");
  if (hora === null) return; // Usuario canceló

  const texto = prompt("Evento:");
  if (texto === null) return; // Usuario canceló

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  if (!events[selectedDate]) {
    events[selectedDate] = [];
  }

  events[selectedDate].push({ 
    hora: hora.trim(), 
    texto: texto.trim() 
  });

  saveEvents();
  showEvents();
  renderCalendar();
}

// Navegar al mes anterior
function goToPrevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  selectedDate = null;
  animatePage();
  showEvents();
  renderCalendar();
}

// Navegar al mes siguiente
function goToNextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  selectedDate = null;
  animatePage();
  showEvents();
  renderCalendar();
}

// Event Listeners
addEventBtn.addEventListener("click", addEvent);
prevBtn.addEventListener("click", goToPrevMonth);
nextBtn.addEventListener("click", goToNextMonth);

// Guardar notas con debounce
let notesTimeout;
if (notesArea) {
  notesArea.addEventListener("input", () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveNotes, 500);
  });
}

// Atajos de teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && e.ctrlKey) {
    goToPrevMonth();
  } else if (e.key === "ArrowRight" && e.ctrlKey) {
    goToNextMonth();
  } else if (e.key === "n" && e.ctrlKey) {
    e.preventDefault();
    addEvent();
  }
});

// Inicializar
loadData();
renderCalendar();
