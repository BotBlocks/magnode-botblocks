var url=require('url');
var fs=require('fs');

var staticRouter = require('magnode/route.static');

// Set it up to use a manifest/index file
// FIXME adding/removing RDF triples from the database is a perfectly functional but semantically incorrect
// way to enable/disable a theme. Enabling/disabling a theme should be controlled by membership to a class.
module.exports.importTheme = function(route, resources, renders){
	staticRouter(route, resources, renders, __dirname+'/static/', '/botblocks/');
	require('magnode/scan.turtle').scanDirectorySync(__dirname+'/theme/format.ttl', renders);
}
