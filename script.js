
// ==========================================
// STUDYFLOW
// Clean & Complete JavaScript
// ==========================================


// ==========================================
// STORAGE
// ==========================================

const STORAGE_KEYS = {
    tasks: "studyTasks",
    tasksInitialized: "studyTasksInitialized",
    sessions: "studySessions",
    plans: "studyFlowPlans",
    reminders: "studyReminders",
    settings: "studyFlowSettings"
};


function getStorage(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

    } catch (error) {
        console.error(`Storage error for ${key}:`, error);
        return fallback;
    }
}


function saveStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


// ==========================================
// STATE
// ==========================================

let tasks = getStorage(STORAGE_KEYS.tasks, []);
let sessions = getStorage(STORAGE_KEYS.sessions, []);
let plans = getStorage(STORAGE_KEYS.plans, []);
let reminders = getStorage(STORAGE_KEYS.reminders, []);

let settings = getStorage(
    STORAGE_KEYS.settings,
    {
        theme: "light",
        focusDuration: 25,
        bedtime: "23:00",
        wakeTime: "07:00"
    }
);


// ==========================================
// DOM ELEMENTS
// ==========================================

const clockElement =
    document.getElementById("clock");

const dateElement =
    document.getElementById("currentDate");


// Timer
const timerDisplay =
    document.getElementById("timer");

const startBtn =
    document.getElementById("startBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resetBtn =
    document.getElementById("resetBtn");

const subjectSelect =
    document.getElementById("subject");


// Tasks
const taskInput =
    document.getElementById("taskInput");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskList =
    document.getElementById("taskList");


// Planner
const planDate =
    document.getElementById("planDate");

const planSubject =
    document.getElementById("planSubject");

const planTask =
    document.getElementById("planTask");

const addPlanBtn =
    document.getElementById("addPlanBtn");

const plansList =
    document.getElementById("plansList");


// Reminders
const reminderText =
    document.getElementById("reminderText");

const reminderTime =
    document.getElementById("reminderTime");

const addReminderBtn =
    document.getElementById("addReminderBtn");

const remindersList =
    document.getElementById("remindersList");

const dashboardReminderBtn =
    document.getElementById("dashboardReminderBtn");


// Settings
const themeSelect =
    document.getElementById("themeSelect");

const focusDurationSelect =
    document.getElementById("focusDuration");

const bedtimeInput =
    document.querySelector('input#bedtime');

const wakeTimeInput =
    document.querySelector('input#wakeTime');

const bedtimeDisplay =
    document.querySelector('strong#bedtime');

const wakeTimeDisplay =
    document.querySelector('strong#wakeTime');


// ==========================================
// CLOCK
// ==========================================

function updateClock() {

    const now = new Date();

    if (clockElement) {

        clockElement.textContent =
            now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    }

    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
    }
}


updateClock();

setInterval(updateClock, 1000);


// ==========================================
// GREETING
// ==========================================

function updateGreeting() {

    const greeting =
        document.querySelector(".top-header h1");

    if (!greeting) return;

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.innerHTML =
            "Good morning ☀️";

    } else if (hour < 18) {

        greeting.innerHTML =
            "Good afternoon 🌤️";

    } else {

        greeting.innerHTML =
            "Good evening 🌙";
    }
}


updateGreeting();


// ==========================================
// FOCUS TIMER
// ==========================================

let timerSeconds =
    Number(settings.focusDuration || 25) * 60;

let timerInterval = null;

let timerRunning = false;


function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


function updateTimerDisplay() {

    if (!timerDisplay) return;

    timerDisplay.textContent =
        formatTime(timerSeconds);
}


function startTimer() {

    if (timerRunning) return;

    timerRunning = true;

    timerInterval =
        setInterval(() => {

            if (timerSeconds > 0) {

                timerSeconds--;

                updateTimerDisplay();

            } else {

                finishStudySession();
            }

        }, 1000);
}


