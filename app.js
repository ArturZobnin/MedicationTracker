

        // Получаем текущую дату
        const currentDate = new Date();

        const dateOptions = {
            day: "numeric",
            month: "long",
            weekday: "long"
        };

        document.getElementById("currentDate").textContent =
            currentDate.toLocaleDateString("ru-RU", dateOptions);

// Стандартный список лекарств
const defaultMedications = [
    {
        id: 1,
        name: "Верошпирон",
        dosage: "50 мг",
        time: "08:00",
        days: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        id: 2,
        name: "Афобазол",
        dosage: "1 таблетка",
        time: "08:30",
        days: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        id: 3,
        name: "Аскорутин",
        dosage: "1 таблетка",
        time: "08:30",
        days: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        id: 4,
        name: "Аевит",
        dosage: "1 капсула",
        time: "08:30",
        days: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        id: 5,
        name: "Энтерол",
        dosage: "2 капсулы",
        time: "11:00",
        days: [1, 2, 3, 4, 5, 6, 7]
    }
];

// Загружаем список лекарств
const savedMedications = localStorage.getItem("medicationsList");

let medications = savedMedications
    ? JSON.parse(savedMedications)
    : defaultMedications;


// Загружаем историю приёма лекарств
const savedHistory = localStorage.getItem("medicationHistory");

let medicationHistory = savedHistory
    ? JSON.parse(savedHistory)
    : {};

// Получаем номер текущего дня недели
function getTodayWeekday() {

    const day = new Date().getDay();

    // В JavaScript воскресенье = 0.
    // Переводим его в нашу систему: воскресенье = 7.
    return day === 0 ? 7 : day;

}

// Проверяем, назначено ли лекарство на сегодняшний день
function isScheduledOnDate(medication, dateString) {

    const date = new Date(dateString + "T00:00:00");

    // Проверяем дату начала приёма
    if (medication.startDate) {
        const startDate = new Date(medication.startDate + "T00:00:00");

        if (date < startDate) {
            return false;
        }
    }

    // Проверяем дату окончания приёма
    if (medication.endDate) {
        const endDate = new Date(medication.endDate + "T00:00:00");

        if (date > endDate) {
            return false;
        }
    }

    // Получаем день недели
    const weekday = date.getDay() === 0
        ? 7
        : date.getDay();

    // Если расписание отсутствует, считаем препарат ежедневным
    const days = medication.days || [1, 2, 3, 4, 5, 6, 7];

    return days.includes(weekday);

}


// Проверяем расписание на сегодня
function isScheduledToday(medication) {

    const today = new Date().toISOString().slice(0, 10);

    return isScheduledOnDate(medication, today);

}

// Определяем период суток по времени приёма
function getTimePeriod(time) {
    const hour = Number(time.split(":")[0]);

    if (hour >= 5 && hour < 12) {
        return "morning";
    }

    if (hour >= 12 && hour < 18) {
        return "day";
    }

    if (hour >= 18 && hour < 24) {
        return "evening";
    }

    return "night";
}

// Получаем дату в формате YYYY-MM-DD
function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

// Получаем историю сегодняшнего дня
function getTodayHistory() {

    const today = getTodayDate();

    // Если сегодняшней истории нет — создаём её
    if (!medicationHistory[today]) {

        medicationHistory[today] = {};

    }

    return medicationHistory[today];

}

// Сохраняем всю историю
function saveHistory() {

    localStorage.setItem(
        "medicationHistory",
        JSON.stringify(medicationHistory)
    );

}

// Сохраняем список лекарств
function saveMedications() {

    localStorage.setItem(
        "medicationsList",
        JSON.stringify(medications)
    );

}

// Отображаем лекарства
function renderMedications() {

    const medicationList =
        document.getElementById("medicationList");

    medicationList.innerHTML = "";

    const todayHistory = getTodayHistory();

    const todayMedications =
        medications.filter(isScheduledToday);

    // Группируем лекарства по времени суток
    const medicationGroups = {
        morning: [],
        day: [],
        evening: [],
        night: []
    };

    // Распределяем лекарства по группам
    todayMedications.forEach(medication => {

        const period = getTimePeriod(medication.time);

        medicationGroups[period].push(medication);

    });

    // Настройки отображения групп
    const periodSettings = {
        morning: {
            title: "Утро",
            icon: "🌅"
        },
        day: {
            title: "День",
            icon: "☀️"
        },
        evening: {
            title: "Вечер",
            icon: "🌙"
        },
        night: {
            title: "Ночь",
            icon: "🌃"
        }
    };

    // Формируем HTML каждой группы
    Object.keys(medicationGroups).forEach(period => {

        const group = medicationGroups[period];

        // Пропускаем пустые группы
        if (group.length === 0) return;

        const settings = periodSettings[period];

      // Подсчитываем принятые лекарства в группе
const takenCount = group.filter(medication =>
    todayHistory[medication.id] === true
).length;

const totalCount = group.length;

const progressPercentage =
    totalCount > 0
        ? (takenCount / totalCount) * 100
        : 0;

        const groupSection = document.createElement("section");

        groupSection.className = "medication-group";

        groupSection.innerHTML = `
    <div class="group-header">

        <h3 class="group-title">
            ${settings.icon} ${settings.title}
        </h3>

        <span class="group-progress">
            ${takenCount} из ${totalCount}
        </span>

    </div>

    <div class="group-progress-bar">
        <div
            class="group-progress-fill"
            style="width: ${progressPercentage}%"
        ></div>
    </div>

    <div class="group-medications"></div>
`;

        const groupContainer =
            groupSection.querySelector(".group-medications");

        group.forEach(medication => {

            const isTaken =
                todayHistory[medication.id] === true;

            const card =
                createMedicationCard(medication, isTaken);

            groupContainer.appendChild(card);

        });

        medicationList.appendChild(groupSection);

    });

    updateProgress();

}

