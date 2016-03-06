
function logupCheck(){
  var newAccount = document.getElementById('luAccount').value;
  var newPassword = document.getElementById('luPassWord').value;
  var newGoodName = document.getElementById('lunickName').value;
  var gender = get_radio_value();
  var userImfo = {Acc:newAccount, Pass:newPassword, Name:newGoodName, Gender:gender};
  socket.emit('logup', userImfo);
}

function get_radio_value() {
  var inputs = document.getElementsByName("gender");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) {
       return inputs[i].value;
      }
    }
  }

  socket.on('logupCheck', function(data){
    if(data == true){
      alert('this Account has been used, please Change a little bit')
    }else{
      alert('Congrats! Start but not end in interest');
      ////////adding the transition of the page.
      var page2 = document.getElementById('logupPage');
      page2.className = 'page2 invisible';
      var page1 = document.getElementById('loginPage');
      page1.className = 'page1 invisible';
      var page3 = document.getElementById('personalPage');
      page3.className = 'page3 visible';
      initTable();


    }
  })
