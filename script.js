// --- VARIABLES ---
let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem("events")) || {};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// --- SEGURIDAD ---
function checkSecurity() {
    const savedPin = localStorage.getItem("app_pin");
    if (!savedPin) {
        const newPin = prompt("Bienvenida ✨ Crea un PIN de acceso (mínimo 4 números):");
        if (newPin && newPin.length >= 4) {
            localStorage.setItem("app_pin", btoa(newPin));
        } else {
            window.location.reload();
        }
    } else {
        const pass = prompt("Introduce tu PIN para entrar:");
        if (btoa(pass) !== savedPin) {
            alert("Acceso incorrecto.");
            document.body.innerHTML = "<h1>🔒 Acceso bloqueado. Recarga para reintentar.</h1>";
            throw new Error("Unauthorized");
        }
    }
}

// --- CALENDARIO ---
function renderCalendar() {
    const daysContainer = document.getElementById("days");
    daysContainer.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById("monthTitle").textContent = MONTHS[month];
    document.getElementById("yearTitle").textContent = year;

    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i < adjustedFirstDay; i++) {
        daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    for (let d = 1; d <= lastDate; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
        const hasEvents = events[dateKey] ? "🌸" : "";
        
        const dayEl = document.createElement("div");
        dayEl.className = `day ${isToday ? 'today' : ''} ${dateKey === selectedDate ? 'selected' : ''}`;
        dayEl.innerHTML = `<span>${d}</span><div style="font-size:1.5rem; text-align:right">${hasEvents}</div>`;
        dayEl.onclick = () => {
            selectedDate = dateKey;
            renderCalendar();
            showEvents();
        };
        daysContainer.appendChild(dayEl);
    }
}

// --- EVENTOS ---
function showEvents() {
    const list = document.getElementById("eventsList");
    list.innerHTML = "";
    if (!selectedDate || !events[selectedDate]) {
        list.innerHTML = "No hay planes para hoy";
        return;
    }

    events[selectedDate].forEach((ev, idx) => {
        list.innerHTML += `
            <div class="event-item">
                <span>${ev.hora} - ${ev.texto}</span>
                <button onclick="deleteEvent(${idx})" style="border:none; background:none; cursor:pointer">❌</button>
            </div>`;
    });
}

function addEvent() {
    if (!selectedDate) return alert("Selecciona un día");
    const hora = prompt("Hora (HH:MM):", "10:00");
    const texto = prompt("¿Qué hay que hacer?");
    
    if (hora && texto) {
        if (!events[selectedDate]) events[selectedDate] = [];
        events[selectedDate].push({ hora, texto });
        localStorage.setItem("events", JSON.stringify(events));
        renderCalendar();
        showEvents();
    }
}

function deleteEvent(idx) {
    events[selectedDate].splice(idx, 1);
    localStorage.setItem("events", JSON.stringify(events));
    showEvents();
    renderCalendar();
}

// --- BÚSQUEDA ---
document.getElementById("searchOpenBtn").onclick = () => {
    const q = prompt("🔍 ¿Qué buscas?");
    if (!q) return;
    let found = [];
    Object.keys(events).forEach(date => {
        events[date].forEach(e => {
            if (e.texto.toLowerCase().includes(q.toLowerCase())) found.push(`${date}: ${e.texto}`);
        });
    });
    alert(found.length ? found.join("\n") : "No se encontró nada.");
};

// --- NAVEGACIÓN ---
document.getElementById("prev").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById("next").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
document.getElementById("addEventBtn").onclick = addEvent;
document.getElementById("resetPinBtn").onclick = () => {
    if(confirm("¿Quieres cambiar tu PIN?")) { localStorage.removeItem("app_pin"); location.reload(); }
};

// --- NOTAS ---
const notesArea = document.getElementById("notesArea");
notesArea.value = localStorage.getItem("notes") || "";
notesArea.oninput = () => localStorage.setItem("notes", notesArea.value);

// --- INICIO ---
checkSecurity();
renderCalendar();
