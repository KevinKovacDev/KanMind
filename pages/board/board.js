let currentBoard = {}
let currentTask
let currentComments
let isShiftPressed = false
let currentMemberList

function setShift(event) {
    if (event.keyCode == 16) isShiftPressed = true
}

function unsetShift(event) {
    if (event.keyCode == 16) isShiftPressed = false
}


function cleanCurrentTask() {

    currentTask = {
        "id": null,
        "title": null,
        "description": null,
        "status": null,
        "priority": 'medium',
        "assignee": null,
        "reviewer": null,
        "due_date": null
    }
}

async function init() {
    currentBoard = await getBoard()
    cleanCurrentTask()
    renderAllTasks()
    renderMemberList()
    document.getElementById('board_title_link').innerText = currentBoard.title;
    document.querySelector('form').addEventListener('submit', function(event) {
        console.log("Another submit listener detected"); // Überprüfe, ob dies in der Konsole erscheint
    });
}

async function getBoard() {

    let boardResp = await getData(BOARDS_URL + getIdFromUrl());

    if (boardResp.ok) {
        return boardResp.data;
    } else {
        return null
    }
}

function getIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function renderMemberList() {
    let listRef = document.getElementById('short_profile_list');
    listRef.innerHTML = "";
    for (let i = 0; i < currentBoard.members.length; i++) {
        if (i >= 4) {
            listRef.innerHTML += `<li><div class="profile_circle  color_A">+${currentBoard.members.length - 4}</div></li>`
            break;
        }
        listRef.innerHTML += `<li><div class="profile_circle  color_${getInitials(currentBoard.members[i].fullname)[0]}">${getInitials(currentBoard.members[i].fullname)}</div></li>`
    }
}

async function openEditBoardDialog() {
    changeCurrentDialog("edit_board_dialog");
    toggleOpenId('dialog_wrapper');
    currentMemberList = currentBoard.members
    renderEditBoardDialog();
}

function renderEditBoardDialog(){
    let ListTemplate = ""
    currentMemberList.forEach(member => {
        ListTemplate += `<li>${member.email}<button class="std_btn btn_prime">Remove</button></li>`
    });
    document.getElementById('edit_board_member_list').innerHTML = ListTemplate
}

function deleteEditBoardMember(emailToRemove){
    currentMemberList = currentMemberList.filter(user => user.email !== emailToRemove);
    renderEditBoardDialog()
}

async function openTaskDetailDialog(id) {
    currentTask = getTaskById(id);
    changeCurrentDialog("task_detail_dialog");
    toggleOpenId('dialog_wrapper');
    await loadAndRenderDetailTask(id);
}

async function loadAndRenderDetailTask(id) {
    currentComments = await getTaskComments(id)
    renderDetailTask()
}

function renderDetailTask() {
    document.getElementById('detail_task_title').innerHTML = currentTask.title
    document.getElementById('detail_task_description').innerHTML = currentTask.description
    document.getElementById('detail_task_assignee').innerHTML = getDetailTaskPersonTemplate(currentTask.assignee)
    document.getElementById('detail_task_reviewer').innerHTML = getDetailTaskPersonTemplate(currentTask.reviewer)
    renderDetailTaskDueDate()
    renderDetailTaskPriority()
    renderDetailTaskComments()
}

function getDetailTaskPersonTemplate(member){
    if (member) {
        return `<div class="profile_circle color_${getInitials(member.fullname)[0]}">${getInitials(member.fullname)}</div>
                            <p>${member.fullname}</p>`
    } else {
        return `<img src="../../assets/icons/face_icon.svg" alt="">
                            <p>unassigned</p>`
    }
}

function renderDetailTaskPriority(){
    let prioRef = document.getElementById('detail_task_priority');
    prioRef.innerHTML =  `<div priority="${currentTask.priority}" class="priority-badge"></div><p >${currentTask.priority}</p>`
}

function renderDetailTaskDueDate(){
    let prioRef = document.getElementById('detail_task_due_date');
    prioRef.innerHTML =  currentTask.due_date
}

async function getTaskComments(id) {
    let commentResp = await getData(TASKS_URL + id + "/comments/");

    if (commentResp.ok) {
        return commentResp.data;
    } else {
        return null
    }
}

async function sendComment(event, element) {
    if (event.keyCode == 13 && !isShiftPressed) {
        
        let newComment = {
            "content": element.value.trim()
        }
        if (newComment.content.length > 0) {
            let response = await postData(TASKS_URL + currentTask.id + "/comments/", newComment);
            if (!response.ok) {
                console.log(2)
            } else {
                element.value = '';
                currentComments = await getTaskComments(currentTask.id);
                renderDetailTaskComments()
            }
        }
    }
}


function renderDetailTaskComments() {
    let listRef = document.getElementById("task_comment_list")
    let listHtml = "";
    currentComments.forEach(comment => {
        listHtml += getSingleCommmentTemplate(comment)
    });
    listRef.innerHTML = listHtml;
}

