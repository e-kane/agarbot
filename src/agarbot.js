// ==UserScript==
// @name        AgarBot
// @namespace   ekane
// @description Plays Agar
// @include     http://agar.io/
// @version     1
// @grant       none
// @author      ekane
// ==/UserScript==

/******************************************************************************
 * GLOBAL VARIABLE DECLARTIONS START
 ******************************************************************************/
var toggleBot 	= false; 		// toggle bot on/off (R key)
var toggleDraw 	= false; 		// toggle drawing bot heuristics on/off (T key)

var dPoints 	= []; 			// list of points to be drawn
var lines		= []; 			// list of lines to be drawn


var splitted = false;
var    splitting = false;
var   virusBait = false;
var   tempPoint = [0, 0, 1];
/******************************************************************************
 * GLOBAL VARIABLE DECLARTIONS END
 ******************************************************************************/

//TODO: Make it only go to a virus if it's big enough. If it shrinks, it shouldn't only grab a single dot and go back in.
function getAllNiceViruses(userObjList, allObjList) {
    var dotList = [];
    if (userObjList.length == 1) {
        dotList = getListmasedOnFunction(function (element){
            if (allObjList[element].isVirus && (allObjList[element].size *1.10 <= userObjList[0].size) && allObjList[element].size * 1.15 >= userObjList[0].size) {
                    return true;
            }
            return false;
        }, allObjList);
    }

    
    return dotList;
}

function getAllThreats(userObjList, allObjList) {
    var dotList = [];
    
    dotList = getListmasedOnFunction(function (element){
        var isMe = false;
        
        for (var i = 0; i < userObjList.length; i++) {
            if (allObjList[element].id == userObjList[i].id) {
                isMe = true;
                break;
            }
        }
        
        for (var i = 0; i < userObjList.length; i++) {
            if (!isMe && (!allObjList[element].isVirus && (allObjList[element].size >= userObjList[i].oSize * 1.15))) {
                return true;
            } else if (allObjList[element].isVirus && (allObjList[element].size * 1.15 <= userObjList[i].oSize)) {
                return true;
            }
            return false;
        }
    }, allObjList);
    
    return dotList;
}

function getAllFood(userObjList, allObjList) {
    
    var elementList = [];
    var dotList = [];
    
    elementList = getListmasedOnFunction(function (element){
        var isMe = false;
        
        for (var i = 0; i < userObjList.length; i++) {
            if (allObjList[element].id == userObjList[i].id) {
                isMe = true;
                break;
            }
        }
        
        for (var i = 0; i < userObjList.length; i++) {
            if (!isMe && !allObjList[element].isVirus && (allObjList[element].size * 1.25 <= userObjList[i].size)  || (allObjList[element].size <= 11)){return true;} else{return false;}
        }
    }, allObjList);
    
    for (var i = 0; i < elementList.length; i++) {
        dotList.push([elementList[i].x, elementList[i].y, elementList[i].size]);
    }
    
    return dotList;
}

function clusterFood(foodList, blobSize) {
   
    var clusters = [];
    var addedCluster = false;
    for (var i = 0; i < foodList.length; i++) {
        for (var j = 0; j < clusters.length; j++) {
            if (computeDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < blobSize * 1.5) {
                clusters[j][0] = (foodList[i][0] + clusters[j][0]) / 2;
                clusters[j][1] = (foodList[i][1] + clusters[j][1]) / 2;
                clusters[j][2] += foodList[i][2];
                addedCluster = true;
                break;
            }
        }
        if (!addedCluster) {
            clusters.push([foodList[i][0], foodList[i][1], foodList[i][2]]);
        }
        addedCluster = false;
    }
    return clusters;
}

