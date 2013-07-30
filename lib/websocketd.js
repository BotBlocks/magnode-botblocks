var websocket = require('ws');

function interfaceServer(){

}
module.exports = interfaceServer;

interfaceServer.prototype.listenWebsocket = function listenWebsocket(httpd){
	console.log('Creating ws server');
	var s = new websocket.Server({server:httpd});
	var inputs = {};
	var outputs = {};
	s.on('connection', function(connection) {
		console.log('Accepting ws connection');
		function sendOutputs(){
			connection.send(JSON.stringify({outputs:outputs}));
		}
		connection.on('message', function(message) {
		});
		sendOutputs();
	});
}

interfaceServer.prototype.scanInterfaces = function scanInterfaces(db, render, cb){
	var self = this;
	db.find({type:"http://botblocks.net/Interface", subject:{$exists:true}}).forEach(function(node){
		self.addInterface(node);
	});
}

interfaceServer.prototype.addInterface = function addInterface(node){
	var id = node._id || node.subject;
	id = id.toString();
	self.interfaces[id] = new Interface(node);
}


function Interface(document){
	this.document = document;
}

module.exports.Interface = Interface;
