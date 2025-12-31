const daysContainer = document.getElementById("days");
const weekView = document.getElementById("weekView");
const weekDaysGrid = document.getElementById("weekDaysGrid");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const viewToggleBtn = document.getElementById("viewToggle");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const notebook = document.querySelector(".notebook");
const notesArea = document.getElementById("notesArea");

let currentDate = new Date();
let selectedDate = null;
let events = {};
let notes = "";
let notificationCheckInterval = null;
let currentView = "month"; // "month" o "week"
let currentWeekStart = null;

// Constantes
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DECORATIONS = ["🦋", "🌸", "🍄", "✨", "🎀", "🧸", "🪐", "🌼", "🍁"];

// Etiquetas predefinidas con colores
const TAGS = {
  "#trabajo": "#4285f4",
  "#personal": "#ea4335",
  "#importante": "#fbbc04",
  "#urgente": "#ff6b6b",
  "#salud": "#34a853",
  "#familia": "#ff69b4",
  "#estudio": "#9b59b6",
  "#deporte": "#00bcd4"
};

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = 'sine';
  
  const now = audioContext.currentTime;
  oscillator.frequency.setValueAtTime(800, now);
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator.frequency.setValueAtTime(1000, now + 0.15);
  gainNode.gain.setValueAtTime(0.2, now + 0.15);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}

function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          showNotification("¡Notificaciones activadas!", "Ahora recibirás recordatorios de tus eventos 🎉");
        }
      });
    }
  }
}

function showNotification(title, body, icon = "🔔") {
  if ("Notification" in window && Notification.permission === "granted") {
    playNotificationSound();
    new Notification(title, {
      body: body,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>" + icon + "</text></svg>",
      badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔔</text></svg>",
      requireInteraction: false,
      silent: true
    });
  }
}

function checkUpcomingEvents() {
  const now = new Date();
  
  Object.keys(events).forEach(dateKey => {
    events[dateKey].forEach(event => {
      if (!event.notified && event.reminder) {
        const [year, month, day] = dateKey.split("-").map(Number);
        const [hours, minutes] = event.hora.split(":").map(Number);
        
        const eventDate = new Date(year, month - 1, day, hours, minutes);
        const timeDiff = eventDate - now;
        const reminderTime = event.reminder * 60 * 1000;
        
        if (timeDiff > 0 && timeDiff <= reminderTime && timeDiff > (reminderTime - 60000)) {
          showNotification(
            `📅 Recordatorio: ${event.texto}`,
            `Evento a las ${event.hora} - ${event.reminder} minutos antes`,
            "⏰"
          );
          event.notified = true;
          saveEvents();
        }
        
        if (timeDiff < 0) {
          event.notified = false;
          saveEvents();
        }
      }
    });
  });
}

function startNotificationCheck() {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  notificationCheckInterval = setInterval(checkUpcomingEvents, 30000);
  checkUpcomingEvents();
}

// ============================================
// FUNCIONES DE DATOS
// ============================================

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

function saveEvents() {
  try {
    localStorage.setItem("events", JSON.stringify(events));
  } catch (error) {
    console.error("Error al guardar eventos:", error);
    alert("No se pudieron guardar los cambios");
  }
}

function saveNotes() {
  try {
    localStorage.setItem("notes", notesArea.value);
  } catch (error) {
    console.error("Error al guardar notas:", error);
  }
}

function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function animatePage() {
  notebook.classList.remove("animate");
  void notebook.offsetWidth;
  notebook.classList.add("animate");
}

// ============================================
// FUNCIONES DE ETIQUETAS
// ============================================

function extractTags(text) {
  const tagRegex = /#\w+/g;
  return text.match(tagRegex) || [];
}

function renderTagsHTML(tags) {
  return tags.map(tag => {
    const color = TAGS[tag.toLowerCase()] || "#999";
    return `<span class="event-tag" style="background-color: ${color}20; color: ${color}; border-color: ${color}">${tag}</span>`;
  }).join(" ");
}

