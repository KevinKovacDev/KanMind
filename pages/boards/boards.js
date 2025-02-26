let currentCreateBoard = {
    "title" : "",
    "members":[]
}

let boardList = []

function redirectToBoard(id){
    window.location.href = "../../pages/board/?id="+id
}

async function getAndRenderBoardList(){
    boardList = await getBoards()
    if(boardList){
        renderBoardList()
    }
}

async function getBoards(){
    let boardResp = await getData(BOARDS_URL);

    if (boardResp.ok) {
        return boardResp.data;
    } else {
        return null
    }
}

function openBoardCreateDialog(){
    toggleOpenId('dialog_wrapper')
    currentCreateBoard = {
        "title" : "",
        "members":[]
    }
    renderCreateDialogMemberList()
    document.getElementById("board_title_input").value = "";
}

async function boardCreateInviteMember(){
    let element = document.getElementById("create_board_email_input")
    let valid = validateMemberEmail(element)
    if(valid){
        boardCreateCheckMailAddress(element)
    }
}

function resetMailError(){
    setError(false, "email_group")
}

function validateMemberEmail(element) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let valid = emailRegex.test(element.value.trim())
    let labelRef = document.getElementById("email_error_label")
    labelRef.innerText = "Please enter a valid email address."

    if(valid){
        valid = currentCreateBoard.members.filter( user => user.email == element.value.trim()).length == 0
        labelRef.innerText = "This email adress already exist as member."
    }
    
    setError(!valid, element.id + "_group")
    return valid 
}

async function boardCreateCheckMailAddress(element){
    let mail = element.value.trim()
    let resp = await checkMailAddress(mail)
    if(resp){
        currentCreateBoard.members.push(resp)
        renderCreateDialogMemberList()
        document.getElementById("create_board_email_input").value = "";
    } else {
        document.getElementById("email_error_label").innerText = "This email adress doesn't exist."
        setError(true, element.id + "_group")
    }
}

function validateBoardTitle(element){
    let valid = element.value.trim().length > 2;
    setError(!valid, element.id + "_group")
    return valid
}


async function boardCreateSubmit(event) {
    event.preventDefault();
    let element = document.getElementById("board_title_input")
    if(validateBoardTitle(element)){
        currentCreateBoard.title = element.value.trim()
        await createBoard()
    }
}

async function createBoard(){
    let response = await postData(BOARDS_URL, currentCreateBoard);
    if (!response.ok) {
        // let errorArr = extractErrorMessages(response.data)
        // showToastMessage(true, errorArr)
    } else {
        toggleOpenId('dialog_wrapper');
        await getAndRenderBoardList();
    }
}

function cancelCreateBoard(){
    currentCreateBoard = {
        "title" : "",
        "members":[]
    }
    toggleOpenId('dialog_wrapper')
}

function renderCreateDialogMemberList(){
    let htmltext = "";
    currentCreateBoard.members.forEach(member => {
        htmltext +=  `<li>${member.email}<button onclick="removeCurrentMember(${member.id})" class="std_btn btn_prime">Remove</button></li>`
    });
    document.getElementById("create_board_member_list").innerHTML = htmltext;
}

function removeCurrentMember(id){
    currentCreateBoard.members = currentCreateBoard.members.splice(id, 1);
    renderCreateDialogMemberList();
}

function renderBoardList(){
    let htmltext = "";
    boardList.forEach(board => {
        htmltext += getBoardlistEntrieTemplate(board);
    });
    document.getElementById("board_list").innerHTML = htmltext;
}

function getBoardlistEntrieTemplate(board){
    return `    <li class="card d_flex_sc_gl w_full" onclick="redirectToBoard(${board.id})">
                    <h3>${board.title}</h3>
                    <div class="board_list_entry_part d_flex_sc_gs">
                        <img src="../../assets/icons/member_icon.svg" alt="">
                        <p class="fs_m">${board.member_count}</p>
                        <p>Members</p>
                    </div>
                    <div class="board_list_entry_part d_flex_sc_gs">
                        <img src="../../assets/icons/ticket_icon.svg" alt="">
                        <p class="fs_m">${board.ticket_count}</p>
                        <p>Tickets</p>
                    </div>
                    <div class="board_list_entry_part d_flex_sc_gs">
                        <img src="../../assets/icons/assign_icon.svg" alt="">
                        <p class="fs_m">${board.tasks_to_do_count}</p>
                        <p>Tasks To-do</p>
                    </div>
                    <div class="board_list_entry_part d_flex_sc_gs">
                        <div class="priority-badge" priority="high"></div>
                        <p class="fs_m">${board.tasks_high_prio_count}</p>
                        <p>High Prio</p>
                    </div>
                </li>`
}