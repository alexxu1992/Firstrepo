var second;
var soundsNum = 16;

var canvas;
function setup() {
  canvas = createCanvas(1680, 1120);
  canvas.className = 'mycanvas';
  initMymusic();
}

////////////////////////////////////////////define the music taker
var mySounds = [];
var partnerSounds = [];

function preload() {
  for (i = 0; i < 16; i++) {
    mySounds[i] = loadSound('../data/' + i + 'fire.wav'); //now the fire music are my sounds
    partnerSounds[i] = loadSound('../data/' + i + 'water.wav');//using as the partner's sounds temporarily
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

//////////////////////////////////////////// create my music
var myTakers = [];
var myIndex = 0;
function initMymusic(){
  for(i = 0; i < soundsNum; i++){
    myTakers.push(new Musictaker(mySounds[i], i, 'Host'));
    partnerTakers.push(new Musictaker(partnerSounds[i], i, 'Client'));
  }
}

var myLastInd = 0;
function runMyMusic(){
  var LocX = floor(4 * mouseX / width);
  var LocY = floor(4 * mouseY / height);
  if(LocX > 3) LocX = 3;
  else if(LocY > 3) LocY = 3;
  var TotalInd = 4 * LocY + LocX;
  if(TotalInd > 15) TotalInd = 15;
    else if(TotalInd < 0) TotalInd = 0;
  SendoutIndex(TotalInd);
  if(TotalInd != myLastInd){
    myTakers[myLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!myTakers[TotalInd].stay){
    myTakers[TotalInd].begin();
  }
  //on the process of the taker
  myTakers[TotalInd].currentPlay();
  //print("this Ind =" + TotalInd + ",last Ind =" + myLastInd);

  //judge the decay of others position
  for(i = 0; i < soundsNum; i++){
    if(i != TotalInd && myTakers[i].isplay){
      myTakers[i].decay();
    }
    myTakers[i].display();
  }
  myLastInd = TotalInd;

}

function SendoutIndex(index){
  myIndex = index;
  socket.emit('Index',myIndex);
}
///////////////////////////////////////////////////////////

//////////////////////////////////////////// crete patner's music
var partnerTakers = [];
var clientIndex = 0;

var partnerLastInd = 0;
socket.on('clientIndex',function(data){
  clientIndex = data;
  console.log(clientIndex);
});

function runPartnerMusic(){
  if(clientIndex != partnerLastInd){
    partnerTakers[partnerLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!partnerTakers[clientIndex].stay){
    partnerTakers[clientIndex].begin();
  }
  //on the process of the taker
  partnerTakers[clientIndex].currentPlay();

  //judge the decay of others position
  for(i = 0; i < soundsNum; i++){
    if(i != clientIndex && partnerTakers[i].isplay){
      partnerTakers[i].decay();
    }
    partnerTakers[i].display();
  }
  partnerLastInd = clientIndex;

}
/////////////////////////////////////////////////////////////////
