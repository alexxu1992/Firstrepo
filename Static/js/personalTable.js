var tagsNumber = 16;
///////////////////////////////////////////create a app object to record some basic imformation
var Me = {
  Name: null,
  socketId: null,
  peer: null,
  peerId: null,
  playlist: new Array(16)
}
var Client = {
  Name: null,
  socketId: null,
  peer: null,
  peerId: null,
  playlist: new Array(16),
}
var app = {
  conn: null,
  play: null,
  agree: false,
  choiceHide: true,
  canvas: null,
  timer: null,
  materialSounds:[],
  allSounds:[]
}
socket.on('myImform', function(data){
  Me.Name = data.Goodname;
  var imform = document.getElementById('personalImfom');
  imform.innerHTML = 'Welcome back     ' + Me.Name;
  Me.playlist = data.playList;
})

//////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////initialize the personal table and material table
function initTable(){
  //Me.playlist[5] = sketch.fireSounds[5].url;
  setWhole();
  setMaterial();
  prepareMatch();
}

function setWhole(){
  var myTabs = [];
  for(i = 0; i < tagsNumber; i++){
    myTabs[i] = document.createElement('div');
    $('#wholeTable').append(myTabs[i]);
    $(myTabs[i]).addClass('myTabs')
    .addClass('appendable')
    .attr({'id':'myTab' + i});
  }

  for(j = 0; j < Me.playlist.length; j++){
    if(Me.playlist[j] != null){
      var thisMusic = document.createElement('audio');
      $(thisMusic).attr({'loop':'true', 'src':Me.playlist[j], 'type':'audio/mp3'});

      var musicTag = document.createElement('div');
      var filename = Me.playlist[j].substring(Me.playlist[j].lastIndexOf('/') + 1, Me.playlist[j].lastIndexOf('.'));
      $(myTabs[j]).append(musicTag).removeClass('appendable');
      $(musicTag).html(filename)
      .addClass('material')
      .addClass('appended')
      .attr({'id':'mylist' + j, 'draggable':'true'})
      .append(thisMusic)
      .append('<input type="file" hidden>')
      .css({'background-color':'#b3b3ff','position':'absolute', 'width':$(myTabs[j]).width()+'px', 'height':$(myTabs[j]).height()+'px'});

      for(var k = 0; k < app.materialSounds.length; k++){
        if(Me.playlist[j] == app.materialSounds[k].url){
          app.materialSounds.splice(k,1);
          break;
        }
      }

    }
  }

}

function setMaterial(){
  for(var i = 0; i < app.materialSounds.length; i++){
    var materialSound = document.createElement('audio');
    $(materialSound).attr({'loop':'true', 'src':app.materialSounds[i].url, 'type':'audio/mp3'});

    var materialTag = document.createElement('div');
    var filename = app.materialSounds[i].url.substring(app.materialSounds[i].url.lastIndexOf('/') + 1, app.materialSounds[i].url.lastIndexOf('.'));
    $('#materialTable').append(materialTag);
    $(materialTag)
    .addClass('material')
    .html(filename)
    .attr({'id':'material' + i, 'draggable':'true'})
    .append(materialSound)
    .append('<input type="file" hidden>')
    .css({'background-color': '#b3b3ff', 'color':'white'});
  }
  initDrag();
}

function prepareMatch(){
  var matchButton = document.getElementById('matchButton');
  matchButton.addEventListener('click', checkMusic);
}

function checkMusic(){
  var fullList = true;
  for(i = 0; i < Me.playlist.length; i++){
    if(Me.playlist[i] == null){
      fullList = false;
      alert('Please spend a little time to fullfill your music table ^_^');
      break;
    }
  }
  if(fullList){
   socket.emit('match', true);
  }
}

socket.on('waitforPatner',function(data){
  if(data == true){
    var waitinghint = document.getElementById('waiting');
    waitinghint.className = 'visible';
  }
});
//////////////////////////////////////////////////////////

///////////////////////////////////////////////get peer ID and wait for other call me
function getPeerID(){
  Me.peer = new Peer({host:'xx551.itp.io',port:9000,path:'/'});
  Me.peer.on('open',function(id){
    console.log('my peer id is' + id);
    Me.peerId = id;
    socket.emit('peerId', Me.peerId);
  });
 //when somebody finds you and then you can communicate with each others,this is the client
  Me.peer.on('connection', function(conn){

    // enterSketch();
     app.conn = conn;
     conn.on('data', function(data) {
       if(data.event == 'clientList'){
         conn.send({
           event: 'clientList',
           clientList: Me.playlist
         });
         Client.playlist = data.clientList;
         initTheMusic();
         startPassivePlay();
         //enterSketch();
       }
       else if(data.event == 'Index'){
         sketch.clientIndex = data.clientInd;
         sketch.second = data.time;
       }
     });

     conn.on('close', function(){
       alert('Your partner has left');
     })
  })

  socket.on('partnerID', function(partner_ID){
    console.log('my partner peer ID = ' + partner_ID);
    //G_partnerID = partner_ID;
    Client.peerId = partner_ID;
  })
}
//////////////////////////////////////////////////////////
function startPassivePlay(){
    app.play = setInterval(function(){
      background(0);
      sketch.myIndex = getMouseIndex();
      runMyMusic(sketch.clientIndex);
      runClientMusic(sketch.myIndex);
      app.conn.send({
         event: 'Index',
         clientInd:sketch.myIndex
      });
      app.timer.innerHTML = 'The time now is ' + floor(sketch.second);
      if(sketch.second > 15 && app.choiceHide){
        app.choiceHide = false;
        makeChoice();
      }
   },1000/60);

}
