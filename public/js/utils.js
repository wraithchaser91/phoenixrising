formatDate=timestamp=>{let date = new Date(timestamp).toISOString().split("T")[0];let pieces=date.split("-");return`${pieces[2]}/${pieces[1]}/${pieces[0]}`;}
findTimeDifference=(date1,date2)=>{let day1=date1.substring(0,2);let day2=date2.substring(0,2);return parseInt(day1)-parseInt(day2);}
let device = "desktop";
let width = window.screen.availWidth;
if(width >= 768 && width < 1025){
    device = "tablet";
}else if(width < 767){
    device = "mobile";
}