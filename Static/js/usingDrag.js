var myaudioTags = [];
var materialTable = 'materialTable';
var appendable = 'appendable';
var appended = ' appended';
var reg; // the regular expression for parsing the string
function initDrag(){
  reg = /\d+/;
  //import the audiotag
  for( i = 0; i < tagsNumber; i++){
     myaudioTags[i] = document.getElementById('audioTag' + i);
      myaudioTags[i].addEventListener('dblclick', upLoadFile);
     myaudioTags[i].addEventListener('click', soundOnoff);

  }

  document.addEventListener('dragstart', startdrag);
  document.addEventListener('dragend', dragEnding);
  document.addEventListener('dragover',function(event){
    event.preventDefault();
  });
  document.addEventListener('drop',dropObj);

}

var drop = false;
var inAppendable;
var inMaterial;
var mouseX, mouseY;
var currentObject;
var originWidth ;
var originHeight ;
var parentWidth ;
var parentHeight ;

function startdrag(event){
    currentObject = event.target;
    console.log("1");
    if(currentObject.className.indexOf(appended) != -1){
        console.log("2");
        inAppendable = true;
        inMaterial = false;
    }
    else if(currentObject.parentNode.id == materialTable){
        console.log("In Material");
        inMaterial = true;
        inAppendable = false;
    }
    else{
        console.log("3");
        inAppendable = false;
        inMaterial = false;
        originWidth =  window.getComputedStyle(currentObject,null).getPropertyValue('width');
        originWidth = parseInt(reg.exec(originWidth)[0]);
        originHeight = window.getComputedStyle(currentObject,null).getPropertyValue('height');
        originHeight = parseInt(reg.exec(originHeight)[0]);
    }
    drop = false;
}

function dragEnding(event){

    if(!drop){
        mouseX = event.clientX;
        mouseY = event.clientY;

        event.target.style.left = mouseX + 'px';
        event.target.style.top = mouseY + 'px';

    }

}

function upLoadFile(event){
    var fileInput = event.target.getElementsByTagName('input')[0];
    fileInput.click();
}

function dropObj(event){
    event.preventDefault();
    var targetObj = event.target;

    if(targetObj.className.indexOf(appendable) != -1){
        console.log("4");
        if(!inAppendable){
            console.log("5");
            drop = true;
            currentObject.className += appended;

            targetObj.appendChild(currentObject);

            parentWidth = window.getComputedStyle(targetObj,null).getPropertyValue('width');
            parentWidth = parseInt(reg.exec(parentWidth)[0]);
            parentHeight = window.getComputedStyle(targetObj,null).getPropertyValue('height');
            parentHeight = parseInt(reg.exec(parentHeight)[0]);

            console.log("Target: " +parentHeight + " " + parentWidth);

            var length = targetObj.children.length;
            var thisChild = targetObj.children[length-1];

            thisChild.style.left = '0px';
            thisChild.style.top = '0px';
            thisChild.style.width = parentWidth + 'px';
            thisChild.style.height = parentHeight + 'px';
        }
        else{
            console.log("6");
            targetObj.appendChild(currentObject);
            drop = true;
        }
    }
    else {
        if (inAppendable) {
            console.log("7");
            var className = currentObject.className;
            currentObject.className = className.substring(0, className.indexOf(appended));
            currentObject.style.removeProperty('height');
            currentObject.style.removeProperty('width');
            inAppendable = false;
        }
        if(!inMaterial){
            var tableObject = document.getElementById(materialTable);
            tableObject.appendChild(currentObject);
        }
    }


}

function soundOnoff(event){
  var theSound = event.target.getElementsByTagName('audio')[0];
  var pause = theSound.paused;
  if(pause){
      theSound.play();
  }
  else{
    theSound.pause();
  }
}
