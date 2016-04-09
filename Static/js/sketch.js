var second;
var startTime;
var soundsNum = 16;

var canvas;
function setup() {
  canvas = createCanvas(1680, 1120);
  canvas.className = 'mycanvas';
  initMymusic();
}

////////////////////////////////////////////define the music taker
var fireSounds = [];
var waterSounds = [];

function preload() {
  for (i = 0; i < 16; i++) {
    fireSounds[i] = loadSound('../data/' + i + 'fire.mp3'); //now the fire music are my sounds
    waterSounds[i] = loadSound('../data/' + i + 'water.mp3');//using as the partner's sounds temporarily
  }
}

//define the Musictaker class
var Musictaker = function(soundfile, num, status){
  this.status = status;
  this.index = num;
  this.sound = soundfile;
  this.gridX = this.index % 4;
  this.gridY = floor(this.index / 4);
  this.isplay = false;
  this.vol = 0.0;
  this.opacity = 0.0;
  this.duration = this.sound.duration();
  this.increTime = 0.0;
  this.decayTime = 0.0;
  this.jumptime = 0.0;
  this.stay = false;
  this.onemore = false;
}

Musictaker.prototype.begin = function(){
  //this.vol = 0.0;
  this.sound.stop();
  this.decayTime = 0.0;
  this.opacity = 255;
  this.starttime = second;
  this.jumptime = second % this.duration;
  this.isplay = true;
  this.stay = true;
  this.onemore = false;
  this.sound.setVolume(this.vol);
  this.sound.jump(this.jumptime);
  //this.sound.loop()；
}

Musictaker.prototype.display = function(){
  this.opacity = map(this.vol, 0, 1, 0, 255);
  if(this.status == 'Host'){
    fill(255,163,26,this.opacity);
  } else{
    fill(179,236,255,this.opacity);
  }
    rect(this.gridX * 0.25 * width, this.gridY * 0.25 * height, 0.25 * width, 0.25 * height);

}

Musictaker.prototype.currentPlay = function(){
  if(this.vol < 1){
    var offset = 1 - this.vol;
    this.vol += 0.05 * offset;
    this.sound.setVolume(this.vol);
  }
  if(second > this.starttime + (this.duration - this.jumptime)){
    this.begin();
  }
}

Musictaker.prototype.decay = function(){
  this.decayTime += 0.02;
  if(this.vol > 0.02){
    this.vol = pow(0.5, this.decayTime);
    this.sound.setVolume(this.vol);
  }
  else{
    this.vol = 0;
    //this.sound.stop();
    this.isplay = false;
  }

}
//////////////////////////////////////////////////////////////////
var fireTakers = [];
var waterTakers = [];
function initMymusic(){
  for(i = 0; i < soundsNum; i++){
    fireTakers.push(new Musictaker(fireSounds[i], i, 'Host'));
    waterTakers.push(new Musictaker(waterSounds[i], i, 'Client'));
  }
}

var myIndex = 0;
var clientIndex = 0;

function getMouseIndex(){
  var LocX = floor(4 * mouseX / width);
  var LocY = floor(4 * mouseY / height);
  if(LocX > 3) LocX = 3;
  else if(LocY > 3) LocY = 3;
  var TotalInd = 4 * LocY + LocX;
  if(TotalInd > 15) TotalInd = 15;
    else if(TotalInd < 0) TotalInd = 0;
  return TotalInd;
}
///////////////////////////////////////////////////////////////

//////////////////////////////////////////// create fire music
var fireIndex = 0;
var fireLastInd = 0;
function runFireMusic(theIndex){
  fireIndex = theIndex;
  //SendoutIndex(TotalInd);
  if(fireIndex != fireLastInd){
    fireTakers[fireLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!fireTakers[fireIndex].stay){
    fireTakers[fireIndex].begin();
  }
  //on the process of the taker
  fireTakers[fireIndex].currentPlay();

  //judge the decay of others position
  for(i = 0; i < soundsNum; i++){
    if(i != fireIndex && fireTakers[i].isplay){
      fireTakers[i].decay();
    }
    fireTakers[i].display();
  }
  fireLastInd = fireIndex;

}


///////////////////////////////////////////////////////////

//////////////////////////////////////////// crete water music

var waterIndex = 0;
var waterLastInd = 0;
function runWaterMusic(theIndex){
  waterIndex = theIndex;
  if(waterIndex != waterLastInd){
    waterTakers[waterLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!waterTakers[waterIndex].stay){
    waterTakers[waterIndex].begin();
  }
  //on the process of the taker
  waterTakers[waterIndex].currentPlay();

  //judge the decay of others position
  for(i = 0; i < soundsNum; i++){
    if(i != waterIndex && waterTakers[i].isplay){
      waterTakers[i].decay();
    }
    waterTakers[i].display();
  }
  waterLastInd = waterIndex;

}
/////////////////////////////////////////////////////////////////
