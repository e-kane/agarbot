
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
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 200, false, '#00FF00') );
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 100, false, '#00FF00') );
		//hostiles.push( new Organism( 606.2237637734981, 846.2146437367413, 100, false, '#00FF00') );
		//the threats
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 300, true, '#FF0000') );
		hostiles.push( new Organism( Math.random() * xMax, Math.random() * yMax, 325, true, '#FF0000') );
		//hostiles.push( new Organism( 845.976487904224, 2515.2852857429234, 325, true, '#FF0000') );

		//myself
		me.push( new Organism(xMax/2, yMax / 2, 150, false, '#0000FF') );
		//me.push( new Organism(Math.random() * xMax, Math.random() * yMax, 150, false, '#0000FF') );
		//me.push( new Organism( 2923.8709677419356,1546.4516129032259, 150, false, '#0000FF') );
		//me.push( new Organism(1693.282716822586, 2207.4145613531473, 150, false, '#0000FF') );
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
		var basePHash = new Object();
		var pHash = new Object();

		// The Intersection Graph
		var G = new Graph(pointHash);
		// var Node Master List
		var nodeMasterList = [];
		var nodeSlaveList = {};


		var refPoint = [me[0].x, me[0].y];

		//init the nodeMaster List
		for (var i = 0; i < BDescList.length; i++){
			var BDesc1 = BDescList[i];

			//store all the base points
			for(var k = 0; k < BDesc1.u.length; k++){
				var p = BDesc1.p[ (BDesc1.type == 1) ? 0 : k];

				var d = dist(p[0],p[1], refPoint[0], refPoint[1]);
				var thetaP = atan(p[0]-refPoint[0], p[1] - refPoint[1]);

				var nodeId = G.addNode(p, new nodeInfo(d, thetaP));


				nodeMasterList.push(nodeId);
				nodeSlaveList[nodeId] = {};
			}

			for(var k = 0; k < BDesc1.p.length; k++){
				var p = BDesc1.p[k];
				var pId = G.nodeHash(p);
				for(var l = 1; l < BDesc1.p.length; l++){
					var q = BDesc1.p[l];
					var qId = G.nodeHash(q);
					var d = dist(p[0],p[1],q[0],q[1]);
					var u = unitVec(q[0]-p[0], q[1] - p[1]);
					var uId = pointHash(u);
					var vId = pointHash([-u[0],-u[1]]);

					if(!isDefined(nodeSlaveList[pId][uId])){
						nodeSlaveList[pId][uId] = {};
					}
					//nodeSlaveList[pId][uId][d] = q;

					//if(!isDefined(nodeSlaveList[qId][vId])){
					//   nodeSlaveList[qId][vId] = {};
					//}
					// nodeSlaveList[qId][vId][d] = p;

					thetaP = G.nodeInfo(pId).theta;
					thetaQ = G.nodeInfo(qId).theta;
					
					G.addEdge(pId,qId,new edgeInfo(d, thetaQ - thetaP));
					G.addEdge(qId,pId,new edgeInfo(d, thetaP - thetaQ));
				}
			}
		}

		//Get all the Intersections and add the Vertices to Graph
		for (var i = 0; i < BDescList.length; i++){
			var BDesc1 = BDescList[i];

			for (var j = i+1; j < BDescList.length; j++){

				var BDesc2 = BDescList[j];

				for(var k = 0; k < BDesc1.u.length; k++){
					for(var l = 0; l < BDesc2.u.length; l++){
						var p = BDesc1.p[ (BDesc1.type == 1) ? 0 : k];	
						var q = BDesc2.p[ (BDesc2.type == 1) ? 0 : l];	
						var u = BDesc1.u[k];
						var v = BDesc2.u[l];

						var pId = G.nodeHash(p);
						var qId = G.nodeHash(q);

						var uId = pointHash(u);
						var vId = pointHash(v);

						var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);

						if (isDefined(soln)){
							var s = soln[0];
							var t = soln[1];

							if(s >= 0 && t >= 0){


								var m = [p[0] + s * u[0], p[1] + s * u[1]];

								if( m[0] >= xMin-0.5 && m[0] <= xMax+0.5 && m[1] >= yMin-0.5 && m[1] <= yMax+0.5 ){
									// add this point

									var d = dist(m[0],m[1], refPoint[0], refPoint[1]);
									var thetaM = atan(m[0]-refPoint[0], m[1] - refPoint[1]);

									var mId = G.addNode(m, new nodeInfo(d, thetaM));
						
									thetaP = G.nodeInfo(pId).theta;
									thetaQ = G.nodeInfo(qId).theta;
									
									if(pId != mId){
										G.addEdge(pId,mId,new edgeInfo(s, thetaM - thetaP));
										G.addEdge(mId,pId,new edgeInfo(s, thetaP - thetaM));
									}
									if(qId != mId){
										G.addEdge(qId,mId,new edgeInfo(t, thetaM - thetaQ));
										G.addEdge(mId,qId,new edgeInfo(t, thetaQ - thetaM));
									}



									if(!isDefined(nodeSlaveList[pId][uId])){
										nodeSlaveList[pId][uId] = {};
									}
									nodeSlaveList[pId][uId][s] = mId;

									if(!isDefined(nodeSlaveList[qId][vId])){
										nodeSlaveList[qId][vId] = {};
									}
									nodeSlaveList[qId][vId][t] = mId;

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

				// Special Cases
				if(BDesc1.p.length == 2){
					var p = BDesc1.p[1];
					var u = unitVec(BDesc1.p[0][0] - BDesc1.p[1][0], BDesc1.p[0][1] - BDesc1.p[1][1]);

					var uId = pointHash(u);
					var vId = pointHash(v);

					for(var l = 0; l < BDesc2.u.length; l++){
						var q = BDesc2.p[ (BDesc2.type == 1) ? 0 : l];	
						var v = BDesc2.u[l];
						var vId = pointHash(v);

						var pId = G.nodeHash(p);
						var qId = G.nodeHash(q);



						var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
						if (typeof soln !== 'undefined'){

							var s = soln[0];
							var t = soln[1];

							if(s >= 0 && t >= 0){
								var m = [p[0] + s * u[0], p[1] + s * u[1]];
								if( m[0] <= Math.max(BDesc1.p[0][0], BDesc1.p[1][0]) && m[0] >= Math.min(BDesc1.p[0][0], BDesc1.p[1][0])
										&& m[1] <= Math.max(BDesc1.p[0][1], BDesc1.p[1][1]) && m[1] >= Math.min(BDesc1.p[0][1], BDesc1.p[1][1])){

									var d = dist(m[0],m[1], refPoint[0], refPoint[1]);
									var thetaM = atan(m[0]-refPoint[0], m[1] - refPoint[1]);

									var mId = G.addNode(m, new nodeInfo(d, thetaM));

									thetaP = G.nodeInfo(pId).theta;
									thetaQ = G.nodeInfo(qId).theta;									
									
									if(pId != mId){
										G.addEdge(pId,mId,new edgeInfo(s, thetaM - thetaP));
										G.addEdge(mId,pId,new edgeInfo(s, thetaP - thetaM));
									}
									if(qId != mId){
										G.addEdge(qId,mId,new edgeInfo(t, thetaM - thetaQ));
										G.addEdge(mId,qId,new edgeInfo(t, thetaQ - thetaM));
									}
									
									
									if(!isDefined(nodeSlaveList[pId][uId])){
										nodeSlaveList[pId][uId] = {};
									}
									nodeSlaveList[pId][uId][s] = mId;

									if(!isDefined(nodeSlaveList[qId][vId])){
										nodeSlaveList[qId][vId] = {};
									}
									nodeSlaveList[qId][vId][t] = mId;


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

					var uId = pointHash(u);
					var vId = pointHash(v);

					for(var k = 0; k < BDesc1.u.length; k++){
						var q = BDesc1.p[ (BDesc1.type == 1) ? 0 : k];	
						var v = BDesc1.u[k];
						var vId = pointHash(v);

						var pId = G.nodeHash(p);
						var qId = G.nodeHash(q);

						var soln = solve2d(-u[0], v[0], p[0]-q[0], -u[1], v[1], p[1]-q[1]);
						if (typeof soln !== 'undefined'){
							if(soln[0] >= 0 && soln[1] >= 0){
								var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
								if( m[0] <= Math.max(BDesc2.p[0][0], BDesc2.p[1][0]) && m[0] >= Math.min(BDesc2.p[0][0], BDesc2.p[1][0])
										&& m[1] <= Math.max(BDesc2.p[0][1], BDesc2.p[1][1]) && m[1] >= Math.min(BDesc2.p[0][1], BDesc2.p[1][1])){

									var s = soln[0];
									var t = soln[1];

									var d = dist(m[0],m[1], refPoint[0], refPoint[1]);
									var thetaM = atan(m[0]-refPoint[0], m[1] - refPoint[1]);

									var mId = G.addNode(m, new nodeInfo(d, thetaM));
									
									thetaP = G.nodeInfo(pId).theta;
									thetaQ = G.nodeInfo(qId).theta;
									
									if(pId != mId){
										G.addEdge(pId,mId,new edgeInfo(s, thetaM - thetaP));
										G.addEdge(mId,pId,new edgeInfo(s, thetaP - thetaM));
									}
									if(qId != mId){
										G.addEdge(qId,mId,new edgeInfo(t, thetaM - thetaQ));
										G.addEdge(mId,qId,new edgeInfo(t, thetaQ - thetaM));
									}



									if(!isDefined(nodeSlaveList[pId][uId])){
										nodeSlaveList[pId][uId] = {};
									}
									nodeSlaveList[pId][uId][s] = mId;

									if(!isDefined(nodeSlaveList[qId][vId])){
										nodeSlaveList[qId][vId] = {};
									}
									nodeSlaveList[qId][vId][t] = mId;

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

					var pId = G.nodeHash(p);
					var qId = G.nodeHash(q);

					var uId = pointHash(u);
					var vId = pointHash(v);

					if (typeof soln !== 'undefined'){
						if(soln[0] >= 0 && soln[1] >= 0){
							var m = [p[0] + soln[0] * u[0], p[1] + soln[0] * u[1]];
							if( m[0] <= Math.max(BDesc1.p[0][0], BDesc1.p[1][0]) && m[0] >= Math.min(BDesc1.p[0][0], BDesc1.p[1][0])
									&& m[1] <= Math.max(BDesc1.p[0][1], BDesc1.p[1][1]) && m[1] >= Math.min(BDesc1.p[0][1], BDesc1.p[1][1])
									&& m[0] <= Math.max(BDesc2.p[0][0], BDesc2.p[1][0]) && m[0] >= Math.min(BDesc2.p[0][0], BDesc2.p[1][0])
									&& m[1] <= Math.max(BDesc2.p[0][1], BDesc2.p[1][1]) && m[1] >= Math.min(BDesc2.p[0][1], BDesc2.p[1][1])){

								var s = soln[0];
								var t = soln[1];

								var d = dist(m[0],m[1], refPoint[0], refPoint[1]);
								var theta = atan(m[0]-refPoint[0], m[1] - refPoint[1]);

								var mId = G.addNode(m, new nodeInfo(d, theta));
								

								thetaP = G.nodeInfo(pId).theta;
								thetaQ = G.nodeInfo(qId).theta;
								
								if(pId != mId){
									G.addEdge(pId,mId,new edgeInfo(s, thetaP - theta));
									G.addEdge(mId,pId,new edgeInfo(s, theta - thetaP));
									//G.addEdge(pId, mId, s);
								}
								if(qId != mId){
									G.addEdge(qId,mId,new edgeInfo(t, thetaQ - theta));
									G.addEdge(mId,qId,new edgeInfo(t, theta - thetaQ));
								}

								
								if(!isDefined(nodeSlaveList[pId][uId])){
									nodeSlaveList[pId][uId] = {};
								}
								nodeSlaveList[pId][uId][s] = mId;

								if(!isDefined(nodeSlaveList[qId][vId])){
									nodeSlaveList[qId][vId] = {};
								}
								nodeSlaveList[qId][vId][t] = mId;


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
		var oldG = G;
		//clean up the edges (i.e. have everything adjacent connected)
		for(var i = 0; i < nodeMasterList.length; i++){
			var pId = nodeMasterList[i];
			for( var uId in nodeSlaveList[pId]){
				var keys = [];
				for (var s in nodeSlaveList[pId][uId]){
					keys.push(Number(s));
				}

				keys.sort(function(a, b){
					return a-b;
				});

				for(var j = 0; j < keys.length; j++){
					var mId = nodeSlaveList[pId][uId][keys[j]];
					G.removeEdge(mId,pId);
					G.removeEdge(pId,mId);
				}

				
				
				mIdPrev = pId;
				for(var j = 0; j < keys.length; j++){
					var mId = nodeSlaveList[pId][uId][keys[j]];
					
					
					var thetaId = G.nodeInfo(mId).theta;
					var thetaPrev = G.nodeInfo(mIdPrev).theta;
					var d = (j > 0) ? keys[j] - keys[j-1] : keys[j]
					if(mId == mIdPrev) continue;

					
					G.addEdge(mId,mIdPrev,new edgeInfo(d, thetaPrev - thetaId));
					G.addEdge(mIdPrev,mId,new edgeInfo(d, thetaId  - thetaPrev));
					
					mIdPrev = mId;
				}
			}
		}

		// Draw The Graph
		canvasCtx.font="100px Georgia";
		for(var id1 in G.edges){
			for(var id2 in G.edges[id1]){
				canvasCtx.beginPath();
				canvasCtx.moveTo(G.nodes[id1][0][0], G.nodes[id1][0][1]);
				canvasCtx.lineTo( G.nodes[id2][0][0], G.nodes[id2][0][1]);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#000000';
				canvasCtx.stroke();
			}

			canvasCtx.fillText("("+Math.round(G.nodes[id1][0][0])+","+Math.round(G.nodes[id1][0][1])+")",G.nodes[id1][0][0],G.nodes[id1][0][1]);
		}
		
		
		//Dijkstra's Algorithm
		var prev = {};
		var Q = {};
		var theta = {};
		var expectedTheta = {};
		var area = {};
		
		var smallestWeight = 1000000;
		var startNode = -1;
		for(var pId in G.nodes){
			//prev[pId] = -1;
			Q[pId] = 1;
			theta[pId] = 0;
			area[pId] = Infinity;
			
			if(G.nodeInfo(pId).dist < smallestWeight){
				smallestWeight = G.nodeInfo(pId).dist;
				startNode = pId;
			}
		}
		
		var startTheta = G.nodeInfo(startNode).theta;
		
		for(var pId in G.nodes){
			if(pId == startNode){
				expectedTheta[startNode] = 2*Math.PI;
			}else{
				var thetaPId = G.nodeInfo(pId).theta - startTheta;
				expectedTheta[pId] = (thetaPId >= 0) ? thetaPId : 2*Math.PI + thetaPId;
				//expectedTheta[pId] = thetaPId;
			}
		}

		theta[startNode] = 0;
		
		var u = startNode;
		var startPoint = G.nodePoint(startNode);
		var iter = 0;
		
		while(Object.keys(Q).length != 0){	
			u = undefined;
			if(iter == 0){
				u = startNode;
			}else{	
				var minArea = Infinity;
				for( var v in Q ){
					if(Math.abs(area[v]) <= minArea && (v != startNode || iter > 3) ){
						minArea = Math.abs(area[v]);
						u = v;
					}
				}
				delete Q[u];
			}
			if(!isDefined(u)) break;
			var pointU = G.nodePoint(u);
			console.debug("Favourite: " + u + "at theta: " + theta[u] + " at area " + area[u]);
			for(var v in G.edges[u]){ // for neighbors v of u
				if(!isDefined(Q[v])) continue;
				
				var edgeTheta = G.edgeInfo(u,v).theta;
				//console.debug("Theta: " + edgeTheta + " on edge :" + u + "->" + v);
				var pointV = G.nodePoint(v);
				
				if( inRange(edgeTheta + theta[u], expectedTheta[v] , 0.05) ){
					if(iter == 0){
						area[v] = 0;
						theta[v] = edgeTheta + theta[u];
						prev[v] = u;
					}else if(iter == 1){
						var a =  (pointU[0] + startPoint[0])*(pointU[1] - startPoint[1]) + 
						(pointU[0] + pointV[0])*(pointV[1] - pointU[1]) + 
						(pointV[0] + startPoint[0])*(startPoint[1] - pointV[1]);
						//a = Math.abs(a);
						if(Math.abs(a) < Math.abs(area[v])){
							theta[v] = edgeTheta + theta[u];
							area[v] = a;
							prev[v] = u;
						}
					}else if(iter > 1 ){
						var a = area[u]  - (pointU[0] + startPoint[0])*(startPoint[1] - pointU[1]) +
						(pointU[0] + pointV[0])*(pointV[1] - pointU[1]) + 
						(pointV[0] + startPoint[0])*(startPoint[1] - pointV[1]);
						//a = Math.abs(a);
						if(Math.abs(a) < Math.abs(area[v])){
							theta[v] = edgeTheta + theta[u];
							area[v] = a;
							prev[v] = u;
						}
						
					}
				}
			}
			iter++;
		}
		var point = G.nodePoint(startNode);
		canvasCtx.beginPath();
		canvasCtx.moveTo(point[0], point[1]);

		var node = prev[startNode];
		
		var iter = 0;
		while(prev[node] != startNode && iter < G.numNodes){
			point = G.nodePoint(node);
			
			console.debug("("+Math.round(point[0])+","+Math.round(point[1])+") ");
			canvasCtx.lineTo(point[0],point[1]);
			canvasCtx.lineWidth = 10;
			canvasCtx.strokeStyle = '#FF00FF';
			canvasCtx.stroke();
			
			node = prev[node];
			iter++;
		}
		point = G.nodePoint(startNode);
		console.debug("("+Math.round(point[0])+","+Math.round(point[1])+")");
		canvasCtx.lineTo(point[0],point[1]);
		canvasCtx.lineWidth = 10;
		canvasCtx.strokeStyle = '#FF00FF';
		canvasCtx.stroke();
		canvasCtx.fillStyle = 'rgba(128, 0, 128, 0.5)';
		canvasCtx.closePath();
		canvasCtx.fill();
		
		
		
		//boundIds.push(startNode);
		
		
		/*
		var backTrack = false;
		while(!cycle && !fail){

			smallestWeight = 1000000000;
			lowestVisits = G.numNodes; 
			nextNode = undefined;

			for(var pId in G.edges[currentNode]){

				if(G.nodes[pId][1] < smallestWeight && (!G.getNodeNumVisits(pId)||backTrack) && currentNode != pId && !isDefined(visitedNodes[currentNode][pId])){
					if(pId != startNode || (pId == startNode && bound.length >= 3)){
						smallestWeight = G.nodes[pId][1];
						nextNode = pId;
					}
				}
			}

			if(isDefined(nextNode)){	
				backTrack = false;
				while(resetBoundIds.length){
					G.resetNodeNumVisits(resetBoundIds.pop());
				}

				if(nextNode == startNode){
					if(pointInPolygon([me[0].x,me[0].y], bound)){
						bound.push(G.nodes[nextNode][0]);
						boundIds.push(nextNode);
						cycle = true;
						break;
					}else{
						nextNode = undefined;
					}
				}else{
					bound.push(G.nodes[nextNode][0]);
					boundIds.push(nextNode);
					visitedNodes[currentNode][nextNode]=1;
					currentNode = nextNode;
					G.visitNode(currentNode);

				}
			}

			if(!isDefined(nextNode) && bound.length > 1){
				bound.pop();
				resetBoundIds.push(boundIds.pop());

				currentNode = boundIds[boundIds.length - 1];
				backTrack = true;
			}else if(!isDefined(nextNode)){
				fail = true;
			}
		}

		if(fail){
			console.debug("Graph Traversal Failed to find a cycle.");
		}else{
			console.debug("found cycle of length: " + bound.length);
			canvasCtx.beginPath();
			canvasCtx.moveTo(bound[0][0], bound[0][1]);

			for(var i = 0; i < bound.length; i++){
				console.debug("("+Math.round(bound[i][0])+","+Math.round(bound[i][1])+") w:"+G.nodes[boundIds[i]][1]);
				canvasCtx.lineTo(bound[i][0],bound[i][1]);
				canvasCtx.lineWidth = 10;
				canvasCtx.strokeStyle = '#FF00FF';
				canvasCtx.stroke();

			}
			canvasCtx.fillStyle = 'rgba(128, 0, 128, 0.5)';
			canvasCtx.closePath();
			canvasCtx.fill();
		}


		 */


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


	function atan(x, y){
		var theta = Math.atan2(x,y);
		return ((theta >= 0) ? theta: 2*Math.PI + theta).toFixed(4);
	}
	
	function inRange(a, b, range){
		return (a >= (b*(1-range)) && a <= (b * (1+range)));
	}

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

	function pointHash(p) {
		return "("+Math.round(p[0])+","+Math.round(p[1])+")";
		//return p[1] + p[0]*yMax;
	}

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

	function edgeInfo(dist, theta){
		this.dist = dist;
		this.theta = (theta > Math.PI) ? theta - 2*Math.PI : ( (theta < -Math.PI) ? theta + 2*Math.PI : theta );
	}
	
	function nodeInfo(dist, theta){
		this.dist = dist;
		this.theta = theta;
	}

	function Graph(nodeHash){
		this.nodes = {};
		this.edges = {};
		this.nodeHash = nodeHash;
		this.numNodes = 0;
		this.numEdges = 0;

		this.addNode = function(node, nodeInfo){
			var id = this.nodeHash(node);
			// index 2 is edge count
			// index 3 is number of visits
			if(!isDefined(this.nodes[id])){
				this.nodes[id] = [node, nodeInfo, 0, 0];
				this.edges[id] = {};
			}

			this.numNodes++;
			return id;
		};
		
		this.nodePoint = function (id){
			return this.nodes[id][0];
		};
		
		this.nodeInfo = function (id){
			return this.nodes[id][1];
		};

		this.addEdge = function (id1, id2, edgeInfo){
			this.edges[id1][id2] = edgeInfo;

			//update edge count
			this.nodes[id1][2]++;

			this.numEdges++;
		};
		
		this.edgeInfo = function(id1, id2){
			return this.edges[id1][id2];
		};

		this.removeNode = function (id){
			for(var edgeIter in this.edges){
				if(typeof this.edges[edgeIter][id] != 'undefined' ){
					delete this.edges[edgeIter][id];
					this.nodes[edgeIter][2]--;
					this.numEdges--;
				}
			}
			delete this.edges[id];
			delete this.nodes[id];

			this.numNodes--;
		};

		this.getNodeNumEdges = function(id){
			return this.nodes[id][2];
		};

		this.removeEdge = function(id1, id2){
			if(isDefined(this.edges[id1][id2])){
				delete this.edges[id1][id2];

				//update edge count
				this.nodes[id1][2]--;
				this.numEdges--;
			}
		};

		this.visitNode = function(id){
			this.nodes[id][3]++;
		};

		this.getNodeNumVisits = function(id){
			return this.nodes[id][3];
		};

		this.resetNodeNumVisits = function (id){
			this.nodes[id][3] = 0;
		};

		this.resetNodesNumVisits = function(){
			for(var id in this.nodes){
				this.resetNodeNumVisits(id);
			}
		};


	}

	function isDefined(myVar){
		return (typeof myVar != 'undefined');
	}

	/*****************************************************************
	 * Point in polygon function:
	 * http://alienryderflex.com/polygon/
	 *****************************************************************/
	function pointInPolygon(point, polyCorners){
		var oddNodes = false;

		var j = polyCorners.length - 1;

		var x = point[0];
		var y = point[1];
		for(var i = 0; i < polyCorners.length; i++){
			var polyXi = polyCorners[i][0];
			var polyYi = polyCorners[i][1];

			var polyXj = polyCorners[j][0];
			var polyYj = polyCorners[j][1];

			if( ( polyYi < y && polyYj >= y
					|| polyYj < y && polyYi >= y)
					&& (polyXi <= x || polyXj <=x)) {
				oddNodes ^= (polyXi+(y-polyYi)/(polyYj-polyYi)*(polyXj-polyXi)<x);
			}
			j = i;
		}

		return oddNodes;
	}


	window.onload = init;
	window.onresize = resizeCanvas;

})(window);

