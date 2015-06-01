
(function (window) {
	var xMin = 0;
	var yMin = 0;
	var xMax = 4000;
	var yMax = 3000;
	
	var hostiles = [];
	var me = [];
	var BDescList = [];
	
	var canvas;
	var canvasCtx;
	
	
	// Interaction variables
	var dragIndex;
	var dragging;
	var mouseX;
	var mouseY;
	var dragHoldX;
	var dragHoldY;
	
	
	function init() {
		// create the hostiles and myself
		createPlayers();
		initCanvas();		
	};
	
	function createPlayers() {
		//the viruses
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 100, false, '#00FF00') );
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 100, false, '#00FF00') );
		
		//the threats
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 300, true, '#FF0000') );
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 325, true, '#FF0000') );
		
		//myself
		me.push( new Organism(Math.random() * xMax, Math.random() * yMax, 150, false, '#0000FF') );
	};
	
	function drawPlayers() {
		
		canvasCtx.fillStyle = "#cccccc";
		canvasCtx.fillRect(0,0,canvas.width,canvas.height);
		
		for (var i = 0; i < hostiles.length; i++) {
			canvasCtx.fillStyle = hostiles[i].color;
			canvasCtx.beginPath();
			canvasCtx.arc(hostiles[i].x, hostiles[i].y, hostiles[i].r, 0, 2*Math.PI, false);
			canvasCtx.closePath();
			canvasCtx.fill();
		}
		
		for (var i = 0; i < me.length; i++) {
			canvasCtx.fillStyle = me[i].color;
			canvasCtx.beginPath();
			canvasCtx.arc(me[i].x, me[i].y, me[i].r, 0, 2*Math.PI, false);
			canvasCtx.closePath();
			canvasCtx.fill();
		}
		
		drawLines();
	};
	
	function drawLines() {
		BDescList = [];
		
		for(var i = 0; i < hostiles.length; i++){
			if(hostiles[i].isThreat){
				
				// get the safe distance, that is how far until my center
				// intersects the hostile's circumference
				var safe_d = dist(me[0].x, me[0].y, hostiles[i].x, hostiles[i].y) - hostiles[i].r;
				
				// get the unit vector from my center to the hostile center
				var u = unitVec(hostiles[i].x - me[0].x, hostiles[i].y - me[0].y);
				
				// P is the point where moving towards each other my center
				// intersects the hostile's center. d is the distance to P
				var d = safe_d * (me[0].v) / (me[0].v + hostiles[i].v);
				
				var P = [ me[0].x + d * u[0], me[0].y + d * u[1] ];
				
				// cos and sin for rotation
				var sin = Math.sqrt( me[0].v*me[0].v - hostiles[i].v*hostiles[i].v ) / me[0].v;
				var cos = hostiles[i].v / me[0].v;
				
				//unit vectors representing the "danger lines" for this threat
				var u1 = [u[0]*cos - u[1]*sin, u[0]*sin + u[1]*cos];
				var u2 = [u[0]*cos + u[1]*sin, u[1]*cos - u[0]*sin];
				
				var BDesc = new BoundDesc(1, [u1, u2], [P]);
				BDescList.push(BDesc);
				
				
				// draw the lines
				canvasCtx.beginPath();
				canvasCtx.moveTo(P[0], P[1]);
				canvasCtx.lineTo(P[0] + u1[0] * 4000, P[1] + u1[1] * 4000);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#ff0000';
				canvasCtx.stroke();
				
				
				canvasCtx.beginPath();
				canvasCtx.moveTo(P[0], P[1]);
				canvasCtx.lineTo(P[0] + u2[0] * 4000, P[1] + u2[1] * 4000);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#ff0000';
				canvasCtx.stroke();
			}else{
				var d = dist(me[0].x, me[0].y, hostiles[i].x, hostiles[i].y);
				var r = Math.max(me[0].r, hostiles[i].r);
				
				// get the unit vector from my center to the hostile center
				var u = unitVec(hostiles[i].x - me[0].x, hostiles[i].y - me[0].y);
				
				
				// cos and sin for rotation
				var sin = r / d;
				var cos = Math.sqrt(d*d - r*r) / d;
				
				//unit vectors representing the "danger lines" for this hostile
				var u1 = [u[0]*cos - u[1]*sin, u[0]*sin + u[1]*cos];
				var u2 = [u[0]*cos + u[1]*sin, u[1]*cos - u[0]*sin];
				
				var safe_d = (d - r) / cos;
				
				// two points represent perpendicular line at safe_d
				var P1 = [safe_d * u1[0] + me[0].x, safe_d * u1[1] + me[0].y];
				var P2 = [safe_d * u2[0] + me[0].x, safe_d * u2[1] + me[0].y];
				
				var BDesc = new BoundDesc(2, [u1, u2], [P1, P2]);
				BDescList.push(BDesc);
				// draw the lines
				canvasCtx.beginPath();
				canvasCtx.moveTo(P1[0], P1[1]);
				canvasCtx.lineTo(P1[0] + u1[0] * 4000, P1[1] + u1[1] * 4000);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#00ff00';
				canvasCtx.stroke();
				
				
				canvasCtx.beginPath();
				canvasCtx.moveTo(P2[0], P2[1]);
				canvasCtx.lineTo(P2[0] + u2[0] * 4000, P2[1] + u2[1] * 4000);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#00ff00';
				canvasCtx.stroke();
				
				
				canvasCtx.beginPath();
				canvasCtx.moveTo(P1[0], P1[1]);
				canvasCtx.lineTo(P2[0], P2[1]);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#00ff00';
				canvasCtx.stroke();
				
			}
		}
		
		// Add the Box Boundaries
		BDescList.push(new BoundDesc(1, [[1, 0]], [[0, 0]]));
		BDescList.push(new BoundDesc(1, [[0, 1]], [[xMax, 0]]));
		BDescList.push(new BoundDesc(1, [[-1, 0]], [[xMax, yMax]]));
		BDescList.push(new BoundDesc(1, [[0, -1]], [[0, yMax]]));
		
		createBDescGraph();
	};
	
	function createBDescGraph()
	{
		for (var i = 0; i < BDescList.length; i++){
			
			
			for (var j = i+1; j < BDescList.length; j++){
				
				var BDesc1 = BDescList[i];
				var BDesc2 = BDescList[j];

				for(var k = 0; k < BDesc1.u.length; k++){
					for(var l = 0; l < BDesc2.u.length; l++){
					   var p = BDesc1.p[ (BDesc1.type == 1) ? 0 : k];	
					   var q = BDesc2.p[ (BDesc2.type == 1) ? 0 : l];	
					   var u = BDesc1.u[k];
					   var v = BDesc2.u[l];
					   
					   var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
					   
					   if (typeof soln !== 'undefined'){
						   if(soln[0] >= 0 && soln[1] >= 0){
							   var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
							   
							   canvasCtx.fillStyle = '#000000';
							   canvasCtx.beginPath();
							   canvasCtx.arc(m[0], m[1], 25, 0, 2*Math.PI, false);
							   canvasCtx.closePath();
							   canvasCtx.fill();
								
								
						   }
					   }
					}
				}
				
				// Special Cases
				if(BDesc1.p.length == 2){
					var p = BDesc1.p[1];
					var u = unitVec(BDesc1.p[0][0] - BDesc1.p[1][0], BDesc1.p[0][1] - BDesc1.p[1][1]);
					for(var l = 0; l < BDesc2.u.length; l++){
						 var q = BDesc2.p[ (BDesc2.type == 1) ? 0 : l];	
						 var v = BDesc2.u[l];
						 
						 var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
						 if (typeof soln !== 'undefined'){
							   if(soln[0] >= 0 && soln[1] >= 0){
								   //console.debug("soln");
								   var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
								   if( m[0] <= Math.max(BDesc1.p[0][0], BDesc1.p[1][0]) && m[0] >= Math.min(BDesc1.p[0][0], BDesc1.p[1][0])
								   && m[1] <= Math.max(BDesc1.p[0][1], BDesc1.p[1][1]) && m[1] >= Math.min(BDesc1.p[0][1], BDesc1.p[1][1])){
									   canvasCtx.fillStyle = '#000000';
									   canvasCtx.beginPath();
									   canvasCtx.arc(m[0], m[1], 25, 0, 2*Math.PI, false);
									   canvasCtx.closePath();
									   canvasCtx.fill();
								   }
							   }
						 }
						 
					}
				}
				
				if(BDesc2.p.length == 2){
					var p = BDesc2.p[1];
					var u = unitVec(BDesc2.p[0][0] - BDesc2.p[1][0], BDesc2.p[0][1] - BDesc2.p[1][1]);
					for(var k = 0; k < BDesc1.u.length; k++){
						 var q = BDesc1.p[ (BDesc1.type == 1) ? 0 : k];	
						 var v = BDesc1.u[k];
						 
						 var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
						 if (typeof soln !== 'undefined'){
							   if(soln[0] >= 0 && soln[1] >= 0){
								   var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
								   if( m[0] <= Math.max(BDesc2.p[0][0], BDesc2.p[1][0]) && m[0] >= Math.min(BDesc2.p[0][0], BDesc2.p[1][0])
								   && m[1] <= Math.max(BDesc2.p[0][1], BDesc2.p[1][1]) && m[1] >= Math.min(BDesc2.p[0][1], BDesc2.p[1][1])){
									   canvasCtx.fillStyle = '#000000';
									   canvasCtx.beginPath();
									   canvasCtx.arc(m[0], m[1], 25, 0, 2*Math.PI, false);
									   canvasCtx.closePath();
									   canvasCtx.fill();
								   }
							   }
						 }
						 
					}
				}
				
				if(BDesc1.p.length == 2 && BDesc2.p.length == 2){
					var p = BDesc1.p[1];
					var u = unitVec(BDesc1.p[0][0] - BDesc1.p[1][0], BDesc1.p[0][1] - BDesc1.p[1][1]);
					var q = BDesc2.p[1];
					var v = unitVec(BDesc2.p[0][0] - BDesc2.p[1][0], BDesc2.p[0][1] - BDesc2.p[1][1]);
					var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
					
					 if (typeof soln !== 'undefined'){
						   if(soln[0] >= 0 && soln[1] >= 0){
							   var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
							   if( m[0] <= Math.max(BDesc1.p[0][0], BDesc1.p[1][0]) && m[0] >= Math.min(BDesc1.p[0][0], BDesc1.p[1][0])
									   && m[1] <= Math.max(BDesc1.p[0][1], BDesc1.p[1][1]) && m[1] >= Math.min(BDesc1.p[0][1], BDesc1.p[1][1])
									   && m[0] <= Math.max(BDesc2.p[0][0], BDesc2.p[1][0]) && m[0] >= Math.min(BDesc2.p[0][0], BDesc2.p[1][0])
									   && m[1] <= Math.max(BDesc2.p[0][1], BDesc2.p[1][1]) && m[1] >= Math.min(BDesc2.p[0][1], BDesc2.p[1][1])){
								   canvasCtx.fillStyle = '#000000';
								   canvasCtx.beginPath();
								   canvasCtx.arc(m[0], m[1], 25, 0, 2*Math.PI, false);
								   canvasCtx.closePath();
								   canvasCtx.fill();
							   }
						   }
					 }
				}
				
			}
		}
	}
	
	//Solves System Of Linear equations
	// | a1 b1 | |x| = |c1|
	// | a2 b2 | |y| = |c2|
	function solve2d(a1, b1, c1, a2, b2, c2){
		var det = a1*b2 - a2*b1;
		if(det != 0) {
			var det_x = c1*b2 - c2*b1;
			var det_y = a1*c2 - a2*c1;
			
			return [det_x / det, det_y / det];
		}
	}
	
	function dist(x1, y1, x2, y2){
		return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
	};
	
	function unitVec(x, y){
		var mag = Math.sqrt(x*x + y*y);
		return [x / mag, y / mag];
		
	};
	
	function initCanvas() {
		canvas = document.getElementById("canvas");
		canvasCtx = canvas.getContext("2d");
		
		canvas.width 	= xMax;
		canvas.height 	= yMax;
		
		resizeCanvas();
		
		drawPlayers();
		
		canvas.addEventListener("mousedown", canvasMouseDown, false);
		
	};
	
	function resizeCanvas() {
		canvas.style.width  = Math.min(window.innerWidth, window.innerHeight);
		canvas.style.height = (yMax / xMax) *   Math.min(window.innerWidth, window.innerHeight);
	};
	
	function canvasMouseDown(event) {
		var bRect = canvas.getBoundingClientRect();
		mouseX = (event.clientX - bRect.left)*(canvas.width/bRect.width);
		mouseY = (event.clientY - bRect.top)*(canvas.height/bRect.height);
		
		
		dragging = false;
		dragIndex = -1;
		
		for(var i = 0; i < me.length; i++){
			if( me[i].isInside(mouseX, mouseY) ){
				dragging = true;
				dragIndex = i;
				
				dragHoldX = mouseX - me[i].x;
				dragHoldY = mouseY - me[i].y;
			}
		}
		
		if(dragging) {
			window.addEventListener("mousemove", windowMouseMove, false);
		}
		
		canvas.removeEventListener("mousedown", canvasMouseDown, false);
		window.addEventListener("mouseup", windowMouseUp, false);
		
		//code below prevents the mouse down from having an effect on the main browser window:
		if (event.preventDefault) {
			event.preventDefault();
		} //standard
		else if (event.returnValue) {
			event.returnValue = false;
		} //older IE
		return false;
	};
	
	
	function windowMouseUp(event) {
		canvas.addEventListener("mousedown", canvasMouseDown, false);
		window.removeEventListener("mouseup", windowMouseUp, false);
		if (dragging) {
			dragging = false;
			window.removeEventListener("mousemove", windowMouseMove, false);
		}
	};
	
	
	function windowMouseMove(event) {
		var posX;
		var posY;
		var r = me[dragIndex].r;
		var minX = r;
		var maxX = canvas.width - r;
		var minY = r;
		var maxY = canvas.height - r;
		//getting mouse position correctly 
		var bRect = canvas.getBoundingClientRect();
		mouseX = (event.clientX - bRect.left)*(canvas.width/bRect.width);
		mouseY = (event.clientY - bRect.top)*(canvas.height/bRect.height);
		
		//clamp x and y positions to prevent object from dragging outside of canvas
		posX = mouseX - dragHoldX;
		posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
		posY = mouseY - dragHoldY;
		posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
		
		me[dragIndex].x = posX;
		me[dragIndex].y = posY;
		
		drawPlayers();
	};
	
	/*****************************************************************
	 * Organism Class
	 *****************************************************************/
	function Organism (x, y, r, isThreat, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.isThreat = isThreat;
		this.color = color;
		this.v = 10000/(r*r);
		
		this.isInside = function(x, y){
			var dx = x - this.x;
			var dy = y - this.y;
			
			return (dx*dx + dy*dy < this.r*this.r);
		};
	};	
	
	/*****************************************************************
	 * Boundary Description Class
	 *  - Used for storing points and unit vectors of hostiles
	 *    threats and other boundaries
	 *****************************************************************/
	function BoundDesc(type, u, p)
	{
		// type tells us whether this is 
		// 1. A single point with a multiple unit vectors
		// 2. multiple points with corresponding unit vectors
		this.type = type;
		
		this.u = u; // unit vectors
		this.p = p; // points
	}
	
	
	window.onload = init;
	window.onresize = resizeCanvas;
	
})(window);