function getSingleCommmentTemplate(comment) {
    return `        <article class="comment_wrapper d_flex_ss_gm w_full">
                        <div class="profile_circle color_${getInitials(comment.author)[0]}">${getInitials(comment.author)}</div>
                        <div class="d_flex_sc_gs f_d_c">
                            <header class="d_flex_sc_gm w_full">
                                <h4>${comment.author}</h4>
                                <p>${timeDifference(comment.created_at)}</p>
                            </header>
                            <p class="w_full">${comment.content}</p>
                        </div>    
                    </article>`
}

function timeDifference(timestamp) {
    const time = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - time) / 1000);

    const units = [
        { single_name: "year", plural_name: "years", seconds: 31536000 },
        { single_name: "month", plural_name: "months", seconds: 2592000 },
        { single_name: "day", plural_name: "days", seconds: 86400 },
        { single_name: "hour", plural_name: "hours", seconds: 3600 },
        { single_name: "minute", plural_name: "minutes", seconds: 60 },
        { single_name: "second", plural_name: "seconds", seconds: 1 }
    ];

    for (let unit of units) {
        const count = Math.floor(diffInSeconds / unit.seconds);
        if (count >= 1) {
            return `${count} ${count > 1 ? unit.plural_name : unit.single_name} ago`;
        }
    }
    return "gerade eben";
}

function openCreateTaskDialog(status) {
    cleanCurrentTask()
    if (status) {
        currentTask.status = status;
    } else {
        currentTask.status = "to-do";
    }

    changeCurrentDialog("create_edit_task_dialog")
    toggleOpenId('dialog_wrapper')

    fillEditCreateTaskDialog('create')
}

function openEditTaskDialog() {
    toggleOpenId('dialog_wrapper')
    changeCurrentDialog("create_edit_task_dialog")
    toggleOpenId('dialog_wrapper')
    fillEditCreateTaskDialog('edit')
}

function deleteCurrentTask(){
    console.log(currentTask.id)
}

function fillEditCreateTaskDialog(type) {
    document.getElementById("create_edit_task_dialog").setAttribute('dialog-type', type);
    fillCreateEditTaskTitleInputDesc()
    renderTaskCreateMemberList()
    setTaskCreateDropdownPrioHeader()
}

function renderTaskCreateMemberList() {
    document.getElementById("create_edit_task_assignee").innerHTML = getTaskCreateMemberListEntrieTemplate("assignee")
    document.getElementById("create_edit_task_reviewer").innerHTML = getTaskCreateMemberListEntrieTemplate("reviewer")
    setTaskCreateDropdownHeader('assignee')
    setTaskCreateDropdownHeader('reviewer')
}

function getTaskCreateMemberListEntrieTemplate(type) {
    let listHtml = `<li onclick="unsetMemberAs('${type}'); toggleDropdown(this, event)">
                        <img src="../../assets/icons/face_icon.svg" alt="">
                        <p>unassigned</p>
                    </li>`
    currentBoard.members.forEach(member => {
        listHtml += `<li onclick="setMemberAs('${member.id}', '${type}'); toggleDropdown(this, event)">
                        <div class="profile_circle color_${getInitials(member.fullname)[0]}">${getInitials(member.fullname)}</div>
                        <p>${member.fullname}</p>
                    </li>`
    });

    return listHtml
}

function setTaskCreateDropdownHeader(type) {
    let headRef = document.getElementById(`create_edit_task_${type}_head`)
    if (currentTask[type]) {
        headRef.innerHTML = `<div class="profile_circle color_${getInitials(currentTask[type].fullname)[0]}">${getInitials(currentTask[type].fullname)}</div>
                            <p>${currentTask[type].fullname}</p>`
    } else {
        headRef.innerHTML = `<img src="../../assets/icons/face_icon.svg" alt="">
                            <p>unassigned</p>`
    }
}

function unsetMemberAs(type) {
    currentTask[type] = null
    setTaskCreateDropdownHeader(type)
}

function setMemberAs(memberId, type) {
    currentTask[type] = getMemberById(memberId)
    setTaskCreateDropdownHeader(type)
}

function getMemberById(id) {
    return currentBoard.members.find(member => member.id == id)
}

function getTaskById(id) {
    return currentBoard.tasks.find(task => task.id == id)
}

function setTaskCreatePrio(prio) {
    currentTask.priority = prio;
    setTaskCreateDropdownPrioHeader();
}

function setTaskCreateDropdownPrioHeader() {
    let headerRef = document.getElementById('create_edit_task_prio_head');
    headerRef.innerHTML = `<div class="priority-badge" priority="${currentTask.priority}"></div><p>${currentTask.priority}</p>`
}

function setTaskCreateDate(element) {
    currentTask.due_date = element.value;
}

function changeCurrentDialog(currentDialog) {
    const dialogs = document.querySelectorAll('[current_dialog]');
    dialogs.forEach(dialog => {
        dialog.setAttribute('current_dialog', 'false');
    });
    document.getElementById(currentDialog).setAttribute('current_dialog', 'true');
}

