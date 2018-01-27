//=================================================================
// MISC
//=================================================================
function uuid(){
    var dt = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function") dt += performance.now(); //use high-precision timer if available
    
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


//=================================================================
// UI
//=================================================================
function newElm(elmName,txt = null,cls = null, root = null){
	var elm = document.createElement(elmName);
	if(root != null) root.appendChild(elm);
	if(txt != null) elm.innerHTML = txt;
	if(cls != null) elm.className = cls;
	return elm;
}

function newInput(sType,sName,eValue,root){
	var elm = document.createElement("input");
	elm.type = sType;
	if(sName != null) elm.name = sName;
	if(eValue !== undefined && eValue != null) elm.value = eValue;
	if(root !== undefined && root != null) root.appendChild(elm);
	return elm;
}

function newImg(src,cls,root){
	var elm = document.createElement("img");
	if(src != null) elm.src = src;
	if(cls != null) elm.className = cls;
	if(root !== undefined && root != null) root.appendChild(elm);
	return elm;
}

function elmEvt(elm,evt,func,doAdd = true){
	if(typeof elm == "string") elm = document.getElementById(elm);

	if(doAdd)	elm.addEventListener(evt,func);
	else		elm.removeEventListener(evt,func);

	return elm;
}	

function evtHandled(e){ e.stopPropagation(); e.preventDefault(); }

//=================================================================
// DRAGGING
//=================================================================
var mDragItem		= null,
	mDragOffset		= { x:0, y:0 },
	mDragHandler	= null;

const DRAG_MOVE = 1;
const DRAG_END = 0;


function Dragging_Start(e, itm, offsetX, offsetY, onDrag = null){
	e.stopPropagation(); e.preventDefault();

	//Calc Offset for dragging
	mDragOffset.x	= offsetX;
	mDragOffset.y	= offsetY;

	//Set Drag References
	mDragHandler	= onDrag;
	mDragItem		= itm;

	//Turn on Global Events to handle dragging.
	window.addEventListener("mousemove",Dragging_Move);
	window.addEventListener("mouseup",Dragging_End);
}


function Dragging_Move(e){
	e.stopPropagation(); e.preventDefault();

	//Call handler if one is set
	if(mDragHandler != null)
		mDragHandler(DRAG_MOVE, 
			e.pageX, e.pageY,
			(e.pageX - mDragOffset.x),
			(e.pageY - mDragOffset.y)
		);
}


function Dragging_End(e){
	e.stopPropagation(); e.preventDefault();
	
	//Call handler if one is set
	if(mDragHandler != null) mDragHandler(DRAG_END, e.pageX,e.pageY);

	//Clear out references
	mDragItem		= null;
	mDragHandler	= null;

	//Remove globald drag handlers.
	window.removeEventListener("mousemove",Dragging_Move);
	window.removeEventListener("mouseup",Dragging_End);
}


export default {
	uuid:uuid,

	newElm:newElm, newInput:newInput, newImg:newImg, elmEvt:elmEvt, 
	evtHandled:evtHandled,

	startDrag:Dragging_Start,

	DRAG_MOVE:DRAG_MOVE,
	DRAG_END:DRAG_END
};