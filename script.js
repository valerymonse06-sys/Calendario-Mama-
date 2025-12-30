const daysContainer = document.getElementById("days");
const monthTitle = document.getElementById("monthTitle");
const yearTitle = document.getElementById("yearTitle");
const eventsList = document.getElementById("eventsList");

let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem("events")) || {};

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
    daysContainer.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateKey = `${year}-${month + 1}-${d}`;
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = d;

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
    p.textContent = ev;
    eventsList.appendChild(p);
  });
}

renderCalendar();
