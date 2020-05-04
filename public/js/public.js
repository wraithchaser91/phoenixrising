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

let infoMessages = document.getElementsByClassName("infoMessage");
if(infoMessages.length != 0){
    setTimeout(()=>{
        for(let message of infoMessages){
            message.style.transform = "scale(0)";
        }
    },3000);
}

