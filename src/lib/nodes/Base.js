import NodeBox	from "../NodeBox.js";
import EMan		from "../EditorManager.js";

class BaseNode extends NodeBox{
	constructor(id, x, y, w=150, h=null){
		super(w,h);

		this.id 			= id;	//ID Number for Node
		this.varName_Orig	= null;	//Orignal typed in Variable Name
		this.varName_Local	= null;	//Modified variable name that is GLSL Safe

		this.setPosition(x,y);
		this.setHeader("VarNode",true); //TODO, Need a better way to do this, Every Sub Class will run this when its not needed

		//this._allowVarNaming(); //TODO Remove, Each Sub Node should enable if it needs it
	}

	//---------------------------------------------------
	_allowVarNaming(){ this.ui.header.addEventListener( "dblclick", (e)=>{ this._startVarNaming(); }); }
	_startVarNaming(){
		var tBox = document.createElement("input");
		tBox.type = "text";
		tBox.value = this.ui.header.innerText;
		
		tBox.evt_keypress	= (e)=>{ if(e.keyCode == 13) this._endVarNaming(e,tBox); };
		tBox.evt_blur		= (e)=>{ this._endVarNaming(e,tBox); };

		tBox.addEventListener("keypress", tBox.evt_keypress); //Add Events on how to end editing
		tBox.addEventListener("blur", tBox.evt_blur);
		
		this.ui.header.innerHTML = "";
		this.ui.header.appendChild(tBox);
		tBox.focus();
	}

	_endVarNaming(e,tb){
		//Cleanup
		e.stopPropagation(); e.preventDefault();
		tb.removeEventListener("keypress", tb.evt_keypress);
		tb.removeEventListener("blur", tb.evt_blur);

		//Save Var name
		this.setVar( (tb.value != "")? tb.value.trim() : "" );
	}


	//---------------------------------------------------
	setVar(txt){
		if(txt == "" || txt == this.ui.header.title){
			this.ui.header.innerHTML = this.ui.header.title;
			this.varName_Local = this.varName_Orig = null;
			return this;
		}

		this.varName_Orig  = txt;
		this.varName_Local = (txt != "")? "n" + this.id + "_" + txt.replace(" ","_") : null;
		this.ui.header.innerHTML = this.varName_Orig;
		return this;
	}

	getConnectedNodes(){
		var n,ary = [];

		for(var i in this.inputs){
			if(!this.inputs[i].isConnected) continue;	//If not connected, Skip
			n = this.inputs[i].getOutputNode();			//Get Node Reference
			if(ary.indexOf(n) < 0) ary.push(n);			//If not on list, add to list
		}

		return ary;
	}

	getOutputResult(oName){ return "NOT_IMPLEMENTED"; }
	getGLSL(){ return "NOT_IMPLEMENTED"; }
}


class PreviewNode extends BaseNode{
	constructor(id, x, y, w=100, h=null){
		super(id,x,y,w,h);
		this.setHeader("PreviewNode",true);

		this.ui.preview = document.createElement("canvas");
		this.ui.content.appendChild(this.ui.preview);
		this.ui.preview.style=`width:${w}px; height:${w}px;`;
		this.ui.preview.addEventListener("dblclick", (e)=>{ this.runPreview(); } );

		this.canvas = this.ui.preview.getContext("2d");
	}

	//copyCanvas(can){ this.canvas.drawImage(can,0,0); }
	runPreview(node = null, pCode = null){
		var nodes	= (node != null)? node : this.getConnectedNodes(), //Get All Input Connect Nodes
			code	= EMan.processNodes(nodes, pCode); 	//Generate GSLS

		EMan.preview.run(code); //Compile and run Shader
		this.canvas.drawImage(EMan.preview.gl.canvas, 0, 0); //Copy Results to Preview Canvas
	}
}


function validation_forceFloat(e){
	var txt = this.value.trim();
	if(txt != "" && txt.indexOf(".") < 0) this.value = txt + ".0";
}

function uiSingleFloat(ph=null,val=null,step="0.01"){
	var ui = { container: document.createElement("div") };

	ui.input = document.createElement("input");
	ui.container.appendChild(ui.input);

	ui.input.type	= "number";
	ui.input.step	= step;
	if(ph != null) ui.input.placeholder = ph;

	if(val != null) ui.input.value = val;

	ui.input.addEventListener("blur",validation_forceFloat);

	return ui;
}

var Util = {
	validation_forceFloat:validation_forceFloat,
	uiSingleFloat:uiSingleFloat
}


export { BaseNode, PreviewNode, Util };