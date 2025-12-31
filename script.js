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
let notificationCheckInterval = null;

// Constantes
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DECORATIONS = ["🦋", "🌸", "🍄", "✨", "🎀", "🧸", "🪐", "🌼", "🍁"];

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

// Solicitar permiso para notificaciones
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          showNotification("¡Notificaciones activadas!", "Ahora recibirás recordatorios de tus eventos 🎉");
        }
      });
    }
  } else {
    console.log("Este navegador no soporta notificaciones");
  }
}

// Reproducir sonido de notificación
function playNotificationSound() {
  // Crear contexto de audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Crear oscilador para el sonido
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Configurar sonido agradable (campana suave)
  oscillator.type = 'sine';
  
  // Secuencia de notas para un sonido tipo campana
  const now = audioContext.currentTime;
  
  // Primera nota
  oscillator.frequency.setValueAtTime(800, now);
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  // Segunda nota (más aguda)
  oscillator.frequency.setValueAtTime(1000, now + 0.15);
  gainNode.gain.setValueAtTime(0.2, now + 0.15);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}

// Mostrar notificación
function showNotification(title, body, icon = "🔔") {
  if ("Notification" in window && Notification.permission === "granted") {
    // Reproducir sonido personalizado
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

// Verificar eventos próximos
function checkUpcomingEvents() {
  const now = new Date();
  
  Object.keys(events).forEach(dateKey => {
    events[dateKey].forEach(event => {
      if (!event.notified && event.reminder) {
        const [year, month, day] = dateKey.split("-").map(Number);
        const [hours, minutes] = event.hora.split(":").map(Number);
        
        const eventDate = new Date(year, month - 1, day, hours, minutes);
        const timeDiff = eventDate - now;
        
        // Convertir minutos de recordatorio a milisegundos
        const reminderTime = event.reminder * 60 * 1000;
        
        // Si falta exactamente el tiempo del recordatorio (con margen de 1 minuto)
        if (timeDiff > 0 && timeDiff <= reminderTime && timeDiff > (reminderTime - 60000)) {
          showNotification(
            `📅 Recordatorio: ${event.texto}`,
            `Evento a las ${event.hora} - ${event.reminder} minutos antes`,
            "⏰"
          );
          event.notified = true;
          saveEvents();
        }
        
        // Resetear notificación si el evento ya pasó
        if (timeDiff < 0) {
          event.notified = false;
          saveEvents();
        }
      }
    });
  });
}

// Iniciar verificación de notificaciones
function startNotificationCheck() {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  // Verificar cada 30 segundos
  notificationCheckInterval = setInterval(checkUpcomingEvents, 30000);
  // Verificar inmediatamente
  checkUpcomingEvents();
}

// ============================================
// FUNCIONES DE DATOS
// ============================================

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
  void notebook.offsetWidth;
  notebook.classList.add("animate");
}

// ============================================
// RENDERIZADO DEL CALENDARIO
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
// GESTIÓN DE EVENTOS
// ============================================

function selectDay(dateKey) {
  selectedDate = dateKey;
  showEvents();
  renderCalendar();
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

    const text = document.createElement("span");
    text.className = "event-text";
    
    let reminderText = "";
    if (ev.reminder) {
      reminderText = ` 🔔${ev.reminder}min`;
    }
    
    text.textContent = `🕒 ${ev.hora} – ${ev.texto}${reminderText}`;

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
  
  const texto = prompt("Editar evento:", ev.texto);
  
  if (texto === null) return;

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  // Preguntar por recordatorio
  const wantsReminder = confirm("¿Quieres recibir un recordatorio para este evento?");
  let reminder = null;
  
  if (wantsReminder) {
    const reminderInput = prompt(
      "¿Cuántos minutos antes quieres el recordatorio?\n" +
      "(Ejemplos: 5, 10, 15, 30, 60)",
      ev.reminder || "15"
    );
    
    if (reminderInput !== null && reminderInput.trim() !== "") {
      const reminderMinutes = parseInt(reminderInput);
      if (!isNaN(reminderMinutes) && reminderMinutes > 0) {
        reminder = reminderMinutes;
        
        // Solicitar permiso si no lo tiene
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
  renderCalendar();
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
  renderCalendar();
}

function addEvent() {
  if (!selectedDate) {
    alert("Selecciona un día primero");
    return;
  }

  const hora = prompt("Hora (ej: 08:30):");
  if (hora === null) return;

  const texto = prompt("Evento:");
  if (texto === null) return;

  if (!hora.trim() || !texto.trim()) {
    alert("La hora y el evento no pueden estar vacíos");
    return;
  }

  // Preguntar por recordatorio
  const wantsReminder = confirm("¿Quieres recibir un recordatorio para este evento?");
  let reminder = null;
  
  if (wantsReminder) {
    const reminderInput = prompt(
      "¿Cuántos minutos antes quieres el recordatorio?\n" +
      "(Ejemplos: 5, 10, 15, 30, 60)",
      "15"
    );
    
    if (reminderInput !== null && reminderInput.trim() !== "") {
      const reminderMinutes = parseInt(reminderInput);
      if (!isNaN(reminderMinutes) && reminderMinutes > 0) {
        reminder = reminderMinutes;
        
        // Solicitar permiso si no lo tiene
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
  renderCalendar();
  startNotificationCheck();
}

// ============================================
// NAVEGACIÓN
// ============================================

function goToPrevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  selectedDate = null;
  animatePage();
  showEvents();
  renderCalendar();
}

function goToNextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  selectedDate = null;
  animatePage();
  showEvents();
  renderCalendar();
}

// ============================================
// EVENT LISTENERS
// ============================================

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

// ============================================
// INICIALIZACIÓN
// ============================================

loadData();
renderCalendar();

// Solicitar permiso de notificaciones al cargar
if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => {
    if (confirm("¿Quieres activar las notificaciones para recibir recordatorios de tus eventos?")) {
      requestNotificationPermission();
    }
  }, 2000);
}

// Iniciar verificación de notificaciones
startNotificationCheck();
