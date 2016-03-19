var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
var mime = require('mime');
var mongoose = require('mongoose');
var config = require('./Static/js/config.js');

//1. firstly create the http or https server on port 8080
var httpServer = http.createServer(requestHandler);
httpServer.listen(8081);

var options = {
  key: fs.readFileSync(__dirname + '/Static/data/my-key.pem'),
  cert: fs.readFileSync(__dirname + '/Static/data/my-cert.pem')
}
var httpsServer = https.createServer(options,requestHandler);
httpsServer.listen(8080);

var staticPath = __dirname + '/Static';
function requestHandler(req,res){
  var filepath = url.parse(req.url).pathname;
  var realPath = path.join(staticPath, filepath);
  if(filepath == '/'){
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
    //////////////////////////////here we need to examine the extension of the file for adding the expiration name
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    res.setHeader("Content-type", mime.lookup(realPath));

    ///////////////////////////////here we need to use the stream method
    fs.stat(realPath, function(err, stats){
      if(err){
         console.log('we could not find the file here' + realPath);
       }
       else{
         ////////////////////to add the lastModified header for some request
         var lastModified = stats.mtime.toUTCString();
         var ifModifiedSince = "If-Modified-Since".toLowerCase();
         res.setHeader("Last-Modified", lastModified);

         if(ext.match(config.Expires.fileMatch)) { //only the audio file now need to be cache
             var expires = new Date();
             expires.setTime(expires.getTime() + config.Expires.maxAge);
             res.setHeader("Expires", expires.toUTCString());
             res.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
          }

         if(req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]){
            res.writeHead(304, "not modified");
            res.end();
         }else{
           console.log(realPath);
           //res.writeHead(200, {'Content-type': mime.lookup(realPath),  'Content-Length': stats.size});
           var readStream = fs.createReadStream(realPath);
           readStream.pipe(res);
         }

    // fs.stat(realPath, function(err,stats){
    //   if(err){
    //     console.log('we have error finding the file' + realPath);
    //   }
    //   else{
    //     console.log(realPath);
    //     res.writeHead(200, {'Content-type': mime.lookup(realPath),  'Content-Length': stats.size});
    //     var readStream = fs.createReadStream(realPath);
    //     readStream.pipe(res);
    //   }
    // })
    }
   });
  }
}

//2. secondly create the peer server on port 9000
var pServer = require('peer').PeerServer;
var PeerServer = pServer({
    port:9000,
    ssl:{
      key: fs.readFileSync(__dirname + '/Static/data/my-key.pem'),
      cert: fs.readFileSync(__dirname + '/Static/data/my-cert.pem')
    }
  });

//3. thirdly create the socket in httpServer for relaying the peer ID;
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
          Account.findOne({socketID:socket.id}, function(err,person){
            if(err) return handleError(err);
            if(person){
              console.log('we set the wantMatch = true');
              person.wantMatch = true;
              person.save();
            }else{
              console.log('we could not find this person');
            }
          });

          Account.findOne({wantMatch:true, matchStatus:false,socketID:{$ne:socket.id}}, function(err,person){
            if(err) return handleError(err);
            if(person){
                console.log('we find the the patner');
                socket.emit('match-up', person.peerID);
                person.matchStatus = true;
                person.save();
                Account.findOneAndUpdate({socketID:socket.id}, {matchStatus:true}, function(err, doc){
                  if(err) return handleError(err);
                  console.log('now these two people are all set to matchStatus');
                })
            }else{
              console.log('we cannot find the person now');
              socket.emit('waitforPatner', true);
            }

          })

        });

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
     socketID: String,
     peerID: String,
     onlineStatus: Boolean,
     wantMatch: Boolean,
     matchStatus: Boolean
  });

  Account = mongoose.model('accounts', AccountSchema);


});
