const daysContainer = document.getElementById("days");
const monthYear = document.getElementById("monthYear");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("events")) || {};

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function renderCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  monthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    daysContainer.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.textContent = day;

    if (events[dateKey]) {
      dayDiv.classList.add("has-event");
    }

    dayDiv.addEventListener("click", () => {
      const text = prompt("¿Qué evento quieres agregar?");
      if (text) {
        if (!events[dateKey]) events[dateKey] = [];
        events[dateKey].push(text);
        saveEvents();
        renderCalendar();
      }
    });

    daysContainer.appendChild(dayDiv);
  }
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
