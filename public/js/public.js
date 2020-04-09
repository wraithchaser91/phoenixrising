let device = "desktop";
let width = window.screen.availWidth;
if(width >= 768 && width < 1025){
    device = "tablet";
}else if(width < 767){
    device = "mobile";
}

if(device == "mobile"){
    let isMenuShown = false;
    let navMenu = document.getElementById("mobileNav");
    document.getElementById("hamburger").addEventListener("click", ()=>{
        if(isMenuShown){
            navMenu.style.transform = "translateX(50vw)";
        }else{
            navMenu.style.transform = "translateX(0)";
        }
        isMenuShown = !isMenuShown;
    });
}