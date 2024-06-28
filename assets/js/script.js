// assets/js/script.js

let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

function generateTaskId() {
  return nextId++;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

function createTaskCard(task) {
  const card = $(`
    <div class="card task-card" data-id="${task.id}" style="background-color: yellow; color: black; display: block;">
      <div class="card-body">
        <div class="task-title"><h5 class="card-title">${task.title}</h5></div>
        <div class="task-desc"><p class="card-text">${task.description}</p></div>
        <div class="task-deadline"><p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p></div>
        <div class="task-actions"><button class="btn btn-danger btn-sm delete-btn">Delete</button></div>
      </div>
    </div>
  `);
  console.log(`Created task card: ${task.title} with id: ${task.id}`);
  if (dayjs(task.deadline).isBefore(dayjs())) {
    card.find('.card-body').addClass('bg-danger text-white');
  } else if (dayjs(task.deadline).isBefore(dayjs().add(1, 'week'))) {
    card.find('.card-body').addClass('bg-warning');
  }
  return card;
}

function renderTaskList() {
  console.log("Rendering task list...");
  $("#todo-cards, #in-progress-cards, #done-cards").empty();
  taskList.forEach(task => {
    console.log(`Rendering task: ${task.title}, Status: ${task.status}`);
    const card = createTaskCard(task);
    const columnId = `#${task.status}-cards`;
    console.log(`Appending task to column: ${columnId}`);
    $(columnId).append(card);
    console.log(`Appended task card for ${task.title} to ${columnId}`);
  });

  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    start: function (event, ui) {
      $(ui.helper).css("opacity", "0.5");
    },
    stop: function (event, ui) {
      $(ui.helper).css("opacity", "1");
    }
  });

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  $(".delete-btn").click(handleDeleteTask);
}

function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const deadline = $("#taskDeadline").val();

  const task = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: "to-do" // Default status when a new task is added
  };

  taskList.push(task);
  saveTasks();
  renderTaskList();

  $("#taskForm")[0].reset();
  $("#formModal").modal("hide");
}

function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card");
  const id = card.data("id");
  taskList = taskList.filter(task => task.id !== id);
  saveTasks();
  renderTaskList();
}

function handleDrop(event, ui) {
  const id = $(ui.draggable).data("id");
  const newStatus = $(this).attr("id").split('-')[0]; // Extract status from column id
  console.log(`Task ${id} dropped into ${newStatus} column`);

  taskList = taskList.map(task => {
    if (task.id === id) {
      task.status = newStatus;
    }
    return task;
  });

  saveTasks();
  renderTaskList();
}

$(document).ready(function () {
  renderTaskList();
  $("#taskForm").submit(handleAddTask);
  $("#taskDeadline").datepicker();

  console.log("Document ready. Event handlers attached.");
  console.log("Task List:", taskList);
  console.log("Next ID:", nextId);
});
