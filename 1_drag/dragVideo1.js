var myvideo;
var VposX, VposY;
var VmouseX, VmouseY, VlastMouseX, VlastMouseY;
var Vdrag = false;

var myaudioTag, myaudioTag2;
var AposX, AposY;
var AmouseX, AmouseY, AlastMouseX, AlastMouseY;
var Adrag = false;

var playrate = 1;

var dragme = null;

function init(){
  var dragme = document.getElementById('dragme');
  dragme.addEventListener('mousedown',function() {
    var dragging = true;
    console.log("mousedown");
    dragme.addEventListener('mousemove',function(evt) {
      console.log("mousemove");

      if (dragging) {
        dragme.style.top = evt.clientX;
        dragme.style.left = evt.clientY;
      }
    });
    dragme.addEventListener('mouseup',function(evt) {
      console.log("mouseup");

      if (dragging) {
        dragme.style.top = evt.clientX;
        dragme.style.left = evt.clientY;
        dragging = false;

        //if (x and y are inside video) then attach
      //  myvideo.appendChild(dragme);
      }
    });
  });

  //video part
  VposX = 300;
  VposY = 100;
  myvideo = document.getElementById('myvideo');
  myvideo.style.left = VposX + 'px';
  myvideo.style.top = VposY + 'px';
  myvideo.addEventListener('mousedown', Vdragstart);
  myvideo.addEventListener('dragover', function(event){
    event.preventDefault();
  })



  myvideo.addEventListener('drop', attachAudio);
  myvideo.addEventListener('play', playtogether);
  myvideo.addEventListener('pause', pausetogether);
  myvideo.addEventListener('timeupdate', function(event){
    var time = event.currentTarget.currentTime;
    console.log(time);
    if(time > 0.1 && time < 0.25){
    console.log('i am here');
    playrate += 1;
    //console.log(playrate);
    event.currentTarget.playbackRate = playrate;
   }
  })

  //audio part
  AposX = 100;
  AposY = 100;
  myaudioTag = document.getElementById('audioTag1');
  myaudioTag.style.left = AposX + 'px';
  myaudioTag.style.top = AposY + 'px';
  myaudioTag.addEventListener('dblclick', Aonandoff);
  myaudioTag.addEventListener('dragstart', copydata);
  //myaudioTag.addEventListener('mousedown', Adragstart);

  myaudioTag2 = document.getElementById('audioTag2');
  myaudioTag2.style.left = AposX + 'px';
  myaudioTag2.style.top = AposY + 200 + 'px';
  myaudioTag2.addEventListener('dblclick', Aonandoff);
  myaudioTag2.addEventListener('dragstart', copydata);

  document.addEventListener('mousemove', onthedrag);
  document.addEventListener('mouseup', drop);

}

function Vdragstart(evt){
    VlastMouseX = evt.clientX;
    VlastMouseY = evt.clientY;
    Vdrag = true;
    evt.preventDefault();///////////////////////why I must use this one here????

}

function Adragstart(evt){
  AlastMouseX = evt.clientX;
  AlastMouseY = evt.clientY;
  Adrag = true;
  //console.log(Adrag);
  evt.preventDefault();
}

function onthedrag(event){
  if(Vdrag){
   VmouseX = event.clientX;
   VmouseY = event.clientY;
   calthePos('video');
   VlastMouseX = VmouseX;
   VlastMouseY = VmouseY;
 }
  else if (Adrag) {
    AmouseX = event.clientX;
    AmouseY = event.clientY;
    calthePos('audio');
    AlastMouseX = AmouseX;
    AlastMouseY = AmouseY;
  }

}

function drop(event){
  if(Vdrag){
  Vdrag = false;
 }
 else if(Adrag){
   Adrag = false;
 }
}

function Aonandoff(evt){
  var theSound = evt.currentTarget.getElementsByTagName('audio')[0];
  var pause = theSound.paused;
  if(pause){
      theSound.play();
  }
  else{
    theSound.pause();
  }
}

function calthePos(element){
  if(element == "video"){
    var offsetX = VmouseX - VlastMouseX;
    var offsetY = VmouseY - VlastMouseY;
    VposX = VposX + offsetX;
    VposY = VposY + offsetY;
    myvideo.style.left = VposX + 'px';
    myvideo.style.top = VposY + 'px';
   }
   else if(element == 'audio'){
     var offsetX = AmouseX - AlastMouseX;
     var offsetY = AmouseY - AlastMouseY;
     AposX = AposX + offsetX;
     AposY = AposY + offsetY;
     //console.log("i am here");
     myaudioTag.style.left = AposX + 'px';
     myaudioTag.style.top = AposY + 'px';
   }
}

function copydata(evt){
  evt.dataTransfer.setData('object', evt.currentTarget.id);
}

function attachAudio(evt){
  evt.preventDefault();
  var comingAudio = evt.dataTransfer.getData('object'); //this one returns the id of setData, not the object
  var thechild = document.getElementById(comingAudio);
  var newColor = window.getComputedStyle(thechild, null).getPropertyValue("background-color");
  evt.currentTarget.appendChild(thechild);
  evt.currentTarget.style.borderColor = newColor;
  evt.currentTarget.style.borderStyle = 'ridge';
  evt.currentTarget.style.borderWidth = '10px';
  if(evt.currentTarget.getElementsByTagName('audio').length > 1){
    var instruction = document.getElementById('instruction');
    instruction.innerHTML += '. Now maybe you can press "Space" to shift the audio.';
  }


}

function playtogether(evt){
  var audioNumber = evt.currentTarget.getElementsByTagName('audio').length;
  if(audioNumber > 0){
  var theSoundtoPlay = evt.currentTarget.getElementsByTagName('audio')[audioNumber - 1];
  theSoundtoPlay.play();
 }
}

function pausetogether(evt){
  var audioNumber = evt.currentTarget.getElementsByTagName('audio').length;
  for(i = 0; i < audioNumber; i++){
      var theSoundtoPlay = evt.currentTarget.getElementsByTagName('audio')[i];
      theSoundtoPlay.pause();
  }
  // var theSoundtoPlay = evt.currentTarget.getElementsByTagName('audio')[audioNumber - 1];
  // theSoundtoPlay.pause();
}
