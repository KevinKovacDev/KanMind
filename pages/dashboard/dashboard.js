let currentAssignedTickets = [];
let currentReviewerTickets = [];
let currentBoards = [];
let currenTaskFilter = "assigned"
let isLoadingTasks = false;

function drawPieChart() {
    getPieChartData()
    let ticketData = getPieChartData()
    const ctx = document.getElementById('ticketsChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['To-do', 'In progress', 'Review', 'Done'],
            datasets: [{
                data: ticketData,
                backgroundColor: ['#8E44AD', '#F1C40F', '#E67E22', '#3498DB'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                            color: 'white',
                            usePointStyle: true,
                            pointStlye: 'circle',
                     }
                }
            }
        }
    });
};

function getPieChartData(){
    return [
        currentAssignedTickets.filter(task => task.status == "to-do").length,
        currentAssignedTickets.filter(task => task.status == "in-progress").length,
        currentAssignedTickets.filter(task => task.status == "review").length,
        currentAssignedTickets.filter(task => task.status == "done").length,
    ]
}

function drawWaveChart(){
        const ctx = document.getElementById("waveChart").getContext("2d");
        const progress = 50;
        const wavePlugin = {
            id: 'waveProgress',
            beforeDraw(chart) {
                const { ctx, chartArea: { left, right, top, bottom }, scales: { x } } = chart;
                const width = right - left;
                const height = bottom - top;
                const progressX = left + (width * (progress / 100));
                
                ctx.save();
    
                // Wave strokes
                function drawWave(color, startX, endX) {
                    ctx.beginPath();
                    ctx.moveTo(startX, bottom - height / 2);
                    const waveLength = 90;  // Wavelength
                    const amplitude = 10;   // Wavehight
                    
                    for (let x = startX; x <= endX; x += 2) {
                        const y = bottom - height / 2 + Math.sin((x / waveLength) * Math.PI * 2) * amplitude;
                        ctx.lineTo(x, y);
                    }
                    
                    ctx.lineWidth = 8;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
    
                drawWave("#FFD700", left, progressX);
                drawWave("#345678", progressX, right);
                
                // Progress Text - Currently aligned in center
                ctx.fillStyle = "#FFD700";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillText(progress + "%", left + width / 2, bottom - height / 2 - 20);
    
                // Numbers left and right
                ctx.fillStyle = "#ffffff";
                ctx.font = "14px Arial";
                ctx.textAlign = "left";
                ctx.fillText("0", left, bottom);
                ctx.textAlign = "right";
                ctx.fillText("100", right, bottom);
    
                ctx.restore();
            }
        };
    
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Fortschritt"],
                datasets: [{
                    label: "Tasks Resolved",
                    data: [progress],
                    backgroundColor: "rgba(0, 0, 0, 0)", 
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                height: 100,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            },
            plugins: [wavePlugin]
        });
    ;
}

async function init(){
    await setDashboardData();
    renderDashboard();
}

async function setDashboardData(){
    await getBoards();
    await getAssignedTasks();
}

async function getBoards() {
    let boardsResp = await getData(BOARDS_URL);

    if (boardsResp.ok) {
        currentBoards = boardsResp.data;
    } else {
        console.warn("BOARDS_URL loadingerror")
    }
}

async function getAssignedTasks() {
    let tasksResp = await getData(TASKS_ASSIGNED_URL);

    if (tasksResp.ok) {
        currentAssignedTickets = tasksResp.data;
    } else {
        console.warn("TASKS_ASSIGNED_URL loadingerror")
    }
}

async function getReviewerTasks() {
    let tasksResp = await getData(TASKS_REVIEWER_URL);

    if (tasksResp.ok) {
        currentReviewerTickets = tasksResp.data;
    } else {
        console.warn("TASKS_REVIEWER_URL loadingerror")
    }
}

function renderDashboard(){
    renderUrgentTask()
    drawWaveChart(); 
    drawPieChart();
    renderBoardList();
    renderMemberAndTaskCount();
    renderTaskList();
}

function renderBoardList(){
    let htmlText = "";
    currentBoards.forEach(board => {
        htmlText += `<li><a class="link" href="/pages/board/?id=${board.id}">${board.title}</a></li>`
    });

    document.getElementById('dashboard_boardlist').innerHTML = htmlText;
}

async function toggleTicketsTypeSwitch(element){
    if(!isLoadingTasks){
        toggleSwitch(element)
        isLoadingTasks = true;
        if(currenTaskFilter == "review"){
            currenTaskFilter = "assignee"
        } else {
            currenTaskFilter = "review"
        }
        await renderTaskList()
        isLoadingTasks = false;
    }
}

async function renderTaskList(){
    let renderList = []
    if(currenTaskFilter == "review"){
        await getReviewerTasks()
        renderList = currentReviewerTickets
    } else {
        await getAssignedTasks()
        renderList = currentAssignedTickets
    }

    let htmlText = "";
    renderList.forEach(task => {
        htmlText += getSingleTaskTemplate(task)
    });

    document.getElementById('dashboard_tasklist').innerHTML = htmlText;
}

function getSingleTaskTemplate(task) {
    let assigneeTemplate = task.assignee ? 
        `<div class="profile_circle color_${getInitials(task.assignee.fullname)[0]}">${getInitials(task.assignee.fullname)}</div>` : 
        `<img src="../../assets/icons/face_icon.svg" alt="">`

    return `        <tr>
                        <td class="title">${task.title}</td>
                        <td class="ws_nw">${task.due_date}</td>
                        <td>
                            <div class="priority-badge" priority="${task.priority}"></div>
                        </td>
                        <td class="ws_nw">${task.status}</td>
                        <td class="d_flex_cc_gs"> 
                            <p class="font_sec_color ">2</p> 
                            <img src="../../assets/icons/comment_bubble_filled.svg" alt="" srcset=""></td>
                        <td>
                            ${assigneeTemplate}
                        </td>
                    </tr>`
}

function renderMemberAndTaskCount(){
    let userId = getAuthUserId()
    document.getElementById('dashboard_task_count').innerText = currentAssignedTickets.length;
    document.getElementById('dashboard_member_count').innerText = currentBoards.filter(board => board.owner_id != userId).length;
}

function renderUrgentTask(){
    let task = getNearestDueDateTask();
    let count = currentAssignedTickets.filter(task => task.priority == "high").length;
    document.getElementById('high_prio_count').innerText = count
    document.getElementById('upcoming_deadline').innerText = formatDate(task.due_date)
}

function getNearestDueDateTask() {
    const today = new Date();
    let nearestTask = null;
    let minDiff = Infinity;

    currentAssignedTickets.forEach(task => {
        const dueDate = new Date(task.due_date);
        const diff = dueDate - today;

        if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            nearestTask = task;
        }
    });

    return nearestTask;
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function redirectToBoards(){
    window.location.href = "../../pages/boards/"
}


