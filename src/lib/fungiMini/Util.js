function rgbArray(){
	if(arguments.length == 0) return null;
	var ary = (Array.isArray(arguments[0]))? arguments[0] : arguments;
	var rtn = [];

	for(var i=0,c,p; i < ary.length; i++){
		if(ary[i].length < 6) continue;
		c = ary[i];				//Just an alias(copy really) of the color text, make code smaller.
		p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

		rtn.push(
			parseInt(c[p]	+c[p+1],16)	/ 255.0,
			parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
			parseInt(c[p+4]	+c[p+5],16)	/ 255.0
		);
	}
	return rtn;
}

function rgbaArray(){
	if(arguments.length == 0) return null;
	var ary = (Array.isArray(arguments[0]))? arguments[0] : arguments;
	var rtn = [];

	for(var i=0,c,p; i < ary.length; i++){
		if(ary[i].length < 8) continue;
		c = ary[i];				//Just an alias(copy really) of the color text, make code smaller.
		p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

		rtn.push(
			parseInt(c[p]	+c[p+1],16)	/ 255.0,
			parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
			parseInt(c[p+4]	+c[p+5],16)	/ 255.0,
			parseInt(c[p+6]	+c[p+7],16)	/ 255.0
		);
	}
	return rtn;
}

export default { rgbArray:rgbArray, rgbaArray:rgbaArray };