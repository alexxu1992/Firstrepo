var drag = {
  myaudioTags: [],
  drop: false,
  inAppendable: null,
  inMaterial: null,
  currentObject: null
}

function initDrag(){
  for( i = 0; i < Me.playlist.length; i++){
    if(Me.playlist[i] != null){
      drag.myaudioTags[i] = document.getElementById('mylist' + i);
      drag.myaudioTags[i].addEventListener('dblclick', upLoadFile);
      drag.myaudioTags[i].addEventListener('click', soundOnoff);
    }
  }
  for( i = 0; i < app.materialSounds.length;i++){
       drag.myaudioTags[i] = document.getElementById('material' + i);
       drag.myaudioTags[i].addEventListener('dblclick', upLoadFile);
       drag.myaudioTags[i].addEventListener('click', soundOnoff);
  }

  document.addEventListener('dragstart', startdrag);
  document.addEventListener('dragover',function(event){
     event.preventDefault();
  });
  document.addEventListener('drop',dropObj);
}


function startdrag(event){
    drag.currentObject = event.target;
    if(drag.currentObject.className.indexOf('appended') != -1){
        drag.inAppendable = true;
        drag.inMaterial = false;
        var regExp = /\d+/;
        var currentNum = parseInt(regExp.exec($(drag.currentObject).parent().attr('id'))[0]);
        Me.playlist[currentNum] = null;
        $(drag.currentObject).parent().addClass('appendable');
    }
    else if(drag.currentObject.parentNode.id == 'materialTable'){
        console.log("In Material");
        drag.inMaterial = true;
        drag.inAppendable = false;
    }
    else{
        drag.inAppendable = false;
        drag.inMaterial = false;
        console.log(drag.currentObject);
    }
    drag.drop = false;
}

function dropObj(event){
    event.preventDefault();
    var targetObj = event.target;
    if(targetObj.className.indexOf('appendable') != -1){ //if the target is appendable myTab
        if(!drag.inAppendable){ //if the currentObj is from material
            drag.currentObject.className += 'appended';
            targetObj.appendChild(drag.currentObject);
            $(targetObj).attr('draggable','false');
            var parentWidth = targetObj.offsetWidth;
            var parentHeight = targetObj.offsetHeight;
            var length = targetObj.children.length;
            var thisChild = targetObj.children[length-1];
            thisChild.style.left = '0px';
            thisChild.style.top = '0px';
            thisChild.style.width = parentWidth + 'px';
            thisChild.style.height = parentHeight + 'px';
            drag.drop = true;
            $(targetObj).removeClass('appendable');
        }
        else{  // if the currentObj is already from another myTab
             targetObj.appendChild(drag.currentObject);
             drag.drop = true;
             $(targetObj).removeClass('appendable');
        }
        var regExp = /\d+/;
        var currentNum = parseInt(regExp.exec(targetObj.id)[0]);
        Me.playlist[currentNum] = $(drag.currentObject).find('audio').attr('src');
        console.log(Me.playlist);
        socket.emit('myPlaylist', Me.playlist);
    }
    else {  //if the target is not appendable myTab
        if (drag.inAppendable) { //the currentObj from myTab
          if($(targetObj).attr('id') == 'materialTable'){ // to materialTable
            drag.currentObject.style.removeProperty('height');
            drag.currentObject.style.removeProperty('width');
            console.log('i am from my Tab to materialTag');
            $(drag.currentObject).css({'position':''}).removeClass('appended');
            drag.inAppendable = false;
            $(targetObj).append(drag.currentObject);
          }
          else{ //to another occupied myTab
            console.log('do not change anything now');
          }
        }
        else if(drag.inMaterial){  // the currentObj from matetial
            console.log('i am droping in material table');
        }
    }
}

function soundOnoff(event){
  var theSound = event.target.getElementsByTagName('audio')[0];
  var pause = theSound.paused;
  if(pause){
      theSound.play();
      event.target.style.opacity = '0.3';
  }
  else{
    theSound.pause();
    event.target.style.opacity = '1';
  }
}

function upLoadFile(event){
    var fileInput = event.target.getElementsByTagName('input')[0];
    fileInput.click();
}
