document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments de l'overlay de démarrage ---
    const splashOverlay = document.getElementById('splash-overlay');
    const splashText = document.getElementById('splash-text');
    
    // --- Éléments de la liste de tâches ---
    const title = document.getElementById('list-title');
    const input = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const taskList = document.getElementById('task-list');
    
    // --- Constantes (Basées sur vos contraintes) ---
    const MAX_TASKS = 20; // Maximum 20 listes/tâches
    const MAX_WORDS = 5;
    const TASK_STORAGE_KEY = 'todoListTasks'; 
    const TITLE_STORAGE_KEY = 'todoListTitle'; 

    // --- Variables et Durées d'Animation ---
    const TYPING_CHARS = 31; // Nombre de caractères dans "Créons votre vision ensemble"
    const TYPING_SPEED = 150; // Millisecondes par caractère
    const totalTypingTime = TYPING_CHARS * TYPING_SPEED; 
    const delayAfterTyping = 1000; // Délai après la fin de la frappe
    const fadeOutDuration = 1000; 

    // --- Helper function to trigger vibration and visual shake (Overrides alerts) ---
    function triggerAlert() {
        // Alerte par vibration (si supporté)
        if ("vibrate" in navigator) {
            navigator.vibrate(200);
        }
        // Alerte visuelle (secousse de l'input)
        input.classList.add('vibrate');
        setTimeout(() => {
            input.classList.remove('vibrate');
        }, 300);
    }

    // --- Live Input Enforcement (Prevents client from typing the 6th word) ---
    function liveWordLimitEnforcement() {
        const text = input.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length > MAX_WORDS) {
            // 1. Trigger vibration/shake alert instantly
            triggerAlert();
            
            // 2. Truncate the input value back to the first MAX_WORDS words
            const limitedText = words.slice(0, MAX_WORDS).join(' ');
            input.value = limitedText;
            
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }
    
    input.addEventListener('input', liveWordLimitEnforcement);


    // --- Title Persistence Functions ---
    function saveTitle() {
        localStorage.setItem(TITLE_STORAGE_KEY, title.textContent.trim());
    }

    function loadTitle() {
        const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
        if (storedTitle) {
            title.textContent = storedTitle;
        } else {
            title.textContent = ''; 
        }
    }

    title.addEventListener('blur', saveTitle);
    title.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            title.blur(); 
        }
    });

    // --- Task Persistence & Creation Functions ---

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('.task-item').forEach(item => {
            tasks.push({
                text: item.querySelector('.task-text').textContent,
                checked: item.querySelector('.confirmation-checkbox').checked
            });
        });
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
        updateDeleteButtonVisibility();
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
        if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            tasks.forEach(task => {
                createTaskElement(task.text, task.checked);
            });
        }
        updateDeleteButtonVisibility();
    }

    function createTaskElement(text, isChecked = false) {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        listItem.innerHTML = `
            <span class="task-text ${isChecked ? 'strikethrough' : ''}">${text}</span>
            <label class="checkmark-container">
                <input type="checkbox" class="confirmation-checkbox" ${isChecked ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
        `;

        const checkbox = listItem.querySelector('.confirmation-checkbox');
        checkbox.addEventListener('change', (e) => {
            toggleStrikethrough(e);
            saveTasks(); 
        });

        taskList.appendChild(listItem);
    }
    
    // --- Add Task Logic ---
    addTaskBtn.addEventListener('click', addTask);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = input.value.trim();
        
        // 1. EMPTY INPUT CHECK (Vibration alert)
        if (taskText === "") {
            triggerAlert();
            return;
        }

        // 2. Task List Limit Validation (MAX 20 LISTS)
        if (taskList.children.length >= MAX_TASKS) {
            triggerAlert();
            return;
        }

        createTaskElement(taskText, false);
        input.value = ''; 
        saveTasks();
    }

    // --- Strikethrough and Delete Button Update ---
    function toggleStrikethrough(event) {
        const checkbox = event.target;
        const listItem = checkbox.closest('.task-item');
        const taskText = listItem.querySelector('.task-text');

        if (checkbox.checked) {
            taskText.classList.add('strikethrough');
        } else {
            taskText.classList.remove('strikethrough');
        }
        updateDeleteButtonVisibility();
    }

    function updateDeleteButtonVisibility() {
        const checkedItems = taskList.querySelectorAll('.confirmation-checkbox:checked').length;
        
        if (checkedItems > 0) {
            deleteSelectedBtn.style.display = 'inline-block';
        } else {
            deleteSelectedBtn.style.display = 'none'; 
        }
    }

    // --- Delete Selected Tasks ---
    deleteSelectedBtn.addEventListener('click', () => {
        const checkedTasks = taskList.querySelectorAll('.confirmation-checkbox:checked');
        
        if (checkedTasks.length === 0) {
            return; 
        }

        if (confirm(`Are you sure you want to delete ${checkedTasks.length} selected task(s)?`)) {
            checkedTasks.forEach(checkbox => {
                const listItem = checkbox.closest('.task-item');
                taskList.removeChild(listItem);
            });
            saveTasks();
        }
    });

    // ==========================================================
    // 🚀 INITIALISATION AVEC ANIMATION DE DÉMARRAGE (CORRIGÉE)
    // ==========================================================
    
    // 1. Démarre l'animation de frappe et l'animation du curseur clignotant
    // NOTE: L'effet de centrage correct nécessite d'animer 'max-width' dans le CSS.
    splashText.style.animation = `
        typing ${totalTypingTime / 1000}s steps(${TYPING_CHARS}, end) forwards,
        blink-caret .75s step-end infinite
    `;

    // 2. Attend la fin de la frappe (totalTypingTime)
    setTimeout(() => {
        // 3. Arrête l'animation du curseur clignotant en le remplaçant par un état fixe
        // On retire l'animation 'blink-caret'
        splashText.style.animation = `typing ${totalTypingTime / 1000}s steps(${TYPING_CHARS}, end) forwards`;
        splashText.style.borderRightColor = 'orange'; // Laisse le curseur visible et fixe
        
        // 4. Après le délai de lecture (delayAfterTyping), déclenche la transition de disparition (fade-out)
        setTimeout(() => {
            splashOverlay.classList.add('hidden');
            
            // 5. Une fois la transition terminée (fadeOutDuration), charge les données et retire l'overlay
            setTimeout(() => {
                loadTitle(); 
                loadTasks(); 
                splashOverlay.style.display = 'none'; 
            }, fadeOutDuration); 
            
        }, delayAfterTyping); 
        
    }, totalTypingTime); 
});