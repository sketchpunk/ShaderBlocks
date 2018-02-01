import Sage from "./sage/Sage.js";
import EMan from "./EditorManager.js";

//------------------------------------------------------
// Control Moving
//------------------------------------------------------
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
	mDragConn = null;

	//Remove global drag handlers.
	window.removeEventListener("mousemove",MoveConn_Move);
	window.removeEventListener("click",MoveConn_End);
}

//Set the position of the curve with the control points at an even position on the x pos
function IO_Curve_Line(elm,x1,y1,x2,y2,scale){
	var d = Math.abs(x1-x2) / scale,	//Delta X times scale factor 9
	str = "M" + x1	+ "," + y1 + " C" +	//MoveTo
		(x1 + d)	+ "," + y1 + " " +	//First Control Point
		(x2 - d)	+ "," + y2 + " " +	//Second Control Point
		x2			+ "," + y2;			//End Point
	elm.setAttribute('d', str);
}

//Create a line when IOs are pointing away from each other which creates two arcs
function IO_DoubleArc_Line(elm,x1,y1,x2,y2){
	var dy	= (y2-y1),						// Y Distance
		c	= Math.abs(Math.floor(dy / 3)),	// Third of distance works well to create half circle curve
		my	= (dy * 0.5) + y1;				// Mid Y point to draw straight line

	var str = "M" + x1	+ "," + y1 + " C" +	//MoveTo
		(x1 + c)	+ "," + y1 + " " +		//First Control Point
		(x1 + c)	+ "," + my + " " +		//Second Control Point
		x1			+ "," + my + " C" +		//End Point --- Create First Arc

		x1			+ "," + my + " " + 		//Create straight line in middle
		x2			+ "," + my + " " + 
		x2			+ "," + my + " C" +

		(x2 - c)	+ "," + my + " " +		//Create Final arc
		(x2 - c)	+ "," + y2 + " " +
		x2			+ "," + y2 + " ";

	elm.setAttribute('d', str);
}


//------------------------------------------------------
// Connection
//------------------------------------------------------
class Connection{
	constructor(oConn){
		this.id = Sage.uuid();

		this.elm = EMan.svg.createPath("#000000"); //SVG Element
		this.elm.classList.add("Conn_Dash");

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
		var o = this.getConnPos(this.OConn);
		this.setPos( o[0], o[1], x, y );
		return this;
	}

	setPos(x1,y1,x2,y2){
		if(x1-x2 > 0)	IO_DoubleArc_Line( this.elm, x1, y1, x2, y2 );
		else			IO_Curve_Line( this.elm, x1, y1, x2, y2, this.curveScale );
		return this;
	}

	get outputNode(){	return this.OConn.node; }
	get inputNode(){	return this.IConn.node; }
	get iConnector(){	return this.IConn; }
	get oConnector(){	return this.OConn; }

	//................................................
	//Misc
	updatePosition(){
		if(this.IConn == null || this.OConn == null){ console.log("Can not update connection position because i/o missing"); return; }

		var o = this.getConnPos(this.OConn),
			i = this.getConnPos(this.IConn);

		this.setPos(o[0],o[1],i[0],i[1]);
	}

	getConnPos(c){
		var r = c.getConnRect(), x = 0;
		
		if(c instanceof OConnector) x = r.width; //Offset for Output

		return [ r.left + x, r.top + r.height*0.5 ];
	}

	getOutputResult(){ return this.OConn.node.getOutputResult(this.OConn.name); }
}


//------------------------------------------------------
// Connectors
//------------------------------------------------------
class Connector{
	constructor(name,node,uiRoot,data = null){
		this.name = name;
		this.node = node;
		this.data = null;
		this.isConnected = false;

		this.ui 		= { container: Sage.newElm("div",null,null,uiRoot) };
		//this.ui.icon	= Sage.newElm("i","0",null,this.ui.container);
		this.ui.label	= Sage.newElm("span",name,null,this.ui.container);
	}

	set(txt){ this.ui.label.innerHTML = txt; return this; }
	setClass(cls){ this.ui.container.classList = cls; return this; }

	getConnRect(){ return this.ui.container.getBoundingClientRect(); }
	/*
	getConnPos(){
		var rect = this.ui.container.getBoundingClientRect();
		return [ rect.left + rect.width*0.5 , rect.top + rect.height*0.5 ];

		//var rect = this.ui.icon.getBoundingClientRect();
		//return [ rect.left + rect.width*0.5 , rect.top + rect.height*0.5 ];
	}
	*/
}

class IConnector extends Connector{
	constructor(name,node,uiRoot,data=null){
		super(name,node,uiRoot,data);

		//.............................
		this.conn = null;			//Hold reference to a single connection.
		//this.ui.icon.iconn = this;	//Mark Icon has an Input Connection with Reference Var
		this.ui.container.iconn = this;	//Mark Icon has an Input Connection with Reference Var

		//.............................
		//Setup Events
		Sage.elmEvt(this.ui.container,"click",(e)=>{ //this.ui.icon
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

	/* TODO : Prob get rid off.
	getOutputName(){
		if(this.conn == null) return null;
		return this.conn.oConnector.name;
	}*/
	getOutputNode(){
		if(this.conn == null) return null;
		return this.conn.outputNode;
	}
	

	getOutputResult(){
		return (!this.conn)? null : this.conn.getOutputResult();
		//if(!this.conn) return null;

		//return this.conn.outputNode.getOutputResult(this.conn.OConn.name);
	}
}

class OConnector extends Connector{
	constructor(name,node,uiRoot,data=null){
		super(name,node,uiRoot,data);

		//.............................
		this.connList = {};	//List of Connections
		//this.ui.container.insertBefore(this.ui.label,this.ui.icon); //Swop Positions

		//.............................
		//Setup Events
		Sage.elmEvt(this.ui.container,"click",(e)=>{ //this.ui.icon
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


//------------------------------------------------------
//------------------------------------------------------
export { Connection, IConnector, OConnector } ;