function removeTagsFromText(text) {
  return text.replace(/#\w+/g, '').trim();
}

// ============================================
// BÚSQUEDA DE EVENTOS
// ============================================

function searchEvents(query) {
  if (!query.trim()) {
    searchResults.innerHTML = "";
    return;
  }

  const lowerQuery = query.toLowerCase();
  const results = [];

  Object.keys(events).forEach(dateKey => {
    events[dateKey].forEach(event => {
      const eventText = event.texto.toLowerCase();
      if (eventText.includes(lowerQuery)) {
        results.push({
          date: dateKey,
          event: event
        });
      }
    });
  });

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No se encontraron eventos</div>';
    return;
  }

  searchResults.innerHTML = results.map(result => {
    const [year, month, day] = result.date.split("-");
    const dateStr = `${day}/${month}/${year}`;
    const tags = extractTags(result.event.texto);
    const cleanText = removeTagsFromText(result.event.texto);
    
    return `
      <div class="search-result-item" data-date="${result.date}">
        <div class="search-result-date">${dateStr}</div>
        <div class="search-result-text">
          🕒 ${result.event.hora} - ${cleanText}
          ${tags.length > 0 ? renderTagsHTML(tags) : ''}
        </div>
      </div>
    `;
  }).join("");

  // Agregar event listeners a los resultados
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const dateKey = item.getAttribute('data-date');
      const [year, month, day] = dateKey.split("-").map(Number);
      
      currentDate = new Date(year, month - 1, day);
      selectedDate = dateKey;
      
      if (currentView === "month") {
        renderCalendar();
      } else {
        setWeekFromDate(currentDate);
        renderWeekView();
      }
      
      showEvents();
      searchInput.value = "";
      searchResults.innerHTML = "";
    });
  });
}

// ============================================
// VISTA SEMANAL
// ============================================

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function setWeekFromDate(date) {
  currentWeekStart = getWeekStart(date);
}

function renderWeekView() {
  weekDaysGrid.innerHTML = "";
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    weekDays.push(date);
  }

  weekDays.forEach(date => {
    const dateKey = getDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEvents = events[dateKey] || [];
    
    const dayColumn = document.createElement("div");
    dayColumn.className = "week-day-column";
    
    const dayHeader = document.createElement("div");
    dayHeader.className = "week-day-header";
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) dayHeader.classList.add("today");
    
    const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    dayHeader.innerHTML = `
      <div class="week-day-name">${dayNames[date.getDay()]}</div>
      <div class="week-day-number">${date.getDate()}</div>
    `;
    
    dayColumn.appendChild(dayHeader);
    
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "week-events-container";
    
    dayEvents.forEach(event => {
      const [hours, minutes] = event.hora.split(":").map(Number);
      const topPosition = (hours * 60 + minutes) * (50 / 60);
      
      const tags = extractTags(event.texto);
      const cleanText = removeTagsFromText(event.texto);
      
      const eventBlock = document.createElement("div");
      eventBlock.className = "week-event-block";
      eventBlock.style.top = `${topPosition}px`;
      
      let bgColor = "#4285f4";
      if (tags.length > 0) {
        bgColor = TAGS[tags[0].toLowerCase()] || bgColor;
      }
      eventBlock.style.backgroundColor = bgColor + "30";
      eventBlock.style.borderLeftColor = bgColor;
      
      eventBlock.innerHTML = `
        <div class="week-event-time">${event.hora}</div>
        <div class="week-event-text">${cleanText}</div>
        ${tags.length > 0 ? `<div class="week-event-tags">${tags.join(" ")}</div>` : ''}
      `;
      
      eventBlock.addEventListener('click', () => {
        selectedDate = dateKey;
        showEvents();
      });
      
      eventsContainer.appendChild(eventBlock);
    });
    
    dayColumn.appendChild(eventsContainer);
    weekDaysGrid.appendChild(dayColumn);
  });

  const startDay = weekDays[0].getDate();
  const endDay = weekDays[6].getDate();
  const startMonth = MONTHS[weekDays[0].getMonth()];
  const endMonth = MONTHS[weekDays[6].getMonth()];
  
  if (startMonth === endMonth) {
    monthTitle.textContent = `${startMonth} ${startDay}-${endDay}`;
  } else {
    monthTitle.textContent = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
  yearTitle.textContent = weekDays[0].getFullYear();
}

