var sketch = {
  second: 0,
  startTime: 0,
  soundsNum: 16,
  fireSounds:[],
  waterSounds:[],
  fireTakers:[],
  waterTakers:[],
  myMusicTakers:[],
  clientMusicTakers:[],
  myIndex:0,
  clientIndex:0
}

function setup() {
  app.canvas = createCanvas(1680, 1120);
  //initTheMusic();
}

////////////////////////////////////////////load the music
function preload() {
  for (i = 0; i < 16; i++) {
    sketch.fireSounds[i] = loadSound('../data/' + i + 'fire.mp3');
    app.materialSounds[i] = sketch.fireSounds[i];
    app.allSounds[i] = sketch.fireSounds[i];
  }
  for(i = 0; i < 16; i++){
    sketch.waterSounds[i] = loadSound('../data/' + i + 'water.mp3');
    app.materialSounds[i + 16] = sketch.waterSounds[i];
    app.allSounds[i + 16] = sketch.waterSounds[i];
  }

}

//////////////////////////////////////////define the Musictaker class
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
  this.startTime = sketch.second;
  this.jumptime = sketch.second % this.duration;
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
    fill(179,236,255,this.opacity);
  } else{
    fill(255,163,26,this.opacity);
  }
    rect(this.gridX * 0.25 * width, this.gridY * 0.25 * height, 0.25 * width, 0.25 * height);
}

