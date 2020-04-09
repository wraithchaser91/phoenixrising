let device = "desktop";
let width = window.screen.availWidth;
if(width >= 768 && width < 1025){
    device = "tablet";
}else if(width < 767){
    device = "mobile";
}

let isStopShown = false;
document.addEventListener("scroll", ()=>{
    if(window.scrollY > screen.availHeight/2 && !isStopShown){
        document.getElementById("stop").style.transform = "translateY(0)";
    }
});

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