// Создаём HTML карточки лекарства
function createMedicationCard(medication, isTaken) {

    const card = document.createElement("div");

    card.className = "medication";

    card.innerHTML = `
        <div class="med-icon">💊</div>

        <div class="med-info">

            <div class="med-name">
                ${medication.name}
            </div>

            <div class="med-details">
                ${medication.time} · ${medication.dosage}
            </div>

        </div>

        <button
            class="taken-button ${isTaken ? "done" : ""}"
            onclick="toggleMedication(${medication.id})"
        >
            ${isTaken ? "✓ Принято" : "Принять"}
        </button>

        <div class="med-actions">

            <button
                class="edit-button"
                onclick="editMedication(${medication.id})"
                title="Редактировать"
            >
                ✏️
            </button>

            <button
                class="delete-button"
                onclick="deleteMedication(${medication.id})"
                title="Удалить"
            >
                🗑️
            </button>

        </div>
    `;

    return card;
}

// Отмечаем приём лекарства
function toggleMedication(id) {

    const todayHistory = getTodayHistory();

    // Если принято — отменяем отметку.
    // Если не принято — отмечаем.
    todayHistory[id] = !todayHistory[id];

    saveHistory();

    renderMedications();

}
        // Обновляем прогресс
function updateProgress() {

    const todayHistory = getTodayHistory();

    // Лекарства, назначенные на сегодня
const todayMedications = medications.filter(isScheduledToday);

// Группируем лекарства по времени суток
const medicationGroups = {
    morning: [],
    day: [],
    evening: [],
    night: []
};

// Распределяем лекарства по группам
todayMedications.forEach(medication => {
    const period = getTimePeriod(medication.time);

    medicationGroups[period].push(medication);
});

// Настройки отображения групп
const periodSettings = {
    morning: {
        title: "Утро",
        icon: "🌅"
    },
    day: {
        title: "День",
        icon: "☀️"
    },
    evening: {
        title: "Вечер",
        icon: "🌙"
    },
    night: {
        title: "Ночь",
        icon: "🌃"
    }
};

  // HTML для групп лекарств
let groupedHTML = "";

const total = todayMedications.length;

// Считаем только отмеченные препараты из сегодняшнего расписания
const taken = todayMedications.filter(function (medication) {
    return todayHistory[medication.id] === true;
}).length;

    document.getElementById("progressNumbers").textContent =
        `${taken} из ${total}`;

    const percentage = total === 0
        ? 0
        : (taken / total) * 100;

    document.getElementById("progressFill").style.width =
        percentage + "%";

}

        // Запуск приложения
        renderMedications();


// Переключение вкладок
function switchPage(pageId, navElement) {

    // Скрываем все страницы
    document.querySelectorAll(".page").forEach(function (page) {

        page.classList.remove("active");

    });

    // Показываем нужную страницу
    document.getElementById(pageId).classList.add("active");

    // Убираем активность со всех кнопок навигации
    document.querySelectorAll(".nav-item").forEach(function (item) {

        item.classList.remove("active");

    });

    // Активируем выбранную кнопку
    navElement.classList.add("active");

    // Если открыта история — обновляем её
    if (pageId === "historyPage") {

        renderHistory();

    }

}

// Отображаем историю за выбранную дату