function agarbot_move(userMoveX, userMoveY, userObjList, allObjList) {
    
    
    
    dPoints = [];
    lines = [];
    
    var tempMoveX = userMoveX;
    var tempMoveY = userMoveY;
    
    if (userObjList[0] != null) {
        var allPossibleFood = getAllFood(userObjList, allObjList); // #1
        
        var allPossibleThreats = getAllThreats(userObjList, allObjList);
        
        var allPossibleNiceViruses = getAllNiceViruses(userObjList, allObjList);
  
        var closestNiceViruse = null;
        if (allPossibleNiceViruses.length != 0) {
            closestNiceViruse = [allPossibleNiceViruses[0], computeDistance(allPossibleNiceViruses[0].x, allPossibleNiceViruses[0].y, userObjList[0].x, userObjList[0].y)];
        
            for (var i = 1; i < allPossibleNiceViruses.length; i++) {
                var testD = computeDistance(allPossibleNiceViruses[i].x, allPossibleNiceViruses[i].y, userObjList[0].x, userObjList[0].y)
                if (testD < closestNiceViruse[1]) {
                    closestNiceViruse = [allPossibleNiceViruses[i], testD];
                }
            }
            
            
        }

        
        var allThreatLines = [];
        var allThreatLinesmool = [];
        var allFallbackPointsLeft = [];
        var allFallbackPointsRight = [];
        var allFallbackmool = [];
        var allFallbackCount = [];
        
        var closestThreatIndex = null;
        var closestThreatD = null;
        var closestThreatIndex2 = null;
        var closestThreatD2 = null;
        
        var isSafeSpot = true;
        
        var clusterAllFood = clusterFood(allPossibleFood, userObjList[0].oSize);
        
        

    
        for (var i = 0; i < allPossibleThreats.length; i++) {
            var tempD = computerDistanceFromCircleEdge(userObjList[0].x, userObjList[0].y, allPossibleThreats[i].x, allPossibleThreats[i].y, allPossibleThreats[i].size);
            
            if (closestThreatIndex != null) {
                if (closestThreatD > tempD) {
                    closestThreatIndex2 = closestThreatIndex;
                    closestThreatD2 = closestThreatD;
                    closestThreatIndex = i;
                    closestThreatD = tempD;
                }
            } else {
                closestThreatIndex = i;
                closestThreatD = tempD;
            }
            
            var ratioX =  tempD / (allPossibleThreats[i].x - userObjList[0].x);
            var ratioY =  tempD / (allPossibleThreats[i].y - userObjList[0].y);
            
            var offsetX = 0;
            var offsetY = 0;
            
            var offsetEscapeX = 0;
            var offsetEscapeY = 0;
            
            var offsetLeftX = 0;
            var offsetLeftY = 0;

            var offsetRightX = 0;
            var offsetRightY = 0;
            
            var offsetEscapeLeftX = 0;
            var offsetEscapeLeftY = 0;

            var offsetEscapeRightX = 0;
            var offsetEscapeRightY = 0;
            
            var escape = 5;
            var escapeMid = 3;
            
            iSlope = inverseSlope(allPossibleThreats[i].x, allPossibleThreats[i].y, userObjList[0].x, userObjList[0].y);
            
            var sidePoints = pointsOnLine(iSlope, allPossibleThreats[i].x, allPossibleThreats[i].y);
            
            var SD = computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, sidePoints[0][0], sidePoints[0][1]);

            var ratioLeftX = SD / (allPossibleThreats[i].x - sidePoints[0][0]);
            var ratioLeftY = SD / (allPossibleThreats[i].y - sidePoints[0][1]);
            
            
             
            if (allPossibleThreats[i].size >= userObjList[0].size * 4) {
                offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 1.5);
                offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 1.5);
                
                offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 3);
                offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 3);
                
                offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 3);
                offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 3);
                
                offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                
                offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
                
            } else if (allPossibleThreats[i].size >= userObjList[0].size * 2.1) {
                offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 4);
                offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 4);
                
                offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 4);
                offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 4);
                
                offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 4);
                offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 4);
                
                offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                
                offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
            } else {
                offsetX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * 1);
                offsetY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * 1);
                
                offsetLeftX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioLeftX * 3);
                offsetLeftY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioLeftY * 3);
                
                offsetRightX = allPossibleThreats[i].x + (allPossibleThreats[i].size / ratioLeftX * 3);
                offsetRightY = allPossibleThreats[i].y + (allPossibleThreats[i].size / ratioLeftY * 3);
                
                offsetEscapeX = allPossibleThreats[i].x - (allPossibleThreats[i].size / ratioX * escape);
                offsetEscapeY = allPossibleThreats[i].y - (allPossibleThreats[i].size / ratioY * escape);
                
                offsetEscapeLeftX = offsetEscapeX - (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeLeftY = offsetEscapeY - (allPossibleThreats[i].size / ratioLeftY * escapeMid);

                offsetEscapeRightX = offsetEscapeX + (allPossibleThreats[i].size / ratioLeftX * escapeMid);
                offsetEscapeRightY = offsetEscapeY + (allPossibleThreats[i].size / ratioLeftY * escapeMid);
            }
            
            if (userObjList[0].x < allPossibleThreats[i].x && userObjList[0].y > allPossibleThreats[i].y) {
                var c = offsetRightX;
                offsetRightX = offsetLeftX;
                offsetLeftX = c;

                var d = offsetRightY;
                offsetRightY = offsetLeftY;
                offsetLeftY = d;
                
                var e = offsetEscapeRightX;
                offsetEscapeRightX = offsetEscapeLeftX;
                offsetEscapeLeftX = e;

                var f = offsetEscapeRightY;
                offsetEscapeRightY = offsetEscapeLeftY;
                offsetEscapeLeftY = f;
                //console.log("Swap");
            } else if (userObjList[0].x > allPossibleThreats[i].x && userObjList[0].y > allPossibleThreats[i].y) {
                var c = offsetRightX;
                offsetRightX = offsetLeftX;
                offsetLeftX = c;

                var d = offsetRightY;
                offsetRightY = offsetLeftY;
                offsetLeftY = d;
                
                var e = offsetEscapeRightX;
                offsetEscapeRightX = offsetEscapeLeftX;
                offsetEscapeLeftX = e;

                var f = offsetEscapeRightY;
                offsetEscapeRightY = offsetEscapeLeftY;
                offsetEscapeLeftY = f;
                //console.log("Swap");
            }
       
            
           // drawPoint(offsetX, offsetY, 2);
            
            //drawPoint(offsetLeftX, offsetLeftY, 3);
            //drawPoint(offsetRightX, offsetRightY, 3);
            
            var SSlope = inverseSlope(allPossibleThreats[i].x, allPossibleThreats[i].y, sidePoints[0][0], sidePoints[0][1]);
            
            threatLineLeft = [[offsetLeftX, offsetLeftY], [offsetX, offsetY]];
            threatLineRight = [[offsetRightX, offsetRightY], [offsetX, offsetY]];
            
            threatLine = pointsOnLine(iSlope, offsetX, offsetY);
            
            //drawLine(allPossibleThreats[i].x, allPossibleThreats[i].y, userObjList[0].x, userObjList[0].y, 3);
            
            
            //drawLine(threatLineLeft[0][0], threatLineLeft[0][1], threatLineLeft[1][0], threatLineLeft[1][1], 0);
            //drawLine(threatLineRight[0][0], threatLineRight[0][1], threatLineRight[1][0], threatLineRight[1][1], 0);
            
            allThreatLines.push([threatLineLeft, threatLineRight]);
            
            //drawPoint(offsetEscapeLeftX, offsetEscapeLeftY, 4);
           // drawPoint(offsetEscapeRightX, offsetEscapeRightY, 4);

            allFallbackPointsLeft.push([offsetEscapeLeftX, offsetEscapeLeftY]);
            allFallbackPointsRight.push([offsetEscapeRightX, offsetEscapeRightY]);
            
            allFallbackmool.push(true);
            
            allFallbackCount.push(0);
            
            var badSide = isSideLine(threatLine[0], threatLine[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
            
            var badSideLeft = isSideLine(threatLineLeft[0], threatLineLeft[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
            var badSideRight = isSideLine(threatLineRight[0], threatLineRight[1], [allPossibleThreats[i].x, allPossibleThreats[i].y]);
            
            allThreatLinesmool.push([badSideLeft, badSideRight]);
            
            isSafeSpot = (
                    badSideLeft != isSideLine(threatLineLeft[0], threatLineLeft[1], [userObjList[0].x, userObjList[0].y]) &&
                    badSideRight != isSideLine(threatLineRight[0], threatLineRight[1], [userObjList[0].x, userObjList[0].y]) && isSafeSpot
            );
            
            var removeClusterList = [];
            
            for (var j = 0; j < clusterAllFood.length; j++) {
                if (
                    badSideLeft == isSideLine(threatLineLeft[0], threatLineLeft[1], [clusterAllFood[j][0], clusterAllFood[j][1]]) &&
                    badSideRight == isSideLine(threatLineRight[0], threatLineRight[1], [clusterAllFood[j][0], clusterAllFood[j][1]])
                ) {
                    removeClusterList.push(j);
                }
            }
            for (var j = removeClusterList.length - 1; j >= 0; j--) {
                if (!toggleBot) {
                    //drawPoint(clusterAllFood[j][0], clusterAllFood[j][1], 0);
                }
                clusterAllFood.splice(removeClusterList[j], 1);
            }
            
            if (
                badSideLeft == isSideLine(threatLineLeft[0], threatLineLeft[1], [tempPoint[0], tempPoint[1]]) &&
                badSideRight == isSideLine(threatLineRight[0], threatLineRight[1], [tempPoint[0], tempPoint[1]])
            ) {
                tempPoint[2] = 0;
            } 
            
        }
        
        

        for (var i = 0; i < clusterAllFood.length; i++) {
            clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], userObjList[0].ox, userObjList[0].oy);
            if (!toggleBot) {
                //drawPoint(clusterAllFood[i][0], clusterAllFood[i][1], 1);
            }
        }
        
        if (clusterAllFood.length != 0 && isSafeSpot) {
            
            

            biggestCluster = clusterAllFood[0];
            for (var i = 1; i < clusterAllFood.length; i++) {
                if (clusterAllFood[i][2] > biggestCluster[2]) {
                    biggestCluster = clusterAllFood[i];
                }
            }
            
            //
            //  #1 Get a list of all the food.
            //  #2 Get a list of all the threats.
            //  #3 Remove all the food near threats.
            //  #4 Find closest food after the filter.
             
            
            if (closestNiceViruse != null && closestNiceViruse[0].size * 1.15 <= userObjList[0].size) {
                for (var i = 0; i < userObjList.length; i++) {
                    //drawLine(userObjList[i].ox, userObjList[i].oy, closestNiceViruse[0].x, closestNiceViruse[0].y, 5);
                }
                
                virusmait = true;
 
                tempMoveX = closestNiceViruse[0].x;
                tempMoveY = closestNiceViruse[0].y;
            } else {
                for (var i = 0; i < userObjList.length; i++) {
                    //drawLine(userObjList[i].ox, userObjList[i].oy, biggestCluster[0], biggestCluster[1], 1);
                }
                
                virusmait = false;
 
                tempMoveX = biggestCluster[0];
                tempMoveY = biggestCluster[1];
                //console.log("Moving");
            }
         
            //console.log("X: " + P + " Y: " + Q);
            
            if (!toggleBot) {
              if (userObjList.length > 1 && splitted) {
                  splitted = false;
                  tempMoveX = biggestCluster[0];
                  tempMoveY = biggestCluster[1];
              }
              if (splitting) {
                  tempMoveX = biggestCluster[0];
                  tempMoveY = biggestCluster[1];
                 // A(17); //!!! FIX THIS!!!
                  splitting = false;
                  splitted = true;
              }
              
              if (biggestCluster[2] * 2.5 < userObjList[0].size && biggestCluster[2] > userObjList[0].size / 5 &&  biggestCluster[2] > 11 && !splitted && !splitting) {
                  //drawLine(userObjList[0].x, userObjList[0].y, biggestCluster[0], biggestCluster[1], 4);
                  
                  var worthyTargetDistance = computeDistance(userObjList[0].x, userObjList[0].y, biggestCluster[0], biggestCluster[1]);
                  
                  console.log("I want to split.");
                  
                  if ((worthyTargetDistance < userObjList[0].size * 3) && userObjList.length == 1) {
                      tempMoveX = biggestCluster[0];
                      tempMoveY = biggestCluster[1];
                      splitting = true;
                  }
              }
            }
            
        } else if (!virusmait) {            
            tempMoveX = allFallbackPointsLeft[closestThreatIndex][0];
            tempMoveY = allFallbackPointsLeft[closestThreatIndex][1];
            
            if (tempMoveX < S || tempMoveX > U) {
                tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
            } else if (tempMoveX < T || tempMoveX > V) {
                tempMoveX = allFallbackPointsRight[closestThreatIndex][0];
                tempMoveY = allFallbackPointsRight[closestThreatIndex][1];
            }
            
            //drawLine(userObjList[0].x, userObjList[0].y, tempMoveX, tempMoveY, 6);
            console.debug("virusmait");
        }
        console.debug("voov");

   
        //drawPoint(tempPoint[0], tempPoint[1], tempPoint[2]);
        tempPoint[2] = 1;
    }
    
    return (!toggleBot) ? [userMoveX, userMoveY] : [tempMoveX, tempMoveY]; 
}