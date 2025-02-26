function logOut() {
    removeAuthCredentials()
    window.location.href = "../auth/login.html";
}

async function setHeader() {
    setHeaderTemplate()
}

function setHeaderTemplate() {
    let headerRef = document.getElementById('head_content_right')
    headerRef.innerHTML = getHeaderTemplate()
}

function getHeaderTemplate() {
    const currentUrl = window.location.href;
    
    if (currentUrl.endsWith('login.html')) {
        return `
        <div class="d_flex_cc_gm">
            <a href="./register.html" class="std_btn btn_prime pad_s d_flex_cc_gs">
                <img src="../../assets/icons/sign_up_icon.svg" alt="" srcset=""> 
                Sign up
            </a>
        </div>`
    } else if (currentUrl.endsWith('register.html')) {
        return `
        <div class="d_flex_cc_gm">
            <a href="./login.html" class="std_btn btn_prime pad_s d_flex_cc_gs">
                <img src="../../assets/icons/login_icon.svg" alt="" srcset=""> 
                Log in
            </a>
        </div>`
    } else {
        return getLogedInHeaderTemplate()
    }
}

function getLogedInHeaderTemplate() {
    let currentUser = getAuthUser();
    if(!currentUser.id){
        window.location.href = "../auth/login.html"
    }
    return `
        <a class="d_flex_sc_gm  dashboard_link" href="../dashboard/">
            <img src="../../assets/icons/dashboard.svg" alt="" srcset=""><span>Your Dashboard</span>
        </a> 
        <button onclick="toggleOpen(this); stopProp(event)" closable="true" open="false" class="profile_circle color_${currentUser.initials[0]}">${currentUser.initials}</button>   
        <div class="menu_content d_flex_cc_gm f_d_c">
            <p class="d_flex_cc_gm font_white_color" onclick="logOut()">
                <img src="../../assets/icons/logout.svg" alt="" srcset=""> 
                Log out 
            </p>
        </div>`
}