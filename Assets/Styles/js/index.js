document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const listTitleInput = document.getElementById('list-title');

    // Clés de stockage
    const STORAGE_KEY_TASKS = 'todoListTasksFR';
    const STORAGE_KEY_TITLE = 'todoListTitleFR';

    // --- Fonctions de Persistance du Titre ---

    const saveTitle = () => {
        localStorage.setItem(STORAGE_KEY_TITLE, listTitleInput.value);
    };

    const loadTitle = () => {
        const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);
        if (savedTitle) {
            listTitleInput.value = savedTitle;
        } else {
            // FIX: Initialisation par défaut
            listTitleInput.value = 'Ma Liste de Tâches'; 
        }
    };
    
    // ... (Reste des fonctions saveTasks, loadTasks, attachCheckboxListeners, toggleCompletion, addTask) ...

    const saveTasks = () => {
        localStorage.setItem(STORAGE_KEY_TASKS, taskList.innerHTML);
    };

    const loadTasks = () => {
        const savedData = localStorage.getItem(STORAGE_KEY_TASKS);
        if (savedData) {
            taskList.innerHTML = savedData;
            attachCheckboxListeners();
        }
    };

    const attachCheckboxListeners = () => {
        taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
             const taskItem = checkbox.closest('.task');
             if (checkbox.checked) {
                 taskItem.classList.add('completed');
             } else {
                 taskItem.classList.remove('completed');
             }
        });
    }

    const toggleCompletion = (taskItem, isChecked) => {
        if (isChecked) {
            taskItem.classList.add('completed');
            taskItem.classList.remove('delete-pending'); 
        } else {
            taskItem.classList.remove('completed');
        }
        saveTasks();
    };

    const addTask = () => {
        const taskText = newTaskInput.value.trim();
        if (taskText === "") {
            alert("Veuillez entrer une tâche.");
            return;
        }

        const li = document.createElement('li');
        li.classList.add('task');
        
        li.innerHTML = `
            <span class="task-content">${taskText}</span>
            <span class="delete-warning">Cliquez à nouveau pour supprimer !</span>
            <input type="checkbox" class="task-checkbox"> 
        `;
        
        taskList.appendChild(li);
        newTaskInput.value = '';
        saveTasks(); 
    };

    // ----------------------------------------------------------------------------------
    // --- Événements ---
    // ----------------------------------------------------------------------------------

    // 1. Événement de Sauvegarde du Titre
    // CORRIGÉ: Changer 'saveTitre' en 'saveTitle'
    listTitleInput.addEventListener('blur', saveTitle); 
    
    // 2. Événements d'ajout de tâche
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // 3. Gestion des Clics dans la Liste (Suppression et Checkbox)
    taskList.addEventListener('click', (e) => {
        const clickedTask = e.target.closest('.task');
        if (!clickedTask) return;

        if (e.target.classList.contains('task-checkbox')) {
            e.stopPropagation(); 
            toggleCompletion(clickedTask, e.target.checked);
        } 
        
        else {
            if (clickedTask.classList.contains('completed')) return; 

            if (clickedTask.classList.contains('delete-pending')) {
                clickedTask.remove();
                saveTasks(); 
            } else {
                taskList.querySelectorAll('.delete-pending').forEach(t => t.classList.remove('delete-pending'));

                clickedTask.classList.add('delete-pending');

                setTimeout(() => {
                    if (clickedTask.classList.contains('delete-pending')) {
                        clickedTask.classList.remove('delete-pending');
                    }
                }, 3000); 
            }
        }
    });

    // 4. Bouton Effacer les Données
    clearDataBtn.addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir effacer TOUTES les tâches et le titre sauvegardés pour ce navigateur ?")) {
            localStorage.removeItem(STORAGE_KEY_TASKS);
            localStorage.removeItem(STORAGE_KEY_TITLE); 
            taskList.innerHTML = '';
            listTitleInput.value = 'Ma Liste de Tâches'; 
            alert("Données effacées. Veuillez rafraîchir la page pour confirmer.");
        }
    });

    // --- Initialisation ---
    loadTitle(); 
    loadTasks(); 
});