function renderHistory() {

    const dateInput = document.getElementById("historyDate");

    // Если дата не выбрана — используем сегодняшнюю
    if (!dateInput.value) {
        dateInput.value = getTodayDate();
    }

    const selectedDate = dateInput.value;

    const dayHistory = medicationHistory[selectedDate] || {};

    const list = document.getElementById("historyMedicationList");

    list.innerHTML = "";

// Оставляем только препараты, назначенные на выбранную дату
const scheduledMedications = medications.filter(function (medication) {

    return isScheduledOnDate(medication, selectedDate);

});

    let takenCount = 0;

    const total = scheduledMedications.length;

    scheduledMedications.forEach(function (medication) {

        const isTaken = dayHistory[medication.id] === true;

        if (isTaken) {
            takenCount++;
        }

        const card = document.createElement("div");

        card.className = "medication";

        card.innerHTML = `
            <div class="med-icon">💊</div>

            <div class="med-info">

                <div class="med-name">
                    ${medication.name}
                </div>

                <div class="med-details">
                    ${medication.time} · ${medication.dosage}
                </div>

                <div class="history-status ${isTaken ? "taken" : "not-taken"}">
                    ${isTaken ? "Принято" : "Не отмечено"}
                </div>

            </div>

            <div class="history-button ${isTaken ? "taken" : "not-taken"}">
                ${isTaken ? "✓" : "—"}
            </div>
        `;

        list.appendChild(card);

    });

    // Обновляем статистику
    document.getElementById("historyProgressNumbers").textContent =
        `${takenCount} из ${total}`;

    const percentage = total === 0
        ? 0
        : (takenCount / total) * 100;

    document.getElementById("historyProgressFill").style.width =
        percentage + "%";

}



// Слушаем изменение даты
document.getElementById("historyDate").addEventListener(
    "change",
    renderHistory
);


// Получаем выбранные дни недели из формы
function getSelectedDays() {

    const checkboxes = document.querySelectorAll(
        'input[name="medicationDay"]:checked'
    );

    return Array.from(checkboxes).map(function (checkbox) {

        return Number(checkbox.value);

    });

}
// Открываем форму добавления
function openMedicationForm() {

    document.getElementById("medicationForm").reset();
    // По умолчанию выбираем все дни недели
document.querySelectorAll('input[name="medicationDay"]').forEach(
    function (checkbox) {

        checkbox.checked = true;

    }
);

    document.getElementById("medicationId").value = "";

    document.getElementById("modalTitle").textContent =
        "Новое лекарство";

    document.getElementById("medicationModal").classList.add("open");

}


// Закрываем форму
function closeMedicationForm() {

    document.getElementById("medicationModal").classList.remove("open");

}


// Редактируем препарат
function editMedication(id) {

    const medication = medications.find(function (item) {
        return item.id === id;
    });

    if (!medication) {
        return;
    }

  if (!medication.days) {

    medication.days = [1, 2, 3, 4, 5, 6, 7];

  }

  saveMedications();

    document.getElementById("medicationId").value =
        medication.id;

    document.getElementById("medicationName").value =
        medication.name;

    document.getElementById("medicationDosage").value =
        medication.dosage;

    document.getElementById("medicationTime").value =
        medication.time;

  // Отображаем сохранённые дни приёма
document.querySelectorAll('input[name="medicationDay"]').forEach(
    function (checkbox) {

        checkbox.checked = medication.days.includes(
            Number(checkbox.value)
        );

    }
);

    document.getElementById("modalTitle").textContent =
        "Редактирование";

    document.getElementById("medicationModal").classList.add("open");

}


// Удаляем препарат
function deleteMedication(id) {

    const medication = medications.find(function (item) {
        return item.id === id;
    });

    if (!medication) {
        return;
    }

    const confirmed = confirm(
        `Удалить препарат "${medication.name}"?`
    );

    if (!confirmed) {
        return;
    }

    medications = medications.filter(function (item) {
        return item.id !== id;
    });

    saveMedications();

    renderMedications();

    if (document.getElementById("historyPage").classList.contains("active")) {
        renderHistory();
    }

}


// Обрабатываем сохранение формы
document.getElementById("medicationForm").addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const id = document.getElementById("medicationId").value;

        const name = document.getElementById("medicationName").value.trim();

        const dosage = document.getElementById("medicationDosage").value.trim();

        const time = document.getElementById("medicationTime").value;

      // Получаем выбранные дни недели
const days = getSelectedDays();

if (!name || !dosage || !time || days.length === 0) {

    if (days.length === 0) {
        alert("Выберите хотя бы один день приёма");
    }

    return;

}

        // Редактирование существующего препарата
        if (id) {

            const medication = medications.find(function (item) {
                return item.id === Number(id);
            });

            if (medication) {

                medication.name = name;
                medication.dosage = dosage;
                medication.time = time;
                medication.days = days;

            }

        } else {

            // Создание нового препарата
const newMedication = {

    id: Date.now(),

    name: name,

    dosage: dosage,

    time: time,

    days: days

};

            medications.push(newMedication);

        }

        // Сортируем по времени
        medications.sort(function (a, b) {

            return a.time.localeCompare(b.time);

        });

        saveMedications();

        renderMedications();

        closeMedicationForm();

    }
);