function pauseTimer() {

    timerRunning = false;

    if (timerInterval !== null) {

        clearInterval(timerInterval);

        timerInterval = null;
    }
}


function resetTimer() {

    pauseTimer();

    timerSeconds =
        Number(settings.focusDuration || 25) * 60;

    updateTimerDisplay();
}


function finishStudySession() {

    pauseTimer();

    const subject =
        subjectSelect
            ? subjectSelect.value
            : "Study";

    const minutes =
        Number(settings.focusDuration || 25);


    const session = {

        id: Date.now(),

        subject: subject,

        minutes: minutes,

        date: new Date().toISOString()
    };


    sessions.push(session);

    saveStorage(
        STORAGE_KEYS.sessions,
        sessions
    );


    updateDashboard();

    updateAnalytics();

    playAlarm();


    alert(
        `🎉 Great job!\n\nYou completed a ${minutes}-minute ${subject} session.`
    );


    resetTimer();
}


if (startBtn) {

    startBtn.addEventListener(
        "click",
        startTimer
    );
}


if (pauseBtn) {

    pauseBtn.addEventListener(
        "click",
        pauseTimer
    );
}


if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        resetTimer
    );
}


updateTimerDisplay();


// ==========================================
// TASKS
// ==========================================


// Add default task only the first time
const defaultTask = {

    id: "review-data-mining",

    text: "Review Data Mining",

    completed: false
};


const tasksInitialized =
    localStorage.getItem(
        STORAGE_KEYS.tasksInitialized
    );


if (!tasksInitialized) {

    if (
        !tasks.some(
            task => task.id === defaultTask.id
        )
    ) {

        tasks.unshift(defaultTask);
    }

    saveStorage(
        STORAGE_KEYS.tasks,
        tasks
    );

    localStorage.setItem(
        STORAGE_KEYS.tasksInitialized,
        "true"
    );
}


function createTaskElement(task) {

    const taskItem =
        document.createElement("div");

    taskItem.className =
        "task-item";

    taskItem.dataset.id =
        String(task.id);


    if (task.completed) {

        taskItem.classList.add(
            "completed"
        );
    }


    taskItem.innerHTML = `

        <div>
            <h3>${escapeHTML(task.text)}</h3>
            <p>Study task</p>
        </div>

        <div class="task-actions">

            <button
                class="complete-task"
                type="button">
                ✓
            </button>

            <button
                class="delete-task"
                type="button">
                ✕
            </button>

        </div>

    `;


    return taskItem;
}


