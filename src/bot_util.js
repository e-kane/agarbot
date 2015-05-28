// ==UserScript==
// @name        AgarBot
// @namespace   ekane
// @description Plays Agar
// @include     http://agar.io/
// @version     1
// @grant       none
// @author      ekane
// @require		agarbot.js
// ==/UserScript==

function computeDistance(x1, y1, x2, y2) {
	var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
	var ydis = y1 - y2;
	var distance = Math.sqrt(Math.pow(xdis, 2)  + Math.pow(ydis, 2));
	
	return distance;
}


function computerDistanceFromCircleEdge(x1, y1, x2, y2, s2) {
    var tempD = computeDistance(x2, y2, x1, y1);
    
    var offsetX = 0;
    var offsetY = 0;
    
    var ratioX =  tempD / (x2 - x1);
    var ratioY =  tempD / (y2 - y1);

    offsetX = x2 - (s2 / ratioX);
    offsetY = y2 - (s2 / ratioY);
    
    return computeDistance(x1, y1, offsetX, offsetY);
}


//Given two points on a line, finds the slope of a perpendicular line crossing it.
function inverseSlope(x1, y1, x2, y2) {
    var m = (y1 - y2) / (x1 - x2);
    return (-1) / m;
}

//Given a slope and an offset, returns two points on that line.
function pointsOnLine(slope, useX, useY) {  
    var b = useY - slope * useX;
    
    return [[useX - 100, slope * (useX - 100) + b], [useX + 100, slope * (useX + 100) + b]];
}


//Using a line formed from point a to b, tells if point c is on S side of that line.
function isSideLine(a, b, c) {
    if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
        return true;
    }
    return false;
}

function getListmasedOnFunction(booleanFunction, listToUse) {
    var dotList = [];
    Object.keys(listToUse).forEach(function (element, index) {
        if (booleanFunction(element)){
            dotList.push(v[element]);
        }
    });
    
    return dotList;
}