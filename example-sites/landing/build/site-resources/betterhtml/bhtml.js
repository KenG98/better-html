// // this script is in the head of the page, and runs before body is loaded

// var fadingIn = true;

// function doneFading() {

// }

// // this function runs after page load if there are any elements with
// // the class "bhtml-fade-in-fade-out-class"
// function existFaders(elements){
//   animationEnds = ["webkitAnimationEnd", "mozAnimationEnd", "msAnimationEnd", 
//     "oAnimationEnd", "animationEnd"];
//   // make these elements listen for the end of their animation
//   elements.forEach(el => {
//     animationEnds.forEach(animEnd => el.addEventListener(animEnd, doneFading));
//   });
// }

// // this callback is run once the body is loaded
// window.addEventListener('load', function() {
//   // check for "bhtml-fade-in-fade-out-class"
//   var faders = document.getElementByClassName("bhtml-fade-in-fade-out-class");
//   if (faders.length > 0) {
//     existFaders(faders);
//   }
// });