function renderTasks() {

    if (!taskList) return;

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty-state">

                <span>📝</span>

                <p>No tasks yet.</p>

                <small>
                    Add your first study task!
                </small>

            </div>

        `;

        updateAnalytics();

        return;
    }


    tasks.forEach(task => {

        taskList.appendChild(
            createTaskElement(task)
        );
    });


    updateAnalytics();
}


if (addTaskBtn && taskInput && taskList) {

    addTaskBtn.addEventListener(
        "click",
        addNewTask
    );


    taskInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                addNewTask();
            }
        }
    );
}


function addNewTask() {

    const text =
        taskInput.value.trim();


    if (text === "") {

        alert(
            "Please enter a task first."
        );

        return;
    }


    const newTask = {

        id: Date.now(),

        text: text,

        completed: false
    };


    tasks.push(newTask);


    saveStorage(
        STORAGE_KEYS.tasks,
        tasks
    );


    taskInput.value = "";


    renderTasks();
}


if (taskList) {

    taskList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest("button");

            if (!button) return;


            const taskItem =
                button.closest(".task-item");

            if (!taskItem) return;


            const taskId =
                taskItem.dataset.id;


            // Complete
            if (
                button.classList.contains(
                    "complete-task"
                )
            ) {

                tasks =
                    tasks.map(task => {

                        if (
                            String(task.id) ===
                            String(taskId)
                        ) {

                            return {
                                ...task,
                                completed:
                                    !task.completed
                            };
                        }

                        return task;
                    });


                saveStorage(
                    STORAGE_KEYS.tasks,
                    tasks
                );


                renderTasks();

                return;
            }


            // Delete
            if (
                button.classList.contains(
                    "delete-task"
                )
            ) {

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this task?"
                    );


                if (!confirmed) return;


                tasks =
                    tasks.filter(
                        task =>
                            String(task.id) !==
                            String(taskId)
                    );


                saveStorage(
                    STORAGE_KEYS.tasks,
                    tasks
                );


                renderTasks();
            }

        }
    );
}


// ==========================================
// PLANNER
// ==========================================

function renderPlans() {

    if (!plansList) return;

    plansList.innerHTML = "";


    if (plans.length === 0) {

        plansList.innerHTML = `

            <div class="empty-state">

                <span>📅</span>

                <p>No plans yet.</p>

                <small>
                    Add your first study plan!
                </small>

            </div>
        `;

        return;
    }


    plans.forEach(plan => {

        const planItem =
            document.createElement("div");

        planItem.className =
            "plan-item";


        planItem.innerHTML = `

            <div>

                <span class="plan-date">
                    ${escapeHTML(plan.date)}
                </span>

                <h3>
                    ${escapeHTML(plan.subject)}
                </h3>

                <p>
                    ${escapeHTML(plan.task)}
                </p>

            </div>

        `;


        plansList.appendChild(planItem);
    });
}


if (
    addPlanBtn &&
    planDate &&
    planSubject &&
    planTask &&
    plansList
) {

    addPlanBtn.addEventListener(
        "click",
        () => {

            const date =
                planDate.value;

            const subject =
                planSubject.value.trim();

            const task =
                planTask.value.trim();


            if (
                !date ||
                !subject ||
                !task
            ) {

                alert(
                    "Please fill in all planner fields."
                );

                return;
            }


            const newPlan = {

                id: Date.now(),

                date: date,

                subject: subject,

                task: task
            };


            plans.push(newPlan);


            saveStorage(
                STORAGE_KEYS.plans,
                plans
            );


            planDate.value = "";

            planSubject.value = "";

            planTask.value = "";


            renderPlans();
        }
    );
}


// ==========================================
// REMINDERS
// ==========================================

function renderReminders() {

    if (!remindersList) return;

    remindersList.innerHTML = "";


    if (reminders.length === 0) {

        remindersList.innerHTML = `

            <div class="empty-state">

                <span>🔔</span>

                <p>No reminders yet.</p>

                <small>
                    Add a reminder to stay on track.
                </small>

            </div>

        `;

    } else {

        reminders
            .slice()
            .sort(
                (a, b) =>
                    a.time.localeCompare(b.time)
            )
            .forEach(reminder => {

                const card =
                    document.createElement("div");

                card.className =
                    "reminder-card";


                card.dataset.id =
                    String(reminder.id);


                card.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHTML(reminder.title)}
                        </h3>

                        <p>
                            ${escapeHTML(reminder.time)}
                        </p>

                    </div>

                    <button
                        class="delete-reminder"
                        type="button">
                        ✕
                    </button>

                `;


                remindersList.appendChild(card);
            });
    }


    updateNextReminder();
}


function updateNextReminder() {

    const titleElement =
        document.getElementById(
            "reminderTitle"
        );

    const timeElement =
        document.getElementById(
            "reminderTime"
        );


    if (
        !titleElement ||
        !timeElement
    ) {
        return;
    }


    if (reminders.length === 0) {

        titleElement.textContent =
            "No reminders yet";

        timeElement.textContent =
            "--";

        return;
    }


    const sorted =
        reminders
            .slice()
            .sort(
                (a, b) =>
                    a.time.localeCompare(b.time)
            );


    titleElement.textContent =
        sorted[0].title;

    timeElement.textContent =
        sorted[0].time;
}


