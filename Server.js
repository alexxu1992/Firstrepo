var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var mongoose = require('mongoose');
var peer = require('peer');
var mime = require('mime');
var compression = require('compression');
var config = require('./Static/js/config.js');

//1. firstly create the express http server and then serve the static file
var app = express();
var httpServer = http.createServer(app);
httpServer.listen(8081);

var options = {
  key: fs.readFileSync(__dirname + '/Static/data/my-key.pem'),
  cert: fs.readFileSync(__dirname + '/Static/data/my-cert.pem')
}
var httpsServer = https.createServer(options,app);
httpsServer.listen(8080);

var oneday = 86400000; //the unit is ms
app.use(compression());// use gzip to compress the file
app.use(express.static(path.join(__dirname, 'Static')));

//2. secondly create the peer server on port 9000
var pServer = require('peer').PeerServer;
var PeerServer = pServer({
    port:9000,
    ssl:{
      key: fs.readFileSync(__dirname + '/Static/data/my-key.pem'),
      cert: fs.readFileSync(__dirname + '/Static/data/my-cert.pem')
    }
  });

//3. thirdly set up the socket so that interact with the client
var io = require('socket.io').listen(httpsServer);
io.sockets.on('connect',function(socket){
    console.log('now we have a new friend');

    socket.on('signup', function(data){ //store the user's sign up imformation
      //need to check if the Account have existed
      console.log('here is a login request');
      var existed = true;
      Account.findOne({Account:data.Acc}, function(err,person){
        if(err) return handleError(err);
        if(person){
          console.log('we found the existed person here');
        }else{
          existed = false;
          ////////////////create a new account here~
          var newUser = new Account({
            Account: data.Acc,
            Password: data.Pass,
            Goodname: data.Name,
            Gender: data.Gender,
            socketID: socket.id,
            peerID: String,
            onlineStatus: true,
            wantMatch: false,
            matchStatus: false
          });
          newUser.save(function(err){
            if(err) return handleError(err);
            console.log('we have put it into database');
          })
          socket.emit('myImform', newUser);
        }
        socket.emit('logupCheck', existed);
      })

    });

    socket.on('login', function(data){  //when the user login judge the account and password
      console.log('here enters a account');
      Account.findOne({Account:data.acc, Password:data.pass},function(err,person){
         if(err) return handleError(err);
         if(person){
           person.onlineStatus = true;
           person.socketID = socket.id;
           person.save();
           console.log("now this client's socketID = " + socket.id);
           socket.emit('confirmed', true);
           socket.emit('myImform', person);
         }else{
           socket.emit('confirmed', false);
         }
      })
    });

    socket.on('peerId', function(data){ //add the peer ID into database once allow login
      Account.findOne({socketID:socket.id},function(err,person){
        if(err) return handleError(err);
        if(person){
          person.peerID = data;
          person.save();
        }else{
          console.log('we can not find this person');
        }
      })
    });

    socket.on('match', function(data){  //if the user wants to match then send back another's peerID
          console.log('we receive this match request');
          var hostPeerID;
          Account.findOne({socketID:socket.id}, function(err,person){
            if(err) return handleError(err);
            if(person){
              console.log('we set the wantMatch = true');
              person.wantMatch = true;
              hostPeerID = person.peerID;
              person.save(function(err){
                Account.findOne({wantMatch:true, matchStatus:false,socketID:{$ne:socket.id}}, function(err,person){
                  if(err) return handleError(err);
                  if(person){
                      console.log('we find the the patner');
                      socket.emit('match-up', person.peerID);
                      io.to(person.socketID).emit('partnerID', hostPeerID);
                      person.matchStatus = true;
                      person.save();
                      Account.findOneAndUpdate({socketID:socket.id}, {matchStatus:true}, function(err, doc){
                        if(err) return handleError(err);
                        console.log('now these two people are all set to matchStatus');
                      })
                  }else{
                    console.log('we cannot find the person now'+ person);
                    socket.emit('waitforPatner', true);
                  }
                });
              });



            }else{
              console.log('we could not find this person');
            }
          });

          // Account.findOne({wantMatch:true, matchStatus:false,socketID:{$ne:socket.id}}, function(err,person){
          //   if(err) return handleError(err);
          //   if(person){
          //       console.log('we find the the patner');
          //       socket.emit('match-up', person.peerID);
          //       io.to(person.socketID).emit('partnerID', hostPeerID);
          //       person.matchStatus = true;
          //       person.save();
          //       Account.findOneAndUpdate({socketID:socket.id}, {matchStatus:true}, function(err, doc){
          //         if(err) return handleError(err);
          //         console.log('now these two people are all set to matchStatus');
          //       })
          //   }else{
          //     console.log('we cannot find the person now');
          //     socket.emit('waitforPatner', true);
          //   }
          // });

        });

    socket.on('wantToKnow', function(data){
      Account.findOne({peerID: data.partner}, function(err, person){
         if(err) return handleError(err);
         if(person){
           io.to(person.socketID).emit('PartnerName', data.myName);
         }else{
           console.log('we can not find the partner so we do not send your name');
         }

      })
    })

    socket.on('decline', function(data){
      Account.findOne({peerID: data}, function(err, person){
         if(err) return handleError(err);
         if(person){
           io.to(person.socketID).emit('declined', true);
         }else{
           console.log('we can not find the partner so we do not send your name');
         }
      })
    })

    socket.on('closeP2P', function(data){
      Account.findOne({socketID: socket.id},function(err, person){
        if(err) return handleError(err);
        if(person){
          person.wantMatch = false;
          person.matchStatus = false;
          person.save();
        }else{
          console.log('could not find this want quit person');
        }
      })

    })

    socket.on('disconnect',function(){ //remove the socket and peer ID out of the
      Account.findOne({socketID:socket.id}, function(err, person){
        if(err) return handleError(err);
        if(person){
          person.socketID = null;
          person.peerID = null;
          person.onlineStatus = false;
          person.wantMatch = false;
          person.matchStatus = false;
          person.save();
          console.log("we lose this client and clean its data");

        }else{
          console.log('we could not find this person');
        }

      })

    });

})

//4. using the mongoose to open up the database
mongoose.connect('mongodb://localhost/peerJS');
var db = mongoose.connection;
var Account;  // This is a global value.
db.on('error', console.error.bind(console, 'connection error with database:'));
db.once('open',function(){
  console.log("now we connect to the peerJS database");

  var AccountSchema = mongoose.Schema({
     Account: {type:String, required:true},
     Password: {type:String, required:true},
     Goodname: {type:String, required:true},
     Gender: String,
     socketID: String,
     peerID: String,
     onlineStatus: Boolean,
     wantMatch: Boolean,
     matchStatus: Boolean
  });

  Account = mongoose.model('accounts', AccountSchema);
});
