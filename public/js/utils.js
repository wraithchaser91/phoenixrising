formatDate=timestamp=>{let date = new Date(timestamp).toISOString().split("T")[0];let pieces=date.split("-");return`${pieces[2]}/${pieces[1]}/${pieces[0]}`;}

let device = "desktop";
let width = window.screen.availWidth;
if(width >= 768 && width < 1025){
    device = "tablet";
}else if(width < 767){
    device = "mobile";
}