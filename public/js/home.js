let isStopShown = false;
document.addEventListener("scroll", ()=>{
    if(window.scrollY > screen.availHeight/2 && !isStopShown){
        document.getElementById("stop").style.transform = "translateY(0)";
    }
});