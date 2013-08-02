var XMLHttpRequest;
if(!XMLHttpRequest && window.ActiveXObject){ // IE 8 and older
    XMLHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
}

var populateFormsLoaded;
function populateForms(){
	if(populateFormsLoaded) return;
	populateFormsLoaded = true;

	$(document).foundation();

	var onSaveEvents = [];

	var es = document.getElementsByClassName('field-json');
	for(var i=0; i<es.length; i++){
		if(es[i].tagName.toLowerCase()!=='textarea') continue;
		try{
			var editor = CodeMirror.fromTextArea(es[i], {lineNumbers:true, indentWithTabs:true, tabSize: 4, indentUnit:4, mode:'application/json'});
		}catch(e){}
	}

	var es = document.getElementsByClassName('field-html');
	for(var i=0; i<es.length; i++){
		if(es[i].tagName.toLowerCase()!=='textarea') continue;
		try {
			var editor = CodeMirror.fromTextArea(es[i], {lineNumbers:true, lineWrapping:true, indentWithTabs:true, tabSize: 4, indentUnit:4, mode:'text/html'});
		}catch(e){}
	}

	var es = document.getElementsByClassName('field-code');
	for(var i=0; i<es.length; i++){
		try {
			es[i].className.split(/\s+/g).some(function(v){
				var p = 'type:';
				if(v.substr(0,p.length)==p){
					CodeMirror.fromTextArea(es[i], {lineNumbers:true, lineWrapping:true, indentWithTabs:true, tabSize: 4, indentUnit:4, mode:v.substr(p.length)});
					return true;
				}
			});
		}catch(e){}
	}

	var es = document.getElementsByClassName('field-array-new');
	for(var i=0; i<es.length; i++) (function(field){
		try {
			var eLength = field.nextElementSibling;
			// FIXME this should be '.length' if we know there's always going to be a name of the root instance
			if(!eLength || eLength.name.substr(-6)!='length') return;
			var fieldName = eLength.name.substr(0, eLength.name.length-7)+'.new';
			var blank = field.lastElementChild.cloneNode(true);
			field.removeChild(field.lastElementChild);
			var additem_li = document.createElement('li');
			var additem_a = document.createElement('a');
			additem_a.href="javascript:;";
			additem_a.appendChild(document.createTextNode('Add new'));
			additem_li.appendChild(additem_a);
			additem_a.onclick = function(){
				var e = field.nextElementSibling;
				var clone = blank.cloneNode(true);
				function updateNames(ele){
					if(typeof ele.name=='string' && ele.name.substr(0,fieldName.length)==fieldName){
						ele.name = ele.name.substr(0,fieldName.length-4)+'.'+eLength.value+ele.name.substr(fieldName.length);
					}else if(ele.hasChildNodes && ele.hasChildNodes()){
						for(var i=0; i<ele.childNodes.length; i++) updateNames(ele.childNodes[i]);
					}
				}
				updateNames(clone);
				field.insertBefore(clone, additem_li);
				eLength.value = parseInt(eLength.value)+1;
			};
			field.appendChild(additem_li);
		}catch(e){throw e;}
	})(es[i]);

	var es = document.getElementsByClassName('field-object-new');
	for(var i=0; i<es.length; i++) (function(field){
		try {
			var eLength = field.nextElementSibling;
			if(!eLength || eLength.name.substr(-6)!='length') return;
			var fieldName = eLength.name.substr(0, eLength.name.length-7)+'.new';
			var blankDt = field.lastElementChild.previousElementSibling.cloneNode(true);
			var blankDd = field.lastElementChild.cloneNode(true);
			field.removeChild(field.lastElementChild.previousElementSibling);
			field.removeChild(field.lastElementChild);
			var additem_dt = document.createElement('dt');
			var additem_a = document.createElement('a');
			additem_a.href="javascript:;";
			additem_a.appendChild(document.createTextNode('Add new'));
			additem_dt.appendChild(additem_a);
			var additem_dd = document.createElement('dd');
			additem_dd.appendChild(document.createTextNode(''));
			additem_a.onclick = function(){
				var cloneDt = blankDt.cloneNode(true);
				var cloneDd = blankDd.cloneNode(true);
				function updateNames(ele){
					if(typeof ele.name=='string' && ele.name.substring(0,fieldName.length)==fieldName){
						ele.name = ele.name.substr(0,fieldName.length-4)+'.'+eLength.value+ele.name.substr(fieldName.length);
					}else if(ele.hasChildNodes && ele.hasChildNodes()){
						for(var i=0; i<ele.childNodes.length; i++) updateNames(ele.childNodes[i]);
					}
				}
				updateNames(cloneDt);
				updateNames(cloneDd);
				field.insertBefore(cloneDt, additem_dt);
				field.insertBefore(cloneDd, additem_dt);
				eLength.value = parseInt(eLength.value)+1;
			};
			field.appendChild(additem_dt);
			field.appendChild(additem_dd);
		}catch(e){throw e;}
	})(es[i]);

	var es = document.getElementsByClassName('form-script-editor');
	for(var i=0; i<es.length; i++) (function(form){
		try {
			var eSubject = form.elements['value.subject'];
			if(!eSubject || !eSubject.value) throw new Error('No subject in form-script-editor');
			var subject = eSubject.value;

			var eAuth = form.elements['_auth'];
			if(!eAuth || !eAuth.value) throw new Error('No _auth in form-script-editor');
			var authToken = eAuth.value;

			var textarea = form.getElementsByClassName('field-ecmascript')[0];
			var editor = CodeMirror.fromTextArea(textarea, {lineNumbers:true, indentWithTabs:true, tabSize: 4, indentUnit:4, mode:'application/ecmascript'});
			//new AulxUI.CM(editor); // https://github.com/espadrine/aulx

			var out = form.getElementsByClassName('output')[0];
			var onSave = function onSave(){
				editor.save();
				out.textContent = textarea.value;
				var request = new XMLHttpRequest;
				request.open('PUT', form.action);
				request.onreadystatechange = update;
				request.setRequestHeader('Content-Type', 'application/json;profile=http://botblocks.net/Script/ecmascript');
				request.setRequestHeader('Authorization', 'Bearer '+authToken);
				request.send(textarea.value);
				function update(){
					out.textContent = request.readystate + ' ' + request.status + ' ' + request.statusText+'\n\n'+request.responseText;
				}
			}
			onSaveEvents.push(onSave);
		}catch(e){throw e;}
	})(es[i]);

	var es = document.getElementById('btn-save');
	if(es){
		es.onclick = function(){
			onSaveEvents.forEach(function(v){ v(); });
		};
	}
};
document.addEventListener("DOMContentLoaded", populateForms, false);
window.addEventListener( "load", populateForms, false );

//console.log('Layout.js');
//console.log(document);
//window.onload = populateForms;