// ============================================
// VISTA MENSUAL
// ============================================

function renderCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = MONTHS[month];
  yearTitle.textContent = year;

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i < adjustedFirstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day empty";
    daysContainer.appendChild(emptyDay);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = getDateKey(year, month, d);

    const day = document.createElement("div");
    day.className = "day";
    day.setAttribute("data-date", dateKey);

    if (isCurrentMonth && d === today.getDate()) {
      day.classList.add("today");
    }

    if (dateKey === selectedDate) {
      day.classList.add("selected");
    }

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    day.appendChild(num);

    if (events[dateKey] && events[dateKey].length > 0) {
      const deco = document.createElement("div");
      deco.className = "decoration";
      deco.textContent = DECORATIONS[d % DECORATIONS.length];
      deco.title = `${events[dateKey].length} evento(s)`;
      day.appendChild(deco);
    }

    day.onclick = () => selectDay(dateKey);

    daysContainer.appendChild(day);
  }
}

// ============================================
// ALTERNAR VISTAS
// ============================================

function toggleView() {
  if (currentView === "month") {
    currentView = "week";
    daysContainer.style.display = "none";
    weekView.style.display = "block";
    viewToggleBtn.textContent = "📅 Vista Mensual";
    
    setWeekFromDate(currentDate);
    renderWeekView();
  } else {
    currentView = "month";
    daysContainer.style.display = "grid";
    weekView.style.display = "none";
    viewToggleBtn.textContent = "📊 Vista Semanal";
    
    renderCalendar();
  }
  animatePage();
}

// ============================================
// GESTIÓN DE EVENTOS
// ============================================

