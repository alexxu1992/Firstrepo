window.addEventListener('load', login);

var socket = io.connect();
socket.on('connect',function(){
  console.log('connected');
})

function login(){
  var subButton = document.getElementById('submitButton');
  var logupButton = document.getElementById('logupButton');
  subButton.addEventListener('click', submitAccount);
  document.addEventListener('keypress',enterPersonalPage);
  logupButton.addEventListener('click', logupPage);

}

var nowPage = 1;
function logupPage(event){
  nowPage = 2;
  var page2 = document.getElementById('logupPage');
  page2.className = 'page2 visible';
  var goButton = document.getElementById('GO');
  goButton.addEventListener('click', logupCheck);
}

function enterPersonalPage(event){
  if(event.keyCode == 13){
      sendAccount();
  }
}

function submitAccount(event){
  if(nowPage == 1){
    sendAccount();
  }
  else if(nowPage == 2){
    logupCheck();
  }
}

function sendAccount(){
  var account = document.getElementById('account').value;
  var password = document.getElementById('password').value;
  var userImfo = {acc:account, pass:password};
  socket.emit('login', userImfo);
}

socket.on('confirmed',function(data){ // waiting for the server comfirm whether the account and password is correct
  if(data == 'true'){
    var page1 = document.getElementById('loginPage');
    page1.className = 'page1 invisible';

    var personalPage = document.getElementById('personalPage');
    personalPage.className = 'page2 visible';//for changing the css
    initTable();//initate the music table
    getPeerID();
  }else{
    alert('the Account or password is not correct');
  }
 console.log(data);
})

//here we use the peerJS to get the peerID and send it to the server
var peer = null;
var peerId = null;
function getPeerID(){
  peer = new Peer({host:'xx551.itp.io',port:9000,path:'/'});
  peer.on('open',function(id){
    console.log('my peer id is' + id);
    peerId = id;
  });
  socket.emit('peerId', peerId); //send it back to the server


}
