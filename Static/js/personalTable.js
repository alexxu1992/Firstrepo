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
    setMaterial();

}

var myGoodname;
socket.on('myImform', function(data){
  var myImform = data;
  myGoodname = data.Goodname;
  var imform = document.getElementById('personalImfom');
  imform.innerHTML = 'Welcome back     ' + myGoodname;
});

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
     smallTabs[i].className = 'musicTab appendable';
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

function setMaterial(){

    for(var i = 0; i < tagsNumber; i++){  //put the fire music material

        var Tag = document.createElement('div');
        if(i<tagsNumber/2) {
            $(Tag).css('background-color', 'red');
        }
        else{
            $(Tag).css('background-color', 'blue');
        }
        $('#materialTable').append(Tag);
        $(Tag).addClass('material');
        $(Tag).attr("id", 'audioTag' + i);
        $(Tag).attr("draggable", 'true');

        $(Tag).append('<input type="file" hidden>');
        $(Tag).append('<audio id = "secondAudio" loop><source src = "white.mp3" type="audio/mp3"></audio>');
    }
    initDrag();

}

socket.on('waitforPatner',function(data){
  if(data == true){
    var waitinghint = document.getElementById('waiting');
    waitinghint.className = 'visible';
  }
});
