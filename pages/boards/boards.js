let currentCreateBoard = {
    "title" : "",
    "members":[]
}

let currentSettingsBoard

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
    document.getElementById("dialog_wrapper").setAttribute("current-dialog", "board_create");
    currentCreateBoard = {
        "title" : "",
        "members":[]
    }
    renderCreateDialogMemberList()
    document.getElementById("board_title_input").value = "";
}

async function boardCreateInviteMember(){
    let element = document.getElementById("create_board_email_input")
    let valid = validateMemberEmail(element, currentCreateBoard.members)
    if(valid){
        boardCreateCheckMailAddress(element)
    }
}

function resetMailError(){
    setError(false, "create_board_email_input_group")
}

function validateMemberEmail(element, memberlist) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let valid = emailRegex.test(element.value.trim())
    let labelRef = document.getElementById("email_error_label")
    labelRef.innerText = "Please enter a valid email address."

    if(valid){
        valid = memberlist.filter( user => user.email == element.value.trim()).length == 0
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
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
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
    let searchValue = document.getElementById("board_search").value.trim().toLowerCase();
    let renderBoardList = boardList.filter(board => board.title.toLowerCase().includes(searchValue));
    renderBoardList.forEach(board => {
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
                    <button onclick="openBoardSettingsDialog(${board.id}); stopProp(event)" class="std_btn d_flex_sc_gs board_settings_btn">
                        <img src="../../assets/icons/settings.svg" alt="">
                    </button>
                </li>`
}

async function openBoardSettingsDialog(id) {
    let board = await getBoardById(id);
    if (board) {
        currentSettingsBoard = board;
        document.getElementById("dialog_wrapper").setAttribute("current-dialog", "board_settings");
        toggleOpenId('dialog_wrapper');
        renderBoardSettingsDialog();
    } else {
        console.error("Board not found");
    }
}

async function getBoardById(id) {
    let response = await getData(BOARDS_URL + id + "/");
    if (response.ok) {
        return response.data;
    } else {
        return null;
    }
}

function renderBoardSettingsDialog(){
    document.getElementById("board_settings_title").innerText = currentSettingsBoard.title;
    renderBoardSettingsMemberList()
}

function renderBoardSettingsMemberList(){
    let htmltext = "";
    currentSettingsBoard.members.forEach(member => {
        if(member.id == currentSettingsBoard.owner_id){
            htmltext += `<li>${member.email} <p>(owner)</p></li>`
        } else {
            htmltext +=  `<li>${member.email}<button onclick="removeBoardSettingsMember(${member.id})" class="std_btn btn_prime ">Remove</button></li>`
        }
    });
    document.getElementById("board_settings_member_list").innerHTML = htmltext;
}

async function removeBoardSettingsMember(id){
    currentSettingsBoard.members = currentSettingsBoard.members.filter(member => member.id !== id);
    await patchBoardSettingsMembers()
    renderBoardSettingsMemberList();
}

function boardSettingsInviteMember(){
    let element = document.getElementById("board_settings_email_input")
    let valid = validateMemberEmail(element, currentSettingsBoard.members)
    if(valid){
        boardSettingsCheckMailAddress(element)
    }

}

async function boardSettingsCheckMailAddress(element){
    let mail = element.value.trim()
    let resp = await checkMailAddress(mail)
    console.log(resp)
    if(resp){
        currentSettingsBoard.members.push(resp)
        renderBoardSettingsMemberList()
        document.getElementById("board_settings_email_input").value = "";
        await patchBoardSettingsMembers()
    } else {
        document.getElementById("email_error_label").innerText = "This email adress doesn't exist."
        setError(true, element.id + "_group")
    }
}

function patchBoardSettingsMembers(){
    let boardMemberIds = currentSettingsBoard.members.map(member => member.id)
    updateBoard({"members": boardMemberIds})
}

function toggleBoardTitleEdit(){
    let titleElement = document.getElementById("board_settings_title_group");
    let isEditing = titleElement.getAttribute("edit") === "true";
    titleElement.setAttribute("edit", !isEditing);
}

async function setNewBoardTitle(){
    let inputElement = document.getElementById("board_settings_title_input");
    let title = inputElement.value.trim();
    if (validateBoardTitle(inputElement)) {
        
        await updateBoard({"title": title});

        let titleElement = document.getElementById("board_settings_title");
        titleElement.innerText = title;
        toggleBoardTitleEdit();
    }
}

async function updateBoard(data){
    let response = await patchData(BOARDS_URL + currentSettingsBoard.id + "/", data);
    console.log(response.data)
    if (!response.ok) {
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        await getAndRenderBoardList();
    }
}

function openBoardDeleteToast(){
    let htmltext = `
            <article class="font_ d_flex_cc_gl">
                <div class=" d_flex_ss_gm f_d_c">
                    <h3>Delete Board</h3>
                    <p>Are you sure you want to delete the board Event Planning (Clients)?</p>
                </div>
                <div class="font_sec_color d_flex_cc_gm f_d_c">
                    <button onclick="deleteBoard()" class="std_btn btn_prime d_flex_sc_gs">
                        <img src="../../assets/icons/delete_dark.svg" alt="">
                        <p>Delete Board</p>
                    </button>
                    <button onclick="deleteLastingToast()" class="font_prime_color std_btn toast_cancel d_flex_sc_gs">
                        <p class="w_full">Cancel</p>
                    </button>
                </div>
            </article>`
    showToastLastingMessage(true, htmltext)
}

async function deleteBoard(){
    await deleteData(BOARDS_URL + currentSettingsBoard.id + "/");
    toggleOpenId('dialog_wrapper');
    getAndRenderBoardList();
    deleteLastingToast()
}