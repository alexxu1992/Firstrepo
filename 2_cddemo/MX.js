window.addEventListener('load', init);

var cd;
var cd_sound;
var degree = 0;
var sounds=[];

function init(){
  cd = document.getElementById('circle');

  var button = document.getElementById('playButton');
  button.addEventListener('click', startPlay);
}

function playFile(obj) {
  var reader = new FileReader();
  if(sounds.length > 0){
      var music = document.createElement('audio');
      music.id = 'sound' + sounds.length;
      document.body.appendChild(music);
      console.log(music);
  }
      reader.onload = function(e) {
           var sound = document.getElementById('sound' + (sounds.length-1));
           sound.src = e.target.result;
       };

      reader.readAsDataURL(obj.files[0]);
      sounds.push(obj.files[0]);
}


var myspin;
var played = false;
var paused = false;
var currentMusic = null;
function startPlay(event){
  //cd.setAttribute('class','spin'); //use this can change the svg's class name and the className can't be use here
  if(!played){
    console.log("how much time i am here");
    played = true;
    myspin = setInterval(function(){
        degree += 1;
        cd.style.transform = 'translate(72px,50px) rotate('+degree+'deg)';
    },10);

    if(sounds.length > 0){
      if(currentMusic == null){
        currentMusic = document.getElementById('sound0');
        //currentMusic.loop = true;
        currentMusic.play();
        currentMusic.addEventListener('ended', detectNext);
      }else{
        if(paused){
          currentMusic.play();
        }

      }
    }


  }else{
    clearInterval(myspin);
    cd.style.transform = 'translate(72px,50px) rotate('+degree+'deg)';
    played = false;
    currentMusic.pause();
    paused = true;
  }
}

function detectNext(event){
   var regExp = /\d+/;
   var currentID = currentMusic.id;
   var idNumber = parseInt(regExp.exec(currentID)[0]);
   console.log(idNumber);
   if(sounds.length > (idNumber + 1)){
      currentMusic = document.getElementById('sound' + (idNumber + 1));
      currentMusic.addEventListener('ended', detectNext);
      currentMusic.play();

   }else{
      currentMusic = document.getElementById('sound0');
      currentMusic.addEventListener('ended', detectNext);
      currentMusic.play();
   }
}
