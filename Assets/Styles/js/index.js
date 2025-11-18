document.addEventListener('DOMContentLoaded', () => {
    const splashOverlay = document.getElementById('splash-overlay');
    const splashText = document.getElementById('splash-text');
    const title = document.getElementById('list-title');
    const input = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const taskList = document.getElementById('task-list');
    const MAX_TASKS = 20;
    const MAX_WORDS = 5;
    const TASK_STORAGE_KEY = 'todoListTasks'; 
    const TITLE_STORAGE_KEY = 'todoListTitle'; 
    const TYPING_CHARS = 31; 
    const TYPING_SPEED = 150; 
    const totalTypingTime = TYPING_CHARS * TYPING_SPEED; 
    const delayAfterTyping = 1000;
    const fadeOutDuration = 1000; 

    function triggerAlert() {
        if ("vibrate" in navigator) {
            navigator.vibrate(200);
        }
        input.classList.add('vibrate');
        setTimeout(() => {
            input.classList.remove('vibrate');
        }, 300);
    }

    function liveWordLimitEnforcement() {
        const text = input.value.trim();
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length > MAX_WORDS) {
            triggerAlert();
            const limitedText = words.slice(0, MAX_WORDS).join(' ');
            input.value = limitedText;
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }
    
    input.addEventListener('input', liveWordLimitEnforcement);

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

    addTaskBtn.addEventListener('click', addTask);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = input.value.trim();
        if (taskText === "") {
            triggerAlert();
            return;
        }
        if (taskList.children.length >= MAX_TASKS) {
            triggerAlert();
            return;
        }
        createTaskElement(taskText, false);
        input.value = ''; 
        saveTasks();
    }

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

    splashText.style.animation = `
        typing ${totalTypingTime / 1000}s steps(${TYPING_CHARS}, end) forwards,
        blink-caret .75s step-end infinite
    `;

    setTimeout(() => {
        splashText.style.animation = `typing ${totalTypingTime / 1000}s steps(${TYPING_CHARS}, end) forwards`;
        splashText.style.borderRightColor = 'orange';
        setTimeout(() => {
            splashOverlay.classList.add('hidden');
            setTimeout(() => {
                loadTitle(); 
                loadTasks(); 
                splashOverlay.style.display = 'none'; 
            }, fadeOutDuration); 
            
        }, delayAfterTyping); 
        
    }, totalTypingTime); 
});