function addNewReminder() {

    const title =
        reminderText.value.trim();

    const time =
        reminderTime.value;


    if (!title || !time) {

        alert(
            "Please enter a reminder and choose a time."
        );

        return;
    }


    const newReminder = {

        id: Date.now(),

        title: title,

        time: time
    };


    reminders.push(
        newReminder
    );


    saveStorage(
        STORAGE_KEYS.reminders,
        reminders
    );


    reminderText.value = "";

    reminderTime.value = "";


    renderReminders();
}


if (
    addReminderBtn &&
    reminderText &&
    reminderTime
) {

    addReminderBtn.addEventListener(
        "click",
        addNewReminder
    );
}


if (remindersList) {

    remindersList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".delete-reminder"
                );


            if (!button) return;


            const card =
                button.closest(
                    ".reminder-card"
                );


            if (!card) return;


            const id =
                card.dataset.id;


            reminders =
                reminders.filter(
                    reminder =>
                        String(reminder.id) !==
                        String(id)
                );


            saveStorage(
                STORAGE_KEYS.reminders,
                reminders
            );


            renderReminders();
        }
    );
}


// Dashboard reminder button
if (dashboardReminderBtn) {

    dashboardReminderBtn.addEventListener(
        "click",
        () => {

            const section =
                document.getElementById(
                    "remindersSection"
                );

            if (section) {

                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    );
}


// ==========================================
// REMINDER ALARM
// ==========================================

let lastReminderKey = "";


function checkReminders() {

    if (reminders.length === 0) {
        return;
    }


    const now =
        new Date();


    const currentTime =
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;


    const key =
        `${now.toDateString()}-${currentTime}`;


    if (key === lastReminderKey) {
        return;
    }


    const matchingReminder =
        reminders.find(
            reminder =>
                reminder.time ===
                currentTime
        );


    if (!matchingReminder) {
        return;
    }


    lastReminderKey = key;


    playAlarm();


    alert(
        `🔔 STUDYFLOW REMINDER\n\n${matchingReminder.title}`
    );
}


setInterval(
    checkReminders,
    1000
);


// ==========================================
// ANALYTICS
// ==========================================

function getTodaySessions() {

    const today =
        new Date().toDateString();


    return sessions.filter(
        session =>
            new Date(
                session.date
            ).toDateString() === today
    );
}


function calculateStreak() {

    if (sessions.length === 0) {
        return 0;
    }


    const dates = new Set(
        sessions.map(
            session =>
                new Date(
                    session.date
                ).toDateString()
        )
    );


    let streak = 0;

    const current =
        new Date();


    while (
        dates.has(
            current.toDateString()
        )
    ) {

        streak++;

        current.setDate(
            current.getDate() - 1
        );
    }


    return streak;
}


function updateDashboard() {

    const todaySessions =
        getTodaySessions();


    const todayMinutes =
        todaySessions.reduce(
            (total, session) =>
                total +
                Number(session.minutes || 0),
            0
        );


    const hours =
        Math.floor(
            todayMinutes / 60
        );

    const minutes =
        todayMinutes % 60;


    const studyTime =
        document.getElementById(
            "studyTime"
        );


    const sessionCount =
        document.getElementById(
            "sessionCount"
        );


    const streakElement =
        document.getElementById(
            "streak"
        );


    const dailyGoal =
        document.getElementById(
            "dailyGoal"
        );


    const progressText =
        document.getElementById(
            "progressText"
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    const progressInfo =
        document.querySelector(
            ".progress-info"
        );


    const goalMinutes = 120;


    const percentage =
        Math.min(
            Math.round(
                (todayMinutes /
                    goalMinutes) *
                100
            ),
            100
        );


    if (studyTime) {

        studyTime.textContent =
            `${hours}h ${minutes}m`;
    }


    if (sessionCount) {

        sessionCount.textContent =
            todaySessions.length;
    }


    if (streakElement) {

        const streak =
            calculateStreak();

        streakElement.textContent =
            `${streak} ${streak === 1 ? "day" : "days"}`;
    }


    if (dailyGoal) {

        dailyGoal.textContent =
            `${percentage}%`;
    }


    if (progressText) {

        progressText.textContent =
            `${percentage}%`;
    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;
    }


    if (progressInfo) {

        progressInfo.textContent =
            `${hours}h ${minutes}m studied today`;
    }
}


function updateAnalytics() {

    const totalMinutes =
        sessions.reduce(
            (total, session) =>
                total +
                Number(session.minutes || 0),
            0
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;


    const analyticsStudyTime =
        document.getElementById(
            "analyticsStudyTime"
        );


    const analyticsSessions =
        document.getElementById(
            "analyticsSessions"
        );


    const analyticsTasks =
        document.getElementById(
            "analyticsTasks"
        );


    const analyticsStreak =
        document.getElementById(
            "analyticsStreak"
        );


    const analyticsProgressText =
        document.getElementById(
            "analyticsProgressText"
        );


    const analyticsProgressFill =
        document.getElementById(
            "analyticsProgressFill"
        );


    const completedTasks =
        tasks.filter(
            task => task.completed
        ).length;


    const progress =
        tasks.length === 0
            ? 0
            : Math.round(
                (completedTasks /
                    tasks.length) *
                100
            );


    const streak =
        calculateStreak();


    if (analyticsStudyTime) {

        analyticsStudyTime.textContent =
            `${hours}h ${minutes}m`;
    }


    if (analyticsSessions) {

        analyticsSessions.textContent =
            sessions.length;
    }


    if (analyticsTasks) {

        analyticsTasks.textContent =
            completedTasks;
    }


    if (analyticsStreak) {

        analyticsStreak.textContent =
            `${streak} ${streak === 1 ? "day" : "days"}`;
    }


    if (analyticsProgressText) {

        analyticsProgressText.textContent =
            `${progress}%`;
    }


    if (analyticsProgressFill) {

        analyticsProgressFill.style.width =
            `${progress}%`;
    }
}


// ==========================================
// SETTINGS
// ==========================================

function applyTheme() {

    const theme =
        settings.theme || "light";


    document.body.classList.toggle(
        "dark-mode",
        theme === "dark"
    );


    if (themeSelect) {

        themeSelect.value =
            theme;
    }
}


function saveSettings() {

    saveStorage(
        STORAGE_KEYS.settings,
        settings
    );
}


if (themeSelect) {

    themeSelect.addEventListener(
        "change",
        () => {

            settings.theme =
                themeSelect.value;

            applyTheme();

            saveSettings();
        }
    );
}


if (focusDurationSelect) {

    focusDurationSelect.addEventListener(
        "change",
        () => {

            settings.focusDuration =
                Number(
                    focusDurationSelect.value
                );


            if (!timerRunning) {

                timerSeconds =
                    settings.focusDuration *
                    60;

                updateTimerDisplay();
            }


            saveSettings();
        }
    );
}


if (bedtimeInput) {

    bedtimeInput.addEventListener(
        "change",
        () => {

            settings.bedtime =
                bedtimeInput.value;

            updateSleepDisplay();

            saveSettings();
        }
    );
}


if (wakeTimeInput) {

    wakeTimeInput.addEventListener(
        "change",
        () => {

            settings.wakeTime =
                wakeTimeInput.value;

            updateSleepDisplay();

            saveSettings();
        }
    );
}


function formatTimeForDisplay(time) {

    if (!time) return "--";

    const [
        hourString,
        minute
    ] = time.split(":");


    let hour =
        Number(hourString);


    const suffix =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${suffix}`;
}


function updateSleepDisplay() {

    if (
        bedtimeInput &&
        bedtimeDisplay
    ) {

        bedtimeDisplay.textContent =
            formatTimeForDisplay(
                bedtimeInput.value
            );
    }


    if (
        wakeTimeInput &&
        wakeTimeDisplay
    ) {

        wakeTimeDisplay.textContent =
            formatTimeForDisplay(
                wakeTimeInput.value
            );
    }
}


function loadSettings() {

    settings = getStorage(
        STORAGE_KEYS.settings,
        settings
    );


    settings.focusDuration =
        Number(
            settings.focusDuration || 25
        );


    if (themeSelect) {

        themeSelect.value =
            settings.theme || "light";
    }


    if (focusDurationSelect) {

        focusDurationSelect.value =
            String(
                settings.focusDuration
            );
    }


    if (bedtimeInput) {

        bedtimeInput.value =
            settings.bedtime || "23:00";
    }


    if (wakeTimeInput) {

        wakeTimeInput.value =
            settings.wakeTime || "07:00";
    }


    timerSeconds =
        settings.focusDuration *
        60;


    applyTheme();

    updateSleepDisplay();

    updateTimerDisplay();
}


// ==========================================
// ALARM SOUND
// ==========================================

function playAlarm() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) return;


        const audio =
            new AudioContext();


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.connect(gain);

        gain.connect(
            audio.destination
        );


        oscillator.frequency.value =
            850;


        gain.gain.setValueAtTime(
            0.25,
            audio.currentTime
        );


        oscillator.start();


        oscillator.stop(
            audio.currentTime + 0.5
        );


    } catch (error) {

        console.log(
            "Alarm sound unavailable."
        );
    }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================
// INITIALIZE STUDYFLOW
// ==========================================

loadSettings();

renderTasks();

renderPlans();

renderReminders();

updateDashboard();

updateAnalytics();

console.log(
    "✨ STUDYFLOW is ready!"
);
// ==========================================
// SUBJECTS
// ==========================================

const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const subjectsList =
    document.getElementById("subjectsList");


let subjects =
    getStorage("studySubjects", []);


// Default subjects
if (subjects.length === 0) {

    subjects = [
        {
            id: 1,
            name: "Data Mining"
        },
        {
            id: 2,
            name: "Data Structures"
        },
        {
            id: 3,
            name: "Software Engineering"
        }
    ];

    saveStorage(
        "studySubjects",
        subjects
    );
}


function renderSubjects() {

    if (!subjectsList) return;

    subjectsList.innerHTML = "";


    subjects.forEach(subject => {

        const card =
            document.createElement("div");

        card.className =
            "subject-card";


        card.dataset.id =
            String(subject.id);


        card.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(subject.name)}
                </h3>

                <p>
                    Study subject
                </p>

            </div>

            <button
                class="delete-subject"
                type="button">
                ✕
            </button>
        `;


        subjectsList.appendChild(card);
    });
}


// Add subject
if (addSubjectBtn) {

    addSubjectBtn.addEventListener(
        "click",
        () => {

            const name =
                prompt(
                    "📚 Enter the subject name:"
                );


            if (!name) return;


            const cleanName =
                name.trim();


            if (!cleanName) return;


            const exists =
                subjects.some(
                    subject =>
                        subject.name.toLowerCase() ===
                        cleanName.toLowerCase()
                );


            if (exists) {

                alert(
                    "This subject already exists."
                );

                return;
            }


            subjects.push({

                id: Date.now(),

                name: cleanName
            });


            saveStorage(
                "studySubjects",
                subjects
            );


            renderSubjects();
            // ==========================================
// CONNECT SUBJECTS TO FOCUS TIMER
// ==========================================

function updateSubjectOptions() {

    if (!subjectSelect) return;

    subjectSelect.innerHTML = "";

    subjects.forEach(subject => {

        const option =
            document.createElement("option");

        option.value = subject.name;
        option.textContent = subject.name;

        subjectSelect.appendChild(option);
    });
}

updateSubjectOptions();
        }
    );
}


// Delete subject
if (subjectsList) {

    subjectsList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".delete-subject"
                );


            if (!button) return;


            const card =
                button.closest(
                    ".subject-card"
                );


            if (!card) return;


            const id =
                card.dataset.id;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this subject?"
                );


            if (!confirmed) return;


            subjects =
                subjects.filter(
                    subject =>
                        String(subject.id) !==
                        String(id)
                );


            saveStorage(
                "studySubjects",
                subjects
            );


            renderSubjects();
        }
    );
}


renderSubjects();