function validateCreateEditTaskTitle(element) {
    let valid = element.value.trim().length > 2;
    setError(!valid, element.id + "_group")
    return valid
}

function validateCreateEditTaskDueDate(element) {
    let valid = element.value.trim().length > 0;
    setError(!valid, element.id + "_group")
    return valid
}

async function submitCreateTask(event) {
    event.preventDefault();
    let titleRef = document.getElementById('create_edit_task_title_input');
    let dateRef = document.getElementById('create_edit_task_date_input');
    if (validateCreateEditTaskTitle(titleRef) && validateCreateEditTaskDueDate(dateRef)) {
        let newTask = {
            "board": currentBoard.id,
            "title": titleRef.value,
            "description": document.getElementById('create_edit_task_description').value,
            "status": currentTask.status,
            "priority": currentTask.priority,
            "reviewer_id": currentTask.reviewer ? currentTask.reviewer.id : null,
            "assignee_id": currentTask.assignee ? currentTask.assignee.id : null,
            "due_date": dateRef.value
        }
        await createTask(newTask)
    }
}

async function createTask(newTask) {
    let response = await postData(TASKS_URL, newTask);
    if (!response.ok) {
        // let errorArr = extractErrorMessages(response.data)
        // showToastMessage(true, errorArr)
    } else {
        cleanCurrentTask()
        toggleOpenId('dialog_wrapper')
        await loadAndRenderTasks()
    }
}

async function submitEditTask() {
    let titleRef = document.getElementById('create_edit_task_title_input');
    let dateRef = document.getElementById('create_edit_task_date_input');
    if (validateCreateEditTaskTitle(titleRef) && validateCreateEditTaskDueDate(dateRef)) {
        let updatedTask = {
            "id": currentTask.id,
            "board": currentBoard.id,
            "title": titleRef.value,
            "description": document.getElementById('create_edit_task_description').value,
            "status": currentTask.status,
            "priority": currentTask.priority,
            "reviewer_id": currentTask.reviewer ? currentTask.reviewer.id : null,
            "assignee_id": currentTask.assignee ? currentTask.assignee.id : null,
            "due_date": dateRef.value
        }
        await editTask(updatedTask)
    }
}

async function editTask(updatedTask) {
    let response = await patchData(TASKS_URL + updatedTask.id + "/", updatedTask);
    if (!response.ok) {
        // let errorArr = extractErrorMessages(response.data)
        // showToastMessage(true, errorArr)
    } else {
        cleanCurrentTask()
        toggleOpenId('dialog_wrapper')
        await loadAndRenderTasks()
    }
}

function abbortCreateEditTask() {
    cleanCurrentTask()
    fillCreateEditTaskTitleInputDesc()
    toggleOpenId('dialog_wrapper')
}

function fillCreateEditTaskTitleInputDesc() {
    document.getElementById('create_edit_task_title_input').value = currentTask.title;
    document.getElementById('create_edit_task_date_input').value = currentTask.due_date;
    document.getElementById('create_edit_task_description').value = currentTask.description;
}

async function loadAndRenderTasks() {
    currentBoard = await getBoard()
    renderAllTasks()
}

function renderAllTasks() {
    let searchRef = document.getElementById('searchbar_tasks')
    let taskList = []
    if (searchRef.value.length > 0) {
        taskList = searchInTasks(searchRef.value)
    } else {
        taskList = currentBoard.tasks
    }
    let statii = ['to-do', 'in-progress', 'review', 'done']
    statii.forEach(status => {
        let filteredList = taskList.filter(task => task.status == status)
        renderSingleColumn(status, filteredList)
    });
}

function renderSingleColumn(status, filteredList) {
    document.getElementById(`${status}_column`).innerHTML = "";
    filteredList.forEach(task => {
        document.getElementById(`${status}_column`).innerHTML += getBoardCardTemplate(task);
    });
}

function getBoardCardTemplate(task) {
    let assignee_html = task.assignee ?
        `<div class="profile_circle color_${getInitials(task.assignee.fullname)[0]}">${getInitials(task.assignee.fullname)}</div>` :
        `<img src="../../assets/icons/face_icon.svg" alt="">`
    return `            <li class="column_card" onclick="openTaskDetailDialog(${task.id})">
                            <header class="column_card_header">
                                <h4 class="font_white_color">${task.title}</h4>
                                <div class="d_flex_sc_gm">
                                    <img src="../../assets/icons/${task.priority}_prio_colored.svg" alt="">
                                    ${assignee_html}
                                </div>
                            </header>
                            <p class="column_card_content font_white_color">${task.description}</p>
                        </li>`
}

function searchInTasks(searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase();

    return currentBoard.tasks.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(lowerCaseSearch);
        const descriptionMatch = task.description?.toLowerCase().includes(lowerCaseSearch);
        return titleMatch || descriptionMatch;
    });
}