Musictaker.prototype.currentPlay = function(){
  if(this.vol < 1){
    var offset = 1 - this.vol;
    this.vol += 0.05 * offset;
    this.sound.setVolume(this.vol);
  }
  if(sketch.second > this.startTime + (this.duration - this.jumptime)){
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

/////////////////////////////////here we set the sequence of the music
function initTheMusic(){
  //console.log(Me.playlist);
  for(i = 0; i < sketch.soundsNum; i++){ //going through all the musicTable tabs
    for(var j = 0; j < app.allSounds.length; j++){ //generating my table
        if(app.allSounds[j].url == Me.playlist[i]){
          sketch.myMusicTakers.push(new Musictaker(app.allSounds[j], i, 'Host'));
          break;
        }
    }
    for(var k = 0; k < app.allSounds.length; k++){ //generating client table
        if(app.allSounds[k].url == Client.playlist[i]){
          sketch.clientMusicTakers.push(new Musictaker(app.allSounds[k], i, 'Client'));
          break;
        }
    }
  }
  console.log(sketch.myMusicTakers);

  enterSketch();
}

// var sketch.myIndex = 0;
// var clientIndex = 0;
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

//////////////////////////////////////////// run my music
var myLastInd = 0;
function runMyMusic(theIndex){
  if(theIndex != myLastInd){
    sketch.myMusicTakers[myLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!sketch.myMusicTakers[theIndex].stay){
    sketch.myMusicTakers[theIndex].begin();
  }
  //on the process of the taker
  sketch.myMusicTakers[theIndex].currentPlay();
  //judge the decay of others position
  for(i = 0; i < sketch.soundsNum; i++){
    if(i != theIndex && sketch.myMusicTakers[i].isplay){
      sketch.myMusicTakers[i].decay();
    }
    sketch.myMusicTakers[i].display();
  }
  myLastInd = theIndex;
}

///////////////////////////////////////////////////////////

//////////////////////////////////////////// run client music
var clientLastInd = 0;
function runClientMusic(theIndex){
  if(theIndex != clientLastInd){
    sketch.clientMusicTakers[clientLastInd].stay = false;
  }
  //to initialize the start point of a taker
  if(!sketch.clientMusicTakers[theIndex].stay){
    sketch.clientMusicTakers[theIndex].begin();
  }
  //on the process of the taker
  sketch.clientMusicTakers[theIndex].currentPlay();

  //judge the decay of others position
  for(i = 0; i < sketch.soundsNum; i++){
    if(i != theIndex && sketch.clientMusicTakers[i].isplay){
      sketch.clientMusicTakers[i].decay();
    }
    sketch.clientMusicTakers[i].display();
  }
  clientLastInd = theIndex;
}
/////////////////////////////////////////////////////////////////

//////////////////////////////////////////// forwardly enter the sketch to play with others
socket.on('match-up', function(partner_peerID){
  console.log('the patner peer_id is' + partner_peerID);
  Client.peerId = partner_peerID;
  var conn = Me.peer.connect(partner_peerID);
  app.conn = conn;
  conn.on('open', function(){
   // sketch.startTime = millis()/1000;
   //  enterSketch();
    conn.send({
      event: 'clientList',
      clientList: Me.playlist
    });
    // Receive messages
   conn.on('data', function(data) {
      console.log(data.event);
      if(data.event == 'clientList'){
        Client.playlist = data.clientList;
        initTheMusic();
        //enterSketch();
        sketch.startTime = millis()/1000;
        startActivePlay();
      }
      else if(data.event == 'Index'){
        sketch.clientIndex = data.clientInd;
      }
   });
    // Send messages

  });

  conn.on('close', function(){
    alert('Your partner has left~');
  })

});

function enterSketch(){
  app.canvas = document.getElementsByTagName('canvas')[0];
  app.canvas.style.display = 'inline';
  app.canvas.className = 'page4';
  var page3 = document.getElementById('personalPage');

  page3.className = 'page3 invisible';

  app.timer = document.getElementById('gameTimer');
  app.timer.style.display = 'inline';
}

function startActivePlay(){
  console.log('i am start the activePlay now');
  app.play = setInterval(function(){
    background(0);
    sketch.second = millis()/1000 - sketch.startTime;
    sketch.myIndex = getMouseIndex();
    runMyMusic(sketch.clientIndex);
    runClientMusic(sketch.myIndex);
    app.conn.send({
       event: 'Index',
       clientInd:sketch.myIndex,
       time: sketch.second
     });
    app.timer.innerHTML = 'The time now is ' + floor(sketch.second);
    //////////////to decide whether to make friend
    if(sketch.second > 15 && app.choiceHide){
      app.choiceHide = false;
      makeChoice();
    }
 },1000/60);
}

function makeChoice(){
  var choice = document.getElementById('choice');
  choice.style.display = 'inline';

  var Ychoice = document.getElementById('Ychoice');
  var Nchoice = document.getElementById('Nchoice');
  var quit = document.getElementById('quitMatch');

  Ychoice.addEventListener('click', makeFriend);
  Nchoice.addEventListener('click', declineFriend);
  quit.addEventListener('click', backtoPersonal);

}

function makeFriend(){
  socket.emit('wantToKnow', {
    partner: Client.peerId,
    myName: Me.Name
  })
  app.agree = true;
  if(Client.Name){
    alert('Yes! Your friend is waiting for you, its name is ' + Client.Name);
  }else{
    //alert('need to wait for your partner response');
  }
}

socket.on('PartnerName', function(partner_imform){
  Client.Name = partner_imform;
  if(app.agree){
    alert('Yes! Your friend is  ' + Client.Name);
    app.agree = false;
  }
})

function declineFriend(){
  socket.emit('decline', Client.peerId);
}

socket.on('declined', function(data){
  if(data == true){
    //alert("Sorry, your partner don't want to share the name now, maybe later!");
  }
  //backtoPersonal();
})

function backtoPersonal(){
  if(app.conn.open){
   app.conn.close();
  }
  socket.emit('closeP2P', Client.peerId);
  var page4 = document.getElementsByClassName('page4');
  console.log(page4);
  for(var i = 0; i < page4.length; i++){
     page4[i].style.display = 'none';
  }
  clearInterval(app.play);
  var page3 = document.getElementById('personalPage');
  page3.className = 'page3 visible';
  var waitinghint = document.getElementById('waiting');
  waitinghint.className = 'invisible';
  Client.Name = null;
  Client.peerId = null;
  app.conn = null;
  app.choiceHide = true;
}
///////////////////////////////////////////////////////////////
