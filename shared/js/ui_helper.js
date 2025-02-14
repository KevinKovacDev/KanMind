function stopProp(event) {
    event.stopPropagation()
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






function toggleSwitch(element) {
    element.classList.toggle("active");
}