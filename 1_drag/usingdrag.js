var myaudioTags = [];
var reg; // the regular expression for parsing the string
function init(){
  reg = /\d+/;

  myvideo = document.getElementById('myvideo');
  //import the audiotag
  for( i = 0; i < 2; i++){
     myaudioTags[i] = document.getElementById('audioTag' + i);
     myaudioTags[i].addEventListener('dblclick', Aonandoff);
  }

  document.addEventListener('dragstart', startdrag);
  document.addEventListener('dragend', dragEnding);
  document.addEventListener('dragover',function(event){
    event.preventDefault();

  })
  document.addEventListener('drop',dropObj);

}

var drop = true;
var thisPosX, thisPosY;
var mouseX, mouseY, lastMouseX, lastMouseY;
var currentObject;
var originwidth = 100;
var originheight = 100;

function startdrag(event){
  currentObject = event.target;
  thisPosX = window.getComputedStyle(event.target, null).getPropertyValue("left");
  thisPosY = window.getComputedStyle(event.target, null).getPropertyValue('Top');
  thisPosX = parseInt(reg.exec(thisPosX)[0]);
  thisPosY = parseInt(reg.exec(thisPosY)[0]);
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  drop = false;
}

function dragEnding(event){
  if(!drop){
  mouseX = event.clientX;
  mouseY = event.clientY;
  // if (event.clientX == 0 && event.clientY == 0) {
  //   return;
  // }
  var offsetX = mouseX - lastMouseX;
  var offsetY = mouseY - lastMouseY;
  thisPosX += offsetX;
  thisPosY += offsetY;
  event.target.style.left = thisPosX + 'px';
  event.target.style.top = thisPosY + 'px';
  lastMouseX = mouseX;
  lastMouseY = mouseY;
 }
}

function dropObj(event){
    event.preventDefault();
  //  console.log(event.target.id);
    if(event.target.className == 'appendable'){
       var targetObj = event.target;
       targetObj.appendChild(currentObject);

       var targetwidth = window.getComputedStyle(targetObj,null).getPropertyValue('width');
       targetwidth = parseInt(reg.exec(targetwidth)[0]);
       var targetheight = window.getComputedStyle(targetObj,null).getPropertyValue('height');
       targetheight = parseInt(reg.exec(targetheight)[0]);
       var length = targetObj.children.length;
       var thisChild = targetObj.children[length-1];
       thisChild.style.left = '0px';
       thisChild.style.top = '0px';
       thisChild.style.width = targetwidth + 'px';
       thisChild.style.height = targetheight + 'px';

       console.log(window.getComputedStyle(thisChild,null).getPropertyValue('top'));
       drop = true;
    }

}

function Aonandoff(evt){
  var theSound = evt.target.getElementsByTagName('audio')[0];
  var pause = theSound.paused;
  if(pause){
      theSound.play();
  }
  else{
    theSound.pause();
  }
}
