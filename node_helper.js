var NodeHelper = require("node_helper")
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;

module.exports = NodeHelper.create({

  start: function() {
    this.assist()
  },

  assist: function() {
    console.log('Call python script')


    let self = this

    console.log('Starting hotword listener')
    exec('python3 modules/MMM-GoogleAssistant/env/lib/python3.8/site-packages/snowboy/examples/Python3/trigger.py modules/MMM-GoogleAssistant/env/lib/python3.8/site-packages/snowboy/examples/Python3/resources/models/magic_mirror.pmdl',(error, stdout, stderr)=>{
      if (error) {
        console.error(`exec error: ${error}`);
      }
      console.log(`stdout: ${stdout}`);
      let start_assistant = spawn('modules/MMM-GoogleAssistant/env/bin/python3',['modules/MMM-GoogleAssistant/env/lib/python3.8/site-packages/googlesamples/assistant/grpc/pushtotalk.py','--project-id', 'mmm-assistant-acf12', '--device-model-id', 'mmm-assistant-acf12-magic-mirror-google-home-p49ars', '--display', '--once']);

        start_assistant.stdout.on('data',(chunk)=>{

          var textChunk = chunk.toString('utf8');// buffer to string

          console.log(textChunk)

          message = textChunk.split('==|D')
          if (message[0] == 'message'){
            self.sendSocketNotification("message", message[1])
          }
          else if (message[0] == 'HTML'){
            self.sendSocketNotification("HTML", message[1])
          }
          else if (message[0] == 'transcript'){
            self.sendSocketNotification("transcript", message[1])
          }
        });

        start_assistant.stderr.on('data', (chunk)=>{
          console.error(chunk.toString('utf8'))
        })
    });
  },
  socketNotificationReceived: function(notification, payload) {
    switch (notification){
      case 'establish connection':
        console.log(this.name + " received a socket notification: " + notification);
        break
      case 'completed_query':
        console.log('Restarting assist function')
        this.assist()
    }
  },
})