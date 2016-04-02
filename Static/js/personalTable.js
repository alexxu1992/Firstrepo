var wholeTable;
var unitWdith;
var unitHeight;
var originX, originY;
var smallTabs = [];
var regExp;
var tagsNumber = 16;

function initTable(){
  getTheSize();
  setTheTabs();
  prepareMatch();
}

var myGoodname;
socket.on('myImform', function(data){
  var myImform = data;
  myGoodname = data.Goodname;
  var imform = document.getElementById('personalImfom');
  imform.innerHTML = 'Welcome back     ' + myGoodname;
})

function getTheSize(){
  regExp = /\d+/;
  wholeTable = document.getElementById('wholeTable');
  unitWidth = window.getComputedStyle(wholeTable, null).getPropertyValue('width');
  unitHeight = window.getComputedStyle(wholeTable, null).getPropertyValue('height');
  unitWidth = parseInt(regExp.exec(unitWidth)[0]);
  unitHeight = parseInt(regExp.exec(unitHeight)[0]);
  unitWidth = unitWidth / Math.sqrt(tagsNumber);
  unitHeight = unitHeight / Math.sqrt(tagsNumber);
  originX = window.getComputedStyle(wholeTable, null).getPropertyValue('left');
  originY = window.getComputedStyle(wholeTable, null).getPropertyValue('top');
  originX = parseInt(regExp.exec(originX)[0]);
  originY = parseInt(regExp.exec(originY)[0]);
}

function setTheTabs(){
  for(i = 0; i < tagsNumber; i++){
     var newTab = document.createElement('DIV');
     smallTabs.push(newTab);
     smallTabs[i].className = 'musicTab';
     wholeTable.appendChild(smallTabs[i]);
     //deal with the little tab
     var thePos = calThePos(i);
     setTheBasicStyle(i, thePos);
     var brifText = document.createElement('p');
     smallTabs[i].appendChild(brifText);
     brifText.innerHTML = i + '';
     brifText.style.color = 'red';
     brifText.style.position = 'absolute';
     brifText.style.left= '13px';
  }
}

function calThePos(index){
  var xNum = index % Math.sqrt(tagsNumber);
  var yNum = Math.floor(index / Math.sqrt(tagsNumber));
  var xPos = xNum * unitWidth;
  var yPos = yNum * unitHeight;
  var thisPos = {x:xPos, y:yPos};
  return thisPos;
}

function setTheBasicStyle(i, Pos){
  smallTabs[i].style.position = 'absolute';
  smallTabs[i].style.left = Pos.x + 'px';
  smallTabs[i].style.top = Pos.y + 'px';
  smallTabs[i].style.width = unitWidth + 'px';
  smallTabs[i].style.height = unitHeight + 'px';
  smallTabs[i].style.borderColor = 'white';
  smallTabs[i].style.borderWidth = '1px';
  smallTabs[i].style.borderStyle = 'solid';
}

function prepareMatch(){
  var matchButton = document.getElementById('matchButton');
  matchButton.addEventListener('click', function(event){
    socket.emit('match', true);

  });

}

socket.on('waitforPatner',function(data){
  if(data == true){
    var waitinghint = document.getElementById('waiting');
    waitinghint.className = 'visible';
  }
});

/////////////////////////////////receive your partner's peerID from server and then open a call, this is host
var G_partnerID = null;
var G_conn = null;
socket.on('match-up', function(partner_peerID){
  console.log('the patner peer_id is' + partner_peerID);
  G_partnerID = partner_peerID;
  var conn = peer.connect(partner_peerID);
  G_conn = conn;
  conn.on('open', function(){
   startTime = millis()/1000;
   enterSketch();
    // Receive messages
   conn.on('data', function(data) {
      clientIndex = data.clientInd;
   });
    // Send messages
    G_myPlay = setInterval(function(){
      background(0);
      second = millis()/1000 - startTime;
      myIndex = getMouseIndex();
      runFireMusic(myIndex);
      runWaterMusic(clientIndex);
      conn.send({
         clientInd:myIndex,
         time: second
       });
      G_timer.innerHTML = 'The time now is ' + floor(second);
      //////////////to decide whether to make friend
      if(second > 5 && G_choiceHide){
        G_choiceHide = false;
        makeChoice();
      }

   },1000/60);

  });

  conn.on('close', function(){
    alert('Your partner has left~');
  })

});

var G_myPlay;
var G_timer;
var G_canvas = null;
function enterSketch(){
  G_canvas = document.getElementsByTagName('canvas')[0];
  G_canvas.style.display = 'inline';
  G_canvas.className = 'page4';
  var page3 = document.getElementById('personalPage');
  page3.className = 'page3 invisible';

  G_timer = document.getElementById('gameTimer');
  G_timer.style.display = 'inline';
}

var G_choiceHide = true;
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

var G_agree = false;
var G_partnerName = null;
function makeFriend(){
  socket.emit('wantToKnow', {
    partner: G_partnerID,
    myName: myGoodname
  })
  G_agree = true;
  if(G_partnerName){
    alert('Yes! Your friend is waiting for you, its name is ' + G_partnerName);
  }else{
    alert('need to wait for your partner response');
  }
}
socket.on('PartnerName', function(partner_imform){
  G_partnerName = partner_imform;
  if(G_agree){
    alert('Yes! Your friend is  ' + G_partnerName);
    G_agree = false;
  }
})

function declineFriend(){
  socket.emit('decline', G_partnerID);
}
socket.on('declined', function(data){
  if(data == true){
    alert("Sorry, your partner don't want to share the name now, maybe later!");
  }
  //backtoPersonal();
})


function backtoPersonal(){
  if(G_conn.open){
   G_conn.close();
  }
  socket.emit('closeP2P', G_partnerID);
  var page4 = document.getElementsByClassName('page4');
  console.log(page4);
  for(var i = 0; i < page4.length; i++){
     page4[i].style.display = 'none';
  }
  clearInterval(G_myPlay);
  var page3 = document.getElementById('personalPage');
  page3.className = 'page3 visible';
  var waitinghint = document.getElementById('waiting');
  waitinghint.className = 'invisible';
  G_partnerName = null;
  G_partnerID = null;
  G_conn = null;
  G_choiceHide = true;
}
