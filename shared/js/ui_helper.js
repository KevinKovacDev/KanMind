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
