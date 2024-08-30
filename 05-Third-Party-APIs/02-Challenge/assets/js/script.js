// assets/js/script.js

// Retrieve the task list and the next task ID from localStorage, or initialize them if they don't exist
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique ID for each new task
function generateTaskId() {
  return nextId++;
}

// Save the current task list and next task ID to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create an HTML structure for a task card based on the task object
function createTaskCard(task) {
  console.log(`Creating task card for task: ${task.title} with status: ${task.status}`);

  // Create a div for the color banner
  const colorBanner = $('<div></div>').css({
    'height': '30px',
    'width': '100%',
    'background-color': 'transparent',
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'color': 'white',
    'font-weight': 'bold',
    'font-size': '14px'
  });

  // Set the banner color and text based on the deadline status and task completion status
  if (task.status === "done") {
    colorBanner.css('background-color', 'green').text('Completed'); // Green banner with "Completed" text for done tasks
  } else if (dayjs(task.deadline).isBefore(dayjs())) {
    colorBanner.css('background-color', 'red').text('Past Due'); // Red banner with "Past Due" text for overdue tasks
  } else if (dayjs(task.deadline).isBefore(dayjs().add(1, 'week'))) {
    colorBanner.css('background-color', 'yellow').css('color', 'black'); // Yellow banner for tasks nearing deadline
  }

  const card = $(`
    <div class="card task-card" data-id="${task.id}" style="display: block;">
      <div class="card-body">
        <div class="task-title"><h5 class="card-title">${task.title}</h5></div>
        <div class="task-desc"><p class="card-text">${task.description}</p></div>
        <div class="task-deadline"><p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p></div>
        <div class="task-actions"><button class="btn btn-danger btn-sm delete-btn">Delete</button></div>
      </div>
    </div>
  `);

  // Append the color banner at the top of the card
  card.prepend(colorBanner);

  return card;
}





// Render the task list by clearing existing tasks and re-adding them to the appropriate columns
function renderTaskList() {
  console.log("Rendering task list...");
  
  // Clear existing tasks in all columns to avoid duplication
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  // Render each task in its appropriate column
  taskList.forEach(task => {
    console.log(`Rendering task: ${task.title}, Status: ${task.status}`);
    const card = createTaskCard(task); // Create the task card element
    const columnId = `#${task.status}-cards`; // Determine the correct column based on task status
    console.log(`Appending task to column: ${columnId}`);
    $(columnId).append(card); // Append the card to the appropriate column
    console.log(`Appended task card for ${task.title} to ${columnId}`);
  });

  // Reapply draggable behavior to all task cards
  $(".task-card").draggable({
    revert: "invalid", // If the task is not dropped in a valid droppable area, it reverts to its original position
    helper: "clone", // The task card is cloned when dragged
    start: function (event, ui) {
      $(ui.helper).css("opacity", "0.5"); // Set opacity when dragging starts
    },
    stop: function (event, ui) {
      $(ui.helper).css("opacity", "1"); // Reset opacity when dragging stops
    }
  });

  // Reapply droppable behavior to all lanes
  $(".lane").droppable({
    accept: ".task-card", // Accept only elements with the class "task-card"
    drop: handleDrop // Call handleDrop when a task is dropped into a lane
  });

  // Attach click handler to delete buttons
  $(".delete-btn").click(handleDeleteTask);
}




// Handle adding a new task from the form submission
function handleAddTask(event) {
  event.preventDefault(); // Prevent the default form submission behavior
  const title = $("#taskTitle").val(); // Get the task title from the input
  const description = $("#taskDescription").val(); // Get the task description from the input
  const deadline = $("#taskDeadline").val(); // Get the task deadline from the input

  // Create a new task object with default status "todo"
  const task = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: "todo" // Default status when a new task is added
  };

  taskList.push(task); // Add the new task to the task list
  saveTasks(); // Save the updated task list to localStorage
  renderTaskList(); // Re-render the task list

  $("#taskForm")[0].reset(); // Reset the form
  $("#formModal").modal("hide"); // Hide the modal
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card"); // Find the closest task card element
  const id = card.data("id"); // Get the ID of the task to delete
  taskList = taskList.filter(task => task.id !== id); // Remove the task from the task list
  saveTasks(); // Save the updated task list to localStorage
  renderTaskList(); // Re-render the task list
}

// Handle dropping a task into a new column
function handleDrop(event, ui) {
  const id = $(ui.draggable).data("id"); // Get the ID of the dragged task
  const newStatus = $(this).attr("id").replace('-cards', ''); // Extract status by removing "-cards" suffix

  console.log(`Task ${id} dropped into ${newStatus} column`);

  // Update the status of the task that was moved
  let taskToCheck = null;
  taskList = taskList.map(task => {
    if (task.id === id) {
      task.status = newStatus; // Update the task's status
      taskToCheck = task; // Capture the task being moved
    }
    return task;
  });

  // Check for and remove exact duplicates of the task being moved
  taskList = taskList.filter(task => {
    return task.id === taskToCheck.id || 
           !(task.title === taskToCheck.title &&
             task.description === taskToCheck.description &&
             task.deadline === taskToCheck.deadline);
  });

  saveTasks(); // Save the updated task list to localStorage
  renderTaskList(); // Re-render the task list
}



// Initialize the task board when the document is ready
$(document).ready(function () {
  renderTaskList(); // Render the task list when the page loads
  $("#taskForm").submit(handleAddTask); // Attach the submit event handler to the form
  $("#taskDeadline").datepicker(); // Initialize the datepicker for the task deadline input

  console.log("Document ready. Event handlers attached.");
  console.log("Task List:", taskList);
  console.log("Next ID:", nextId);
});
