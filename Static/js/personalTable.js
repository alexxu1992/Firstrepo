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

}

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
     setTheBasicStyel(i, thePos);
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

function setTheBasicStyel(i, Pos){
  smallTabs[i].style.position = 'absolute';
  smallTabs[i].style.left = Pos.x + 'px';
  smallTabs[i].style.top = Pos.y + 'px';
  smallTabs[i].style.width = unitWidth + 'px';
  smallTabs[i].style.height = unitHeight + 'px';
  smallTabs[i].style.borderColor = 'white';
  smallTabs[i].style.borderWidth = '1px';
  smallTabs[i].style.borderStyle = 'solid';
}
