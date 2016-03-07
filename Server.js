var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var mime = require('mime');
var mongoose = require('mongoose');

//1. firstly create the http or https server on port 8080
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);
// var options = {
//   key: fs.readFile(__dirname + '/Static/my-key.pem'),
//   cert: fs.readFile(__dirname + '/Static/my-cert.pem')
// };
// var httpsServer = https.createServer(options,requestHandler);
//httpsServer.listen(8080);
function requestHandler(req,res){
  var path = url.parse(req.url).pathname;
  var realPath = __dirname + '/Static' + path;
  if(path == '/'){
    fs.readFile(__dirname + '/Static/index.html',function(err,data){
      if(err){
        res.writeHead(500);
        res.end('error in loading the index')
      }else{
        res.writeHead(200);
        res.end(data);
      }
    })
  }
  else{
    fs.readFile(realPath, function(err,data){
      if(err){
        res.writeHead(500);
        res.end('error in loading the other files');
      }else{
        res.writeHead(200,{'Content-type': mime.lookup(realPath)});
        res.end(data);
      }
    })
  }
}

//2. secondly create the peer server on port 9000
var pServer = require('peer').PeerServer;
var PeerServer = pServer({
    port:9000,
    ssl:{
      key: fs.readFile(__dirname + '/Static/data/my-key.pem'),
      cert: fs.readFile(__dirname + '/Static/data/my-cert.pem')
    }
  });

//3. thirdly create the socket in httpServer for relaying the peer ID;
var io = require('socket.io').listen(httpServer);
io.sockets.on('connect',function(socket){
    console.log('now we have a new friend');

    socket.on('logup', function(data){ //store the user's sign up imformation
      //need to check if the Account have existed
      var existed = true;
      Account.find({Account:data.Acc}, function(err,person){
        if(err) return handleError(err);
        if(person.length > 0){
          console.log('we found the existed person here');
        }else{
          existed = false;
          ////////////////create a new account here~
          var newUser = new Account({
            Account: data.Acc,
            Password: data.Pass,
            Goodname: data.Name,
            Gender: data.Gender,
            peerID: String,
            onlineStatus: true,
            matchStatus: false
          });
          newUser.save(function(err){
            if(err) return handleError(err);
            console.log('we have put it into database');
          })
        }
        socket.emit('logupCheck', existed);
      })



    });

    socket.on('login', function(data){  //when the user login judge the account and password
      console.log('here enters a account');
      Account.find({Account:data.acc, Password:data.pass},function(err,person){
         if(err) return handleError(err);
         if(person.length > 0){
           socket.emit('confirmed', true);
         }else{
           socket.emit('confirmed', false);
         }
      })
    });

    socket.on('peerId', function(data){ //add the peer ID into database once login

    });

    socket.on('match', function(){  //if the user wants to match then send back another's peerID

    });

    socket.on('disconnected',function(){ //remove the socket and peer ID out of the

    });


})

//4. config the database condition and different schema here
mongoose.connect('mongodb://localhost/peerJS');
var db = mongoose.connection;
var Account;
db.on('error', console.error.bind(console, 'connection error with database:'));
db.once('open',function(){
  console.log("now we connect to the peerJS database");

  var AccountSchema = mongoose.Schema({
     Account: {type:String, required:true},
     Password: {type:String, required:true},
     Goodname: {type:String, required:true},
     Gender: String,
     peerID: String,
     onlineStatus: Boolean,
     matchStatus: Boolean
  });

  Account = mongoose.model('accounts', AccountSchema);


});
