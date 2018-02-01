import Sage from "./sage/Sage.js";
import EMan from "./EditorManager.js";
import { Connection, IConnector, OConnector } from "./Connections.js";

//------------------------------------------------------

//------------------------------------------------------
function buildBox(){
	var ui = { container: Sage.newElm("div",null,"NodeBox",document.body) }

	ui.bg			= Sage.newElm("div",null,null,ui.container);
	ui.header		= Sage.newElm("header","New",null,ui.container);
	ui.leftOptions	= Sage.newElm("nav",null,null,ui.container);
	ui.rightOptions	= Sage.newElm("nav",null,null,ui.container);
	ui.content		= Sage.newElm("main",null,null,ui.container);

	return ui;
}


//------------------------------------------------------
/*
	Notes:
		May need some events
			onInputConnection(state,iName) //Connected / Disconnected
			onMove() // Update connection paths
*/
//------------------------------------------------------
class NodeBox{
	constructor(w=null, h=null){
		this.ui = buildBox();
		if(w != null || h != null) this.setSize(w,h);

		//..............................
		this.inputs		= {};
		this.inputLen	= 0; //TODO, not sure if I need Lengths
		this.outputs	= {};
		this.outputLen	= 0;

		this.options = {};
		this.optionLen = 0;

		//..............................
		//Setup Events
		var bindOnNodeDragging = this.onNodeDragging.bind(this);
		Sage.elmEvt(this.ui.header,"mousedown",(e)=>{
			this.ui.container.style.zIndex  = 500;

			var rect = this.ui.container.getBoundingClientRect();
			Sage.startDrag(e, this.ui.container,
				e.pageX - rect.left,
				e.pageY - rect.top,
				bindOnNodeDragging );
		});
	}

	//................................................
	// Misc
	get clsName(){ return this.constructor.name; }


	//................................................
	// Events
	onNodeDragging(state,x,y,ox,oy){
		switch(state){
			case Sage.DRAG_MOVE: 
				this.setPosition(ox,oy).update();
			break;

			case Sage.DRAG_END:
				this.ui.container.style.zIndex = 400;
			break;
		}
	}


	//................................................
	// Methods
	update(){
		for(var i in this.inputs) this.inputs[i].update();		//Update all inputs
		
		for(var i in this.outputs) this.outputs[i].update();	//Update all Outputs
	}


	//................................................
	// Input / Output
	getInput(name){ return (this.inputs[name] !== undefined)? this.inputs[name] : null; }
	getOutput(name){ return (this.outputs[name] !== undefined)? this.outputs[name] : null; }

	addInput(name,cls = null,data=null){
		var conn = new IConnector(name,this,this.ui.leftOptions,data);
		if(cls != null) conn.setClass(cls);

		this.inputs[name] = conn;
		this.inputLen++;
		return this;
	}

	addOutput(name,data=null){
		var conn = new OConnector(name,this,this.ui.rightOptions,data);
		this.outputs[name] = conn;
		this.outputLen++;
		return this;
	}

	connectTo(oName,iName,node){
		var oConn = this.getOutput(oName),
			iConn = node.getInput(iName);
		if(oConn == null || iConn == null) return false;

		oConn.connectToInput(iConn);
		return true;
	}


	//................................................
	// Options
	addOption(name,opt){
		this.options[name] = opt;
		this.optionLen++;

		this.ui.content.appendChild(opt.container);
		return this;
	}


	//................................................
	// Getters / Setters
	setHeader(txt, alsoToolTip = false){ 
		this.ui.header.innerHTML = txt;
		if(alsoToolTip) this.ui.header.title = txt;
		return this;
	}

	setSize(w=null,h=null){
		if(w != null){
			this.ui.content.style.width	= w + "px";
			this.ui.header.style.width	= w + "px";
		}

		if(h != null) this.ui.content.style.height	= h + "px";
		return this;
	}
	
	setPosition(x,y){
		this.ui.container.style.left = x + "px";
		this.ui.container.style.top = y + "px";
		return this;
	}
	
	getPosition(){
		var rect = this.ui.root.getBoundingClientRect();
		return {x:rect.left,y:rect.top};
	}
}

//------------------------------------------------------
export default NodeBox;