function selectDay(dateKey) {
  selectedDate = dateKey;
  showEvents();
  if (currentView === "month") {
    renderCalendar();
  }
}

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

  const sortedEvents = [...events[selectedDate]].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  sortedEvents.forEach((ev, index) => {
    const item = document.createElement("div");
    item.className = "event-item";

    const tags = extractTags(ev.texto);
    const cleanText = removeTagsFromText(ev.texto);

    const text = document.createElement("span");
    text.className = "event-text";
    
    let reminderText = "";
    if (ev.reminder) {
      reminderText = ` 🔔${ev.reminder}min`;
    }
    
    text.innerHTML = `
      🕒 ${ev.hora} – ${cleanText}${reminderText}<br>
      ${tags.length > 0 ? renderTagsHTML(tags) : ''}
    `;

    const actions = document.createElement("span");
    actions.className = "event-actions";

    const edit = document.createElement("button");
    edit.className = "event-btn edit-btn";
    edit.textContent = "✏️";
    edit.title = "Editar evento";
    edit.onclick = (e) => {
      e.stopPropagation();
      editEvent(index);
    };

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

function editEvent(index) {
  const ev = events[selectedDate][index];
  const hora = prompt("Editar hora (ej: 08:30):", ev.hora);
  
  if (hora === null) return;
  
  const texto = prompt(
    "Editar evento:\n\nPuedes usar etiquetas como:\n#trabajo #personal #importante #urgente #salud #familia #estudio #deporte",
    ev.texto
  );
  
  if (texto === null) return;

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  const wantsReminder = confirm("¿Quieres recibir un recordatorio para este evento?");
  let reminder = null;
  
  if (wantsReminder) {
    const reminderInput = prompt(
      "¿Cuántos minutos antes quieres el recordatorio?\n(Ejemplos: 5, 10, 15, 30, 60)",
      ev.reminder || "15"
    );
    
    if (reminderInput !== null && reminderInput.trim() !== "") {
      const reminderMinutes = parseInt(reminderInput);
      if (!isNaN(reminderMinutes) && reminderMinutes > 0) {
        reminder = reminderMinutes;
        if (Notification.permission === "default") {
          requestNotificationPermission();
        }
      }
    }
  }

  events[selectedDate][index] = { 
    hora: hora.trim(), 
    texto: texto.trim(),
    reminder: reminder,
    notified: false
  };
  
  saveEvents();
  showEvents();
  
  if (currentView === "month") {
    renderCalendar();
  } else {
    renderWeekView();
  }
  
  startNotificationCheck();
}

function deleteEvent(index) {
  if (!confirm("¿Eliminar este evento?")) return;

  events[selectedDate].splice(index, 1);
  
  if (events[selectedDate].length === 0) {
    delete events[selectedDate];
  }

  saveEvents();
  showEvents();
  
  if (currentView === "month") {
    renderCalendar();
  } else {
    renderWeekView();
  }
}

function addEvent() {
  if (!selectedDate) {
    alert("Selecciona un día primero");
    return;
  }

  const hora = prompt("Hora (ej: 08:30):");
  if (hora === null) return;

  const texto = prompt(
    "Evento:\n\nPuedes usar etiquetas como:\n#trabajo #personal #importante #urgente #salud #familia #estudio #deporte"
  );
  if (texto === null) return;

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  const wantsReminder = confirm("¿Quieres recibir un recordatorio para este evento?");
  let reminder = null;
  
  if (wantsReminder) {
    const reminderInput = prompt(
      "¿Cuántos minutos antes quieres el recordatorio?\n(Ejemplos: 5, 10, 15, 30, 60)",
      "15"
    );
    
    if (reminderInput !== null && reminderInput.trim() !== "") {
      const reminderMinutes = parseInt(reminderInput);
      if (!isNaN(reminderMinutes) && reminderMinutes > 0) {
        reminder = reminderMinutes;
        
        if (Notification.permission === "default") {
          requestNotificationPermission();
        } else if (Notification.permission === "denied") {
          alert("Las notificaciones están bloqueadas. Por favor, actívalas en la configuración de tu navegador.");
        }
      }
    }
  }

  if (!events[selectedDate]) {
    events[selectedDate] = [];
  }

  events[selectedDate].push({ 
    hora: hora.trim(), 
    texto: texto.trim(),
    reminder: reminder,
    notified: false
  });

  saveEvents();
  showEvents();
  
  if (currentView === "month") {
    renderCalendar();
  } else {
    renderWeekView();
  }
  
  startNotificationCheck();
}

// ============================================
// NAVEGACIÓN
// ============================================

function goToPrev() {
  if (currentView === "month") {
    currentDate.setMonth(currentDate.getMonth() - 1);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  }
  
  selectedDate = null;
  animatePage();
  showEvents();
  
  if (currentView === "month") {
    renderCalendar();
  } else {
    renderWeekView();
  }
}

function goToNext() {
  if (currentView === "month") {
    currentDate.setMonth(currentDate.getMonth() + 1);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  selectedDate = null;
  animatePage();
  showEvents();
  
  if (currentView === "month") {
    renderCalendar();
  } else {
    renderWeekView();
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

addEventBtn.addEventListener("click", addEvent);
prevBtn.addEventListener("click", goToPrev);
nextBtn.addEventListener("click", goToNext);
viewToggleBtn.addEventListener("click", toggleView);

let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchEvents(e.target.value);
  }, 300);
});

let notesTimeout;
if (notesArea) {
  notesArea.addEventListener("input", () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveNotes, 500);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && e.ctrlKey) {
    goToPrev();
  } else if (e.key === "ArrowRight" && e.ctrlKey) {
    goToNext();
  } else if (e.key === "n" && e.ctrlKey) {
    e.preventDefault();
    addEvent();
  } else if (e.key === "v" && e.ctrlKey) {
    e.preventDefault();
    toggleView();
  }
});

// ============================================
// INICIALIZACIÓN
// ============================================

loadData();
renderCalendar();

if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => {
    if (confirm("¿Quieres activar las notificaciones para recibir recordatorios de tus eventos?")) {
      requestNotificationPermission();
    }
  }, 2000);
}

startNotificationCheck();
