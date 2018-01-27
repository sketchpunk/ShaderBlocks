import Sage from "./sage/Sage.js";
import EMan from "./EditorManager.js";
import { Connection, IConnector, OConnector } from "./Connections.js";

/* #################################################

################################################# */
function buildBox(){
	var ui = { container: Sage.newElm("div",null,"NodeBox",document.body) }

	ui.header		= Sage.newElm("header","New",null,ui.container);
	ui.leftOptions	= Sage.newElm("nav",null,null,ui.container);
	ui.rightOptions	= Sage.newElm("nav",null,null,ui.container);
	ui.mainOptions	= Sage.newElm("main",null,null,ui.container);

	return ui;
}


/* #################################################

################################################# */
class NodeBox{
	constructor(w=200, h=null){
		this.ui = buildBox();
		this.setSize(w,h);

		//------------------------------
		this.inputs		= {};
		this.inputLen	= 0; //TODO, not sure if I need Lengths
		this.outputs	= {};
		this.outputLen	= 0;

		//this.OptList = [];

		//------------------------------
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

	get clsName(){ return this.constructor.name; }

	onNodeDragging(state,x,y,ox,oy){
		switch(state){
			case Sage.DRAG_MOVE: 
				this.setPosition(ox,oy);
				this.update();
			break;

			case Sage.DRAG_END:
				this.ui.container.style.zIndex = 400;
			break;
		}
	}


	//................................................
	update(){
		for(var i in this.inputs) this.inputs[i].update();
		
		for(var i in this.outputs) this.outputs[i].update();
	}


	//................................................
	connectTo(oName,iName,node){
		var oConn = this.getOutput(oName),
			iConn = node.getInput(iName);
		if(oConn == null || iConn == null) return false;

		oConn.connectToInput(iConn);
		return true;
	}


	//................................................
	getInput(name){ return (this.inputs[name] !== undefined)? this.inputs[name] : null; }
	getOutput(name){ return (this.outputs[name] !== undefined)? this.outputs[name] : null; }

	addInput(name,data=null){
		var conn = new IConnector(name,this,this.ui.leftOptions,data);
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


	//................................................
	setHeader(txt){ this.ui.header.innerHTML = txt; return this; }
	setSize(w=null,h=null){
		if(w != null) this.ui.container.style.width		= w + "px";
		if(h != null) this.ui.container.style.height	= h + "px";
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

export default NodeBox;