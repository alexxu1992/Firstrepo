var myaudioTags = [];
var reg; // the regular expression for parsing the string
function init(){
  reg = /\d+/;

  myvideo = document.getElementById('myvideo');
  //import the audiotag
  for( i = 0; i < 2; i++){
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
var inside;
var thisPosX, thisPosY;
var mouseX, mouseY, lastMouseX, lastMouseY;
var currentObject;
var originWidth ;
var originHeight ;
var parentWidth ;
var parentHeight ;
var parentTop;
var parentLeft;

function startdrag(event){
    currentObject = event.target;
    if(currentObject.className.indexOf('removable') != -1){
        inside = true;
        var leftOffset = parentWidth - originWidth;
        var topOffset = parentHeight - originHeight;

        thisPosX = parentLeft + leftOffset;
        console.log("parentleft:" + thisPosX);
        thisPosY = parentTop - topOffset/2;
        console.log("parentTop:" + thisPosY);
    }
    else{

        inside = false;
        originWidth =  window.getComputedStyle(currentObject,null).getPropertyValue('width');
        originWidth = parseInt(reg.exec(originWidth)[0]);
        originHeight = window.getComputedStyle(currentObject,null).getPropertyValue('height');
        originHeight = parseInt(reg.exec(originHeight)[0]);
        var currentTop = window.getComputedStyle(currentObject,null).getPropertyValue('top');
        var currentLeft = window.getComputedStyle(currentObject,null).getPropertyValue('left');
        thisPosX = parseInt(reg.exec(currentLeft)[0]);
        thisPosY = parseInt(reg.exec(currentTop)[0]);
    }
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    drop = false;

}

function dragEnding(event){
    //if(inside){
    //    console.log("You are moving a appendable, I will kill it");
    //    event.target.parentNode.removeChild(event.target);
    //}
    if(!drop){
        //console.log("dropend");
        mouseX = event.clientX;
        mouseY = event.clientY;

        var offsetX = mouseX - lastMouseX ;
        var offsetY = mouseY - lastMouseY;
        console.log("offset:"+ offsetX + " " + offsetY);
        thisPosX += offsetX;
        thisPosY += offsetY;
        console.log("thisPos:" + thisPosX + " " + thisPosY);
        event.target.style.left = thisPosX + 'px';
        event.target.style.top = thisPosY + 'px';
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }

}

function upLoadFile(event){
    var fileInput = event.target.getElementsByTagName('input')[0];
    fileInput.click();
}

function dropObj(event){
    event.preventDefault();
    var targetObj = event.target;
    if(targetObj.className == 'appendable'){
        if(!inside){
            drop = true;
            /* If you use DOM manipulation functions, their default behaviour it not to
             copy but to alter and move elements. By appending a ".cloneNode(true)",
             you will not move the original element, but create a copy. */
            //var nodeCopy = document.getElementById(currentObject.id).cloneNode(true);
            //nodeCopy.id = currentObject.id + "_copy"; /* We cannot use the same ID */
            //
            //nodeCopy.className += " removable";

            currentObject.className += " removable";

            targetObj.appendChild(currentObject);

            parentWidth = window.getComputedStyle(targetObj,null).getPropertyValue('width');
            parentWidth = parseInt(reg.exec(parentWidth)[0]);
            parentHeight = window.getComputedStyle(targetObj,null).getPropertyValue('height');
            parentHeight = parseInt(reg.exec(parentHeight)[0]);

            parentTop = window.getComputedStyle(targetObj,null).getPropertyValue('top');
            parentTop = parseInt(reg.exec(parentTop)[0]);
            parentLeft = window.getComputedStyle(targetObj,null).getPropertyValue('left');
            parentLeft = parseInt(reg.exec(parentLeft)[0]);

            console.log("Target: " +parentHeight + " " + parentWidth);

            var length = targetObj.children.length;
            var thisChild = targetObj.children[length-1];

            thisChild.style.left = '0px';
            thisChild.style.top = '0px';
            thisChild.style.width = parentWidth + 'px';
            thisChild.style.height = parentHeight + 'px';
        }
        else{
            targetObj.appendChild(currentObject);
            drop = true;
        }
    }
    else if(inside){
        var className = currentObject.className;
        currentObject.className = className.substring(0, className.indexOf(" removable"));
        currentObject.style.width = originWidth + 'px';
        currentObject.style.height = originHeight + 'px';
        targetObj.appendChild(currentObject);
        inside = false;
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
