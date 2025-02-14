async function setHeader() {
    setHeaderTemplate()
}

function setHeaderTemplate() {
    let headerRef = document.getElementById('head_content_right')
    if (true) {
        headerRef.innerHTML = getLogedInHeaderTemplate()
    } else {
        headerRef.innerHTML = getLogedOutHeaderTemplate()
    }
}

function getLogedInHeaderTemplate() {
    return `
    <a class="d_flex_sc_gm  dashboard_link" href="dashboard.html"><img src="../../assets/icons/dashboard.svg" alt="" srcset=""><span>Your Dashboard</span></a> 
        <button onclick="toggleOpen(this); stopProp(event)" closable="true" open="false" class="profile_circle">KK</button>   
        <div class="menu_content d_flex_cc_gm f_d_c">
                <p class="d_flex_cc_gm font_white_color" onclick="logOut()"><img src="../../assets/icons/logout.svg" alt="" srcset=""> Log out </p>
            </div>`
}

function getLogedOutHeaderTemplate() {
    const currentUrl = window.location.href;
    
    if (currentUrl.endsWith('login.html')) {
        return `
        <div class="d_flex_cc_gm">
            <a href="./registration.html" class="std_btn btn_prime pad_s  font_white_color">Registrieren</a>
        </div>`
    } else if (currentUrl.endsWith('registration.html')) {
        return `
        <div class="d_flex_cc_gm">
            <a href="./login.html" class="std_btn btn_secondary pad_s ">Login</a>
        </div>`
    } else {
        return `
            <div class="d_flex_cc_gm">
                <a href="./login.html" class="std_btn btn_secondary pad_s ">Login</a>
                <a href="./registration.html" class="std_btn btn_prime pad_s  font_white_color">Registrieren</a>
            </div>`
    }
}