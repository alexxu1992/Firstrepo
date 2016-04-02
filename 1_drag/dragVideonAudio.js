var myaudioTags = [];
var reg; // the regular expression for parsing the string
function init(){
  reg = /\d+/;

  myvideo = document.getElementById('myvideo');
  allowDrag(myvideo);

  for( i = 0; i < 2; i++){
     myaudioTags[i] = document.getElementById('audioTag' + i);
     myaudioTags[i].addEventListener('dblclick', Aonandoff);
     //allowDrag(myaudioTags[i]);
  }

  // document.addEventListener('mousemove', onthedrag);
  // document.addEventListener('mouseup', drop);

  document.addEventListener('mousedown',function(event){
    console.log(event.target);
  })

  document.addEventListener('drag',function(event){
      //event.preventDefault();
      currentObject = event.target;
      drag = true;
      thisPosX = event.clientX;
      thisPosY = event.clientY;
      event.target.style.left = thisPosX + 'px';
      event.target.style.top = thisPosY + 'px';
      console.log(thisPosX);
  })
  document.addEventListener('dragend', function(event){
      console.log(thisPosX);
      currentObject.style.left = thisPosX + 'px';
      currentObject.style.top = thisPosY + 'px';
      drag = false;
  })
  //document.addEventListener('drop', acceptObj);
}

var drag = false;
var thisPosX, thisPosY;
var mouseX, mouseY, lastMouseX, lastMouseY;
var currentObject;

function allowDrag(element){
  element.addEventListener('mousedown', dragbegin);
}

function dragbegin(evt){
  evt.preventDefault();
  currentObject = evt.target;
  lastMouseX = evt.clientX;
  lastMouseY = evt.clientY;
  drag = true;
  thisPosX = window.getComputedStyle(currentObject, null).getPropertyValue("left");
  thisPosY = window.getComputedStyle(currentObject, null).getPropertyValue("top");
  thisPosX = parseInt(reg.exec(thisPosX)[0]);
  thisPosY = parseInt(reg.exec(thisPosY)[0]);
}

function onthedrag(evt){
  if(drag){
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    var offsetX = mouseX - lastMouseX;
    var offsetY = mouseY - lastMouseY;
    thisPosX += offsetX;
    thisPosY += offsetY;
    currentObject.style.left = thisPosX + 'px';
    currentObject.style.top = thisPosY + 'px';
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function drop(evt){
  if(drag){
    drag = false;
  }
}

function acceptObj(evt){
  evt.preventDefault();
  if(evt.target.className = 'appendable'){
     evt.target.appendChild(currentObject);
  }
  console.log(evt.target.getElementsByTagName('audio')[0]);

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
