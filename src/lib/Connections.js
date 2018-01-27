import Sage from "./sage/Sage.js";
import EMan from "./EditorManager.js";

/* #################################################
Control Moving
################################################# */
let mDragConn = null;

function MoveConn_Start(e,itm){
	e.stopPropagation(); e.preventDefault();

	mDragConn = itm;

	window.addEventListener("mousemove",MoveConn_Move);
	window.addEventListener("click",MoveConn_End);
}

function MoveConn_Move(e){
	e.stopPropagation(); e.preventDefault();
	mDragConn.setPosEnd(e.pageX, e.pageY);
}

function MoveConn_End(e){
	e.stopPropagation(); e.preventDefault();

	//If its an input connector, begin connection.
	if(e.target.iconn !== undefined){
		mDragConn.connect(e.target.iconn).updatePosition();
	//else delete connection.
	}else{
		mDragConn.dispose();
	}

	//Clear out references
	mDragConn		= null;

	//Remove global drag handlers.
	window.removeEventListener("mousemove",MoveConn_Move);
	window.removeEventListener("click",MoveConn_End);
}


/* #################################################
Connection
################################################# */
class Connection{
	constructor(oConn){
		this.id = Sage.uuid();

		this.elm = EMan.svg.createPath("#000000"); //SVG Element
		this.curveScale = 1.5;	//How much the line curves

		this.OConn = oConn;		//Reference to Output Connector
		this.IConn = null;		//Reference to Input Connector
	}

	//................................................
	//Handle Connections
	connect(iconn){
		//TODO Make sure Input/Output Types are the same.
		iconn.connect(this);	//Ask Input for Connection
		this.IConn = iconn;		//Input Connector Reference
		return this;
	}

	releaseInput(){ if(this.IConn != null){ this.IConn.disconnect(); this.IConn = null; } }

	dispose(){
		EMan.svg.remove(this.elm);
		if(this.IConn != null){ this.IConn.disconnect(); this.IConn = null; }
		if(this.OConn != null){ this.OConn.disconnect(this.id); this.OConn = null; }
	}

	//................................................
	//Setters / Getters
	setPosEnd(x,y){
		var pos = this.OConn.getConnPos();
		EMan.svg.setQCurveScaledXPos( this.elm, pos[0], pos[1], x, y, this.curveScale );
		return this;
	}

	setPos(x1,y1,x2,y2){
		EMan.svg.setQCurveScaledXPos( this.elm, x1, y1, x2, y2, this.curveScale );
		return this;
	}

	get outputNode(){ return this.OConn.node; }
	get inputNode(){ return this.IConn.node; }
	get iConnector(){ return this.IConn; }
	get oConnector(){ return this.OConn; }

	//................................................
	//Misc
	updatePosition(){
		if(this.IConn == null || this.OConn == null){ console.log("Can not update connection position because i/o missing"); return; }

		var i = this.IConn.getConnPos(),
			o = this.OConn.getConnPos();

		this.setPos(o[0],o[1],i[0],i[1]);
	}
}


/* #################################################
Connectors
################################################# */
class Connector{
	constructor(name,node,uiRoot,data = null){
		this.name = name;
		this.node = node;
		this.data = null;
		this.isConnected = false;

		this.ui 		= { container: Sage.newElm("div",null,null,uiRoot) };
		this.ui.icon	= Sage.newElm("i","0",null,this.ui.container);
		this.ui.label	= Sage.newElm("span",name,null,this.ui.container);
	}

	set(txt){ this.ui.label.innerHTML = txt; return this; }

	getConnPos(){
		var rect = this.ui.icon.getBoundingClientRect();
		return [ rect.left + rect.width*0.5 , rect.top + rect.height*0.5 ];
	}
}

class IConnector extends Connector{
	constructor(name,node,uiRoot,data=null){
		super(name,node,uiRoot,data);

		//.............................
		this.conn = null;			//Hold reference to a single connection.
		this.ui.icon.iconn = this;	//Mark Icon has an Input Connection with Reference Var

		//.............................
		//Setup Events
		Sage.elmEvt(this.ui.icon,"click",(e)=>{
			if(this.conn == null || mDragConn != null) return;
			MoveConn_Start(e,this.conn);
			this.conn.releaseInput();
		});
	}

	connect(conn){
		if(this.conn != null) this.conn.dispose(); //If conn exists, delete it.
		this.conn = conn;
		this.isConnected = true;
	}

	disconnect(){ this.conn = null; this.isConnected = false; }
	update(){ if(this.conn != null) this.conn.updatePosition(); }

	getOutputName(){
		if(this.conn == null) return null;
		return this.conn.oConnector.name;
	}
	getOutputNode(){
		if(this.conn == null) return null;
		return this.conn.outputNode;
	}
}

class OConnector extends Connector{
	constructor(name,node,uiRoot,data=null){
		super(name,node,uiRoot,data);

		//.............................
		this.connList = {};	//List of Connections
		this.ui.container.insertBefore(this.ui.label,this.ui.icon); //Swop Positions

		//.............................
		//Setup Events
		Sage.elmEvt(this.ui.icon,"click",(e)=>{
			if(mDragConn != null) return;

			var conn = new Connection(this);

			this.connList[conn.id] = conn;
			MoveConn_Start(e,conn);
		});
	}
	
	connectToInput(iConn){
		var conn = new Connection(this);	//Create Connection
		this.connList[conn.id] = conn;		//Save to List
		conn.connect(iConn);				//Connect to Input Connector
		conn.updatePosition();				//
		return this;
	}

	disconnect(id){ if(this.connList[id] !== undefined) delete this.connList[id]; }
	update(){ for(var itm in this.connList) this.connList[itm].updatePosition(); }
}


/* #################################################
################################################# */
export { Connection, IConnector, OConnector } ;