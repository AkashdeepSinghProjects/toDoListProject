
$(".trial").click(function (){ this.parentElement.classList.toggle("toggle");});

const greeting = ["Morning","Afternoon","Evening"];
const shortInspirationalQuotes = [
    "Dream big. Start small. Act now.",
    "Make it happen.",
    "Seize the day.",
    "Create your sunshine.",
    "Chase your dreams.",
    "Embrace the journey.",
    "Believe in yourself.",
    "Do it with passion.",
    "Stay positive. Stay fighting. Stay brave.",
    "Be the change.",
    "Live with purpose.",
    "Stay true to you.",
    "Dare to dream.",
    "Find joy in simplicity.",
    "Make today amazing."
  ];  
const d = new Date();
const time = d.getHours();
const randomQoute = shortInspirationalQuotes[Math.floor(Math.random()*shortInspirationalQuotes.length)];
var greet = "";
if(time<12){
    greet = greeting[0];
}else if(time<18){
    greet = greeting[1];
}else{
    greet = greeting[2];
}
$("#greeting").html("<h1>Good "+greet+",</h1>");
$("#qouteOfTheDay").html("<h3>"+randomQoute+"</h3>");
$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
  })

  $('.items').click(function(e) {
    this.contentEditable=true
    $(this).on('keypress blur', function(e) {
      if(e.keyCode&&e.keyCode==13||e.type=='blur'){
        
       this.contentEditable=false;

       $.ajax({
        url: "/editItem",
        type: "post",
        data: {topicID:$(this).closest('ul').attr('id'),itemIndex:$(this).attr('id'),text:$(this).text()}
      })
       return false
      }
    });
    $(this).focus()
 });
