function stopProp(event) {
    event.stopPropagation()
}

function prevDef(event) {
    event.preventDefault();
}

function closeDialog(id) {
    let dialogref = document.getElementById(id);
    dialogref.classList.add('d_none');
}

function toggleOpen(element) {
    const isOpen = element.getAttribute('open') === 'true';
    element.setAttribute('open', !isOpen);
}

function toggleOpenId(id) {
    element = document.getElementById(id)
    const isOpen = element.getAttribute('open') === 'true';
    element.setAttribute('open', !isOpen);
}

function closeOpenId(id) {
    element = document.getElementById(id)
    element.setAttribute('open', 'false');
}

function setError(valid, id) {
    document.getElementById(id).setAttribute("error", valid)
}

function getInitials(fullname) {
    const parts = fullname.trim().split(" ");
    const initials = parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    return initials;
  }




function toggleSwitch(element) {
    element.classList.toggle("active");
}

function togglePassword(icon) {
    const container = icon.closest(".form_group_w_icon_wo_label");
    const input = container.querySelector("input[type='password'], input[type='text']");

    if (input) {
        if (input.type === "password") {
            input.type = "text";
            icon.src = "../../assets/icons/pw_visibility_off.svg"; 
        } else {
            input.type = "password";
            icon.src = "../../assets/icons/pw_visibility.svg";
        }
    }
}


function toggleDropdown(button, event) {
    closeAllDropdowns(event)
    const dropdown = button.closest(".dropdown");
    dropdown.classList.toggle("open");
}


function closeAllDropdowns(event) {
    document.querySelectorAll('.dropdown.open').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });
}



function extractErrorMessages(errorObject) {
    let errorMessages = [];

    for (let key in errorObject) {
        if (errorObject.hasOwnProperty(key)) {
            const value = errorObject[key];
            if (typeof value === 'object' && value !== null) {
                errorMessages = errorMessages.concat(extractErrorMessages(value));
            } else if (Array.isArray(value)) {
                errorMessages = errorMessages.concat(value);
            } else {
                errorMessages.push(value);
            }
        }
    }

    return errorMessages;
}

function showToastMessage(error = true, msg = []) {
    const toast = document.createElement('div');
    toast.className = 'toast_msg d_flex_cc_gm pad_s';
    toast.innerHTML = getToastHTML(msg, error);
    toast.setAttribute('error', error);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}
let globalToast = null;

function showToastLastingMessage(error = true, html = "") {
    if (!globalToast) {
        globalToast = document.createElement('div');
        globalToast.className = 'toast_msg d_flex_cc_gm pad_s';
        document.body.appendChild(globalToast);
    }
    globalToast.innerHTML = `<div class="toast_msg_left d_flex_cc_gm">
            </div>
            <div class="toast_msg_right">
                    ${html}
            </div>`;
    globalToast.setAttribute('error', error);
}

function deleteLastingToast() {
    if (globalToast) {
        globalToast.remove();
        globalToast = null;
    }
}

function getToastHTML(msg, error) {
    let msglist = "";
    if (msg.length <= 0) {
        msglist = error ? "<li>An error has occurred</li>" : "<li>That worked!</li>"
    }
    for (let i = 0; i < msg.length; i++) {
        msglist += `<li>${msg[i]}</li>`
    }

    return `<div class="toast_msg_left d_flex_cc_gm">
            </div>
            <div class="toast_msg_right">
                <h3 error="false">Success</h3>
                <h3 error="true">Error</h3>
                <ul class="w_full">
                    ${msglist}
                </ul>
            </div>`
}