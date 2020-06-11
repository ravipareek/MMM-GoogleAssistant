Module.register("MMM-GoogleAssistant",{
	// Default module config.
	defaults: {
		display: true,
		listening: false,
	},

	// // Override dom generator.
	getDom: function() {
		let wrapper = document.createElement("div")
  		wrapper.className = "myContent"
  		wrapper.id = "googleAssistant"

  		let icon = document.createElement('img')
  		icon.id = 'googleAssistantIcon'
  		if (this.config.listening == false){
  			icon.className = 'waiting'
  			icon.src = 'modules/MMM-GoogleAssistant/res/google_assistant.png'
  		}
  		else{
  			icon.className = 'listening'
  			icon.src = 'modules/MMM-GoogleAssistant/res/listening.gif'
  		}

  		wrapper.appendChild(icon)
  		if (this.config.display){
  			let googleResponseContainer = document.createElement("div")
			googleResponseContainer.className = 'googleResponseContainer'
  			let webElement = document.createElement("div")
			webElement.id = 'googleWebResponse'
			if (this.data.webView){
	  			var xmlHttp = new XMLHttpRequest()
				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						displayHTML = xmlHttp.responseText
						webElement.innerHTML = displayHTML
					}
				}
				xmlHttp.open("GET", '/modules/MMM-GoogleAssistant/results.html', true)
				xmlHttp.send(null)
	  			googleResponseContainer.appendChild(webElement)
	  			wrapper.appendChild(googleResponseContainer)
	  		}
	  		else if (this.data.message){
	  			let textElement = document.createElement("span")
	  			textElement.id = 'googleText'
	  			textElement.innerText = this.data.message
	  			wrapper.appendChild(textElement)
	  		}
  		}
  		return wrapper
	},
	start: function() {
		console.log("Starting module: " + this.name);
		this.sendSocketNotification('establish connection');
	},
	// getTemplate: function() {
 //    	return "MMM-GoogleAssistant.njk";
 //    },
 //    getTemplateData: function(){
 //    	return {
 //    		data: this.data,
 //    		webResponse: (this.data.webView == '') ? false : true
 //    	}
 //    },
	socketNotificationReceived: function(notification, payload) {
		
		self = this
		// console.log('Recieved notification')
		switch(notification) {
			case "HTML":
				self.data.webView = payload
				self.data.message = ''
	      		self.updateDom()
	      		break
	      	case "transcript":
	     		self.data.message = payload
	     		self.data.webView = ''
	      		self.updateDom()
	     		break
	     	case "message":
	     		switch(payload.trim()){
	     			case 'Ready':
	     				// change icon
	     				self.config.listening = true
	     				self.data.message = 'Listening'
	     				self.updateDom()
	     				break
	     			case "Finished playing assistant response.":
	     			console.log('Completed Question')
	     				// wait 3 seconds and switch to default
	     				this.sendSocketNotification('completed_query');
	     				setTimeout(()=>{
	     					self.data.webView = ''
	     					self.data.message = 'This is your Google Assistant'
	     					self.config.listening = false
	     					self.updateDom()
	     				}, 3000)
	     				break
	     		}
	    }
	},
	notificationReceived: function(notification, payload, sender) {
		if ( notification == 'DOM_OBJECTS_CREATED') {
			this.data = {}
			this.data.message = 'This is your Google Assistant'
			this.data.webView = ""
			this.updateDom()
	  }
	},
	getStyles: function() {
		return ["MMM-GoogleAssistant.css"];
  	},
});