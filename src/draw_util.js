function drawPoint(x_1, y_1, drawColor) {
    if (!toggleDraw) {
        var x1 = ((x_1 - I) * k) + l/2;
        var y1 = ((y_1 - J) * k) + r/2;
        dPoints.push([x1, y1, drawColor]);
    }
}

function drawLine(x_1, y_1, x_2, y_2, drawColor) {
    if (!toggleDraw) {
        var x1 = ((x_1 - I) * k) + l/2;
        var y1 = ((y_1 - J) * k) + r/2;
        var x2 = ((x_2 - I) * k) + l/2;
        var y2 = ((y_2 - J) * k) + r/2;
        lines.push([x1, y1, x2, y2, drawColor]);
    }
}

    
/*************************************************
 *  Draws Bot Markers on The Canvas
 *************************************************/
function drawMarkers(dPoints, lines, context) {
    for (var i = 0; i < dPoints.length; i++) {
        var radius = 10;
        
        context.beginPath();
        d.arc(dPoints[i][0], dPoints[i][1], radius, 0, 2 * Math.PI, false);

        if (dPoints[i][2] == 0) {
        	context.fillStyle = "black";
        } else if (dPoints[i][2] == 1) {
        	context.fillStyle = "yellow";
        } else if (dPoints[i][2] == 2) {
        	context.fillStyle = "blue";
        } else if (dPoints[i][2] == 3) {
        	context.fillStyle = "red";
        } else if (dPoints[i][2] == 4) {
        	context.fillStyle = "#008080";
        } else {
        	context.fillStyle = "#000000";
        }
          
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#003300';
        context.stroke();
    }
    context.lineWidth = 1;
    
    for(var i = 0; i < lines.length; i++) {
    	context.beginPath();
        
    	context.lineWidth = 5;
        
        if (lines[i][4] == 0) {
        	context.strokeStyle = "#FF0000";
        } else if (lines[i][4] == 1) {
        	context.strokeStyle = "#00FF00";
        } else if (lines[i][4] == 2) {
        	context.strokeStyle = "#0000FF";
        } else if (lines[i][4] == 3) {
        	context.strokeStyle = "#FF8000";
        } else if (lines[i][4] == 4) {
        	context.strokeStyle = "#8A2BE2";
        } else if (lines[i][4] == 5) {
        	context.strokeStyle = "#FF69B4";
        } else if (lines[i][4] == 6) {
        	context.strokeStyle = "#008080";
        } else {
        	context.strokeStyle = "#000000";
        }
        
        context.moveTo(lines[i][0], lines[i][1]);
        context.lineTo(lines[i][2], lines[i][3]);
        
        context.stroke();
    }
    context.lineWidth = 1;
}