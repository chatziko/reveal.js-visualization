(function(){// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


Function.prototype.inheritFrom = function(superConstructor) {
	this.superclass = superConstructor.prototype;		// for calling superclass' constructor/methods
	this.prototype = Object.create(this.superclass);	// create an object with the needed prototype, but without calling superConstructor
	this.prototype.constructor = this;					// for instanceof
}

if(!Function.prototype.bind) { // ECMAScript 5 is supported everywhere by now
	Function.prototype.bind = function() {
		var _function = this;
		
		var args = Array.prototype.slice.call(arguments);
		var scope = args.shift()
		return function() {
			for (var i = 0; i < arguments.length; i++)
			{
				args.push(arguments[i]);
			}
			return _function.apply(scope, args);
		}
	}
}

function EventListener()
{
	this.events = [];
}


EventListener.prototype.removeListener = function(kind, scope, func)
{
	if (this.events[kind] == undefined)
	{
		return;
	}
	var scopeFunctions = null;
	var i;
	for (i = 0; i < this.events[kind].length; i++)
	{
		if (this.events[kind][i].scope == scope)
		{
			scopeFunctions = this.events[kind][i];
			break;
		}	
	}
	if (scopeFunctions == null)
	{
		return;
	}
	for (i = 0; i < scopeFunctions.functions.length; i++)
	{
		if (scopeFunctions.functions[i] == func)
		{
			scopeFunctions.functions.splice(i,1);
			return;
		}
	}
}


EventListener.prototype.addListener = function(kind, scope, func)
{
	if (this.events[kind] === undefined)
	{
		this.events[kind] = [];
	}
	var i;
	var scopeFunctions = null;
	for (i = 0; i < this.events[kind].length; i++)
	{
		if (this.events[kind][i].scope == scope)
		{
			scopeFunctions = this.events[kind][i];
			break;
		}
	}
	if (scopeFunctions === null)
	{
		this.events[kind].push({scope:scope, functions:[] });
		scopeFunctions = this.events[kind][this.events[kind].length - 1];
	}
	for (i = 0; i < scopeFunctions.functions.length; i++)
	{
		if (scopeFunctions.functions[i] == func)
		{
			return;
		}
	}
	scopeFunctions.functions.push(func);
}

EventListener.prototype.fireEvent = function(kind, event)
{
	// TODO:  Should add a deep clone here ...
	if (this.events[kind] !== undefined)
	{
		for (var i = 0; i < this.events[kind].length; i++)
		{
			var objects = this.events[kind][i];
			var functs = objects.functions;
			var scope = objects.scope
			for (var j = 0; j <functs.length; j++)
			{
				var func = functs[j];
				func.call(scope,event);
			}
		}
	}

}



// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function AnimatedBTreeNode(id, widthPerElem, h, numElems,  fillColor, edgeColor)
{
	AnimatedBTreeNode.superclass.constructor.call(this);

	this.objectID = id;
	this.widthPerElement = widthPerElem;
	this.nodeHeight = h;
	this.numLabels = numElems;
	this.backgroundColor = (fillColor == undefined)? "#FFFFFF" : fillColor;
	this.foregroundColor = (edgeColor == undefined)? "#000000" : edgeColor;

	this.labels = new Array(this.numLabels);
	this.labelColors = new Array(this.numLabels);
	for (var i = 0; i < this.numLabels; i++)
	{
		this.labelColors[i] = this.foregroundColor;
	}
}
AnimatedBTreeNode.inheritFrom(AnimatedObject);

AnimatedBTreeNode.MIN_WIDTH = 10;
AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT = 5;


AnimatedBTreeNode.prototype.getNumElements = function()
{
	return this.numLabels;
}

AnimatedBTreeNode.prototype.getWidth = function()
{
	if (this.numLabels > 0)
	{
		return  (this.widthPerElement * this.numLabels);
	}
	else
	{
		return AnimatedBTreeNode.MIN_WIDTH;
	}
}


AnimatedBTreeNode.prototype.setNumElements = function(newNumElements)
{
	var i;
	if (this.numLabels < newNumElements)
	{
		for (i = this.numLabels; i < newNumElements; i++)
		{
			this.labels[i] = "";
			this.labelColors[i] = this.foregroundColor;
		}
		this.numLabels = newNumElements;
	}
	else if (this.numLabels > newNumElements)
	{
		for (i = newNumElements; i < this.numLabels; i++)
		{
			this.labels[i] = null;
		}
		this.numLabels = newNumElements;
	}
}


AnimatedBTreeNode.prototype.left = function()
{
	return this.x  - this.getWidth() / 2.0;
}

AnimatedBTreeNode.prototype.right = function()
{
	return this.x  + this.getWidth() / 2.0;
} 

AnimatedBTreeNode.prototype.top = function()
{
	return this.y - this.nodeHeight / 2.0;
}

AnimatedBTreeNode.prototype.bottom = function()
{
	return this.y + this.nodeHeight / 2.0;
}


AnimatedBTreeNode.prototype.draw = function(context)
{
	var startX;
	var startY;
	
	startX = this.left();
	if (startX == NaN)
	{
		startX  = 0;
	}
	startY = this.top();
	
	if (this.highlighted)
	{
		context.strokeStyle = "#ff0000";
		context.fillStyle = "#ff0000";
		
		context.beginPath();
		context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.getWidth() + this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.getWidth() + this.highlightDiff,startY+this.nodeHeight + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY+this.nodeHeight + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);				
		context.closePath();
		context.stroke();
		context.fill();
	}
	
	context.strokeStyle = this.foregroundColor;
	context.fillStyle = this.backgroundColor;
	
	context.beginPath();
	context.moveTo(startX ,startY);
	context.lineTo(startX + this.getWidth(), startY);
	context.lineTo(startX + this.getWidth(), startY + this.nodeHeight);
	context.lineTo(startX, startY + this.nodeHeight);
	context.lineTo(startX, startY);
	context.closePath();
	context.stroke();
	context.fill();
	
	context.textAlign = 'center';
	context.textBaseline   = 'middle'; 

	
	for (var i = 0; i < this.numLabels; i++)
	{
		var labelx  = this.x - this.widthPerElement * this.numLabels / 2 + this.widthPerElement / 2 + i * this.widthPerElement; 
		var labely = this.y			   

		context.fillStyle = this.labelColors[i];
		context.fillText(this.labels[i], labelx, labely); 
	}	
}



AnimatedBTreeNode.prototype.getHeight = function()
{
	return this.nodeHeight;
}



AnimatedBTreeNode.prototype.setForegroundColor = function(newColor)
{
	this.foregroundColor = newColor;
	for (var i = 0; i < numLabels; i++)
	{
		labelColor[i] = newColor;
	}
}


// TODO:  Kill the magic numbers here
AnimatedBTreeNode.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor)
{
	if (anchor == 0)
	{
		return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
	}
	else if (anchor == this.numLabels)
	{
		return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];	
	}
	else
	{
		return [this.left() + anchor * this.widthPerElement, this.y]
	}
}


AnimatedBTreeNode.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
	if (fromY < this.y - this.nodeHeight / 2)
	{
		return [this.x, this.y - this.nodeHeight / 2];
	}
	else if (this.fromY > this.y + this.nodeHeight /  2)
	{
		return [this.x, this.y + this.nodeHeight / 2];			
	}
	else if (fromX  <  this.x  - this.getWidth() / 2)
	{
		return [this.x - this.getWidth() / 2, this.y];
	}
	else
	{
		return [this.x + this.getWidth() / 2, this.y];
	}
}



AnimatedBTreeNode.prototype.createUndoDelete = function()
{
	return new UndoDeleteBTreeNode(this.objectID, this.numLabels, this.labels, this.x, this.y, this.widthPerElement, this.nodeHeight, this.labelColors, this.backgroundColor, this.foregroundColor, this.layer, this.highlighted);
}


AnimatedBTreeNode.prototype.getTextColor = function(textIndex)
{
	textIndex = (textIndex == undefined) ? 0 : textIndex;
	return this.labelColors[textIndex];
}

AnimatedBTreeNode.prototype.getText = function(index)
{
	index = (index == undefined) ? 0 : index;
	return this.labels[index];
}

AnimatedBTreeNode.prototype.setTextColor = function(color, textIndex)
{
	textIndex = (textIndex == undefined) ? 0 : textIndex;
	this.labelColors[textIndex] = color;
}


AnimatedBTreeNode.prototype.setText = function(newText, textIndex)
{
	textIndex = (textIndex == undefined) ? 0 : textIndex;
	this.labels[textIndex] = newText;
}

		
		
function UndoDeleteBTreeNode(id, numLab, labelText, x, y, wPerElement, nHeight, lColors, bgColor, fgColor, l, highlighted)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.widthPerElem = wPerElement;
	this.nodeHeight = nHeight;
	this.backgroundColor= bgColor;
	this.foregroundColor = fgColor;
	this.numElems = numLab;
	this.labels = labelText;
	
	this.labelColors = lColors;
	this.layer = l;
	this.highlighted = highlighted;
}
		
UndoDeleteBTreeNode.inheritFrom(UndoBlock);
	
UndoDeleteBTreeNode.prototype.undoInitialStep = function(world)
{
	
	world.addBTreeNode(this.objectID, this.widthPerElem, this.nodeHeight, this.numElems, this.backgroundColor, this.foregroundColor);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	for (var i = 0; i < this.numElems; i++)
	{
		world.setText(this.objectID, this.labels[i], i);
		world.setTextColor(this.objectID, this.labelColors[i],i);
	}
	world.setHighlight(this.objectID, this.highlighted);
	world.setLayer(this.objectID, this.layer);
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


var AnimatedCircle = function(objectID, objectLabel)
{
	// call superclass' constructor
	AnimatedCircle.superclass.constructor.call(this);

	this.objectID = objectID;
	this.label = objectLabel;
	this.radius = 20;
	this.thickness = 3;
	this.x = 0;
	this.y = 0;
	this.alpha = 1.0;
	this.addedToScene = true;
        this.highlightIndex = -1;
        this.textHeight = 10;
/*	this.foregroundColor  = '#007700';
	this.backgroundColor  = '#EEFFEE';
 */
}
AnimatedCircle.inheritFrom(AnimatedObject);

AnimatedCircle.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint)
{
	return this.getHeadPointerAttachPos(fromX, fromY);	
}


AnimatedCircle.prototype.getWidth = function()
{
	return this.radius * 2;
}

AnimatedObject.prototype.setWidth = function(newWidth)
{
	this.radius = newWidth / 2;
}





AnimatedCircle.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
	var xVec = fromX - this.x;
	var yVec = fromY - this.y;
	var len  = Math.sqrt(xVec * xVec + yVec*yVec);
	if (len == 0)
	{
		return [this.x, this.y];
	}
	return [this.x+(xVec/len)*(this.radius), this.y +(yVec/len)*(this.radius)];
}


AnimatedCircle.prototype.setHighlightIndex = function(hlIndex)
{
    this.highlightIndex = hlIndex;
    this.highlightIndexDirty = true;

}

AnimatedCircle.prototype.draw = function(ctx)
{
	ctx.globalAlpha = this.alpha;

	if (this.highlighted)
	{
		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius + this.highlightDiff,0,Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	
	
	ctx.fillStyle = this.backgroundColor;
	ctx.strokeStyle = this.foregroundColor;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(this.x,this.y,this.radius,0,Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.textAlign = 'center';
	ctx.font         = this.textHeight.toString() + 'px sans-serif';
	ctx.textBaseline   = 'middle'; 
	ctx.lineWidth = 1;
	ctx.fillStyle = this.foregroundColor;
	
	var strList = this.label.split("\n");
	if (strList.length == 1)
	{
             if (this.highlightIndexDirty && this.highlightIndex != -1)
             {
                  this.leftWidth = ctx.measureText(this.label.substring(0,this.highlightIndex)).width;
                  this.centerWidth = ctx.measureText(this.label.substring(this.highlightIndex, this.highlightIndex+1)).width;
                  this.textWidth = ctx.measureText(this.label).width;
                  this.highlightIndexDirty = false;
             }
             if (this.highlightIndex != -1 && this.highlightIndex < this.label.length) //this.highlghtIndex < this.label.length)
             {
                     var  startingXForHighlight = this.x - this.textWidth / 2;
    	             ctx.textAlign = 'left';
                    var leftStr = this.label.substring(0, this.highlightIndex);
                    var highlightStr = this.label.substring(this.highlightIndex, this.highlightIndex + 1)
                    var rightStr = this.label.substring(this.highlightIndex + 1)
                    ctx.fillText(leftStr, startingXForHighlight, this.y)
 	            ctx.strokeStyle = "#FF0000";
	            ctx.fillStyle = "#FF0000";
                    ctx.fillText(highlightStr, startingXForHighlight + this.leftWidth, this.y)


	            ctx.strokeStyle = this.labelColor;
	            ctx.fillStyle = this.labelColor;
                    ctx.fillText(rightStr, startingXForHighlight + this.leftWidth + this.centerWidth, this.y)



              }
              else
              {
	    	   ctx.fillText(this.label, this.x, this.y); 		
              }
	}
	else if (strList.length % 2 == 0)
	{
		var i;
		var mid = strList.length / 2;
		for (i = 0; i < strList.length / 2; i++)
		{
			ctx.fillText(strList[mid - i - 1], this.x, this.y - (i + 0.5) * 12);
			ctx.fillText(strList[mid + i], this.x, this.y + (i + 0.5) * 12);
			
		}		
	}
	else
	{
		var mid = (strList.length - 1) / 2;
		var i;
		ctx.fillText(strList[mid], this.x, this.y);
		for (i = 0; i < mid; i++)
		{
			ctx.fillText(strList[mid - (i + 1)], this.x, this.y - (i + 1) * 12);			
			ctx.fillText(strList[mid + (i + 1)], this.x, this.y + (i + 1) * 12);			
		}
		
	}

}


AnimatedCircle.prototype.createUndoDelete = function()
{
	return new UndoDeleteCircle(this.objectID, this.label, this.x, this.y, this.foregroundColor, this.backgroundColor, this.layer, this.radius);
}

		
function UndoDeleteCircle(id, lab, x, y, foregroundColor, backgroundColor, l, radius)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.nodeLabel = lab;
	this.fgColor = foregroundColor;
	this.bgColor = backgroundColor;
	this.layer = l;
        this.radius = radius;
}
		
UndoDeleteCircle.inheritFrom(UndoBlock);

UndoDeleteCircle.prototype.undoInitialStep = function(world)
{
	world.addCircleObject(this.objectID, this.nodeLabel);
        world.setWidth(this.objectID, this.radius * 2);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	world.setForegroundColor(this.objectID, this.fgColor);
	world.setBackgroundColor(this.objectID, this.bgColor);
	world.setLayer(this.objectID, this.layer);
}





// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function AnimatedLabel(id, val, center, initialWidth, ctx)
{
	// call superclass' constructor
	AnimatedLabel.superclass.constructor.call(this);

	this.centering = center;
	this.label = val;
	this.highlighted = false;
	this.objectID = id;
	this.alpha = 1.0;
	this.addedToScene = true;
	this.labelColor = "#000000";
	this.textWidth = 0;
        this.ctx = ctx;
        this.height = 10;
       
	if (initialWidth != undefined || false)
	{
		this.textWidth = initialWidth;
	}
        else
	{
	    this.width = getTextWidth();
	}

        this.leftWidth = -1;
        this.centerWidth = -1;
        this.highlightIndex = -1;
}
AnimatedLabel.inheritFrom(AnimatedObject);

AnimatedLabel.prototype.alwaysOnTop = true;


AnimatedLabel.prototype.centered = function()
{
	return this.centering;
}


AnimatedLabel.prototype.draw = function(ctx)
{
	if (!this.addedToScene)
	{
		return;
	}
	
	ctx.globalAlpha = this.alpha;
	ctx.font = this.height.toString()  + 'px sans-serif';
//	ctx.font = 'px sans-serif';

        var startingXForHighlight = this.x; 

        if (this.highlightIndex >= this.label.length)
        {
             this.highlightIndex = -1;
        }
        if (this.highlightIndexDirty && this.highlightIndex != -1)
        {
              this.leftWidth = ctx.measureText(this.label.substring(0,this.highlightIndex)).width;
              this.centerWidth = ctx.measureText(this.label.substring(this.highlightIndex, this.highlightIndex+1)).width;
	      this.highlightIndexDirty = false;
        }
	
	if (this.centering)
	{
                if (this.highlightIndex != -1)
                {
		    startingXForHighlight = this.x - this.width / 2;
                    ctx.textAlign = 'left';
                    ctx.textBaseline   = 'middle'; 
                }
                else
                {
      		    ctx.textAlign = 'center';
                    ctx.textBaseline   = 'middle'; 
                }
	}
	else
	{
		ctx.textAlign = 'left';
		ctx.textBaseline   = 'top'; 
	}
	if (this.highlighted)
	{
	    ctx.strokeStyle = "#ffaaaa";
	    ctx.fillStyle = "#ff0000";
		ctx.lineWidth = this.highlightDiff;
		ctx.strokeText(this.label, this.x, this.y);		
		//ctx.fillText(this.label, this.x, this.y);
	}
	ctx.strokeStyle = this.labelColor;
	ctx.fillStyle = this.labelColor;
	ctx.lineWidth = 1;
	strList = this.label.split("\n");
	if (strList.length == 1)
	{
                if (this.highlightIndex == -1)
                {
                    ctx.fillText(this.label, this.x, this.y); 
                }
                else
                {
                    var leftStr = this.label.substring(0, this.highlightIndex);
                    var highlightStr = this.label.substring(this.highlightIndex, this.highlightIndex + 1)
                    var rightStr = this.label.substring(this.highlightIndex + 1)
                    ctx.fillText(leftStr, startingXForHighlight, this.y)
 	            ctx.strokeStyle = "#FF0000";
	            ctx.fillStyle = "#FF0000";
                    ctx.fillText(highlightStr, startingXForHighlight + this.leftWidth, this.y)


	            ctx.strokeStyle = this.labelColor;
	            ctx.fillStyle = this.labelColor;
                    ctx.fillText(rightStr, startingXForHighlight + this.leftWidth + this.centerWidth, this.y)


                }
		//this.textWidth = ctx.measureText(this.label).width;
	}
	else
	{
		var offset = (this.centering)?  (1.0 - strList.length) / 2.0 : 0;
		for (var i = 0; i < strList.length; i++)
		{
			ctx.fillText(strList[i], this.x, this.y + offset + i * 12);
			//this.textWidth = Math.max(this.textWidth, ctx.measureText(strList[i]).width);
		}		
	}
	ctx.closePath();
}



AnimatedLabel.prototype.getTextWidth = function()
{
    this.ctx.font = this.height.toString() + 'px sans-serif';
    var strList = this.label.split("\n");
    var width = 0;
    if (strList.length == 1)
    {
 	width = this.ctx.measureText(this.label).width;
    }
    else
    {
	for (var i = 0; i < strList.length; i++)
	{
	    width = Math.max(width, this.ctx.measureText(strList[i]).width);
	}		
    }
    return width;
}

AnimatedLabel.prototype.getAlignLeftPos = function(otherObject)
{
    if (this.centering)
    {
	return [otherObject.left() - this.textWidth / 2, this.y = otherObject.centerY()];
    }
    else
    {
	return [otherObject.left() - this.textWidth, otherObject.centerY() - this.height / 2];
    }
}

AnimatedLabel.prototype.alignLeft = function(otherObject)
{
	if (this.centering)
	{
		this.y = otherObject.centerY();
		this.x = otherObject.left() - this.textWidth / 2;
	}
	else
	{
		this.y = otherObject.centerY() - this.height / 2;
		this.x = otherObject.left() - this.textWidth;
	}
}

AnimatedLabel.prototype.alignRight = function(otherObject)
{
	if (this.centering)
	{
		this.y = otherObject.centerY();
		this.x = otherObject.right() + this.textWidth / 2;
	}
	else
	{
		this.y = otherObject.centerY() - this.height / 2;
		this.x = otherObject.right();
	}
}
AnimatedLabel.prototype.getAlignRightPos = function(otherObject)
{
    if (this.centering)
    {
	return [otherObject.right() + this.textWidth / 2, otherObject.centerY()];
    }
    else
    {
	return [otherObject.right(), otherObject.centerY() - this.height / 2];
    }
}


AnimatedLabel.prototype.alignTop = function(otherObject)
{
	if (this.centering)
	{
		this.y = otherObject.top() - this.height / 2;
		this.x = otherObject.centerX();
	}
	else
	{
		this.y = otherObject.top() - 10;
		this.x = otherObject.centerX() -this.textWidth / 2;
	}
}


AnimatedLabel.prototype.getAlignTopPos = function(otherObject)
{
	if (this.centering)
	{
		return [otherObject.centerX(), otherObject.top() - this.height/ 2];
	}
	else
	{
	    return [otherObject.centerX() -this.textWidth / 2, otherObject.top() - 10];
	}
}


AnimatedLabel.prototype.alignBottom = function(otherObject)
{
	if (this.centering)
	{
		this.y = otherObject.bottom() + this.height / 2;
		this.x = otherObject.centerX();
	}
	else
	{
		this.y = otherObject.bottom();
		this.x = otherObject.centerX() - this.textWidth / 2;
	}
}


AnimatedLabel.prototype.getAlignBottomPos = function(otherObject)
{
	if (this.centering)
	{
	    return [otherObject.centerX(),  otherObject.bottom() + this.height / 2];
	}
	else
	{
	    return [otherObject.centerX() - this.textWidth / 2,  otherObject.bottom()];
	}
}



AnimatedLabel.prototype.getWidth = function()
{
	return this.textWidth;
}

AnimatedLabel.prototype.getHeight = function()
{
	return this.height; 
}

AnimatedLabel.prototype.setHeight = function(newHeight)
{
    this.height = newHeight;
    this.textWidth =this.getTextWidth();
}

AnimatedLabel.prototype.setHighlight = function(value)
{
	this.highlighted = value;
}
		
AnimatedLabel.prototype.createUndoDelete = function()
{
	return new UndoDeleteLabel(this.objectID, this.label, this.x, this.y, this.centering, this.labelColor, this.layer, this.highlightIndex);
}
		
		
AnimatedLabel.prototype.centerX = function()
{
	if (this.centering)
	{
		return this.x;
	}
	else 
	{
		return this.x + this.textWidth; 
	}
	
}
	   
AnimatedLabel.prototype.centerY = function()
{
	if (this.centering)
	{
		return this.y;
	}
	else 
	{
		return this.y + this.height / 2; // 
	}
   
}
	   
AnimatedLabel.prototype.top = function()	   
{
	   if (this.centering)
	   {
		   return  this.y - this.height/2; //TODO: Un-Hardwire
	   }
	   else 
	   {
			return this.y;   
	   }
}


AnimatedLabel.prototype.bottom = function()
{
   if (this.centering)
   {
	   return  this.y + this.height/2; // TODO: + height / 2;
   }
   else 
   {
	   return  this.y + this.height; // TODO: + hieght;
   }
}
	   
	   
AnimatedLabel.prototype.right = function()
{
   if (this.centering)
   {
	   return  this.x + this.textWidth / 2; // TODO: + width / 2;
   }
   else
   {
	   return  this.x + this.textWidth; // TODO: + width;
   }
}


AnimatedLabel.prototype.left = function()
{
   if (this.centering)
   {
	   return this. x - this.textWidth / 2;
   }
   else
   {
	   return  this.x; // TODO:  - a little?
   }
}


AnimatedLabel.prototype.setHighlightIndex = function(hlIndex)
{
    // Only allow highlight index for labels that don't have End-Of-Line
    if (this.label.indexOf("\n") == -1 && this.label.length > hlIndex)
    {
         this.highlightIndex = hlIndex;
         this.highlightIndexDirty = true;
    }
    else
    {
         this.highlightIndex = -1;

    }
}


 AnimatedLabel.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint)
 {			 
	return this.getClosestCardinalPoint(fromX, fromY); 
 }

AnimatedLabel.prototype.getHeadPointerAttachPos = function (fromX, fromY) 
{
	return this.getClosestCardinalPoint(fromX, fromY);			
}

AnimatedLabel.prototype.setText = function(newText, textIndex, initialWidth)
{
	this.label = newText;
	if (initialWidth != undefined)
	{
		this.textWidth = initialWidth;
	}
        this.textWidth = this.getTextWidth();
}



function UndoDeleteLabel(id, lab, x, y, centered, color, l, hli)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.nodeLabel = lab;
	this.labCentered = centered;
	this.labelColor = color;
	this.layer = l;
        this.highlightIndex = hli;
        this.dirty = true;
}

UndoDeleteLabel.inheritFrom(UndoBlock);

UndoDeleteLabel.prototype.undoInitialStep = function(world)
{
	world.addLabelObject(this.objectID, this.nodeLabel, this.labCentered);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	world.setForegroundColor(this.objectID, this.labelColor);
	world.setLayer(this.objectID, this.layer);
}


// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function AnimatedLinkedList(id, val, wth, hgt, linkPer, verticalOrientation, linkPosEnd, numLab, fillColor, edgeColor)
{
	// call superclass' constructor, which calls init
	AnimatedLinkedList.superclass.constructor.call(this);

	this.w = wth;
	this.h = hgt;
	this.backgroundColor = fillColor;
	this.foregroundColor = edgeColor;
	this.val = val;
	
	this.vertical = verticalOrientation;
	this.linkPositionEnd = linkPosEnd;
	this.linkPercent = linkPer;
	
	this.numLabels = numLab;
	this.objectID = id;	

	this.labels = [];
	this.labelPosX = [];
	this.labelPosY = [];
	this.labelColors = [];
	this.nullPointer = false;
	
	this.currentHeightDif = 6;
	this.maxHeightDiff = 5;
	this.minHeightDiff = 3;
	
	for (var i = 0; i < this.numLabels; i++)
	{
		this.labels[i] = "";
		this.labelPosX[i] = 0;
		this.labelPosY[i] = 0;
		this.labelColors[i] = this.foregroundColor;
	}
	
	this.labels[0] = this.val;
	this.highlighted = false;
}
AnimatedLinkedList.inheritFrom(AnimatedObject);
		
		
AnimatedLinkedList.prototype.left = function()
{
	if (this.vertical)
	{
		return this.x - this.w / 2.0; 
	}
	else if (this.linkPositionEnd)
	{
		return this.x - ((this.w * (1 - this.linkPercent)) / 2);
	}
	else
	{
		return this.x  - (this.w * (this.linkPercent + 1)) / 2;
	}
}
		

AnimatedLinkedList.prototype.setNull = function(np)
{
	if (this.nullPointer != np)
	{		   
		this.nullPointer = np;
	}
	
}

AnimatedLinkedList.prototype.getNull = function()
{
	return this.nullPointer;   
}

AnimatedLinkedList.prototype.right = function()
{
	if (this.vertical)
	{
		return this.x + this.w / 2.0; 
	}
	else if (this.linkPositionEnd)
	{
		return this.x + ((this.w * (this.linkPercent + 1)) / 2);
	}
	else
	{
		return this.x + (this.w * (1 - this.linkPercent)) / 2;
	}
} 

AnimatedLinkedList.prototype.top = function()
{
	if (!this.vertical)
	{
		return this.y - this.h / 2.0; 			   
	}
	else if (this.linkPositionEnd)
	{
		return this.y - (this.h * (1 -this.linkPercent)) / 2;   
	}
	else
	{
		return this.y - (this.h * (1 + this.linkPercent)) / 2;   
	}
}

AnimatedLinkedList.prototype.bottom = function()
{
	if (!this.vertical)
	{
		return this.y + this.h / 2.0; 			   
	}
	else if (this.linkPositionEnd)
	{
		return this.y + (this.h * (1 +this.linkPercent)) / 2;   
	}
	else
	{
		return this.y + (this.h * (1 - this.linkPercent)) / 2;   
	}
}


// TODO: Should we move this to the draw function, and save the
//       space of the arrays?  Bit of a leftover from the Flash code,
//       which did drawing differently
AnimatedLinkedList.prototype.resetTextPosition = function()
{
	if (this.vertical)
	{
		this.labelPosX[0] = this.x;
		
		this.labelPosY[0] = this.y + this.h * (1-this.linkPercent)/2 *(1/this.numLabels - 1);				
		//				labelPosY[0] = -height * (1-linkPercent) / 2 + height*(1-linkPercent)/2*numLabels;
		for (var i = 1; i < this.numLabels; i++)
		{
			this.labelPosY[i] = this.labelPosY[i-1] +  this.h*(1-this.linkPercent)/this.numLabels;
			this.labelPosX[i] = this.x;
		}
	}
	else
	{
		this.labelPosY[0] = this.y;
		this.labelPosX[0] = this.x +  this.w * (1-this.linkPercent)/2*(1/this.numLabels - 1);
		for (var i = 1; i < this.numLabels; i++)
		{
			this.labelPosY[i] = this.y;
			this.labelPosX[i] = this.labelPosX[i-1] +  this.w*(1-this.linkPercent)/this.numLabels;
		}				
	}
	
}


AnimatedLinkedList.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor)
{
	if (this.vertical && this.linkPositionEnd)
	{
		return [this.x, this.y + this.h / 2.0];				
	}
	else if (this.vertical && !this.linkPositionEnd)
	{
		return [this.x, this.y - this.h / 2.0];							
	}
	else if  (!this.vertical && this.linkPositionEnd)
	{
		return [this.x + this.w / 2.0, this.y];								
	}
	else // (!this.vertical && !this.linkPositionEnd)
	{
		return [this.x - this.w / 2.0, this.y];								
	}
}


AnimatedLinkedList.prototype.getHeadPointerAttachPos = function(fromX, fromY) 
{
	return this.getClosestCardinalPoint(fromX, fromY);			
}


AnimatedLinkedList.prototype.setWidth = function(wdth)
{
	this.w = wdth;
	this.resetTextPosition();
}


AnimatedLinkedList.prototype.setHeight = function(hght)
{
	this.h = hght;
	this.resetTextPosition();
}

AnimatedLinkedList.prototype.getWidth = function()
{
	return this.w;
}

AnimatedLinkedList.prototype.getHeight = function()
{
	return this.h;
}

AnimatedLinkedList.prototype.draw = function(context)
{
	var startX;
	var startY;
	
	startX = this.left();
	startY = this.top();
	
	if (this.highlighted)
	{
		context.strokeStyle = "#ff0000";
		context.fillStyle = "#ff0000";
		
		context.beginPath();
		context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w + this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w+ this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);				
		context.closePath();
		context.stroke();
		context.fill();
	}
	context.strokeStyle = this.foregroundColor;
	context.fillStyle = this.backgroundColor;
	
	context.beginPath();
	context.moveTo(startX ,startY);
	context.lineTo(startX + this.w, startY);
	context.lineTo(startX + this.w, startY + this.h);
	context.lineTo(startX, startY + this.h);
	context.lineTo(startX, startY);
	context.closePath();
	context.stroke();
	context.fill();
		
	var i;
	if (this.vertical)
	{
		startX = this.left();
		for (i= 1; i < this.numLabels; i++)
		{
			//TODO: this doesn't look right ...
			startY = this.y + this.h*(1-this.linkPercent)*(i / this.numLabels - 1/2);
			
			context.beginPath();
			context.moveTo(startX ,startY);
			context.lineTo(startX + this.w, startY);
			context.closePath();
			context.stroke();
		}
	}
	else
	{
		startY = this.top();
		for (i = 1; i < this.numLabels; i++)
		{
			startX = this.x + this.w*(1-this.linkPercent)*(i / this.numLabels - 1/2);
			context.beginPath();
			context.moveTo(startX ,startY);
			context.lineTo(startX, startY + this.h);
			context.closePath();
			context.stroke();
		}			
	}
	
	if (this.vertical && this.linkPositionEnd)
	{
		startX = this.left();
		startY = this.bottom() - this.h * this.linkPercent;

		
		context.beginPath();
		context.moveTo(startX + this.w ,startY);
		context.lineTo(startX, startY);
		if (this.nullPointer)
		{	
			context.lineTo(this.startX + this.w, this.bottom());
		}
		context.closePath();
		context.stroke();		
	}
	else if (this.vertical && !this.linkPositionEnd)
	{
		startX = this.left();
		startY = this.top() + this.h * this.linkPercent;

		context.beginPath();
		context.moveTo(startX + this.w ,startY);
		context.lineTo(startX, startY);
		if (this.nullPointer)
		{	
			context.lineTo(startX + this.w, this.top());
		}
		context.closePath();
		context.stroke();	
		
	}
	else if  (!this.vertical && this.linkPositionEnd)
	{
		startX = this.right() - this.w * this.linkPercent;
		startY = this.top();
		
		context.beginPath();
		context.moveTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		if (this.nullPointer)
		{	
			context.lineTo(this.right(), startY + this.h);
		}
		context.closePath();
		context.stroke();		
		
	}
	else // (!vertical && !linkPositionEnd)
	{
		startX = this.left()  + this.w * this.linkPercent;
		startY = this.top() ;
		
		context.beginPath();
		context.moveTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		if (this.nullPointer)
		{	
			context.lineTo(this.left(), startY);
		}
		context.closePath();
		context.stroke();	
	}
	
	
	context.textAlign = 'center';
	context.font         = '10px sans-serif';
	context.textBaseline   = 'middle'; 
	context.lineWidth = 1;
	
	
	this.resetTextPosition();
	for (i = 0; i < this.numLabels; i++)
	{
		context.fillStyle = this.labelColors[i];
		context.fillText(this.labels[i], this.labelPosX[i], this.labelPosY[i]); 
	}
}



AnimatedLinkedList.prototype.setTextColor = function(color, textIndex)
{
	
	this.labelColors[textIndex] = color;
}



AnimatedLinkedList.prototype.getTextColor = function(textIndex)
{
	return this.labelColors[textIndex];
}



AnimatedLinkedList.prototype.getText = function(index)
{
	return this.labels[index];  
}

AnimatedLinkedList.prototype.setText = function(newText, textIndex)
{
	this.labels[textIndex] = newText;
	this.resetTextPosition();
}







AnimatedLinkedList.prototype.createUndoDelete = function() 
{		
	return new UndoDeleteLinkedList(this.objectID, this.numLabels, this.labels, this.x, this.y, this.w, this.h, this.linkPercent,
									this.linkPositionEnd, this.vertical, this.labelColors, this.backgroundColor, this.foregroundColor, 
									this.layer, this.nullPointer);
}

AnimatedLinkedList.prototype.setHighlight = function(value)
{
	if (value != this.highlighted)
	{
		this.highlighted = value;
	}
}




function UndoDeleteLinkedList(id, numlab, lab, x, y, w, h, linkper, posEnd, vert, labColors, bgColor, fgColor, l, np)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.width = w;
	this.height = h;
	this.backgroundColor= bgColor;
	this.foregroundColor = fgColor;
	this.labels = lab;
	this.linkPercent = linkper;
	this.verticalOrentation = vert;
	this.linkAtEnd = posEnd;
	this.labelColors = labColors
	this.layer = l;
	this.numLabels = numlab;
	this.nullPointer = np;
}

UndoDeleteLinkedList.inheritFrom(UndoBlock);



UndoDeleteLinkedList.prototype.undoInitialStep =function(world)
{
	world.addLinkedListObject(this.objectID,this.labels[0], this.width, this.height, this.linkPercent, this.verticalOrentation, this.linkAtEnd, this.numLabels, this.backgroundColor, this.foregroundColor);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	world.setLayer(this.objectID, this.layer);
	world.setNull(this.objectID, this.nullPointer);
	for (var i = 0; i < this.numLabels; i++)
	{
		world.setText(this.objectID, this.labels[i], i);
		world.setTextColor(this.objectID, this.labelColors[i], i);
	}
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function AnimatedObject()
{
	this.backgroundColor = "#FFFFFF";
	this.foregroundColor = "#000000";
	this.highlighted = false;
	this.objectID = -1;
	this.layer = 0;
	this.addedToScene = true;
	this.label = "";
	this.labelColor = "#000000";
	this.alpha = 1.0;
	this.x = 0;
	this.y = 0;
	this.minHeightDiff = 3;
	this.range = 5;
	this.highlightIndex = -1;
	this.highlightIndexDirty = true;
	this.textHeight = 10;
}

AnimatedObject.prototype.alwaysOnTop = false;

AnimatedObject.prototype.setBackgroundColor = function(newColor)
{
	this.backgroundColor = newColor;
}

AnimatedObject.prototype.setForegroundColor = function(newColor)
{
	this.foregroundColor = newColor;
}

AnimatedObject.prototype.setNull = function()
{
	
}

AnimatedObject.prototype.getNull = function()
{
	return false;
}

AnimatedObject.prototype.setAlpha = function(newAlpha)
{
	this.alpha = newAlpha;
}

AnimatedObject.prototype.getAlpha = function()
{
	return this.alpha;
}

AnimatedObject.prototype.setForegroundColor = function(newColor)
{
	this.foregroundColor = newColor;
	this.labelColor = newColor;
}


AnimatedObject.prototype.getHighlight = function()
{
	return this.highlighted;
}

AnimatedObject.prototype.getWidth = function()
{
	// TODO:  Do we want to throw here?  Should always override this ...
	return 0;
}

AnimatedObject.prototype.getHeight = function()
{
	// TODO:  Do we want to throw here?  Should always override this ...
	return 0;
}

AnimatedObject.prototype.setHighlight = function(value)
{
	this.highlighted = value;
}

AnimatedObject.prototype.centerX = function()
{
	return this.x;
}




AnimatedObject.prototype.setWidth = function(newWidth)
{
	// TODO:  Do we want to throw here?  Should always override this ... 
}




AnimatedObject.prototype.centerY = function()
{
	return this.y;
}


AnimatedObject.prototype.getAlignLeftPos = function(otherObject)
{
    return [otherObject.right()+ this.getWidth() / 2, otherObject.centerY()];
}

AnimatedObject.prototype.getAlignRightPos = function(otherObject)
{
	
    return [otherObject.left() - this.getWidth() / 2, otherObject.centerY()];
}

AnimatedObject.prototype.getAlignTopPos = function(otherObject)
{

    return [otherObject.centerX(), otherObject.top() - this.getHeight() / 2];
}
AnimatedObject.prototype.getAlignBottomPos = function(otherObject)
{
    return [otherObject.centerX(), otherObject.bottom() + this.getHeight() / 2];
}


AnimatedObject.prototype.alignLeft = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	//  (See AnimatedLabel, for instance)
	this.y = otherObject.centerY();
	this.x = otherObject.right() + this.getWidth() / 2;	
}

AnimatedObject.prototype.alignRight = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	//  (See AnimatedLabel, for instance)
	this.y = otherObject.centerY();
	this.x = otherObject.left() - this.getWidth() / 2;	
}


AnimatedObject.prototype.alignTop = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	
	this.x = otherObject.centerX();
	this.y = otherObject.top() - this.getHeight() / 2;	
	
	
}


AnimatedObject.prototype.alignBottom = function(otherObject)
{
	this.x = otherObject.centerX();
	this.y = otherObject.bottom() + this.getHeight() / 2;		
	
}



/* TODO:  Do we need these in the base? 		
		function left(): Number
		{
			return x - getWidth() / 2;
		}
		
		function right():Number
		{
			return x + getWidth() / 2;
		}
		
		function top():Number
		{
			return y - getHeight() / 2;
		}
		
		function bottom():Number
		{
			return y + getHeight() / 2;
		}
		
		function centerX():Number
		{
			return x;
		}
		
		function centerY():Number
		{
			return y;
		}
		*/
		
		
AnimatedObject.prototype.getClosestCardinalPoint = function(fromX, fromY)
{
	var xDelta;
	var yDelta;
	var xPos;
	var yPos;
			
	if (fromX < this.left())
	{
		xDelta = this.left() - fromX;
		xPos = this.left();
 	}
	else if (fromX > this.right())
	{
		xDelta = fromX - this.right();
		xPos = this.right();
    }
	else
	{
		xDelta = 0;
		xPos = this.centerX();
	}
	
	if (fromY < this.top())
	{
		yDelta = this.top() - fromY;
		yPos = this.top();
	}
	else if (fromY > this.bottom())
	{
		yDelta = fromY - this.bottom();
		yPos = this.bottom();
    }
	else
	{
		yDelta = 0;
		yPos = this.centerY();
	}
			
	if (yDelta > xDelta)
	{
		xPos = this.centerX();
	}
	else 
	{
		yPos  = this.centerY();
	}
	
	return [xPos, yPos];
}
		
		
AnimatedObject.prototype.centered = function()
{
	return false;
}


AnimatedObject.prototype.pulseHighlight = function(frameNum)
{			
	if (this.highlighted)
	{
				var frameMod = frameNum / 7.0;
				var delta  = Math.abs((frameMod) % (2 * this.range  - 2) - this.range + 1)
				this.highlightDiff =  delta + this.minHeightDiff;
	}
			
}
		
AnimatedObject.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint) 
{
	return [this.x, this.y];
}
		
		
AnimatedObject.prototype.getHeadPointerAttachPos = function(fromX, fromY) 
{
	return [this.x, this.y];
}
		
/*public function createUndoDelete() : UndoBlock
{
			// Must be overriden!
			return null;
}
*/		
AnimatedObject.prototype.identifier = function()
{
	return this.objectID;
}

AnimatedObject.prototype.getText = function(index)
{
	return this.label;
}
		
AnimatedObject.prototype.getTextColor = function(textIndex)
{			
	return this.labelColor
}
		
AnimatedObject.prototype.setTextColor = function(color, textIndex)
{
		this.labelColor = color;
}
		
AnimatedObject.prototype.setText = function(newText, textIndex)
{
	this.label = newText;
}

AnimatedObject.prototype.setHighlightIndex = function(hlIndex)
{
   this.highlightIndex = hlIndex;
   this.highlightIndexDirty = true;
}


AnimatedObject.prototype.getHighlightIndex = function()
{
   return this.highlightIndex;
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// Values for xJust / yJust:  "center", "left", "right", "top", "bottom"

AnimatedRectangle = function(id, val, wth, hgt,  xJust, yJust, fillColor, edgeColor)
{
	// call superclass' constructor
	AnimatedRectangle.superclass.constructor.call(this);

	this.w = wth;
	this.h = hgt;
	this.xJustify = xJust;
	this.yJustify = yJust;
	this.label = val;
	this.labelColor = edgeColor
	
	this.backgroundColor = fillColor;
	this.foregroundColor = edgeColor;
	this.labelColor = this.foregroundColor;
	this.highlighted = false;
	this.objectID = id;
	this.nullPointer = false;
	this.alpha = 1.0;
	this.addedToScene = true;
	
}

AnimatedRectangle.inheritFrom(AnimatedObject);

AnimatedRectangle.prototype.setNull = function(np)
{
	this.nullPointer = np;
}

AnimatedRectangle.prototype.getNull = function()
{
	return this.nullPointer;
}


AnimatedRectangle.prototype.left = function()
{
	if (this.xJustify == "left")
	{
		return  this.x;
	}
	else if (this.xJustify == "center")
	{
		return this.x - this.w / 2.0;   
	}
	else // (this.xJustify == "right")
	{
		return this.x - this.w;   
	}
	
}

AnimatedRectangle.prototype.centerX = function()
{
	if (this.xJustify == "center")
	{
		return this.x;
	}
	else if (this.xJustify == "left")
	{
		return this.x + this.w / 2.0;
	}
	else // (this.xJustify == "right")
	{
		return this.x - this.w / 2.0;
	}
}

AnimatedRectangle.prototype.centerY = function()
{
	if (this.yJustify == "center")
	{
		return this.y;
	}
	else if (this.yJustify == "top")
	{
		return this.y + this.h / 2.0;
	}
	else // (this.xJustify == "bottom")
	{
		return this.y - this.w / 2.0;
	}
	
}

AnimatedRectangle.prototype.top = function()
{
	if (this.yJustify == "top")
	{
		return  this.y;
	}
	else if (this.yJustify == "center")
	{
		return this.y - this.h / 2.0;   
	}
	else //(this.xJustify == "bottom")
	{
		return this.y - this.h;   
	}
}

AnimatedRectangle.prototype.bottom = function()
{
	if (this.yJustify == "top")
	{
		return  this.y + this.h;
	}
	else if (this.yJustify == "center")
	{
		return this.y + this.h / 2.0;   
	}
	else //(this.xJustify == "bottom")
	{
		return this.y;   
	}
}


AnimatedRectangle.prototype.right = function()
{
	if (this.xJustify == "left")
	{
		return  this.x + this.w;
	}
	else if (this.xJustify == "center")
	{
		return this.x + this.w / 2.0;   
	}
	else // (this.xJustify == "right")
	{
		return this.x;   
	}
}


AnimatedRectangle.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
	return this.getClosestCardinalPoint(fromX, fromY);			
}


AnimatedRectangle.prototype.setWidth = function(wdth)
{
	this.w = wdth;
}


AnimatedRectangle.prototype.setHeight = function(hght)
{
	this.h = hght;
}

AnimatedRectangle.prototype.getWidth = function()
{
	return this.w;
}

AnimatedRectangle.prototype.getHeight = function()
{
	return this.h;
}


// TODO:  Fix me!
AnimatedRectangle.prototype.draw = function(context)
{
	if (!this.addedToScene)
	{
		return;
	}
	
	var startX;
	var startY;
	var labelPosX;
	var labelPosY;
	
	context.globalAlpha = this.alpha;
	
	if (this.xJustify == "left")
	{
		startX = this.x;
		labelPosX = this.x + this.w / 2.0;
	}
	else if (this.xJustify == "center")
	{
		startX = this.x-this.w / 2.0;
		labelPosX = this.x;
		
	}
	else if (this.xJustify == "right")
	{
		startX = this.x-this.w;
		labelPosX = this.x - this.w / 2.0 
	}
	if (this.yJustify == "top")
	{
		startY = this.y;
		labelPosY = this.y + this.h / 2.0;
	}
	else if (this.yJustify == "center")
	{
		startY = this.y - this.h / 2.0;
		labelPosY = this.y;
		
	}
	else if (this.yJustify == "bottom")
	{
		startY = this.y - this.h;
		labelPosY = this.y - this.h / 2.0;
	}
	
	context.lineWidth = 1;
	
	if (this.highlighted)
	{
		context.strokeStyle = "#ff0000";
		context.fillStyle = "#ff0000";
		
		context.beginPath();
		context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w + this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w+ this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);				
		context.closePath();
		context.stroke();
		context.fill();
		
	}
	context.strokeStyle = this.foregroundColor;
	context.fillStyle = this.backgroundColor;
	
	context.beginPath();
	context.moveTo(startX ,startY);
	context.lineTo(startX + this.w, startY);
	context.lineTo(startX + this.w, startY + this.h);
	context.lineTo(startX, startY + this.h);
	context.lineTo(startX, startY);
	context.closePath();
	context.stroke();
	context.fill();
	
	if (this.nullPointer)
	{
		context.beginPath();
		context.moveTo(startX ,startY);
		context.lineTo(startX + this.w, startY + this.h);
		context.closePath();
		context.stroke();
	}
	
	context.fillStyle = this.labelColor;
	
	context.textAlign = 'center';
	context.font         = '10px sans-serif';
	context.textBaseline   = 'middle'; 
	context.lineWidth = 1;
	context.fillText(this.label, this.x, this.y); 
	
	
	
}

AnimatedRectangle.prototype.setText = function(newText, textIndex)
{
	this.label = newText;
	// TODO:  setting text position?
}


AnimatedRectangle.prototype.createUndoDelete = function() 
{
	// TODO: Add color?
	return new UndoDeleteRectangle(this.objectID, this.label, this.x, this.y, this.w, this.h, this.xJustify, this.yJustify, this.backgroundColor, this.foregroundColor, this.highlighted, this.layer);
}

AnimatedRectangle.prototype.setHighlight = function(value)
{
	this.highlighted = value;
}



function UndoDeleteRectangle(id, lab, x, y, w, h, xJust, yJust, bgColor, fgColor, highlight, lay)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.width = w;
	this.height = h;
	this.xJustify = xJust;
	this.yJustify = yJust;
	this.backgroundColor= bgColor;
	this.foregroundColor = fgColor;
	this.nodeLabel = lab;
	this.layer = lay;
	this.highlighted = highlight;
}

UndoDeleteRectangle.inheritFrom(UndoBlock);


UndoDeleteRectangle.prototype.undoInitialStep = function(world)
{
	world.addRectangleObject(this.objectID, this.nodeLabel, this.width, this.height, this.xJustify, this.yJustify, this.backgroundColor, this.foregroundColor);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	world.setLayer(this.objectID, this.layer);
	world.setHighlight(this.objectID, this.highlighted);
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// Global timer used for doing animation callbacks.
//  TODO:  Make this an instance variable of Animation Manager.
// var timer;
// var swapped = false;


function reorderSibling(node1, node2) 
{
    node1.parentNode.replaceChild(node1, node2);
    node1.parentNode.insertBefore(node2, node1); 
}


function swapControlDiv()
{
    this.swapped = !this.swapped;
    if (this.swapped) {
	reorderSibling(this.canvas, this.generalControlBar.parentNode);
        setCookie("VisualizationControlSwapped", "true", 30);

    } else {
	reorderSibling(this.generalControlBar.parentNode, this.canvas);
        setCookie("VisualizationControlSwapped", "false", 30);

    }
}


// Utility funciton to read a cookie
function getCookie(cookieName)
{
	var i, x, y;
	var cookies=document.cookie.split(";");
	for (i=0; i < cookies.length; i++)
	{
		x=cookies[i].substr(0,cookies[i].indexOf("="));
		y=cookies[i].substr(cookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==cookieName)
		{
			return unescape(y);
		}
	}
}

// Utility funciton to write a cookie
function setCookie(cookieName,value,expireDays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + expireDays);
	var cookieValue=escape(value) + ((expireDays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=cookieName + "=" + value;
}


var ANIMATION_SPEED_DEFAULT = 75;


// TODO:  Move these out of global space into animation manager?
// var objectManager;
// var animationManager;
// var canvas;

// var paused = false;
// var playPauseBackButton;
// var skipBackButton;
// var stepBackButton;
// var stepForwardButton;
// var skipForwardButton;

// var widthEntry;
// var heightEntry;
// var sizeButton;



function returnSubmit(field, funct, maxsize, intOnly)
{
    
	if (maxsize != undefined)
	{
		field.size = maxsize;
	}
	return function(event)
	{       
		var keyASCII = 0;
		if(window.event) // IE
		{
			keyASCII = event.keyCode
		}
		else if (event.which) // Netscape/Firefox/Opera
		{
			keyASCII = event.which
		} 

		if (keyASCII == 13)
		{
			funct();
                        return false;
		}
        	else if (keyASCII == 59  || keyASCII == 45 || keyASCII == 46 || keyASCII == 190 || keyASCII == 173)
		{
		       return false;	
		} 
		else if (maxsize != undefined && field.value.length >= maxsize ||
				 intOnly && (keyASCII < 48 || keyASCII > 57))

		{
			if (!controlKey(keyASCII))
				return false;
		}
	    return true;
		
	}
	
}


function animWaiting()
{
	this.stepForwardButton.disabled = false;
	if (this.skipBackButton.disabled == false)
	{
		this.stepBackButton.disabled = false;
	}
	this.objectManager.statusReport.setText("Animation Paused");
	this.objectManager.statusReport.setForegroundColor("#FF0000");
}

function animStarted()
{
	this.skipForwardButton.disabled = false;
	this.skipBackButton.disabled = false;
	this.stepForwardButton.disabled = true;
	this.stepBackButton.disabled = true;
	this.objectManager.statusReport.setText("Animation Running");
	this.objectManager.statusReport.setForegroundColor("#009900");
}

function animEnded()
{
	this.skipForwardButton.disabled = true;
	this.stepForwardButton.disabled = true;
	if (this.skipBackButton.disabled == false && this.paused)
	{
		this.stepBackButton.disabled = false;		
	}
	// this.objectManager.statusReport.setText("Animation Completed");
	this.objectManager.statusReport.setText("");
	this.objectManager.statusReport.setForegroundColor("#000000");
}



function anumUndoUnavailable()
{
	this.skipBackButton.disabled = true;
	this.stepBackButton.disabled = true;
}


function timeout()
{
	// We need to set the timeout *first*, otherwise if we
	// try to clear it later, we get behavior we don't want ...
    this.timer = setTimeout(timeout.bind(this), 30); 
	this.update();
	this.objectManager.draw();	
        
}


function doPlayPause()
{
	this.paused = !this.paused;
	if (this.paused)
	{
		this.playPauseBackButton.setAttribute("value", "play");
		if (this.skipBackButton.disabled == false)
		{
			this.stepBackButton.disabled = false;		
		}
		
	}
	else
	{
		this.playPauseBackButton.setAttribute("value", "pause");	
	}
	this.SetPaused(this.paused);
}


// Creates and returs an AnimationManager
function initCanvas(canvas, generalControlBar, algorithmControlBar)
{
	// UI nodes should be given, otherwise use defaults.
	// This is the only place where getElementById is used
	if(!canvas)              canvas              = document.getElementById("canvas");
	if(!generalControlBar)   generalControlBar   = document.getElementById('GeneralAnimationControls');
    if(!algorithmControlBar) algorithmControlBar = document.getElementById("AlgorithmSpecificControls");

	var objectManager = new ObjectManager(canvas);
	var animationManager = new AnimationManager(objectManager);
	animationManager.canvas = canvas;
	animationManager.generalControlBar = generalControlBar;
	animationManager.algorithmControlBar = algorithmControlBar;
	
	animationManager.skipBackButton = animationManager.addControlToAnimationBar("Button", "Skip Back");
	animationManager.skipBackButton.onclick = animationManager.skipBack.bind(animationManager);
	animationManager.stepBackButton = animationManager.addControlToAnimationBar("Button", "Step Back");
	animationManager.stepBackButton.onclick = animationManager.stepBack.bind(animationManager);
	animationManager.playPauseBackButton = animationManager.addControlToAnimationBar("Button", "Pause");
	animationManager.playPauseBackButton.onclick = doPlayPause.bind(animationManager);
	animationManager.stepForwardButton = animationManager.addControlToAnimationBar("Button", "Step Forward");
	animationManager.stepForwardButton.onclick = animationManager.step.bind(animationManager) ;
	animationManager.skipForwardButton = animationManager.addControlToAnimationBar("Button", "Skip Forward");
	animationManager.skipForwardButton.onclick = animationManager.skipForward.bind(animationManager);
	
	
	var element = document.createElement("div");
	element.setAttribute("display", "inline-block");		
	element.setAttribute("float", "left");		

	
	var tableEntry = document.createElement("td");
	
	
	
	
	
	var newTable = document.createElement("table");

	var midLevel = document.createElement("tr");
	var bottomLevel = document.createElement("td");
	midLevel.appendChild(bottomLevel);
	bottomLevel.appendChild(element);
	newTable.appendChild(midLevel);	
	
	
	
	midLevel = document.createElement("tr");
	bottomLevel = document.createElement("td");
	bottomLevel.align = "center";
	var txtNode = document.createTextNode("Animation Speed"); 
	midLevel.appendChild(bottomLevel);
	bottomLevel.appendChild(txtNode);
	newTable.appendChild(midLevel);	

	
	
	tableEntry.appendChild(newTable);
	
	
	
    //Append the element in page (in span).
	if(generalControlBar)
    generalControlBar.appendChild(tableEntry);
		
    //tableEntry.appendChild(element);

	var speed = getCookie("VisualizationSpeed");
	if (speed == null || speed == "")
	{
		speed = ANIMATION_SPEED_DEFAULT;
	}
	else
	{
		speed = parseInt(speed);
	}
	
	if(generalControlBar) {
	$(element).slider({
					  animate: true,
					  value: speed,
					  change: function(e, ui)
					  {
						setCookie("VisualizationSpeed", String(ui.value), 30);
					  },
					  slide : function(e, ui){
					  animationManager.SetSpeed(ui.value); 
					  }

					  }); 
	}
	
	animationManager.SetSpeed(speed);
	
	element.setAttribute("style", "width:200px");



	var width=getCookie("VisualizationWidth");
	if (width == null || width == "")
	{
		width = canvas.width;
	}
	else
	{
		width = parseInt(width);
	}
	var height=getCookie("VisualizationHeight");
	if (height == null || height == "")
	{
		height = canvas.height;
	}
	else
	{
		height = parseInt(height);
	}

	var swappedControls=getCookie("VisualizationControlSwapped");
	this.swapped = swappedControls == "true"
        if (this.swapped)
        {
	    reorderSibling(this.canvas, this.generalControlBar.parentNode);
	}

	canvas.width = width;
	canvas.height = height;
	
	
	
	tableEntry = document.createElement("td");
	txtNode = document.createTextNode(" w:"); 
	tableEntry.appendChild(txtNode);
	if(generalControlBar)
	generalControlBar.appendChild(tableEntry);


	animationManager.widthEntry = animationManager.addControlToAnimationBar("Text", canvas.width);
	animationManager.widthEntry.size = 4;
	animationManager.widthEntry.onkeydown = returnSubmit(animationManager.widthEntry, animationManager.changeSize.bind(animationManager), 4, true);

	
	tableEntry = document.createElement("td");
	txtNode = document.createTextNode("       h:"); 
	tableEntry.appendChild(txtNode);
	if(generalControlBar)
	generalControlBar.appendChild(tableEntry);
	
	animationManager.heightEntry = animationManager.addControlToAnimationBar("Text", canvas.height);
	animationManager.heightEntry.onkeydown = returnSubmit(animationManager.heightEntry, animationManager.changeSize.bind(animationManager), 4, true);

//	heightEntry.size = 4;
	animationManager.sizeButton = animationManager.addControlToAnimationBar("Button", "Change Canvas Size");
	
	animationManager.sizeButton.onclick = animationManager.changeSize.bind(animationManager) ;
	

        animationManager.swapButton = animationManager.addControlToAnimationBar("Button", "Move Controls");
        animationManager.swapButton.onclick = swapControlDiv.bind(animationManager);	
	
	
	animationManager.addListener("AnimationStarted", animationManager, animStarted);
	animationManager.addListener("AnimationEnded", animationManager, animEnded);
	animationManager.addListener("AnimationWaiting", animationManager, animWaiting);
	animationManager.addListener("AnimationUndoUnavailable", animationManager, anumUndoUnavailable);
	objectManager.width = canvas.width;
	objectManager.height = canvas.height;
	return animationManager;
}



function AnimationManager(objectManager)
{
	AnimationManager.superclass.constructor.call(this);

	// Holder for all animated objects.
	// All animation is done by manipulating objects in\
	// this container
	this.animatedObjects = objectManager;
	// TODO: change this to animatedObjects later
	this.objectManager = objectManager;

	// Control variables for stopping / starting animation
	// TODO: not sure what's the difference between paused and animationPaused
	this.paused = false;
	
	this.animationPaused = false;
	this.awaitingStep = false;
	this.currentlyAnimating = false;
	
	// Array holding the code for the animation.  This is 
	// an array of strings, each of which is an animation command
	// currentAnimation is an index into this array
	this.AnimationSteps = [];
	this.currentAnimation = 0;
	
	this.previousAnimationSteps = [];
	
	// Control variables for where we are in the current animation block.
	//  currFrame holds the frame number of the current animation block,
	//  while animationBlockLength holds the length of the current animation
	//  block (in frame numbers).  
	this.currFrame = 0;
	this.animationBlockLength = 0;
	
	//  The animation block that is currently running.  Array of singleAnimations
	this.currentBlock = null;
	
	/////////////////////////////////////
	// Variables for handling undo. 
	////////////////////////////////////
	//  A stack of UndoBlock objects (subclassed, UndoBlock is an abstract base class)
	//  each of which can undo a single animation element
	this.undoStack = [];
	this.doingUndo = false;
	
	// A stack containing the beginning of each animation block, as an index
	// into the AnimationSteps array
	this.undoAnimationStepIndices = [];
	this.undoAnimationStepIndicesStack = [];
	
	this.animationBlockLength = 10;

	this.lerp = function(from, to, percent)
	{
		return (to - from) * percent + from;
	}
	
	// Pause / unpause animation
	this.SetPaused = function(pausedValue)
	{
		this.animationPaused = pausedValue;
		if (!this.animationPaused)
		{
			this.step();
		}
	}
	
	// Set the speed of the animation, from 0 (slow) to 100 (fast)
	this.SetSpeed = function(newSpeed)
	{
		this.animationBlockLength = Math.floor((100-newSpeed) / 2);
	}
	

	this.parseBool = function(str)
	{
		var uppercase = str.toUpperCase();
		var returnVal =  !(uppercase == "False" || uppercase == "f" || uppercase == " 0" || uppercase == "0" || uppercase == "");
		return returnVal;

	}

	this.parseColor = function(clr)
	{
			if (clr.charAt(0) == "#")
			{
				return clr;
			}
			else if (clr.substring(0,2) == "0x")
			{
				return "#" + clr.substring(2);
			}
	}
	
	
	this.changeSize = function()
	{
		
		var width = parseInt(this.widthEntry.value);
		var height = parseInt(this.heightEntry.value);
		
		if (width > 100)
		{
			this.canvas.width = width;
			this.animatedObjects.width = width;
			setCookie("VisualizationWidth", String(width), 30);
			
		}
		if (height > 100)
		{
			this.canvas.height = height;
			this.animatedObjects.height = height;
			setCookie("VisualizationHeight", String(height), 30);
		}
		width.value = this.canvas.width;
		this.heightEntry.value = this.canvas.height;
		
		this.animatedObjects.draw();
		this.fireEvent("CanvasSizeChanged",{width:this.canvas.width, height:this.canvas.height});		
	}
	
	this.startNextBlock = function()
	{
		this.awaitingStep = false;
		this.currentBlock = [];
		var undoBlock = []
		if (this.currentAnimation == this.AnimationSteps.length )
		{
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.fireEvent("AnimationEnded","NoData");
			clearTimeout(this.timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			
			return;
		}
		this.undoAnimationStepIndices.push(this.currentAnimation);

		var foundBreak= false;
		var anyAnimations= false;
		
		while (this.currentAnimation < this.AnimationSteps.length && !foundBreak)
		{			
			var nextCommand = this.AnimationSteps[this.currentAnimation].split("<;>");
			if (nextCommand[0].toUpperCase() == "CREATECIRCLE")
			{
				this.animatedObjects.addCircleObject(parseInt(nextCommand[1]), nextCommand[2]);
				if (nextCommand.length > 4)
				{
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[3]), parseInt(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));

			}
			else if (nextCommand[0].toUpperCase() == "CONNECT")
			{
				
				if (nextCommand.length > 7)
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]), 
                                                                         parseInt(nextCommand[2]), 
                                                                         this.parseColor(nextCommand[3]), 
                                                                         parseFloat(nextCommand[4]), 
                                                                         this.parseBool(nextCommand[5]), 
                                                                         nextCommand[6], 
                                                                         parseInt(nextCommand[7]));
				}
				else if (nextCommand.length > 6)
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]), 
                                                                         parseInt(nextCommand[2]),
                                                                         this.parseColor(nextCommand[3]),
                                                                         parseFloat(nextCommand[4]),
                                                                         this.parseBool(nextCommand[5]),
                                                                         nextCommand[6],
                                                                         0);
				}
				else if (nextCommand.length > 5)
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]), 
                                                                         parseInt(nextCommand[2]),
                                                                         this.parseColor(nextCommand[3]),
                                                                         parseFloat(nextCommand[4]),
                                                                         this.parseBool(nextCommand[5]),
                                                                         "",
                                                                         0);
				}
				else if (nextCommand.length > 4)
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]),
                                                                         parseInt(nextCommand[2]),
                                                                         this.parseColor(nextCommand[3]),
                                                                         parseFloat(nextCommand[4]),
                                                                         true,
                                                                         "",
                                                                         0);
				}
				else if (nextCommand.length > 3)
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]),
                                                                         parseInt(nextCommand[2]),
																		 this.parseColor(nextCommand[3]),
                                                                         0.0,
                                                                         true,
                                                                         "",
                                                                         0);
				}
				else
				{
					this.animatedObjects.connectEdge(parseInt(nextCommand[1]),
                                                                         parseInt(nextCommand[2]),
													                    "#000000",
                                                                         0.0,
                                                                         true,
                                                                         "",
                                                                         0);
					
				}
				undoBlock.push(new UndoConnect(parseInt(nextCommand[1]), parseInt (nextCommand[2]), false));
			}
			else if (nextCommand[0].toUpperCase() == "CREATERECTANGLE")
			{
				if (nextCommand.length == 9)
				{
					this.animatedObjects.addRectangleObject(parseInt(nextCommand[1]), // ID
															nextCommand[2], // Label
															parseInt(nextCommand[3]), // w
															parseInt(nextCommand[4]), // h
															nextCommand[7], // xJustify
															nextCommand[8],// yJustify
															"#ffffff", // background color
					                                        "#000000"); // foreground color
				}
				else
				{
					this.animatedObjects.addRectangleObject(parseInt(nextCommand[1]), // ID
															nextCommand[2], // Label
															parseInt(nextCommand[3]), // w
															parseInt(nextCommand[4]), // h
															"center", // xJustify
															"center",// yJustify
															"#ffffff", // background color
					                                        "#000000"); // foreground color
					
				}
				if (nextCommand.length > 6)
				{
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			}
			
			else if (nextCommand[0].toUpperCase() == "MOVE")
			{
				var objectID = parseInt(nextCommand[1]);
				var nextAnim =  new SingleAnimation(objectID, 
													this.animatedObjects.getNodeX(objectID), 
													this.animatedObjects.getNodeY(objectID), 
													parseInt(nextCommand[2]),
													parseInt(nextCommand[3]));
				this.currentBlock.push(nextAnim);

				undoBlock.push(new UndoMove(nextAnim.objectID, nextAnim.toX, nextAnim.toY, nextAnim.fromX, nextAnim.fromY));

				anyAnimations = true;
			}
			
			else if (nextCommand[0].toUpperCase() == "MOVETOALIGNRIGHT")
			{
				var id = parseInt(nextCommand[1]);
				var otherId = parseInt(nextCommand[2]);
                                var newXY = this.animatedObjects.getAlignRightPos(id, otherId);


				var nextAnim =  new SingleAnimation(id,
								    this.animatedObjects.getNodeX(id), 
								    this.animatedObjects.getNodeY(id), 
								    newXY[0],
								    newXY[1]);
				this.currentBlock.push(nextAnim);
				undoBlock.push(new UndoMove(nextAnim.objectID, nextAnim.toX, nextAnim.toY, nextAnim.fromX, nextAnim.fromY));
				anyAnimations = true;
			}

			else if (nextCommand[0].toUpperCase() == "STEP")
			{
				foundBreak = true;
			}
			else if (nextCommand[0].toUpperCase() == "SETFOREGROUNDCOLOR")
			{
				var id = parseInt(nextCommand[1]);
				var oldColor = this.animatedObjects.foregroundColor(id);
				this.animatedObjects.setForegroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetForegroundColor(id, oldColor));
			}
			else if (nextCommand[0].toUpperCase() == "SETBACKGROUNDCOLOR")
			{
				id = parseInt(nextCommand[1]);
				oldColor = this.animatedObjects.backgroundColor(id);
				this.animatedObjects.setBackgroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetBackgroundColor(id, oldColor));
			}
			else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHT")
			{
				var newHighlight = this.parseBool(nextCommand[2]);
				this.animatedObjects.setHighlight( parseInt(nextCommand[1]), newHighlight);
				undoBlock.push(new UndoHighlight( parseInt(nextCommand[1]), !newHighlight));
			}
			else if (nextCommand[0].toUpperCase() == "DISCONNECT")
			{
				var undoConnect = this.animatedObjects.disconnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
				if (undoConnect != null)
				{
					undoBlock.push(undoConnect);
				}
			}
			else if (nextCommand[0].toUpperCase() == "SETALPHA")
			{
				var oldAlpha = this.animatedObjects.getAlpha(parseInt(nextCommand[1]));
				this.animatedObjects.setAlpha(parseInt(nextCommand[1]), parseFloat(nextCommand[2]));
				undoBlock.push(new UndoSetAlpha(parseInt(nextCommand[1]), oldAlpha));					
			}
			else if (nextCommand[0].toUpperCase() == "SETTEXT")
			{
				if (nextCommand.length > 3)
				{
					var oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), parseInt(nextCommand[3]));
					this.animatedObjects.setText(parseInt(nextCommand[1]), nextCommand[2], parseInt(nextCommand[3]));
					if (oldText != undefined)
					{
						undoBlock.push(new UndoSetText(parseInt(nextCommand[1]), oldText, parseInt(nextCommand[3]) ));			
					}	
				}
				else
				{
					oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setText(parseInt(nextCommand[1]), nextCommand[2], 0);
					if (oldText != undefined)
					{
						undoBlock.push(new UndoSetText(parseInt(nextCommand[1]), oldText, 0));	
					}
				}
			}
			else if (nextCommand[0].toUpperCase() == "DELETE")
			{
				var objectID  = parseInt(nextCommand[1]);
				
				var i;
				var removedEdges = this.animatedObjects.deleteIncident(objectID);
				if (removedEdges.length > 0)
				{
					undoBlock = undoBlock.concat(removedEdges);
				}
				var obj = this.animatedObjects.getObject(objectID);
				if (obj != null)
				{
					undoBlock.push(obj.createUndoDelete());
					this.animatedObjects.removeObject(objectID);
				}
			}
			else if (nextCommand[0].toUpperCase() == "CREATEHIGHLIGHTCIRCLE")
			{
				if (nextCommand.length > 5)
				{
					this.animatedObjects.addHighlightCircleObject(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), parseFloat(nextCommand[5]));
				}
				else
				{
					this.animatedObjects.addHighlightCircleObject(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), 20);						
				}
				if (nextCommand.length > 4)
				{
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[3]), parseInt(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				
				
			}
			else if (nextCommand[0].toUpperCase() == "CREATELABEL")
			{
				if (nextCommand.length == 6)
				{
					this.animatedObjects.addLabelObject(parseInt(nextCommand[1]), nextCommand[2], this.parseBool(nextCommand[5]));						
				}
				else
				{
					this.animatedObjects.addLabelObject(parseInt(nextCommand[1]), nextCommand[2], true);
				}
				if (nextCommand.length >= 5)
				{
					
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseFloat(nextCommand[3]), parseFloat(nextCommand[4]));
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			}
			else if (nextCommand[0].toUpperCase() == "SETEDGECOLOR")
			{
				var from = parseInt(nextCommand[1]);
				var to = parseInt(nextCommand[2]);
				var newColor = this.parseColor(nextCommand[3]);
				var oldColor = this.animatedObjects.setEdgeColor(from, to, newColor);				
				undoBlock.push(new UndoSetEdgeColor(from, to, oldColor));
			}
			else if (nextCommand[0].toUpperCase() == "SETEDGEALPHA")
			{
				var from = parseInt(nextCommand[1]);
				var to = parseInt(nextCommand[2]);
				var newAlpha = parseFloat(nextCommand[3]);
				var oldAplpha = this.animatedObjects.setEdgeAlpha(from, to, newAlpha);				
				undoBlock.push(new UndoSetEdgeAlpha(from, to, oldAplpha));
			}
			
			
			else if (nextCommand[0].toUpperCase() == "SETEDGEHIGHLIGHT")
			{
				var newHighlight = this.parseBool(nextCommand[3]);
				var from = parseInt(nextCommand[1]);
				var to = parseInt(nextCommand[2]);
				var oldHighlight = this.animatedObjects.setEdgeHighlight(from, to, newHighlight);
				undoBlock.push(new UndoHighlightEdge(from, to, oldHighlight));
			}
			else if (nextCommand[0].toUpperCase() == "SETHEIGHT")
			{
				id = parseInt(nextCommand[1]);
				var oldHeight = this.animatedObjects.getHeight(id);
				this.animatedObjects.setHeight(id, parseInt(nextCommand[2]));
				undoBlock.push(new UndoSetHeight(id, oldHeight));
			}
			else if (nextCommand[0].toUpperCase() == "SETLAYER")
			{
				this.animatedObjects.setLayer(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
				//TODO: Add undo information here
			}
			
			
			else if (nextCommand[0].toUpperCase() == "CREATELINKEDLIST")
			{
				if (nextCommand.length == 11)
				{
					this.animatedObjects.addLinkedListObject(parseInt(nextCommand[1]), nextCommand[2], 
			               parseInt(nextCommand[3]), parseInt(nextCommand[4]), parseFloat(nextCommand[7]), 
			               this.parseBool(nextCommand[8]), this.parseBool(nextCommand[9]),parseInt(nextCommand[10]), "#FFFFFF", "#000000");
				}
				else
				{
					this.animatedObjects.addLinkedListObject(parseInt(nextCommand[1]), nextCommand[2], parseInt(nextCommand[3]), parseInt(nextCommand[4]), 0.25, true, false, 1, "#FFFFFF", "#000000");
				}
				if (nextCommand.length > 6)
				{
					this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
				
			}
			else if (nextCommand[0].toUpperCase() == "SETNULL")
			{
				var oldNull = this.animatedObjects.getNull(parseInt(nextCommand[1]));
				this.animatedObjects.setNull(parseInt(nextCommand[1]), this.parseBool(nextCommand[2]));
				undoBlock.push(new UndoSetNull(parseInt(nextCommand[1]), oldNull));					
			}
			else if (nextCommand[0].toUpperCase() == "SETTEXTCOLOR")
			{
				if (nextCommand.length > 3)
				{
					oldColor = this.animatedObjects.getTextColor(parseInt(nextCommand[1]), parseInt(nextCommand[3]));
					this.animatedObjects.setTextColor(parseInt(nextCommand[1]), this.parseColor(nextCommand[2]), parseInt(nextCommand[3]));
					undoBlock.push(new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, parseInt(nextCommand[3]) ));					
				}
				else
				{
					oldColor = this.animatedObjects.getTextColor(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setTextColor(parseInt(nextCommand[1]),this.parseColor(nextCommand[2]), 0);
					undoBlock.push(new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, 0));					
				}
			}
			
			
			else if (nextCommand[0].toUpperCase() == "CREATEBTREENODE")
			{

				this.animatedObjects.addBTreeNode(parseInt(nextCommand[1]), parseFloat(nextCommand[2]), parseFloat(nextCommand[3]), 
			                 parseInt(nextCommand[4]),this.parseColor(nextCommand[7]), this.parseColor(nextCommand[8]));
				this.animatedObjects.setNodePosition(parseInt(nextCommand[1]), parseInt(nextCommand[5]), parseInt(nextCommand[6]));
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			}

			else if (nextCommand[0].toUpperCase() == "SETWIDTH")
			{
				var id = parseInt(nextCommand[1]);
				this.animatedObjects.setWidth(id, parseInt(nextCommand[2]));
				var oldWidth = this.animatedObjects.getWidth(id);
				undoBlock.push(new UndoSetWidth(id, oldWidth));
			}
			else if (nextCommand[0].toUpperCase() == "SETNUMELEMENTS")
			{
				var oldElem = this.animatedObjects.getObject(parseInt(nextCommand[1]));
				undoBlock.push(new UndoSetNumElements(oldElem, parseInt(nextCommand[2])));
				this.animatedObjects.setNumElements(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
			}
			else if (nextCommand[0].toUpperCase() == "SETPOSITION")
			{
				var id = parseInt(nextCommand[1])
				var oldX = this.animatedObjects.getNodeX(id);
				var oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX, oldY));
				this.animatedObjects.setNodePosition(id, parseInt(nextCommand[2]), parseInt(nextCommand[3]));
			}
			else if (nextCommand[0].toUpperCase() == "ALIGNRIGHT")
			{
				var id = parseInt(nextCommand[1])
				var oldX = this.animatedObjects.getNodeX(id);
				var oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignRight(id, parseInt(nextCommand[2]));
			}
			else if (nextCommand[0].toUpperCase() == "ALIGNLEFT")
			{
				var id = parseInt(nextCommand[1])
				var oldX = this.animatedObjects.getNodeX(id);
				var oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignLeft(id, parseInt(nextCommand[2]));
			}
			else if (nextCommand[0].toUpperCase() == "ALIGNTOP")
			{
				var id = parseInt(nextCommand[1])
				var oldX = this.animatedObjects.getNodeX(id);
				var oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignTop(id, parseInt(nextCommand[2]));
			}
			else if (nextCommand[0].toUpperCase() == "ALIGNBOTTOM")
			{
				var id = parseInt(nextCommand[1])
				var oldX = this.animatedObjects.getNodeX(id);
				var oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX. oldY));
				this.animatedObjects.alignBottom(id, parseInt(nextCommand[2]));
			}





			else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHTINDEX")
			{
				var id = parseInt(nextCommand[1]);
				var index = parseInt(nextCommand[2]);
                                var oldIndex = this.animatedObjects.getHighlightIndex(id)
				undoBlock.push(new UndoSetHighlightIndex(id, oldIndex));
				this.animatedObjects.setHighlightIndex(id,index);
			}
			else
			{
	//			throw "Unknown command: " + nextCommand[0];					
			}
			
			this.currentAnimation = this.currentAnimation+1;
		}
		this.currFrame = 0;

		// Hack:  If there are not any animations, and we are currently paused,
		// then set the current frame to the end of the anumation, so that we will
		// advance immediagely upon the next step button.  If we are not paused, then
		// animate as normal.

		if (!anyAnimations && this.animationPaused || (!anyAnimations && this.currentAnimation == this.AnimationSteps.length) )
		{
			this.currFrame = this.animationBlockLength;
		}

		this.undoStack.push(undoBlock);
	}

	//  Start a new animation.  The input parameter commands is an array of strings,
	//  which represents the animation to start
	this.StartNewAnimation =  function(commands)
	{
		clearTimeout(this.timer);
		if (this.AnimationSteps != null)
		{
			this.previousAnimationSteps.push(this.AnimationSteps);
			this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
		}
		if (commands == undefined || commands.length == 0)
		{
			this.AnimationSteps = ["Step"];
		}
		else
		{
			this.AnimationSteps = commands;
		}
		this.undoAnimationStepIndices = new Array();
		this.currentAnimation = 0;
		this.startNextBlock();
		this.currentlyAnimating = true;
		this.fireEvent("AnimationStarted","NoData");
		this.timer = setTimeout(timeout.bind(this), 30); 

	}
	
	
	// Step backwards one step.  A no-op if the animation is not currently paused
	this.stepBack = function()
	{
		if (this.awaitingStep && this.undoStack != null && this.undoStack.length != 0)
		{
			//  TODO:  Get events working correctly!
			this.fireEvent("AnimationStarted","NoData");
			clearTimeout(this.timer);

			this.awaitingStep = false;
			this.undoLastBlock();
			// Re-kick thie timer.  The timer may or may not be running at this point,
			// so to be safe we'll kill it and start it again.
			clearTimeout(this.timer);
			this.timer = setTimeout(timeout.bind(this), 30); 

			
		}
		else if (!this.currentlyAnimating && this.animationPaused && this.undoAnimationStepIndices != null)
		{
			this.fireEvent("AnimationStarted","NoData");
			this.currentlyAnimating = true;
			this.undoLastBlock();
			// Re-kick thie timer.  The timer may or may not be running at this point,
			// so to be safe we'll kill it and start it again.
			clearTimeout(this.timer);
			this.timer = setTimeout(timeout.bind(this), 30); 
			
		}
		
	}
	// Step forwards one step.  A no-op if the animation is not currently paused
	this.step = function()
	{
		if (this.awaitingStep)
		{
			this.startNextBlock();
			this.fireEvent("AnimationStarted","NoData");
			this.currentlyAnimating = true;
			// Re-kick thie timer.  The timer should be going now, but we've had some difficulty with
			// it timing itself out, so we'll be safe and kick it now.
			clearTimeout(this.timer);
			this.timer = setTimeout(timeout.bind(this), 30); 			
		}
	}
	
	
	/// WARNING:  Could be dangerous to call while an animation is running ...
	this.clearHistory = function()
	{
		this.undoStack = [];
		this.undoAnimationStepIndices = null;
		this.previousAnimationSteps = [];
		this.undoAnimationStepIndicesStack = [];
		this.AnimationSteps = null;
		this.fireEvent("AnimationUndoUnavailable","NoData");
		clearTimeout(this.timer);
		this.animatedObjects.update();
		this.animatedObjects.draw();
		
	}
	
	this.skipBack = function()
	{
		var keepUndoing = this.undoAnimationStepIndices != null && this. undoAnimationStepIndices.length != 0;
		if (keepUndoing)
		{
			var i;
			for (i = 0; this.currentBlock != null && i < this.currentBlock.length; i++)
			{
				var objectID = this.currentBlock[i].objectID;
				this.animatedObjects.setNodePosition(objectID,
												this.currentBlock[i].toX,
												this.currentBlock[i].toY);
			}
			if (this.doingUndo)
			{
				this.finishUndoBlock(this.undoStack.pop())
			}
			while (keepUndoing)
			{
				this.undoLastBlock();
				for (i = 0; i < this.currentBlock.length; i++)
				{
					objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID,
													this.currentBlock[i].toX,
													this.currentBlock[i].toY);
				}
				keepUndoing = this.finishUndoBlock(this.undoStack.pop());
				
			}
			clearTimeout(this.timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			if (this.undoStack == null || this.undoStack.length == 0)
			{
				this.fireEvent("AnimationUndoUnavailable","NoData");
			}

		}			
	}
	
	this.resetAll = function()
	{
		this.clearHistory();
		this.animatedObjects.clearAllObjects();
		this.animatedObjects.draw();
		clearTimeout(this.timer);
	}
	
	this.skipForward = function()
	{
		if (this.currentlyAnimating)
		{
			this.animatedObjects.runFast = true;
			while (this.AnimationSteps != null && this.currentAnimation < this.AnimationSteps.length)
			{
				var i;
				for (i = 0; this.currentBlock != null && i < this.currentBlock.length; i++)
				{
					var objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID,
													this.currentBlock[i].toX,
													this.currentBlock[i].toY);
				}
				if (this.doingUndo)
				{
					this.finishUndoBlock(this.undoStack.pop())
				}
				this.startNextBlock();
				for (i= 0; i < this.currentBlock.length; i++)
				{
					var objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(objectID,
													this.currentBlock[i].toX,
													this.currentBlock[i].toY);
				}		
				
			}
			this.animatedObjects.update();
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.doingUndo = false;
			
			this.animatedObjects.runFast = false;
			this.fireEvent("AnimationEnded","NoData");
			clearTimeout(this.timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();			
		}
	}
	
	
	this.finishUndoBlock = function(undoBlock)
	{
		for (var i = undoBlock.length - 1; i >= 0; i--)
		{
			undoBlock[i].undoInitialStep(this.animatedObjects);
			
		}
		this.doingUndo = false;
		
		// If we are at the final end of the animation ...
		if (this.undoAnimationStepIndices.length == 0)
		{
			this.awaitingStep = false;
			this.currentlyAnimating = false;
			this.undoAnimationStepIndices = this.undoAnimationStepIndicesStack.pop();
			this.AnimationSteps = this.previousAnimationSteps.pop();
			this.fireEvent("AnimationEnded","NoData");
			this.fireEvent("AnimationUndo","NoData");
			this.currentBlock = [];
			if (this.undoStack == null || this.undoStack.length == 0)
			{
				this.currentlyAnimating = false;
				this.awaitingStep = false;
				this.fireEvent("AnimationUndoUnavailable","NoData");
			}
			
			clearTimeout(this.timer);
			this.animatedObjects.update();
			this.animatedObjects.draw();
			
			
			return false;
		}
		return true;
	}
	
	
	this.undoLastBlock = function()
	{
		
		if (this.undoAnimationStepIndices.length == 0)
		{
			
			// Nothing on the undo stack.  Return
			return;
			
		}
		if (this.undoAnimationStepIndices.length > 0)
		{
			this.doingUndo = true;
			var anyAnimations = false;
			this.currentAnimation = this.undoAnimationStepIndices.pop();
			this.currentBlock = [];
			var undo = this.undoStack[this.undoStack.length - 1];
			var i;
			for (i = undo.length - 1; i >= 0; i--)
			{
				var animateNext  =  undo[i].addUndoAnimation(this.currentBlock);
				anyAnimations = anyAnimations || animateNext;
				
			}
			this.currFrame = 0;
			
			// Hack:  If there are not any animations, and we are currently paused,
			// then set the current frame to the end of the animation, so that we will
			// advance immediagely upon the next step button.  If we are not paused, then
			// animate as normal.
			if (!anyAnimations && this.animationPaused  )
			{
				this.currFrame = this.animationBlockLength;
			}
			this.currentlyAnimating = true;				
		}
		
	}
	this.setLayer = function(shown, layers)
	{
		this.animatedObjects.setLayer(shown, layers)
		// Drop in an extra draw call here, just in case we are not
		// in the middle of an update loop when this changes
		this.animatedObjects.draw();
	}
	
	
	this.setAllLayers = function(layers)
	{
		this.animatedObjects.setAllLayers(layers);
		// Drop in an extra draw call here, just in case we are not
		// in the middle of an update loop when this changes
		this.animatedObjects.draw();
	}
	 
	
	this.update = function()
	{
		
		if (this.currentlyAnimating)
		{
			this.currFrame = this.currFrame + 1;
			var i;
			for (i = 0; i < this.currentBlock.length; i++)
			{
				if (this.currFrame == this.animationBlockLength || (this.currFrame == 1 && this.animationBlockLength == 0))
				{
					this.animatedObjects.setNodePosition(this.currentBlock[i].objectID,
													     this.currentBlock[i].toX,
													     this.currentBlock[i].toY);
				}
				else if (this.currFrame < this.animationBlockLength)
				{
					var objectID = this.currentBlock[i].objectID;
					var percent = 1 / (this.animationBlockLength - this.currFrame);
					var oldX = this.animatedObjects.getNodeX(objectID);
					var oldY = this.animatedObjects.getNodeY(objectID);
					var targetX = this.currentBlock[i].toX;
					var targety  = this.currentBlock[i].toY;						
					var newX = this.lerp(this.animatedObjects.getNodeX(objectID), this.currentBlock[i].toX, percent);
					var newY = this.lerp(this.animatedObjects.getNodeY(objectID), this.currentBlock[i].toY, percent);
					this.animatedObjects.setNodePosition(objectID, newX, newY);
				}
			}
			if (this.currFrame >= this.animationBlockLength)
			{
				if (this.doingUndo)
				{
					if (this.finishUndoBlock(this.undoStack.pop()))
					{
						this.awaitingStep = true;
						this.fireEvent("AnimationWaiting","NoData");
					}

				}
				else
				{
					if (this.animationPaused && (this.currentAnimation < this.AnimationSteps.length))
					{
						this.awaitingStep = true;
						this.fireEvent("AnimationWaiting","NoData");
						this.currentBlock = [];
					}
					else
					{
						this.startNextBlock();
					}
				}
			}
			this.animatedObjects.update();		
		
		}

		
	}
	
}

AnimationManager.inheritFrom(EventListener);

AnimationManager.prototype.addControlToAnimationBar = function(type,name,containerType)
{
	// return a dummy object if we're not using a control bar
	if(!this.generalControlBar)
		return {};
	if (containerType == undefined)
	{
			containerType = "input";
	}
	var element = document.createElement(containerType);
	
        element.setAttribute("type", type);
        element.setAttribute("value", name);
	
	
	var tableEntry = document.createElement("td");
	
	tableEntry.appendChild(element);
	
	
    //Append the element in page (in span).
    this.generalControlBar.appendChild(tableEntry);
	return element;
	
}				

function SingleAnimation(id, fromX, fromY, toX, toY)
{
	this.objectID = id;
	this.fromX = fromX;
	this.fromY = fromY;
	this.toX = toX;
	this.toY = toY;	
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// "Class" animatedCircle


var HighlightCircle = function(objectID, color, radius)
{
	// call superclass' constructor
	HighlightCircle.superclass.constructor.call(this);

	this.objectID = objectID;
	this.radius = radius;
	this.thickness = 4;
	this.foregroundColor = color;
	this.x = 0;
	this.y = 0;
	this.alpha = 1;
}
HighlightCircle.inheritFrom(AnimatedObject);


HighlightCircle.prototype.draw = function(ctx)
{
	ctx.globalAlpha = this.alpha;
	ctx.strokeStyle = this.foregroundColor;
	ctx.lineWidth = this.thickness;
	ctx.beginPath();
	ctx.arc(this.x,this.y,this.radius,0,Math.PI*2, true);
	ctx.closePath();
	ctx.stroke();
}


HighlightCircle.prototype.createUndoDelete = function()
{
	return new UndoDeleteHighlightCircle(this.objectID, this.x, this.y, this.foregroundColor, this.radius, this.layer, this.alpha);
}

		
function UndoDeleteHighlightCircle(objectID, x, y, circleColor, r, layer, alpha)
{
	this.objectID = objectID;
	this.x = x;
	this.y = y;
	this.color = circleColor;
	this.r = r;
	this.layer = layer;
	this.alpha = alpha
}
		
UndoDeleteHighlightCircle.inheritFrom(UndoBlock);

UndoDeleteHighlightCircle.prototype.undoInitialStep = function(world)
{
	world.addHighlightCircleObject(this.objectID, this.color, this.r);
	world.setLayer(this.objectID, this.layer)
	world.setNodePosition(this.objectID, this.x, this.y);
	world.setAlpha(this.objectID, this.alpha)
}





// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// This class is somewhat poorly named -- it handles links between vertices in graphs,
//  pointers in linked lists, and so on. 


var LINE_maxHeightDiff = 5;
var LINE_minHeightDiff = 3;
var LINE_range= LINE_maxHeightDiff - LINE_minHeightDiff + 1;
var LINE_highlightDiff = 3;

	
function Line(n1, n2, color, cv, d, weight, anchorIndex)
{
	this.arrowHeight = 8;
	this. arrowWidth = 4;

	this.Node1 = n1;
	this.Node2 = n2;
	this.Dirty = false;
	this.directed = d;
	this.edgeColor = color;
	this.edgeLabel = weight;
	this.highlighted = false;
	this.addedToScene = true;
	this.anchorPoint = anchorIndex;
	this.highlightDiff = 0;
	this.curve = cv;

	this.alpha = 1.0;
	this.color = function color()
	{
		return this.edgeColor;   
	}
	   
	this.setColor = function(newColor)
	{
		this.edgeColor = newColor;
		Dirty = true;
	}
	   
	this.setHighlight = function(highlightVal)
	{
		this.highlighted = highlightVal;   
	}
		   
	this.pulseHighlight = function(frameNum)
	{
	   if (this.highlighted)
	   {
		   var frameMod = frameNum / 14.0;
		   var delta  = Math.abs((frameMod) % (2 * LINE_range  - 2) - LINE_range + 1)
		   this.highlightDiff =  delta + LINE_minHeightDiff;
		   Dirty = true;			   
	   }
	}
	   
	   
	this.hasNode = function(n)
	{
		return ((this.Node1 == n) || (this.Node2 == n));   
	}
	   
	   
	this.createUndoDisconnect  = function()
        {
		return new UndoConnect(this.Node1.objectID, this.Node2.objectID, true, this.edgeColor, this.directed, this.curve, this.edgeLabel, this.anchorPoint);
	}
	   
	   
	this.sign = function(n)
	{
	   if (n > 0)
	   {
		   return 1;
	   }
	   else
	   {
		   return -1;
	   }
	}
	   
	   
	this.drawArrow = function(pensize, color, context)
	{		
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = pensize;
		var fromPos = this.Node1.getTailPointerAttachPos(this.Node2.x, this.Node2.y, this.anchorPoint);
		var toPos = this.Node2.getHeadPointerAttachPos(this.Node1.x, this.Node1.y);

		var fromPos = this.Node1.getTailPointerAttachPos(this.Node2.x, this.Node2.y, this.anchorPoint);
		var toPos = this.Node2.getHeadPointerAttachPos(this.Node1.x, this.Node1.y);

		var deltaX = toPos[0] - fromPos[0];
		var deltaY = toPos[1] - fromPos[1];
		var midX = (deltaX) / 2.0 + fromPos[0];
		var midY = (deltaY) / 2.0 + fromPos[1];
		var controlX = midX - deltaY * this.curve;

		var controlY = midY + deltaX * this.curve;

		context.beginPath();
		context.moveTo(fromPos[0], fromPos[1]);
		context.quadraticCurveTo(controlX, controlY, toPos[0], toPos[1]);
		context.stroke();
		//context.closePath();
			
		// Position of the edge label:  First, we will place it right along the
		// middle of the curve (or the middle of the line, for curve == 0)
		var labelPosX = 0.25* fromPos[0] + 0.5*controlX + 0.25*toPos[0]; 
		var labelPosY =  0.25* fromPos[1] + 0.5*controlY + 0.25*toPos[1]; 
			
		// Next, we push the edge position label out just a little in the direction of
		// the curve, so that the label doesn't intersect the cuve (as long as the label
		// is only a few characters, that is)
		var midLen = Math.sqrt(deltaY*deltaY + deltaX*deltaX);
		if (midLen != 0)
		{
			labelPosX +=  (- deltaY * this.sign(this.curve))  / midLen * 10 
			labelPosY += ( deltaX * this.sign(this.curve))  / midLen * 10  
		}
			


		context.textAlign = 'center';
		context.font         = '10px sans-serif';
		context.textBaseline   = 'middle'; 
		context.fillText(this.edgeLabel, labelPosX, labelPosY);

		if (this.directed)
		{
			var xVec = controlX - toPos[0];
			var yVec = controlY - toPos[1];
			var len = Math.sqrt(xVec * xVec + yVec*yVec);
		
			if (len > 0)
			{
				xVec = xVec / len
				yVec = yVec / len;
				
				context.beginPath();
				context.moveTo(toPos[0], toPos[1]);
				context.lineTo(toPos[0] + xVec*this.arrowHeight - yVec*this.arrowWidth, toPos[1] + yVec*this.arrowHeight + xVec*this.arrowWidth);
				context.lineTo(toPos[0] + xVec*this.arrowHeight + yVec*this.arrowWidth, toPos[1] + yVec*this.arrowHeight - xVec*this.arrowWidth);
				context.lineTo(toPos[0], toPos[1]);
				context.closePath();
				context.stroke();
				context.fill();
			}

		}
		   
	   }
	   
	   
	   this.draw = function(ctx)
	   {
		   if (!this.addedToScene)
		   {
			   return;   
		   }
		   ctx.globalAlpha = this.alpha;

			if (this.highlighted)
				this.drawArrow(this.highlightDiff, "#FF0000", ctx);
			this.drawArrow(1, this.edgeColor, ctx);
	   }
	   
	   
}
	


function UndoConnect(from, to, createConnection, edgeColor, isDirected, cv, lab, anch)
{
	this.fromID = from;
	this.toID = to;
	this.connect = createConnection;
	this.color = edgeColor;
	this.directed = isDirected;
	this.curve = cv;
	this.edgeLabel = lab;
	this.anchorPoint = anch;
}


UndoConnect.prototype.undoInitialStep = function(world)
{
	if (this.connect)
	{
		world.connectEdge(this.fromID, this.toID, this.color, this.curve, this.directed, this.edgeLabel,this.anchorPoint);
	}
	else
	{
		world.disconnect(this.fromID,this.toID);
	}
}


UndoConnect.prototype.addUndoAnimation = function(animationList)
{
	return false;
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Object Manager
//
// Manage all of our animated objects.  Control any animated object should occur through
// this interface (not language enforced, because enforcing such things in Javascript is 
// problematic.)
//
// This class is only accessed through:
//
//  AnimationMain
//  Undo objects (which are themselves controlled by AnimationMain


// TODO: 
//       1.  Add proper throws for all error conditions (perhaps guarded by
//           an assert-like structure that can be turned off for production?)
//       2.  Refactor this code so that it uses the same object syntax (with 
//           prototypes) as te rest of the code.  (low priority)
function ObjectManager(canvas)
{
	this.Nodes = [];
	this.Edges = [];
	this.BackEdges = [];
	this.activeLayers = [];
	this.activeLayers[0] = true;
	this.ctx = canvas.getContext('2d');
	this.framenum = 0;
	this.width = 0;
	this.height = 0;
	this.statusReport = new AnimatedLabel(-1, "XXX", false, 30, this.ctx);
	this.statusReport.x = 30;
	
	this.draw = function()
	{
		this.framenum++;
		if (this.framenum > 1000)
			this.framenum = 0;
		
		this.ctx.clearRect(0,0,this.width,this.height); // clear canvas
		this.statusReport.y = this.height - 15;
		
		var i;
		var j;
		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && !this.Nodes[i].highlighted && this.Nodes[i].addedToScene && !this.Nodes[i].alwaysOnTop)
			{
				this.Nodes[i].draw(this.ctx);	
			}
		}
		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && (this.Nodes[i].highlighted && !this.Nodes[i].alwaysOnTop) && this.Nodes[i].addedToScene)
			{
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene)
			{
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);	
			}
		}
		
		
		for (i = 0; i < this.Edges.length; i++)
		{
			if (this.Edges[i] != null)
			{
				for (j = 0; j < this.Edges[i].length; j++)
				{
					if (this.Edges[i][j].addedToScene)
					{
						this.Edges[i][j].pulseHighlight(this.framenum);	
						this.Edges[i][j].draw(this.ctx);	
					}
					
				}
				
			}
		}
		this.statusReport.draw(this.ctx);
		
	}
	
	this.update = function ()
	{
		
		
	}
	
	
	this.setLayers = function(shown,layers)
	{
		for (var i = 0; i < layers.length; i++)
		{
			this.activeLayers[layers[i]] = shown;
		}
		this.resetLayers();
		
	}

	
	this.addHighlightCircleObject = function(objectID, objectColor, radius)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
  	            throw "addHighlightCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
		}
		var newNode = new HighlightCircle(objectID, objectColor, radius)
		this.Nodes[objectID] = newNode;		
	}
	
	this.setEdgeAlpha = function(fromID, toID, alphaVal)
	{
		var oldAlpha = 1.0; 
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldAlpha = this.Edges[fromID][i].alpha
					this.Edges[fromID][i].alpha = alphaVal;		
				}
			}
		}	
		return oldAlpha;
		
	}
	
	this.setAlpha = function(nodeID, alphaVal) 
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setAlpha(alphaVal);
		}
	}
	
	this.getAlpha = function(nodeID)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			return this.Nodes[nodeID].getAlpha();
		}
		else
		{
			return -1;
		}
	}
	
	this.getTextColor = function(nodeID, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			return this.Nodes[nodeID].getTextColor(index);
		}
		else
		{
			return "#000000";
		}
			
	}
	
	this.setTextColor = function(nodeID, color, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setTextColor(color, index);
		}
	}


	this.setHighlightIndex = function(nodeID, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setHighlightIndex(index);
		}
	}


	
	
	
	this.setAllLayers = function(layers)
	{
		this.activeLayers = [];
		for(var i = 0; i < layers.length; i++)
		{
			this.activeLayers[layers[i]] = true;
		}
		this.resetLayers();
	}
	
	this.resetLayers = function()
	{
		var i
		for (i = 0; i <this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && this.Nodes[i] != undefined)
			{
				this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] == true;
			}
		}
		for (i = this.Edges.length - 1; i >= 0; i--)
		{
		    if (this.Edges[i] != null && this.Edges[i] != undefined)
			{
				for (var j = 0; j < this.Edges[i].length; j++)
				{
					if (this.Edges[i][j] != null && this.Edges[i][j] != undefined)
					{
							this.Edges[i][j].addedToScene =
								this.activeLayers[this.Edges[i][j].Node1.layer] == true &&
								this.activeLayers[this.Edges[i][j].Node2.layer] == true;
					}
					
				}
				
			}
			
		}
		
	}
	
	
	
	this.setLayer = function(objectID, layer)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].layer = layer;
			if (this.activeLayers[layer])
			{
				this.Nodes[objectID].addedToScene = true;
			}
			else
			{
				this.Nodes[objectID].addedToScene = false;
			}
			if (this.Edges[objectID] != null && this.Edges[objectID] != undefined)
			{
				for (var i = 0; i < this.Edges[objectID].length; i++)
				{
					var nextEdge = this.Edges[objectID][i];
					if (nextEdge != null && nextEdge != undefined)
					{
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) &&
												(nextEdge.Node2.addedToScene));
						
					}
				}
			}
			if (this.BackEdges[objectID] != null && this.BackEdges[objectID] != undefined)
			{
				for (var i = 0; i < this.BackEdges[objectID].length; i++)
				{
					var nextEdge = this.BackEdges[objectID][i];
					if (nextEdge != null && nextEdge != undefined)
					{
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) &&
												 (nextEdge.Node2.addedToScene));
						
					}
				}
			}			
		}
	}
	
	this.clearAllObjects = function()
	{
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
	}
	
	
	this.setForegroundColor = function(objectID, color)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setForegroundColor(color);
			
		}
	}
	
	this.setBackgroundColor = function(objectID, color)
	{
		if (this.Nodes[objectID] != null)
		{
			this.Nodes[objectID].setBackgroundColor(color);
			
		}
	}
	
	this.setHighlight = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHighlight(val);
	}
	
	
	this.getHighlight = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlight();
	}


	this.getHighlightIndex = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlightIndex();
	}
	
	this.setWidth = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setWidth(val);
	}
	
	this.setHeight = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHeight(val);
	}
	
	
	this.getHeight = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getHeight();
	}
	
	this.getWidth = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getWidth();
	}
	
	this.backgroundColor = function(objectID)
	{
		if (this.Nodes[objectID] != null)
		{
			return this.Nodes[objectID].backgroundColor;
		}
		else
		{
			return '#000000';
		}
	}
	
	this.foregroundColor = function(objectID)
	{
		if (this.Nodes[objectID] != null)
		{
			return this.Nodes[objectID].foregroundColor;
		}
		else
		{
			return '#000000';
		}
	}
	
			
	this.disconnect = function(objectIDfrom,objectIDto)
	{
		var undo = null;
		var i;
		if (this.Edges[objectIDfrom] != null)
		{
			var len = this.Edges[objectIDfrom].length;
			for (i = len - 1; i >= 0; i--)
			{
				if (this.Edges[objectIDfrom][i] != null && this.Edges[objectIDfrom][i].Node2 == this.Nodes[objectIDto])
				{
					var deleted = this.Edges[objectIDfrom][i];
					undo = deleted.createUndoDisconnect();
					this.Edges[objectIDfrom][i] = this.Edges[objectIDfrom][len - 1];
					len -= 1;
					this.Edges[objectIDfrom].pop();
				}
			}
		}
		if (this.BackEdges[objectIDto] != null)
		{
			len = this.BackEdges[objectIDto].length;
			for (i = len - 1; i >= 0; i--)
			{
				if (this.BackEdges[objectIDto][i] != null && this.BackEdges[objectIDto][i].Node1 == this.Nodes[objectIDfrom])
				{
					deleted = this.BackEdges[objectIDto][i];
					// Note:  Don't need to remove this child, did it above on the regular edge
					this.BackEdges[objectIDto][i] = this.BackEdges[objectIDto][len - 1];
					len -= 1;
					this.BackEdges[objectIDto].pop();
				}
			}
		}
		return undo;
	}
	
	this.deleteIncident = function(objectID)
	{
		var undoStack = [];

		if (this.Edges[objectID] != null)
		{
			var len = this.Edges[objectID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				var deleted = this.Edges[objectID][i];
				var node2ID = deleted.Node2.identifier();
				undoStack.push(deleted.createUndoDisconnect());
				
				var len2 = this.BackEdges[node2ID].length;
				for (var j = len2 - 1; j >=0; j--)
				{
					if (this.BackEdges[node2ID][j] == deleted)
					{
						this.BackEdges[node2ID][j] = this.BackEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.BackEdges[node2ID].pop();
					}
				}
			}
			this.Edges[objectID] = null;
		}
		if (this.BackEdges[objectID] != null)
		{
			len = this.BackEdges[objectID].length;
			for (i = len - 1; i >= 0; i--)
			{
				deleted = this.BackEdges[objectID][i];
				var node1ID = deleted.Node1.identifier();
				undoStack.push(deleted.createUndoDisconnect());

				len2 = this.Edges[node1ID].length;
				for (j = len2 - 1; j >=0; j--)
				{
					if (this.Edges[node1ID][j] == deleted)
					{
						this.Edges[node1ID][j] = this.Edges[node1ID][len2 - 1];
						len2 -= 1;
						this.Edges[node1ID].pop();
					}
				}
			}
			this.BackEdges[objectID] = null;
		}
		return undoStack;
	}
	
	
	this.removeObject = function(ObjectID)
	{
		var OldObject = this.Nodes[ObjectID];
		if (ObjectID == this.Nodes.length - 1)
		{
			this.Nodes.pop();
		}
		else
		{
			this.Nodes[ObjectID] = null;
		}
	}
	
	this.getObject = function(objectID)
	{
		if (this.Nodes[objectID] == null || this.Nodes[objectID] == undefined)
		{
			throw "getObject:Object with ID (" + String(objectID) + ") does not exist"
		}
		return this.Nodes[objectID];
		
	}
	
	
	this.addCircleObject = function (objectID, objectLabel)
	{
			if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
			{
				throw "addCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
			}
			var newNode = new AnimatedCircle(objectID, objectLabel);
			this.Nodes[objectID] = newNode;
	}
	
	this.getNodeX = function(nodeID)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting x position of an object that does not exit";
		}	
		return this.Nodes[nodeID].x;
	}
	
	this.getTextWidth = function(text)
	{
		// TODO:  Need to make fonts more flexible, and less hardwired.
		this.ctx.font = '10px sans-serif';
		if (text==undefined)
		{
			w = 3;
		}
		var strList = text.split("\n");
		var width = 0;
		if (strList.length == 1)
		{
 			width = this.ctx.measureText(text).width;
		}
		else
		{
			for (var i = 0; i < strList.length; i++)
			{
				width = Math.max(width, this.ctx.measureText(strList[i]).width);
			}		
		}
		
		return width;
	}
	
	this.setText = function(nodeID, text, index)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			return;
			throw "setting text of an object that does not exit";
		}			
		this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));
		
	}
	
	this.getText = function(nodeID, index)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting text of an object that does not exit";
		}			
		return this.Nodes[nodeID].getText(index);
		
	}
	
	this.getNodeY = function(nodeID)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting y position of an object that does not exit";
		}	
		return this.Nodes[nodeID].y;
	}

	
	this.connectEdge = function(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint)
	{
		var fromObj = this.Nodes[objectIDfrom];
		var toObj = this.Nodes[objectIDto];
		if (fromObj == null || toObj == null)
		{
			throw "Tried to connect two nodes, one didn't exist!";
		}
		var l = new Line(fromObj,toObj, color, curve, directed, lab, connectionPoint);
		if (this.Edges[objectIDfrom] == null || this.Edges[objectIDfrom] == undefined)
		{
			this.Edges[objectIDfrom] = [];
		}
		if (this.BackEdges[objectIDto] == null || this.BackEdges[objectIDto] == undefined)
		{
			this.BackEdges[objectIDto] = [];
		}
		l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.Edges[objectIDfrom].push(l);
		this.BackEdges[objectIDto].push(l);
		
	}
	
	
	this.setNull = function(objectID, nullVal)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setNull(nullVal);
			
		}
	}
	
	this.getNull = function(objectID)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			return this.Nodes[objectID].getNull();
		}
		return false;  // TODO:  Error here?
	}
	
	
	
	this.setEdgeColor = function(fromID, toID, color) // returns old color
	{
		var oldColor ="#000000";
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldColor = this.Edges[fromID][i].color();
					this.Edges[fromID][i].setColor(color);		
				}
			}
		}	
		return oldColor;
	}		
	
	this.alignTop = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignTop(this.Nodes[id2]);
	}
	
	this.alignLeft = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignLeft(this.Nodes[id2]);
	}
	
	this.alignRight = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignRight(this.Nodes[id2]);
	}
	


	this.getAlignRightPos = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
	        return this.Nodes[id1].getAlignRightPos(this.Nodes[id2]);
	}

	this.getAlignLeftPos = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
	        return this.Nodes[id1].getAlignLeftPos(this.Nodes[id2]);
	}
	


	this.alignBottom = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);			
		}
		this.Nodes[id1].alignBottom(this.Nodes[id2]);
	}
	
	
	this.setEdgeHighlight = function(fromID, toID, val) // returns old color
	{
		var oldHighlight = false;
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null && 
					this.Edges[fromID][i] != undefined && 
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldHighlight = this.Edges[fromID][i].highlighted;
					this.Edges[fromID][i].setHighlight(val);		
				}
			}
		}
		return oldHighlight;
	}
	this.addLabelObject = function(objectID, objectLabel, centering)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			throw new Error("addLabelObject: Object Already Exists!");
		}
		
		var newLabel = new AnimatedLabel(objectID, objectLabel, centering, this.getTextWidth(objectLabel),this.ctx);
		this.Nodes[objectID] = newLabel;
	}
	
		
	this.addLinkedListObject = function(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels, backgroundColor, foregroundColor)
	{
		if (this.Nodes[objectID] != null)
		{
			throw new Error("addLinkedListObject:Object with same ID already Exists!");
			return;
		}
		var newNode  = new AnimatedLinkedList(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}
	
	 
	this.getNumElements = function(objectID)
	{
		return this.Nodes[objectID].getNumElements();
	}
	 
	
	this.setNumElements = function(objectID, numElems)
	{
		this.Nodes[objectID].setNumElements(numElems);
	}
	this.addBTreeNode = function(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor)
	 {
		 backgroundColor = (backgroundColor == undefined) ? "#FFFFFF" : backgroundColor;
		 foregroundColor = (foregroundColor == undefined) ? "#FFFFFF" : foregroundColor;
		 
		 if (this.Nodes[objectID] != null && Nodes[objectID] != undefined)
		 {
			 throw "addBTreeNode:Object with same ID already Exists!";
		 }

		 var newNode = new AnimatedBTreeNode(objectID,widthPerElem, height, numElems, backgroundColor, foregroundColor);
		 this.Nodes[objectID] = newNode;
	 }
	
	 this.addRectangleObject = function(objectID,nodeLabel, width, height, xJustify , yJustify , backgroundColor, foregroundColor)
	 {
		 if (this.Nodes[objectID] != null || this.Nodes[objectID] != undefined)
		 {
			 throw new Error("addRectangleObject:Object with same ID already Exists!");
		 }
		 var newNode = new AnimatedRectangle(objectID, nodeLabel, width, height, xJustify, yJustify, backgroundColor, foregroundColor);
		 this.Nodes[objectID] = newNode;
		 
	 }
	 
	 
	
	
	this.setNodePosition = function(nodeID, newX, newY)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		if (newX == undefined || newY == undefined)
		{
			
			return;
		}
		this.Nodes[nodeID].x = newX;
		this.Nodes[nodeID].y = newY;
		/* Don't need to dirty anything, since we repaint everything every frame
		 (TODO:  Revisit if we do conditional redraws)
		*/
		
	}
	
}








	

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Base "class": UndoBlock

function UndoBlock()
{
	
}

UndoBlock.prototype.addUndoAnimation = function(animationList)
{
	return false;
}

UndoBlock.prototype.undoInitialStep = function(world) 
{
	
}

////////////////////////////////////////////////////////////
// UndoMove
////////////////////////////////////////////////////////////

function UndoMove(id, fmX, fmy, tx, ty)
{
	this.objectID = id;
	this.fromX = fmX;
	this.fromY = fmy;
	this.toX = tx;
	this.toY = ty;
}


UndoMove.inheritFrom(UndoBlock);

UndoMove.prototype.addUndoAnimation = function (animationList)
{
	var nextAnim = new SingleAnimation(this.objectID, this.fromX, this.fromY, this.toX, this.toY);
	animationList.push(nextAnim);
	return true;
}

////////////////////////////////////////////////////////////
// UndoCreate
////////////////////////////////////////////////////////////

function UndoCreate(id)
{
	this.objectID = id;
}

UndoCreate.inheritFrom(UndoBlock);

	
UndoCreate.prototype.undoInitialStep = function(world)
{
			world.removeObject(this.objectID);
}

////////////////////////////////////////////////////////////
// UndoHighlight
////////////////////////////////////////////////////////////

function UndoHighlight(id, val)
{
	this.objectID = id;
	this.highlightValue = val;
}

UndoHighlight.inheritFrom(UndoBlock);

UndoHighlight.prototype.undoInitialStep = function(world)
{
	world.setHighlight(this.objectID, this.highlightValue);
}


////////////////////////////////////////////////////////////
// UndoSetHeight
////////////////////////////////////////////////////////////

function UndoSetHeight(id, val)
{
	this.objectID = id;
	this.height = val;
}

UndoSetHeight.inheritFrom(UndoBlock);

UndoSetHeight.prototype.undoInitialStep = function(world)
{
	world.setHeight(this.objectID, this.height);
}

////////////////////////////////////////////////////////////
// UndoSetWidth
////////////////////////////////////////////////////////////

function UndoSetWidth(id, val)
{
	this.objectID = id;
	this.width = val;
}

UndoSetWidth.inheritFrom(UndoBlock);

UndoSetWidth.prototype.undoInitialStep = function(world)
{
	world.setWidth(this.objectID, this.width);
}


////////////////////////////////////////////////////////////
// UndoSetNumElements
////////////////////////////////////////////////////////////
function UndoSetNumElements(obj, newNumElems)
{
	this.objectID = obj.objectID;
	this.sizeBeforeChange = obj.getNumElements();
	this.sizeAfterChange = newNumElems;
	if (this.sizeBeforeChange > this.sizeAfterChange)
	{
		this.labels = new Array(this.sizeBeforeChange - this.sizeAfterChange);
		this.colors = new Array(this.sizeBeforeChange - this.sizeAfterChange);
		for (var i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++)
		{
			this.labels[i] = obj.getText(i+this.sizeAfterChange);
			this.colors[i] = obj.getTextColor(i+this.sizeAfterChange);
		}
		
	}	
}

UndoSetNumElements.inheritFrom(UndoBlock);


UndoSetNumElements.prototype.undoInitialStep = function(world)
{
	world.setNumElements(this.objectID, this.sizeBeforeChange);
	if (this.sizeBeforeChange > this.sizeAfterChange)
	{
		for (var i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++)
		{
			world.setText(this.objectID, this.labels[i], i+this.sizeAfterChange);
			world.setTextColor(this.objectID, this.colors[i], i+this.sizeAfterChange);
		}
	}
}


////////////////////////////////////////////////////////////
// UndoSetAlpha
////////////////////////////////////////////////////////////

function UndoSetAlpha(id, alph)
{
	this.objectID = id;
	this.alphaVal = alph;
}

UndoSetAlpha.inheritFrom(UndoBlock);

UndoSetAlpha.prototype.undoInitialStep = function(world) 
{
	world.setAlpha(this.objectID, this.alphaVal);
}

////////////////////////////////////////////////////////////
// UndoSetNull
////////////////////////////////////////////////////////////

function UndoSetNull(id, nv)
{
	this.objectID = id;
	this.nullVal = nv;
}

UndoSetNull.inheritFrom(UndoBlock);

UndoSetNull.prototype.undoInitialStep = function(world) 
{
	world.setNull(this.objectID, this.nullVal);
}

////////////////////////////////////////////////////////////
// UndoSetForegroundColor
////////////////////////////////////////////////////////////

function UndoSetForegroundColor(id, color)
{
	this.objectID = id;
	this.color = color;
}

UndoSetForegroundColor.inheritFrom(UndoBlock);

UndoSetForegroundColor.prototype.undoInitialStep =  function (world)
{
	world.setForegroundColor(this.objectID, this.color);
}

////////////////////////////////////////////////////////////
// UndoSetBackgroundColor
////////////////////////////////////////////////////////////

function UndoSetBackgroundColor(id, color)
{
	this.objectID = id;
	this.color = color;
}

UndoSetBackgroundColor.inheritFrom(UndoBlock);

UndoSetBackgroundColor.prototype.undoInitialStep =  function (world)
{
	world.setBackgroundColor(this.objectID, this.color);
}



////////////////////////////////////////////////////////////
// UndoSetHighlightIndex
////////////////////////////////////////////////////////////

function UndoSetHighlightIndex(id, index)
{
	this.objectID = id;
	this.index = index;
}

UndoSetHighlightIndex.inheritFrom(UndoBlock);

UndoSetHighlightIndex.prototype.undoInitialStep =  function (world)
{
	world.setHighlightIndex(this.objectID, this.index);
}



////////////////////////////////////////////////////////////
// UndoSetText
////////////////////////////////////////////////////////////



function UndoSetText(id, str, index)
{
	this.objectID = id;
	this.newText = str;
	this.labelIndex = index;
}

UndoSetText.inheritFrom(UndoBlock);

UndoSetText.prototype.undoInitialStep = function(world)
{
	world.setText(this.objectID, this.newText, this.labelIndex);
}
////////////////////////////////////////////////////////////
// UndoSetTextColor
////////////////////////////////////////////////////////////



function UndoSetTextColor(id, color, index)
{
	this.objectID = id;
	this.color = color;
	this.index = index;
}

UndoSetTextColor.inheritFrom(UndoBlock);

UndoSetTextColor.prototype.undoInitialStep = function(world)
{
	world.setTextColor(this.objectID, this.color, this.index);
}



////////////////////////////////////////////////////////////
// UndoHighlightEdge
////////////////////////////////////////////////////////////

function UndoHighlightEdge(from, to, val)
{
	this.fromID = from;
	this.toID = to;
	this.highlightValue = val;
}

UndoHighlightEdge.inheritFrom(UndoBlock);

UndoHighlightEdge.prototype.undoInitialStep = function(world)
{
	world.setEdgeHighlight(this.fromID, this.toID, this.highlightValue);
}


////////////////////////////////////////////////////////////
// UndoSetEdgeColor
////////////////////////////////////////////////////////////

function UndoSetEdgeColor(from, to, oldColor)
{
	this.fromID = from;
	this.toID = to;
	this.color = oldColor;
}

UndoSetEdgeColor.inheritFrom(UndoBlock);

UndoSetEdgeColor.prototype.undoInitialStep = function(world)
{
	world.setEdgeColor(this.fromID, this.toID, this.color);
}


////////////////////////////////////////////////////////////
// UndoSetEdgeAlpha
////////////////////////////////////////////////////////////

function UndoSetEdgeAlpha(from, to, oldAplha)
{
	this.fromID = from;
	this.toID = to;
	this.alpha  = oldAplha;
}

UndoSetEdgeAlpha.inheritFrom(UndoBlock);

UndoSetEdgeAlpha.prototype.undoInitialStep = function(world)
{
	world.setEdgeAlpha(this.fromID, this.toID, this.alpha);
}

////////////////////////////////////////////////////////////
// UndoSetPosition
////////////////////////////////////////////////////////////

function UndoSetPosition(id, x, y)
{
	this.objectID = id;
	this.x = x; 
	this.y = y;
}

UndoSetPosition.inheritFrom(UndoBlock);


UndoSetPosition.prototype.undoInitialStep = function(world)
{
	world.setNodePosition(this.objectID, this.x, this.y);
}



// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function Algorithm(am)
{
	
}



Algorithm.prototype.setCodeAlpha = function(code, newAlpha)
{
   var i,j;
   for (i = 0; i < code.length; i++)
       for (j = 0; j < code[i].length; j++) {
          this.cmd("SetAlpha", code[i][j], newAlpha);
       }
}


Algorithm.prototype.addCodeToCanvasBase  = function(code, start_x, start_y, line_height, standard_color, layer)
{
        layer = typeof layer !== 'undefined' ? layer : 0;
	var codeID = Array(code.length);
	var i, j;
	for (i = 0; i < code.length; i++)
	{
		codeID[i] = new Array(code[i].length);
		for (j = 0; j < code[i].length; j++)
		{
			codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", codeID[i][j], code[i][j], start_x, start_y + i * line_height, 0);
			this.cmd("SetForegroundColor", codeID[i][j], standard_color);
			this.cmd("SetLayer", codeID[i][j], layer);
			if (j > 0)
			{
				this.cmd("AlignRight", codeID[i][j], codeID[i][j-1]);
			}
		}
		
		
	}
	return codeID;
}


Algorithm.prototype.init = function(am, w, h)
{
	this.animationManager = am;
	am.addListener("AnimationStarted", this, this.disableUI);
	am.addListener("AnimationEnded", this, this.enableUI);
	am.addListener("AnimationUndo", this, this.undo);
	this.canvasWidth = w;
	this.canvasHeight = h;
	
	this.actionHistory = [];
	this.recordAnimation = true;
	this.commands = []
}


// Overload in subclass
Algorithm.prototype.sizeChanged = function(newWidth, newHeight)
{
	
}


		
Algorithm.prototype.implementAction = function(funct, val)
{
	var nxt = [funct, val];			
	this.actionHistory.push(nxt);
	var retVal = funct(val);
	this.animationManager.StartNewAnimation(retVal);			
}
		
		
Algorithm.prototype.isAllDigits = function(str)
{
	for (var i = str.length - 1; i >= 0; i--)
	{
		if (str.charAt(i) < "0" || str.charAt(i) > "9")
		{
			return false;

		}
	}
	return true;
}
		
		
Algorithm.prototype.normalizeNumber = function(input, maxLen)
{
	if (!this.isAllDigits(input) || input == "")
	{
		return input;
	}
	else
	{
		return ("OOO0000" +input).substr(-maxLen, maxLen);
	}
}
		
Algorithm.prototype.disableUI = function(event)
{
	// to be overridden in base class
}

Algorithm.prototype.enableUI = function(event)
{
	// to be overridden in base class
}



function controlKey(keyASCII)
{
		return keyASCII == 8 || keyASCII == 9 || keyASCII == 37 || keyASCII == 38 ||
	keyASCII == 39 || keyASCII == 40 || keyASCII == 46;
}



Algorithm.prototype.returnSubmitFloat = function(field, funct, maxsize)
{
	if (maxsize != undefined)
	{
		field.size = maxsize;
	}
	return function(event)
	{
		var keyASCII = 0;
		if(window.event) // IE
		{
			keyASCII = event.keyCode
		}
		else if (event.which) // Netscape/Firefox/Opera
		{
			keyASCII = event.which
		} 
		// Submit on return
		if (keyASCII == 13)
		{
			funct();
		}
		// Control keys (arrows, del, etc) are always OK
		else if (controlKey(keyASCII))
		{
			return;
		}
		// - (minus sign) only OK at beginning of number
		//  (For now we will allow anywhere -- hard to see where the beginning of the
		//   number is ...)
		//else if (keyASCII == 109 && field.value.length  == 0)
		else if (keyASCII == 109)
		{
			return;
		}
		// Digis are OK if we have enough space
		else if ((maxsize != undefined || field.value.length < maxsize) &&
				 (keyASCII >= 48 && keyASCII <= 57))
		{
			return;
		}
		// . (Decimal point) is OK if we haven't had one yet, and there is space
		else if ((maxsize != undefined || field.value.length < maxsize) &&
				 (keyASCII == 190) && field.value.indexOf(".") == -1)
				 
		{
			return;
		}
		// Nothing else is OK
		else 		
		{
			return false;
		}
		
	}
}


Algorithm.prototype.returnSubmit = function(field, funct, maxsize, intOnly)
{
	if (maxsize != undefined)
	{
	    field.size = maxsize;
	}
	return function(event)
	{
		var keyASCII = 0;
		if(window.event) // IE
		{
			keyASCII = event.keyCode
		}
		else if (event.which) // Netscape/Firefox/Opera
		{
			keyASCII = event.which
		} 

		if (keyASCII == 13 && funct !== null)
		{
			funct();
		}
                else if (keyASCII == 190 || keyASCII == 59 || keyASCII == 173 || keyASCII == 189)
		{ 
			return false;	
		    
		}
		else if ((maxsize != undefined && field.value.length >= maxsize) ||
				 intOnly && (keyASCII < 48 || keyASCII > 57))
		{
			if (!controlKey(keyASCII))
				return false;
		}
		
	}
	
}

Algorithm.prototype.addReturnSubmit = function(field, action)
{
	field.onkeydown = this.returnSubmit(field, action, 4, false);	
}

Algorithm.prototype.reset = function()
{
	// to be overriden in base class
	// (Throw exception here?)
}
		
Algorithm.prototype.undo = function(event)
{
	// Remvoe the last action (the one that we are going to undo)
	this.actionHistory.pop();
	// Clear out our data structure.  Be sure to implement reset in
	//   every AlgorithmAnimation subclass!
	this.reset();
	//  Redo all actions from the beginning, throwing out the animation
	//  commands (the animation manager will update the animation on its own).
	//  Note that if you do something non-deterministic, you might cause problems!
	//  Be sure if you do anything non-deterministic (that is, calls to a random
	//  number generator) you clear out the undo stack here and in the animation
	//  manager.
	//
	//  If this seems horribly inefficient -- it is! However, it seems to work well
	//  in practice, and you get undo for free for all algorithms, which is a non-trivial
	//  gain.
	var len = this.actionHistory.length;
	this.recordAnimation = false;
	for (var i = 0; i < len; i++)
	{
		this.actionHistory[i][0](this.actionHistory[i][1]);
	}
	this.recordAnimation = true;
}


Algorithm.prototype.clearHistory = function()
{
	this.actionHistory = [];
}
		
		// Helper method to add text input with nice border.
		//  AS3 probably has a built-in way to do this.   Replace when found.
		

		// Helper method to create a command string from a bunch of arguments
Algorithm.prototype.cmd = function()
{
	if (this.recordAnimation)
	{
		var command = arguments[0];
		for(i = 1; i < arguments.length; i++)
		{
			command = command + "<;>" + String(arguments[i]);
		}
		this.commands.push(command);
	}
	
}

// Algorithm bar methods //////////////////

Algorithm.prototype.addLabelToAlgorithmBar = function(labelName)
{
    var element = document.createTextNode(labelName);
	
	var tableEntry = document.createElement("td");	
	tableEntry.appendChild(element);
	
    //Append the element in page (in span).
    var controlBar = this.animationManager.algorithmControlBar;
	if(controlBar)
		controlBar.appendChild(tableEntry);

	return element;
}

// TODO:  Make this stackable like radio butons
//        (keep backwards compatible, thought)
Algorithm.prototype.addCheckboxToAlgorithmBar = function(boxLabel)
{	
	var element = document.createElement("input");

    element.setAttribute("type", "checkbox");
    element.setAttribute("value", boxLabel);
	
    var label = document.createTextNode(boxLabel);
	
	var tableEntry = document.createElement("td");	
	tableEntry.appendChild(element);
	tableEntry.appendChild(label);
	
    //Append the element in page (in span).
    var controlBar = this.animationManager.algorithmControlBar;
	if(controlBar)
		controlBar.appendChild(tableEntry);

	return element;
}

Algorithm.prototype.addRadioButtonGroupToAlgorithmBar = function(buttonNames, groupName)
{
	var buttonList = [];
	var newTable = document.createElement("table");
		
	for (var i = 0; i < buttonNames.length; i++)
	{
		var midLevel = document.createElement("tr");
		var bottomLevel = document.createElement("td");
		
		var button = document.createElement("input");
		button.setAttribute("type", "radio");
		button.setAttribute("name", groupName);
		button.setAttribute("value", buttonNames[i]);
		bottomLevel.appendChild(button);
		midLevel.appendChild(bottomLevel);
		var txtNode = document.createTextNode(" " + buttonNames[i]); 
		bottomLevel.appendChild(txtNode);
		newTable.appendChild(midLevel);	
		buttonList.push(button);
	}
	
	var topLevelTableEntry = document.createElement("td");
	topLevelTableEntry.appendChild(newTable);
	
	var controlBar = this.animationManager.algorithmControlBar;
	if(controlBar)
		controlBar.appendChild(topLevelTableEntry);
	
	return buttonList
}


Algorithm.prototype.addControlToAlgorithmBar = function(type, name) {
	
    var element = document.createElement("input");
	
    element.setAttribute("type", type);
    element.setAttribute("value", name);
//    element.setAttribute("name", name);
	
	
	var tableEntry = document.createElement("td");
	
	tableEntry.appendChild(element);
	
    //Append the element in page (in span).
    var controlBar = this.animationManager.algorithmControlBar;
	if(controlBar)
		controlBar.appendChild(tableEntry);

	return element;
	
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function StackArray(am, w, h)
{
	this.init(am, w, h);
	
}
StackArray.inheritFrom(Algorithm);


StackArray.ARRAY_START_X = 100;
StackArray.ARRAY_START_Y = 200;
StackArray.ARRAY_ELEM_WIDTH = 50;
StackArray.ARRAY_ELEM_HEIGHT = 50;

StackArray.ARRRAY_ELEMS_PER_LINE = 15;
StackArray.ARRAY_LINE_SPACING = 130;

StackArray.TOP_POS_X = 180;
StackArray.TOP_POS_Y = 100;
StackArray.TOP_LABEL_X = 130;
StackArray.TOP_LABEL_Y =  100;

StackArray.PUSH_LABEL_X = 50;
StackArray.PUSH_LABEL_Y = 30;
StackArray.PUSH_ELEMENT_X = 120;
StackArray.PUSH_ELEMENT_Y = 30;

StackArray.SIZE = 30;


StackArray.prototype.init = function(am, w, h)
{
	StackArray.superclass.init.call(this, am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.setup();
	this.initialIndex = this.nextIndex;
}


StackArray.prototype.addControls =  function()
{
	this.controls = [];
	this.pushField = this.addControlToAlgorithmBar("Text", "");
	this.pushField.onkeydown = this.returnSubmit(this.pushField,  this.pushCallback.bind(this), 6);
	this.pushButton = this.addControlToAlgorithmBar("Button", "Push");
	this.pushButton.onclick = this.pushCallback.bind(this);
	this.controls.push(this.pushField);
	this.controls.push(this.pushButton);

	this.popButton = this.addControlToAlgorithmBar("Button", "Pop");
	this.popButton.onclick = this.popCallback.bind(this);
	this.controls.push(this.popButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear Stack");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
}

StackArray.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
StackArray.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


StackArray.prototype.setup = function()
{
	this.nextIndex = 0;
	
	this.arrayID = new Array(StackArray.SIZE);
	this.arrayLabelID = new Array(StackArray.SIZE);
	for (var i = 0; i < StackArray.SIZE; i++)
	{
		
		this.arrayID[i]= this.nextIndex++;
		this.arrayLabelID[i]= this.nextIndex++;
	}
	this.topID = this.nextIndex++;
	this.topLabelID = this.nextIndex++;
	
	this.arrayData = new Array(StackArray.SIZE);
	this.top = 0;
	this.leftoverLabelID = this.nextIndex++;
	this.commands = new Array();
	
	for (var i = 0; i < StackArray.SIZE; i++)
	{
		var xpos = (i  % StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_ELEM_WIDTH + StackArray.ARRAY_START_X;
		var ypos = Math.floor(i / StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_LINE_SPACING +  StackArray.ARRAY_START_Y;
		this.cmd("CreateRectangle", this.arrayID[i],"", StackArray.ARRAY_ELEM_WIDTH, StackArray.ARRAY_ELEM_HEIGHT,xpos, ypos);
		this.cmd("CreateLabel",this.arrayLabelID[i],  i,  xpos, ypos + StackArray.ARRAY_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", this.arrayLabelID[i], "#0000FF");
		
	}
	this.cmd("CreateLabel", this.topLabelID, "top", StackArray.TOP_LABEL_X, StackArray.TOP_LABEL_Y);
	this.cmd("CreateRectangle", this.topID, 0, StackArray.ARRAY_ELEM_WIDTH, StackArray.ARRAY_ELEM_HEIGHT, StackArray.TOP_POS_X, StackArray.TOP_POS_Y);
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", StackArray.PUSH_LABEL_X, StackArray.PUSH_LABEL_Y);
	
	this.highlight1ID = this.nextIndex++;
	this.highlight2ID = this.nextIndex++;

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

		
		
StackArray.prototype.reset = function()
{
	this.top = 0;
	this.nextIndex = this.initialIndex;

}
		
		
StackArray.prototype.pushCallback = function(event)
{
	if (this.top < StackArray.SIZE && this.pushField.value != "")
	{
		var pushVal = this.pushField.value;
		this.pushField.value = ""
		this.implementAction(this.push.bind(this), pushVal);
	}
}
		
		
StackArray.prototype.popCallback = function(event)
{
	if (this.top > 0)
	{
		this.implementAction(this.pop.bind(this), "");
	}
}
		

StackArray.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearData.bind(this), "");
}

StackArray.prototype.clearData = function(ignored)
{
	this.commands = new Array();
	this.clearAll();
	return this.commands;			
}
		

StackArray.prototype.push = function(elemToPush)
{
	this.commands = new Array();
	
	var labPushID = this.nextIndex++;
	var labPushValID = this.nextIndex++;
	this.arrayData[this.top] = elemToPush;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLabel", labPushID, "Pushing Value: ", StackArray.PUSH_LABEL_X, StackArray.PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPushValID,elemToPush, StackArray.PUSH_ELEMENT_X, StackArray.PUSH_ELEMENT_Y);
	
	this.cmd("Step");			
	this.cmd("CreateHighlightCircle", this.highlight1ID, "#0000FF",  StackArray.TOP_POS_X, StackArray.TOP_POS_Y);
	this.cmd("Step");
	
	var xpos = (this.top  % StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_ELEM_WIDTH + StackArray.ARRAY_START_X;
	var ypos = Math.floor(this.top / StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_LINE_SPACING +  StackArray.ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + StackArray.ARRAY_ELEM_HEIGHT); 				
	this.cmd("Step");
	
	this.cmd("Move", labPushValID, xpos, ypos);
	this.cmd("Step");
	
	this.cmd("Settext", this.arrayID[this.top], elemToPush);
	this.cmd("Delete", labPushValID);
	
	this.cmd("Delete", this.highlight1ID);
	
	this.cmd("SetHighlight", this.topID, 1);
	this.cmd("Step");
	this.top = this.top + 1;
	this.cmd("SetText", this.topID, this.top)
	this.cmd("Delete", labPushID);
	this.cmd("Step");
	this.cmd("SetHighlight", this.topID, 0);
	
	return this.commands;
}

StackArray.prototype.pop = function(ignored)
{
	this.commands = new Array();
	
	var labPopID = this.nextIndex++;
	var labPopValID = this.nextIndex++;
	
	this.cmd("SetText", this.leftoverLabelID, "");

	
	this.cmd("CreateLabel", labPopID, "Popped Value: ", StackArray.PUSH_LABEL_X, StackArray.PUSH_LABEL_Y);
	
	
	this.cmd("SetHighlight", this.topID, 1);
	this.cmd("Step");
	this.top = this.top - 1;
	this.cmd("SetText", this.topID, this.top)
	this.cmd("Step");
	this.cmd("SetHighlight", this.topID, 0);
	
	this.cmd("CreateHighlightCircle", this.highlight1ID, "#0000FF",  StackArray.TOP_POS_X, StackArray.TOP_POS_Y);
	this.cmd("Step");
	
	var xpos = (this.top  % StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_ELEM_WIDTH + StackArray.ARRAY_START_X;
	var ypos = Math.floor(this.top / StackArray.ARRRAY_ELEMS_PER_LINE) * StackArray.ARRAY_LINE_SPACING +  StackArray.ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + StackArray.ARRAY_ELEM_HEIGHT); 				
	this.cmd("Step");
	
	this.cmd("CreateLabel", labPopValID,this.arrayData[this.top], xpos, ypos);
	this.cmd("Settext", this.arrayID[this.top], "");
	this.cmd("Move", labPopValID,  StackArray.PUSH_ELEMENT_X, StackArray.PUSH_ELEMENT_Y);
	this.cmd("Step");
	this.cmd("Delete", labPopValID)
	this.cmd("Delete", labPopID);
	this.cmd("Delete", this.highlight1ID);
	this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + this.arrayData[this.top]);


	
	return this.commands;
}



StackArray.prototype.clearAll = function()
{
	this.commands = new Array();
	for (var i = 0; i < this.top; i++)
	{
		this.cmd("SetText", this.arrayID[i], "");
	}
	this.top = 0;
	this.cmd("SetText", this.topID, "0");
	return this.commands;
			
}
	


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new StackArray(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function StackLL(am, w, h)
{
	this.init(am, w, h);
	
}
StackLL.inheritFrom(Algorithm);


StackLL.LINKED_LIST_START_X = 100;
StackLL.LINKED_LIST_START_Y = 200;
StackLL.LINKED_LIST_ELEM_WIDTH = 70;
StackLL.LINKED_LIST_ELEM_HEIGHT = 30;


StackLL.LINKED_LIST_INSERT_X = 250;
StackLL.LINKED_LIST_INSERT_Y = 50;

StackLL.LINKED_LIST_ELEMS_PER_LINE = 8;
StackLL.LINKED_LIST_ELEM_SPACING = 100;
StackLL.LINKED_LIST_LINE_SPACING = 100;

StackLL.TOP_POS_X = 180;
StackLL.TOP_POS_Y = 100;
StackLL.TOP_LABEL_X = 130;
StackLL.TOP_LABEL_Y =  100;

StackLL.TOP_ELEM_WIDTH = 30;
StackLL.TOP_ELEM_HEIGHT = 30;

StackLL.PUSH_LABEL_X = 50;
StackLL.PUSH_LABEL_Y = 30;
StackLL.PUSH_ELEMENT_X = 120;
StackLL.PUSH_ELEMENT_Y = 30;

StackLL.SIZE = 32;


StackLL.prototype.init = function(am, w, h)
{
	StackLL.superclass.init.call(this, am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.setup();
	this.initialIndex = this.nextIndex;
}


StackLL.prototype.addControls =  function()
{
	this.controls = [];
	this.pushField = this.addControlToAlgorithmBar("Text", "");
	this.pushField.onkeydown = this.returnSubmit(this.pushField,  this.pushCallback.bind(this), 6);
	this.pushButton = this.addControlToAlgorithmBar("Button", "Push");
	this.pushButton.onclick = this.pushCallback.bind(this);
	this.controls.push(this.pushField);
	this.controls.push(this.pushButton);

	this.popButton = this.addControlToAlgorithmBar("Button", "Pop");
	this.popButton.onclick = this.popCallback.bind(this);
	this.controls.push(this.popButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear Stack");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
}

StackLL.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
StackLL.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


StackLL.prototype.setup = function()
{
	
	this.linkedListElemID = new Array(StackLL.SIZE);
	for (var i = 0; i < StackLL.SIZE; i++)
	{
		
		this.linkedListElemID[i]= this.nextIndex++;
	}
	this.topID = this.nextIndex++;
	this.topLabelID = this.nextIndex++;
	
	this.arrayData = new Array(StackLL.SIZE);
	this.top = 0;
	this.leftoverLabelID = this.nextIndex++;
		
	this.cmd("CreateLabel", this.topLabelID, "Top", StackLL.TOP_LABEL_X, StackLL.TOP_LABEL_Y);
	this.cmd("CreateRectangle", this.topID, "", StackLL.TOP_ELEM_WIDTH, StackLL.TOP_ELEM_HEIGHT, StackLL.TOP_POS_X, StackLL.TOP_POS_Y);
	this.cmd("SetNull", this.topID, 1);
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", StackLL.PUSH_LABEL_X, StackLL.PUSH_LABEL_Y);
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();		
	
}

StackLL.prototype.resetLinkedListPositions = function()
{
	for (var i = this.top - 1; i >= 0; i--)
	{
		var nextX = (this.top - 1 - i) % StackLL.LINKED_LIST_ELEMS_PER_LINE * StackLL.LINKED_LIST_ELEM_SPACING + StackLL.LINKED_LIST_START_X;
		var nextY = Math.floor((this.top - 1 - i) / StackLL.LINKED_LIST_ELEMS_PER_LINE) * StackLL.LINKED_LIST_LINE_SPACING + StackLL.LINKED_LIST_START_Y;
		this.cmd("Move", this.linkedListElemID[i], nextX, nextY);				
	}
	
}


		
		
StackLL.prototype.reset = function()
{
	this.top = 0;
	this.nextIndex = this.initialIndex;

}
		
		
StackLL.prototype.pushCallback = function(event)
{
	if (this.top < StackLL.SIZE && this.pushField.value != "")
	{
		var pushVal = this.pushField.value;
		this.pushField.value = ""
		this.implementAction(this.push.bind(this), pushVal);
	}
}
		
		
StackLL.prototype.popCallback = function(event)
{
	if (this.top > 0)
	{
		this.implementAction(this.pop.bind(this), "");
	}
}
		

StackLL.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearAll.bind(this), "");
}

		

StackLL.prototype.push = function(elemToPush)
{
	this.commands = new Array();
	
	var labPushID = this.nextIndex++;
	var labPushValID = this.nextIndex++;
	this.arrayData[this.top] = elemToPush;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLinkedList",this.linkedListElemID[this.top], "" ,StackLL.LINKED_LIST_ELEM_WIDTH, StackLL.LINKED_LIST_ELEM_HEIGHT, 
		StackLL.LINKED_LIST_INSERT_X, StackLL.LINKED_LIST_INSERT_Y, 0.25, 0, 1, 1);
	
	this.cmd("CreateLabel", labPushID, "Pushing Value: ", StackLL.PUSH_LABEL_X, StackLL.PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPushValID,elemToPush, StackLL.PUSH_ELEMENT_X, StackLL.PUSH_ELEMENT_Y);
	
	this.cmd("Step");
	
	
	
	this.cmd("Move", labPushValID, StackLL.LINKED_LIST_INSERT_X, StackLL.LINKED_LIST_INSERT_Y);
	
	this.cmd("Step");
	this.cmd("SetText", this.linkedListElemID[this.top], elemToPush);
	this.cmd("Delete", labPushValID);
	
	if (this.top == 0)
	{
		this.cmd("SetNull", this.topID, 0);
		this.cmd("SetNull", this.linkedListElemID[this.top], 1);
	}
	else
	{
		this.cmd("Connect",  this.linkedListElemID[this.top], this.linkedListElemID[this.top - 1]);
		this.cmd("Step");
		this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top-1]);
	}
	this.cmd("Connect", this.topID, this.linkedListElemID[this.top]);
	
	this.cmd("Step");
	this.top = this.top + 1;
	this.resetLinkedListPositions();
	this.cmd("Delete", labPushID);
	this.cmd("Step");
	
	return this.commands;
}

StackLL.prototype.pop = function(ignored)
{
	this.commands = new Array();
	
	var labPopID = this.nextIndex++;
	var labPopValID = this.nextIndex++;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	
	this.cmd("CreateLabel", labPopID, "Popped Value: ", StackLL.PUSH_LABEL_X, StackLL.PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPopValID,this.arrayData[this.top - 1], StackLL.LINKED_LIST_START_X, StackLL.LINKED_LIST_START_Y);
	
	this.cmd("Move", labPopValID,  StackLL.PUSH_ELEMENT_X, StackLL.PUSH_ELEMENT_Y);
	this.cmd("Step");
	this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
	
	if (this.top == 1)
	{
		this.cmd("SetNull", this.topID, 1);
	}
	else
	{
		this.cmd("Connect", this.topID, this.linkedListElemID[this.top-2]);
		
	}
	this.cmd("Step");
	this.cmd("Delete", this.linkedListElemID[this.top - 1]);
	this.top = this.top - 1;
	this.resetLinkedListPositions();
	
	this.cmd("Delete", labPopValID)
	this.cmd("Delete", labPopID);
	this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + this.arrayData[this.top]);
	
	
	
	return this.commands;
}



StackLL.prototype.clearAll = function()
{
	this.commands = new Array();
	for (var i = 0; i < this.top; i++)
	{
		this.cmd("Delete", this.linkedListElemID[i]);
	}
	this.top = 0;
	this.cmd("SetNull", this.topID, 1);
	return this.commands;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new StackLL(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function QueueArray(am, w, h)
{
	this.init(am, w, h);
	
}
QueueArray.inheritFrom(Algorithm);


QueueArray.ARRAY_START_X = 100;
QueueArray.ARRAY_START_Y = 200;
QueueArray.ARRAY_ELEM_WIDTH = 50;
QueueArray.ARRAY_ELEM_HEIGHT = 50;

QueueArray.ARRRAY_ELEMS_PER_LINE = 15;
QueueArray.ARRAY_LINE_SPACING = 130;

QueueArray.HEAD_POS_X = 180;
QueueArray.HEAD_POS_Y = 100;
QueueArray.HEAD_LABEL_X = 130;
QueueArray.HEAD_LABEL_Y =  100;

QueueArray.TAIL_POS_X = 280;
QueueArray.TAIL_POS_Y = 100;
QueueArray.TAIL_LABEL_X = 230;
QueueArray.TAIL_LABEL_Y =  100;

QueueArray.QUEUE_LABEL_X = 50;
QueueArray.QUEUE_LABEL_Y = 30;
QueueArray.QUEUE_ELEMENT_X = 120;
QueueArray.QUEUE_ELEMENT_Y = 30;

QueueArray.INDEX_COLOR = "#0000FF"

QueueArray.SIZE = 15;


QueueArray.prototype.init = function(am, w, h)
{
	QueueArray.superclass.init.call(this, am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	//this.tail_pos_y = h - QueueArray.LINKED_LIST_ELEM_HEIGHT;
//	this.tail_label_y = this.tail_pos_y;
	this.setup();
	this.initialIndex = this.nextIndex;
}


QueueArray.prototype.addControls =  function()
{
	this.controls = [];
	this.enqueueField = this.addControlToAlgorithmBar("Text", "");
	this.enqueueField.onkeydown = this.returnSubmit(this.enqueueField,  this.enqueueCallback.bind(this), 6);
	this.enqueueButton = this.addControlToAlgorithmBar("Button", "Enqueue");
	this.enqueueButton.onclick = this.enqueueCallback.bind(this);
	this.controls.push(this.enqueueField);
	this.controls.push(this.enqueueButton);

	this.dequeueButton = this.addControlToAlgorithmBar("Button", "Dequeue");
	this.dequeueButton.onclick = this.dequeueCallback.bind(this);
	this.controls.push(this.dequeueButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear Queue");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
}

QueueArray.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
QueueArray.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


QueueArray.prototype.setup = function()
{

	this.nextIndex = 0;
	
	this.arrayID = new Array(QueueArray.SIZE);
	this.arrayLabelID = new Array(QueueArray.SIZE);
	for (var i = 0; i < QueueArray.SIZE; i++)
	{
		
		this.arrayID[i]= this.nextIndex++;
		this.arrayLabelID[i]= this.nextIndex++;
	}
	this.headID = this.nextIndex++;
	headLabelID = this.nextIndex++;
	this.tailID = this.nextIndex++;
	tailLabelID = this.nextIndex++;
	
	this.arrayData = new Array(QueueArray.SIZE);
	this.head = 0;
	this.tail = 0;
	this.leftoverLabelID = this.nextIndex++;
	
	
	for (var i = 0; i < QueueArray.SIZE; i++)
	{
		var xpos = (i  % QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_ELEM_WIDTH + QueueArray.ARRAY_START_X;
		var ypos = Math.floor(i / QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_LINE_SPACING +  QueueArray.ARRAY_START_Y;
		this.cmd("CreateRectangle", this.arrayID[i],"", QueueArray.ARRAY_ELEM_WIDTH, QueueArray.ARRAY_ELEM_HEIGHT,xpos, ypos);
		this.cmd("CreateLabel",this.arrayLabelID[i],  i,  xpos, ypos + QueueArray.ARRAY_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", this.arrayLabelID[i], QueueArray.INDEX_COLOR);
		
	}
	this.cmd("CreateLabel", headLabelID, "Head", QueueArray.HEAD_LABEL_X, QueueArray.HEAD_LABEL_Y);
	this.cmd("CreateRectangle", this.headID, 0, QueueArray.ARRAY_ELEM_WIDTH, QueueArray.ARRAY_ELEM_HEIGHT, QueueArray.HEAD_POS_X, QueueArray.HEAD_POS_Y);
	
	this.cmd("CreateLabel", tailLabelID, "Tail", QueueArray.TAIL_LABEL_X, QueueArray.TAIL_LABEL_Y);
	this.cmd("CreateRectangle", this.tailID, 0, QueueArray.ARRAY_ELEM_WIDTH, QueueArray.ARRAY_ELEM_HEIGHT, QueueArray.TAIL_POS_X, QueueArray.TAIL_POS_Y);
	
	
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", QueueArray.QUEUE_LABEL_X, QueueArray.QUEUE_LABEL_Y);
	

	this.initialIndex = this.nextIndex;

	this.highlight1ID = this.nextIndex++;
	this.highlight2ID = this.nextIndex++;

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
		
	
}
		
		
QueueArray.prototype.reset = function()
{
	this.top = 0;
	this.nextIndex = this.initialIndex;

}
		
		
QueueArray.prototype.enqueueCallback = function(event)
{
	if ((this.tail + 1) % QueueArray.SIZE  != this.head && this.enqueueField.value != "")
	{
		var pushVal = this.enqueueField.value;
		this.enqueueField.value = ""
		this.implementAction(this.enqueue.bind(this), pushVal);
	}
}
		
		
QueueArray.prototype.dequeueCallback = function(event)
{
	if (this.tail != this.head)
	{
		this.implementAction(this.dequeue.bind(this), "");
	}
}
		

QueueArray.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearAll.bind(this), "");
}

		

QueueArray.prototype.enqueue = function(elemToEnqueue)
{
	this.commands = new Array();
	
	var labEnqueueID = this.nextIndex++;
	var labEnqueueValID = this.nextIndex++;
	this.arrayData[this.tail] = elemToEnqueue;
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLabel", labEnqueueID, "Enqueuing Value: ", QueueArray.QUEUE_LABEL_X, QueueArray.QUEUE_LABEL_Y);
	this.cmd("CreateLabel", labEnqueueValID,elemToEnqueue, QueueArray.QUEUE_ELEMENT_X, QueueArray.QUEUE_ELEMENT_Y);
	
	this.cmd("Step");			
	this.cmd("CreateHighlightCircle", this.highlight1ID, QueueArray.INDEX_COLOR,  QueueArray.TAIL_POS_X, QueueArray.TAIL_POS_Y);
	this.cmd("Step");
	
	var xpos = (this.tail  % QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_ELEM_WIDTH + QueueArray.ARRAY_START_X;
	var ypos = Math.floor(this.tail / QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_LINE_SPACING +  QueueArray.ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + QueueArray.ARRAY_ELEM_HEIGHT); 				
	this.cmd("Step");
	
	this.cmd("Move", labEnqueueValID, xpos, ypos);
	this.cmd("Step");
	
	this.cmd("Settext", this.arrayID[this.tail], elemToEnqueue);
	this.cmd("Delete", labEnqueueValID);
	
	this.cmd("Delete", this.highlight1ID);
	
	this.cmd("SetHighlight", this.tailID, 1);
	this.cmd("Step");
	this.tail = (this.tail + 1) % QueueArray.SIZE;
	this.cmd("SetText", this.tailID, this.tail)
	this.cmd("Step");
	this.cmd("SetHighlight", this.tailID, 0);
	this.cmd("Delete", labEnqueueID);
	
	return this.commands;
}

QueueArray.prototype.dequeue = function(ignored)
{
	this.commands = new Array();
	
	var labDequeueID = this.nextIndex++;
	var labDequeueValID = this.nextIndex++;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	
	this.cmd("CreateLabel", labDequeueID, "Dequeued Value: ", QueueArray.QUEUE_LABEL_X, QueueArray.QUEUE_LABEL_Y);
	
	this.cmd("CreateHighlightCircle", this.highlight1ID, QueueArray.INDEX_COLOR,  QueueArray.HEAD_POS_X, QueueArray.HEAD_POS_Y);
	this.cmd("Step");
	
	var xpos = (this.head  % QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_ELEM_WIDTH + QueueArray.ARRAY_START_X;
	var ypos = Math.floor(this.head / QueueArray.ARRRAY_ELEMS_PER_LINE) * QueueArray.ARRAY_LINE_SPACING +  QueueArray.ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + QueueArray.ARRAY_ELEM_HEIGHT); 				
	this.cmd("Step");		
	
	this.cmd("Delete", this.highlight1ID);
	
	
	var dequeuedVal = this.arrayData[this.head]
	this.cmd("CreateLabel", labDequeueValID,dequeuedVal, xpos, ypos);
	this.cmd("Settext", this.arrayID[this.head], "");
	this.cmd("Move", labDequeueValID,  QueueArray.QUEUE_ELEMENT_X, QueueArray.QUEUE_ELEMENT_Y);
	this.cmd("Step");
	
	this.cmd("SetHighlight", this.headID, 1);
	this.cmd("Step");
	this.head = (this.head + 1 ) % QueueArray.SIZE;
	this.cmd("SetText", this.headID, this.head)
	this.cmd("Step");
	this.cmd("SetHighlight", this.headID, 0);
	
	this.cmd("SetText", this.leftoverLabelID, "Dequeued Value: " + dequeuedVal);
	
	
	this.cmd("Delete", labDequeueID)
	this.cmd("Delete", labDequeueValID);
	
	
	
	return this.commands;
}



QueueArray.prototype.clearAll = function()
{
	this.commands = new Array();
	this.cmd("SetText", this.leftoverLabelID, "");
	
	for (var i = 0; i < QueueArray.SIZE; i++)
	{
		this.cmd("SetText", this.arrayID[i], "");
	}
	this.head = 0;
	this.tail = 0;
	this.cmd("SetText", this.headID, "0");
	this.cmd("SetText", this.tailID, "0");
	return this.commands;
	
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new QueueArray(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function QueueLL(am, w, h)
{
	this.init(am, w, h);
}
QueueLL.inheritFrom(Algorithm);


QueueLL.LINKED_LIST_START_X = 100;
QueueLL.LINKED_LIST_START_Y = 200;
QueueLL.LINKED_LIST_ELEM_WIDTH = 70;
QueueLL.LINKED_LIST_ELEM_HEIGHT = 30;


QueueLL.LINKED_LIST_INSERT_X = 250;
QueueLL.LINKED_LIST_INSERT_Y = 50;

QueueLL.LINKED_LIST_ELEMS_PER_LINE = 8;
QueueLL.LINKED_LIST_ELEM_SPACING = 100;
QueueLL.LINKED_LIST_LINE_SPACING = 100;

QueueLL.TOP_POS_X = 180;
QueueLL.TOP_POS_Y = 100;
QueueLL.TOP_LABEL_X = 130;
QueueLL.TOP_LABEL_Y =  100;

QueueLL.TOP_ELEM_WIDTH = 30;
QueueLL.TOP_ELEM_HEIGHT = 30;

QueueLL.TAIL_POS_X = 180;
QueueLL.TAIL_LABEL_X = 130;

QueueLL.PUSH_LABEL_X = 50;
QueueLL.PUSH_LABEL_Y = 30;
QueueLL.PUSH_ELEMENT_X = 120;
QueueLL.PUSH_ELEMENT_Y = 30;

QueueLL.SIZE = 32;


QueueLL.prototype.init = function(am, w, h)
{
	QueueLL.superclass.init.call(this, am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.tail_pos_y = h - QueueLL.LINKED_LIST_ELEM_HEIGHT;
	this.tail_label_y = this.tail_pos_y;
	this.setup();
	this.initialIndex = this.nextIndex;
}


QueueLL.prototype.addControls =  function()
{
	this.controls = [];
	this.enqueueField = this.addControlToAlgorithmBar("Text", "");
	this.enqueueField.onkeydown = this.returnSubmit(this.enqueueField,  this.enqueueCallback.bind(this), 6);
	this.enqueueButton = this.addControlToAlgorithmBar("Button", "Enqueue");
	this.enqueueButton.onclick = this.enqueueCallback.bind(this);
	this.controls.push(this.enqueueField);
	this.controls.push(this.enqueueButton);

	this.dequeueButton = this.addControlToAlgorithmBar("Button", "Dequeue");
	this.dequeueButton.onclick = this.dequeueCallback.bind(this);
	this.controls.push(this.dequeueButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear Queue");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
}

QueueLL.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
QueueLL.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


QueueLL.prototype.setup = function()
{
	
	this.linkedListElemID = new Array(QueueLL.SIZE);
	for (var i = 0; i < QueueLL.SIZE; i++)
	{
		
		this.linkedListElemID[i]= this.nextIndex++;
	}
	this.headID = this.nextIndex++;
	this.headLabelID = this.nextIndex++;

	this.tailID = this.nextIndex++;
	this.tailLabelID = this.nextIndex++;

	
	this.arrayData = new Array(QueueLL.SIZE);
	this.top = 0;
	this.leftoverLabelID = this.nextIndex++;
	
	this.cmd("CreateLabel", this.headLabelID, "Head", QueueLL.TOP_LABEL_X, QueueLL.TOP_LABEL_Y);
	this.cmd("CreateRectangle", this.headID, "", QueueLL.TOP_ELEM_WIDTH, QueueLL.TOP_ELEM_HEIGHT, QueueLL.TOP_POS_X, QueueLL.TOP_POS_Y);
	this.cmd("SetNull", this.headID, 1);
	
	
	this.cmd("CreateLabel", this.tailLabelID, "Tail", QueueLL.TAIL_LABEL_X, this.tail_label_y);
	this.cmd("CreateRectangle", this.tailID, "", QueueLL.TOP_ELEM_WIDTH, QueueLL.TOP_ELEM_HEIGHT, QueueLL.TAIL_POS_X, this.tail_pos_y);
	this.cmd("SetNull", this.tailID, 1);
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", 5, QueueLL.PUSH_LABEL_Y,0);
	
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();		
	
}

QueueLL.prototype.resetLinkedListPositions = function()
{
	for (var i = this.top - 1; i >= 0; i--)
	{
		var nextX = (this.top - 1 - i) % QueueLL.LINKED_LIST_ELEMS_PER_LINE * QueueLL.LINKED_LIST_ELEM_SPACING + QueueLL.LINKED_LIST_START_X;
		var nextY = Math.floor((this.top - 1 - i) / QueueLL.LINKED_LIST_ELEMS_PER_LINE) * QueueLL.LINKED_LIST_LINE_SPACING + QueueLL.LINKED_LIST_START_Y;
		this.cmd("Move", this.linkedListElemID[i], nextX, nextY);				
	}
	
}


		
		
QueueLL.prototype.reset = function()
{
	this.top = 0;
	this.nextIndex = this.initialIndex;

}
		
		
QueueLL.prototype.enqueueCallback = function(event)
{
	if (this.top < QueueLL.SIZE && this.enqueueField.value != "")
	{
		var pushVal = this.enqueueField.value;
		this.enqueueField.value = ""
		this.implementAction(this.enqueue.bind(this), pushVal);
	}
}
		
		
QueueLL.prototype.dequeueCallback = function(event)
{
	if (this.top > 0)
	{
		this.implementAction(this.dequeue.bind(this), "");
	}
}
		

QueueLL.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearData.bind(this), "");
}

		

QueueLL.prototype.enqueue = function(elemToPush)
{
	this.commands = new Array();
	
	this.arrayData[this.top] = elemToPush;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	for (var i  = this.top; i > 0; i--)
	{
		this.arrayData[i] = this.arrayData[i-1];
		this.linkedListElemID[i] =this.linkedListElemID[i-1];
	}
	this.arrayData[0] = elemToPush;
	this.linkedListElemID[0] = this.nextIndex++;
	
	var labPushID = this.nextIndex++;
	var labPushValID = this.nextIndex++;
	this.cmd("CreateLinkedList",this.linkedListElemID[0], "" ,QueueLL.LINKED_LIST_ELEM_WIDTH, QueueLL.LINKED_LIST_ELEM_HEIGHT, 
		QueueLL.LINKED_LIST_INSERT_X, QueueLL.LINKED_LIST_INSERT_Y, 0.25, 0, 1, 1);
	
	this.cmd("SetNull", this.linkedListElemID[0], 1);
	this.cmd("CreateLabel", labPushID, "Enqueuing Value: ", QueueLL.PUSH_LABEL_X, QueueLL.PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPushValID,elemToPush, QueueLL.PUSH_ELEMENT_X, QueueLL.PUSH_ELEMENT_Y);
	
	this.cmd("Step");
	
	
	
	this.cmd("Move", labPushValID, QueueLL.LINKED_LIST_INSERT_X, QueueLL.LINKED_LIST_INSERT_Y);
	
	this.cmd("Step");
	this.cmd("SetText", this.linkedListElemID[0], elemToPush);
	this.cmd("Delete", labPushValID);
	
	if (this.top == 0)
	{
		this.cmd("SetNull", this.headID, 0);
		this.cmd("SetNull", this.tailID, 0);
		this.cmd("connect", this.headID, this.linkedListElemID[this.top]);
		this.cmd("connect", this.tailID, this.linkedListElemID[this.top]);
	}
	else
	{
		this.cmd("SetNull", this.linkedListElemID[1], 0);
		this.cmd("Connect",  this.linkedListElemID[1], this.linkedListElemID[0]);
		this.cmd("Step");
		this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
	}
	this.cmd("Connect", this.tailID, this.linkedListElemID[0]);
	
	this.cmd("Step");
	this.top = this.top + 1;
	this.resetLinkedListPositions();
	this.cmd("Delete", labPushID);
	this.cmd("Step");
	
	return this.commands;
}

QueueLL.prototype.dequeue = function(ignored)
{
	this.commands = new Array();
	
	var labPopID = this.nextIndex++;
	var labPopValID = this.nextIndex++;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	
	this.cmd("CreateLabel", labPopID, "Dequeued Value: ", QueueLL.PUSH_LABEL_X, QueueLL.PUSH_LABEL_Y);
	this.cmd("CreateLabel", labPopValID,this.arrayData[this.top - 1], QueueLL.LINKED_LIST_START_X, QueueLL.LINKED_LIST_START_Y);
	
	this.cmd("Move", labPopValID,  QueueLL.PUSH_ELEMENT_X, QueueLL.PUSH_ELEMENT_Y);
	this.cmd("Step");
	this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
	
	if (this.top == 1)
	{
		this.cmd("SetNull", this.headID, 1);
		this.cmd("SetNull", this.tailID, 1);
		this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top-1]);
	}
	else
	{
		this.cmd("Connect", this.headID, this.linkedListElemID[this.top-2]);
	}
	this.cmd("Step");
	this.cmd("Delete", this.linkedListElemID[this.top - 1]);
	this.top = this.top - 1;
	this.resetLinkedListPositions();
	
	this.cmd("Delete", labPopValID)
	this.cmd("Delete", labPopID);
	this.cmd("SetText", this.leftoverLabelID, "Dequeued Value: " + this.arrayData[this.top]);
	
	
	
	return this.commands;
}



QueueLL.prototype.clearAll = function()
{
	this.commands = new Array();
	for (var i = 0; i < this.top; i++)
	{
		this.cmd("Delete", this.linkedListElemID[i]);
	}
	this.top = 0;
	this.cmd("SetNull", this.headID, 1);
	return this.commands;
	
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new QueueLL(animManag, canvas.width, canvas.height);
}

// Copyright 2015 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

Search.CODE_START_X = 10;
Search.CODE_START_Y = 10;
Search.CODE_LINE_HEIGHT = 14;


Search.CODE_HIGHLIGHT_COLOR = "#FF0000";
Search.CODE_STANDARD_COLOR = "#000000";

Search.SMALL_SIZE = 0;
Search.LARGE_SIZE = 1;

Search.EXTRA_FIELD_WIDTH = 50;
Search.EXTRA_FIELD_HEIGHT = 50;

Search.SEARCH_FOR_X = 450;  
Search.SEARCH_FOR_Y = 30;


Search.RESULT_X = 550;  
Search.RESULT_Y = 30;


Search.INDEX_X = 450;  
Search.INDEX_Y = 130;


Search.HIGHLIGHT_CIRCLE_SIZE_SMALL = 20;
Search.HIGHLIGHT_CIRCLE_SIZE_LARGE = 10;
Search.HIGHLIGHT_CIRCLE_SIZE = Search.HIGHLIGHT_CIRCLE_SIZE_SMALL;


Search.LOW_CIRCLE_COLOR = "#1010FF";
Search.LOW_BACKGROUND_COLOR = "#F0F0FF";
Search.MID_CIRCLE_COLOR = "#118C4E";
Search.MID_BACKGROUND_COLOR = "#F0FFF0";
Search.HIGH_CIRCLE_COLOR = "#FF9009";
Search.HIGH_BACKGROUND_COLOR = "#FFFFF0";

Search.LOW_POS_X = 350;
Search.LOW_POS_Y = 130;


Search.MID_POS_X = 450;
Search.MID_POS_Y = 130;

Search.HIGH_POS_X = 550;
Search.HIGH_POS_Y = 130;



Search.ARRAY_START_X_SMALL = 100;
Search.ARRAY_START_X_LARGE = 100;
Search.ARRAY_START_X = Search.ARRAY_START_X_SMALL;
Search.ARRAY_START_Y_SMALL = 240;
Search.ARRAY_START_Y_LARGE = 200;
Search.ARRAY_START_Y = Search.ARRAY_START_Y_SMALL;
Search.ARRAY_ELEM_WIDTH_SMALL = 50;
Search.ARRAY_ELEM_WIDTH_LARGE = 25;
Search.ARRAY_ELEM_WIDTH = Search.ARRAY_ELEM_WIDTH_SMALL;

Search.ARRAY_ELEM_HEIGHT_SMALL = 50;
Search.ARRAY_ELEM_HEIGHT_LARGE = 20;
Search.ARRAY_ELEM_HEIGHT = Search.ARRAY_ELEM_HEIGHT_SMALL;

Search.ARRAY_ELEMS_PER_LINE_SMALL = 16;
Search.ARRAY_ELEMS_PER_LINE_LARGE = 30;
Search.ARRAY_ELEMS_PER_LINE = Search.ARRAY_ELEMS_PER_LINE_SMALL;


Search.ARRAY_LINE_SPACING_LARGE = 40;
Search.ARRAY_LINE_SPACING_SMALL = 130;
Search.ARRAY_LINE_SPACING = Search.ARRAY_LINE_SPACING_SMALL;

Search.SIZE_SMALL = 32;
Search.SIZE_LARGE = 180;
var SIZE = Search.SIZE_SMALL;

function Search(am, w, h)
{
    this.init(am, w, h);
    
}

Search.inheritFrom(Algorithm);


Search.LINEAR_CODE = [ ["def ", "linearSearch(listData, value)"],
                       ["    index = 0"],
                       ["    while (","index < len(listData)", " and ", "listData[index] < value","):"],
                       ["        index++;"],
                       ["    if (", "index >= len(listData", " or ", "listData[index] != value", "):"],
                       ["        return -1"],
                       ["    return index"]];
Search.BINARY_CODE = [ ["def ", "binarySearch(listData, value)"],
                       ["    low = 0"],
                       ["    high = len(listData) - 1"],
                       ["    while (","low <= high",")"],
                       ["        mid = (low + high) / 2"] ,
                       ["        if (","listData[mid] == value","):"], 
                       ["            return mid"], 
                       ["        elif (","listData[mid] < value",")"], 
                       ["            low = mid + 1"],
                       ["        else:"],
                       ["            high = mid - 1"],
                       ["    return -1"]]



Search.prototype.init = function(am, w, h)
{
    Search.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}


Search.prototype.addControls =  function()
{
    this.controls = [];
    this.searchField = this.addControlToAlgorithmBar("Text", "");
    this.searchField.onkeydown = this.returnSubmit(this.searchField,  null,  6, true);
    this.linearSearchButton = this.addControlToAlgorithmBar("Button", "Linear Search");
    this.linearSearchButton.onclick = this.linearSearchCallback.bind(this);
    this.controls.push(this.searchField);
    this.controls.push(this.linearSearchButton);


    this.binarySearchButton = this.addControlToAlgorithmBar("Button", "Binary Search");
    this.binarySearchButton.onclick = this.binarySearchCallback.bind(this);
    this.controls.push(this.binarySearchButton);
    

	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Small", "Large"], "List Size");
	this.smallListButton = radioButtonList[0];
	this.smallListButton.onclick = this.smallListCallback.bind(this);
	this.largeListButton = radioButtonList[1];
	this.largeListButton.onclick = this.largeListCallback.bind(this);
	this.smallListButton.checked = true;
    
}



Search.prototype.smallListCallback = function (event)
{
	if (this.size != Search.SMALL_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_small();		
	}
}


Search.prototype.largeListCallback = function (event)
{
	if (this.size != Search.LARGE_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_large();		
	}
}



Search.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
	this.controls[i].disabled = false;
    }
    
    
}
Search.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
	this.controls[i].disabled = true;
    }
}



Search.prototype.getIndexX = function(index) {
    var xpos = (index  % Search.ARRAY_ELEMS_PER_LINE) * Search.ARRAY_ELEM_WIDTH + Search.ARRAY_START_X;
    return xpos;
}


Search.prototype.getIndexY = function(index) {
    if (index == -1) {
       index = 0;
    }
    var ypos = Math.floor(index / Search.ARRAY_ELEMS_PER_LINE) * Search.ARRAY_LINE_SPACING +  Search.ARRAY_START_Y +  Search.ARRAY_ELEM_HEIGHT;
     return ypos;
}

Search.prototype.setup = function()
{
    this.nextIndex = 0;

    this.values = new Array(SIZE);
    this.arrayData = new Array(SIZE);
    this.arrayID = new Array(SIZE);
    this.arrayLabelID = new Array(SIZE);
    for (var i = 0; i < SIZE; i++)
    {
	this.arrayData[i] = Math.floor(1+Math.random()*999);
	this.arrayID[i]= this.nextIndex++;
	this.arrayLabelID[i]= this.nextIndex++;
    }

    for (var i = 1; i < SIZE; i++) {
        var nxt = this.arrayData[i];
        var j = i
        while (j > 0 && this.arrayData[j-1] > nxt) {
            this.arrayData[j] = this.arrayData[j-1];
            j  = j - 1;
        }
        this.arrayData[j] = nxt;
    }

    this.leftoverLabelID = this.nextIndex++;
    this.commands = new Array();

    
    for (var i = 0; i < SIZE; i++)
    {
	var xLabelpos = this.getIndexX(i);
	var yLabelpos = this.getIndexY(i);
	this.cmd("CreateRectangle", this.arrayID[i],this.arrayData[i], Search.ARRAY_ELEM_WIDTH, Search.ARRAY_ELEM_HEIGHT,xLabelpos, yLabelpos - Search.ARRAY_ELEM_HEIGHT);
	this.cmd("CreateLabel",this.arrayLabelID[i],  i,  xLabelpos, yLabelpos);
	this.cmd("SetForegroundColor", this.arrayLabelID[i], "#0000FF");
	
    }

    this.movingLabelID = this.nextIndex++;
    this.cmd("CreateLabel",this.movingLabelID,  "", 0, 0);

   //	this.cmd("CreateLabel", this.leftoverLabelID, "", Search.PUSH_LABEL_X, Search.PUSH_LABEL_Y);


    this.searchForBoxID = this.nextIndex++;
    this.searchForBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.searchForBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.SEARCH_FOR_X, Search.SEARCH_FOR_Y);
    this.cmd("CreateLabel",  this.searchForBoxLabel,  "Seaching For  ", Search.SEARCH_FOR_X, Search.SEARCH_FOR_Y);
    this.cmd("AlignLeft",   this.searchForBoxLabel, this.searchForBoxID);

    this.resultBoxID = this.nextIndex++;
    this.resultBoxLabel = this.nextIndex++;
    this.resultString = this.nextIndex++;
    this.cmd("CreateRectangle",  this.resultBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.RESULT_X, Search.RESULT_Y);
    this.cmd("CreateLabel",  this.resultBoxLabel,  "Result  ", Search.RESULT_X, Search.RESULT_Y);
    this.cmd("CreateLabel",  this.resultString,  "", Search.RESULT_X, Search.RESULT_Y);
    this.cmd("AlignLeft",   this.resultBoxLabel, this.resultBoxID);
    this.cmd("AlignRight",   this.resultString, this.resultBoxID);
    this.cmd("SetTextColor", this.resultString, "#FF0000");



    this.indexBoxID = this.nextIndex++;
    this.indexBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.indexBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.INDEX_X, Search.INDEX_Y);
    this.cmd("CreateLabel",  this.indexBoxLabel,  "index  ", Search.INDEX_X, Search.INDEX_Y);
    this.cmd("AlignLeft",   this.indexBoxLabel, this.indexBoxID);



    this.midBoxID = this.nextIndex++;
    this.midBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.midBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.MID_POS_X, Search.MID_POS_Y);
    this.cmd("CreateLabel",  this.midBoxLabel,  "mid  ", Search.MID_POS_X, Search.MID_POS_Y);
    this.cmd("AlignLeft",   this.midBoxLabel, this.midBoxID);
    this.cmd("SetForegroundColor", this.midBoxID, Search.MID_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.midBoxID, Search.MID_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.midBoxID, Search.MID_BACKGROUND_COLOR);

    this.midCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.midCircleID, Search.MID_CIRCLE_COLOR, 0, 0, Search.HIGHLIGHT_CIRCLE_SIZE);


    this.lowBoxID = this.nextIndex++;
    this.lowBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.lowBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.LOW_POS_X, Search.LOW_POS_Y);
    this.cmd("CreateLabel",  this.lowBoxLabel,  "low  ", Search.LOW_POS_X, Search.LOW_POS_Y);
    this.cmd("AlignLeft",   this.lowBoxLabel, this.lowBoxID);
    this.cmd("SetForegroundColor", this.lowBoxID, Search.LOW_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.lowBoxID, Search.LOW_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.lowBoxID, Search.LOW_BACKGROUND_COLOR);

    this.lowCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.lowCircleID, Search.LOW_CIRCLE_COLOR, 0,0,Search.HIGHLIGHT_CIRCLE_SIZE);



    this.highBoxID = this.nextIndex++;
    this.highBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.highBoxID, "", Search.EXTRA_FIELD_WIDTH, Search.EXTRA_FIELD_HEIGHT,Search.HIGH_POS_X, Search.HIGH_POS_Y);
    this.cmd("CreateLabel",  this.highBoxLabel,  "high  ", Search.HIGH_POS_X, Search.HIGH_POS_Y);
    this.cmd("AlignLeft",   this.highBoxLabel, this.highBoxID);
    this.cmd("SetForegroundColor", this.highBoxID, Search.HIGH_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.highBoxID, Search.HIGH_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.highBoxID, Search.HIGH_BACKGROUND_COLOR);


    this.highCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.highCircleID, Search.HIGH_CIRCLE_COLOR, 0 , 0, Search.HIGHLIGHT_CIRCLE_SIZE);


    this.cmd("SetALpha", this.lowBoxID, 0);
    this.cmd("SetALpha", this.lowBoxLabel, 0);
    this.cmd("SetALpha", this.midBoxID, 0);
    this.cmd("SetALpha", this.midBoxLabel, 0);
    this.cmd("SetALpha", this.highBoxID, 0);
    this.cmd("SetALpha", this.highBoxLabel, 0);

    this.cmd("SetALpha", this.midCircleID, 0);
    this.cmd("SetALpha", this.lowCircleID, 0);
    this.cmd("SetALpha", this.highCircleID, 0);

    this.cmd("SetALpha", this.indexBoxID, 0);
    this.cmd("SetALpha", this.indexBoxLabel, 0);
    
    this.highlight1ID = this.nextIndex++;
    this.highlight2ID = this.nextIndex++;

    this.binaryCodeID = this.addCodeToCanvasBase(Search.BINARY_CODE, Search.CODE_START_X, Search.CODE_START_Y, Search.CODE_LINE_HEIGHT, Search.CODE_STANDARD_COLOR);

    this.linearCodeID = this.addCodeToCanvasBase(Search.LINEAR_CODE, Search.CODE_START_X, Search.CODE_START_Y, Search.CODE_LINE_HEIGHT, Search.CODE_STANDARD_COLOR);

    this.setCodeAlpha(this.binaryCodeID, 0);
    this.setCodeAlpha(this.linearCodeID, 0);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

Search.prototype.setup_small = function() {

   Search.HIGHLIGHT_CIRCLE_SIZE = Search.HIGHLIGHT_CIRCLE_SIZE_SMALL;
   Search.ARRAY_START_X = Search.ARRAY_START_X_SMALL;
   Search.ARRAY_START_Y = Search.ARRAY_START_Y_SMALL;
   Search.ARRAY_ELEM_WIDTH = Search.ARRAY_ELEM_WIDTH_SMALL;
   Search.ARRAY_ELEM_HEIGHT = Search.ARRAY_ELEM_HEIGHT_SMALL;
   Search.ARRAY_ELEMS_PER_LINE = Search.ARRAY_ELEMS_PER_LINE_SMALL;
   Search.ARRAY_LINE_SPACING = Search.ARRAY_LINE_SPACING_SMALL;
   SIZE = Search.SIZE_SMALL;
   this.size = Search.SMALL_SIZE;
   this.setup();

}


Search.prototype.setup_large  = function() {

   Search.HIGHLIGHT_CIRCLE_SIZE = Search.HIGHLIGHT_CIRCLE_SIZE_LARGE;
   Search.ARRAY_START_X = Search.ARRAY_START_X_LARGE;
   Search.ARRAY_START_Y = Search.ARRAY_START_Y_LARGE;
   Search.ARRAY_ELEM_WIDTH = Search.ARRAY_ELEM_WIDTH_LARGE;
   Search.ARRAY_ELEM_HEIGHT = Search.ARRAY_ELEM_HEIGHT_LARGE;
   Search.ARRAY_ELEMS_PER_LINE = Search.ARRAY_ELEMS_PER_LINE_LARGE;
   Search.ARRAY_LINE_SPACING = Search.ARRAY_LINE_SPACING_LARGE;
   SIZE = Search.SIZE_LARGE;
   this.size = Search.LARGE_SIZE;
   this.setup()

}




Search.prototype.linearSearchCallback = function(event)
{
    var searchVal = this.searchField.value;
    this.implementAction(this.linearSearch.bind(this), searchVal);
}


Search.prototype.binarySearchCallback = function(event)
{

    var searchVal = this.searchField.value;
    this.implementAction(this.binarySearch.bind(this), searchVal);

}



Search.prototype.binarySearch = function(searchVal)
{
    this.commands = new Array();
    this.setCodeAlpha(this.binaryCodeID, 1);
    this.setCodeAlpha(this.linearCodeID, 0);

    this.cmd("SetALpha", this.lowBoxID, 1);
    this.cmd("SetALpha", this.lowBoxLabel, 1);
    this.cmd("SetALpha", this.midBoxID, 1);
    this.cmd("SetALpha", this.midBoxLabel, 1);
    this.cmd("SetALpha", this.highBoxID, 1);
    this.cmd("SetALpha", this.highBoxLabel, 1);

    this.cmd("SetAlpha", this.lowCircleID, 1);
    this.cmd("SetAlpha", this.midCircleID, 1);
    this.cmd("SetAlpha", this.highCircleID, 1);
    this.cmd("SetPosition", this.lowCircleID, Search.LOW_POS_X, Search.LOW_POS_Y);
    this.cmd("SetPosition", this.midCircleID, Search.MID_POS_X, Search.MID_POS_Y);
    this.cmd("SetPosition", this.highCircleID, Search.HIGH_POS_X, Search.HIGH_POS_Y);
    this.cmd("SetAlpha", this.indexBoxID, 0);
    this.cmd("SetAlpha", this.indexBoxLabel, 0);

    this.cmd("SetText", this.resultString, "");
    this.cmd("SetText", this.resultBoxID, "");
    this.cmd("SetText", this.movingLabelID, "");


    var low = 0;
    var high = SIZE- 1;
    this.cmd("Move", this.lowCircleID, this.getIndexX(0), this.getIndexY(0));
    this.cmd("SetText", this.searchForBoxID, searchVal);
    this.cmd("SetForegroundColor", this.binaryCodeID[1][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.lowBoxID, 1)
    this.cmd("SetText", this.lowBoxID, 0)
    this.cmd("step");
    this.cmd("SetForegroundColor", this.binaryCodeID[1][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.lowBoxID, 0)
    this.cmd("SetForegroundColor", this.binaryCodeID[2][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.highBoxID, 1)
    this.cmd("SetText", this.highBoxID, SIZE-1)
    this.cmd("Move", this.highCircleID, this.getIndexX(SIZE-1), this.getIndexY(SIZE-1));
    this.cmd("step");
    this.cmd("SetForegroundColor", this.binaryCodeID[2][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.highBoxID, 0)
    var keepGoing = true;

    while (keepGoing)  {
	this.cmd("SetHighlight", this.highBoxID, 1)
	this.cmd("SetHighlight", this.lowBoxID, 1)
	this.cmd("SetForegroundColor", this.binaryCodeID[3][1], Search.CODE_HIGHLIGHT_COLOR);
	this.cmd("step");
	this.cmd("SetHighlight", this.highBoxID, 0)
	this.cmd("SetHighlight", this.lowBoxID, 0)
	this.cmd("SetForegroundColor", this.binaryCodeID[3][1], Search.CODE_STANDARD_COLOR);
	if (low > high)
	{
            keepGoing = false;
	} else {
	    var mid = Math.floor((high + low) / 2);
            this.cmd("SetForegroundColor", this.binaryCodeID[4][0], Search.CODE_HIGHLIGHT_COLOR);
	    this.cmd("SetHighlight", this.highBoxID, 1)
	    this.cmd("SetHighlight", this.lowBoxID, 1)
	    this.cmd("SetHighlight", this.midBoxID, 1)
	    this.cmd("SetText", this.midBoxID, mid)
            this.cmd("Move", this.midCircleID, this.getIndexX(mid), this.getIndexY(mid));

            this.cmd("step");
            this.cmd("SetForegroundColor", this.binaryCodeID[4][0], Search.CODE_STANDARD_COLOR);
	    this.cmd("SetHighlight", this.midBoxID, 0)
	    this.cmd("SetHighlight", this.highBoxID, 0)
	    this.cmd("SetHighlight", this.lowBoxID, 0)
	    this.cmd("SetHighlight", this.searchForBoxID, 1)
            this.cmd("SetHighlight", this.arrayID[mid],1);
            this.cmd("SetForegroundColor", this.binaryCodeID[5][1], Search.CODE_HIGHLIGHT_COLOR);
            this.cmd("step");
	    this.cmd("SetHighlight", this.searchForBoxID, 0)
            this.cmd("SetHighlight", this.arrayID[mid],0);
            this.cmd("SetForegroundColor", this.binaryCodeID[5][1], Search.CODE_STANDARD_COLOR);
            if (this.arrayData[mid] == searchVal) {
// HIGHLIGHT CODE!
		keepGoing = false;

            }
            else {

		this.cmd("SetForegroundColor", this.binaryCodeID[7][1], Search.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetHighlight", this.searchForBoxID, 1)
		this.cmd("SetHighlight", this.arrayID[mid],1);
		this.cmd("step")
		this.cmd("SetForegroundColor", this.binaryCodeID[7][1], Search.CODE_STANDARD_COLOR);
		this.cmd("SetHighlight", this.searchForBoxID, 0)
		this.cmd("SetHighlight", this.arrayID[mid],0);
		if (this.arrayData[mid]  < searchVal) {
                    this.cmd("SetForegroundColor", this.binaryCodeID[8][0], Search.CODE_HIGHLIGHT_COLOR);
                    this.cmd("SetHighlight", this.lowID,1);
                    this.cmd("SetText", this.lowBoxID,mid+1);
                    this.cmd("Move", this.lowCircleID, this.getIndexX(mid+1), this.getIndexY(mid+1));

                    low = mid + 1;
                    for (var i = 0; i < low; i++) {
                        this.cmd("SetAlpha", this.arrayID[i],0.2);
                    }
                    this.cmd("Step");
                    this.cmd("SetForegroundColor", this.binaryCodeID[8][0], Search.CODE_STANDARD_COLOR);
                    this.cmd("SetHighlight", this.lowBoxID,0);
		}  else {
                    this.cmd("SetForegroundColor", this.binaryCodeID[10][0], Search.CODE_HIGHLIGHT_COLOR);
                    this.cmd("SetHighlight", this.highBoxID,1);
                    high  = mid - 1;
                    this.cmd("SetText", this.highBoxID,high);
                    this.cmd("Move", this.highCircleID, this.getIndexX(high), this.getIndexY(high));

                    for (var i = high + 1; i < SIZE; i++) {
                        this.cmd("SetAlpha", this.arrayID[i],0.2);
                    }
                    this.cmd("Step");

                    this.cmd("SetForegroundColor", this.binaryCodeID[10][0], Search.CODE_STANDARD_COLOR);
                    this.cmd("SetHighlight", this.midBoxID,0);


		}
	    }

	}

    }
    if (high < low) {
        this.cmd("SetText", this.resultString, "   Element Not found");
        this.cmd("SetText", this.resultBoxID, -1);
        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("SetForegroundColor", this.binaryCodeID[11][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step")
        this.cmd("SetForegroundColor", this.binaryCodeID[11][0], Search.CODE_STANDARD_COLOR);

    }  else {
        this.cmd("SetText", this.resultString, "   Element found");
        this.cmd("SetText", this.movingLabelID, mid);
        this.cmd("SetPosition", this.movingLabelID, this.getIndexX(mid), this.getIndexY(mid));

        this.cmd("Move", this.movingLabelID, Search.RESULT_X, Search.RESULT_Y);

        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("SetForegroundColor", this.binaryCodeID[6][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step")
        this.cmd("SetForegroundColor", this.binaryCodeID[6][0], Search.CODE_STANDARD_COLOR);

    }
	
    for (var i = 0; i < SIZE; i++) {
        this.cmd("SetAlpha", this.arrayID[i],1);
    }
    return this.commands;




}


Search.prototype.linearSearch = function(searchVal)
{
    this.commands = new Array();
    this.setCodeAlpha(this.binaryCodeID, 0);
    this.setCodeAlpha(this.linearCodeID, 1);

    this.cmd("SetALpha", this.lowBoxID, 0);
    this.cmd("SetALpha", this.lowBoxLabel, 0);
    this.cmd("SetALpha", this.midBoxID, 0);
    this.cmd("SetALpha", this.midBoxLabel, 0);
    this.cmd("SetALpha", this.highBoxID, 0);
    this.cmd("SetALpha", this.highBoxLabel, 0);


    this.cmd("SetAlpha", this.lowCircleID, 1);
    this.cmd("SetAlpha", this.midCircleID, 0);
    this.cmd("SetAlpha", this.highCircleID, 0);

    this.cmd("SetPosition", this.lowCircleID, Search.INDEX_X, Search.INDEX_Y);

    this.cmd("SetALpha", this.indexBoxID, 1);
    this.cmd("SetALpha", this.indexBoxLabel, 1);

    this.cmd("SetText", this.resultString, "");
    this.cmd("SetText", this.resultBoxID, "");
    this.cmd("SetText", this.movingLabelID, "");



    var goOn = true;
    var nextSearch = 0;
    this.cmd("SetText", this.searchForBoxID, searchVal);
    this.cmd("SetForegroundColor", this.linearCodeID[1][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.indexBoxID,1);
    this.cmd("SetText", this.indexBoxID, "0");
    this.cmd("Move", this.lowCircleID, this.getIndexX(0), this.getIndexY(0));

    this.cmd("Step");
    this.cmd("SetForegroundColor", this.linearCodeID[1][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.indexBoxID,0);

    
    var foundIndex = 0
    while (goOn) {
        if (foundIndex == SIZE) {
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][1], Search.CODE_HIGHLIGHT_COLOR);
            this.cmd("Step");
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][1], Search.CODE_STANDARD_COLOR);
            goOn = false;

        } else {
            this.cmd("SetHighlight", this.arrayID[foundIndex],1);
            this.cmd("SetHighlight", this.searchForBoxID,1);
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][3], Search.CODE_HIGHLIGHT_COLOR);
	    this.cmd("Step")
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][3], Search.CODE_STANDARD_COLOR);
            this.cmd("SetHighlight", this.arrayID[foundIndex],0);
            this.cmd("SetHighlight", this.searchForBoxID,0);
            goOn =  this.arrayData[foundIndex] < searchVal
            if (goOn)
            {
                foundIndex++;

                this.cmd("SetForegroundColor", this.linearCodeID[3][0], Search.CODE_HIGHLIGHT_COLOR);
                this.cmd("SetHighlight", this.indexBoxID,1);
                this.cmd("SetText", this.indexBoxID, foundIndex);
                  this.cmd("Move", this.lowCircleID, this.getIndexX(foundIndex), this.getIndexY(foundIndex));

                this.cmd("Step");
                this.cmd("SetForegroundColor", this.linearCodeID[3][0], Search.CODE_STANDARD_COLOR);
                this.cmd("SetHighlight", this.indexBoxID,0);
            }
        }
    }
    if (foundIndex ==SIZE)
    {
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_STANDARD_COLOR);

	
    }

    else if (this.arrayData[foundIndex] == searchVal)
    {
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][2], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetHighlight", this.arrayID[foundIndex],1);
        this.cmd("SetHighlight", this.searchForBoxID,1);
        this.cmd("Step");

        this.cmd("SetHighlight", this.arrayID[foundIndex],0);
        this.cmd("SetHighlight", this.searchForBoxID,0);



        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][2], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[6][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetText", this.resultString, "   Element found");
        this.cmd("SetText", this.movingLabelID, foundIndex);
        this.cmd("SetPosition", this.movingLabelID, this.getIndexX(foundIndex), this.getIndexY(foundIndex));

        this.cmd("Move", this.movingLabelID, Search.RESULT_X, Search.RESULT_Y);

        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[6][0], Search.CODE_STANDARD_COLOR);



    }
    else 
    {
        this.cmd("SetHighlight", this.arrayID[foundIndex],1);
        this.cmd("SetHighlight", this.searchForBoxID,1);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetHighlight", this.arrayID[foundIndex],0);
        this.cmd("SetHighlight", this.searchForBoxID,0);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetText", this.resultString, "   Element Not found");
        this.cmd("SetText", this.resultBoxID, -1);
        this.cmd("AlignRight",   this.resultString, this.resultBoxID);

        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_STANDARD_COLOR);



    }
    return this.commands;


}






var currentAlg;

function init()
{
    var animManag = initCanvas();
    currentAlg = new Search(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function AVL(am, w, h)
{
	this.init(am, w, h);

}
AVL.inheritFrom(Algorithm);


// Various constants

AVL.HIGHLIGHT_LABEL_COLOR = "#FF0000"
AVL.HIGHLIGHT_LINK_COLOR =  "#FF0000"

AVL.HIGHLIGHT_COLOR = "#007700"
AVL.HEIGHT_LABEL_COLOR = "#007700"


AVL.LINK_COLOR = "#007700";
AVL.HIGHLIGHT_CIRCLE_COLOR = "#007700";
AVL.FOREGROUND_COLOR = "0x007700";
AVL.BACKGROUND_COLOR = "#DDFFDD";
AVL.PRINT_COLOR = AVL.FOREGROUND_COLOR;

AVL.WIDTH_DELTA  = 50;
AVL.HEIGHT_DELTA = 50;
AVL.STARTING_Y = 50;

AVL.FIRST_PRINT_POS_X  = 50;
AVL.PRINT_VERTICAL_GAP  = 20;
AVL.PRINT_HORIZONTAL_GAP = 50;
AVL.EXPLANITORY_TEXT_X = 10;
AVL.EXPLANITORY_TEXT_Y = 10;



AVL.prototype.init = function(am, w, h)
{
	var sc = AVL.superclass;
	var fn = sc.init;
	this.first_print_pos_y  = h - 2 * AVL.PRINT_VERTICAL_GAP;
	this.print_max = w - 10;
	
	fn.call(this, am, w, h);
	this.startingX = w / 2;
	this.addControls();
	this.nextIndex = 1;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", AVL.EXPLANITORY_TEXT_X, AVL.EXPLANITORY_TEXT_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

AVL.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

AVL.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}




AVL.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	// Get text value
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

AVL.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


AVL.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		findValue = this.normalizeNumber(findValue, 4);
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}

AVL.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

AVL.prototype.sizeChanged = function(newWidth, newHeight)
{
	this.startingX = newWidth / 2;
}

		 
		
AVL.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",this.highlightID);
		this.cmd("Step");
		for (var i = firstLabel; i < this.nextIndex; i++)
			this.cmd("Delete", i);
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

AVL.prototype.printTreeRec = function(tree) 
{
	this.cmd("Step");
	if (tree.left != null)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, AVL.PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  AVL.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += AVL.PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}


AVL.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	this.doFind(this.treeRoot, findValue);
	
	
	return this.commands;
}


AVL.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searchiing for "+value);
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");
			this.cmd("SetText", 0, "Found:"+value);
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd("SetText", 0, " Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, " Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, " Searching for "+value+" : " + " (Element not found)");					
	}
}

AVL.prototype.insertElement = function(insertedValue)
{
	this.commands = [];	
	this.cmd("SetText", 0, " Inserting "+insertedValue);
	
	if (this.treeRoot == null)
	{
		var treeNodeID = this.nextIndex++;
		var labelID  = this.nextIndex++;
		this.cmd("CreateCircle", treeNodeID, insertedValue,  this.startingX, AVL.STARTING_Y);
		this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
		this.cmd("CreateLabel", labelID, 1,  this.startingX - 20, AVL.STARTING_Y-20);
		this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
		this.cmd("Step");				
		this.treeRoot = new AVLNode(insertedValue, treeNodeID, labelID, this.startingX, AVL.STARTING_Y);
		this.treeRoot.height = 1;
	}
	else
	{
		treeNodeID = this.nextIndex++;
		labelID = this.nextIndex++;
		this.highlightID = this.nextIndex++;
		
		this.cmd("CreateCircle", treeNodeID, insertedValue, 30, AVL.STARTING_Y);

		this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
		this.cmd("CreateLabel", labelID, "",  100-20, 100-20);
		this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
		this.cmd("Step");				
		var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 100, 100)
		
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//				this.resizeTree();				
	}
	this.cmd("SetText", 0, " ");				
	return this.commands;
}


AVL.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	this.cmd("SetText", 0, "Single Rotate Right");
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID);																		  
		this.cmd("Connect", B.graphicID, t2.graphicID, AVL.LINK_COLOR);
		t2.parent = B;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, AVL.LINK_COLOR);
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd("Disconnect", B.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		this.cmd("Connect", B.parent.graphicID, A.graphicID, AVL.LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this. resetHeight(B);
	this. resetHeight(A);
	this.resizeTree();			
}



AVL.prototype.singleRotateLeft = function(tree)
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd("SetText", 0, "Single Rotate Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);																		  
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
		t2.parent = A;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
		this.cmd("Connect", A.parent.graphicID, B.graphicID, AVL.LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this. resetHeight(A);
	this. resetHeight(B);
	
	this.resizeTree();			
}




AVL.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

AVL.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
			this.cmd("SetText",tree.heightLabelID, newHeight);
//			this.cmd("SetText",tree.heightLabelID, newHeight);
		}
	}
}

AVL.prototype.doubleRotateRight = function(tree)
{
	this.cmd("SetText", 0, "Double Rotate Right");
	var A = tree.left;
	var B = tree.left.right;
	var C = tree;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("Disconnect", C.graphicID, A.graphicID);
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", C.graphicID, A.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Connect", A.graphicID, B.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, AVL.LINK_COLOR);
	}
	if (C.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",C.parent.graphicID, C.graphicID);
		this.cmd("Connect",C.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		if (C.isLeftChild())
		{
			C.parent.left = B
		}
		else
		{
			C.parent.right = B;
		}
		B.parent = C.parent;
		C.parent = B;
	}
	this.cmd("Disconnect", C.graphicID, A.graphicID);
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, AVL.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.doubleRotateLeft = function(tree)
{
	this.cmd("SetText", 0, "Double Rotate Left");
	var A = tree;
	var B = tree.right.left;
	var C = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("Disconnect", A.graphicID, C.graphicID);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", A.graphicID, C.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Connect", C.graphicID, B.graphicID, AVL.HIGHLIGHT_LINK_COLOR);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, AVL.LINK_COLOR);
	}
		
	
	if (A.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",A.parent.graphicID, A.graphicID);
		this.cmd("Connect",A.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
		if (A.isLeftChild())
		{
			A.parent.left = B
		}
		else
		{
			A.parent.right = B;
		}
		B.parent = A.parent;
		A.parent = B;
	}
	this.cmd("Disconnect", A.graphicID, C.graphicID);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, AVL.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	this. resetHeight(A);
	this. resetHeight(C);
	this. resetHeight(B);
	
	this.resizeTree();
	
	
}

AVL.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", elem.graphicID, 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0, elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			this.cmd("SetText", 0, "Found null tree, inserting element");				
			this.cmd("SetText",elem.heightLabelID,1); 
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
			
			this.resizeTree();
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0,"Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.left.height + 1)
			{
				tree.height = tree.left.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
				
			}
			if ((tree.right != null && tree.left.height > tree.right.height + 1) ||
				(tree.right == null && tree.left.height > 1))
			{
				if (elem.data < tree.left.data)
				{
					this.singleRotateRight(tree);
				}
				else
				{
					this.doubleRotateRight(tree);
				}
			}
		}
	}
	else
	{
		if (tree.right == null)
		{
			this.cmd("SetText",  0, "Found null tree, inserting element");			
			this.cmd("SetText", elem.heightLabelID,1); 
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
			elem.x = tree.x + AVL.WIDTH_DELTA/2;
			elem.y = tree.y + AVL.HEIGHT_DELTA
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
			
			this.resizeTree();
			
			
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",   0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
			
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
			this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
			this.cmd("Move", this.highlightID, tree.x, tree.y);
			this.cmd("SetText",  0, "Unwinding Recursion");			
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			if (tree.height < tree.right.height + 1)
			{
				tree.height = tree.right.height + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);
				
				
			}
			if ((tree.left != null && tree.right.height > tree.left.height + 1) ||
				(tree.left == null && tree.right.height > 1))
			{
				if (elem.data >= tree.right.data)
				{
					this.singleRotateLeft(tree);
				}
				else
				{
					this.doubleRotateLeft(tree);
				}
			}
		}
	}
	
	
}

AVL.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, " ");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, " ");			
	return this.commands;						
}

AVL.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd("SetText", 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd("SetText", 0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");				
		}
		else
		{
			this.cmd("SetText", 0, valueToDelete + " == " + tree.data + ".  Found node to delete");									
		}
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			if (tree.left == null && tree.right == null)
			{
				this.cmd("SetText",  0, "Node to delete is a leaf.  Delete it.");									
				this.cmd("Delete", tree.graphicID);
				this.cmd("Delete", tree.heightLabelID);
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
				}
				else
				{
					this.treeRoot = null;
				}
				this.resizeTree();				
				this.cmd("Step");
				
			}
			else if (tree.left == null)
			{
				this.cmd("SetText", 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
					}
					else
					{
						tree.parent.right = tree.right;
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
				}
				this.resizeTree();				
			}
			else if (tree.right == null)
			{
				this.cmd("SetText",  0,"Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					if (leftchild)
					{
						tree.parent.left = tree.left;								
					}
					else
					{
						tree.parent.right = tree.left;
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete" , tree.graphicID);
					this.cmd("Delete", tree.heightLabelID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
				}
				this.resizeTree();
			}
			else // tree.left != null && tree.right != null
			{
				this.cmd("SetText", 0, "Node to delete has two childern.  \nFind largest node in left subtree.");									
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd("Move", this.highlightID, tmp.x, tmp.y);
				this.cmd("Step");																									
				while (tmp.right != null)
				{
					tmp = tmp.right;
					this.cmd("Move", this.highlightID, tmp.x, tmp.y);
					this.cmd("Step");																									
				}
				this.cmd("SetText", tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
				this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
				tree.data = tmp.data;
				this.cmd("Move", labelID, tree.x, tree.y);
				this.cmd("SetText", 0, "Copy largest value of left subtree into node to delete.");									
				
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("Delete", labelID);
				this.cmd("SetText", tree.graphicID, tree.data);
				this.cmd("Delete", this.highlightID);							
				this.cmd("SetText", 0, "Remove node whose value we copied.");									
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
					}
					else
					{
						tree.left = null;
					}
					this.cmd("Delete", tmp.graphicID);
					this.cmd("Delete", tmp.heightLabelID);
					this.resizeTree();
				}
				else
				{
					this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
					this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, AVL.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tmp.graphicID);
					this.cmd("Delete", tmp.heightLabelID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left;
						tmp.left.parent = tmp.parent;
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
					}
					this.resizeTree();
				}
				tmp = tmp.parent;
				
				if (this.getHeight(tmp) != Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1)
				{
					tmp.height = Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1
					this.cmd("SetText",tmp.heightLabelID,tmp.height); 
					this.cmd("SetText",  0, "Adjusting height after recursive call");			
					this.cmd("SetForegroundColor", tmp.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", tmp.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
				}
				
				
				
				while (tmp != tree)
				{
					var tmpPar = tmp.parent;
					// TODO:  Add extra animation here?
					if (this.getHeight(tmp.left)- this.getHeight(tmp.right) > 1)
					{
						if (this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left))
						{
							this.doubleRotateRight(tmp);
						}
						else
						{
							this.singleRotateRight(tmp);
						}
					}
					if (tmpPar.right != null)
					{
						if (tmpPar == tree)
						{
							this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tmpPar.left.x, tmpPar.left.y);
							
						}
						else
						{
							this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tmpPar.right.x, tmpPar.right.y);
						}
						this.cmd("Move", this.highlightID, tmpPar.x, tmpPar.y);
						this.cmd("SetText",  0, "Backing up ...");			
						
			if (this.getHeight(tmpPar) != Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1)
			{
				tmpPar.height = Math.max(this.getHeight(tmpPar.left), this.getHeight(tmpPar.right)) + 1
				this.cmd("SetText",tmpPar.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tmpPar.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tmpPar.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}

//28,15,50,7,22,39,55,10,33,42,63,30 .
					    

						this.cmd("Step");
						this.cmd("Delete", this.highlightID);
					}
					tmp = tmpPar;
				}
				if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
				{
					if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
					{
						this.doubleRotateLeft(tree);
					}
					else
					{
						this.singleRotateLeft(tree);
					}					
				}
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
			if (tree.left != null)
			{
				this.cmd("SetText", 0, "Unwinding recursion.");
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.left.x, tree.left.y);
				this.cmd("Move", this.highlightID, tree.x, tree.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			if (this.getHeight(tree.right)- this.getHeight(tree.left) > 1)
			{
				if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right))
				{
					this.doubleRotateLeft(tree);
				}
				else
				{
					this.singleRotateLeft(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);
			if (tree.right != null)
			{
				this.cmd("SetText", 0, "Unwinding recursion.");
				this.cmd("CreateHighlightCircle", this.highlightID, AVL.HIGHLIGHT_COLOR, tree.right.x, tree.right.y);
				this.cmd("Move", this.highlightID, tree.x, tree.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			
			
			if (this.getHeight(tree.left)- this.getHeight(tree.right) > 1)
			{
				if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left))
				{
					this.doubleRotateRight(tree);
				}
				else
				{
					this.singleRotateRight(tree);
				}					
			}
			if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1)
			{
				tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
				this.cmd("SetText",tree.heightLabelID,tree.height); 
				this.cmd("SetText",  0, "Adjusting height after recursive call");			
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HIGHLIGHT_LABEL_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", tree.heightLabelID, AVL.HEIGHT_LABEL_COLOR);						
			}
			
			
		}
	}
	else
	{
		this.cmd("SetText", 0, "Elemet "+valueToDelete+" not found, could not delete");
	}
	
}

AVL.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, AVL.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

AVL.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + AVL.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + AVL.HEIGHT_DELTA, 1)
	}
	
}
AVL.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

AVL.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), AVL.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), AVL.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}


AVL.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

AVL.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}

		
function AVLNode(val, id, hid, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.heightLabelID= hid;
	this.height = 1;
	
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}
		
AVLNode.prototype.isLeftChild = function()		
{
	if (this. parent == null)
	{
		return true;
	}
	return this.parent.left == this;	
}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new AVL(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

BPlusTree.FIRST_PRINT_POS_X = 50;
BPlusTree.PRINT_VERTICAL_GAP = 20;
BPlusTree.PRINT_MAX = 990;
BPlusTree.PRINT_HORIZONTAL_GAP = 50;

BPlusTree.MIN_MAX_DEGREE = 3;
BPlusTree.MAX_MAX_DEGREE = 7;

BPlusTree.HEIGHT_DELTA  = 50;
BPlusTree.NODE_SPACING = 15; 
BPlusTree.STARTING_Y = 30;
BPlusTree.WIDTH_PER_ELEM = 40;
BPlusTree.NODE_HEIGHT = 20;

BPlusTree.MESSAGE_X = 5;
BPlusTree.MESSAGE_Y = 10;

BPlusTree.LINK_COLOR = "#007700";
BPlusTree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
BPlusTree.FOREGROUND_COLOR = "#007700";
BPlusTree.BACKGROUND_COLOR = "#EEFFEE";
BPlusTree.PRINT_COLOR = BPlusTree.FOREGROUND_COLOR;



function BPlusTree(am, w, h)
{
	this.init(am, w, h);

}

BPlusTree.inheritFrom(Algorithm);





BPlusTree.prototype.init = function(am, w, h)
{
	BPlusTree.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	
	this.preemptiveSplit = false
	
	this.starting_x = w / 2;

	this.addControls();
	
	
	this.max_keys = 2;
	this.min_keys = 1;
	this.split_index = 1;
	
	this.max_degree = 3;
	
	
	
	
	this.messageID = this.nextIndex++;
	this.cmd("CreateLabel", this.messageID, "", BPlusTree.MESSAGE_X, BPlusTree.MESSAGE_Y, 0);
	this.moveLabel1ID = this.nextIndex++;
	this.moveLabel2ID = this.nextIndex++;
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.commands = new Array();
	
	this.first_print_pos_y = h - 3 * BPlusTree.PRINT_VERTICAL_GAP;

	
	this.xPosOfNextLabel = 100;
	this.yPosOfNextLabel = 200;
}

BPlusTree.prototype.addControls =  function()
{
	this.controls = [];
	
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);
	
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);
	
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.controls.push(this.deleteField);
	
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.controls.push(this.deleteButton);
	
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.controls.push(this.findField);
	
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.controls.push(this.findButton);
	
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
	this.controls.push(this.printButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
	var i;
	radioButtonNames = [];
	for (i = BPlusTree.MIN_MAX_DEGREE; i <= BPlusTree.MAX_MAX_DEGREE; i++)
	{
		radioButtonNames.push("Max. Degree = " + String(i));
	}
	
	this.maxDegreeRadioButtons = this.addRadioButtonGroupToAlgorithmBar(radioButtonNames, "MaxDegree");
	
	this.maxDegreeRadioButtons[0].checked = true;
	for(i = 0; i < this.maxDegreeRadioButtons.length; i++)
	{
		this.maxDegreeRadioButtons[i].onclick = this.maxDegreeChangedHandler.bind(this,i+BPlusTree.MIN_MAX_DEGREE);
	}
	
	
//	this.premptiveSplitBox = this.addCheckboxToAlgorithmBar("Preemtive Split / Merge (Even max degree only)");
//	this.premptiveSplitBox.onclick = this.premtiveSplitCallback.bind(this);
	
	
	// Other buttons ...
	
}


		
		
				
BPlusTree.prototype.reset = function()
{
	this.nextIndex = 3;
	this.max_degree = 3;
	this.max_keys = 2;
	this.min_keys = 1;
	this.split_index = 1;
	// NOTE: The order of these last two this.commands matters!
	this.treeRoot = null;
	this.ignoreInputs = true;
	// maxDegreeButtonArray[this.max_degree].selected = true;
	this.ignoreInputs = false;
}

		
BPlusTree.prototype.enableUI = function(event)
{
	var i;
	for (i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	for (i = 0; i < this.maxDegreeRadioButtons.length; i++)
	{	
		this.maxDegreeRadioButtons[i].disabled = false;
	}
}

BPlusTree.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}

	for (i = 0; i < this.maxDegreeRadioButtons.length; i++)
	{	
		this.maxDegreeRadioButtons[i].disabled = true;
	}
	
}


//TODO:  Fix me!
BPlusTree.prototype.maxDegreeChangedHandler = function(newMaxDegree, event) 
{
	if (this.max_degree != newMaxDegree)
	{
		this.implementAction(this.changeDegree.bind(this), newMaxDegree);
	}
}
		


BPlusTree.prototype.insertCallback = function(event)
{
	var insertedValue;
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
BPlusTree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(this.deleteField.value, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}
		
BPlusTree.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearTree.bind(this), "");
}
		
		
BPlusTree.prototype.premtiveSplitCallback = function(event)
{
//	if (this.preemptiveSplit != this.premptiveSplitBox.checked)
//	{
//		this.implementAction(this.changePreemtiveSplit.bind(this), this.premptiveSplitBox.checked);
//	}
}

		
BPlusTree.prototype.changePreemtiveSplit = function(newValue)
{
//	this.commands = new Array();
//	this.cmd("Step");
//	this.preemptiveSplit = newValue;
//	if (this.premptiveSplitBox.checked != this.preemptiveSplit)
//	{
//		this.premptiveSplitBox.checked = this.preemptiveSplit;
//	}
//	return this.commands;			
}
		

BPlusTree.prototype.printCallback = function(event) 
{
	this.implementAction(this.printTree.bind(this),"");						
}



BPlusTree.prototype.printTree = function(unused)
{
	
	this.commands = new Array();
	this.cmd("SetText", this.messageID, "Printing tree");
	var firstLabel = this.nextIndex;
	
	if (this.treeRoot != null)
	{
		this.xPosOfNextLabel = BPlusTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		
		var tmp = this.treeRoot;
		
		this.cmd("SetHighlight", tmp.graphicID, 1);
		this.cmd("Step");
		while (!tmp.isLeaf)
		{
			this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.children[0].graphicID, 1);
			this.cmd("Step");
			this.cmd("SetHighlight", tmp.graphicID, 0);
			this.cmd("SetHighlight", tmp.children[0].graphicID, 1);
			this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.children[0].graphicID, 0);
			this.cmd("Step");
			tmp = tmp.children[0];				
		}
		
		while (tmp!= null)
		{
			this.cmd("SetHighlight", tmp.graphicID, 1);
			for (i = 0; i < tmp.numKeys; i++)
			{
				var nextLabelID = this.nextIndex++;
				this.cmd("CreateLabel", nextLabelID, tmp.keys[i], this.getLabelX(tmp, i), tmp.y);
				this.cmd("SetForegroundColor", nextLabelID, BPlusTree.PRINT_COLOR);
				this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
				this.cmd("Step");			
				this.xPosOfNextLabel +=  BPlusTree.PRINT_HORIZONTAL_GAP;
				if (this.xPosOfNextLabel > BPlusTree.PRINT_MAX)
				{
					this.xPosOfNextLabel = BPlusTree.FIRST_PRINT_POS_X;
					this.yPosOfNextLabel += BPlusTree.PRINT_VERTICAL_GAP;
				}
			}
			if (tmp.next != null)
			{
				this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.next.graphicID, 1);
				this.cmd("Step");
				this.cmd("SetEdgeHighlight", tmp.graphicID, tmp.next.graphicID, 0);
			}
			this.cmd("SetHighlight", tmp.graphicID, 0);
			tmp = tmp.next;
		}
		this.cmd("Step");
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = firstLabel;
	}
	this.cmd("SetText", this.messageID, "");
	return this.commands;
}








BPlusTree.prototype.clearTree = function(ignored)
{
	this.commands = new Array();
	this.deleteTree(this.treeRoot);
	this.treeRoot = null;
	this.nextIndex = 3;		
	return this.commands;
}

BPlusTree.prototype.deleteTree = function(tree)
{
	if (tree != null)
	{
		if (!tree.isLeaf)
		{
			for (var i = 0; i <= tree.numKeys; i++)
			{
				this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
				this.deleteTree(tree.children[i]);
				tree.children[i] == null;
			}
		}
		this.cmd("Delete", tree.graphicID);
	}
}


BPlusTree.prototype.changeDegree = function(degree)
{
	this.commands = new Array();
	this.deleteTree(this.treeRoot);
	this.treeRoot = null;
	this.nextIndex = 3;
	var newDegree = degree;
	this.ignoreInputs = true;
	//TODO:  Check me!
	this.maxDegreeRadioButtons[newDegree - BPlusTree.MIN_MAX_DEGREE].checked = true;
	
	this.ignoreInputs = false;
	this.max_degree = newDegree;
	this.max_keys = newDegree - 1;
	this.min_keys = Math.floor((newDegree + 1) / 2) - 1;
	this.split_index = Math.floor((newDegree) / 2);
	if (this.commands.length == 0)
	{
		this.cmd("Step");
	}
	if (newDegree % 2 != 0 && this.preemptiveSplit)
	{
		this.preemptiveSplit = false;
		this.premptiveSplitBox.checked = false;
	}
	return this.commands;
}


BPlusTree.prototype.findCallback = function(event)
{
	var findValue;
	findValue = this.normalizeNumber(this.findField.value, 4);
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}

BPlusTree.prototype.findElement = function(findValue)
{
	this.commands = new Array();
	
	this.cmd("SetText", this.messageID, "Finding " + findValue);
	this.findInTree(this.treeRoot, findValue);
	
	return this.commands;
}



BPlusTree.prototype.findInTree = function(tree, val)
{
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		var i;
		for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
		if (i == tree.numKeys)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
				this.findInTree(tree.children[tree.numKeys], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
			}
		}
		else if (tree.keys[i] > val)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
				this.findInTree(tree.children[i], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
			}
		}
		else
		{
			if (tree.isLeaf)
			{
				this.cmd("SetTextColor", tree.graphicID, "#FF0000", i);
				this.cmd("SetText", this.messageID, "Element " + val + " found");
				this.cmd("Step");
				this.cmd("SetTextColor", tree.graphicID, BPlusTree.FOREGROUND_COLOR, i);
				this.cmd("SetHighlight", tree.graphicID, 0);
				
				this.cmd("Step");
			}
			else
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 0);					
				this.findInTree(tree.children[i+1], val);				
			}
		}
	}
	else
	{
		this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
	}
}


BPlusTree.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	this.cmd("SetText", this.messageID, "Inserting " + insertedValue);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, BPlusTree.STARTING_Y);
		this.cmd("CreateBTreeNode",this.treeRoot.graphicID, BPlusTree.WIDTH_PER_ELEM, BPlusTree.NODE_HEIGHT, 1, this.starting_x, BPlusTree.STARTING_Y, BPlusTree.BACKGROUND_COLOR,  BPlusTree.FOREGROUND_COLOR);
		this.treeRoot.keys[0] = insertedValue;
		this.cmd("SetText", this.treeRoot.graphicID, insertedValue, 0);
	}
	else
	{
		this.insert(this.treeRoot, insertedValue);					
		if (!this.treeRoot.isLeaf)
		{
			this.resizeTree();
		}
	}
	
	this.cmd("SetText", this.messageID, "");
	
	return this.commands;
	
}




BPlusTree.prototype.insert  = function(tree, insertValue)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("Step");
	if (tree.isLeaf)
	{
		this.cmd("SetText", this.messageID, "Inserting " + insertValue + ".  Inserting into a leaf");
		tree.numKeys++;
		this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
		var insertIndex = tree.numKeys - 1;
		while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue)
		{
			tree.keys[insertIndex] = tree.keys[insertIndex - 1];
			this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
			insertIndex--;
		}
		tree.keys[insertIndex] = insertValue;
		this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
		this.cmd("SetHighlight", tree.graphicID, 0);
		if (tree.next != null)
		{
			this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
			this.cmd("Connect", tree.graphicID, 
				tree.next.graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				1, // Directed
				"", // Label
				tree.numKeys);
			
			
		}
		this.resizeTree();
		this.insertRepair(tree);
	}
	else
	{
		var findIndex = 0;
		while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue)
		{
			findIndex++;					
		}				
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 1);
		this.cmd("Step");
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 0);
		this.cmd("SetHighlight", tree.graphicID, 0);
		this.insert(tree.children[findIndex], insertValue);				
	}
}

BPlusTree.prototype.insertRepair = function(tree) 
{
	if (tree.numKeys <= this.max_keys)
	{
		return;
	}
	else if (tree.parent == null)
	{
		this.treeRoot = this.split(tree);
		return;
	}
	else
	{
		var newNode  = this.split(tree);
		this.insertRepair(newNode);
	}			
}

BPlusTree.prototype.split = function(tree)
{
	this.cmd("SetText", this.messageID, "Node now contains too many keys.  Splitting ...");
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID, 0);
	var rightNode = new BTreeNode(this.nextIndex++, tree.x + 100, tree.y);
	
	var risingNode = tree.keys[this.split_index];
	
	var i;
	var parentIndex
	if (tree.parent != null)
	{
		var currentParent = tree.parent;
		for (parentIndex = 0; parentIndex < currentParent.numKeys + 1 && currentParent.children[parentIndex] != tree; parentIndex++);
		if (parentIndex == currentParent.numKeys + 1)
		{
			throw new Error("Couldn't find which child we were!");
		}
		this.cmd("SetNumElements", currentParent.graphicID, currentParent.numKeys + 1);
		for (i = currentParent.numKeys; i > parentIndex; i--)
		{
			currentParent.children[i+1] = currentParent.children[i];
			this.cmd("Disconnect", currentParent.graphicID, currentParent.children[i].graphicID);
			this.cmd("Connect", currentParent.graphicID,  currentParent.children[i].graphicID, BPlusTree.FOREGROUND_COLOR, 
				0, // Curve
				0, // Directed
				"", // Label
				i+1);
			
			currentParent.keys[i] = currentParent.keys[i-1];
			this.cmd("SetText", currentParent.graphicID, currentParent.keys[i] ,i);
		}
		currentParent.numKeys++;
		currentParent.keys[parentIndex] = risingNode;
		this.cmd("SetText", currentParent.graphicID, "", parentIndex);
		this.cmd("CreateLabel", this.moveLabel1ID, risingNode, this.getLabelX(tree, this.split_index),  tree.y)
		this.cmd("Move", this.moveLabel1ID,  this.getLabelX(currentParent, parentIndex),  currentParent.y)
		
		
		
		
		currentParent.children[parentIndex+1] = rightNode;
		rightNode.parent = currentParent;
		
	}
	
	var rightSplit;
	
	if (tree.isLeaf)
	{
		rightSplit = this.split_index;
		rightNode.next = tree.next;
		tree.next = rightNode;
	}
	else
	{
		rightSplit = this.split_index + 1;
	}
	
	rightNode.numKeys = tree.numKeys - rightSplit;
	
	this.cmd("CreateBTreeNode",rightNode.graphicID, BPlusTree.WIDTH_PER_ELEM, BPlusTree.NODE_HEIGHT, tree.numKeys -rightSplit, tree.x, tree.y,  BPlusTree.BACKGROUND_COLOR, BPlusTree.FOREGROUND_COLOR);
	
	if (tree.isLeaf)
	{
		if (rightNode.next != null)
		{
			
			this.cmd("Disconnect", tree.graphicID, rightNode.next.graphicID);
			this.cmd("Connect", rightNode.graphicID, 
				rightNode.next.graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				1, // Directed
				"", // Label
				rightNode.numKeys);
			
			
		}
		this.cmd("Connect", tree.graphicID, 
			rightNode.graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			1, // Directed
			"", // Label
			this.split_index);				
	}
	
	
	for (var i = rightSplit; i < tree.numKeys + 1; i++)
	{
		rightNode.children[i - rightSplit] = tree.children[i];
		if (tree.children[i] != null)
		{
			rightNode.isLeaf = false;
			this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
			
			this.cmd("Connect", rightNode.graphicID, 
				rightNode.children[i - rightSplit].graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i - rightSplit);
			if (tree.children[i] != null)
			{
				tree.children[i].parent = rightNode;
			}
			tree.children[i] = null;
			
		}
	}
	for (i =rightSplit; i < tree.numKeys; i++)
	{
		rightNode.keys[i - rightSplit] = tree.keys[i];
		this.cmd("SetText", rightNode.graphicID, rightNode.keys[i -rightSplit], i - rightSplit);
	}
	var leftNode = tree;
	leftNode.numKeys = this.split_index;
	// TO MAKE UNDO WORK -- CAN REMOVE LATER VV
	for (i = this.split_index; i < tree.numKeys; i++)
	{
		this.cmd("SetText", tree.graphicID, "", i); 
	}
	// TO MAKE UNDO WORK -- CAN REMOVE LATER ^^
	this.cmd("SetNumElements", tree.graphicID, this.split_index);
	
	if (tree.parent != null)
	{
		this.cmd("Connect", currentParent.graphicID, rightNode.graphicID, BPlusTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			parentIndex + 1);
		this.resizeTree();
		this.cmd("Step")
		this.cmd("Delete", this.moveLabel1ID);				
		this.cmd("SetText", currentParent.graphicID, risingNode, parentIndex);
		return tree.parent;
	}
	else //			if (tree.parent == null)
	{
		this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, BPlusTree.STARTING_Y);
		this.cmd("CreateBTreeNode",this.treeRoot.graphicID, BPlusTree.WIDTH_PER_ELEM, BPlusTree.NODE_HEIGHT, 1, this.starting_x, BPlusTree.STARTING_Y,BPlusTree.BACKGROUND_COLOR,  BPlusTree.FOREGROUND_COLOR);
		this.treeRoot.keys[0] = risingNode;
		this.cmd("SetText", this.treeRoot.graphicID, risingNode, 0);
		this.treeRoot.children[0] = leftNode;
		this.treeRoot.children[1] = rightNode;
		leftNode.parent = this.treeRoot;
		rightNode.parent = this.treeRoot;
		this.cmd("Connect", this.treeRoot.graphicID, leftNode.graphicID, BPlusTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			0);	// Connection Point
		this.cmd("Connect", this.treeRoot.graphicID, rightNode.graphicID, BPlusTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			1); // Connection Point
		this.treeRoot.isLeaf = false;
		return this.treeRoot;
	}
	
	
	
}

BPlusTree.prototype.deleteElement = function(deletedValue)
{
	this.commands = new Array();
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, "");
	this.cmd("SetText", 0, "");
	this.doDelete(this.treeRoot, deletedValue);
	if (this.treeRoot.numKeys == 0)
	{
		this.cmd("Delete", this.treeRoot.graphicID);
		this.treeRoot = this.treeRoot.children[0];
		this.treeRoot.parent = null;
		this.resizeTree();
	}
	return this.commands;						
}




BPlusTree.prototype.doDelete = function(tree, val)
{
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		var i;
		for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
		if (i == tree.numKeys)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
				this.doDelete(tree.children[tree.numKeys], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
			}
		}
		else if (!tree.isLeaf && tree.keys[i] == val)
		{
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 1);
			this.cmd("Step");
			this.cmd("SetHighlight", tree.graphicID, 0);
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 0);					
			this.doDelete(tree.children[i+1], val);
		}
		else if (!tree.isLeaf)
		{
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
			this.cmd("Step");
			this.cmd("SetHighlight", tree.graphicID, 0);
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
			this.doDelete(tree.children[i], val);			
		}
		else if (tree.isLeaf && tree.keys[i] == val)
		{
			this.cmd("SetTextColor", tree.graphicID, 0xFF0000, i);
			this.cmd("Step");
			this.cmd("SetTextColor", tree.graphicID, BPlusTree.FOREGROUND_COLOR, i);
			for (var j = i; j < tree.numKeys - 1; j++)
			{
				tree.keys[j] = tree.keys[j+1];
				this.cmd("SetText", tree.graphicID, tree.keys[j], j);
			}
			tree.numKeys--;
			this.cmd("SetText", tree.graphicID, "", tree.numKeys);
			this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
			this.cmd("SetHighlight", tree.graphicID, 0);
			
			if (tree.next != null)
			{
				this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
				this.cmd("Connect", tree.graphicID, 
					tree.next.graphicID,
					BPlusTree.FOREGROUND_COLOR,
					0, // Curve
					1, // Directed
					"", // Label
					tree.numKeys);
			}
			
			// Bit of a hack -- if we remove the smallest element in a leaf, then find the *next* smallest element
			//  (somewhat tricky if the leaf is now empty!), go up our parent stack, and fix index keys
			if (i == 0 && tree.parent != null)
			{
				var nextSmallest = "";
				var parentNode = tree.parent;
				var parentIndex;
				for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
				if (tree.numKeys == 0)
				{
					if (parentIndex == parentNode.numKeys)
					{
						nextSmallest == "";
					}
					else
					{
						nextSmallest = parentNode.children[parentIndex+1].keys[0];			
					}
				}
				else
				{
					nextSmallest = tree.keys[0];
				}
				while (parentNode != null)
				{
					if (parentIndex > 0 && parentNode.keys[parentIndex - 1] == val)
					{
						parentNode.keys[parentIndex - 1] = nextSmallest;
						this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex - 1], parentIndex - 1);								
					}
					var grandParent = parentNode.parent;
					for (parentIndex = 0; grandParent != null && grandParent.children[parentIndex] != parentNode; parentIndex++);
					parentNode = grandParent;
					
				}
				
			}
			this.repairAfterDelete(tree);
			
		}
		else
		{
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		
	}
}



BPlusTree.prototype.mergeRight = function(tree) 
{
	this.cmd("SetText", this.messageID, "Merging node");
	
	var parentNode = tree.parent;
	var parentIndex = 0;
	for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
	var rightSib = parentNode.children[parentIndex+1];
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", parentNode.graphicID, 1);
	this.cmd("SetHighlight", rightSib.graphicID, 1);
	
	this.cmd("Step");
	if (tree.isLeaf)
	{
		this.cmd("SetNumElements", tree.graphicID, tree.numKeys + rightSib.numKeys);
	}
	else
	{
		this.cmd("SetNumElements", tree.graphicID, tree.numKeys + rightSib.numKeys + 1);
		this.cmd("SetText", tree.graphicID, "", tree.numKeys);
		this.cmd("CreateLabel", this.moveLabel1ID, parentNode.keys[parentIndex],  this.getLabelX(parentNode, parentIndex),  parentNode.y);
		tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
	}
	tree.x = (tree.x + rightSib.x) / 2
	this.cmd("SetPosition", tree.graphicID, tree.x,  tree.y);
	
	
	var fromParentIndex = tree.numKeys;
	
	
	for (var i = 0; i < rightSib.numKeys; i++)
	{
		var insertIndex =  tree.numKeys + 1 + i;
		if (tree.isLeaf)
		{
			insertIndex -= 1;
		}
		tree.keys[insertIndex] = rightSib.keys[i];
		this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
		this.cmd("SetText", rightSib.graphicID, "", i);
	}
	if (!tree.isLeaf)
	{
		for (i = 0; i <= rightSib.numKeys; i++)
		{
			this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
			tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
			tree.children[tree.numKeys + 1 + i].parent = tree;
			this.cmd("Connect", tree.graphicID, 
				tree.children[tree.numKeys + 1 + i].graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				tree.numKeys + 1 + i);
		}
		tree.numKeys = tree.numKeys + rightSib.numKeys + 1;
		
	}
	else
	{
		tree.numKeys = tree.numKeys + rightSib.numKeys;
		
		tree.next = rightSib.next;
		if (rightSib.next != null)
		{
			this.cmd("Connect", tree.graphicID, 
				tree.next.graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				1, // Directed
				"", // Label
				tree.numKeys);				
			
		}
	}
	this.cmd("Disconnect", parentNode.graphicID, rightSib.graphicID);
	for (i = parentIndex+1; i < parentNode.numKeys; i++)
	{
		this.cmd("Disconnect", parentNode.graphicID, parentNode.children[i+1].graphicID);
		parentNode.children[i] = parentNode.children[i+1];
		this.cmd("Connect", parentNode.graphicID, 
			parentNode.children[i].graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			i);
		parentNode.keys[i-1] = parentNode.keys[i];
		this.cmd("SetText", parentNode.graphicID, parentNode.keys[i-1], i-1);					
	}
	this.cmd("SetText", parentNode.graphicID, "", parentNode.numKeys - 1);
	parentNode.numKeys--;
	this.cmd("SetNumElements", parentNode.graphicID, parentNode.numKeys);
	this.cmd("SetHighlight", tree.graphicID, 0);
	this.cmd("SetHighlight", parentNode.graphicID, 0);
	this.cmd("SetHighlight", rightSib.graphicID, 0);
	
	this.cmd("Delete", rightSib.graphicID);
	if (!tree.isLeaf)
	{
		this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, fromParentIndex), tree.y);
		this.cmd("Step");
		this.cmd("Delete", this.moveLabel1ID);
		this.cmd("SetText", tree.graphicID, tree.keys[fromParentIndex], fromParentIndex);
	}
	// this.resizeTree();
	
	this.cmd("SetText", this.messageID, "");
	return tree;
}


BPlusTree.prototype.stealFromRight = function(tree, parentIndex) 
{
	// Steal from right sibling
	var parentNode = tree.parent;
	
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys+1);					
	
	this.cmd("SetText", this.messageID, "Stealing from right sibling");
	
	var rightSib = parentNode.children[parentIndex + 1];
	tree.numKeys++;
	
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
	
	if (tree.isLeaf)
	{
		this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.next.graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			1, // Directed
			"", // Label
			tree.numKeys);
	}
	
	
	this.cmd("SetText", tree.graphicID, "",  tree.numKeys - 1);
	this.cmd("SetText", parentNode.graphicID, "", parentIndex);
	this.cmd("SetText", rightSib.graphicID, "", 0);
	
	if (tree.isLeaf)
	{
		this.cmd("CreateLabel", this.moveLabel1ID, rightSib.keys[1], this.getLabelX(rightSib, 1),  rightSib.y)
		this.cmd("CreateLabel", this.moveLabel2ID, rightSib.keys[0], this.getLabelX(rightSib, 0),  rightSib.y)
		tree.keys[tree.numKeys - 1] = rightSib.keys[0];
		parentNode.keys[parentIndex] = rightSib.keys[1];
		
	}
	else
	{
		this.cmd("CreateLabel", this.moveLabel1ID, rightSib.keys[0], this.getLabelX(rightSib, 0),  rightSib.y)
		this.cmd("CreateLabel", this.moveLabel2ID, parentNode.keys[parentIndex], this.getLabelX(parentNode, parentIndex),  parentNode.y)
		tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
		parentNode.keys[parentIndex] = rightSib.keys[0];
	}
	
	
	this.cmd("Move", this.moveLabel1ID, this.getLabelX(parentNode, parentIndex),  parentNode.y);
	this.cmd("Move", this.moveLabel2ID, this.getLabelX(tree, tree.numKeys - 1), tree.y);
	
	this.cmd("Step")
	this.cmd("Delete", this.moveLabel1ID);
	this.cmd("Delete", this.moveLabel2ID);
	
	
	
	
	this.cmd("SetText", tree.graphicID, tree.keys[tree.numKeys - 1], tree.numKeys - 1);
	this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex], parentIndex);
	if (!tree.isLeaf)
	{
		tree.children[tree.numKeys] = rightSib.children[0];
		tree.children[tree.numKeys].parent = tree;
		this.cmd("Disconnect", rightSib.graphicID, rightSib.children[0].graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.children[tree.numKeys].graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			tree.numKeys);	
		// TODO::CHECKME!
		
		for (var i = 1; i < rightSib.numKeys + 1; i++)
		{
			this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
			rightSib.children[i-1] = rightSib.children[i];
			this.cmd("Connect", rightSib.graphicID, 
				rightSib.children[i-1].graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i-1);								
		}
		
	}
	for (i = 1; i < rightSib.numKeys; i++)
	{
		rightSib.keys[i-1] = rightSib.keys[i];
		this.cmd("SetText", rightSib.graphicID, rightSib.keys[i-1], i-1);
	}
	this.cmd("SetText", rightSib.graphicID, "", rightSib.numKeys-1);
	rightSib.numKeys--;
	this.cmd("SetNumElements", rightSib.graphicID, rightSib.numKeys);
	this.resizeTree();
	this.cmd("SetText", this.messageID, "");
	
	if (tree.isLeaf)
	{
		
		if (rightSib.next != null)
		{
			this.cmd("Disconnect", rightSib.graphicID, rightSib.next.graphicID);
			this.cmd("Connect", rightSib.graphicID, 
				rightSib.next.graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				1, // Directed
				"", // Label
				rightSib.numKeys);					
		}
		
	}
	return tree;
	
}


 BPlusTree.prototype.stealFromLeft = function(tree, parentIndex) 
{
	var parentNode = tree.parent;
	// Steal from left sibling
	tree.numKeys++;
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
	
	if (tree.isLeaf && tree.next != null)
	{
		
		this.cmd("Disconnect", tree.graphicID, tree.next.graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.next.graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			1, // Directed
			"", // Label
			tree.numKeys);					
	}
	
	
	this.cmd("SetText", this.messageID, "Node has too few keys.  Stealing from left sibling.");
	
	for (i = tree.numKeys - 1; i > 0; i--)
	{
		tree.keys[i] = tree.keys[i-1];
		this.cmd("SetText", tree.graphicID, tree.keys[i], i);
	}
	var leftSib = parentNode.children[parentIndex -1];
	
	this.cmd("SetText", tree.graphicID, "", 0);
	this.cmd("SetText", parentNode.graphicID, "", parentIndex - 1);
	this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);
	
	
	if (tree.isLeaf)
	{
		this.cmd("CreateLabel", this.moveLabel1ID, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1),  leftSib.y)
		this.cmd("CreateLabel", this.moveLabel2ID,leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1),  leftSib.y)
		tree.keys[0] = leftSib.keys[leftSib.numKeys - 1];
		parentNode.keys[parentIndex-1] = leftSib.keys[leftSib.numKeys - 1];
	}
	else
	{
		this.cmd("CreateLabel", this.moveLabel1ID, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1),  leftSib.y)
		this.cmd("CreateLabel", this.moveLabel2ID, parentNode.keys[parentIndex - 1], this.getLabelX(parentNode, parentIndex - 1),  parentNode.y)
		tree.keys[0] = parentNode.keys[parentIndex - 1];
		parentNode.keys[parentIndex-1] = leftSib.keys[leftSib.numKeys - 1];				
	}
	this.cmd("Move", this.moveLabel1ID, this.getLabelX(parentNode, parentIndex - 1),  parentNode.y);
	this.cmd("Move", this.moveLabel2ID, this.getLabelX(tree, 0), tree.y);
	
	this.cmd("Step")
	this.cmd("Delete", this.moveLabel1ID);
	this.cmd("Delete", this.moveLabel2ID);
	
	
	if (!tree.isLeaf)
	{
		for (var i = tree.numKeys; i > 0; i--)
		{
			this.cmd("Disconnect", tree.graphicID, tree.children[i-1].graphicID);
			tree.children[i] =tree.children[i-1];
			this.cmd("Connect", tree.graphicID, 
				tree.children[i].graphicID,
				BPlusTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i);
		}
		tree.children[0] = leftSib.children[leftSib.numKeys];
		this.cmd("Disconnect", leftSib.graphicID, leftSib.children[leftSib.numKeys].graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.children[0].graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			0);
		leftSib.children[leftSib.numKeys] = null;
		tree.children[0].parent = tree;
		
	}
	
	this.cmd("SetText", tree.graphicID, tree.keys[0], 0);						
	this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex - 1], parentIndex - 1);
	this.cmd("SetText", leftSib.graphicID,"", leftSib.numKeys - 1);
	
	leftSib.numKeys--;
	this.cmd("SetNumElements", leftSib.graphicID, leftSib.numKeys);
	this.resizeTree();
	this.cmd("SetText", this.messageID, "");
	
	
	if (tree.isLeaf)
	{
		this.cmd("Disconnect", leftSib.graphicID, tree.graphicID);
		this.cmd("Connect", leftSib.graphicID, 
			tree.graphicID,
			BPlusTree.FOREGROUND_COLOR,
			0, // Curve
			1, // Directed
			"", // Label
			leftSib.numKeys);
		
	}
	
	
	return tree;
}


BPlusTree.prototype.repairAfterDelete = function(tree)
{
	if (tree.numKeys < this.min_keys)
	{
		if (tree.parent == null)
		{
			if (tree.numKeys == 0)
			{
				this.cmd("Delete", tree.graphicID);
				this.treeRoot = tree.children[0];
				if (this.treeRoot != null)
					this.treeRoot.parent = null;
				this.resizeTree();
			}
		}
		else 
		{
			var parentNode = tree.parent;
			for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
			
			
			if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys)
			{
				this.stealFromLeft(tree, parentIndex);
				
			}
			else if (parentIndex < parentNode.numKeys && parentNode.children[parentIndex + 1].numKeys > this.min_keys)
			{
				this.stealFromRight(tree,parentIndex);
				
			}
			else if (parentIndex == 0)
			{
				// Merge with right sibling
				var nextNode = this.mergeRight(tree);
				this.repairAfterDelete(nextNode.parent);			
			}
			else
			{
				// Merge with left sibling
				nextNode = this.mergeRight(parentNode.children[parentIndex-1]);
				this.repairAfterDelete(nextNode.parent);			
				
			}
			
			
		}
	}
	else if (tree.parent != null)
	{
		
		
	}
}









BPlusTree.prototype.getLabelX = function(tree, index) 
{
	return tree.x - BPlusTree.WIDTH_PER_ELEM * tree.numKeys / 2 + BPlusTree.WIDTH_PER_ELEM / 2 + index * BPlusTree.WIDTH_PER_ELEM;
}

BPlusTree.prototype.resizeTree = function()
{
	this.resizeWidths(this.treeRoot);
	this.setNewPositions(this.treeRoot, this.starting_x, BPlusTree.STARTING_Y);
	this.animateNewPositions(this.treeRoot);
}

BPlusTree.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
		tree.y = yPosition;
		tree.x = xPosition;
		if (!tree.isLeaf)
		{
			var leftEdge = xPosition - tree.width / 2;
			var priorWidth = 0;
			for (var i = 0; i < tree.numKeys+1; i++)
			{
				this.setNewPositions(tree.children[i], leftEdge + priorWidth + tree.widths[i] / 2, yPosition+BPlusTree.HEIGHT_DELTA);
				priorWidth += tree.widths[i];
			}
		}				
	}			
}

BPlusTree.prototype.animateNewPositions = function(tree)
{
	if (tree == null)
	{
		return;
	}
	var i;
	for (i = 0; i < tree.numKeys + 1; i++)
	{
		this.animateNewPositions(tree.children[i]);
	}
	this.cmd("Move", tree.graphicID, tree.x, tree.y);
}

BPlusTree.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	if (tree.isLeaf)
	{
		for (var i = 0; i < tree.numKeys + 1; i++)
		{
			tree.widths[i] = 0;
		}
		tree.width = tree.numKeys * BPlusTree.WIDTH_PER_ELEM + BPlusTree.NODE_SPACING;
		return tree.width;				
	}
	else
	{
		var treeWidth = 0;
		for (i = 0; i < tree.numKeys+1; i++)
		{
			tree.widths[i] = this.resizeWidths(tree.children[i]);
			treeWidth = treeWidth + tree.widths[i];
		}
		treeWidth = Math.max(treeWidth, tree.numKeys * BPlusTree.WIDTH_PER_ELEM + BPlusTree.NODE_SPACING);
		tree.width = treeWidth;
		return treeWidth;
	}
}
	



function BTreeNode(id, initialX, initialY)
{
	this.widths = [];
	this.keys = [];
	this.children = [];
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.numKeys = 1;
	this.isLeaf = true;
	this.parent = null;
	
	this.leftWidth = 0;
	this.rightWidth = 0;
	// Could use children for next pointer, but I got lazy ...
	this.next = null;
	
	
}





var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BPlusTree(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Constants.

BST.LINK_COLOR = "#007700";
BST.HIGHLIGHT_CIRCLE_COLOR = "#007700";
BST.FOREGROUND_COLOR = "#007700";
BST.BACKGROUND_COLOR = "#EEFFEE";
BST.PRINT_COLOR = BST.FOREGROUND_COLOR;

BST.WIDTH_DELTA  = 50;
BST.HEIGHT_DELTA = 50;
BST.STARTING_Y = 50;


BST.FIRST_PRINT_POS_X  = 50;
BST.PRINT_VERTICAL_GAP  = 20;
BST.PRINT_HORIZONTAL_GAP = 50;



function BST(am, w, h)
{
	this.init(am, w, h);
}
BST.inheritFrom(Algorithm);

BST.prototype.init = function(am, w, h)
{
	var sc = BST.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * BST.PRINT_VERTICAL_GAP;
	this.print_max  = w - 10;

	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 10, 0);
	this.nextIndex = 1;
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

BST.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

BST.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

BST.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	// Get text value
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

BST.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


BST.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

BST.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",  this.highlightID);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

BST.prototype.printTreeRec = function(tree)
{
	this.cmd("Step");
	if (tree.left != null)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, BST.PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  BST.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += BST.PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}

BST.prototype.findCallback = function(event)
{
	var findValue;
	findValue = this.normalizeNumber(this.findField.value, 4);
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}

BST.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	this.doFind(this.treeRoot, findValue);
	
	
	return this.commands;
}


BST.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searching for "+value);
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");					
			this.cmd("SetText", 0, "Found:"+value);
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, "Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, "Searching for "+value+" : " + " (Element not found)");					
	}
}

BST.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting "+insertedValue);
	this.highlightID = this.nextIndex++;
	
	if (this.treeRoot == null)
	{
		this.cmd("CreateCircle", this.nextIndex, insertedValue,  this.startingX, BST.STARTING_Y);
		this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
		this.cmd("Step");				
		this.treeRoot = new BSTNode(insertedValue, this.nextIndex, this.startingX, BST.STARTING_Y)
		this.nextIndex += 1;
	}
	else
	{
		this.cmd("CreateCircle", this.nextIndex, insertedValue, 100, 100);
		this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
		this.cmd("Step");				
		var insertElem = new BSTNode(insertedValue, this.nextIndex, 100, 100)
		
		
		this.nextIndex += 1;
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		this.insert(insertElem, this.treeRoot)
		this.resizeTree();				
	}
	this.cmd("SetText", 0, "");				
	return this.commands;
}


BST.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID , 1);
	this.cmd("SetHighlight", elem.graphicID , 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0,  elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID, 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			this.cmd("SetText", 0,"Found null tree, inserting element");				
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
		}
	}
	else
	{
		if (tree.right == null)
		{
			this.cmd("SetText",  0, "Found null tree, inserting element");				
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
			elem.x = tree.x + BST.WIDTH_DELTA/2;
			elem.y = tree.y + BST.HEIGHT_DELTA
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
		}
	}
	
	
}

BST.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, "");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, "");			
	// Do delete
	return this.commands;						
}

BST.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd("SetText", 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd("SetText",  0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");				
		}
		else
		{
			this.cmd("SetText",  0, valueToDelete + " == " + tree.data + ".  Found node to delete");									
		}
		this.cmd("Step");
		this.cmd("SetHighlight",  tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			if (tree.left == null && tree.right == null)
			{
				this.cmd("SetText", 0, "Node to delete is a leaf.  Delete it.");									
				this.cmd("Delete", tree.graphicID);
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
				}
				else
				{
					treeRoot = null;
				}
				this.resizeTree();				
				this.cmd("Step");
				
			}
			else if (tree.left == null)
			{
				this.cmd("SetText", 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect",  tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect",  tree.parent.graphicID, tree.right.graphicID, BST.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
					}
					else
					{
						tree.parent.right = tree.right;
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete", tree.graphicID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
				}
				this.resizeTree();				
			}
			else if (tree.right == null)
			{
				this.cmd("SetText", 0, "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");									
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, BST.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.left;								
					}
					else
					{
						tree.parent.right = tree.left;
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete",  tree.graphicID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
				}
				this.resizeTree();
			}
			else // tree.left != null && tree.right != null
			{
				this.cmd("SetText", 0, "Node to delete has two childern.  \nFind largest node in left subtree.");									
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd("Move", this.highlightID, tmp.x, tmp.y);
				this.cmd("Step");																									
				while (tmp.right != null)
				{
					tmp = tmp.right;
					this.cmd("Move", this.highlightID, tmp.x, tmp.y);
					this.cmd("Step");																									
				}
				this.cmd("SetText", tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
				tree.data = tmp.data;
				this.cmd("Move", labelID, tree.x, tree.y);
				this.cmd("SetText", 0, "Copy largest value of left subtree into node to delete.");									
				
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("Delete", labelID);
				this.cmd("SetText", tree.graphicID, tree.data);
				this.cmd("Delete", this.highlightID);							
				this.cmd("SetText", 0,"Remove node whose value we copied.");									
				
				if (tmp.left == null)
				{
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
					}
					else
					{
						tree.left = null;
					}
					this.cmd("Delete", tmp.graphicID);
					this.resizeTree();
				}
				else
				{
					this.cmd("Disconnect", tmp.parent.graphicID,  tmp.graphicID);
					this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, BST.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tmp.graphicID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left;
						tmp.left.parent = tmp.parent;
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
					}
					this.resizeTree();
				}
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);
		}
	}
	else
	{
		this.cmd("SetText", 0, "Elemet "+valueToDelete+" not found, could not delete");
	}
	
}

BST.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, BST.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

BST.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
		}
		tree.x = xPosition;
		this.setNewPositions(tree.left, xPosition, yPosition + BST.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + BST.HEIGHT_DELTA, 1)
	}
	
}
BST.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

BST.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), BST.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), BST.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}




function BSTNode(val, id, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}

BST.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

BST.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BST(animManag, canvas.width, canvas.height);
	
}
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



BTree.FIRST_PRINT_POS_X = 50;
BTree.PRINT_VERTICAL_GAP = 20;
BTree.PRINT_MAX = 990;
BTree.PRINT_HORIZONTAL_GAP = 50;

BTree.MIN_MAX_DEGREE = 3;
BTree.MAX_MAX_DEGREE = 7;

BTree.HEIGHT_DELTA  = 50;
BTree.NODE_SPACING = 3; 
BTree.STARTING_Y = 30;
BTree.WIDTH_PER_ELEM = 40;
BTree.NODE_HEIGHT = 20;

BTree.MESSAGE_X = 5;
BTree.MESSAGE_Y = 10;

BTree.LINK_COLOR = "#007700";
BTree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
BTree.FOREGROUND_COLOR = "#007700";
BTree.BACKGROUND_COLOR = "#EEFFEE";
BTree.PRINT_COLOR = BTree.FOREGROUND_COLOR;



function BTree(am, w, h, max_degree)
{
	this.initial_max_degree = this.max_degree = max_degree || 3;

	this.init(am, w, h);

}

BTree.inheritFrom(Algorithm);





BTree.prototype.init = function(am, w, h)
{
	BTree.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;

	this.starting_x = w / 2;

	this.preemptiveSplit = false
	
	
	this.addControls();
	
	
	this.max_keys = this.max_degree - 1;
	this.min_keys = Math.floor((this.max_degree + 1) / 2) - 1;
	this.split_index = Math.floor((this.max_degree - 1) / 2);	
	
	
	this.messageID = this.nextIndex++;
	this.cmd("CreateLabel", this.messageID, "", BTree.MESSAGE_X, BTree.MESSAGE_Y, 0);
	this.moveLabel1ID = this.nextIndex++;
	this.moveLabel2ID = this.nextIndex++;
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.commands = new Array();
	
	this.first_print_pos_y = h - 3 * BTree.PRINT_VERTICAL_GAP;

	
	this.xPosOfNextLabel = 100;
	this.yPosOfNextLabel = 200;
}

BTree.prototype.addControls =  function()
{
	this.controls = [];
	
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);
	
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);
	
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.controls.push(this.deleteField);
	
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.controls.push(this.deleteButton);
	
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.controls.push(this.findField);
	
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.controls.push(this.findButton);
	
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
	this.controls.push(this.printButton);
	
	this.clearButton = this.addControlToAlgorithmBar("Button", "Clear");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
	var i;
	radioButtonNames = [];
	for (i = BTree.MIN_MAX_DEGREE; i <= BTree.MAX_MAX_DEGREE; i++)
	{
		radioButtonNames.push("Max. Degree = " + String(i));
	}
	
	this.maxDegreeRadioButtons = this.addRadioButtonGroupToAlgorithmBar(radioButtonNames, "MaxDegree");
	
	this.maxDegreeRadioButtons[0].checked = true;
	for(i = 0; i < this.maxDegreeRadioButtons.length; i++)
	{
		this.maxDegreeRadioButtons[i].onclick = this.maxDegreeChangedHandler.bind(this,i+BTree.MIN_MAX_DEGREE);
	}
	
	
	this.premptiveSplitBox = this.addCheckboxToAlgorithmBar("Preemtive Split / Merge (Even max degree only)");
	this.premptiveSplitBox.onclick = this.premtiveSplitCallback.bind(this);
	
	
	// Other buttons ...
	
}


		
		
				
BTree.prototype.reset = function()
{
	this.nextIndex = 3;

	this.max_degree = this.initial_max_degree;

	this.max_keys = this.max_degree - 1;
	this.min_keys = Math.floor((this.max_degree + 1) / 2) - 1;
	this.split_index = Math.floor((this.max_degree - 1) / 2);	

	// NOTE: The order of these last two this.commands matters!
	this.treeRoot = null;
	this.ignoreInputs = true;
	// maxDegreeButtonArray[this.max_degree].selected = true;
	this.ignoreInputs = false;
}

		
BTree.prototype.enableUI = function(event)
{
	var i;
	for (i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	// TODO  Only enable even maxdegree if preemptive merge is on
	
	if (this.preemptiveSplit)
	{
		var initialEven = BTree.MIN_MAX_DEGREE % 2;
		var i;
		for (i = initialEven; i <= BTree.MAX_MAX_DEGREE - BTree.MIN_MAX_DEGREE; i+= 2)
		{
			this.maxDegreeRadioButtons[i].disabled = false;
		}
	}
	else
	{
		for (i = 0; i < this.maxDegreeRadioButtons.length; i++)
		{	
			this.maxDegreeRadioButtons[i].disabled = false;
		}
	}
	
	
	
	
	
	if (this.max_degree % 2 == 0)
	{
		this.premptiveSplitBox.disabled = false;
	}
	
	
}
BTree.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}

	for (i = 0; i < this.maxDegreeRadioButtons.length; i++)
	{	
		this.maxDegreeRadioButtons[i].disabled = true;
	}
	
	this.premptiveSplitBox.disabled = true;
	
	
	
}


//TODO:  Fix me!
BTree.prototype.maxDegreeChangedHandler = function(newMaxDegree, event) 
{
	if (this.max_degree != newMaxDegree)
	{
		this.implementAction(this.changeDegree.bind(this), newMaxDegree);
        	this.animationManager.skipForward();
    	        animationManager.clearHistory();


	}
}
		


BTree.prototype.insertCallback = function(event)
{
	var insertedValue;
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
BTree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(this.deleteField.value, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}
		
BTree.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearTree.bind(this), "");
}
		
		
BTree.prototype.premtiveSplitCallback = function(event)
{
	if (this.preemptiveSplit != this.premptiveSplitBox.checked)
	{
		this.implementAction(this.changePreemtiveSplit.bind(this), this.premptiveSplitBox.checked);
	}
}

		
BTree.prototype.changePreemtiveSplit = function(newValue)
{
	this.commands = new Array();
	this.cmd("Step");
	this.preemptiveSplit = newValue;
	if (this.premptiveSplitBox.checked != this.preemptiveSplit)
	{
		this.premptiveSplitBox.checked = this.preemptiveSplit;
	}
	return this.commands;			
}
		

BTree.prototype.printCallback = function(event) 
{
	this.implementAction(this.printTree.bind(this),"");						
}

BTree.prototype.printTree = function(unused)
{
	this.commands = new Array();
	this.cmd("SetText", this.messageID, "Printing tree");
	var firstLabel = this.nextIndex;
	
	this.xPosOfNextLabel = BTree.FIRST_PRINT_POS_X;
	this.yPosOfNextLabel = this.first_print_pos_y;
	
	this.printTreeRec(this.treeRoot);
	this.cmd("Step");
	for (var i = firstLabel; i < this.nextIndex; i++)
	{
		this.cmd("Delete", i);
	}
	this.nextIndex = firstLabel;
	this.cmd("SetText", this.messageID, "");
	return this.commands;
}
		
BTree.prototype.printTreeRec =function (tree)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	var nextLabelID;
	if (tree.isLeaf)
	{
		for (var i = 0; i < tree.numKeys;i++)
		{
			nextLabelID = this.nextIndex++;
			this.cmd("CreateLabel", nextLabelID, tree.keys[i], this.getLabelX(tree, i), tree.y);
			this.cmd("SetForegroundColor", nextLabelID, BTree.PRINT_COLOR);
			this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
			this.cmd("Step");			
			this.xPosOfNextLabel +=  BTree.PRINT_HORIZONTAL_GAP;
			if (this.xPosOfNextLabel > BTree.PRINT_MAX)
			{
				this.xPosOfNextLabel = BTree.FIRST_PRINT_POS_X;
				this.yPosOfNextLabel += BTree.PRINT_VERTICAL_GAP;
			}
		}
		this.cmd("SetHighlight", tree.graphicID, 0);
	}
	else
	{
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[0].graphicID, 1);
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[0].graphicID, 0);
		this.printTreeRec(tree.children[0]);
		for (i = 0; i < tree.numKeys; i++)
		{
			this.cmd("SetHighlight", tree.graphicID, 1);
			nextLabelID = this.nextIndex++;
			this.cmd("CreateLabel", nextLabelID, tree.keys[i], this.getLabelX(tree, i), tree.y);
			this.cmd("SetForegroundColor", nextLabelID, BTree.PRINT_COLOR);
			this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
			this.cmd("Step");			
			this.xPosOfNextLabel +=  BTree.PRINT_HORIZONTAL_GAP;
			if (this.xPosOfNextLabel > BTree.PRINT_MAX)
			{
				this.xPosOfNextLabel = BTree.FIRST_PRINT_POS_X;
				this.yPosOfNextLabel += BTree.PRINT_VERTICAL_GAP;
			}
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 1);
			this.cmd("Step");
			this.cmd("SetHighlight", tree.graphicID, 0);
			this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 0);
			this.printTreeRec(tree.children[i+1]);
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		
	}
	
	
}

BTree.prototype.clearTree = function(ignored)
{
	this.commands = new Array();
	this.deleteTree(this.treeRoot);
	this.treeRoot = null;
	this.nextIndex = 3;		
	return this.commands;
}

BTree.prototype.deleteTree = function(tree)
{
	if (tree != null)
	{
		if (!tree.isLeaf)
		{
			for (var i = 0; i <= tree.numKeys; i++)
			{
				this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
				this.deleteTree(tree.children[i]);
				tree.children[i] == null;
			}
		}
		this.cmd("Delete", tree.graphicID);
	}
}


BTree.prototype.changeDegree = function(degree)
{
	this.commands = new Array();
	this.deleteTree(this.treeRoot);
	this.treeRoot = null;
	this.nextIndex = 3;
	var newDegree = degree;
	this.ignoreInputs = true;
	//TODO:  Check me!
	this.maxDegreeRadioButtons[newDegree - BTree.MIN_MAX_DEGREE].checked = true;
	
	this.ignoreInputs = false;
	this.max_degree = newDegree;
	this.max_keys = newDegree - 1;
	this.min_keys = Math.floor((newDegree + 1) / 2) - 1;
	this.split_index = Math.floor((newDegree - 1) / 2);
	if (this.commands.length == 0)
	{
		this.cmd("Step");
	}
	if (newDegree % 2 != 0 && this.preemptiveSplit)
	{
		this.preemptiveSplit = false;
		this.premptiveSplitBox.checked = false;
	}
	return this.commands;
}


BTree.prototype.findCallback = function(event)
{
	var findValue;
	findValue = this.normalizeNumber(this.findField.value, 4);
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}

BTree.prototype.findElement = function(findValue)
{
	this.commands = new Array();
	
	this.cmd("SetText", this.messageID, "Finding " + findValue);
	this.findInTree(this.treeRoot, findValue);
	
	return this.commands;
}

BTree.prototype.findInTree = function(tree, val)
{
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		var i;
		for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
		if (i == tree.numKeys)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
				this.findInTree(tree.children[tree.numKeys], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
			}
		}
		else if (tree.keys[i] > val)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
				this.findInTree(tree.children[i], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
			}
		}
		else
		{
			this.cmd("SetTextColor", tree.graphicID, "#FF0000", i);
			this.cmd("SetText", this.messageID, "Element " + val + " found");
			this.cmd("Step");
			this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
			this.cmd("SetHighlight", tree.graphicID, 0);
			
			this.cmd("Step");
		}
	}
	else
	{
		this.cmd("SetText", this.messageID, "Element " + val + " is not in the tree");
	}
}


BTree.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	this.cmd("SetText", this.messageID, "Inserting " + insertedValue);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, BTree.STARTING_Y);
		this.cmd("CreateBTreeNode",
				 this.treeRoot.graphicID, 
				 BTree.WIDTH_PER_ELEM, BTree.NODE_HEIGHT, 
				 1, 
				 this.starting_x, 
				 BTree.STARTING_Y, 
				 BTree.BACKGROUND_COLOR,  
				 BTree.FOREGROUND_COLOR);
		this.treeRoot.keys[0] = insertedValue;
		this.cmd("SetText", this.treeRoot.graphicID, insertedValue, 0);
	}
	else
	{
		if (this.preemptiveSplit)
		{
			if (this.treeRoot.numKeys == this.max_keys)
			{
				this.split(this.treeRoot)
				this.resizeTree();
				this.cmd("Step");
				
			}
			this.insertNotFull(this.treeRoot, insertedValue);				
		}
		else
		{
			this.insert(this.treeRoot, insertedValue);					
		}
		if (!this.treeRoot.isLeaf)
		{
			this.resizeTree();
		}
	}
	
	this.cmd("SetText", this.messageID, "");
	
	return this.commands;
	
}

BTree.prototype.insertNotFull = function(tree, insertValue)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("Step");
	if (tree.isLeaf)
	{
		this.cmd("SetText", this.messageID, "Inserting " + insertValue + ".  Inserting into a leaf");
		tree.numKeys++;
		this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
		var insertIndex = tree.numKeys - 1;
		while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue)
		{
			tree.keys[insertIndex] = tree.keys[insertIndex - 1];
			this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
			insertIndex--;
		}
		tree.keys[insertIndex] = insertValue;
		this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
		this.cmd("SetHighlight", tree.graphicID, 0);
		this.resizeTree();
	}
	else
	{
		var findIndex = 0;
		while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue)
		{
			findIndex++;					
		}				
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 1);
		this.cmd("Step");
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 0);
		this.cmd("SetHighlight", tree.graphicID, 0);
		if (tree.children[findIndex].numKeys == this.max_keys)
		{
			var newTree = this.split(tree.children[findIndex]);
			this.resizeTree();
			this.cmd("Step");
			this.insertNotFull(newTree, insertValue);
		}
		else
		{
			this.insertNotFull(tree.children[findIndex], insertValue);
		}
	}
}



BTree.prototype.insert = function(tree, insertValue)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("Step");
	if (tree.isLeaf)
	{
		this.cmd("SetText", this.messageID, "Inserting " + insertValue + ".  Inserting into a leaf");
		tree.numKeys++;
		this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
		var insertIndex = tree.numKeys - 1;
		while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue)
		{
			tree.keys[insertIndex] = tree.keys[insertIndex - 1];
			this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
			insertIndex--;
		}
		tree.keys[insertIndex] = insertValue;
		this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
		this.cmd("SetHighlight", tree.graphicID, 0);
		this.resizeTree();
		this.insertRepair(tree);
	}
	else
	{
		var findIndex = 0;
		while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue)
		{
			findIndex++;					
		}				
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 1);
		this.cmd("Step");
		this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[findIndex].graphicID, 0);
		this.cmd("SetHighlight", tree.graphicID, 0);
		this.insert(tree.children[findIndex], insertValue);				
	}
}

BTree.prototype.insertRepair = function(tree) 
{
	if (tree.numKeys <= this.max_keys)
	{
		return;
	}
	else if (tree.parent == null)
	{
		this.treeRoot = this.split(tree);
		return;
	}
	else
	{
		var newNode  = this.split(tree);
		this.insertRepair(newNode);
	}			
}

BTree.prototype.split = function(tree)
{
	this.cmd("SetText", this.messageID, "Node now contains too many keys.  Splitting ...");
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID, 0);
	var rightNode = new BTreeNode(this.nextIndex++, tree.x + 100, tree.y);
	rightNode.numKeys = tree.numKeys - this.split_index - 1;
	var risingNode = tree.keys[this.split_index];
	
	
	if (tree.parent != null)
	{
		var currentParent = tree.parent;
		for (var parentIndex = 0; parentIndex < currentParent.numKeys + 1 && currentParent.children[parentIndex] != tree; parentIndex++);
		if (parentIndex == currentParent.numKeys + 1)
		{
			throw new Error("Couldn't find which child we were!");
		}
		this.cmd("SetNumElements", currentParent.graphicID, currentParent.numKeys + 1);
		for (i = currentParent.numKeys; i > parentIndex; i--)
		{
			currentParent.children[i+1] = currentParent.children[i];
			this.cmd("Disconnect", currentParent.graphicID, currentParent.children[i].graphicID);
			this.cmd("Connect", currentParent.graphicID,  currentParent.children[i].graphicID, BTree.FOREGROUND_COLOR, 
				0, // Curve
				0, // Directed
				"", // Label
				i+1);
			
			currentParent.keys[i] = currentParent.keys[i-1];
			this.cmd("SetText", currentParent.graphicID, currentParent.keys[i] ,i);
		}
		currentParent.numKeys++;
		currentParent.keys[parentIndex] = risingNode;
		this.cmd("SetText", currentParent.graphicID, "", parentIndex);
		this.moveLabel1ID = this.nextIndex++;
		this.cmd("CreateLabel", this.moveLabel1ID, risingNode, this.getLabelX(tree, this.split_index),  tree.y)
		this.cmd("SetForegroundColor", this.moveLabel1ID, BTree.FOREGROUND_COLOR);

		this.cmd("Move", this.moveLabel1ID,  this.getLabelX(currentParent, parentIndex),  currentParent.y)
		
		
		
		
		currentParent.children[parentIndex+1] = rightNode;
		rightNode.parent = currentParent;
		
	}
	
	
	this.cmd("CreateBTreeNode",
			  rightNode.graphicID, 
			  BTree.WIDTH_PER_ELEM, BTree.NODE_HEIGHT, 
			  tree.numKeys - this.split_index - 1, 
			  tree.x, 
			  tree.y,  
			  BTree.BACKGROUND_COLOR, 
			  BTree.FOREGROUND_COLOR);
	
	var i;
	for (i = this.split_index + 1; i < tree.numKeys + 1; i++)
	{
		rightNode.children[i - this.split_index - 1] = tree.children[i];
		if (tree.children[i] != null)
		{
			rightNode.isLeaf = false;
			this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
			
			this.cmd("Connect", rightNode.graphicID, 
				rightNode.children[i - this.split_index - 1].graphicID,
				BTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i - this.split_index - 1);
			if (tree.children[i] != null)
			{
				tree.children[i].parent = rightNode;
			}
			tree.children[i] = null;
			
		}
	}
	for (i = this.split_index+1; i < tree.numKeys; i++)
	{
		rightNode.keys[i - this.split_index - 1] = tree.keys[i];
		this.cmd("SetText", rightNode.graphicID, rightNode.keys[i - this.split_index - 1], i - this.split_index - 1);
	}
	var leftNode = tree;
	leftNode.numKeys = this.split_index;
	// TO MAKE UNDO WORK -- CAN REMOVE LATER VV
	for (i = this.split_index; i < tree.numKeys; i++)
	{
		this.cmd("SetText", tree.graphicID, "", i); 
	}
	// TO MAKE UNDO WORK -- CAN REMOVE LATER ^^
	this.cmd("SetNumElements", tree.graphicID, this.split_index);
	
	if (tree.parent != null)
	{
		this.cmd("Connect", currentParent.graphicID, rightNode.graphicID, BTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			parentIndex + 1);
		this.resizeTree();
		this.cmd("Step")
		this.cmd("Delete", this.moveLabel1ID);				
		this.cmd("SetText", currentParent.graphicID, risingNode, parentIndex);
		return tree.parent;
	}
	else //			if (tree.parent == null)
	{
		this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, BTree.STARTING_Y);
		this.cmd("CreateBTreeNode",
				 this.treeRoot.graphicID, 
				 BTree.WIDTH_PER_ELEM, 
				 BTree.NODE_HEIGHT, 
				 1, 
				 this.starting_x, 
				 BTree.STARTING_Y,
				 BTree.BACKGROUND_COLOR,  
				 BTree.FOREGROUND_COLOR);
		this.treeRoot.keys[0] = risingNode;
		this.cmd("SetText", this.treeRoot.graphicID, risingNode, 0);
		this.treeRoot.children[0] = leftNode;
		this.treeRoot.children[1] = rightNode;
		leftNode.parent = this.treeRoot;
		rightNode.parent = this.treeRoot;
		this.cmd("Connect", this.treeRoot.graphicID, leftNode.graphicID, BTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			0);	// Connection Point
		this.cmd("Connect", this.treeRoot.graphicID, rightNode.graphicID, BTree.FOREGROUND_COLOR, 
			0, // Curve
			0, // Directed
			"", // Label
			1); // Connection Point
		this.treeRoot.isLeaf = false;
		return this.treeRoot;
	}
	
	
	
}

BTree.prototype.deleteElement = function(deletedValue)
{
	this.commands = new Array();
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, "");
	this.highlightID = this.nextIndex++;
	this.cmd("SetText", 0, "");
	if (this.preemptiveSplit)
	{
		this.doDeleteNotEmpty(this.treeRoot, deletedValue);
	}
	else
	{
		this.doDelete(this.treeRoot, deletedValue);
		
	}
	if (this.treeRoot.numKeys == 0)
	{
		this.cmd("Step");
		this.cmd("Delete", this.treeRoot.graphicID);
		this.treeRoot = this.treeRoot.children[0];
		this.treeRoot.parent = null;
		this.resizeTree();
	}
	return this.commands;						
}

BTree.prototype.doDeleteNotEmpty = function(tree, val)
{
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		var i;
		for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
		if (i == tree.numKeys)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
				
				if (tree.children[tree.numKeys].numKeys == this.min_keys)
				{
					var nextNode;
					if (tree.children[tree.numKeys - 1].numKeys > this.min_keys)
					{
						nextNode = this.stealFromLeft(tree.children[tree.numKeys], tree.numKeys)
						this.doDeleteNotEmpty(nextNode, val);
					}
					else
					{
						nextNode = this.mergeRight(tree.children[tree.numKeys - 1])
						this.doDeleteNotEmpty(nextNode, val);
					}
				}
				else
				{
					this.doDeleteNotEmpty(tree.children[tree.numKeys], val);							
				}
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
			}
		}
		else if (tree.keys[i] > val)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
				
				if (tree.children[i].numKeys > this.min_keys)
				{
					this.doDeleteNotEmpty(tree.children[i], val);
				}
				else
				{
					if (tree.children[i+1].numKeys > this.min_keys)
					{
						nextNode = this.stealFromRight(tree.children[i], i);
						this.doDeleteNotEmpty(nextNode, val);
					}
					else
					{
						nextNode = this.mergeRight(tree.children[i]);
						this.doDeleteNotEmpty(nextNode, val);
					}
					
				}
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
			}
		}
		else
		{
			this.cmd("SetTextColor", tree.graphicID, "FF0000", i);
			this.cmd("Step");
			if (tree.isLeaf)
			{
				this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
				for (var j = i; j < tree.numKeys - 1; j++)
				{
					tree.keys[j] = tree.keys[j+1];
					this.cmd("SetText", tree.graphicID, tree.keys[j], j);
				}
				tree.numKeys--;
				this.cmd("SetText", tree.graphicID, "", tree.numKeys);
				this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.resizeTree();
				this.cmd("SetText", this.messageID, "");
				
				
			}
			else
			{
				this.cmd("SetText", this.messageID, "Checking to see if tree to left of element to delete \nhas an extra key");
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);					
				
				
				this.cmd("Step");
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
				var maxNode = tree.children[i];
				
				if (tree.children[i].numKeys == this.min_keys)
				{
					
					this.cmd("SetText", this.messageID, 
							 "Tree to left of element to delete does not have an extra key.  \nLooking to the right ...");
					this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i+1].graphicID, 1);
					this.cmd("Step");
					this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i + 1].graphicID, 0);	
					// Trees to left and right of node to delete don't have enough keys
					//   Do a merge, and then recursively delete the element
					if (tree.children[i+1].numKeys == this.min_keys)
					{
						this.cmd("SetText", this.messageID, 
								 "Neither subtree has extra nodes.  Mergeing around the key to delete, \nand recursively deleting ...");
						this.cmd("Step");
						this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
						nextNode = this.mergeRight(tree.children[i]);
						this.doDeleteNotEmpty(nextNode, val);
						return;
					}
					else
					{
						this.cmd("SetText", this.messageID, 
								 "Tree to right of element to delete does have an extra key. \nFinding the smallest key in that subtree ...");
						this.cmd("Step");
						
						var minNode = tree.children[i+1];
						while (!minNode.isLeaf)
						{
							
							this.cmd("SetHighlight", minNode.graphicID, 1);
							this.cmd("Step")
							this.cmd("SetHighlight", minNode.graphicID, 0);
							if (minNode.children[0].numKeys == this.min_keys)
							{
								if (minNode.children[1].numKeys == this.min_keys)
								{
									minNode = this.mergeRight(minNode.children[0]);
								}
								else
								{
									minNode = this.stealFromRight(minNode.children[0], 0);
								}
							}
							else
							{
								minNode = minNode.children[0];
							}
						}
						
						this.cmd("SetHighlight", minNode.graphicID, 1);
						tree.keys[i] = minNode.keys[0];
						this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
						this.cmd("SetText", tree.graphicID, "", i);
						this.cmd("SetText", minNode.graphicID, "", 0);
						
						this.cmd("CreateLabel", this.moveLabel1ID, minNode.keys[0], this.getLabelX(minNode, 0),  minNode.y)
						this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
						this.cmd("Step");
						this.cmd("Delete", this.moveLabel1ID);
						this.cmd("SetText", tree.graphicID, tree.keys[i], i);
						for (i = 1; i < minNode.numKeys; i++)
						{
							minNode.keys[i-1] = minNode.keys[i]
							this.cmd("SetText", minNode.graphicID, minNode.keys[i-1], i - 1);
						}
						this.cmd("SetText", minNode.graphicID, "",minNode.numKeys - 1);
						
						minNode.numKeys--;
						this.cmd("SetHighlight", minNode.graphicID, 0);
						this.cmd("SetHighlight", tree.graphicID, 0);
						
						this.cmd("SetNumElements", minNode.graphicID, minNode.numKeys);							
						this.resizeTree();
						this.cmd("SetText", this.messageID, "");
						
					}
				}
				else
				{
					
					this.cmd("SetText", this.messageID, 
							 "Tree to left of element to delete does have \nan extra key. Finding the largest key in that subtree ...");
					this.cmd("Step");
					while (!maxNode.isLeaf)
					{
						this.cmd("SetHighlight", maxNode.graphicID, 1);
						this.cmd("Step")
						this.cmd("SetHighlight", maxNode.graphicID, 0);
						if (maxNode.children[maxNode.numKeys].numKeys == this.min_keys)
						{
							if (maxNode.children[maxNode.numKeys - 1] > this.min_keys)
							{
								maxNode = this.stealFromLeft(maxNode.children[maxNode.numKeys], maxNode.numKeys);
							}
							else
							{
								
							}	maxNode = this.mergeRight(maxNode.children[maxNode.numKeys-1]);
						}
						else
						{
							maxNode = maxNode.children[maxNode.numKeys];
						}
					}
					this.cmd("SetHighlight", maxNode.graphicID, 1);
					tree.keys[i] = maxNode.keys[maxNode.numKeys - 1];
					this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
					this.cmd("SetText", tree.graphicID, "", i);
					this.cmd("SetText", maxNode.graphicID, "", maxNode.numKeys - 1);
					this.cmd("CreateLabel", this.moveLabel1ID, tree.keys[i], this.getLabelX(maxNode, maxNode.numKeys - 1),  maxNode.y)
					this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
					this.cmd("Step");
					this.cmd("Delete", this.moveLabel1ID);
					this.cmd("SetText", tree.graphicID, tree.keys[i], i);
					maxNode.numKeys--;
					this.cmd("SetHighlight", maxNode.graphicID, 0);
					this.cmd("SetHighlight", tree.graphicID, 0);
					
					this.cmd("SetNumElements", maxNode.graphicID, maxNode.numKeys);
					this.resizeTree();
					this.cmd("SetText", this.messageID, "");
					
				}
				
			}
		}
		
	}
}		


BTree.prototype.doDelete = function(tree, val)
{
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		this.cmd("Step");
		var i;
		for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
		if (i == tree.numKeys)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[tree.numKeys].graphicID, 0);
				this.doDelete(tree.children[tree.numKeys], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
			}
		}
		else if (tree.keys[i] > val)
		{
			if (!tree.isLeaf)
			{
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 1);
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[i].graphicID, 0);					
				this.doDelete(tree.children[i], val);
			}
			else
			{
				this.cmd("SetHighlight", tree.graphicID, 0);
			}
		}
		else
		{
			this.cmd("SetTextColor", tree.graphicID, "#FF0000", i);
			this.cmd("Step");
			if (tree.isLeaf)
			{
				this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
				for (var j = i; j < tree.numKeys - 1; j++)
				{
					tree.keys[j] = tree.keys[j+1];
					this.cmd("SetText", tree.graphicID, tree.keys[j], j);
				}
				tree.numKeys--;
				this.cmd("SetText", tree.graphicID, "", tree.numKeys);
				this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.repairAfterDelete(tree);
			}
			else
			{
				var maxNode = tree.children[i];
				while (!maxNode.isLeaf)
				{
					this.cmd("SetHighlight", maxNode.graphicID, 1);
					this.cmd("Step")
					this.cmd("SetHighlight", maxNode.graphicID, 0);
					maxNode = maxNode.children[maxNode.numKeys];
				}
				this.cmd("SetHighlight", maxNode.graphicID, 1);
				tree.keys[i] = maxNode.keys[maxNode.numKeys - 1];
				this.cmd("SetTextColor", tree.graphicID, BTree.FOREGROUND_COLOR, i);
				this.cmd("SetText", tree.graphicID, "", i);
				this.cmd("SetText", maxNode.graphicID, "", maxNode.numKeys - 1);
				this.cmd("CreateLabel", this.moveLabel1ID, tree.keys[i], this.getLabelX(maxNode, maxNode.numKeys - 1),  maxNode.y)
				this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
				this.cmd("Step");
				this.cmd("Delete", this.moveLabel1ID);
				this.cmd("SetText", tree.graphicID, tree.keys[i], i);
				maxNode.numKeys--;
				this.cmd("SetHighlight", maxNode.graphicID, 0);
				this.cmd("SetHighlight", tree.graphicID, 0);
				
				this.cmd("SetNumElements", maxNode.graphicID, maxNode.numKeys);
				this.repairAfterDelete(maxNode);					
			}
		}
		
	}
}



BTree.prototype.mergeRight = function(tree) 
{
	this.cmd("SetText", this.messageID, "Merging node");
	
	var parentNode = tree.parent;
	var parentIndex = 0;
	for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
	var rightSib = parentNode.children[parentIndex+1];
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", parentNode.graphicID, 1);
	this.cmd("SetHighlight", rightSib.graphicID, 1);
	
	this.cmd("Step");
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys + rightSib.numKeys + 1);
	tree.x = (tree.x + rightSib.x) / 2
	this.cmd("SetPosition", tree.graphicID, tree.x,  tree.y);
	
	tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
	var fromParentIndex = tree.numKeys;
	//this.cmd("SetText", tree.graphicID, tree.keys[tree.numKeys], tree.numKeys);
	this.cmd("SetText", tree.graphicID, "", tree.numKeys);
	this.cmd("CreateLabel", this.moveLabel1ID, parentNode.keys[parentIndex],  this.getLabelX(parentNode, parentIndex),  parentNode.y);
	
	
	for (var i = 0; i < rightSib.numKeys; i++)
	{
		tree.keys[tree.numKeys + 1 + i] = rightSib.keys[i];
		this.cmd("SetText", tree.graphicID, tree.keys[tree.numKeys + 1 + i], tree.numKeys + 1 + i);
		this.cmd("SetText", rightSib.graphicID, "", i);
	}
	if (!tree.isLeaf)
	{
		for (i = 0; i <= rightSib.numKeys; i++)
		{
			this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
			tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
			tree.children[tree.numKeys + 1 + i].parent = tree;
			this.cmd("Connect", tree.graphicID, 
				tree.children[tree.numKeys + 1 + i].graphicID,
				BTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				tree.numKeys + 1 + i);
		}
	}
	this.cmd("Disconnect", parentNode.graphicID, rightSib.graphicID);
	for (i = parentIndex+1; i < parentNode.numKeys; i++)
	{
		this.cmd("Disconnect", parentNode.graphicID, parentNode.children[i+1].graphicID);
		parentNode.children[i] = parentNode.children[i+1];
		this.cmd("Connect", parentNode.graphicID, 
			parentNode.children[i].graphicID,
			BTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			i);
		parentNode.keys[i-1] = parentNode.keys[i];
		this.cmd("SetText", parentNode.graphicID, parentNode.keys[i-1], i-1);					
	}
	this.cmd("SetText", parentNode.graphicID, "", parentNode.numKeys - 1);
	parentNode.numKeys--;
	this.cmd("SetNumElements", parentNode.graphicID, parentNode.numKeys);
	this.cmd("SetHighlight", tree.graphicID, 0);
	this.cmd("SetHighlight", parentNode.graphicID, 0);
//	this.cmd("SetHighlight", rightSib.graphicID, 0);
	
//	this.cmd("Step");
	this.cmd("Delete", rightSib.graphicID);
	tree.numKeys = tree.numKeys + rightSib.numKeys + 1;
	this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, fromParentIndex), tree.y);
	
	this.cmd("Step");
	// resizeTree();
	this.cmd("Delete", this.moveLabel1ID);
	this.cmd("SetText", tree.graphicID, tree.keys[fromParentIndex], fromParentIndex);
	
	this.cmd("SetText", this.messageID, "");
	return tree;
}


BTree.prototype.stealFromRight = function(tree, parentIndex) 
{
	// Steal from right sibling
	var parentNode = tree.parent;
	
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys+1);					
	
	this.cmd("SetText", this.messageID, "Stealing from right sibling");
	
	var rightSib = parentNode.children[parentIndex + 1];
	tree.numKeys++;
	
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
	
	
	
	
	
	
	
	this.cmd("SetText", tree.graphicID, "",  tree.numKeys - 1);
	this.cmd("SetText", parentNode.graphicID, "", parentIndex);
	this.cmd("SetText", rightSib.graphicID, "", 0);

	var tmpLabel1 = this.nextIndex++;
	var tmpLabel2 = this.nextIndex++;

	
	this.cmd("CreateLabel", tmpLabel1, rightSib.keys[0], this.getLabelX(rightSib, 0),  rightSib.y)
	this.cmd("CreateLabel", tmpLabel2, parentNode.keys[parentIndex], this.getLabelX(parentNode, parentIndex),  parentNode.y)
	this.cmd("SetForegroundColor", tmpLabel1, BTree.FOREGROUND_COLOR);
	this.cmd("SetForegroundColor", tmpLabel2, BTree.FOREGROUND_COLOR);
	
	this.cmd("Move", tmpLabel1, this.getLabelX(parentNode, parentIndex),  parentNode.y);
	this.cmd("Move", tmpLabel2, this.getLabelX(tree, tree.numKeys - 1), tree.y);
	
	this.cmd("Step")
	this.cmd("Delete", tmpLabel1);
	this.cmd("Delete", tmpLabel2);
	tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
	parentNode.keys[parentIndex] = rightSib.keys[0];
	
	
	
	this.cmd("SetText", tree.graphicID, tree.keys[tree.numKeys - 1], tree.numKeys - 1);
	this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex], parentIndex);
	if (!tree.isLeaf)
	{
		tree.children[tree.numKeys] = rightSib.children[0];
		tree.children[tree.numKeys].parent = tree;
		this.cmd("Disconnect", rightSib.graphicID, rightSib.children[0].graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.children[tree.numKeys].graphicID,
			BTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			tree.numKeys);	
		// TODO::CHECKME!
		
		for (var i = 1; i < rightSib.numKeys + 1; i++)
		{
			this.cmd("Disconnect", rightSib.graphicID, rightSib.children[i].graphicID);
			rightSib.children[i-1] = rightSib.children[i];
			this.cmd("Connect", rightSib.graphicID, 
				rightSib.children[i-1].graphicID,
				BTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i-1);								
		}
		
	}
	for (i = 1; i < rightSib.numKeys; i++)
	{
		rightSib.keys[i-1] = rightSib.keys[i];
		this.cmd("SetText", rightSib.graphicID, rightSib.keys[i-1], i-1);
	}
	this.cmd("SetText", rightSib.graphicID, "", rightSib.numKeys-1);
	rightSib.numKeys--;
	this.cmd("SetNumElements", rightSib.graphicID, rightSib.numKeys);
	this.resizeTree();
	this.cmd("SetText", this.messageID, "");
	return tree;
	
}


BTree.prototype.stealFromLeft = function(tree, parentIndex) 
{
	var parentNode = tree.parent;
	// Steal from left sibling
	tree.numKeys++;
	this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
	this.cmd("SetText", this.messageID, "Node has too few keys.  Stealing from left sibling.");
	
	for (i = tree.numKeys - 1; i > 0; i--)
	{
		tree.keys[i] = tree.keys[i-1];
		this.cmd("SetText", tree.graphicID, tree.keys[i], i);
	}
	var leftSib = parentNode.children[parentIndex -1];
	
	this.cmd("SetText", tree.graphicID, "", 0);
	this.cmd("SetText", parentNode.graphicID, "", parentIndex - 1);
	this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);
	
	var tmpLabel1 = this.nextIndex++;
	var tmpLabel2 = this.nextIndex++;
	
	this.cmd("CreateLabel", tmpLabel1, leftSib.keys[leftSib.numKeys - 1], this.getLabelX(leftSib, leftSib.numKeys - 1),  leftSib.y)
	this.cmd("CreateLabel", tmpLabel2, parentNode.keys[parentIndex - 1], this.getLabelX(parentNode, parentIndex - 1),  parentNode.y)
	this.cmd("SetForegroundColor", tmpLabel1, BTree.FOREGROUND_COLOR);
	this.cmd("SetForegroundColor", tmpLabel2, BTree.FOREGROUND_COLOR);

	
	this.cmd("Move", tmpLabel1, this.getLabelX(parentNode, parentIndex - 1),  parentNode.y);
	this.cmd("Move", tmpLabel2, this.getLabelX(tree, 0), tree.y);
	
	this.cmd("Step")
	this.cmd("Delete", tmpLabel1);
	this.cmd("Delete", tmpLabel2);
	
	
	if (!tree.isLeaf)
	{
		for (var i = tree.numKeys; i > 0; i--)
		{
			this.cmd("Disconnect", tree.graphicID, tree.children[i-1].graphicID);
			tree.children[i] =tree.children[i-1];
			this.cmd("Connect", tree.graphicID, 
				tree.children[i].graphicID,
				BTree.FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				"", // Label
				i);
		}
		tree.children[0] = leftSib.children[leftSib.numKeys];
		this.cmd("Disconnect", leftSib.graphicID, leftSib.children[leftSib.numKeys].graphicID);
		this.cmd("Connect", tree.graphicID, 
			tree.children[0].graphicID,
			BTree.FOREGROUND_COLOR,
			0, // Curve
			0, // Directed
			"", // Label
			0);
		leftSib.children[leftSib.numKeys] = null;
		tree.children[0].parent = tree;
		
	}
	
	tree.keys[0] = parentNode.keys[parentIndex - 1];
	this.cmd("SetText", tree.graphicID, tree.keys[0], 0);						
	parentNode.keys[parentIndex-1] = leftSib.keys[leftSib.numKeys - 1];
	this.cmd("SetText", parentNode.graphicID, parentNode.keys[parentIndex - 1], parentIndex - 1);
	this.cmd("SetText", leftSib.graphicID,"", leftSib.numKeys - 1);
	
	leftSib.numKeys--;
	this.cmd("SetNumElements", leftSib.graphicID, leftSib.numKeys);
	this.resizeTree();
	this.cmd("SetText", this.messageID, "");
	return tree;
}


BTree.prototype.repairAfterDelete = function(tree)
{
	if (tree.numKeys < this.min_keys)
	{
		if (tree.parent == null)
		{
			if (tree.numKeys == 0)
			{
				this.cmd("Step");
				this.cmd("Delete", tree.graphicID);
				this.treeRoot = tree.children[0];
				if (this.treeRoot != null)
					this.treeRoot.parent = null;
				this.resizeTree();
			}
		}
		else
		{
			var parentNode = tree.parent;
			for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
			if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys)
			{
				this.stealFromLeft(tree, parentIndex);
				
			}
			else if (parentIndex < parentNode.numKeys && parentNode.children[parentIndex + 1].numKeys > this.min_keys)
			{
				this.stealFromRight(tree,parentIndex);
				
			}
			else if (parentIndex == 0)
			{
				// Merge with right sibling
				var nextNode = this.mergeRight(tree);
				this.repairAfterDelete(nextNode.parent);			
			}
			else
			{
				// Merge with left sibling
				nextNode = this.mergeRight(parentNode.children[parentIndex-1]);
				this.repairAfterDelete(nextNode.parent);			
				
			}
			
			
		}
	}
}

BTree.prototype.getLabelX = function(tree, index) 
{
	return tree.x - BTree.WIDTH_PER_ELEM * tree.numKeys / 2 + BTree.WIDTH_PER_ELEM / 2 + index * BTree.WIDTH_PER_ELEM;
}

BTree.prototype.resizeTree = function()
{
	this.resizeWidths(this.treeRoot);
	this.setNewPositions(this.treeRoot, this.starting_x, BTree.STARTING_Y);
	this.animateNewPositions(this.treeRoot);
}

BTree.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
		tree.y = yPosition;
		tree.x = xPosition;
		if (!tree.isLeaf)
		{
			var leftEdge = xPosition - tree.width / 2;
			var priorWidth = 0;
			for (var i = 0; i < tree.numKeys+1; i++)
			{
				this.setNewPositions(tree.children[i], leftEdge + priorWidth + tree.widths[i] / 2, yPosition+BTree.HEIGHT_DELTA);
				priorWidth += tree.widths[i];
			}
		}				
	}			
}

BTree.prototype.animateNewPositions = function(tree)
{
	if (tree == null)
	{
		return;
	}
	var i;
	for (i = 0; i < tree.numKeys + 1; i++)
	{
		this.animateNewPositions(tree.children[i]);
	}
	this.cmd("Move", tree.graphicID, tree.x, tree.y);
}

BTree.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	if (tree.isLeaf)
	{
		for (var i = 0; i < tree.numKeys + 1; i++)
		{
			tree.widths[i] = 0;
		}
		tree.width = tree.numKeys * BTree.WIDTH_PER_ELEM + BTree.NODE_SPACING;
		return tree.width;				
	}
	else
	{
		var treeWidth = 0;
		for (i = 0; i < tree.numKeys+1; i++)
		{
			tree.widths[i] = this.resizeWidths(tree.children[i]);
			treeWidth = treeWidth + tree.widths[i];
		}
		treeWidth = Math.max(treeWidth, tree.numKeys * BTree.WIDTH_PER_ELEM + BTree.NODE_SPACING);
		tree.width = treeWidth;
		return treeWidth;
	}
}
	



function BTreeNode(id, initialX, initialY)
{
	this.widths = [];
	this.keys = [];
	this.children = [];
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.numKeys = 1;
	this.isLeaf = true;
	this.parent = null;
	
	this.leftWidth = 0;
	this.rightWidth = 0;
	
}





var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BTree(animManag, canvas.width, canvas.height);
}

// Copyright 2016 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIIBTED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Constants.


RadixTree.NODE_WIDTH = 60;

RadixTree.LINK_COLOR = "#007700";
RadixTree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
RadixTree.FOREGROUND_COLOR = "#007700";
RadixTree.BACKGROUND_COLOR = "#CCFFCC";
RadixTree.PRINT_COLOR = RadixTree.FOREGROUND_COLOR;
RadixTree.FALSE_COLOR = "#FFFFFF"
RadixTree.WIDTH_DELTA  = 50;
RadixTree.HEIGHT_DELTA = 80;
RadixTree.STARTING_Y = 80;
RadixTree.LeftMargin = 300;
RadixTree.NEW_NODE_Y = 100
RadixTree.NEW_NODE_X = 50;
RadixTree.FIRST_PRINT_POS_X  = 50;
RadixTree.PRINT_VERTICAL_GAP  = 20;
RadixTree.PRINT_HORIZONTAL_GAP = 50;
    


function RadixTree(am, w, h)
{
	this.init(am, w, h);
}
RadixTree.inheritFrom(Algorithm);

RadixTree.prototype.init = function(am, w, h)
{
	var sc = RadixTree.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * RadixTree.PRINT_VERTICAL_GAP;
	this.print_max  = w - 10;

	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 10, 0);
	this.cmd("CreateLabel", 1, "", 20, 10, 0);
	this.cmd("CreateLabel", 2, "", 20, 30, 0);
	this.nextIndex = 3;
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}



RadixTree.prototype.findIndexDifference = function(s1, s2, id, wordIndex)
{
    var index = 0;
    this.cmd("SetText", 2, "Comparing next letter in search term \n to next letter in prefix of current node");
    
    while  (index < s1.length && index < s2.length)
    {
          this.cmd("SetHighlightIndex", 1, index);
          this.cmd("SetHighlightIndex", id, index);
	  this.cmd("Step");
          this.cmd("SetHighlightIndex", 1, -1);
          this.cmd("SetHighlightIndex", id, -1);

         if (s1.charAt(index) == s2.charAt(index))
         {
             index++;
         }
	 else
         {
               break;
         }
    }
    return index;
}


RadixTree.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeypress = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 12,false);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 12);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 12);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

RadixTree.prototype.reset = function()
{
	this.nextIndex = 3;
	this.root = null;
}

RadixTree.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value.toUpperCase()
        insertedValue = insertedValue.replace(/[^a-z]/gi,'');

	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.add.bind(this), insertedValue);
	}
}

RadixTree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value.toUpperCase();
        deletedValue = deletedValue.replace(/[^a-z]/gi,'');
	if (deletedValue != "")
	{
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


RadixTree.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}



RadixTree.prototype.printTree = function(unused)
{

	this.commands = [];
    
	if (this.root != null)
	{
		this.highlightID = this.nextIndex++;
	        this.printLabel1 = this.nextIndex++;
	        this.printLabel2 = this.nextIndex++;
		var firstLabel = this.nextIndex++;
	        this.cmd("CreateLabel", firstLabel, "Output: ", RadixTree.FIRST_PRINT_POS_X, this.first_print_pos_y);
		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, this.root.x, this.root.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);
	        this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
	        this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
	        this.cmd("AlignRight", this.printLabel2, this.printLabel1);
		this.xPosOfNextLabel = RadixTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.root, "");

//	        this.cmd("SetText", this.printLabel1, "About to delete");
//		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);
		this.cmd("Delete",  this.printLabel1);
		this.cmd("Delete",  this.printLabel2);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;

}




RadixTree.prototype.printTreeRec = function(tree, stringSoFar)
{
    if (tree.wordRemainder != "")
    {
	stringSoFar = stringSoFar + tree.wordRemainder;
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, tree.wordRemainder, tree.x, tree.y, 0);
	this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);
	this.cmd("Step");
	this.cmd("Delete", nextLabelID);
	this.nextIndex--;
	this.cmd("SetText", this.printLabel2, stringSoFar);
    }
    if (tree.isword)
    {
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
	this.cmd("SetForegroundColor", nextLabelID, RadixTree.PRINT_COLOR); 
	this.cmd("AlignRight", nextLabelID, this.printLabel1, RadixTree.PRINT_COLOR); 
	this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  RadixTree.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = RadixTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += RadixTree.PRINT_VERTICAL_GAP;
	}
	

    }
    for (var i = 0; i < 26; i++)
    {
	if (tree.children[i] != null)
	{
	this.cmd("Move", this.highlightID, tree.children[i].x, tree.children[i].y);
	this.cmd("Step");
	this.printTreeRec(tree.children[i], stringSoFar);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("SetText", this.printLabel2, stringSoFar);
	this.cmd("Step");
	    
	}
	
	
    }
}

RadixTree.prototype.findCallback = function(event)
{
	var findValue;

	var findValue = this.insertField.value.toUpperCase()
        findValue = findValue.replace(/[^a-z]/gi,'');
	this.findField.value = "";

	this.implementAction(this.findElement.bind(this),findValue);						
}

RadixTree.prototype.findElement = function(findValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Seaching for: ");
	this.cmd("SetText", 1, findValue);
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        this.highlightID = this.nextIndex++;
	

	var res = this.doFind(this.root, findValue);
	if (res)
        {
   	    this.cmd("SetText", 0, "String " + findValue + " found");
        }
        else
        {
   	    this.cmd("SetText", 0, "String " + findValue + " not found");
        }
        this.cmd("SetText", 1, "");
        this.cmd("SetText", 2, "");
              
	
	return this.commands;
}


RadixTree.prototype.doFind = function(tree, value)
{
    if (tree == null)
    {
         this.cmd("SetText", 2, "Empty tree found.   String not in the tree");
         this.cmd("step");
         return null;
    }

   this.cmd("SetHighlight", tree.graphicID , 1);

    var remain = tree.wordRemainder
 
    var indexDifference = this.findIndexDifference(value, remain, tree.graphicID, 0);

    if (indexDifference == remain.length)
    {
            this.cmd("SetText", 2, "Reached the end of the prefix stored at this node");
            this.cmd("Step");

            if (value.length > indexDifference)
            { 
		this.cmd("SetText", 2, "Recusively search remaining string  \nin the '" +value.charAt(indexDifference) +  "' child");
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID , 0);
		this.cmd("SetText", 1, value.substring(indexDifference));

                var index = value.charCodeAt(indexDifference) - "A".charCodeAt(0);
		var noChild = tree.children[index] == null;


		if (noChild)
                {
 		      this.cmd("SetText", 2, "Child '" +value.charAt(indexDifference) +  "' does not exit.  \nString is not in the tree.");
                      this.cmd("Step");
                      return null;
                 
                }  else {


		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);

		this.cmd("Step")
   	        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);

                }
		
		
                return  this.doFind(tree.children[index], value.substring(indexDifference));
            }

            this.cmd("SetText", 2, "Reached the end of the string.  Check if current node is \"True\"")
            this.cmd("Step");
            this.cmd("SetText", 2, "")
           
            if (tree.isword)
            {
                this.cmd("SetText", 2, "Node is \"True\", string is in tree")
                this.cmd("Step");
                this.cmd("SetText", 2, "")
                this.cmd("SetHighlight", tree.graphicID , 0);
                return tree;

            }
            else
            {
                this.cmd("SetText", 2, "Node is \"False\", string is not in tree")
                this.cmd("Step");
                this.cmd("SetText", 2, "")
                this.cmd("SetHighlight", tree.graphicID , 0);
                return null;

            }
    }
    else
    {
          this.cmd("SetText", 2, "Reached end of search string, \nStill characters remaining at node\nString not in tree")
          this.cmd("Step");
          this.cmd("SetHighlight", tree.graphicID , 0);
          this.cmd("SetText", 2, "")
          return null;

        
    }

}


RadixTree.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting: ");
	this.cmd("SetText", 1, deletedValue);
        this.cmd("AlignRight", 1, 0);
     
        var node = this.doFind(this.root, deletedValue);

        if (node == null)
        {
	    this.cmd("SetText", 2, "String not in the tree, nothing to delete");
            this.cmd("Step");
	    this.cmd("SetText", 0, "");
	    this.cmd("SetText", 1, "");
	    this.cmd("SetText", 2, "");
        }
        else 
        {
	    node.isword = false;
	    this.cmd("SetText", 2, "Found string to delete, setting node to \"False\"")
            this.cmd("Step");
	    this.cmd("SetBackgroundColor", node.graphicID, RadixTree.FALSE_COLOR);
            this.cmd("Step");
	    this.cleanupAfterDelete(node)
	    this.cmd("SetText", 0, "");
	    this.cmd("SetText", 1, "");
	    this.cmd("SetText", 2, "");
        }

	return this.commands;						
}



RadixTree.prototype.numChildren = function(tree)
{
    if (tree == null)
    {
        return 0;
    }
    var children = 0
    for (var i = 0; i < 26; i++)
    {
        if (tree.children[i] != null)
        {
            children++;
        }
    }
    return children;

}


RadixTree.prototype.isLeaf = function(tree)
{
    if (tree == null)
    {
        return false;
    }
    for (var i = 0; i < 26; i++)
    {
        if (tree.children[i] != null)
        {
            return false;
        }
    }
    return true;
}


RadixTree.prototype.getParentIndex = function(tree)
{
     if (tree.parent == null)
     {
        return -1;
     }
     var par = tree.parent;
     for (var i = 0; i < 26; i++)
     {
        if (par.children[i] == tree)
        {
            return i;
        }
     }
     return -1;
}

RadixTree.prototype.cleanupAfterDelete = function(tree)
{
    var children = this.numChildren(tree)

    if (children == 0 && !tree.isword)
    {
         this.cmd("SetText", 2, "Deletion left us with a \"False\" leaf\nRemoving false leaf");
   	 this.cmd("SetHighlight" ,tree.graphicID , 1);
         this.cmd("Step");
   	 this.cmd("SetHighlight", tree.graphicID , 0);
         if (tree.parent != null)
         {
              var index = 0
              while (tree.parent.children[index] != tree)
              {
                  index++;
              }
              this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
       	      this.cmd("Delete", tree.graphicID , 0);
              tree.parent.children[index] = null;
              this.cleanupAfterDelete(tree.parent);
         }
         else
         {
       	      this.cmd("Delete", tree.graphicID , 0);
              this.root = null;
         }
    }
    else if (children == 1 && !tree.isword)
    {
        var childIndex = -1;
        for (var i = 0; i < 26; i++)
        {
            if (tree.children[i] != null) 
            {
		childIndex = i;
                break;
            }
	}
        this.cmd("SetText", 2, "Deletion left us with a \"False\" node\nContaining one child.  Combining ...");
        this.cmd("SetHighlight" ,tree.graphicID , 1);
        this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	
	var child = tree.children[childIndex];
        child.wordRemainder = tree.wordRemainder + child.wordRemainder;
        this.cmd("SetText", child.graphicID, child.wordRemainder);
	this.cmd("Disconnect", tree.graphicID , child.graphicID);
	
        if (tree.parent == null)
        {
            child.parent = null
	    this.root = child;
	    this.cmd("Delete",  tree.graphicID);
        }
	else
	{
	    var parIndex = this.getParentIndex(tree);
	    this.cmd("Disconnect",  tree.parent.graphicID, tree.graphicID);
	    tree.parent.children[parIndex] = child;
            child.parent = tree.parent
	    this.cmd("Connect", tree.parent.graphicID, child.graphicID, RadixTree.FOREGROUND_COLOR, 0, false, child.wordRemainder.charAt(0));
	    this.cmd("Delete",  tree.graphicID);
         
	}
	this.resizeTree();
	
    }


}



RadixTree.prototype.treeDelete = function(tree, valueToDelete)
{
	
}

RadixTree.prototype.resizeTree = function()
{
	this.resizeWidths(this.root);
	if (this.root != null)
	{
	        var startingPoint = this.root.width / 2 + 1 + RadixTree.LeftMargin;
		this.setNewPositions(this.root, startingPoint, RadixTree.STARTING_Y);
		this.animateNewPositions(this.root);
		this.cmd("Step");
	}
	
}


RadixTree.prototype.add = function(word) 
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting; ");
	this.cmd("SetText", 1, word);
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        this.highlightID = this.nextIndex++;
        this.root = this.addR(word.toUpperCase(), this.root, RadixTree.LEFT_MARGIN + RadixTree.NODE_WIDTH / 2 + 1, RadixTree.STARTING_Y, 0);
        this.resizeTree();
	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
       
        return this.commands;
}


RadixTree.prototype.addR = function(s, rt, startX, startY, wordIndex)  
{
    if (rt == null) 
        {
		this.cmd("CreateCircle", this.nextIndex, s, RadixTree.NEW_NODE_X, RadixTree.NEW_NODE_Y); 
		this.cmd("SetForegroundColor", this.nextIndex, RadixTree.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, RadixTree.BACKGROUND_COLOR);
                this.cmd("SetWidth", this.nextIndex, RadixTree.NODE_WIDTH);
	        this.cmd("SetText", 2, "Reached an empty tree.  Creating a node containing " + s);
		this.cmd("Step");				
	        this.cmd("SetText", 2, "" );
                rt = new RadixNode(s, this.nextIndex, startX, startY)
		this.nextIndex += 1;
                rt.isword = true;
               return rt;
        }

	this.cmd("SetHighlight", rt.graphicID , 1);




        var indexDifference = this.findIndexDifference(s, rt.wordRemainder, rt.graphicID, wordIndex);
                
// 	this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
//	this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
//        this.cmd("Step");



        if (indexDifference == rt.wordRemainder.length)
        {
       
            this.cmd("SetText", 2, "Reached the end of the prefix stored at this node");
            this.cmd("Step");

            if (s.length > indexDifference)
            { 
		this.cmd("SetText", 2, "Recusively insert remaining string  \ninto the '" +s.charAt(indexDifference) +  "' child");
                this.cmd("Step");
                this.cmd("SetHighlight", rt.graphicID , 0);
		this.cmd("SetText", 1, s.substring(indexDifference));



		// TODO: HIGHLIGHT CIRCLE!

                var index = s.charCodeAt(indexDifference) - "A".charCodeAt(0);
		var noChild = rt.children[index] == null;


		if (noChild)
                {
 		      this.cmd("SetText", 2, "Child '" +s.charAt(indexDifference) +  "' does not exit.  Creating ...");
                      this.cmd("Step");
                 
                }  else {


		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, rt.x, rt.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);

		this.cmd("Step")
   	        this.cmd("Move", this.highlightID, rt.children[index].x, rt.children[index].y);
		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);
		    // DO HIGHILIGHT CIRCLE THING HERE
                }
		
		
		var connect = rt.children[index] == null;
                rt.children[index] = this.addR(s.substring(indexDifference), rt.children[index], rt.x, rt.y, wordIndex+indexDifference);
		rt.children[index].parent = rt;
                if (connect)
		{
		    this.cmd("Connect", rt.graphicID, rt.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, s.charAt(indexDifference));
                }
                return rt;
            }
            this.cmd("SetText", 2, "Reached the end of the string.  Set Current node to \"True\"")
            this.cmd("Step");
            this.cmd("SetText", 2, "")

            this.cmd("SetBackgroundColor", rt.graphicID, RadixTree.BACKGROUND_COLOR);
            this.cmd("Step");
            this.cmd("SetHighlight", rt.graphicID , 0);

            rt.isword = true;
            return rt;    
        }

        var firstRemainder = rt.wordRemainder.substring(0, indexDifference);
        var secondRemainder = rt.wordRemainder.substring(indexDifference);

        this.cmd("SetText", 2, "Reached a mismatch in prefix. \nCreate a new node with common prefix")

        this.cmd("CreateCircle", this.nextIndex, firstRemainder,  RadixTree.NEW_NODE_X, RadixTree.NEW_NODE_Y);
	this.cmd("SetForegroundColor", this.nextIndex, RadixTree.FOREGROUND_COLOR);
 	this.cmd("SetBackgroundColor", this.nextIndex, RadixTree.FALSE_COLOR);
        this.cmd("SetWidth", this.nextIndex, RadixTree.NODE_WIDTH);
        this.cmd("Step")

        var newNode = new RadixNode(firstRemainder, this.nextIndex, 0, 0);
	this.nextIndex += 1;

        newNode.wordRemainder = firstRemainder;
        
        var index = rt.wordRemainder.charCodeAt(indexDifference) - "A".charCodeAt(0);
        newNode.parent = rt.parent;
        newNode.children[index] = rt;
        if (rt.parent != null)
        {
	    
            this.cmd("Disconnect", rt.parent.graphicID, rt.graphicID);
   	    this.cmd("Connect", rt.parent.graphicID, newNode.graphicID, RadixTree.FOREGROUND_COLOR, 0, false, newNode.wordRemainder.charAt(0));
            var childIndex = newNode.wordRemainder.charCodeAt(0) - 'A'.charCodeAt(0);
            rt.parent.children[childIndex] = newNode;
            rt.parent = newNode;

        }
        else
        {
	    this.root = newNode;
        }
        this.cmd("SetHighlight", rt.graphicID, 0);

        rt.parent = newNode;

        this.cmd("SetText", 2, "Connect new node to the old, and reset prefix stored at previous node");

	this.cmd("Connect", newNode.graphicID, newNode.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, rt.wordRemainder.charAt(indexDifference));
        rt.wordRemainder = secondRemainder;       
         this.cmd("SetText", rt.graphicID, rt.wordRemainder);
        this.cmd("Step");



        this.resizeTree();

        if (indexDifference == s.length)
        {
            newNode.isword = true;
	    this.cmd("SetBackgroundColor", newNode.graphicID, RadixTree.BACKGROUND_COLOR);
        }
        else
        {
	    this.cmd("SetBackgroundColor", newNode.graphicID, RadixTree.FALSE_COLOR);
            index = s.charCodeAt(indexDifference) - "A".charCodeAt(0)
             this.cmd("SetText", 1, s.substring(indexDifference));

            newNode.children[index] = this.addR(s.substring(indexDifference), null, rt.x, rt.y, indexDifference+wordIndex);
	    newNode.children[index].parent = newNode;
	    this.cmd("Connect", newNode.graphicID, newNode.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, s.charAt(indexDifference));

        }      
        return newNode;
    }

RadixTree.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
                tree.x = xPosition;
		tree.y = yPosition;
                var newX = xPosition - tree.width / 2;
                var newY = yPosition + RadixTree.HEIGHT_DELTA;
                for (var i = 0; i < 26; i++)
                { 
                     if (tree.children[i] != null)
                     {
                           this.setNewPositions(tree.children[i], newX + tree.children[i].width / 2, newY);
                           newX = newX + tree.children[i].width;
                     }
                }
	}
	
}
RadixTree.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
                for (var i = 0; i < 26; i++)
                { 
                    this.animateNewPositions(tree.children[i])
                }
	}
}

RadixTree.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
        var size = 0;
	for (var i = 0; i < 26; i++)
	{
            tree.childWidths[i] = this.resizeWidths(tree.children[i]);
            size += tree.childWidths[i]
	}
        tree.width = Math.max(size, RadixTree.NODE_WIDTH  + 4)
        return tree.width;
}




function RadixNode(val, id, initialX, initialY)
{
	this.wordRemainder = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
        this.children = new Array(26);
        this.childWidths = new Array(26);
        for (var i = 0; i < 26; i++)
	{
            this.children[i] = null;
            this.childWidths[i] =0;
	}
        this.width = 0;
	this.parent = null;
        this.isword = false;
}

RadixTree.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

RadixTree.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RadixTree(animManag, canvas.width, canvas.height);
	
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function RedBlack(am, w, h)
{
	this.init(am, w, h);

}
RedBlack.inheritFrom(Algorithm);

RedBlack.prototype.init = function(am, w, h)
{
	var sc = RedBlack.superclass;
	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 1;
	this.commands = [];
	this.startingX = w / 2;
	this.print_max  = w - RedBlack.PRINT_HORIZONTAL_GAP;
	this.first_print_pos_y  = h - 2 * RedBlack.PRINT_VERTICAL_GAP;


	this.cmd("CreateLabel", 0, "", RedBlack.EXPLANITORY_TEXT_X, RedBlack.EXPLANITORY_TEXT_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

RedBlack.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
	
	this.showNullLeaves = this.addCheckboxToAlgorithmBar("Show Null Leaves");
	this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
	this.showNullLeaves.checked = false;;

}

RedBlack.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

RedBlack.FIRST_PRINT_POS_X = 50;
RedBlack.PRINT_VERTICAL_GAP = 20;
RedBlack.PRINT_HORIZONTAL_GAP = 50;


RedBlack.FOREGROUND_RED = "#AA0000";
RedBlack.BACKGROUND_RED = "#FFAAAA";

RedBlack.FOREGROUND_BLACK =  "#000000"
RedBlack.BACKGROUND_BLACK = "#AAAAAA";
RedBlack.BACKGROUND_DOUBLE_BLACK = "#777777";


// var RedBlack.HIGHLIGHT_LABEL_COLOR = RED
// var RedBlack.HIGHLIGHT_LINK_COLOR = RED


RedBlack.HIGHLIGHT_LABEL_COLOR = "#FF0000"
RedBlack.HIGHLIGHT_LINK_COLOR = "#FF0000"

var BLUE = "#0000FF";

RedBlack.LINK_COLOR = "#000000"
RedBlack.BACKGROUND_COLOR = RedBlack.BACKGROUND_BLACK;
RedBlack.HIGHLIGHT_COLOR = "#007700";
RedBlack.FOREGROUND_COLOR = RedBlack.FOREGROUND_BLACK;
RedBlack.PRINT_COLOR = RedBlack.FOREGROUND_COLOR

var widthDelta  = 50;
var heightDelta = 50;
var startingY = 50;


RedBlack.FIRST_PRINT_POS_X  = 40;
RedBlack.PRINT_VERTICAL_GAP  = 20;
RedBlack.PRINT_HORIZONTAL_GAP = 50;
RedBlack.EXPLANITORY_TEXT_X = 10;
RedBlack.EXPLANITORY_TEXT_Y = 10;

RedBlack.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	// Get text value
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

RedBlack.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


RedBlack.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		findValue = this.normalizeNumber(findValue, 4);
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}

RedBlack.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

RedBlack.prototype.showNullLeavesCallback = function(event)
{
	if (this.showNullLeaves.checked)
	{
		this.animationManager.setAllLayers([0,1]);		
	}
	else
	{
		this.animationManager.setAllLayers([0]);
	}
}
		 
		
RedBlack.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = RedBlack.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",this.highlightID);
		this.cmd("Step");
		for (var i = firstLabel; i < this.nextIndex; i++)
			this.cmd("Delete", i);
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

RedBlack.prototype.printTreeRec = function(tree) 
{
	this.cmd("Step");
	if (tree.left != null && !tree.left.phantomLeaf)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, RedBlack.PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  RedBlack.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = RedBlack.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += RedBlack.PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null && !tree.right.phantomLeaf)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}


RedBlack.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	this.doFind(this.treeRoot, findValue);
	
	
	return this.commands;
}


RedBlack.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searchiing for "+value);
	if (tree != null && !tree.phantomLeaf)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");
			this.cmd("SetText", 0, "Found:"+value);
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd("SetText", 0, " Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, " Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, " Searching for "+value+" : " + " (Element not found)");					
	}
}





RedBlack.prototype.findUncle = function(tree)
{
	if (tree.parent == null)
	{
		return null;
	}
	var par  = tree.parent;
	if (par.parent == null)
	{
		return null;
	}
	var grandPar   = par.parent;
	
	if (grandPar.left == par)
	{
		return grandPar.right;
	}
	else
	{
		return grandPar.left;
	}				
}



RedBlack.prototype.blackLevel = function(tree)
{
	if (tree == null)
	{
		return 1;
	}
	else
	{
		return tree.blackLevel;
	}
}


RedBlack.prototype.attachLeftNullLeaf = function(node)
{
	// Add phantom left leaf
	var treeNodeID = this.nextIndex++;
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  node.x, node.y);
	this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_BLACK);
	node.left = new RedBlackNode("", treeNodeID, this.startingX, startingY);
	node.left.phantomLeaf = true;
	this.cmd("SetLayer", treeNodeID, 1);
	node.left.blackLevel = 1;
	this.cmd("Connect",node.graphicID, treeNodeID, RedBlack.LINK_COLOR);
}	

RedBlack.prototype.attachRightNullLeaf = function(node)
{
	// Add phantom right leaf
	treeNodeID = this.nextIndex++;
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  node.x, node.y);
	this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_BLACK);
	node.right = new RedBlackNode("", treeNodeID, this.startingX, startingY);
	this.cmd("SetLayer", treeNodeID, 1);
	
	node.right.phantomLeaf = true;
	node.right.blackLevel = 1;
	this.cmd("Connect", node.graphicID, treeNodeID, RedBlack.LINK_COLOR);
	
}
RedBlack.prototype.attachNullLeaves = function(node)
{
	this.attachLeftNullLeaf(node);
	this.attachRightNullLeaf(node);
}

RedBlack.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();	
	this.cmd("SetText", 0, " Inserting "+insertedValue);
	this.highlightID = this.nextIndex++;
	var treeNodeID;
	if (this.treeRoot == null)
	{
		treeNodeID = this.nextIndex++;
		this.cmd("CreateCircle", treeNodeID, insertedValue,  this.startingX, startingY);
		this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_BLACK);
		this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_BLACK);
		this.treeRoot = new RedBlackNode(insertedValue, treeNodeID, this.startingX, startingY);
		this.treeRoot.blackLevel = 1;
		
		this.attachNullLeaves(this.treeRoot);
		this.resizeTree();
		
	}
	else
	{
		treeNodeID = this.nextIndex++;
		
		this.cmd("CreateCircle", treeNodeID, insertedValue, 30, startingY);
		this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_RED);
		this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_RED);
		this.cmd("Step");				
		var insertElem = new RedBlackNode(insertedValue, treeNodeID, 100, 100)
		
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//				resizeTree();				
	}
	this.cmd("SetText", 0, " ");				
	return this.commands;
}


RedBlack.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	this.cmd("SetText", 0, "Single Rotate Right");
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	
	// TODO:  Change link color
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID); 
		this.cmd("Connect", B.graphicID, t2.graphicID, RedBlack.LINK_COLOR);
		t2.parent = B;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, RedBlack.LINK_COLOR);
	
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd("Disconnect", B.parent.graphicID, B.graphicID, RedBlack.LINK_COLOR);
		this.cmd("Connect", B.parent.graphicID, A.graphicID, RedBlack.LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this.resetHeight(B);
	this.resetHeight(A);
	this.resizeTree();			
	return A;
}



RedBlack.prototype.singleRotateLeft = function(tree) 
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd("SetText", 0, "Single Rotate Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);																		  
		this.cmd("Connect", A.graphicID, t2.graphicID, RedBlack.LINK_COLOR);
		t2.parent = A;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, RedBlack.LINK_COLOR);
	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID, RedBlack.LINK_COLOR);
		this.cmd("Connect", A.parent.graphicID, B.graphicID, RedBlack.LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this.resetHeight(A);
	this.resetHeight(B);
	
	this.resizeTree();
	return B;
}




RedBlack.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

RedBlack.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
		}
	}
}

RedBlack.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", elem.graphicID, 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0, elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null || tree.left.phantomLeaf)
		{
			this.cmd("SetText", 0, "Found null tree (or phantom leaf), inserting element");				
			if (tree.left != null)
			{
				this.cmd("Delete", tree.left.graphicID);
			}
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, RedBlack.LINK_COLOR);
			
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			
			
			this.resizeTree();
			
			this.fixDoubleRed(elem);
			
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
			
		}
	}
	else
	{
		if (tree.right == null  || tree.right.phantomLeaf)
		{
			this.cmd("SetText",  0, "Found null tree (or phantom leaf), inserting element");
			if (tree.right != null)
			{
				this.cmd("Delete", tree.right.graphicID);
			}
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, RedBlack.LINK_COLOR);
			elem.x = tree.x + widthDelta/2;
			elem.y = tree.y + heightDelta
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
			
			
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			this.resizeTree();
			this.fixDoubleRed(elem);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
		}
	}
	
	
}


RedBlack.prototype.fixDoubleRed = function(tree)
{
	if (tree.parent != null)
	{
		if (tree.parent.blackLevel > 0)
		{
			return;
		}
		if (tree.parent.parent == null)
		{
			this.cmd("SetText", 0, "Tree root is red, color it black.");
			this.cmd("Step");
			tree.parent.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.parent.graphicID, RedBlack.FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor", tree.parent.graphicID, RedBlack.BACKGROUND_BLACK);
			return;
		}
		var uncle = this.findUncle(tree);
		if (this.blackLevel(uncle) == 0)
		{
			this.cmd("SetText", 0, "Node and parent are both red.  Uncle of node is red -- push blackness down from grandparent");
			this.cmd("Step");
			
			this.cmd("SetForegroundColor", uncle.graphicID, RedBlack.FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor",uncle.graphicID, RedBlack.BACKGROUND_BLACK);
			uncle.blackLevel = 1;
			
			tree.parent.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.parent.graphicID, RedBlack.FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor",tree.parent.graphicID, RedBlack.BACKGROUND_BLACK);
			
			tree.parent.parent.blackLevel = 0;
			this.cmd("SetForegroundColor", tree.parent.parent.graphicID, RedBlack.FOREGROUND_RED);
			this.cmd("SetBackgroundColor",tree.parent.parent.graphicID, RedBlack.BACKGROUND_RED);
			this.cmd("Step");
			this.fixDoubleRed(tree.parent.parent);
		}
		else
		{
			if (tree.isLeftChild() &&  !tree.parent.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is left child, parent is right child -- rotate");
				this.cmd("Step");
				
				this.singleRotateRight(tree.parent);
				tree=tree.right;
				
			}
			else if (!tree.isLeftChild() && tree.parent.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is right child, parent is left child -- rotate");
				this.cmd("Step");
				
				this.singleRotateLeft(tree.parent);
				tree=tree.left;
			}
			
			if (tree.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is left child, parent is left child\nCan fix extra redness with a single rotation");
				this.cmd("Step");
				
				this.singleRotateRight(tree.parent.parent);
				tree.parent.blackLevel = 1;
				this.cmd("SetForegroundColor", tree.parent.graphicID, RedBlack.FOREGROUND_BLACK);
				this.cmd("SetBackgroundColor",tree.parent.graphicID, RedBlack.BACKGROUND_BLACK);
				
				tree.parent.right.blackLevel = 0;
				this.cmd("SetForegroundColor", tree.parent.right.graphicID, RedBlack.FOREGROUND_RED);
				this.cmd("SetBackgroundColor",tree.parent.right.graphicID, RedBlack.BACKGROUND_RED);						
				
				
			}
			else
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is right child, parent is right child\nCan fix extra redness with a single rotation");
				this.cmd("Step");
				
				this.singleRotateLeft(tree.parent.parent);
				tree.parent.blackLevel = 1;
				this.cmd("SetForegroundColor", tree.parent.graphicID, RedBlack.FOREGROUND_BLACK);
				this.cmd("SetBackgroundColor",tree.parent.graphicID, RedBlack.BACKGROUND_BLACK);
				
				tree.parent.left.blackLevel = 0;
				this.cmd("SetForegroundColor", tree.parent.left.graphicID, RedBlack.FOREGROUND_RED);
				this.cmd("SetBackgroundColor",tree.parent.left.graphicID, RedBlack.BACKGROUND_RED);				
				
			}					
		}
		
	}
	else
	{
		if (tree.blackLevel == 0)
		{
			this.cmd("SetText", 0, "Root of the tree is red.  Color it black");
			this.cmd("Step");
			
			tree.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.graphicID, RedBlack.FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor", tree.graphicID, RedBlack.BACKGROUND_BLACK);
		}
	}
	
}

RedBlack.prototype.deleteElement = function(deletedValue)
{
	this.commands = new Array();
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, " ");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, " ");			
	// Do delete
	return this.commands;						
}


RedBlack.prototype.fixLeftNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;
	this.cmd("SetText", 0, "Coloring 'Null Leaf' double black");
	
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  tree.x, tree.y);
	this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_DOUBLE_BLACK);
	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.blackLevel = 2;
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	tree.left = nullLeaf;
	this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, RedBlack.LINK_COLOR);
	
	this.resizeTree();				
	this.fixExtraBlackChild(tree, true);
	this.cmd("SetLayer", nullLeaf.graphicID, 1);
	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
}


RedBlack.prototype.fixRightNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;
	this.cmd("SetText", 0, "Coloring 'Null Leaf' double black");
	
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  tree.x, tree.y);
	this.cmd("SetForegroundColor", treeNodeID, RedBlack.FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, RedBlack.BACKGROUND_DOUBLE_BLACK);
	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	nullLeaf.blackLevel = 2;
	tree.right = nullLeaf;
	this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, RedBlack.LINK_COLOR);
	
	this.resizeTree();				
	
	this.fixExtraBlackChild(tree, false);
	
	this.cmd("SetLayer", nullLeaf.graphicID, 1);
	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
	
}


RedBlack.prototype.fixExtraBlackChild = function(parNode, isLeftChild)
{
	var sibling;
	var doubleBlackNode;
	if (isLeftChild)
	{
		sibling = parNode.right;
		doubleBlackNode = parNode.left;
	}
	else
	{
		sibling = parNode.left;				
		doubleBlackNode = parNode.right;
	}
	if (this.blackLevel(sibling) > 0 && this.blackLevel(sibling.left) > 0 && this.blackLevel(sibling.right) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling and 2 black nephews.  Push up black level");
		this.cmd("Step");
		sibling.blackLevel = 0;
		this.fixNodeColor(sibling);
		if (doubleBlackNode != null)
		{
			doubleBlackNode.blackLevel = 1;
			this.fixNodeColor(doubleBlackNode);
			
		}
		if (parNode.blackLevel == 0)
		{
			parNode.blackLevel = 1;
			this.fixNodeColor(parNode);
		}
		else
		{
			parNode.blackLevel = 2;
			this.fixNodeColor(parNode);
			this.cmd("SetText", 0, "Pushing up black level created another double black node.  Repeating ...");
			this.cmd("Step");
			this.fixExtraBlack(parNode);
		}				
	}
	else if (this.blackLevel(sibling) == 0)
	{
		this.cmd("SetText", 0, "Double black node has red sibling.  Rotate tree to make sibling black ...");
		this.cmd("Step");
		if (isLeftChild)
		{
			var newPar = this.singleRotateLeft(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 0;
			this.fixNodeColor(newPar.left);
			this.cmd("Step"); // TODO:  REMOVE
			this.fixExtraBlack(newPar.left.left);
			
		}
		else
		{
			newPar  = this.singleRotateRight(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 0;
			this.fixNodeColor(newPar.right);
			this.cmd("Step"); // TODO:  REMOVE

			this.fixExtraBlack(newPar.right.right);
		}
	}
	else if (isLeftChild && this.blackLevel(sibling.right) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, but double black node is a left child, \nand the right nephew is black.  Rotate tree to make opposite nephew red ...");
		this.cmd("Step");
		
		var newSib = this.singleRotateRight(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.right.blackLevel = 0;
		this.fixNodeColor(newSib.right);
		this.cmd("Step");
		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (!isLeftChild && this.blackLevel(sibling.left) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, but double black node is a right child, \nand the left nephew is black.  Rotate tree to make opposite nephew red ...");
		this.cmd("Step");
		newSib = this.singleRotateLeft(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.left.blackLevel = 0;
		this.fixNodeColor(newSib.left);
		this.cmd("Step");
		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (isLeftChild)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, is a left child, and its right nephew is red.\nOne rotation can fix double-blackness.");
		this.cmd("Step");
		
		var oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateLeft(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 1;
			this.fixNodeColor(newPar.left);
		}
		newPar.right.blackLevel = 1;
		this.fixNodeColor(newPar.right);
		if (newPar.left.left != null)
		{
			newPar.left.left.blackLevel = 1;
			this.fixNodeColor(newPar.left.left);
		}
	}
	else
	{
		this.cmd("SetText", 0, "Double black node has black sibling, is a right child, and its left nephew is red.\nOne rotation can fix double-blackness.");
		this.cmd("Step");
		
		oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateRight(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 1;
			this.fixNodeColor(newPar.right);
		}
		newPar.left.blackLevel = 1;
		this.fixNodeColor(newPar.left);
		if (newPar.right.right != null)
		{
			newPar.right.right.blackLevel = 1;
			this.fixNodeColor(newPar.right.right);
		}
	}
}


RedBlack.prototype.fixExtraBlack = function(tree)
{
	if (tree.blackLevel > 1)
	{
		if (tree.parent == null)
		{
			this.cmd("SetText", 0, "Double black node is root.  Make it single black.");
			this.cmd("Step");
			
			tree.blackLevel = 1;
			this.cmd("SetBackgroundColor", tree.graphicID, RedBlack.BACKGROUND_BLACK);
		}
		else if (tree.parent.left == tree)
		{
			this.fixExtraBlackChild(tree.parent, true);
		}
		else
		{
			this.fixExtraBlackChild(tree.parent, false);					
		}
		
	}
	else 
	{
		// No extra blackness
	}
}



RedBlack.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null && !tree.phantomLeaf)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd("SetText", 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd("SetText", 0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");				
		}
		else
		{
			this.cmd("SetText", 0, valueToDelete + " == " + tree.data + ".  Found node to delete");									
		}
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			var needFix = tree.blackLevel > 0;
			if (((tree.left == null) || tree.left.phantomLeaf)  && ((tree.right == null) || tree.right.phantomLeaf))
			{
				this.cmd("SetText",  0, "Node to delete is a leaf.  Delete it.");
				this.cmd("Delete", tree.graphicID);
				
				if (tree.left != null)
				{
					this.cmd("Delete", tree.left.graphicID);
				}
				if (tree.right != null)
				{
					this.cmd("Delete", tree.right.graphicID);
				}
				
				
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
					this.resizeTree();				
					
					if (needFix)
					{
						this.fixLeftNull(tree.parent);
					}
					else
					{
						
						this.attachLeftNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
					this.resizeTree();		
					if (needFix)
					{
						this.fixRightNull(tree.parent);
					}
					else
					{
						this.attachRightNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else
				{
					this.treeRoot = null;
				}
				
			}
			else if (tree.left == null || tree.left.phantomLeaf)
			{
				this.cmd("SetText", 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");									
				if (tree.left != null)
				{
					this.cmd("Delete", tree.left.graphicID);
					tree.left = null;
				}
				
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, RedBlack.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
						if (needFix)
						{
							this.cmd("SetText", 0, "Back node removed.  Increasing child's blackness level");
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
						}
					}
					else
					{
						tree.parent.right = tree.right;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.cmd("SetText", 0, "Back node removed.  Increasing child's blackness level");
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.right);
						}
						
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete", tree.graphicID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
						this.cmd("SetForegroundColor", this.treeRoot.graphicID, RedBlack.FOREGROUND_BLACK);
						this.cmd("SetBackgroundColor", this.treeRoot.graphicID, RedBlack.BACKGROUND_BLACK);		
					}
				}
				this.resizeTree();
			}
			else if (tree.right == null || tree.right.phantomLeaf)
			{
				this.cmd("SetText",  0,"Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");
				if (tree.right != null)
				{
					this.cmd("Delete", tree.right.graphicID);
					tree.right = null;					
				}
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, RedBlack.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.left;
						if (needFix)
						{
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.resizeTree();
								
						}
					}
					else
					{
						tree.parent.right = tree.left;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.resizeTree();								
						}
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete" , tree.graphicID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
						this.fixNodeColor(this.treeRoot);
					}
				}
			}
			else // tree.left != null && tree.right != null
			{
				this.cmd("SetText", 0, "Node to delete has two childern.  \nFind largest node in left subtree.");									
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd("Move", this.highlightID, tmp.x, tmp.y);
				this.cmd("Step");																									
				while (tmp.right != null && !tmp.right.phantomLeaf)
				{
					tmp = tmp.right;
					this.cmd("Move", this.highlightID, tmp.x, tmp.y);
					this.cmd("Step");																									
				}
				if (tmp.right != null)
				{
					this.cmd("Delete", tmp.right.graphicID);
					tmp.right = null;
				}
				this.cmd("SetText", tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
				this.cmd("SetForegroundColor", labelID, BLUE);
				tree.data = tmp.data;
				this.cmd("Move", labelID, tree.x, tree.y);
				this.cmd("SetText", 0, "Copy largest value of left subtree into node to delete.");									
				
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("Delete", labelID);
				this.cmd("SetText", tree.graphicID, tree.data);
				this.cmd("Delete", this.highlightID);							
				this.cmd("SetText", 0, "Remove node whose value we copied.");									
				
				needFix = tmp.blackLevel > 0;
				
				
				if (tmp.left == null)
				{
					this.cmd("Delete", tmp.graphicID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixRightNull(tmp.parent);
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
					else
					{
						tree.left = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixLeftNull(tmp.parent);
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
				}
				else
				{
					this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
					this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, RedBlack.LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tmp.graphicID);
					
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left; 
						tmp.left.parent = tmp.parent;
						this.resizeTree();
						
						if (needFix)
						{
							this.cmd("SetText", 0, "Coloring child of deleted node black");
							this.cmd("Step");
							tmp.left.blackLevel++;
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 0);
							}
							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 1);
							}
							
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
						this.resizeTree();
						if (needFix)
						{
							this.cmd("SetText", 0, "Coloring child of deleted node black");
							this.cmd("Step");
							tmp.left.blackLevel++;
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 0);
							}
							
							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 1);
							}
							
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
				}
				tmp = tmp.parent;
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);					
		}
	}
	else
	{
		this.cmd("SetText", 0, "Elemet "+valueToDelete+" not found, could not delete");
	}
	
}


RedBlack.prototype.fixNodeColor = function(tree)
{
	if (tree.blackLevel == 0)
	{
		this.cmd("SetForegroundColor", tree.graphicID, RedBlack.FOREGROUND_RED);
		this.cmd("SetBackgroundColor", tree.graphicID, RedBlack.BACKGROUND_RED);									
	}
	else
	{
		this.cmd("SetForegroundColor", tree.graphicID, RedBlack.FOREGROUND_BLACK);
		if (tree.blackLevel > 1)
		{
			this.cmd("SetBackgroundColor",tree.graphicID, RedBlack.BACKGROUND_DOUBLE_BLACK);			
		}
		else
		{
			this.cmd("SetBackgroundColor",tree.graphicID, RedBlack.BACKGROUND_BLACK);
		}
	}
}




RedBlack.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

RedBlack.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + heightDelta, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + heightDelta, 1)
	}
	
}
RedBlack.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

RedBlack.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), widthDelta / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), widthDelta / 2);
	return tree.leftWidth + tree.rightWidth;
}


RedBlack.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

RedBlack.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}


/////////////////////////////////////////////////////////
// Red black node
////////////////////////////////////////////////////////


function RedBlackNode(val, id, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.blackLevel = 0;
	this.phantomLeaf = false;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
	this.height = 0;
	this.leftWidth = 0;
	this.rightWidth = 0;
}

RedBlackNode.prototype.isLeftChild = function()
{
	if (this.parent == null)
	{
		return true;
	}
	return this.parent.left == this;
}



/////////////////////////////////////////////////////////
// Setup stuff
////////////////////////////////////////////////////////


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RedBlack(animManag, canvas.width, canvas.height);
}
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Constants.

SplayTree.LINK_COLOR = "#007700";
SplayTree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
SplayTree.FOREGROUND_COLOR = "#007700";
SplayTree.BACKGROUND_COLOR = "#EEFFEE";
SplayTree.PRINT_COLOR = SplayTree.FOREGROUND_COLOR;

SplayTree.WIDTH_DELTA  = 50;
SplayTree.HEIGHT_DELTA = 50;
SplayTree.STARTING_Y = 50;


SplayTree.FIRST_PRINT_POS_X  = 50;
SplayTree.PRINT_VERTICAL_GAP  = 20;
SplayTree.PRINT_HORIZONTAL_GAP = 50;



function SplayTree(am, w, h)
{
	this.init(am, w, h);
}
SplayTree.inheritFrom(Algorithm);

SplayTree.prototype.init = function(am, w, h)
{
	var sc = SplayTree.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * SplayTree.PRINT_VERTICAL_GAP;
	this.print_max  = w - 10;

	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 10, 0);
	this.nextIndex = 1;
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

SplayTree.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

SplayTree.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

SplayTree.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	// Get text value
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

SplayTree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}




//  TODO:  This top-down version is broken.  Don't use
SplayTree.prototype.splay = function(value)
{
	if (this.treeRoot == null)
	{
		return false;
	}
	if (this.treeRoot.data == value)
	{
		return true;
	}
	if (value < this.treeRoot.data)
	{
		if (this.treeRoot.left == null)
		{
			return false;
		}
		else if (this.treeRoot.left.data == value)
		{
			this.singleRotateRight(this.treeRoot);
			return true;
		}
		else if (value < this.treeRoot.left.data)
		{
			if (this.treeRoot.left.left == null)
			{
				this.singleRotateRight(this.treeRoot);
				return this.splay(value);
			}
			else 
			{
				this.zigZigRight(this.treeRoot);
				return this.splay(value);				
			}
		}
		else
		{
			if (this.treeRoot.left.right == null)
			{
				this.singleRotateRight(this.treeRoot);
				return this.splay(value);				
			}
			else
			{
				this.doubleRotateRight(this.treeRoot);
				return this.splay(value);				
			}
			
		}
	}
	else
	{
		if (this.treeRoot.right == null)
		{
			return false;
		}
		else if (this.treeRoot.right.data == value)
		{
			this.singleRotateLeft(this.treeRoot);
			return true;
		}
		else if (value > this.treeRoot.right.data)
		{
			if (this.treeRoot.right.right == null)
			{
				this.singleRotateLeft(this.treeRoot);
				return this.splay(value);
			}
			else 
			{
				this.zigZigLeft(this.treeRoot);
				return this.splay(value);				
			}
		}
		else
		{
			if (this.treeRoot.right.left == null)
			{
				this.singleRotateLeft(this.treeRoot);
				return this.splay(value);				
			}
			else
			{
				this.doubleRotateLeft(this.treeRot);
				return this.splay(value);				
			}
			
		}
		
		
	}
	
}



SplayTree.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

SplayTree.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = SplayTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",  this.highlightID);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

SplayTree.prototype.printTreeRec = function(tree)
{
	this.cmd("Step");
	if (tree.left != null)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, SplayTree.PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  SplayTree.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = SplayTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += SplayTree.PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}

SplayTree.prototype.findCallback = function(event)
{
	var findValue;
	findValue = this.normalizeNumber(this.findField.value, 4);
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}

SplayTree.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
		
	
	
    var found = this.doFind(this.treeRoot, findValue);
	
	if (found)
	{
		this.cmd("SetText", 0, "Element " + findValue + " found.");
		
	}
	else
	{
		this.cmd("SetText", 0, "Element " + findValue + " not found.");
		
	}
	
	
	return this.commands;
}


SplayTree.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searching for "+value);
	if (tree != null)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");					
			this.cmd("SetText", 0, "Splaying found node to root of tree");
			this.cmd("Step");
			this.cmd("SetHighlight", tree.graphicID, 0);
		    this.splayUp(tree);
			return true;
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
					return this.doFind(tree.left, value);
				}
				else
				{
					this.splayUp(tree);
					return false;
				}
			}
			else
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);	
					return this.doFind(tree.right, value);						
				}
				else
				{
					this.splayUp(tree);
					return false;
					
				}
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, "Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, "Searching for "+value+" : " + " (Element not found)");	
		return false;
	}
}

SplayTree.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting "+insertedValue);
	this.highlightID = this.nextIndex++;
	
	if (this.treeRoot == null)
	{
		this.cmd("CreateCircle", this.nextIndex, insertedValue,  this.startingX, SplayTree.STARTING_Y);
		this.cmd("SetForegroundColor", this.nextIndex, SplayTree.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, SplayTree.BACKGROUND_COLOR);
		this.cmd("Step");				
		this.treeRoot = new BSTNode(insertedValue, this.nextIndex, this.startingX, SplayTree.STARTING_Y)
		this.nextIndex += 1;
	}
	else
	{
		this.cmd("CreateCircle", this.nextIndex, insertedValue, 100, 100);
		this.cmd("SetForegroundColor", this.nextIndex, SplayTree.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, SplayTree.BACKGROUND_COLOR);
		this.cmd("Step");				
		var insertElem = new BSTNode(insertedValue, this.nextIndex, 100, 100)
		
		
		this.nextIndex += 1;
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		this.insert(insertElem, this.treeRoot)
		this.resizeTree();
		this.cmd("SetText", 0 , "Splay inserted element to root of tree");
		this.cmd("Step");
		this.splayUp(insertElem);
		
	}
	this.cmd("SetText", 0, "");				
	return this.commands;
}


SplayTree.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID , 1);
	this.cmd("SetHighlight", elem.graphicID , 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0,  elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID, 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null)
		{
			this.cmd("SetText", 0,"Found null tree, inserting element");				
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, SplayTree.LINK_COLOR);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
		}
	}
	else
	{
		if (tree.right == null)
		{
			this.cmd("SetText",  0, "Found null tree, inserting element");				
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, SplayTree.LINK_COLOR);
			elem.x = tree.x + SplayTree.WIDTH_DELTA/2;
			elem.y = tree.y + SplayTree.HEIGHT_DELTA
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
		}
	}
	
	
}

SplayTree.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, "");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, "");			
	// Do delete
	return this.commands;						
}

SplayTree.prototype.treeDelete = function(tree, valueToDelete)
{
	this.cmd("SetText", 0, "Finding "+valueToDelete + " and splaying to rooot");
	this.cmd("Step");

	var inTree = this.doFind(this.treeRoot, valueToDelete);
	this.cmd("SetText", 0, "Removing root, leaving left and right trees");
	this.cmd("Step")
	if (inTree)
	{
		if (this.treeRoot.right == null)
		{
			this.cmd("Delete", this.treeRoot.graphicID);
			this.cmd("SetText", 0, "No right tree, make left tree the root.");
			this.cmd("Step");
			this.treeRoot = this.treeRoot.left;
			this.treeRoot.parent = null;
			this.resizeTree();
		}
		else if (this.treeRoot.left == null)
		{
			this.cmd("Delete", this.treeRoot.graphicID);
			this.cmd("SetText", 0, "No left tree, make right tree the root.");
			this.cmd("Step");
			this.treeRoot = this.treeRoot.right
			this.treeRoot.parent = null;
			this.resizeTree();
		}
		else
		{
			var right = this.treeRoot.right;
			var left = this.treeRoot.left;
			var oldGraphicID = this.treeRoot.graphicID;
			this.cmd("Disconnect", this.treeRoot.graphicID, left.graphicID); 
			this.cmd("Disconnect", this.treeRoot.graphicID, right.graphicID); 
			this.cmd("SetAlpha", this.treeRoot.graphicID, 0);
			this.cmd("SetText", 0, "Splay largest element in left tree to root");
			this.cmd("Step")

			left.parent = null;
			var largestLeft = this.findMax(left);
			this.splayUp(largestLeft);
			this.cmd("SetText", 0, "Left tree now has no right subtree, connect left and right trees");
			this.cmd("Step");
			this.cmd("Connect", largestLeft.graphicID, right.graphicID, SplayTree.LINK_COLOR);
			largestLeft.parent = null;
			largestLeft.right = right;
			right.parent = largestLeft;
			this.treeRoot = largestLeft;
			this.cmd("Delete", oldGraphicID);
			this.resizeTree();
			
		}
	}
}




SplayTree.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	this.cmd("SetText", 0, "Zig Right");
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID);																		  
		this.cmd("Connect", B.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
		t2.parent = B;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, SplayTree.LINK_COLOR);
	A.parent = B.parent;
	if (B.parent == null)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd("Disconnect", B.parent.graphicID, B.graphicID, SplayTree.LINK_COLOR);
		this.cmd("Connect", B.parent.graphicID, A.graphicID, SplayTree.LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this.resizeTree();			
}


SplayTree.prototype.zigZigRight = function(tree)
{
	var C = tree;
	var B = tree.left;
	var A = tree.left.left;
	var t1 = A.left;
	var t2 = A.right;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("SetText", 0, "Zig-Zig Right");
	this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 0);
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 0);
	
	
	if (C.parent != null)
	{
		this.cmd("Disconnect", C.parent.graphicID, C.graphicID);
		this.cmd("Connect", C.parent.graphicID, A.graphicID, SplayTree.LINK_COLOR);
		if (C.isLeftChild())
		{
			C.parent.left = A;
		}
		else
		{
			C.parent.right = A;
		}
	}
	else
	{
		this.treeRoot = A;
	}
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID);
		this.cmd("Connect", B.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
		t2.parent = B;
	}
	if (t3 != null)
	{
		this.cmd("Disconnect", B.graphicID, t3.graphicID);
		this.cmd("Connect", C.graphicID, t3.graphicID, SplayTree.LINK_COLOR);
		t3.parent = C;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, SplayTree.LINK_COLOR);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, C.graphicID, SplayTree.LINK_COLOR);
	
	A.right = B;
	A.parent = C.parent;
	B.parent = A;
	B.left = t2;
	B.right = C;
	C.parent = B;
	C.left = t3;
	this.resizeTree();			
}


SplayTree.prototype.zigZigLeft = function(tree)
{
	var A = tree;
	var B = tree.right;
	var C = tree.right.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = C.left;
	var t4 = C.right;
	
	this.cmd("SetText", 0, "Zig-Zig Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("SetEdgeHighlight", B.graphicID, C.graphicID, 1);
	this.cmd("Step");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 0);
	this.cmd("SetEdgeHighlight", B.graphicID, C.graphicID, 0);
	
	
	
	if (A.parent != null)
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID);
		this.cmd("Connect", A.parent.graphicID, C.graphicID, SplayTree.LINK_COLOR);
		if (A.isLeftChild())
		{
			A.parent.left = C;
		}
		else
		{
			A.parent.right = C;
		}
	}
	else
	{
		this.treeRoot = C;
	}
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);
		this.cmd("Connect", A.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
		t2.parent = A;
	}
	if (t3 != null)
	{
		this.cmd("Disconnect", C.graphicID, t3.graphicID);
		this.cmd("Connect", B.graphicID, t3.graphicID, SplayTree.LINK_COLOR);
		t3.parent = B;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Disconnect", B.graphicID, C.graphicID);
	this.cmd("Connect", C.graphicID, B.graphicID, SplayTree.LINK_COLOR);
	this.cmd("Connect", B.graphicID, A.graphicID, SplayTree.LINK_COLOR);
	C.parent = A.parent;
	A.right = t2;
	B.left = A;
	A.parent = B;
	B.right = t3;
	C.left = B;
	B.parent = C;
	
	this.resizeTree();			

}

SplayTree.prototype.singleRotateLeft = function(tree)
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd("SetText", 0, "Zig Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);																		  
		this.cmd("Connect", A.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
		t2.parent = A;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, SplayTree.LINK_COLOR);
	B.parent = A.parent;
	if (A.parent == null)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID, SplayTree.LINK_COLOR);
		this.cmd("Connect", A.parent.graphicID, B.graphicID, SplayTree.LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	
	this.resizeTree();			
}



SplayTree.prototype.splayUp = function(tree)
{
	if (tree.parent == null)
	{
		return;
	}
	else if (tree.parent.parent == null)
	{
		if (tree.isLeftChild())
		{
			this.singleRotateRight(tree.parent);
			
		}
		else
		{
			this.singleRotateLeft(tree.parent);
		}
	}
	else if (tree.isLeftChild() && !tree.parent.isLeftChild())
	{
		this.doubleRotateLeft(tree.parent.parent);
		this.splayUp(tree);		
		
	}
	else if (!tree.isLeftChild() && tree.parent.isLeftChild())
	{
		this.doubleRotateRight(tree.parent.parent);
		this.splayUp(tree);
	}
	else if (tree.isLeftChild())
	{		
		this.zigZigRight(tree.parent.parent);
		this.splayUp(tree);
	}
	else
	{
		this.zigZigLeft(tree.parent.parent);		
		this.splayUp(tree);
	}
}


SplayTree.prototype.findMax = function(tree)
{
	if (tree.right != null)
	{
		this.highlightID = this.nextIndex++;
		this.cmd("CreateHighlightCircle", this.highlightID, SplayTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
		this.cmd("Step");
		while(tree.right != null)
		{
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			tree = tree.right;
		}
		this.cmd("Delete", this.highlightID);
		return tree;		
	}
	else
	{
		return tree;
	}
}


SplayTree.prototype.doubleRotateRight = function(tree)
{
	this.cmd("SetText", 0, "Zig-Zag Right");
	var A = tree.left;
	var B = tree.left.right;
	var C = tree;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;

	this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 1);
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);

	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, SplayTree.LINK_COLOR);
	}
	if (C.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",C.parent.graphicID, C.graphicID);
		this.cmd("Connect",C.parent.graphicID, B.graphicID, SplayTree.LINK_COLOR);
		if (C.isLeftChild())
		{
			C.parent.left = B
		}
		else
		{
			C.parent.right = B;
		}
		B.parent = C.parent;
		C.parent = B;
	}
	this.cmd("Disconnect", C.graphicID, A.graphicID);
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, SplayTree.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, SplayTree.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	
	this.resizeTree();
	
	
}

SplayTree.prototype.doubleRotateLeft = function(tree)
{
	this.cmd("SetText", 0, "Zig-Zag Left");
	var A = tree;
	var B = tree.right.left;
	var C = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	var t4 = C.right;
	
	this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 1);
	this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);
			 
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect",B.graphicID, t2.graphicID);
		t2.parent = A;
		A.right = t2;
		this.cmd("Connect", A.graphicID, t2.graphicID, SplayTree.LINK_COLOR);
	}
	if (t3 != null)
	{
		this.cmd("Disconnect",B.graphicID, t3.graphicID);
		t3.parent = C;
		C.left = t2;
		this.cmd("Connect", C.graphicID, t3.graphicID, SplayTree.LINK_COLOR);
	}
	
	
	if (A.parent == null)
	{
		B.parent = null;
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect",A.parent.graphicID, A.graphicID);
		this.cmd("Connect",A.parent.graphicID, B.graphicID, SplayTree.LINK_COLOR);
		if (A.isLeftChild())
		{
			A.parent.left = B
		}
		else
		{
			A.parent.right = B;
		}
		B.parent = A.parent;
		A.parent = B;
		
	}
	this.cmd("Disconnect", A.graphicID, C.graphicID);
	this.cmd("Disconnect", C.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, SplayTree.LINK_COLOR);
	this.cmd("Connect", B.graphicID, C.graphicID, SplayTree.LINK_COLOR);
	B.left = A;
	A.parent = B;
	B.right=C;
	C.parent=B;
	A.right=t2;
	C.left = t3;
	
	this.resizeTree();
	
	
}



SplayTree.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, SplayTree.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

SplayTree.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
		}
		tree.x = xPosition;
		this.setNewPositions(tree.left, xPosition, yPosition + SplayTree.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + SplayTree.HEIGHT_DELTA, 1)
	}
	
}
SplayTree.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

SplayTree.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), SplayTree.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), SplayTree.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}


					

function BSTNode(val, id, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}

BSTNode.prototype.isLeftChild = function()		
{
	if (this. parent == null)
	{
		return true;
	}
	return this.parent.left == this;	
}
					
					
SplayTree.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

SplayTree.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new SplayTree(animManag, canvas.width, canvas.height);
	
}
// Copyright 2016 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIIBTED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Constants.


Trie.NODE_WIDTH = 30;

Trie.LINK_COLOR = "#007700";
Trie.HIGHLIGHT_CIRCLE_COLOR = "#007700";
Trie.FOREGROUND_COLOR = "#007700";
Trie.BACKGROUND_COLOR = "#CCFFCC";
Trie.TRUE_COLOR = "#CCFFCC";
Trie.PRINT_COLOR = Trie.FOREGROUND_COLOR;
Trie.FALSE_COLOR = "#FFFFFF"
Trie.WIDTH_DELTA  = 50;
Trie.HEIGHT_DELTA = 50;
Trie.STARTING_Y = 80;
Trie.LeftMargin = 300;
Trie.NEW_NODE_Y = 100
Trie.NEW_NODE_X = 50;
Trie.FIRST_PRINT_POS_X  = 50;
Trie.PRINT_VERTICAL_GAP  = 20;
Trie.PRINT_HORIZONTAL_GAP = 50;
    


function Trie(am, w, h)
{
	this.init(am, w, h);
}
Trie.inheritFrom(Algorithm);

Trie.prototype.init = function(am, w, h)
{
	var sc = Trie.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * Trie.PRINT_VERTICAL_GAP;
	this.print_max  = w - 10;

	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 10, 0);
	this.cmd("CreateLabel", 1, "", 20, 10, 0);
	this.cmd("CreateLabel", 2, "", 20, 30, 0);
	this.nextIndex = 3;
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


Trie.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeypress = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 12,false);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 12);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 12);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = this.addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

Trie.prototype.reset = function()
{
	this.nextIndex = 3;
	this.root = null;
}

Trie.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value.toUpperCase()
        insertedValue = insertedValue.replace(/[^a-z]/gi,'');

	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.add.bind(this), insertedValue);
	}
}

Trie.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value.toUpperCase();
        deletedValue = deletedValue.replace(/[^a-z]/gi,'');
	if (deletedValue != "")
	{
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}

}


Trie.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}



Trie.prototype.findCallback = function(event)
{
	var findValue = this.findField.value.toUpperCase()
        finndValue = findValue.replace(/[^a-z]/gi,'');
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}



Trie.prototype.printTree = function(unused)
{

	this.commands = [];
    
	if (this.root != null)
	{
		this.highlightID = this.nextIndex++;
	        this.printLabel1 = this.nextIndex++;
	        this.printLabel2 = this.nextIndex++;
		var firstLabel = this.nextIndex++;
	        this.cmd("CreateLabel", firstLabel, "Output: ", Trie.FIRST_PRINT_POS_X, this.first_print_pos_y);
		this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, this.root.x, this.root.y);
                this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
	        this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
	        this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
	        this.cmd("AlignRight", this.printLabel2, this.printLabel1);
		this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.root, "");

		this.cmd("Delete",  this.highlightID);
		this.cmd("Delete",  this.printLabel1);
		this.cmd("Delete",  this.printLabel2);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;

}



Trie.prototype.printTreeRec = function(tree, stringSoFar)
{
    if (tree.wordRemainder != "")
    {
    }
    if (tree.isword)
    {
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
	this.cmd("SetForegroundColor", nextLabelID, Trie.PRINT_COLOR); 
	this.cmd("AlignRight", nextLabelID, this.printLabel1, Trie.PRINT_COLOR); 
	this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  Trie.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += Trie.PRINT_VERTICAL_GAP;
	}
	

    }
    for (var i = 0; i < 26; i++)
    {
	if (tree.children[i] != null)
	{

	var stringSoFar2 = stringSoFar + tree.children[i].wordRemainder;
	var nextLabelID = this.nextIndex++;
	var fromx =  (tree.children[i].x + tree.x) / 2 + Trie.NODE_WIDTH / 2;
	var fromy =  (tree.children[i].y + tree.y) / 2;
        this.cmd("CreateLabel", nextLabelID, tree.children[i].wordRemainder,fromx, fromy, 0);
	this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);
	this.cmd("Move", this.highlightID, tree.children[i].x, tree.children[i].y);
	this.cmd("Step");
	this.cmd("Delete", nextLabelID);
	this.nextIndex--;
	this.cmd("SetText", this.printLabel2, stringSoFar2);

	this.printTreeRec(tree.children[i], stringSoFar2);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("SetText", this.printLabel2, stringSoFar);
	this.cmd("Step");
	    
	}
	
	
    }
}



Trie.prototype.findElement = function(word)
{
	this.commands = [];
	
	this.commands = new Array();	
	this.cmd("SetText", 0, "Finding: ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");

	
	var node = this.doFind(this.root, word);
        if (node != null)
        {
             this.cmd("SetText", 0, "Found \""+word+"\"");
        }
        else
        {
             this.cmd("SetText", 0, "\""+word+"\" not Found");
        }

        this.cmd("SetText", 1, "");
        this.cmd("SetText", 2, "");
	
	return this.commands;
}


Trie.prototype.doFind = function(tree, s)
{

    if (tree == null)
    {
	return null;
    }
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
        if (tree.isword == true)
        {
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is True\nWord is in the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return tree
	}
	else
	{
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is False\nWord is Not the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return null

	}
    }
    else 
    {
       this.cmd("SetHighlightIndex", 1, 1);
       var index = s.charCodeAt(0) - "A".charCodeAt(0);
       if (tree.children[index] == null)
       {
            this.cmd("SetText", 2, "Child " + s.charAt(0) + " does not exist\nWord is Not the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return null
        }
 	this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
        this.cmd("SetText", 2, "Making recursive call to " + s.charAt(0) + " child, passing in " + s.substring(1));
        this.cmd("Step")
        this.cmd("SetHighlight", tree.graphicID , 0);
        this.cmd("SetHighlightIndex", 1, -1);
        this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
        this.cmd("Step")
 	this.cmd("Delete", this.highlightID);
	return this.doFind(tree.children[index], s.substring(1))
    }
}

Trie.prototype.insertElement = function(insertedValue)
{
	this.cmd("SetText", 0, "");				
	return this.commands;
}


Trie.prototype.insert = function(elem, tree)
{
	
}

Trie.prototype.deleteElement = function(word)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting: ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");

	
	var node = this.doFind(this.root, word);
        if (node != null)
        {
  	    this.cmd("SetHighlight", node.graphicID , 1);
            this.cmd("SetText", 2, "Found \""+word+"\", setting value in tree to False");
	    this.cmd("step")
	    this.cmd("SetBackgroundColor", node.graphicID, Trie.FALSE_COLOR);
            node.isword = false
     	    this.cmd("SetHighlight", node.graphicID , 0);
	    this.cleanupAfterDelete(node)
	    this.resizeTree()
        }
        else
        {
             this.cmd("SetText", 2, "\""+word+"\" not in tree, nothing to delete");
	    this.cmd("step")
             this.cmd("SetHighlightIndex", 1,  -1)
        }



	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
	this.cmd("SetText", 2, "");
	return this.commands;						
}



Trie.prototype.numChildren = function(tree)
{
    if (tree == null)
    {
        return 0;
    }
    var children = 0
    for (var i = 0; i < 26; i++)
    {
        if (tree.children[i] != null)
        {
            children++;
        }
    }
    return children;

}

Trie.prototype.cleanupAfterDelete = function(tree)
{
    var children = this.numChildren(tree)

    if (children == 0 && !tree.isword)
    {
         this.cmd("SetText", 2, "Deletion left us with a \"False\" leaf\nRemoving false leaf");
   	 this.cmd("SetHighlight" ,tree.graphicID , 1);
         this.cmd("Step");
   	 this.cmd("SetHighlight", tree.graphicID , 0);
         if (tree.parent != null)
         {
              var index = 0
              while (tree.parent.children[index] != tree)
              {
                  index++;
              }
              this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
       	      this.cmd("Delete", tree.graphicID , 0);
              tree.parent.children[index] = null;
              this.cleanupAfterDelete(tree.parent);
         }
         else
         {
       	      this.cmd("Delete", tree.graphicID , 0);
              this.root = null;
         }
    }
}

Trie.prototype.resizeTree = function()
{
	this.resizeWidths(this.root);
	if (this.root != null)
	{
	        var startingPoint = this.root.width / 2 + 1 + Trie.LeftMargin;
		this.setNewPositions(this.root, startingPoint, Trie.STARTING_Y);
		this.animateNewPositions(this.root);
		this.cmd("Step");
	}
	
}


Trie.prototype.add = function(word) 
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting; ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        if (this.root == null)
        {
		this.cmd("CreateCircle", this.nextIndex, "", Trie.NEW_NODE_X, Trie.NEW_NODE_Y); 
		this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
                this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
	        this.cmd("SetText", 2, "Creating a new root");
                this.root = new TrieNode("", this.nextIndex, Trie.NEW_NODE_X, Trie.NEW_NODE_Y)
		this.cmd("Step");				
                this.resizeTree();
	        this.cmd("SetText", 2, "" );
                this.highlightID = this.nextIndex++;
                this.nextIndex += 1;
	        
        }
        this.addR(word.toUpperCase(), this.root);
	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
	this.cmd("SetText", 2, "");

        return this.commands;
}


Trie.prototype.addR = function(s, tree)
{
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
            this.cmd("SetText", 2, "Reached the end of the string \nSet current node to true");
            this.cmd("Step");
//            this.cmd("SetText", tree.graphicID, "T");
    	    this.cmd("SetBackgroundColor", tree.graphicID, Trie.TRUE_COLOR);
            this.cmd("SetHighlight", tree.graphicID , 0);
	    tree.isword = true;
	    return;
    }
    else 
    {
       this.cmd("SetHighlightIndex", 1, 1);
       var index = s.charCodeAt(0) - "A".charCodeAt(0);
       if (tree.children[index] == null)
       {
           this.cmd("CreateCircle", this.nextIndex, s.charAt(0), Trie.NEW_NODE_X, Trie.NEW_NODE_Y); 
           this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
           this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
           this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
           this.cmd("SetText", 2, "Child " + s.charAt(0) + " does not exist.  Creating ... ");
           tree.children[index] = new TrieNode(s.charAt(0), this.nextIndex, Trie.NEW_NODE_X, Trie.NEW_NODE_Y)
	   tree.children[index].parent = tree;
           this.cmd("Connect", tree.graphicID, tree.children[index].graphicID, Trie.FOREGROUND_COLOR, 0, false, s.charAt(0));

           this.cmd("Step");				
           this.resizeTree();
           this.cmd("SetText", 2, "" );
           this.nextIndex += 1;
           this.highlightID = this.nextIndex++;

        }
 	this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
        this.cmd("SetText", 2, "Making recursive call to " + s.charAt(0) + " child, passing in \"" + s.substring(1) + "\"");
        this.cmd("Step")
        this.cmd("SetHighlight", tree.graphicID , 0);
        this.cmd("SetHighlightIndex", 1, -1);
        this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
        this.cmd("Step")
 	this.cmd("Delete", this.highlightID);
	this.addR(s.substring(1), tree.children[index])
    }
}
Trie.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
                tree.x = xPosition;
		tree.y = yPosition;
                var newX = xPosition - tree.width / 2;
                var newY = yPosition + Trie.HEIGHT_DELTA;
                for (var i = 0; i < 26; i++)
                { 
                     if (tree.children[i] != null)
                     {
                           this.setNewPositions(tree.children[i], newX + tree.children[i].width / 2, newY);
                           newX = newX + tree.children[i].width;
                     }
                }
	}
	
}
Trie.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
                for (var i = 0; i < 26; i++)
                { 
                    this.animateNewPositions(tree.children[i])
                }
	}
}

Trie.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
        var size = 0;
	for (var i = 0; i < 26; i++)
	{
            tree.childWidths[i] = this.resizeWidths(tree.children[i]);
            size += tree.childWidths[i]
	}
        tree.width = Math.max(size, Trie.NODE_WIDTH  + 4)
        return tree.width;
}




function TrieNode(val, id, initialX, initialY)
{
	this.wordRemainder = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
        this.children = new Array(26);
        this.childWidths = new Array(26);
        for (var i = 0; i < 26; i++)
	{
            this.children[i] = null;
            this.childWidths[i] =0;
	}
        this.width = 0;
	this.parent = null;
}

Trie.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

Trie.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
        this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Trie(animManag, canvas.width, canvas.height);
	
}

// Copyright 2016 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIIBTED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Constants.


Ternary.NODE_WIDTH = 30;

Ternary.CENTER_LINK_COLOR = "#007700";
Ternary.SIDE_LINK_COLOR = "#8888AA";
Ternary.HIGHLIGHT_CIRCLE_COLOR = "#007700";
Ternary.FOREGROUND_COLOR = "#007700";
Ternary.BACKGROUND_COLOR = "#CCFFCC";
Ternary.TRUE_COLOR = "#CCFFCC";
Ternary.PRINT_COLOR = Ternary.FOREGROUND_COLOR;
Ternary.FALSE_COLOR = "#FFFFFF"
Ternary.WIDTH_DELTA  = 50;
Ternary.HEIGHT_DELTA = 50;
Ternary.STARTING_Y = 20;
Ternary.LeftMargin = 300;
Ternary.NEW_NODE_Y = 100
Ternary.NEW_NODE_X = 50;
Ternary.FIRST_PRINT_POS_X  = 50;
Ternary.PRINT_VERTICAL_GAP  = 20;
Ternary.PRINT_HORIZONTAL_GAP = 50;
    


function Ternary(am, w, h)
{
        this.init(am, w, h);
}
Ternary.inheritFrom(Algorithm);

Ternary.prototype.init = function(am, w, h)
{
    var sc = Ternary.superclass;
    this.startingX =  w / 2;
    this.first_print_pos_y  = h - 2 * Ternary.PRINT_VERTICAL_GAP;
    this.print_max  = w - 10;
    
    var fn = sc.init;
    fn.call(this,am);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.cmd("CreateLabel", 0, "", 20, 10, 0);
    this.cmd("CreateLabel", 1, "", 20, 10, 0);
    this.cmd("CreateLabel", 2, "", 20, 30, 0);
    this.nextIndex = 3;
    this.root = null;
    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}


Ternary.prototype.addControls =  function()
{
    this.insertField = this.addControlToAlgorithmBar("Text", "");
    this.insertField.onkeypress = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 12,false);
    this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
    this.insertButton.onclick = this.insertCallback.bind(this);
    this.deleteField = this.addControlToAlgorithmBar("Text", "");
    this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 12);
    this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
    this.deleteButton.onclick = this.deleteCallback.bind(this);
    this.findField = this.addControlToAlgorithmBar("Text", "");
    this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 12);
    this.findButton = this.addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);
    this.printButton = this.addControlToAlgorithmBar("Button", "Print");
    this.printButton.onclick = this.printCallback.bind(this);
}

Ternary.prototype.reset = function()
{
    this.nextIndex = 3;
    this.root = null;
}

Ternary.prototype.insertCallback = function(event)
{
    var insertedValue = this.insertField.value.toUpperCase()
    insertedValue = insertedValue.replace(/[^a-z]/gi,'');
    
    if (insertedValue != "")
    {
        // set text value
        this.insertField.value = "";
        this.implementAction(this.add.bind(this), insertedValue);
    }
}


Ternary.prototype.deleteCallback = function(event)
{
    var deletedValue = this.deleteField.value.toUpperCase();
    deletedValue = deletedValue.replace(/[^a-z]/gi,'');
    if (deletedValue != "")
    {
        this.deleteField.value = "";
        this.implementAction(this.deleteElement.bind(this),deletedValue);               
    }
    
}


Ternary.prototype.cleanupAfterDelete = function(tree)
{
    if (tree == null)
    {
        return;
    }
    else if (tree.center != null)
    {
        this.cmd("SetHighlight", tree.graphicID, 1);
        this.cmd("SetText", 2, "Clerning up after delete ...\nTree has center child, no more cleanup required");
        this.cmd("step");
        this.cmd("SetText", 2, "");
        this.cmd("SetHighlight", tree.graphicID, 0);
        return;
    } 
    else if (tree.center == null && tree.right == null && tree.left == null && tree.isword == true)
    {
        this.cmd("SetHighlight", tree.graphicID, 1);
        this.cmd("SetText", 2, "Clerning up after delete ...\nLeaf at end of word, no more cleanup required");
        this.cmd("step");
        this.cmd("SetText", 2, "");
        this.cmd("SetHighlight", tree.graphicID, 0);
        return;
    }
    else if (tree.center == null && tree.left == null && tree.right == null)
    {
        this.cmd("SetText", 2, "Clearning up after delete ...");
        this.cmd("SetHighlight", tree.graphicID, 1);
        this.cmd("step");
        this.cmd("Delete", tree.graphicID);
        if (tree.parent == null)
        {
            this.root = null;
        }
        else if (tree.parent.left == tree)
        {
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            tree.parent.left = null;
        }
        else if (tree.parent.right == tree)
        {
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            tree.parent.right = null;
        }
        else if (tree.parent.center == tree)
        {
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            tree.parent.center = null;
            tree.parent.charAt = " ";
            this.cmd("SetText", tree.parent.graphicID, " ");
        }
        this.cleanupAfterDelete(tree.parent);
    }
    else if ((tree.left == null && tree.center == null)  || (tree.right == null && tree.center == null)) 
    {
	var child = null
	if (tree.left != null)
	    child = tree.left
	else
	    child = tree.right;
        this.cmd("Disconnect", tree.graphicID, child.graphicID);
        if (tree.parent == null)
        {
	    this.cmd("Delete", tree.graphicID);
            this.root = child;
        }
        else if (tree.parent.left == tree) 
        {
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            this.cmd("Connect", tree.parent.graphicID, child.graphicID, Ternary.SIDE_LINK_COLOR, 0.0001, false, "<" + tree.parent.nextChar)
	    tree.parent.left = child;
	    child.parent = tree.parent;
	    this.cmd("Step");
	    this.cmd("Delete", tree.graphicID);
        }
	else if (tree.parent.right == tree)
	{
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            this.cmd("Connect", tree.parent.graphicID, child.graphicID, Ternary.SIDE_LINK_COLOR, -0.0001, false, ">" + tree.parent.nextChar)
	    tree.parent.right = child;
	    child.parent = tree.parent;
	    this.cmd("Step");
	    this.cmd("Delete", tree.graphicID);
	}
	else if (tree.parent.center == tree)
	{
            this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
            this.cmd("Connect", tree.parent.graphicID, child.graphicID, Ternary.CENTER_LINK_COLOR, 0.0001, false, "=" + tree.parent.nextChar)
	    child.parent = tree.parent;
	    tree.parent.center = child;
	    this.cmd("Step");
	    this.cmd("Delete", tree.graphicID);
	}
	else
	{
	    throw("What??")
	}
    }
    else if (tree.right != null && tree.center == null && tree.right != null)
    {
	var node = tree.left;

	var parent = tree.parent;
        this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
	this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
        this.cmd("Move", this.highlightID, node.x, node.y);
        this.cmd("Step")
	while (node.right != null)
	{
	    node = node.right;
            this.cmd("Move", this.highlightID, node.x, node.y);
            this.cmd("Step")
	}
	if (tree.left != node)
	{
            this.cmd("Disconnect", node.parent.graphicID, node.graphicID);
	    node.parent.right = node.left;
	    if (node.left != null)
	    {
		node.left.parent = node.parent;
		this.cmd("Disconnect", node.graphicID, node.left.graphicID);
		this.cmd("Connect", node.parent.graphicID, node.left.graphicID, Ternary.CENTER_LINK_COLOR, -0.0001, false, ">" + node.parent.nextChar)
	    }
	    this.cmd("Disconnect", tree.graphicID, tree.right.graphicID);
	    this.cmd("Disconnect", tree.graphicID, tree.left.graphicID);
	    node.right = tree.right;
	    node.left = tree.left;
	    tree.right.parent = node;
	    tree.left.parent = node;
   	    this.cmd("Connect", node.graphicID, node.left.graphicID, Ternary.SIDE_LINK_COLOR, 0.0001, false, "<" + node.nextChar)
   	    this.cmd("Connect", node.graphicID, node.right.graphicID, Ternary.SIDE_LINK_COLOR, -0.0001, false, ">" + node.nextChar)
	    
	}
	else
	{
	    this.cmd("Disconnect", tree.graphicID, tree.left.graphicID);
	    this.cmd("Disconnect", tree.graphicID, tree.right.graphicID);
	    node.right = tree.right;
	    node.right.parent = node;
   	    this.cmd("Connect", node.graphicID, node.right.graphicID, Ternary.SIDE_LINK_COLOR, -0.0001, false, ">" + node.nextChar)
	}
        this.cmd("Delete", this.highlightID);
        this.cmd("Delete", tree.graphicID);
	this.cmd("Step");
	node.parent = tree.parent;
	if (node.parent == null)
	{
	    this.root = node;
	}
	else
	{
	    this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
	    if (tree.parent.left == tree)
	    {
		tree.parent.left = node;
		node.parent = tree.parent;
   		this.cmd("Connect", node.parent.graphicID, node.graphicID, Ternary.SIDE_LINK_COLOR, 0.0001, false, "<" + node.parent.nextChar)

	    }
	    else if (tree.parent.right == tree)
	    {
		tree.parent.right = node;
		node.parent = tree.parent;
   		this.cmd("Connect", node.parent.graphicID, node.graphicID, Ternary.SIDE_LINK_COLOR, -0.0001, false, ">" + node.parent.nextChar)

	    }
	    else if (tree.parent.center == tree)
	    {
		tree.parent.center = node;
		node.parent = tree.parent;
   		this.cmd("Connect", node.parent.graphicID, node.graphicID, Ternary.CENTER_LINK_COLOR, 0.0001, false, "=" + node.parent.nextChar)
		
	    }
	    else
	    {


	    }
	    
	}
    
    }
}


Ternary.prototype.deleteElement = function(word)
{
    this.commands = [];
    this.cmd("SetText", 0, "Deleting: ");
    this.cmd("SetText", 1, "\"" + word  + "\"");
    this.cmd("AlignRight", 1, 0);
    this.cmd("Step");
    
    
    var node = this.doFind(this.root, word);
    if (node != null)
    {
        this.cmd("SetHighlight", node.graphicID , 1);
            this.cmd("SetText", 2, "Found \""+word+"\", setting value in tree to False");
        this.cmd("step")
        this.cmd("SetBackgroundColor", node.graphicID, Ternary.FALSE_COLOR);
        node.isword = false
        this.cmd("SetHighlight", node.graphicID , 0);
        this.cleanupAfterDelete(node)
        this.resizeTree()
    }
    else
    {
        this.cmd("SetText", 2, "\""+word+"\" not in tree, nothing to delete");
        this.cmd("step")
        this.cmd("SetHighlightIndex", 1,  -1)
    }
    
    
    
    this.cmd("SetText", 0, "");
    this.cmd("SetText", 1, "");
    this.cmd("SetText", 2, "");
    return this.commands;                                           
}



Ternary.prototype.printCallback = function(event)
{
        this.implementAction(this.printTree.bind(this),"");                                             
}


Ternary.prototype.printTree = function(unused)
{

	this.commands = [];
    
	if (this.root != null)
	{
		this.highlightID = this.nextIndex++;
	        this.printLabel1 = this.nextIndex++;
	        this.printLabel2 = this.nextIndex++;
		var firstLabel = this.nextIndex++;
	        this.cmd("CreateLabel", firstLabel, "Output: ", Ternary.FIRST_PRINT_POS_X, this.first_print_pos_y);
		this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, this.root.x, this.root.y);
                this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
	        this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
	        this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
	        this.cmd("AlignRight", this.printLabel2, this.printLabel1);
		this.xPosOfNextLabel = Ternary.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.root, "");

//	        this.cmd("SetText", this.printLabel1, "About to delete");
//		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);
		this.cmd("Delete",  this.printLabel1);
		this.cmd("Delete",  this.printLabel2);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;


}

Ternary.prototype.printTreeRec = function(tree, stringSoFar)
{
    if (tree.isword)
    {
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
	this.cmd("SetForegroundColor", nextLabelID, Ternary.PRINT_COLOR); 
	this.cmd("AlignRight", nextLabelID, this.printLabel1, Ternary.PRINT_COLOR); 
	this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  Ternary.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = Ternary.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += Ternrary.PRINT_VERTICAL_GAP;
	}
	

    }
    if (tree.left != null)
    {
	this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
	this.cmd("Step");
	this.printTreeRec(tree.left, stringSoFar);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("Step");


    }
    if (tree.center != null)
    {
	var nextLabelID = this.nextIndex;
        this.cmd("CreateLabel", nextLabelID, tree.nextChar, tree.x, tree.y, 0);
	this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);

	this.cmd("Move", this.highlightID, tree.center.x, tree.center.y);
	this.cmd("Step");
	this.cmd("Delete", nextLabelID);
	this.cmd("SetText", this.printLabel2, stringSoFar + tree.nextChar);
	this.printTreeRec(tree.center, stringSoFar + tree.nextChar);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("SetText", this.printLabel2, stringSoFar);
	this.cmd("Step");


    }
    if (tree.right != null)
    {
	this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
	this.cmd("Step");
	this.printTreeRec(tree.right, stringSoFar);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("Step");
    }
}

Ternary.prototype.findCallback = function(event)
{
        var findValue = this.findField.value.toUpperCase()
        finndValue = findValue.replace(/[^a-z]/gi,'');
        this.findField.value = "";
        this.implementAction(this.findElement.bind(this),findValue);                                            
}

Ternary.prototype.findElement = function(word)
{
    this.commands = [];
    
    this.commands = new Array();    
    this.cmd("SetText", 0, "Finding: ");
    this.cmd("SetText", 1, "\"" + word  + "\"");
    this.cmd("AlignRight", 1, 0);
    this.cmd("Step");
    
    
    var node = this.doFind(this.root, word);
    if (node != null)
    {
        this.cmd("SetText", 0, "Found \""+word+"\"");
    }
    else
    {
        this.cmd("SetText", 0, "\""+word+"\" not Found");
    }
    
    this.cmd("SetText", 1, "");
    this.cmd("SetText", 2, "");
    
    return this.commands;
}


Ternary.prototype.doFind = function(tree, s)
{

    if (tree == null)
    {
        this.cmd("SetText", 2, "Reached null tree\nWord is not in the tree");
        this.cmd("Step");
        return null;
    }
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
        if (tree.isword == true)
        {
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is True\nWord is in the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
            return tree
        }
        else
        {
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is False\nWord is Not the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
            return null

        }
    }
    else 
    {
        this.cmd("SetHighlightIndex", 1, 1);

        var child = null;
        if (tree.nextChar == " ")
        {
           this.cmd("SetText", 2, "Reached a leaf without a character, still have characeters left in search string \nString is not in the tree");
           this.cmd("Step");
           this.cmd("SetHighlightIndex", 1, -1);
           this.cmd("SetHighlight", tree.graphicID , 0);
           return null;
        }

        if (tree.nextChar == s.charAt(0))
        {
           this.cmd("SetText", 2, "Next character in string  matches character at current node\nRecursively look at center child, \nremoving first letter from search string");
           this.cmd("Step");
           s = s.substring(1);
           child = tree.center;
        }
        else if (tree.nextChar > s.charAt(0))
        {
           this.cmd("SetText", 2, "Next character in string < Character at current node\nRecursively look at left node, \nleaving search string as it is");
           this.cmd("Step");
           child = tree.left;
        }
        else
        {
           this.cmd("SetText", 2, "Next character in string > Character at current node\nRecursively look at left right, \nleaving search string as it is");
           this.cmd("Step");
           child = tree.right;
        }
        if (child != null)
        {
           this.cmd("SetText", 1, "\""+s+"\"");
           this.cmd("SetHighlightIndex", 1, -1);

           this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
           this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
           this.cmd("SetHighlight", tree.graphicID , 0);

           this.cmd("Move", this.highlightID, child.x, child.y);
           this.cmd("Step")
           this.cmd("Delete", this.highlightID);

        }
        else
        {
            this.cmd("SetHighlight", tree.graphicID , 0);
        }
        return this.doFind(child, s)
    }
}

Ternary.prototype.insertElement = function(insertedValue)
{
    this.cmd("SetText", 0, "");                             
    return this.commands;
}


Ternary.prototype.insert = function(elem, tree)
{
        
}



Ternary.prototype.resizeTree = function()
{
    this.resizeWidths(this.root);
    if (this.root != null)
    {
	var startingPoint = Ternary.LeftMargin;
	if (this.root.left == null)
	{
	    startingPoint += Ternary.NODE_WIDTH / 2;
	}
	else
	{
	    startingPoint += this.root.left.width;
	}
	    
//        var startingPoint = this.root.width / 2 + 1 + Ternary.LeftMargin;
        this.setNewPositions(this.root, startingPoint, Ternary.STARTING_Y);
        this.animateNewPositions(this.root);
        this.cmd("Step");
    }
    
}


Ternary.prototype.add = function(word) 
{
    this.commands = new Array();    
    this.cmd("SetText", 0, "Inserting; ");
    this.cmd("SetText", 1, "\"" + word  + "\"");
    this.cmd("AlignRight", 1, 0);
    this.cmd("Step");
    if (this.root == null)
    {
        this.cmd("CreateCircle", this.nextIndex, " ", Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y); 
        this.cmd("SetForegroundColor", this.nextIndex, Ternary.FOREGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.nextIndex, Ternary.FALSE_COLOR);
        this.cmd("SetWidth", this.nextIndex, Ternary.NODE_WIDTH);
        this.cmd("SetText", 2, "Creating a new root");
        this.root = new TernaryNode(" ", this.nextIndex, Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y)
        this.cmd("Step");                               
        this.resizeTree();
        this.cmd("SetText", 2, "" );
        this.nextIndex += 1;
        this.highlightID = this.nextIndex++;
        
    }
    this.addR(word.toUpperCase(), this.root);
    this.cmd("SetText", 0, "");
    this.cmd("SetText", 1, "");
    this.cmd("SetText", 2, "");
    
    return this.commands;
}


Ternary.prototype.createIfNotExtant = function (tree, child, label)
{
    if (child == null)
    {
        this.cmd("CreateCircle", this.nextIndex, " ", Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y); 
        this.cmd("SetForegroundColor", this.nextIndex, Ternary.FOREGROUND_COLOR);
        this.cmd("SetBackgroundColor", this.nextIndex, Ternary.FALSE_COLOR);
        this.cmd("SetWidth", this.nextIndex, Ternary.NODE_WIDTH);
        this.cmd("SetText", 2, "Creating a new node");
        child = new TernaryNode(" ", this.nextIndex, Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y)
        this.cmd("Step");
        var dir = 0.0001;
        if (label.charAt(0) == '>')
        {
            dir = -0.0001

        }
        var color = Ternary.FOREGROUND_COLOR;
        if (label.charAt(0) == "=")
        {
            color = Ternary.CENTER_LINK_COLOR;
        }
        else
        {
            color = Ternary.SIDE_LINK_COLOR;
        }
        this.cmd("Connect", tree.graphicID, this.nextIndex, color, dir, false, label)
        this.cmd("SetText", 2, "" );
        this.nextIndex++;
        this.highlightID = this.nextIndex++;
        
    }
    return child;
}


Ternary.prototype.addR = function(s, tree)
{
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
            this.cmd("SetText", 2, "Reached the end of the string \nSet current node to true");
            this.cmd("Step");
            this.cmd("SetBackgroundColor", tree.graphicID, Ternary.TRUE_COLOR);
            this.cmd("SetHighlight", tree.graphicID , 0);
            tree.isword = true;
            return;
    }
    else 
    {
       this.cmd("SetHighlightIndex", 1, 1);
       if (tree.nextChar == ' ')
       {
           tree.nextChar = s.charAt(0);
           this.cmd("SetText", 2, "No character for this node, setting to " + s.charAt(0));
           this.cmd("SetText", tree.graphicID, s.charAt(0));
           this.cmd("Step");
           if (tree.center == null)
           {
               tree.center = this.createIfNotExtant(tree, tree.center, "="+s.charAt(0));
               tree.center.parent = tree;
               this.resizeTree();
               
           }
           this.cmd("SetHighlightIndex", 1, -1);
           this.cmd("SetHighlight", tree.graphicID , 0);
           this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

           this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
           this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
           this.cmd("Move", this.highlightID, tree.center.x, tree.center.y);
           this.cmd("Step")
           this.cmd("Delete", this.highlightID);

           this.addR(s.substring(1), tree.center)
       }
       else if (tree.nextChar == s.charAt(0))
       {
           this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
           this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
           this.cmd("SetText", 2, "Making recursive call to center child, passing in \"" + s.substring(1) + "\"");
           this.cmd("Step")
           this.cmd("SetHighlight", tree.graphicID , 0);
           this.cmd("SetHighlightIndex", 1, -1);
           this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");
           this.cmd("Move", this.highlightID, tree.center.x, tree.center.y);
           this.cmd("Step")
           this.cmd("Delete", this.highlightID);
           this.addR(s.substring(1), tree.center)
       }
       else 
	{
	    var child = null;
	    var label = "";
	    if (tree.nextChar > s.charAt(0))
	    {
		label = "<" + tree.nextChar;
		this.cmd("SetText", 2, "Next character in stirng is < value stored at current node \n Making recursive call to left child passing in \"" + s+ "\"");
		tree.left = this.createIfNotExtant(tree, tree.left, label);
		tree.left.parent = tree;
 	        this.resizeTree();
		child = tree.left;
	    }
	    else
	    {
		label = ">" + tree.nextChar;
		this.cmd("SetText", 2, "Next character in stirng is > value stored at current node \n Making recursive call to right child passing in \"" + s + "\"");
		tree.right= this.createIfNotExtant(tree, tree.right, label);
		tree.right.parent = tree;
		child = tree.right;
 	        this.resizeTree();

	    }
 	    this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
            this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
            this.cmd("Step")
            this.cmd("SetHighlight", tree.graphicID , 0);
            this.cmd("SetHighlightIndex", 1, -1);
//            this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

            this.cmd("Move", this.highlightID, child.x, child.y);
            this.cmd("Step")
 	    this.cmd("Delete", this.highlightID);
	    this.addR(s, child)
	}
    }
}
Ternary.prototype.setNewPositions = function(tree, xLeft, yPosition)
{
	if (tree != null)
	{
            tree.x = xLeft + Ternary.NODE_WIDTH / 2;
   	    tree.y = yPosition;
	    var newYPos = yPosition + Ternary.HEIGHT_DELTA;
	    if (tree.left != null)
            {
		this.setNewPositions(tree.left, xLeft, newYPos);
	    }
	    if (tree.center != null)
            {
		this.setNewPositions(tree.center, xLeft + tree.leftWidth, newYPos);
		tree.x = tree.center.x;
            }
	    if (tree.right != null)
            {
		this.setNewPositions(tree.right, xLeft + tree.leftWidth +  tree.centerWidth, newYPos);
            }
	    
	}
	
}
Ternary.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
                this.animateNewPositions(tree.left)
                this.animateNewPositions(tree.center)
                this.animateNewPositions(tree.right)

	}
}

Ternary.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
        tree.leftWidth = (this.resizeWidths(tree.left));
        tree.centerWidth = (this.resizeWidths(tree.center));
        tree.rightWidth = (this.resizeWidths(tree.right));
        tree.width = Math.max(tree.leftWidth + tree.centerWidth+tree.rightWidth, Ternary.NODE_WIDTH  + 4);
        return tree.width;
}




function TernaryNode(val, id, initialX, initialY)
{
    this.nextChar = val;
    this.x = initialX;
    this.y = initialY;
    this.graphicID = id;
    
    this.left = null;
    this.center = null;
    this.right = null;
    this.leftWidth =  0;
    this.centerWidth =  0;
    this.rightWwidth =  0;
    this.parent = null;
}

Ternary.prototype.disableUI = function(event)
{
    this.insertField.disabled = true;
    this.insertButton.disabled = true;
    this.deleteField.disabled = true;
    this.deleteButton.disabled = true;
    this.findField.disabled = true;
    this.findButton.disabled = true;
    this.printButton.disabled = true;
}

Ternary.prototype.enableUI = function(event)
{
    this.insertField.disabled = false;
    this.insertButton.disabled = false;
    this.deleteField.disabled = false;
    this.deleteButton.disabled = false;
    this.findField.disabled = false;
    this.findButton.disabled = false;
    this.printButton.disabled = false;
}


var currentAlg;

function init()
{
    var animManag = initCanvas();
    currentAlg = new Ternary(animManag, canvas.width, canvas.height);    
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function Heap(am, w, h, compare)
{
	this.compare = compare ? window[compare] : function(a, b) { return a < b ? -1 : a > b ? 1 : 0; };

	this.init(am, w, h);

}
Heap.inheritFrom(Algorithm);



Heap.ARRAY_SIZE  = 32;
Heap.ARRAY_ELEM_WIDTH = 30;
Heap.ARRAY_ELEM_HEIGHT = 25;
Heap.ARRAY_INITIAL_X = 30;

Heap.ARRAY_Y_POS = 50;
Heap.ARRAY_LABEL_Y_POS = 70;


Heap.prototype.init = function(am)
{
	var sc = Heap.superclass;
	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.HeapXPositions = [0, 450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600,
					  700, 800, 075, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575, 
					  625, 675, 725, 775, 825];
	this.HeapYPositions = [0, 100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310,
					  310, 310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 
					  380, 380, 380, 380, 380];
	this.commands = [];
	this.createArray();

	
	/*this.nextIndex = 0;
	this.this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 50, 0);
	this.animationManager.StartNewAnimation(this.this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory(); */
	
}

Heap.prototype.addControls =  function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4, true);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.removeSmallestButton = this.addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.clearHeapButton = this.addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.buildHeapButton = this.addControlToAlgorithmBar("Button", "BuildHeap");
	this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
}



Heap.prototype.createArray = function()
{
	this.arrayData = new Array(Heap.ARRAY_SIZE);
	this.arrayLabels = new Array(Heap.ARRAY_SIZE);
	this.arrayRects = new Array(Heap.ARRAY_SIZE);
	this.circleObjs = new Array(Heap.ARRAY_SIZE);
	this.ArrayXPositions = new Array(Heap.ARRAY_SIZE);
	this.currentHeapSize = 0;
	
	for (var i = 0; i < Heap.ARRAY_SIZE; i++)
	{
		this.ArrayXPositions[i] = Heap.ARRAY_INITIAL_X + i *Heap.ARRAY_ELEM_WIDTH;
		this.arrayLabels[i] = this.nextIndex++;
		this.arrayRects[i] = this.nextIndex++;
		this.circleObjs[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.arrayRects[i], "", Heap.ARRAY_ELEM_WIDTH, Heap.ARRAY_ELEM_HEIGHT, this.ArrayXPositions[i] , Heap.ARRAY_Y_POS)
		this.cmd("CreateLabel", this.arrayLabels[i], i,  this.ArrayXPositions[i], Heap.ARRAY_LABEL_Y_POS);
		this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
	}
	this.cmd("SetText", this.arrayRects[0], "-INF");
	this.swapLabel1 = this.nextIndex++;
	this.swapLabel2 = this.nextIndex++;
	this.swapLabel3 = this.nextIndex++;
	this.swapLabel4 = this.nextIndex++;
	this.descriptLabel1 = this.nextIndex++;
	this.descriptLabel2 = this.nextIndex++;
	this.cmd("CreateLabel", this.descriptLabel1, "", 20, 10,  0);
	//this.cmd("CreateLabel", this.descriptLabel2, "", this.nextIndex, 40, 120, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


Heap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}

//TODO:  Make me undoable!!
Heap.prototype.clearCallback = function(event)
{
	this.commands = new Array();
	this.implementAction(this.clear.bind(this),"");
}

//TODO:  Make me undoable!!
Heap.prototype.clear = function()
{
	
	while (this.currentHeapSize > 0)
	{
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.currentHeapSize--;				
	}
	return this.commands;
}


Heap.prototype.reset = function()
{
	this.currentHeapSize = 0;
}

Heap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}


Heap.prototype.swap = function(index1, index2)
{
	this.cmd("SetText", this.arrayRects[index1], "");
	this.cmd("SetText", this.arrayRects[index2], "");
	this.cmd("SetText", this.circleObjs[index1], "");
	this.cmd("SetText", this.circleObjs[index2], "");
	this.cmd("CreateLabel", this.swapLabel1, this.arrayData[index1], this.ArrayXPositions[index1],Heap.ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel2, this.arrayData[index2], this.ArrayXPositions[index2],Heap.ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel3, this.arrayData[index1], this.HeapXPositions[index1],this.HeapYPositions[index1]);
	this.cmd("CreateLabel", this.swapLabel4, this.arrayData[index2], this.HeapXPositions[index2],this.HeapYPositions[index2]);
	this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2],Heap.ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1],Heap.ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel3, this.HeapXPositions[index2],this.HeapYPositions[index2])
	this.cmd("Move", this.swapLabel4, this.HeapXPositions[index1],this.HeapYPositions[index1])
	var tmp = this.arrayData[index1];
	this.arrayData[index1] = this.arrayData[index2];
	this.arrayData[index2] = tmp;
	this.cmd("Step")
	this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
	this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
	this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
	this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
	this.cmd("Delete", this.swapLabel1);
	this.cmd("Delete", this.swapLabel2);
	this.cmd("Delete", this.swapLabel3);
	this.cmd("Delete", this.swapLabel4);			
	
	
}


Heap.prototype.setIndexHighlight = function(index, highlightVal)
{
	this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
	this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
}

Heap.prototype.pushDown = function(index)
{
	var smallestIndex;
	
	while(true)
	{
		if (index*2 > this.currentHeapSize)
		{
			return;
		}
		
		smallestIndex = 2*index;
		
		if (index*2 + 1 <= this.currentHeapSize)
		{
			this.setIndexHighlight(2*index, 1);
			this.setIndexHighlight(2*index + 1, 1);
			this.cmd("Step");
			this.setIndexHighlight(2*index, 0);
			this.setIndexHighlight(2*index + 1, 0);
			if (this.compare(this.arrayData[2*index + 1], this.arrayData[2*index]) < 0)
			{
				smallestIndex = 2*index + 1;
			}
		}
		this.setIndexHighlight(index, 1);
		this.setIndexHighlight(smallestIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(index, 0);
		this.setIndexHighlight(smallestIndex, 0);
		
		if (this.compare(this.arrayData[smallestIndex], this.arrayData[index]) < 0)
		{
			this.swap(smallestIndex, index);
			index = smallestIndex;
		}
		else
		{
			return;
		}
		
		
		
	}
}

Heap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	this.cmd("SetText", this.descriptLabel1, "");
	
	if (this.currentHeapSize == 0)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap is empty, cannot remove smallest element");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Removing element:");			
	this.cmd("CreateLabel", this.descriptLabel2, this.arrayData[1],  this.HeapXPositions[1], this.HeapYPositions[1], 0);
	this.cmd("SetText", this.circleObjs[1], "");
	this.cmd("Move", this.descriptLabel2,  120, 40)
	this.cmd("Step");
	this.cmd("Delete", this.descriptLabel2);
	this.cmd("SetText", this.descriptLabel1, "Removing element: " + this.arrayData[1]);
	this.arrayData[1] = "";
	if (this.currentHeapSize > 1)
	{
		this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.swap(1,this.currentHeapSize);
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;
		this.pushDown(1);				
	} else {
                this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;

        }
	return this.commands;
	
}

Heap.prototype.buildHeapCallback = function(event)
{
	this.implementAction(this.buildHeap.bind(this),"");			
}

Heap.prototype.buildHeap = function(data)
{
	this.commands = [];
	this.clear();

	if(data)
	{
		for (var i = 0; i < data.length; i++)
			this.arrayData[i+1] = data[i];
		this.currentHeapSize = data.length;
	}
	else
	{
		for (var i = 1; i <Heap.ARRAY_SIZE; i++)
			this.arrayData[i] = this.normalizeNumber(String(Heap.ARRAY_SIZE - i), 4);
		this.currentHeapSize = Heap.ARRAY_SIZE - 1;
	 }

	for (var i = 1; i <= this.currentHeapSize; i++)
	{
		this.cmd("CreateCircle", this.circleObjs[i], this.arrayData[i], this.HeapXPositions[i], this.HeapYPositions[i]);
		this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
		if (i > 1)
		{
			this.cmd("Connect", this.circleObjs[Math.floor(i/2)], this.circleObjs[i]);
		}
		
	}
	this.cmd("Step");
	var nextElem = this.currentHeapSize;
	while(nextElem > 0)
	{
		this.pushDown(nextElem);
		nextElem = nextElem - 1;
	}
	return this.commands;
}

Heap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	if (this.currentHeapSize >= Heap.ARRAY_SIZE - 1)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap Full!");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: " + insertedValue);	
	this.cmd("Step");
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
	this.currentHeapSize++;
	this.arrayData[this.currentHeapSize] = insertedValue;
	this.cmd("CreateCircle",this.circleObjs[this.currentHeapSize], "", this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45,  1);
	if (this.currentHeapSize > 1)
	{
		this.cmd("Connect", this.circleObjs[Math.floor(this.currentHeapSize / 2)], this.circleObjs[this.currentHeapSize]);				
	}
	
	this.cmd("Move", this.descriptLabel2, this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("Step");
	this.cmd("SetText", this.circleObjs[this.currentHeapSize], insertedValue);
	this.cmd("delete", this.descriptLabel2);
	this.cmd("SetText", this.arrayRects[this.currentHeapSize], insertedValue);
	
	var currentIndex = this.currentHeapSize;
	var parentIndex = Math.floor(currentIndex / 2);
	
	if (currentIndex > 1)
	{
		this.setIndexHighlight(currentIndex, 1);
		this.setIndexHighlight(parentIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(currentIndex, 0);
		this.setIndexHighlight(parentIndex, 0);
	}
	
	while (currentIndex > 1 && this.compare(this.arrayData[currentIndex], this.arrayData[parentIndex]) < 0)
	{
		this.swap(currentIndex, parentIndex);
		currentIndex = parentIndex;
		parentIndex = Math.floor(parentIndex / 2);
		if (currentIndex > 1)
		{
			this.setIndexHighlight(currentIndex, 1);
			this.setIndexHighlight(parentIndex, 1);
			this.cmd("Step");
			this.setIndexHighlight(currentIndex, 0);
			this.setIndexHighlight(parentIndex, 0);
		}
	}
	this.cmd("SetText", this.descriptLabel1, "");	
	
	return this.commands;
}

Heap.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.removeSmallestButton.disabled = true;
	this.clearHeapButton.disabled = true;
	this.buildHeapButton.disabled = true;
}

Heap.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.removeSmallestButton.disabled = false;
	this.clearHeapButton.disabled = false;
	this.buildHeapButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Heap(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


BinomialQueue.LINK_COLOR = "#007700";
BinomialQueue.HIGHLIGHT_CIRCLE_COLOR = "#007700";
BinomialQueue.MERGE_SEPARATING_LINE_COLOR = "#0000FF";
BinomialQueue.FOREGROUND_COLOR = "#007700";
BinomialQueue.BACKGROUND_COLOR = "#EEFFEE";
BinomialQueue.DEGREE_OFFSET_X = -20;
BinomialQueue.DEGREE_OFFSET_Y = -20;

BinomialQueue.DELETE_LAB_X = 30;
BinomialQueue.DELETE_LAB_Y = 50;


BinomialQueue.NODE_WIDTH = 60;
BinomialQueue.NODE_HEIGHT = 70

BinomialQueue.STARTING_X = 70;
BinomialQueue.STARTING_Y = 80;

BinomialQueue.INSERT_X = 30;
BinomialQueue.INSERT_Y = 25


function BinomialQueue(am, w, h)
{
	this.init(am, w, h);
	
}

BinomialQueue.inheritFrom(Algorithm);

		
		
BinomialQueue.prototype.init = function(am, w, h)
{
	BinomialQueue.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.currentLayer = 1;
	this.animationManager.setAllLayers([0,this.currentLayer]);
	this.nextIndex = 0;
}


BinomialQueue.prototype.addControls =  function()
{
	this.controls = [];
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.removeSmallestButton = this.addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.clearHeapButton = this.addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);
	
	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Logical Representation", 
															 "Internal Representation", 
															 ], 
															"BQueueRep");
	
	radioButtonList[0].onclick = this.representationChangedHandler.bind(this, true);
	radioButtonList[1].onclick = this.representationChangedHandler.bind(this, false);
	radioButtonList[0].checked = true;
	
}
		
		
BinomialQueue.prototype.representationChangedHandler = function(logicalRep, event) 
{
	if (logicalRep)
	{
		this.animationManager.setAllLayers([0,1]);
		this.currentLayer = 1;
	}
	else 
	{
		this.animationManager.setAllLayers([0,2]);
		this.currentLayer = 2;
	}
}

		
		
		
BinomialQueue.prototype.setPositions = function(tree, xPosition, yPosition) 
{
	if (tree != null)
	{
		if (tree.degree == 0)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			return this.setPositions(tree.rightSib, xPosition + BinomialQueue.NODE_WIDTH, yPosition);
		}
		else if (tree.degree == 1)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + BinomialQueue.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + BinomialQueue.NODE_WIDTH, yPosition);					
		}
		else
		{
			var treeWidth = Math.pow(2, tree.degree - 1);
			tree.x = xPosition + (treeWidth - 1) * BinomialQueue.NODE_WIDTH;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + BinomialQueue.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + treeWidth * BinomialQueue.NODE_WIDTH, yPosition);
		}
	}
	return xPosition;
}
		
BinomialQueue.prototype.moveTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.internalGraphicID, tree.x, tree.y);
		this.cmd("Move", tree.degreeID, tree.x  + BinomialQueue.DEGREE_OFFSET_X, tree.y + BinomialQueue.DEGREE_OFFSET_Y);
		
		this.moveTree(tree.leftChild);
		this.moveTree(tree.rightSib);
	}
}


BinomialQueue.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
BinomialQueue.prototype.clearCallback = function(event)
{
	this.clear();
}
		
BinomialQueue.prototype.clear  = function()
{
	this.commands = new Array();
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.actionHistory = new Array();
}

		
BinomialQueue.prototype.reset = function()
{
	this.treeRoot = null;
	this.nextIndex = 0;
}
		
BinomialQueue.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
BinomialQueue.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		var  tmp;
		var prev;
		var smallest = this.treeRoot;
		
		this.cmd("SetHighlight", smallest.graphicID, 1);
		this.cmd("SetHighlight", smallest.internalGraphicID, 1);
		
		for (tmp = this.treeRoot.rightSib; tmp != null; tmp = tmp.rightSib) 
		{
			this.cmd("SetHighlight", tmp.graphicID, 1);
			this.cmd("SetHighlight", tmp.internalGraphicID, 1);
			this.cmd("Step");
			if (tmp.data < smallest.data) 
			{
				this.cmd("SetHighlight", smallest.graphicID, 0);
				this.cmd("SetHighlight", smallest.internalGraphicID, 0);
				smallest = tmp;
			} 
			else 
			{
				this.cmd("SetHighlight", tmp.graphicID, 0);
				this.cmd("SetHighlight", tmp.internalGraphicID, 0);
			}
		}
		
		if (smallest == this.treeRoot) {
			this.treeRoot = this.treeRoot.rightSib;
			prev = null;
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != smallest; prev = prev.rightSib) ;
			prev.rightSib = prev.rightSib.rightSib;
			
		}
		var moveLabel = this.nextIndex++;
		this.cmd("SetText", smallest.graphicID, "");
		this.cmd("SetText", smallest.internalGraphicID, "");
		this.cmd("CreateLabel", moveLabel, smallest.data, smallest.x, smallest.y);
		this.cmd("Move", moveLabel, BinomialQueue.DELETE_LAB_X, BinomialQueue.DELETE_LAB_Y);
		this.cmd("Step");
		if (prev != null && prev.rightSib != null)
		{
			this.cmd("Connect", prev.internalGraphicID, 
					 prev.rightSib.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
		}
		this.cmd("Delete", smallest.graphicID);
		this.cmd("Delete", smallest.internalGraphicID);
		this.cmd("Delete", smallest.degreeID);
		
		this.secondaryTreeRoot = this.reverse(smallest.leftChild);
		for (tmp = this.secondaryTreeRoot; tmp != null; tmp = tmp.rightSib)
			tmp.parent = null;
		this.merge();
		this.cmd("Delete", moveLabel);
	}
	return this.commands;
}

BinomialQueue.prototype.reverse = function(tree)
{
	var newTree = null;
	var tmp;
	while (tree != null) 
	{
		if (tree.rightSib != null)
		{
			this.cmd("Disconnect", tree.internalGraphicID, tree.rightSib.internalGraphicID);
			this.cmd("Connect", tree.rightSib.internalGraphicID, 
					 tree.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		tmp = tree;
		tree = tree.rightSib;
		tmp.rightSib = newTree;
		tmp.parent=null;
		newTree = tmp;
	}
	return newTree;
}
		
		
BinomialQueue.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	var insertNode = new BinomialNode(insertedValue, this.nextIndex++,  BinomialQueue.INSERT_X, BinomialQueue.INSERT_Y);
	insertNode.internalGraphicID = this.nextIndex++;
	insertNode.degreeID= this.nextIndex++;
	this.cmd("CreateCircle", insertNode.graphicID, insertedValue, BinomialQueue.INSERT_X, BinomialQueue.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.graphicID, BinomialQueue.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.graphicID, BinomialQueue.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.graphicID, 1);
	this.cmd("CreateCircle", insertNode.internalGraphicID, insertedValue, BinomialQueue.INSERT_X, BinomialQueue.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.internalGraphicID, BinomialQueue.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.internalGraphicID, BinomialQueue.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.internalGraphicID, 2);
	this.cmd("CreateLabel", insertNode.degreeID, insertNode.degree, insertNode.x  + BinomialQueue.DEGREE_OFFSET_X, insertNode.y + BinomialQueue.DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", insertNode.degreeID, "#0000FF");
	this.cmd("SetLayer", insertNode.degreeID, 2);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = insertNode;
		this.setPositions(this.treeRoot, BinomialQueue.STARTING_X, BinomialQueue.STARTING_Y);
		this.moveTree(this.treeRoot);
	}
	else
	{
		this.secondaryTreeRoot = insertNode;
		this.merge();				
	}
	
	return this.commands;
}

		
BinomialQueue.prototype.merge = function()
{
	if (this.treeRoot != null)
	{
		var leftSize = this.setPositions(this.treeRoot, BinomialQueue.STARTING_X, BinomialQueue.STARTING_Y);
		this.setPositions(this.secondaryTreeRoot, leftSize + BinomialQueue.NODE_WIDTH, BinomialQueue.STARTING_Y);
		this.moveTree(this.secondaryTreeRoot);
		this.moveTree(this.treeRoot);
		var lineID = this.nextIndex++;
		this.cmd("CreateRectangle", lineID, "", 0, 200, leftSize, 50,"left","top");
		this.cmd("SetForegroundColor", lineID, BinomialQueue.MERGE_SEPARATING_LINE_COLOR);
		this.cmd("SetLayer", lineID, 0);
		this.cmd("Step");
	}
	else
	{
		this.treeRoot = this.secondaryTreeRoot;
		this.secondaryTreeRoot = null;
		this.setPositions(this.treeRoot,  BinomialQueue.NODE_WIDTH, BinomialQueue.STARTING_Y);
		this.moveTree(this.treeRoot);
		return;
	}
	while (this.secondaryTreeRoot != null)
	{
		var tmp  = this.secondaryTreeRoot;
		this.secondaryTreeRoot = this.secondaryTreeRoot.rightSib;
		if (this.secondaryTreeRoot != null)
		{
			this.cmd("Disconnect", tmp.internalGraphicID, this.secondaryTreeRoot.internalGraphicID);
		}
		if (tmp.degree <= this.treeRoot.degree)
		{
			tmp.rightSib = this.treeRoot;
			this.treeRoot = tmp;
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		else
		{
			var tmp2  = this.treeRoot;
			while (tmp2.rightSib != null && tmp2.rightSib.degree < tmp.degree)
			{
				tmp2 = tmp2. rightSib;
			}
			if (tmp2.rightSib != null)
			{
				this.cmd("Disconnect", tmp2.internalGraphicID, tmp2.rightSib.internalGraphicID);
				this.cmd("Connect", tmp.internalGraphicID, 
						 tmp2.rightSib.internalGraphicID,
						 BinomialQueue.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
			}
			tmp.rightSib= tmp2.rightSib;
			tmp2.rightSib = tmp;
			this.cmd("Connect", tmp2.internalGraphicID, 
					 tmp.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		leftSize = this.setPositions(this.treeRoot, BinomialQueue.STARTING_X, BinomialQueue.STARTING_Y);
		this.setPositions(this.secondaryTreeRoot, leftSize + BinomialQueue.NODE_WIDTH, BinomialQueue.STARTING_Y);
		this.moveTree(this.secondaryTreeRoot);
		this.moveTree(this.treeRoot);
		this.cmd("Move", lineID, leftSize, 50);
		this.cmd("Step");
	}
	this.cmd("Delete", lineID);
	this.combineNodes();
}


BinomialQueue.prototype.combineNodes = function()
{
	var tmp;
	var tmp2;
	while ((this.treeRoot != null && this.treeRoot.rightSib != null && this.treeRoot.degree == this.treeRoot.rightSib.degree) &&
		   (this.treeRoot.rightSib.rightSib == null || this.treeRoot.rightSib.degree != this.treeRoot.rightSib.rightSib.degree))
	{
		this.cmd("Disconnect", this.treeRoot.internalGraphicID, this.treeRoot.rightSib.internalGraphicID);
		if (this.treeRoot.rightSib.rightSib != null)
		{
			this.cmd("Disconnect", this.treeRoot.rightSib.internalGraphicID, this.treeRoot.rightSib.rightSib.internalGraphicID);					
		}
		if (this.treeRoot.data < this.treeRoot.rightSib.data) 
		{
			tmp = this.treeRoot.rightSib;
			this.treeRoot.rightSib = tmp.rightSib;
			tmp.rightSib = this.treeRoot.leftChild;
			this.treeRoot.leftChild = tmp;
			tmp.parent = this.treeRoot;
		} 
		else 
		{
			tmp = this.treeRoot;
			this.treeRoot = this.treeRoot.rightSib;
			tmp.rightSib = this.treeRoot.leftChild;
			this.treeRoot.leftChild = tmp;
			tmp.parent = this.treeRoot;
		}
		this.cmd("Connect", this.treeRoot.graphicID, 
				 this.treeRoot.leftChild.graphicID,
				 BinomialQueue.FOREGROUND_COLOR,
				 0, // Curve
				 0, // Directed
				 ""); // Label
		
		
		this.cmd("Connect", this.treeRoot.internalGraphicID, 
				 this.treeRoot.leftChild.internalGraphicID,
				 BinomialQueue.FOREGROUND_COLOR,
				 0.15, // Curve
				 1, // Directed
				 ""); // Label
		
		this.cmd("Connect",  this.treeRoot.leftChild.internalGraphicID, 
				 this.treeRoot.internalGraphicID,
				 BinomialQueue.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label					
		if (this.treeRoot.leftChild.rightSib != null)
		{
			this.cmd("Disconnect", this.treeRoot.internalGraphicID, this.treeRoot.leftChild.rightSib.internalGraphicID);
			this.cmd("Connect", this.treeRoot.leftChild.internalGraphicID, 
					 this.treeRoot.leftChild.rightSib.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		if (this.treeRoot.rightSib != null)
		{
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		
		this.treeRoot.degree++;
		
		this.cmd("SetText", this.treeRoot.degreeID, this.treeRoot.degree);
		
		
		this.setPositions(this.treeRoot, BinomialQueue.STARTING_X, BinomialQueue.STARTING_Y);
		this.moveTree(this.treeRoot);	
		this.cmd("Step");
	}
	
	tmp2 = this.treeRoot;
	while (tmp2 != null && tmp2.rightSib != null && tmp2.rightSib.rightSib != null) 
	{
		if (tmp2.rightSib.degree != tmp2.rightSib.rightSib.degree) 
		{
			tmp2 = tmp2.rightSib;
		} else if ((tmp2.rightSib.rightSib.rightSib != null) &&
				   (tmp2.rightSib.rightSib.degree == tmp2.rightSib.rightSib.rightSib.degree)) 
		{
			tmp2 = tmp2.rightSib;
		} 
		else 
		{
			this.cmd("Disconnect", tmp2.rightSib.internalGraphicID,  tmp2.rightSib.rightSib.internalGraphicID);
			this.cmd("Disconnect", tmp2.internalGraphicID,  tmp2.rightSib.internalGraphicID);
			if (tmp2.rightSib.rightSib.rightSib != null)
			{
				this.cmd("Disconnect", tmp2.rightSib.rightSib.internalGraphicID,  tmp2.rightSib.rightSib.rightSib.internalGraphicID);
			}
			
			var tempRoot;
			if (tmp2.rightSib.data < tmp2.rightSib.rightSib.data) 
			{
				tmp = tmp2.rightSib.rightSib;
				tmp2.rightSib.rightSib = tmp.rightSib;
				
				tmp.rightSib = tmp2.rightSib.leftChild;
				tmp2.rightSib.leftChild = tmp;
				tmp.parent = tmp2.rightSib;
				tmp2.rightSib.degree++;
				this.cmd("SetText", tmp2.rightSib.degreeID, tmp2.rightSib.degree);
				tempRoot = tmp2.rightSib;
				
			}
			else
			{
				tmp = tmp2.rightSib;
				tmp2.rightSib = tmp2.rightSib.rightSib;
				tmp.rightSib = tmp2.rightSib.leftChild;
				tmp2.rightSib.leftChild = tmp;
				tmp.parent = tmp2.rightSib;
				tmp2.rightSib.degree++;
				this.cmd("SetText", tmp2.rightSib.degreeID, tmp2.rightSib.degree);
				tempRoot = tmp2.rightSib;
			}
			this.cmd("Connect", tempRoot.graphicID, 
					 tempRoot.leftChild.graphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 0, // Directed
					 ""); // Label
			
			this.cmd("Connect", tempRoot.internalGraphicID, 
					 tempRoot.leftChild.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect",  tempRoot.leftChild.internalGraphicID, 
					 tempRoot.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect",  tmp2.internalGraphicID, 
					 tempRoot.internalGraphicID,
					 BinomialQueue.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
			if (tempRoot.leftChild.rightSib != null)
			{
				this.cmd("Disconnect",tempRoot.internalGraphicID, tempRoot.leftChild.rightSib.internalGraphicID);
				this.cmd("Connect",tempRoot.leftChild.internalGraphicID, 
						 tempRoot.leftChild.rightSib.internalGraphicID,
						 BinomialQueue.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label);
			}
			if (tempRoot.rightSib != null)
			{
				this.cmd("Connect",tempRoot.internalGraphicID, 
						 tempRoot.rightSib.internalGraphicID,
						 BinomialQueue.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label);					
			}
			
			
			
			
			this.setPositions(this.treeRoot, BinomialQueue.STARTING_X, BinomialQueue.STARTING_Y);
			this.moveTree(this.treeRoot);	
			this.cmd("Step");
		}
	}
}


BinomialQueue.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
BinomialQueue.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BinomialQueue(animManag, canvas.width, canvas.height);
}



		
function BinomialNode(val, id, initialX, initialY)		
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.degree = 0;
	this.leftChild = null;
	this.rightSib = null;
	this.parent = null;
	this.internalGraphicID = -1;
	this.degreeID = -1;
}



// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


FibonacciHeap.LINK_COLOR = "#007700";
FibonacciHeap.FOREGROUND_COLOR = "#007700";
FibonacciHeap.BACKGROUND_COLOR = "#EEFFEE";
FibonacciHeap.INDEX_COLOR = "#0000FF";

FibonacciHeap.DEGREE_OFFSET_X = -20;
FibonacciHeap.DEGREE_OFFSET_Y = -20;

FibonacciHeap.DELETE_LAB_X = 30;
FibonacciHeap.DELETE_LAB_Y = 50;

FibonacciHeap.NODE_WIDTH = 60;
FibonacciHeap.NODE_HEIGHT = 70

FibonacciHeap.STARTING_X = 70;

FibonacciHeap.INSERT_X = 30;
FibonacciHeap.INSERT_Y = 25

FibonacciHeap.STARTING_Y = 100;
FibonacciHeap.MAX_DEGREE = 7;
FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH = 30;
FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT = 30;
FibonacciHeap.DEGREE_ARRAY_START_X = 500;
FibonacciHeap.INDEGREE_ARRAY_START_Y = 50;

FibonacciHeap.TMP_PTR_Y = 60;

function FibonacciHeap(am, w, h)
{
	this.init(am, w, h);
	
}

FibonacciHeap.inheritFrom(Algorithm);

		
		
FibonacciHeap.prototype.init = function(am, w, h)
{
	FibonacciHeap.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.currentLayer = 1;
	this.animationManager.setAllLayers([0,this.currentLayer]);
	this.minID = 0;
	this.nextIndex = 1;
}


FibonacciHeap.prototype.addControls =  function()
{
	this.controls = [];
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.removeSmallestButton = this.addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.clearHeapButton = this.addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);
	
	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Logical Representation", 
															 "Internal Representation", 
															 ], 
															"BQueueRep");
	
	radioButtonList[0].onclick = this.representationChangedHandler.bind(this, true);
	radioButtonList[1].onclick = this.representationChangedHandler.bind(this, false);
	radioButtonList[0].checked = true;
	
}
		
		
FibonacciHeap.prototype.representationChangedHandler = function(logicalRep, event) 
{
	if (logicalRep)
	{
		this.animationManager.setAllLayers([0,1]);
		this.currentLayer = 1;
	}
	else 
	{
		this.animationManager.setAllLayers([0,2]);
		this.currentLayer = 2;
	}
}

		
		
		
FibonacciHeap.prototype.setPositions = function(tree, xPosition, yPosition) 
{
	if (tree != null)
	{
		if (tree.degree == 0)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			return this.setPositions(tree.rightSib, xPosition + FibonacciHeap.NODE_WIDTH, yPosition);
		}
		else if (tree.degree == 1)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + FibonacciHeap.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + FibonacciHeap.NODE_WIDTH, yPosition);					
		}
		else
		{
			var treeWidth = Math.pow(2, tree.degree - 1);
			tree.x = xPosition + (treeWidth - 1) * FibonacciHeap.NODE_WIDTH;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + FibonacciHeap.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + treeWidth * FibonacciHeap.NODE_WIDTH, yPosition);
		}
	}
	return xPosition;
}
		
FibonacciHeap.prototype.moveTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.internalGraphicID, tree.x, tree.y);
		this.cmd("Move", tree.degreeID, tree.x  + FibonacciHeap.DEGREE_OFFSET_X, tree.y + FibonacciHeap.DEGREE_OFFSET_Y);
		
		this.moveTree(tree.leftChild);
		this.moveTree(tree.rightSib);
	}
}


FibonacciHeap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
FibonacciHeap.prototype.clearCallback = function(event)
{
	this.implementAction(this.clear.bind(this),"");
}
		
FibonacciHeap.prototype.clear  = function()
{
	this.commands = new Array();
	
	
	this.deleteTree(this.treeRoot);
	
	this.cmd("Delete", this.minID);
	this.nextIndex = 1;
	this.treeRoot = null;
	this.minElement = null;
	return this.commands;
}


FibonacciHeap.prototype.deleteTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Delete", tree.graphicID);	
		this.cmd("Delete", tree.internalGraphicID);
		this.cmd("Delete", tree.degreeID);
		this.deleteTree(tree.leftChild);
		this.deleteTree(tree.rightSib);
	}
}
		
FibonacciHeap.prototype.reset = function()
{
	this.treeRoot = null;
	this.nextIndex = 1;
}
		
FibonacciHeap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
FibonacciHeap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		var  tmp;
		var prev;
		
		
		
		if (this.minElement == this.treeRoot) {
			this.treeRoot = this.treeRoot.rightSib;
			prev = null;
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib) ;
			prev.rightSib = prev.rightSib.rightSib;
			
		}
		var moveLabel = this.nextIndex++;
		this.cmd("SetText", this.minElement.graphicID, "");
		this.cmd("SetText", this.minElement.internalGraphicID, "");
		this.cmd("CreateLabel", moveLabel, this.minElement.data, this.minElement.x, this.minElement.y);
		this.cmd("Move", moveLabel, FibonacciHeap.DELETE_LAB_X, FibonacciHeap.DELETE_LAB_Y);
		this.cmd("Step");
		this.cmd("Delete", this.minID);
		var childList = this.minElement.leftChild;
		if (this.treeRoot == null)
		{
			this.cmd("Delete", this.minElement.graphicID);
			this.cmd("Delete", this.minElement.internalGraphicID);
			this.cmd("Delete", this.minElement.degreeID);
			this.treeRoot = childList;
			this.minElement = null;
			if (this.treeRoot != null)
			{
				for (tmp = this.treeRoot; tmp != null; tmp = tmp.rightSib)
				{
					if (this.minElement == null || this.minElement.data > tmp.data)
					{
						this.minElement = tmp;
						
					}
				}
				this.cmd("CreateLabel", this.minID, "Min element", this.minElement.x, FibonacciHeap.TMP_PTR_Y);
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
			}
			
				this.SetAllTreePositions(this.treeRoot, []);
				this.MoveAllTrees(this.treeRoot, []);
			this.cmd("Delete", moveLabel);
				return this.commands;			
			
			
		}
		else if (childList == null)
		{
			if (prev != null && prev.rightSib != null)
			{
				this.cmd("Connect", prev.internalGraphicID, 
						 prev.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", prev.rightSib.internalGraphicID, 
						 prev.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
			}
		}
		else
		{
			var tmp;
			for (tmp = childList; tmp.rightSib != null; tmp = tmp.rightSib)
			{
				tmp.parent = null;
			}
			tmp.parent = null;

			// TODO:  Add in implementation links
			if (prev == null)
			{
				this.cmd("Connect", tmp.internalGraphicID, 
						 this.treeRoot.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.treeRoot.internalGraphicID, 
						tmp.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				tmp.rightSib = this.treeRoot;
				this.treeRoot = childList;				
			}
			else
			{
				this.cmd("Connect", prev.internalGraphicID, 
						 childList.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", childList.internalGraphicID, 
						 prev.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				if (prev.rightSib != null)
				{
					this.cmd("Connect", prev.rightSib.internalGraphicID, 
							 tmp.internalGraphicID,
							 FibonacciHeap.FOREGROUND_COLOR,
							 0.15, // Curve
							 1, // Directed
							 ""); // Label
					this.cmd("Connect", tmp.internalGraphicID, 
							 prev.rightSib.internalGraphicID,
							 FibonacciHeap.FOREGROUND_COLOR,
							 0.15, // Curve
							 1, // Directed
							 ""); // Label
				}
				tmp.rightSib = prev.rightSib;
				prev.rightSib = childList;				
			}			
		}
		this.cmd("Delete", this.minElement.graphicID);
		this.cmd("Delete", this.minElement.internalGraphicID);
		this.cmd("Delete", this.minElement.degreeID);
		
		this.SetAllTreePositions(this.treeRoot, []);
		this.MoveAllTrees(this.treeRoot, []);
		this.fixAfterRemoveMin();
		this.cmd("Delete", moveLabel);
	}
	return this.commands;
}
		
		
FibonacciHeap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	var insertNode = new BinomialNode(insertedValue, this.nextIndex++,  FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	insertNode.internalGraphicID = this.nextIndex++;
	insertNode.degreeID= this.nextIndex++;
	this.cmd("CreateCircle", insertNode.graphicID, insertedValue, FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.graphicID, FibonacciHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.graphicID, FibonacciHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.graphicID, 1);
	this.cmd("CreateCircle", insertNode.internalGraphicID, insertedValue, FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.internalGraphicID, FibonacciHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.internalGraphicID, FibonacciHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.internalGraphicID, 2);
	this.cmd("CreateLabel", insertNode.degreeID, insertNode.degree, insertNode.x  + FibonacciHeap.DEGREE_OFFSET_X, insertNode.y + FibonacciHeap.DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", insertNode.degreeID, "#0000FF");
	this.cmd("SetLayer", insertNode.degreeID, 2);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = insertNode;
		this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
		this.moveTree(this.treeRoot);
		this.cmd("CreateLabel", this.minID, "Min element", this.treeRoot.x, FibonacciHeap.TMP_PTR_Y);
		this.minElement = this.treeRoot;
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
		this.cmd("Connect", this.minID, 
				 this.minElement.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
	}
	else
	{
		var  tmp;
		var prev;
		
		if (this.minElement == this.treeRoot) {
			insertNode.rightSib = this.treeRoot;
			this.treeRoot = insertNode;
			
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect", this.treeRoot.rightSib.internalGraphicID, 
					 this.treeRoot.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Step");
			this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
			if (this.minElement.data > insertNode.data)
			{
				this.cmd("Disconnect", this.minID, this.minElement.graphicID);
				this.cmd("Disconnect", this.minID, this.minElement.internalGraphicID);
				this.minElement = insertNode;
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
			}
			this.cmd("Move", this.minID, this.minElement.x, FibonacciHeap.TMP_PTR_Y);
			this.moveTree(this.treeRoot);
			
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib) ;
			
			
			this.cmd("Disconnect", prev.internalGraphicID, prev.rightSib.internalGraphicID);
			this.cmd("Disconnect", prev.rightSib.internalGraphicID, prev.internalGraphicID);
			
			insertNode.rightSib = prev.rightSib;
			prev.rightSib = insertNode;
			
			this.cmd("Connect", prev.internalGraphicID, 
					 prev.rightSib.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect", prev.rightSib.internalGraphicID, 
					 prev.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			if (prev.rightSib.rightSib != null)
			{
				
				this.cmd("Connect", prev.rightSib.internalGraphicID, 
						 prev.rightSib.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", prev.rightSib.rightSib.internalGraphicID, 
						 prev.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label				
			}
			
			
			this.cmd("Step");
			this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
			if (this.minElement.data > insertNode.data)
			{
				this.cmd("Disconnect", this.minID, this.minElement.graphicID);
				this.cmd("Disconnect", this.minID, this.minElement.internalGraphicID);
				this.minElement = insertNode;
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
			}
			this.cmd("Move", this.minID, this.minElement.x, FibonacciHeap.TMP_PTR_Y);
			
			this.moveTree(this.treeRoot);

		}
		
		
		
		
		
	}
	
	return this.commands;
}

		



FibonacciHeap.prototype.fixAfterRemoveMin = function()
{
	if (this.treeRoot == null)
		return;
	var degreeArray = new Array(FibonacciHeap.MAX_DEGREE);
	var degreeGraphic = new Array(FibonacciHeap.MAX_DEGREE);
	var indexID = new Array(FibonacciHeap.MAX_DEGREE);
	var tmpPtrID = this.nextIndex++;

	var i;
	for (i = 0 ; i <= FibonacciHeap.MAX_DEGREE; i++)
	{
		degreeArray[i] = null;
		degreeGraphic[i] = this.nextIndex++;
		indexID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", 
				 degreeGraphic[i], 
				 " ", 
				 FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT, 
				 FibonacciHeap.DEGREE_ARRAY_START_X + i * FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.INDEGREE_ARRAY_START_Y);
		this.cmd("SetNull", degreeGraphic[i], 1);
		this.cmd("CreateLabel", indexID[i], i,  FibonacciHeap.DEGREE_ARRAY_START_X + i * FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.INDEGREE_ARRAY_START_Y - FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT);
		this.cmd("SetTextColod", indexID[i], FibonacciHeap.INDEX_COLOR);
	}
	var tmp = this.treeRoot;
	// When remving w/ 1 tree. this.treeRoot == null?
	this.cmd("CreateLabel", tmpPtrID, "NextElem", this.treeRoot.x, FibonacciHeap.TMP_PTR_Y);
	while (this.treeRoot != null)
	{
		tmp = this.treeRoot;
		this.cmd("Connect", tmpPtrID, 
				 tmp.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", tmpPtrID, 
				 tmp.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
		this.treeRoot = this.treeRoot.rightSib;
		if (tmp.rightSib != null)
		{
			this.cmd("Disconnect", tmp.internalGraphicID, tmp.rightSib.internalGraphicID);	
			this.cmd("Disconnect", tmp.rightSib.internalGraphicID, tmp.internalGraphicID);	
		}

		this.cmd("Step");
		tmp.rightSib = null;
		while(degreeArray[tmp.degree] != null)
		{
			this.cmd("SetEdgeHighlight", tmpPtrID, tmp.graphicID, 1);
			this.cmd("SetEdgeHighlight", tmpPtrID, tmp.internalGraphicID, 1);

			this.cmd("SetEdgeHighlight", degreeGraphic[tmp.degree], degreeArray[tmp.degree].graphicID, 1);
			this.cmd("SetEdgeHighlight", degreeGraphic[tmp.degree], degreeArray[tmp.degree].internalGraphicID, 1);
			this.cmd("Step");
			this.cmd("Disconnect", tmpPtrID, tmp.graphicID);
			this.cmd("Disconnect", tmpPtrID, tmp.internalGraphicID);

			
			
			this.cmd("Disconnect", degreeGraphic[tmp.degree], degreeArray[tmp.degree].graphicID);
			this.cmd("Disconnect", degreeGraphic[tmp.degree], degreeArray[tmp.degree].internalGraphicID);
			this.cmd("SetNull", degreeGraphic[tmp.degree], 1);
			var tmp2 =  degreeArray[tmp.degree];
			degreeArray[tmp.degree] = null
			tmp = this.combineTrees(tmp, tmp2);
			this.cmd("Connect", tmpPtrID, 
					 tmp.graphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			this.cmd("Connect", tmpPtrID, 
					 tmp.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			this.SetAllTreePositions(this.treeRoot, degreeArray, tmp);
			this.cmd("Move", tmpPtrID, tmp.x, FibonacciHeap.TMP_PTR_Y);
			this.MoveAllTrees(this.treeRoot, degreeArray, tmp);
		}
		this.cmd("Disconnect",  tmpPtrID, tmp.graphicID);
		this.cmd("Disconnect",  tmpPtrID, tmp.internalGraphicID);

		degreeArray[tmp.degree] = tmp;
		this.cmd("SetNull", degreeGraphic[tmp.degree], 0);
		this.cmd("Connect", degreeGraphic[tmp.degree], 
				 tmp.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", degreeGraphic[tmp.degree], 
				 tmp.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Step");
		this.SetAllTreePositions(this.treeRoot, degreeArray);
		this.MoveAllTrees(this.treeRoot, degreeArray);
	}
	this.minElement = null;
	for (i = FibonacciHeap.MAX_DEGREE; i >= 0; i--)
	{
		if (degreeArray[i] != null)
		{
			degreeArray[i].rightSib = this.treeRoot;
			if (this.minElement == null || this.minElement.data > degreeArray[i].data)
			{
				this.minElement = degreeArray[i];				
			}
			this.treeRoot = degreeArray[i];
			if (this.treeRoot.rightSib != null)
			{
				this.cmd("Connect", this.treeRoot.internalGraphicID, 
						this.treeRoot.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.treeRoot.rightSib.internalGraphicID, 
						 this.treeRoot.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
			}			
		}
				
		this.cmd("Delete", degreeGraphic[i]);
		this.cmd("Delete", indexID[i]);
		
	}
	if (this.minElement != null)
	{
		this.cmd("CreateLabel", this.minID,"Min element",  this.minElement.x,FibonacciHeap.TMP_PTR_Y);
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", this.minID, 
				 this.minElement.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
	}
	this.cmd("Delete", tmpPtrID);

}

FibonacciHeap.prototype.MoveAllTrees = function(tree, treeList, tree2)
{
	if (tree2 != null && tree2 != undefined)
	{
		this.moveTree(tree2);
	}
	if (tree != null)
	{
		this.moveTree(tree);		
	}
	for (var i = 0; i < treeList.length; i++)
	{
		if (treeList[i] != null)
		{
			this.moveTree(treeList[i]);
		}
	}
	this.cmd("Step");	
	
	
}


FibonacciHeap.prototype.SetAllTreePositions = function(tree, treeList, tree2)
{
	var leftSize = FibonacciHeap.STARTING_X;
	if (tree2 != null && tree2 != undefined)
	{
		leftSize = this.setPositions(tree2, leftSize, FibonacciHeap.STARTING_Y); //  +FibonacciHeap.NODE_WIDTH;
	}
	if (tree != null)
	{
		leftSize = this.setPositions(tree, leftSize, FibonacciHeap.STARTING_Y); // + FibonacciHeap.NODE_WIDTH;

	}
	for (var i = 0; i < treeList.length; i++)
	{
			if (treeList[i] != null)
			{
				leftSize = this.setPositions(treeList[i], leftSize, FibonacciHeap.STARTING_Y); // + FibonacciHeap.NODE_WIDTH;
			}
	}
}

FibonacciHeap.prototype.combineTrees = function(tree1, tree2)
{
	if (tree2.data < tree1.data)
	{
		var tmp = tree2;
		tree2 = tree1;
		tree1 = tmp;
	}
	if (tree1.degree != tree2.degree)
	{
		return null;
	}
	tree2.rightSib = tree1.leftChild;
	tree2.parent =tree1;
	tree1.leftChild = tree2;
	tree1.degree++;
	
	if (tree1.leftChild.rightSib != null)
	{
		this.cmd("Disconnect", tree1.internalGraphicID, tree1.leftChild.rightSib.internalGraphicID);
		this.cmd("Connect", tree1.leftChild.internalGraphicID, 
				 tree1.leftChild.rightSib.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0.3, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", tree1.leftChild.rightSib.internalGraphicID, 
				 tree1.leftChild.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0.3, // Curve
				 1, // Directed
				 ""); // Label
	}
	
	this.cmd("Connect", tree1.internalGraphicID, 
			 tree1.leftChild.internalGraphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0.15, // Curve
			 1, // Directed
			 ""); // Label
	
	this.cmd("Connect", tree1.leftChild.internalGraphicID, 
			 tree1.internalGraphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0.0, // Curve
			 1, // Directed
			 ""); // Label
	
	this.cmd("SetText", tree1.degreeID, tree1.degree);
	this.cmd("Connect", tree1.graphicID, 
			 tree2.graphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0, // Curve
			 0, // Directed
			 ""); // Label
	// TODO:  Add all the internal links &etc

	return tree1;
	
}

FibonacciHeap.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
FibonacciHeap.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new FibonacciHeap(animManag, canvas.width, canvas.height);
}



		
function BinomialNode(val, id, initialX, initialY)		
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.degree = 0;
	this.leftChild = null;
	this.rightSib = null;
	this.parent = null;
	this.internalGraphicID = -1;
	this.degreeID = -1;
}



// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function LeftistHeap(am, w, h)
{
	this.init(am, w, h);
	
}

LeftistHeap.inheritFrom(Algorithm);

LeftistHeap.LINK_COLOR = "#007700";
LeftistHeap.HIGHLIGHT_CIRCLE_COLOR = "#007700";
LeftistHeap.FOREGROUND_COLOR = "#007700";
LeftistHeap.BACKGROUND_COLOR = "#EEFFEE";

LeftistHeap.WIDTH_DELTA  = 50;
LeftistHeap.HEIGHT_DELTA = 50;
LeftistHeap.STARTING_Y = 85;

LeftistHeap.INSERT_X = 50;
LeftistHeap.INSERT_Y = 45;
LeftistHeap.BACKGROUND_ALPHA = 0.5;

LeftistHeap.MESSAGE_X = 20;
LeftistHeap.MESSAGE_Y = 10;


LeftistHeap.NPL_OFFSET_X = 20;
LeftistHeap.NPL_OFFSET_Y = 20;
LeftistHeap.NPL_COLOR = "#0000FF";

LeftistHeap.MESSAGE_ID = 0;
		
LeftistHeap.prototype.init = function(am, w, h)
{
	LeftistHeap.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.secondaryRoot = null;
	this.animationManager.setAllLayers([0, 1]);
	this.nextIndex = 1;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", LeftistHeap.MESSAGE_X, LeftistHeap.MESSAGE_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.commands = [];
}


LeftistHeap.prototype.addControls =  function()
{
	this.controls = [];
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.removeSmallestButton = this.addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.clearHeapButton = this.addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);
	
	this.showNPLBox = this.addCheckboxToAlgorithmBar("Show Null Path Lengths");
	this.showNPLBox.checked = true;	
	
	this.showNPLBox.onclick = this.NPLChangedHandler.bind(this);
}
		
		
LeftistHeap.prototype.NPLChangedHandler = function(logicalRep, event) 
{
	if (this.showNPLBox.checked)
	{
		this.animationManager.setAllLayers([0,1]);
	}
	else 
	{
		this.animationManager.setAllLayers([0]);
	}
}

		
		

LeftistHeap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
LeftistHeap.prototype.clearCallback = function(event)
{
	this.implementAction(this.clear.bind(this, ""));
}
		
LeftistHeap.prototype.clear  = function(ignored)
{
	this.commands = new Array();
	this.clearTree(this.treeRoot);
	this.treeRoot = null;
	this.nexIndex = 1;	
	return this.commands;
}

LeftistHeap.prototype.clearTree	= function(tree)
{
		if (tree != null)
		{
			this.cmd("Delete", tree.graphicID);
			this.cmd("Delete", tree.nplID);
			this.clearTree(tree.left);
			this.clearTree(tree.right);			
		}
	
}
		
LeftistHeap.prototype.reset = function()
{
	this.treeRoot = null;
	this.secondaryRoot = null;
	this.nextIndex = 1;
}
		
LeftistHeap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
LeftistHeap.prototype.removeSmallest = function(dummy)
{

	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		this.highlightLeft = this.nextIndex++;
		this.highlightRight = this.nextIndex++;

		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Remove root element, leaving two subtrees");
		if (this.treeRoot.left != null)
		{
			this.cmd("Disconnect", this.treeRoot.graphicID, this.treeRoot.left.graphicID);				
		}
		if (this.treeRoot.right != null)
		{
			this.cmd("Disconnect", this.treeRoot.graphicID, this.treeRoot.right.graphicID);				
		}
		var oldElem = this.treeRoot.graphicID;
		this.cmd("Delete", this.treeRoot.nplID);
		this.cmd("Move", this.treeRoot.graphicID, LeftistHeap.INSERT_X, LeftistHeap.INSERT_Y);
		this.cmd("Step");
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Merge the two subtrees");

		if (this.treeRoot.left == null)
		{
			this.treeRoot = null;
		}
		else if (this.treeRoot.right == null)
		{
			this.treeRoot = this.treeRoot.left;
			this.resizeTrees();
		}
		else
		{
			var secondTree = this.treeRoot.right;
			this.secondaryRoot = secondTree;
			this.treeRoot = this.treeRoot.left;
			this.resizeTrees();
			//this.secondaryRoot = null;
			this.cmd("CreateHighlightCircle", this.highlightLeft, LeftistHeap.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);
			
			this.cmd("CreateHighlightCircle", this.highlightRight, LeftistHeap.HIGHLIGHT_CIRCLE_COLOR, secondTree.x, secondTree.y);
			this.treeRoot = this.merge(this.treeRoot, secondTree);	
			this.secondaryRoot = null;
		}
		this.resizeTrees();
		this.cmd("Delete", oldElem);
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "");

				
	}
	// Clear for real
	return this.commands;
	
}


		
LeftistHeap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Create a heap with one node, merge with existing heap.");

	this.secondaryRoot = new LeftistHeapNode(insertedValue, this.nextIndex++, this.nextIndex++, LeftistHeap.INSERT_X,  LeftistHeap.INSERT_Y);
	this.cmd("CreateCircle", this.secondaryRoot.graphicID, insertedValue, this.secondaryRoot.x, this.secondaryRoot.y);
	this.cmd("CreateLabel", this.secondaryRoot.nplID, 0, LeftistHeap.INSERT_X -LeftistHeap.NPL_OFFSET_X, LeftistHeap.INSERT_Y - LeftistHeap.NPL_OFFSET_Y);
	this.cmd("SetForegroundColor", this.secondaryRoot.nplID, LeftistHeap.NPL_COLOR);
	this.cmd("SetLayer", this.secondaryRoot.nplID, 1);
	this.cmd("SetForegroundColor", this.secondaryRoot.graphicID, LeftistHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", this.secondaryRoot.graphicID, LeftistHeap.BACKGROUND_COLOR);

	
	if (this.treeRoot != null)
	{
		this.resizeTrees();
		this.highlightLeft = this.nextIndex++;
		this.highlightRight = this.nextIndex++;
		this.cmd("CreateHighlightCircle", this.highlightLeft, LeftistHeap.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);

		this.cmd("CreateHighlightCircle", this.highlightRight, LeftistHeap.HIGHLIGHT_CIRCLE_COLOR, this.secondaryRoot.x, this.secondaryRoot.y);


		var rightTree = this.secondaryRoot;
		this.secondaryRoot = null;

		this.treeRoot = this.merge(this.treeRoot, rightTree);

		this.resizeTrees();
	}
	else
	{
		this.treeRoot = this.secondaryRoot;
		this.secondaryRoot = null;
		this.resizeTrees();
	}
	this.cmd("SetText", LeftistHeap.MESSAGE_ID, "");
	
	
	return this.commands;
}

		
LeftistHeap.prototype.merge = function(tree1, tree2)
{
	if (tree1 == null)
	{
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Merging right heap with empty heap, return right heap");
		this.cmd("Step");
		this.cmd("Delete", this.highlightRight);
		this.cmd("Delete", this.highlightLeft);

		return tree2;
	}
	if (tree2 == null)
	{		
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Merging left heap with empty heap, return left heap");
		this.cmd("Step");
		this.cmd("Delete", this.highlightRight);
		this.cmd("Delete", this.highlightLeft);

		return tree1;
	}
	var tmp;
	this.cmd("SetHighlight", tree1.graphicID, 1);
	this.cmd("SetHighlight", tree2.graphicID, 1);
	if (tree2.data  < tree1.data)
	{
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Min element is in right heap.  Recursively merge right subtree of right heap with left heap");
		tmp = tree1;
		tree1 = tree2;
		tree2 = tmp;
		tmp = this.highlightRight;
		this.highlightRight = this.highlightLeft;
		this.highlightLeft = tmp;
	}
	else
	{
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Min element is in left heap.  Recursively merge right subtree of left heap with right heap");		
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree1.graphicID, 0);
	this.cmd("SetHighlight", tree2.graphicID, 0);
	if (tree1.right == null)
	{
		this.cmd("Move", this.highlightLeft, tree1.x + LeftistHeap.WIDTH_DELTA / 2, tree1.y + LeftistHeap.HEIGHT_DELTA);
	}
	else
	{
		this.cmd("Move", this.highlightLeft, tree1.right.x, tree1.right.y);
		
	}
	this.cmd("Step");
	if (tree1.right != null)
	{
		this.cmd("Disconnect", tree1.graphicID, tree1.right.graphicID,  LeftistHeap.LINK_COLOR);
	}
	var next = tree1.right;
	this.cmd("SetAlpha", tree1.graphicID, LeftistHeap.BACKGROUND_ALPHA);
	this.cmd("SetAlpha", tree1.nplID, LeftistHeap.BACKGROUND_ALPHA);
	if (tree1.left != null)
	{
		this.cmd("SetEdgeAlpha", tree1.graphicID, tree1.left.graphicID, LeftistHeap.BACKGROUND_ALPHA);
		this.setTreeAlpha(tree1.left, LeftistHeap.BACKGROUND_ALPHA);
		
	}
	this.cmd("Step");
	tree1.right = this.merge(next, tree2);
	if (this.secondaryRoot == tree1.right)
	{
		this.secondaryRoot = null;
	}
	if (this.treeRoot == tree1.right)
	{
		this.treeRoot = null;
	}
	if (tree1.right.parent != tree1)
	{
		tree1.right.disconnectFromParent();
	}
	tree1.right.parent = tree1;
	this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Reconnecting tree after merge");

	this.cmd("Connect", tree1.graphicID, tree1.right.graphicID,  LeftistHeap.LINK_COLOR);
	this.cmd("SetAlpha", tree1.graphicID, 1);
	this.cmd("SetAlpha", tree1.nplID, 1);

	this.resizeTrees();			
	if (tree1.left != null)
	{
		this.cmd("SetEdgeAlpha", tree1.graphicID, tree1.left.graphicID, 1);
		this.setTreeAlpha(tree1.left, 1);
		this.cmd("Step");
	}
	
	if (tree1.left == null || (tree1.left.npl < tree1.right.npl))
	{
		this.cmd("SetHighlight", tree1.graphicID, 1);
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Right subtree has larger Null Path Length than left subtree.  Swapping ...");
		this.cmd("Step")
		this.cmd("SetHighlight", tree1.graphicID, 0);
		var tmp = tree1.left;
		tree1.left = tree1.right;
		tree1.right = tmp;
		this.resizeTrees();			
	}
	else
	{
		this.cmd("SetHighlight", tree1.graphicID, 1);
		this.cmd("SetText", LeftistHeap.MESSAGE_ID, "Left subtree has Null Path Length at least as large as right subtree.  No swap required ...");
		this.cmd("Step")		
		this.cmd("SetHighlight", tree1.graphicID, 0);
		
	}
	if (tree1.right == null)
	{
		tree1.npl = 0;
	}
	else
	{
		tree1.npl = Math.min(tree1.left.npl, tree1.right.npl) + 1;
	}
	this.cmd("SetText", tree1.nplID, tree1.npl);

	return tree1;
}



LeftistHeap.prototype.setTreeAlpha = function(tree, newAlpha)
{
	if (tree != null)
	{
		this.cmd("SetAlpha", tree.graphicID, newAlpha);
		this.cmd("SetAlpha", tree.nplID, newAlpha);
		if (tree.left != null)
		{
			this.cmd("SetEdgeAlpha", tree.graphicID, tree.left.graphicID, newAlpha);
			this.setTreeAlpha(tree.left, newAlpha);
		}
		if (tree.right != null)
		{
			this.cmd("SetEdgeAlpha", tree.graphicID, tree.right.graphicID, newAlpha);
			this.setTreeAlpha(tree.right, newAlpha);
		}
	}
}

LeftistHeap.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), LeftistHeap.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), LeftistHeap.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}



LeftistHeap.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
LeftistHeap.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



LeftistHeap.prototype.resizeTrees = function()
{
	var firstTreeStart;
	var secondTreeStart;
	this.resizeWidths(this.treeRoot);
	this.resizeWidths(this.secondaryRoot);

	if (this.treeRoot != null)
	{	
		startingPoint = this.treeRoot.leftWidth;
		this.setNewPositions(this.treeRoot, startingPoint, LeftistHeap.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		if (this.secondaryRoot != null)
		{
			secondTreeStart = this.treeRoot.leftWidth + this.treeRoot.rightWidth + this.secondaryRoot.leftWidth + 50;
			this.setNewPositions(this.secondaryRoot, secondTreeStart, LeftistHeap.STARTING_Y, 0);
			this.animateNewPositions(this.secondaryRoot);
		}
		
		this.cmd("Step");
	}
	else if (this.secondaryRoot != null)
	{
		startingPoint = this.secondaryRoot.leftWidth;
		this.setNewPositions(this.secondaryRoot, startingPoint, LeftistHeap.STARTING_Y, 0);
		this.animateNewPositions(this.secondaryRoot);
	}
	
}

LeftistHeap.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.npX = xPosition - LeftistHeap.NPL_OFFSET_X;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.npX = xPosition + LeftistHeap.NPL_OFFSET_X;
		}
		else
		{
			tree.heightLabelX = xPosition - LeftistHeap.NPL_OFFSET_Y;;
			tree.npX = xPosition + LeftistHeap.NPL_OFFSET_X;
		}
		tree.x = xPosition;
		tree.npY = tree.y - LeftistHeap.NPL_OFFSET_Y;
		this.setNewPositions(tree.left, xPosition, yPosition + LeftistHeap.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + LeftistHeap.HEIGHT_DELTA, 1)
	}
	
}


LeftistHeap.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.nplID, tree.npX, tree.npY);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new LeftistHeap(animManag, canvas.width, canvas.height);
}



		
function LeftistHeapNode(val, id, nplID, initialX, initialY)		
{
	this.data = val;
	this.x = (initialX == undefined) ? 0 : initialX;
	this.y = (initialY == undefined) ? 0 : initialY;
	this.npX =  initialX - LeftistHeap.NPL_OFFSET_X;
	this.npY =  initialY - LeftistHeap.NPL_OFFSET_Y;

	this.graphicID = id;
	this.nplID = nplID;
	this.npl = 0;
	this.left = null;
	this.right = null;
	this.leftWidth = 0;
	this.rightWidth = 0;
	this.parent = null;
}

LeftistHeapNode.prototype.disconnectFromParent = function()
{
	if (this.parent != null)
	{
		if (this.parent.right == this)
		{
			this.parent.right = null;			
		}
		else if (this.parent.left === this)
		{
			this.parent.left == null;
		}		
	}
}


// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function SkewHeap(am, w, h)
{
	this.init(am, w, h);
	
}

SkewHeap.inheritFrom(Algorithm);

SkewHeap.LINK_COLOR = "#007700";
SkewHeap.HIGHLIGHT_CIRCLE_COLOR = "#007700";
SkewHeap.FOREGROUND_COLOR = "#007700";
SkewHeap.BACKGROUND_COLOR = "#EEFFEE";

SkewHeap.WIDTH_DELTA  = 50;
SkewHeap.HEIGHT_DELTA = 50;
SkewHeap.STARTING_Y = 90;

SkewHeap.INSERT_X = 50;
SkewHeap.INSERT_Y = 45;
SkewHeap.BACKGROUND_ALPHA = 0.5;

SkewHeap.MESSAGE_X = 20;
SkewHeap.MESSAGE_Y = 10;



SkewHeap.MESSAGE_ID = 0;
		
SkewHeap.prototype.init = function(am, w, h)
{
	SkewHeap.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.secondaryRoot = null;
	this.animationManager.setAllLayers([0, 1]);
	this.nextIndex = 1;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", SkewHeap.MESSAGE_X, SkewHeap.MESSAGE_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.commands = [];
}


SkewHeap.prototype.addControls =  function()
{
	this.controls = [];
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.removeSmallestButton = this.addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.clearHeapButton = this.addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);
		
}
		
		
		
		

SkewHeap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
SkewHeap.prototype.clearCallback = function(event)
{
	this.implementAction(this.clear.bind(this, ""));
}
		
SkewHeap.prototype.clear  = function(ignored)
{
	this.commands = new Array();
	this.clearTree(this.treeRoot);
	this.treeRoot = null;
	this.nexIndex = 1;	
	return this.commands;
}

SkewHeap.prototype.clearTree	= function(tree)
{
		if (tree != null)
		{
			this.cmd("Delete", tree.graphicID);
			this.clearTree(tree.left);
			this.clearTree(tree.right);			
		}
	
}
		
SkewHeap.prototype.reset = function()
{
	this.treeRoot = null;
	this.secondaryRoot = null;
	this.nextIndex = 1;
}
		
SkewHeap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
SkewHeap.prototype.removeSmallest = function(dummy)
{

	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		this.highlightLeft = this.nextIndex++;
		this.highlightRight = this.nextIndex++;

		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Remove root element, leaving two subtrees");
		if (this.treeRoot.left != null)
		{
			this.cmd("Disconnect", this.treeRoot.graphicID, this.treeRoot.left.graphicID);				
		}
		if (this.treeRoot.right != null)
		{
			this.cmd("Disconnect", this.treeRoot.graphicID, this.treeRoot.right.graphicID);				
		}
		var oldElem = this.treeRoot.graphicID;
		this.cmd("Move", this.treeRoot.graphicID, SkewHeap.INSERT_X, SkewHeap.INSERT_Y);
		this.cmd("Step");
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Merge the two subtrees");

		if (this.treeRoot.left == null)
		{
			this.treeRoot = null;
		}
		else if (this.treeRoot.right == null)
		{
			this.treeRoot = this.treeRoot.left;
			this.resizeTrees();
		}
		else
		{
			var secondTree = this.treeRoot.right;
			this.secondaryRoot = secondTree;
			this.treeRoot = this.treeRoot.left;
			this.resizeTrees();
			//this.secondaryRoot = null;
			this.cmd("CreateHighlightCircle", this.highlightLeft, SkewHeap.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);
			
			this.cmd("CreateHighlightCircle", this.highlightRight, SkewHeap.HIGHLIGHT_CIRCLE_COLOR, secondTree.x, secondTree.y);
			this.treeRoot = this.merge(this.treeRoot, secondTree);	
			this.secondaryRoot = null;
		}
		this.resizeTrees();
		this.cmd("Delete", oldElem);
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "");

				
	}
	// Clear for real
	return this.commands;
	
}


		
SkewHeap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	this.cmd("SetText", SkewHeap.MESSAGE_ID, "Create a heap with one node, merge with existing heap.");

	this.secondaryRoot = new SkewHeapNode(insertedValue, this.nextIndex++, SkewHeap.INSERT_X,  SkewHeap.INSERT_Y);
	this.cmd("CreateCircle", this.secondaryRoot.graphicID, insertedValue, this.secondaryRoot.x, this.secondaryRoot.y);
	this.cmd("SetForegroundColor", this.secondaryRoot.graphicID, SkewHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", this.secondaryRoot.graphicID, SkewHeap.BACKGROUND_COLOR);

	
	if (this.treeRoot != null)
	{
		this.resizeTrees();
		this.highlightLeft = this.nextIndex++;
		this.highlightRight = this.nextIndex++;
		this.cmd("CreateHighlightCircle", this.highlightLeft, SkewHeap.HIGHLIGHT_CIRCLE_COLOR, this.treeRoot.x, this.treeRoot.y);

		this.cmd("CreateHighlightCircle", this.highlightRight, SkewHeap.HIGHLIGHT_CIRCLE_COLOR, this.secondaryRoot.x, this.secondaryRoot.y);


		var rightTree = this.secondaryRoot;
		this.secondaryRoot = null;

		this.treeRoot = this.merge(this.treeRoot, rightTree);

		this.resizeTrees();
	}
	else
	{
		this.treeRoot = this.secondaryRoot;
		this.secondaryRoot = null;
		this.resizeTrees();
	}
	this.cmd("SetText", SkewHeap.MESSAGE_ID, "");
	
	
	return this.commands;
}

		
SkewHeap.prototype.merge = function(tree1, tree2)
{
	if (tree1 == null)
	{
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Merging right heap with empty heap, return right heap");
		this.cmd("Step");
		this.cmd("Delete", this.highlightRight);
		this.cmd("Delete", this.highlightLeft);

		return tree2;
	}
	if (tree2 == null)
	{		
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Merging left heap with empty heap, return left heap");
		this.cmd("Step");
		this.cmd("Delete", this.highlightRight);
		this.cmd("Delete", this.highlightLeft);

		return tree1;
	}
	var tmp;
	this.cmd("SetHighlight", tree1.graphicID, 1);
	this.cmd("SetHighlight", tree2.graphicID, 1);
	if (tree2.data  < tree1.data)
	{
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Min element is in right heap.  Recursively merge right subtree of right heap with left heap");
		tmp = tree1;
		tree1 = tree2;
		tree2 = tmp;
		tmp = this.highlightRight;
		this.highlightRight = this.highlightLeft;
		this.highlightLeft = tmp;
	}
	else
	{
		this.cmd("SetText", SkewHeap.MESSAGE_ID, "Min element is in left heap.  Recursively merge right subtree of left heap with right heap");		
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree1.graphicID, 0);
	this.cmd("SetHighlight", tree2.graphicID, 0);
	if (tree1.right == null)
	{
		this.cmd("Move", this.highlightLeft, tree1.x + SkewHeap.WIDTH_DELTA / 2, tree1.y + SkewHeap.HEIGHT_DELTA);
	}
	else
	{
		this.cmd("Move", this.highlightLeft, tree1.right.x, tree1.right.y);
		
	}
	this.cmd("Step");
	if (tree1.right != null)
	{
		this.cmd("Disconnect", tree1.graphicID, tree1.right.graphicID,  SkewHeap.LINK_COLOR);
	}
	var next = tree1.right;
	this.cmd("SetAlpha", tree1.graphicID, SkewHeap.BACKGROUND_ALPHA);
	if (tree1.left != null)
	{
		this.cmd("SetEdgeAlpha", tree1.graphicID, tree1.left.graphicID, SkewHeap.BACKGROUND_ALPHA);
		this.setTreeAlpha(tree1.left, SkewHeap.BACKGROUND_ALPHA);
		
	}
	this.cmd("Step");
	tree1.right = this.merge(next, tree2);
	if (this.secondaryRoot == tree1.right)
	{
		this.secondaryRoot = null;
	}
	if (this.treeRoot == tree1.right)
	{
		this.treeRoot = null;
	}
	if (tree1.right.parent != tree1)
	{
		tree1.right.disconnectFromParent();
	}
	tree1.right.parent = tree1;
	this.cmd("SetText", SkewHeap.MESSAGE_ID, "Reconnecting tree after merge");

	this.cmd("Connect", tree1.graphicID, tree1.right.graphicID,  SkewHeap.LINK_COLOR);
	this.cmd("SetAlpha", tree1.graphicID, 1);

	this.resizeTrees();			
	if (tree1.left != null)
	{
		this.cmd("SetEdgeAlpha", tree1.graphicID, tree1.left.graphicID, 1);
		this.setTreeAlpha(tree1.left, 1);
		this.cmd("Step");
	}
	
	this.cmd("SetHighlight", tree1.graphicID, 1);
	this.cmd("SetText", SkewHeap.MESSAGE_ID, "Swapping subtrees after merge ...");
	this.cmd("Step")
	this.cmd("SetHighlight", tree1.graphicID, 0);
	var tmp = tree1.left;
	tree1.left = tree1.right;
	tree1.right = tmp;
	this.resizeTrees();			

	return tree1;
}



SkewHeap.prototype.setTreeAlpha = function(tree, newAlpha)
{
	if (tree != null)
	{
		this.cmd("SetAlpha", tree.graphicID, newAlpha);
		if (tree.left != null)
		{
			this.cmd("SetEdgeAlpha", tree.graphicID, tree.left.graphicID, newAlpha);
			this.setTreeAlpha(tree.left, newAlpha);
		}
		if (tree.right != null)
		{
			this.cmd("SetEdgeAlpha", tree.graphicID, tree.right.graphicID, newAlpha);
			this.setTreeAlpha(tree.right, newAlpha);
		}
	}
}

SkewHeap.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), SkewHeap.WIDTH_DELTA / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), SkewHeap.WIDTH_DELTA / 2);
	return tree.leftWidth + tree.rightWidth;
}



SkewHeap.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
SkewHeap.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



SkewHeap.prototype.resizeTrees = function()
{
	var firstTreeStart;
	var secondTreeStart;
	this.resizeWidths(this.treeRoot);
	this.resizeWidths(this.secondaryRoot);

	if (this.treeRoot != null)
	{	
		startingPoint = this.treeRoot.leftWidth;
		this.setNewPositions(this.treeRoot, startingPoint, SkewHeap.STARTING_Y, 0);
		this.animateNewPositions(this.treeRoot);
		if (this.secondaryRoot != null)
		{
			secondTreeStart = this.treeRoot.leftWidth + this.treeRoot.rightWidth + this.secondaryRoot.leftWidth + 50;
			this.setNewPositions(this.secondaryRoot, secondTreeStart, SkewHeap.STARTING_Y, 0);
			this.animateNewPositions(this.secondaryRoot);
		}
		
		this.cmd("Step");
	}
	else if (this.secondaryRoot != null)
	{
		startingPoint = this.secondaryRoot.leftWidth;
		this.setNewPositions(this.secondaryRoot, startingPoint, SkewHeap.STARTING_Y, 0);
		this.animateNewPositions(this.secondaryRoot);
	}
	
}

SkewHeap.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
		}
		else
		{
// ???			tree.heightLabelX = xPosition - SkewHeap.NPL_OFFSET_Y;
		}
		tree.x = xPosition;
		this.setNewPositions(tree.left, xPosition, yPosition + SkewHeap.HEIGHT_DELTA, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + SkewHeap.HEIGHT_DELTA, 1)
	}
	
}


SkewHeap.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new SkewHeap(animManag, canvas.width, canvas.height);
}



		
function SkewHeapNode(val, id, initialX, initialY)		
{
	this.data = val;
	this.x = (initialX == undefined) ? 0 : initialX;
	this.y = (initialY == undefined) ? 0 : initialY;

	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.leftWidth = 0;
	this.rightWidth = 0;
	this.parent = null;
}

SkewHeapNode.prototype.disconnectFromParent = function()
{
	if (this.parent != null)
	{
		if (this.parent.right == this)
		{
			this.parent.right = null;			
		}
		else if (this.parent.left === this)
		{
			this.parent.left == null;
		}		
	}
}


// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function Recursive(am, w, h)
{
	// this shouldn't happen if subclassing is done properly
	if (!am)
		throw "this shouldn't happen";

	this.init(am, w, h);
}
Recursive.inheritFrom(Algorithm);


Recursive.CODE_START_X = 10;
Recursive.CODE_START_Y = 10;
Recursive.CODE_LINE_HEIGHT = 14;

Recursive.RECURSIVE_START_X = 20;
Recursive.RECURSIVE_START_Y = 120;
Recursive.RECURSIVE_DELTA_Y = 14;
Recursive.RECURSIVE_DELTA_X = 15;
Recursive.CODE_HIGHLIGHT_COLOR = "#FF0000";
Recursive.CODE_STANDARD_COLOR = "#000000";

Recursive.TABLE_INDEX_COLOR = "#0000FF"
Recursive.CODE_RECURSIVE_1_COLOR = "#339933";
Recursive.CODE_RECURSIVE_2_COLOR = "#0099FF";

Recursive.ACTIVATION_RECORD_WIDTH = 100;
Recursive.ACTIVATION_RECORD_HEIGHT = 20;

Recursive.ACTIVATION_RECORD_SPACING = 2 * Recursive.ACTIVATION_RECORD_WIDTH + 10;


		

Recursive.SEPARATING_LINE_COLOR = "#0000FF"

Recursive.prototype.addCodeToCanvas  = function(code)
{
     this.codeID = this.addCodeToCanvasBase(code, Recursive.CODE_START_X, Recursive.CODE_START_Y, Recursive.CODE_LINE_HEIGHT, Recursive.CODE_STANDARD_COLOR);
/*	this.codeID = Array(this.code.length);
	var i, j;
	for (i = 0; i < code.length; i++)
	{
		this.codeID[i] = new Array(code[i].length);
		for (j = 0; j < code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], code[i][j], Recursive.CODE_START_X, Recursive.CODE_START_Y + i * Recursive.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], Recursive.CODE_STANDARD_COLOR);
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
		
		
	} */
	
}


Recursive.prototype.init = function(am, w, h)
{
	Recursive.superclass.init.call(this, am, w, h);
}
	

Recursive.prototype.clearOldIDs = function()
{
	for (var i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;
	
}


Recursive.prototype.reset = function()
{
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;	
}

		


Recursive.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
Recursive.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



Recursive.prototype.deleteActivation = function(activationRec)
{
	var i;
	for (i = 0; i < activationRec.labelIDs.length; i++)
	{
		this.cmd("Delete", activationRec.labelIDs[i]);
		this.cmd("Delete", activationRec.fieldIDs[i]);
	}
	this.cmd("Delete", activationRec.separatingLineID);
	this.cmd("Delete", activationRec.nameID);
}


Recursive.prototype.createActivation = function(functionName, argList, x, y, labelsOnLeft)
{
	var activationRec = new ActivationRecord(argList);
	var i;
	activationRec.nameID = this.nextIndex++;
	labelsOnLeft = (labelsOnLeft == undefined) ? true : labelsOnLeft;
	for (i = 0; i < argList.length; i++)
	{
		var valueID = this.nextIndex++;
		activationRec.fieldIDs[i] = valueID;
		
		this.cmd("CreateRectangle", valueID,
				                    "",
								    Recursive.ACTIVATION_RECORD_WIDTH, 
								    Recursive.ACTIVATION_RECORD_HEIGHT, 
				                    x,
				                    y + i * Recursive.ACTIVATION_RECORD_HEIGHT);
		
		var labelID  = this.nextIndex++;
		activationRec.labelIDs[i] = labelID;
		this.cmd("CreateLabel", labelID, argList[i]);
		if (labelsOnLeft)
			this.cmd("AlignLeft", labelID, valueID);
		else
			this.cmd("AlignRight", labelID, valueID);
	}
	activationRec.separatingLineID = this.nextIndex++;
	this.cmd("CreateLabel", activationRec.nameID, "   " + functionName + "   ");
	this.cmd("SetForegroundColor", activationRec.nameID, Recursive.SEPARATING_LINE_COLOR);

	if (labelsOnLeft)
	{
		this.cmd("CreateRectangle", activationRec.separatingLineID,
				 "",
				 Recursive.ACTIVATION_RECORD_WIDTH * 2,
				 1,
				 x - Recursive.ACTIVATION_RECORD_WIDTH / 2,
				 y - Recursive.ACTIVATION_RECORD_HEIGHT / 2);
				this.cmd("AlignLeft", activationRec.nameID, activationRec.labelIDs[0]);
	}
	else
	{
		this.cmd("CreateRectangle", activationRec.separatingLineID,
				 "",
				 Recursive.ACTIVATION_RECORD_WIDTH * 2,
				 1,
				 x + Recursive.ACTIVATION_RECORD_WIDTH / 2,
				 y - Recursive.ACTIVATION_RECORD_HEIGHT / 2);
		this.cmd("AlignRight", activationRec.nameID, activationRec.labelIDs[0]);

	}
	this.cmd("SetForegroundColor", activationRec.separatingLineID, Recursive.SEPARATING_LINE_COLOR);
	return activationRec;
	
}



function ActivationRecord(fields)
{
	this.fields = fields;
	this.values = new Array(this.fields.length);
	var i;
	for (i = 0; i < this.fields.length; i++)
	{
		this.values[i] = "";
	}
	this.fieldIDs = new Array(this.fields.length);
	this.labelIDs = new Array(this.fields.length);	
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL David Galles OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function RecFact(am, w, h)
{
	// call superclass' constructor, which calls init
	RecFact.superclass.constructor.call(this, am, w, h);
}
RecFact.inheritFrom(Recursive);


RecFact.MAX_VALUE = 20;

RecFact.ACTIVATION_FIELDS = ["n ", "subValue ", "returnValue "];
RecFact.CODE = [["def ","factorial(n)",":"], 
				["     if ","(n <= 1): "],
				["          return 1"],
				["     else:"],
				["          subSolution = ", "factorial(n - 1)"],
				["          solution = ", "subSolution * n"],
				["          return ", "solution"]];


RecFact.RECURSIVE_DELTA_Y = RecFact.ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;

RecFact.ACTIVATION_RECORT_START_X = 330;
RecFact.ACTIVATION_RECORT_START_Y = 20;



RecFact.prototype.init = function(am, w, h)
{
	RecFact.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = RecFact.CODE;
	
	
	this.addCodeToCanvas(this.code);
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


RecFact.prototype.addControls =  function()
{
	this.controls = [];
	this.factorialField = this.addControlToAlgorithmBar("Text", "");
	this.factorialField.onkeydown = this.returnSubmit(this.factorialField,  this.factorialCallback.bind(this), 2, true);
	this.controls.push(this.factorialField);

	this.factorialButton = this.addControlToAlgorithmBar("Button", "Factorial");
	this.factorialButton.onclick = this.factorialCallback.bind(this);
	this.controls.push(this.factorialButton);
		
}
	


		
RecFact.prototype.factorialCallback = function(event)
{
	var factValue;
	
	if (this.factorialField.value != "")
	{
		var factValue = Math.min(parseInt(this.factorialField.value), RecFact.MAX_VALUE);
		this.factorialField.value = String(factValue);
		this.implementAction(this.doFactorial.bind(this),factValue);
	}
}




RecFact.prototype.doFactorial = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	this.currentY = RecFact.ACTIVATION_RECORT_START_Y;
	this.currentX = RecFact.ACTIVATION_RECORT_START_X;
	
	var final = this.factorial(value);
	var resultID = this.nextIndex++;
	this.oldIDs.push(resultID);
	this.cmd("CreateLabel", resultID, "factorial(" + String(value) + ") = " + String(final),  
			 Recursive.CODE_START_X, Recursive.CODE_START_Y + (this.code.length + 1) * Recursive.CODE_LINE_HEIGHT, 0);
	//this.cmd("SetText", functionCallID, "factorial(" + String(value) + ") = " + String(final));
	return this.commands;
}


RecFact.prototype.factorial = function(value)
{	
	var activationRec = this.createActivation("factorial     ", RecFact.ACTIVATION_FIELDS, this.currentX, this.currentY);
	this.cmd("SetText", activationRec.fieldIDs[0], value);
//	this.cmd("CreateLabel", ID, "", 10, this.currentY, 0);
	var oldX  = this.currentX;
	var oldY = this.currentY;
	this.currentY += RecFact.RECURSIVE_DELTA_Y;
	if (this.currentY + Recursive.RECURSIVE_DELTA_Y > this.canvasHeight)
	{
		this.currentY =  RecFact.ACTIVATION_RECORT_START_Y;
		this.currentX += Recursive.ACTIVATION_RECORD_SPACING;
	}
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	if (value > 1)
	{
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
		
		var firstValue = this.factorial(value-1);

		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetText", activationRec.fieldIDs[1], firstValue);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
			
		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetText", activationRec.fieldIDs[2], firstValue * value);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);

		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("Step");
		this.deleteActivation(activationRec);
		this.currentY = oldY;
		this.currentX = oldX;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = " + String(firstValue * value), oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("Delete",this.nextIndex);
		
		
		
//		this.cmd("SetForegroundColor", this.codeID[4][3], Recursive.CODE_HIGHLIGHT_COLOR);
//		this.cmd("Step");

		return firstValue *value;
	}
	else
	{
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_STANDARD_COLOR);
		
		
		this.currentY = oldY;
		this.currentX = oldX;
		this.deleteActivation(activationRec);
		this.cmd("CreateLabel", this.nextIndex, "Return Value = 1", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		
		return 1;
	}
	
	
	
}
var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RecFact(animManag, canvas.width, canvas.height);
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function Queens(am, w, h)
{
	// call superclass' constructor, which calls init
	Queens.superclass.constructor.call(this, am, w, h);
}

Queens.inheritFrom(Recursive);

Queens.CALC_QUEENS_ACTIVATION_FIELDS = ["  size  ", "  board  "];
Queens.QUEENS_ACTIVATION_FIELDS = ["  board  ", "  current  ", "  size  ", "  i  ", "  done  "];
Queens.CHECK_ACTIVATION_FIELDS = ["  board  ", "  current  ", "  i  "];

Queens.CODE = [["def ","calcQueens(size)",":"],
				["     board = ", "[-1] * size"],
				[ "    return  ","queens(board, 0, size)"],
				["  "],
				["def ","queens(board, current, size)",":"],
				["     if ", "(current == size):"],
				["          return true"],
				["     else:"],
				["          for i in range(size):"],
				["               board[current] = i"],
				["               if (","noConflicts(board, current)",":"],
				["                    done"," = ", "queens(board, current + 1, size)"],
				["                    if (done):"],
				["                         return true"],
			    ["          return false"],
				[" "],
				["def ","noConflicts(board, current)",":"],
				["      for i in range(current):"],
				["         if ","(board[i] == board[current])",":"],
				["             return false"],
				["         if ","(current - i == abs(board[current] = board[i]))",":"],
				["             return false"],
			    ["      return true"]];
				

Queens.RECURSIVE_DELTA_Y_CALC_QUEEN = Queens.CALC_QUEENS_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;
Queens.RECURSIVE_DELTA_Y_QUEEN = Queens.QUEENS_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;
Queens.RECURSIVE_DELTA_Y_CHECK = Queens.CHECK_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;


Queens.ACTIVATION_RECORT_START_X = 450;
Queens.ACTIVATION_RECORT_START_Y = 20;

Queens.INTERNAL_BOARD_START_X = 600;
Queens.INTERNAL_BOARD_START_Y = 100;
Queens.INTERNAL_BOARD_WIDTH = 20;
Queens.INTERNAL_BOARD_HEIGHT = 20;

Queens.LOGICAL_BOARD_START_X = Queens.INTERNAL_BOARD_START_X;
Queens.LOGICAL_BOARD_START_Y = Queens.INTERNAL_BOARD_START_Y + Queens.INTERNAL_BOARD_HEIGHT * 1.5;
Queens.LOGICAL_BOARD_WIDTH = Queens.INTERNAL_BOARD_WIDTH;
Queens.LOGICAL_BOARD_HEIGHT = Queens.INTERNAL_BOARD_HEIGHT;
Queens.ACTIVATION_RECORD_SPACING = 400;


Queens.INDEX_COLOR = "#0000FF";

Queens.prototype.init = function(am, w, h)
{
	Queens.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = Queens.CODE;
	
	
	this.addCodeToCanvas(this.code);
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


Queens.prototype.addControls =  function()
{
	this.controls = [];
	this.addLabelToAlgorithmBar("Board size:  (1-8)");

	this.sizeField = this.addControlToAlgorithmBar("Text", "");
	this.sizeField.onkeydown = this.returnSubmit(this.sizeField,  this.queensCallback.bind(this), 2, true);
	this.controls.push(this.sizeField);

	this.queensButton = this.addControlToAlgorithmBar("Button", "Queens");
	this.queensButton.onclick = this.queensCallback.bind(this);
	this.controls.push(this.queensButton);
		
}
	


		
Queens.prototype.queensCallback = function(event)
{
	var queensValue;
	
	if (this.sizeField.value != "")
	{
		var queenSize =  parseInt(this.sizeField.value);
		queenSize = Math.min(queenSize, 8);
		this.sizeField.value = String(queenSize);
		this.implementAction(this.doQueens.bind(this),queenSize);
	}
}




Queens.prototype.doQueens = function(size)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	
	this.boardData = new Array(size);
	this.boardInternalID = new Array(size);
	this.boardLogicalID = new Array(size);
	this.boardInternalIndexID = new Array(size);
	
	
	this.currentY = Queens.ACTIVATION_RECORT_START_Y;
	this.currentX = Queens.ACTIVATION_RECORT_START_X;
	this.activationLeft = true;
	
	
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	var activationRec = this.createActivation("calcQueens", Queens.CALC_QUEENS_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.currentY += Queens.RECURSIVE_DELTA_Y_CALC_QUEEN;

	this.cmd("SetText", activationRec.fieldIDs[0], size);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][0], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	
	
	for (var i = 0; i < size; i++)
	{
		this.boardInternalID[i] = this.nextIndex++;
		this.oldIDs.push(this.boardInternalID[i])
		this.cmd("CreateRectangle", this.boardInternalID[i],
				 "-1",
				 Queens.INTERNAL_BOARD_WIDTH, 
				 Queens.INTERNAL_BOARD_HEIGHT, 
				 Queens.INTERNAL_BOARD_START_X  + i * Queens.INTERNAL_BOARD_WIDTH,
				 Queens.INTERNAL_BOARD_START_Y);

		this.boardInternalIndexID[i] = this.nextIndex++;
		this.oldIDs.push(this.boardInternalIndexID[i]);
		this.cmd("CreateLabel", this.boardInternalIndexID[i], i,Queens.INTERNAL_BOARD_START_X  + i * Queens.INTERNAL_BOARD_WIDTH,
				 Queens.INTERNAL_BOARD_START_Y - Queens.INTERNAL_BOARD_HEIGHT);
		this.cmd("SetForegroundColor", this.boardInternalIndexID[i], Queens.INDEX_COLOR);
		
		this.boardLogicalID[i] = new Array(size);
		for (var j = 0; j < size; j++)
		{
			this.boardLogicalID[i][j] = this.nextIndex++;
			this.oldIDs.push(this.boardLogicalID[i][j]);
			
			this.cmd("CreateRectangle", this.boardLogicalID[i][j],
					 "",
					 Queens.LOGICAL_BOARD_WIDTH, 
					 Queens.LOGICAL_BOARD_HEIGHT, 
					 Queens.LOGICAL_BOARD_START_X  + j * Queens.LOGICAL_BOARD_WIDTH,
					 Queens.LOGICAL_BOARD_START_Y  + i * Queens.LOGICAL_BOARD_HEIGHT);
			
			
		}
	}
	this.cmd("Connect", activationRec.fieldIDs[1], this.boardInternalID[0]);
	this.cmd("Step");
	
	this.cmd("SetForegroundColor", this.codeID[1][0], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[2][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[2][1], Recursive.CODE_STANDARD_COLOR);
	
	
	
	
	board = new Array(size);
	this.queens(board, 0, size);
	this.cmd("Step");
	this.cmd("Delete", this.nextIndex);
	this.deleteActivation(activationRec);

	
	return this.commands;
}


Queens.prototype.queens = function(board, current, size)
{
	var oldX  = this.currentX;
	var oldY = this.currentY;
	var oldLeft = this.activationLeft;
	var activationRec = this.createActivation("queens", Queens.QUEENS_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
	
	this.cmd("SetText", activationRec.fieldIDs[1], current);
	this.cmd("SetText", activationRec.fieldIDs[2], size);
	if (this.activationLeft)
	{
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[0]);
	}
	else
	{		
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[size-1]);		
	}
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
	
	this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
	
	
	this.currentY += Queens.RECURSIVE_DELTA_Y_QUEEN;
	if (this.currentY + Queens.RECURSIVE_DELTA_Y_QUEEN > this.canvasHeight)
	{
		this.currentY =  Queens.ACTIVATION_RECORT_START_Y;
		this.currentX += Queens.ACTIVATION_RECORD_SPACING;
		this.activationLeft = false;
	}
	
	if (current == size)
	{
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_STANDARD_COLOR);
		
		this.deleteActivation(activationRec);
		this.currentX = oldX;
		this.currentY = oldY;
		this.activationLeft = oldLeft;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = true", this.currentX, this.currentY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

		return true;
	}
	
	var i;
	for (i = 0; i < size; i++)
	{
		this.cmd("SetTextColor", this.codeID[8][0], Recursive.CODE_HIGHLIGHT_COLOR);
		board[current] = i;
		this.cmd("SetText", activationRec.fieldIDs[3], i);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[8][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[9][0], Recursive.CODE_HIGHLIGHT_COLOR);
		
		
		this.cmd("SetText", this.boardLogicalID[i][current], "Q");
		this.cmd("SetText", this.boardInternalID[current], i);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[9][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_STANDARD_COLOR);
		
		var moveLegal = this.legal(board,current);
		this.cmd("SetTextColor", this.codeID[10][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		this.cmd("SetTextColor", this.codeID[10][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_STANDARD_COLOR);

		
		
		
		if (moveLegal)
		{
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_STANDARD_COLOR);
			var done = this.queens(board, current+1, size);
			this.cmd("SetTextColor", this.codeID[11][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetTextColor", this.codeID[11][1], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetText", activationRec.fieldIDs[4], done);
			this.cmd("Step");
			this.cmd("Delete", this.nextIndex);
			this.cmd("SetTextColor", this.codeID[11][0], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[11][1], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[12][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetTextColor", this.codeID[12][0], Recursive.CODE_STANDARD_COLOR);
			
			if (done)
			{
				this.cmd("SetTextColor", this.codeID[13][0], Recursive.CODE_HIGHLIGHT_COLOR);
				this.cmd("Step");
				this.cmd("SetTextColor", this.codeID[13][0], Recursive.CODE_STANDARD_COLOR);
				
				this.deleteActivation(activationRec);
				this.currentX = oldX;
				this.currentY = oldY;
				this.activationLeft = oldLeft;
				this.cmd("CreateLabel", this.nextIndex, "Return Value = true", this.currentX, this.currentY);
				this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

				return true;						
			}
		}
		this.cmd("SetText", this.boardLogicalID[i][current], "");
		
			
	}
	this.cmd("SetTextColor", this.codeID[14][0], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetTextColor", this.codeID[14][0], Recursive.CODE_STANDARD_COLOR);
	this.deleteActivation(activationRec);
	this.currentX = oldX;
	this.currentY = oldY;
	this.activationLeft = oldLeft;
	this.cmd("CreateLabel", this.nextIndex, "Return Value = false", this.currentX, this.currentY);
	this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

	return false;
}


Queens.prototype.legal = function(board, current)
{
	var activationRec = this.createActivation("noConflicts", Queens.CHECK_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.cmd("SetText", activationRec.fieldIDs[1], current);
	if (this.activationLeft)
	{
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[0]);
	}
	else
	{		
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[this.boardInternalID.length - 1]);		
	}
	this.cmd("SetForegroundColor", this.codeID[16][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[16][1], Recursive.CODE_STANDARD_COLOR);
	
	
	var i;
	var OK = true;
	if (current == 0)
	{
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step")
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_STANDARD_COLOR);		
	}
	for (i = 0; i < current; i++)
	{
		this.cmd("SetText", activationRec.fieldIDs[2], i);
		this.cmd("SetTextColor", activationRec.fieldIDs[2], Recursive.CODE_HIGHLIGHT_COLOR)
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step")
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", activationRec.fieldIDs[2], Recursive.CODE_STANDARD_COLOR)
		this.cmd("SetForegroundColor", this.codeID[18][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[18][1], Recursive.CODE_STANDARD_COLOR);

		if (board[i] == board[current])
		{
			this.cmd("SetForegroundColor", this.codeID[19][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[19][0], Recursive.CODE_STANDARD_COLOR);
			OK = false;
			break;
		}
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("SetForegroundColor", this.codeID[20][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[20][1], Recursive.CODE_STANDARD_COLOR);
		
		if (current - i == Math.abs(board[current] - board[i]))
		{
			this.cmd("SetForegroundColor", this.codeID[21][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[21][0], Recursive.CODE_STANDARD_COLOR);
			
			OK = false;
			break;
		}
		
	}
	if (OK)
	{
		this.cmd("SetForegroundColor", this.codeID[22][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[22][0], Recursive.CODE_STANDARD_COLOR);
	}
	this.cmd("CreateLabel", this.nextIndex, "Return Value = " + String(OK), this.currentX, this.currentY);
	this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
	this.deleteActivation(activationRec);
	
	return OK;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Queens(animManag, canvas.width, canvas.height);
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function Reverse(am, w, h)
{
	// call superclass' constructor, which calls init
	Reverse.superclass.constructor.call(this, am, w, h);
}
Reverse.inheritFrom(Recursive);

Reverse.ACTIVATION_FIELDS = ["word ", "subProblem ", "subSolution ", "solution "];

Reverse.CODE = [["def ","reverse(word)",":"], 
				["     if ","(word == \"\"): "],
				["          return word"],
				["     else:"],
				["          subProblem = ", "word[1:]"],
				["          subSolution = ", "reverse(subProblem)"],
				["          solution = ", "subSolution + word[0]"],
				["          return = ", "solution"]];


Reverse.RECURSIVE_DELTA_Y = Reverse.ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;


Reverse.ACTIVATION_RECORT_START_X = 375;
Reverse.ACTIVATION_RECORT_START_Y = 20;



Reverse.prototype.init = function(am, w, h)
{
	Reverse.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = Reverse.CODE;
	
	
	this.addCodeToCanvas(this.code);
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


Reverse.prototype.addControls =  function()
{
	this.controls = [];
	this.reverseField = this.addControlToAlgorithmBar("Text", "");
	this.reverseField.onkeydown = this.returnSubmit(this.reverseField,  this.reverseCallback.bind(this), 10, false);
	this.controls.push(this.reverseField);

	this.reverseButton = this.addControlToAlgorithmBar("Button", "Reverse");
	this.reverseButton.onclick = this.reverseCallback.bind(this);
	this.controls.push(this.reverseButton);
		
}
	


		
Reverse.prototype.reverseCallback = function(event)
{
	var factValue;
	
	if (this.reverseField.value != "")
	{
		var revValue =this.reverseField.value;
		this.implementAction(this.doReverse.bind(this),revValue);
	}
}




Reverse.prototype.doReverse = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	this.currentY = Reverse.ACTIVATION_RECORT_START_Y;
	this.currentX = Reverse.ACTIVATION_RECORT_START_X;
	
	var final = this.reverse(value);
	var resultID = this.nextIndex++;
	this.oldIDs.push(resultID);
	this.cmd("CreateLabel", resultID, "reverse(" + String(value) + ") = " + String(final),  
			 Recursive.CODE_START_X, Recursive.CODE_START_Y + (this.code.length + 1) * Recursive.CODE_LINE_HEIGHT, 0);
	return this.commands;
}


Reverse.prototype.reverse = function(value)
{
	
	var activationRec = this.createActivation("reverse     ", Reverse.ACTIVATION_FIELDS, this.currentX, this.currentY);
	this.cmd("SetText", activationRec.fieldIDs[0], value);
//	this.cmd("CreateLabel", ID, "", 10, this.currentY, 0);
	var oldX  = this.currentX;
	var oldY = this.currentY;
	this.currentY += Reverse.RECURSIVE_DELTA_Y;
	if (this.currentY + Recursive.RECURSIVE_DELTA_Y > this.canvasHeight)
	{
		this.currentY =  Reverse.ACTIVATION_RECORT_START_Y;
		this.currentX += Recursive.ACTIVATION_RECORD_SPACING;
	}
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	if (value  != "")
	{
		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
		var subProblem = value.substr(1);
		this.cmd("SetText", activationRec.fieldIDs[1], subProblem);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
		
		
		
		var subSolution = this.reverse(subProblem);

		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetText", activationRec.fieldIDs[2], subSolution);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
			
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_HIGHLIGHT_COLOR);
		var solution = subSolution + value[0];
		this.cmd("SetText", activationRec.fieldIDs[3], solution);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_STANDARD_COLOR);

		this.cmd("SetForegroundColor", this.codeID[7][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[7][1], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("Step");
		this.deleteActivation(activationRec);
		this.currentY = oldY;
		this.currentX = oldX;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = \"" + solution + "\"", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[7][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[7][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("Delete",this.nextIndex);
		
		
		
//		this.cmd("SetForegroundColor", this.codeID[4][3], Recursive.CODE_HIGHLIGHT_COLOR);
//		this.cmd("Step");

		return solution;
	}
	else
	{
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_STANDARD_COLOR);
		
		
		this.currentY = oldY;
		this.currentX = oldX;
		this.deleteActivation(activationRec);
		this.cmd("CreateLabel", this.nextIndex, "Return Value = \"\"", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		
		return "";
	}
	
	
	
}
var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Reverse(animManag, canvas.width, canvas.height);
}




// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function Hash(am, w, h)
{
	// this shouldn't happen if subclassing is done properly
	if (!am)
		throw "this shouldn't happen";

	this.init(am, w, h);
}
Hash.inheritFrom(Algorithm);

Hash.MAX_HASH_LENGTH = 10;


Hash.HASH_NUMBER_START_X = 200;
Hash.HASH_X_DIFF = 7;
Hash.HASH_NUMBER_START_Y = 10;
Hash.HASH_ADD_START_Y = 30;
Hash.HASH_INPUT_START_X = 60;
Hash.HASH_INPUT_X_DIFF = 7;
Hash.HASH_INPUT_START_Y = 45;
Hash.HASH_ADD_LINE_Y = 42;
Hash.HASH_RESULT_Y = 50;
Hash.ELF_HASH_SHIFT = 10;

Hash.HASH_LABEL_X = 300;
Hash.HASH_LABEL_Y = 30;
Hash.HASH_LABEL_DELTA_X = 50;

Hash.HIGHLIGHT_COLOR = "#0000FF";



Hash.prototype.init = function(am, w, h)
{
	var sc = Hash.superclass;
	var fn = sc.init;
	fn.call(this,am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.hashingIntegers = true;
	
}

Hash.prototype.addControls = function()
{
	this.insertField = this.addControlToAlgorithmBar("Text", "");
	this.insertField.size = Hash.MAX_HASH_LENGTH;
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
	this.insertButton = this.addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick =  this.insertCallback.bind(this);
	
	this.deleteField = this.addControlToAlgorithmBar("Text", "");
	this.deleteField.size = Hash.MAX_HASH_LENGTH;
	this.deleteField.onkeydown = this.returnSubmit(this.insertField,  this.deleteCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
	this.deleteButton = this.addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick =  this.deleteCallback.bind(this);

	
	this.findField = this.addControlToAlgorithmBar("Text", "");
	this.findField.size = Hash.MAX_HASH_LENGTH;
	this.findField.onkeydown = this.returnSubmit(this.insertField,  this.findCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
	this.findButton = this.addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick =  this.findCallback.bind(this);
	
	
	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Hash Integer", "Hash Strings"], "HashType");
	this.hashIntegerButton = radioButtonList[0];
	this.hashIntegerButton.onclick = this.changeHashTypeCallback.bind(this, true);
//  this.hashIntegerButton.onclick = this.hashIntegerCallback.bind(this);
	this.hashStringButton = radioButtonList[1];
	this.hashStringButton.onclick = this.changeHashTypeCallback.bind(this, false);

//	this.hashStringButton.onclick = this.hashStringCallback.bind(this);
	this.hashIntegerButton.checked = true;
}


// Do this extra level of wrapping to get undo to work properly.
// (also, so that we only implement the action if we are changing the
// radio button)
Hash.prototype.changeHashTypeCallback = function(newHashingIntegers, event)
{
	if (this.hashingIntegers != newHashingIntegers)
	{
		this.implementAction(this.changeHashType.bind(this), newHashingIntegers);
	}

}

Hash.prototype.changeHashType = function(newHashingIntegerValue)
{
	this.hashingIntegers = newHashingIntegerValue;
	if (this.hashingIntegers)
	{
		this.hashIntegerButton.checked = true;
		this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
		this.deleteField.onkeydown = this.returnSubmit(this.insertField,  this.deleteCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
		this.findField.onkeydown = this.returnSubmit(this.insertField,  this.findCallback.bind(this), Hash.MAX_HASH_LENGTH, true);
	}
	else
	{
		this.hashStringButton.checked = true;	
		this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), Hash.MAX_HASH_LENGTH, false);
		this.deleteField.onkeydown = this.returnSubmit(this.insertField,  this.deleteCallback.bind(this), Hash.MAX_HASH_LENGTH, false);
		this.findField.onkeydown = this.returnSubmit(this.insertField,  this.findCallback.bind(this), Hash.MAX_HASH_LENGTH, false);
	}
	return this.resetAll();
}


Hash.prototype.doHash = function(input)
{
	if (this.hashingIntegers)
	{
		var labelID1 = this.nextIndex++;
		var labelID2 = this.nextIndex++;
		var highlightID = this.nextIndex++;
		var index = parseInt(input) % this.table_size;
		this.currHash =  parseInt(input);
				
		this.cmd("CreateLabel", labelID1, input + " % " + String(this.table_size) + " = " , Hash.HASH_LABEL_X, Hash.HASH_LABEL_Y);
		this.cmd("CreateLabel", labelID2,index,  Hash.HASH_LABEL_X + Hash.HASH_LABEL_DELTA_X, Hash.HASH_LABEL_Y);
		this.cmd("Step");
		this.cmd("CreateHighlightCircle", highlightID, Hash.HIGHLIGHT_COLOR, Hash.HASH_LABEL_X + Hash.HASH_LABEL_DELTA_X, Hash.HASH_LABEL_Y);
		this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
		this.cmd("Step");
		this.cmd("Delete", labelID1);
		this.cmd("Delete", labelID2);
		this.cmd("Delete", highlightID);
		this.nextIndex -= 3;
		
		return index;
		
	}
	else
	{
		var oldnextIndex = this.nextIndex;
		var label1= this.nextIndex++;
		this.cmd("CreateLabel", label1, "Hashing:" , 10, 45, 0);
		var wordToHashID = new Array(input.length);
		var wordToHash = new Array(input.length);
		for (var i = 0; i < input.length; i++)
		{
			wordToHashID[i] = this.nextIndex++;
			wordToHash[i] = input.charAt(i);
			this.cmd("CreateLabel", wordToHashID[i], wordToHash[i], Hash.HASH_INPUT_START_X + i * Hash.HASH_INPUT_X_DIFF, Hash.HASH_INPUT_START_Y, 0);
		}
		var digits = new Array(32);
		var hashValue = new Array(32);
		var nextByte = new Array(8);
		var nextByteID = new Array(8);
		var resultDigits = new Array(32);
		var floatingDigits = new Array(4);
		var floatingVals = new Array(4);
		
		var operatorID = this.nextIndex++;
		var barID = this.nextIndex++;
		for (i = 0; i < 32; i++)
		{
			hashValue[i] = 0;
			digits[i] = this.nextIndex++;
			resultDigits[i] = this.nextIndex++;
		}
		for (i=0; i<8; i++)
		{
			nextByteID[i] = this.nextIndex++;
		}
		for (i = 0; i < 4; i++)
		{
			floatingDigits[i] = this.nextIndex++;
		}
		this.cmd("Step");
		for (i = wordToHash.length-1; i >= 0; i--)
		{
			for (j = 0; j < 32; j++)
			{
				this.cmd("CreateLabel", digits[j],hashValue[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y, 0);					
			}
			this.cmd("Delete", wordToHashID[i]);
			var nextChar = wordToHash[i].charCodeAt(0);
			for (var j = 7; j >= 0; j--)
			{
				nextByte[j] = nextChar % 2;
				nextChar = Math.floor((nextChar / 2));
				this.cmd("CreateLabel", nextByteID[j], nextByte[j], Hash.HASH_INPUT_START_X + i*Hash.HASH_INPUT_X_DIFF, Hash.HASH_INPUT_START_Y, 0);
				this.cmd("Move", nextByteID[j], Hash.HASH_NUMBER_START_X + (j + 24) * Hash.HASH_X_DIFF, Hash.HASH_ADD_START_Y);
			}
			this.cmd("Step");
			this.cmd("CreateRectangle", barID, "", 32 * Hash.HASH_X_DIFF, 0, Hash.HASH_NUMBER_START_X, Hash.HASH_ADD_LINE_Y,"left","bottom");
			this.cmd("CreateLabel", operatorID, "+", Hash.HASH_NUMBER_START_X, Hash.HASH_ADD_START_Y, 0);
			this.cmd("Step");
			
			var carry = 0;
			for (j = 7; j>=0; j--)
			{
				hashValue[j+24] = hashValue[j+24] + nextByte[j] + carry;
				if (hashValue[j+24] > 1)
				{
					hashValue[j+24] = hashValue[j+24] - 2;
					carry = 1;
				}
				else
				{
					carry = 0;
				}						
			}
			for (j = 23; j>=0; j--)
			{
				hashValue[j] = hashValue[j]  + carry;
				if (hashValue[j] > 1)
				{
					hashValue[j] = hashValue[j] - 2;
					carry = 1;
				}
				else
				{
					carry = 0;
				}		
			}
			for (j = 0; j < 32; j++)
			{
				this.cmd("CreateLabel", resultDigits[j], hashValue[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_RESULT_Y, 0);					
			}
			
			this.cmd("Step");
			for (j=0; j<8; j++)
			{
				this.cmd("Delete", nextByteID[j]);
			}
			this.cmd("Delete", barID);
			this.cmd("Delete", operatorID);
			for (j = 0; j<32; j++)
			{
				this.cmd("Delete", digits[j]);
				this.cmd("Move", resultDigits[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y)
			}
			this.cmd("Step");
			if (i > 0)
			{
				for (j = 0; j < 32; j++)
				{
					this.cmd("Move", resultDigits[j], Hash.HASH_NUMBER_START_X + (j - 4) * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y)						
				}
				this.cmd("Step");
				for (j = 0; j < 28; j++)
				{
					floatingVals[j] = hashValue[j];
					hashValue[j] = hashValue[j+4];
				}
				
				for (j = 0; j < 4; j++)
				{
					this.cmd("Move", resultDigits[j], Hash.HASH_NUMBER_START_X + (j + Hash.ELF_HASH_SHIFT) * Hash.HASH_X_DIFF, Hash.HASH_ADD_START_Y);
					hashValue[j+28] = 0;
					this.cmd("CreateLabel", floatingDigits[j],0, Hash.HASH_NUMBER_START_X + (j + 28) * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y,0);
					if (floatingVals[j])
					{
						hashValue[j + Hash.ELF_HASH_SHIFT] = 1 - hashValue[j + Hash.ELF_HASH_SHIFT];
					}
				}
				this.cmd("CreateRectangle", barID, "", 32 * Hash.HASH_X_DIFF, 0, Hash.HASH_NUMBER_START_X, Hash.HASH_ADD_LINE_Y,"left","bottom");
				this.cmd("CreateLabel", operatorID, "XOR", Hash.HASH_NUMBER_START_X, Hash.HASH_ADD_START_Y, 0);
				this.cmd("Step");
				for (j = 0; j < 32; j++)
				{
					this.cmd("CreateLabel", digits[j], hashValue[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_RESULT_Y, 0);					
				}
				this.cmd("Step");
				
				this.cmd("Delete", operatorID);
				this.cmd("Delete", barID);
				for (j = 0; j<32; j++)
				{
					this.cmd("Delete", resultDigits[j]);
					this.cmd("Move", digits[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y)
				}
				for (j = 0; j < 4; j++)
				{
					this.cmd("Delete", floatingDigits[j]);
				}
				this.cmd("Step");
				for (j = 0; j<32; j++)
				{
					this.cmd("Delete", digits[j]);
				}
			} 
			else
			{
				for (j = 0; j<32; j++)
				{
					this.cmd("Delete", resultDigits[j]);
				}
			}
			
		}
		this.cmd("Delete", label1);
		for (j = 0; j < 32; j++)
		{
			this.cmd("CreateLabel", digits[j],hashValue[j], Hash.HASH_NUMBER_START_X + j * Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y, 0);
		}
		this.currHash = 0;
		for (j=0; j < 32; j++)
		{
			this.currHash = this.currHash * 2 + hashValue[j];
		}
		this.cmd("CreateLabel", label1, " = " + String(this.currHash), Hash.HASH_NUMBER_START_X + 32*Hash.HASH_X_DIFF, Hash.HASH_NUMBER_START_Y, 0);
		this.cmd("Step");
		for (j = 0; j < 32; j++)
		{
			this.cmd("Delete", digits[j]);
		}
		
		var label2 = this.nextIndex++;
		this.cmd("SetText", label1, String(this.currHash) + " % " +  String(this.table_size) + " = ");
		index = this.currHash % this.table_size;
		this.cmd("CreateLabel", label2, index,  Hash.HASH_NUMBER_START_X + 32*Hash.HASH_X_DIFF + 105, Hash.HASH_NUMBER_START_Y, 0);
		this.cmd("Step");
		highlightID = this.nextIndex++;
		this.cmd("CreateHighlightCircle", highlightID, Hash.HIGHLIGHT_COLOR,  Hash.HASH_NUMBER_START_X + 30*Hash.HASH_X_DIFF + 120,  Hash.HASH_NUMBER_START_Y+ 15);
		this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
		this.cmd("Step");
		this.cmd("Delete", highlightID);
		this.cmd("Delete", label1);
		this.cmd("Delete", label2);
		//this.nextIndex = oldnextIndex;
		
		return index;
	}
}




Hash.prototype.resetAll =function()
{
	this.insertField.value = "";
	this.deleteField.value = "";
	this.findField.value = "";
	return [];
	
}
Hash.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}

Hash.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value
	if (deletedValue != "")
	{
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}

Hash.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}






Hash.prototype.insertElement = function(elem)
{
	
}

Hash.prototype.deleteElement = function(elem)
{
	
	
}
Hash.prototype.findElement = function(elem)
{
	
}



// NEED TO OVERRIDE IN PARENT
Hash.prototype.reset = function()
{
	this.hashIntegerButton.checked = true;
}


Hash.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
}

Hash.prototype.enableUI = function(event)
{

	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
}


/* no init, this is only a base class! 
var currentAlg;
function init()
{
	var animManag = initCanvas();
	currentAlg = new Hash(animManag, canvas.width, canvas.height);
}
*/
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function ClosedHashBucket(am, w, h)
{
	// call superclass' constructor, which calls init
	ClosedHashBucket.superclass.constructor.call(this, am, w, h);
}
ClosedHashBucket.inheritFrom(Hash);

ClosedHashBucket.ARRAY_ELEM_WIDTH = 90;
ClosedHashBucket.ARRAY_ELEM_HEIGHT = 30;
ClosedHashBucket.ARRAY_ELEM_START_X = 50;
ClosedHashBucket.ARRAY_ELEM_START_Y = 100;
ClosedHashBucket.ARRAY_VERTICAL_SEPARATION = 100;

ClosedHashBucket.CLOSED_HASH_TABLE_SIZE  = 29;


ClosedHashBucket.BUCKET_SIZE = 3;
ClosedHashBucket.NUM_BUCKETS = 11;
ClosedHashBucket.CLOSED_HASH_TABLE_SIZE  = 40;


ClosedHashBucket.ARRAY_Y_POS = 350;


ClosedHashBucket.INDEX_COLOR = "#0000FF";




ClosedHashBucket.MAX_DATA_VALUE = 999;

ClosedHashBucket.HASH_TABLE_SIZE  = 13;

ClosedHashBucket.ARRAY_Y_POS = 350;


ClosedHashBucket.INDEX_COLOR = "#0000FF";





ClosedHashBucket.prototype.init = function(am, w, h)
{
	var sc = ClosedHashBucket.superclass;
	var fn = sc.init;
	fn.call(this,am, w, h);
	
	this.elements_per_row = Math.floor(w / ClosedHashBucket.ARRAY_ELEM_WIDTH) ;

	
	//Change me!
	this.nextIndex = 0;
	//this.POINTER_ARRAY_ELEM_Y = h - ClosedHashBucket.POINTER_ARRAY_ELEM_WIDTH;
	this.setup();
}

ClosedHashBucket.prototype.addControls = function()
{
	ClosedHashBucket.superclass.addControls.call(this);


	
	// Add new controls

}





ClosedHashBucket.prototype.insertElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
	var index = this.doHash(elem);
	
	var foundIndex = -1;
	for (var candidateIndex = index * ClosedHashBucket.BUCKET_SIZE; candidateIndex < index * ClosedHashBucket.BUCKET_SIZE + ClosedHashBucket.BUCKET_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (this.empty[candidateIndex])
		{
			foundIndex = candidateIndex;
			break;
		}	
	}
	if (foundIndex == -1)
	{
		for (candidateIndex = ClosedHashBucket.BUCKET_SIZE * ClosedHashBucket.NUM_BUCKETS; candidateIndex < ClosedHashBucket.CLOSED_HASH_TABLE_SIZE; candidateIndex++)
		{
			this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
			this.cmd("Step");
			this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
			
			if (this.empty[candidateIndex])
			{
				foundIndex = candidateIndex;
				break;
			}					
			
		}
	}
	
	if (foundIndex != -1)
	{
		var labID = this.nextIndex++;
		this.cmd("CreateLabel", labID, elem, 20, 25);
		this.cmd("Move", labID, this.indexXPos2[foundIndex], this.indexYPos2[foundIndex] - ClosedHashBucket.ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		this.cmd("Delete", labID);
		this.cmd("SetText", this.hashTableVisual[foundIndex], elem);
		this.hashTableValues[foundIndex] = elem;
		this.empty[foundIndex] = false;
		this.deleted[foundIndex] = false;
	}
	
	
	this.cmd("SetText", this.ExplainLabel, "");
	
	return this.commands;
	
}




ClosedHashBucket.prototype.getElemIndex  = function(elem) 
{
	var foundIndex = -1;
	var initialIndex = this.doHash(elem);
	
	for (var candidateIndex = initialIndex * ClosedHashBucket.BUCKET_SIZE; candidateIndex < initialIndex* ClosedHashBucket.BUCKET_SIZE + ClosedHashBucket.BUCKET_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem)
		{
			return candidateIndex;		
		}
		else if (this.empty[candidateIndex] && !this.deleted[candidateIndex])
		{
			return -1;
		}
	}
	// Can only get this far if we didn't find the element we are looking for,
	//  *and* the bucekt was full -- look at overflow bucket.
	for (candidateIndex = ClosedHashBucket.BUCKET_SIZE * ClosedHashBucket.NUM_BUCKETS; candidateIndex < ClosedHashBucket.CLOSED_HASH_TABLE_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		
		if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem)
		{
			return candidateIndex;		
		}
		else if (this.empty[candidateIndex] && !this.deleted[candidateIndex])
		{
			return -1;
		}
	}
	return -1;			
}


ClosedHashBucket.prototype.deleteElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
	var index = this.getElemIndex(elem);
	
	if (index == -1)
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");				
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element this.deleted");
		this.empty[index] = true;
		this.deleted[index] = true;
		this.cmd("SetText", this.hashTableVisual[index], "<deleted>");
	}
	
	return this.commands;
	
}
ClosedHashBucket.prototype.findElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);
	var index = this.getElemIndex(elem);
	if (index == -1)
	{
		this.cmd("SetText", this.ExplainLabel, "Element " + elem + " not found");
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Element " + elem + " found");
	}
	return this.commands;
}




ClosedHashBucket.prototype.setup = function()
{
	this.table_size = ClosedHashBucket.NUM_BUCKETS;
	this.hashTableVisual = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	this.hashTableIndices = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	this.hashTableValues = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	
	this.indexXPos = new Array(ClosedHashBucket.NUM_BUCKETS);
	this.indexYPos = new Array(ClosedHashBucket.NUM_BUCKETS);
	
	this.indexXPos2 = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	this.indexYPos2 = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	
	
	this.empty = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	this.deleted = new Array(ClosedHashBucket.CLOSED_HASH_TABLE_SIZE);
	
	this.ExplainLabel = this.nextIndex++;
	
	this.commands = [];
	
	for (var i = 0; i < ClosedHashBucket.CLOSED_HASH_TABLE_SIZE; i++)
	{
		var nextID  = this.nextIndex++;
		this.empty[i] = true;
		this.deleted[i] = false;
		
		var nextXPos =  ClosedHashBucket.ARRAY_ELEM_START_X + (i % this.elements_per_row) * ClosedHashBucket.ARRAY_ELEM_WIDTH;
		var nextYPos =  ClosedHashBucket.ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row) * ClosedHashBucket.ARRAY_VERTICAL_SEPARATION;
		this.cmd("CreateRectangle", nextID, "", ClosedHashBucket.ARRAY_ELEM_WIDTH, ClosedHashBucket.ARRAY_ELEM_HEIGHT,nextXPos, nextYPos)
		this.hashTableVisual[i] = nextID;
		nextID = this.nextIndex++;
		this.hashTableIndices[i] = nextID;
		this.indexXPos2[i] = nextXPos;
		this.indexYPos2[i] = nextYPos + ClosedHashBucket.ARRAY_ELEM_HEIGHT
		
		this.cmd("CreateLabel", nextID, i,this.indexXPos2[i],this.indexYPos2[i]);
		this.cmd("SetForegroundColor", nextID, ClosedHashBucket.INDEX_COLOR);
	}
	
	for (i = 0; i <= ClosedHashBucket.NUM_BUCKETS; i++)
	{
		nextID = this.nextIndex++;
		nextXPos =  ClosedHashBucket.ARRAY_ELEM_START_X + (i * 3 % this.elements_per_row) * ClosedHashBucket.ARRAY_ELEM_WIDTH - ClosedHashBucket.ARRAY_ELEM_WIDTH / 2;
		nextYPos =  ClosedHashBucket.ARRAY_ELEM_START_Y + Math.floor((i * 3) / this.elements_per_row) * ClosedHashBucket.ARRAY_VERTICAL_SEPARATION + ClosedHashBucket.ARRAY_ELEM_HEIGHT;
		this.cmd("CreateRectangle", nextID, "", 0, ClosedHashBucket.ARRAY_ELEM_HEIGHT * 2,nextXPos, nextYPos)
		nextID = this.nextIndex++;
		if (i == ClosedHashBucket.NUM_BUCKETS)
		{
			this.cmd("CreateLabel", nextID, "Overflow", nextXPos + 3, nextYPos + ClosedHashBucket.ARRAY_ELEM_HEIGHT / 2 , 0);
		}
		else
		{
			this.indexXPos[i] =  nextXPos + 5;
			this.indexYPos[i] = nextYPos + ClosedHashBucket.ARRAY_ELEM_HEIGHT / 2;
			this.cmd("CreateLabel", nextID, i, this.indexXPos[i],this.indexYPos[i], 0);					
		}
	}
	
	this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.resetIndex  = this.nextIndex;
}







ClosedHashBucket.prototype.resetAll = function()
{
	this.commands = ClosedHashBucket.superclass.resetAll.call(this);
	
	for (var i = 0; i < ClosedHashBucket.CLOSED_HASH_TABLE_SIZE; i++)
	{
		this.empty[i] = true;
		this.deleted[i] = false;
		this.cmd("SetText", this.hashTableVisual[i], "");		
	}
	return this.commands;
	// Clear array, etc
}



// NEED TO OVERRIDE IN PARENT
ClosedHashBucket.prototype.reset = function()
{
	for (var i = 0; i < ClosedHashBucket.CLOSED_HASH_TABLE_SIZE; i++)
	{
		this.empty[i]= true;
		this.deleted[i] = false;				
	}
	this.nextIndex = this.resetIndex ;
	ClosedHashBucket.superclass.reset.call(this);

}




ClosedHashBucket.prototype.disableUI = function(event)
{
	ClosedHashBucket.superclass.disableUI.call(this);
}

ClosedHashBucket.prototype.enableUI = function(event)
{
	ClosedHashBucket.superclass.enableUI.call(this);

}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ClosedHashBucket(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function ClosedHash(am, w, h)
{
	// call superclass' constructor, which calls init
	ClosedHash.superclass.constructor.call(this, am, w, h);
}
ClosedHash.inheritFrom(Hash);

ClosedHash.ARRAY_ELEM_WIDTH = 90;
ClosedHash.ARRAY_ELEM_HEIGHT = 30;
ClosedHash.ARRAY_ELEM_START_X = 50;
ClosedHash.ARRAY_ELEM_START_Y = 100;
ClosedHash.ARRAY_VERTICAL_SEPARATION = 100;

ClosedHash.CLOSED_HASH_TABLE_SIZE  = 29;

ClosedHash.ARRAY_Y_POS = 350;


ClosedHash.INDEX_COLOR = "#0000FF";




ClosedHash.MAX_DATA_VALUE = 999;

ClosedHash.HASH_TABLE_SIZE  = 13;

ClosedHash.ARRAY_Y_POS = 350;


ClosedHash.INDEX_COLOR = "#0000FF";




ClosedHash.prototype.init = function(am, w, h)
{
	var sc = ClosedHash.superclass;
	var fn = sc.init;
	this.elements_per_row = Math.floor(w / ClosedHash.ARRAY_ELEM_WIDTH);

	fn.call(this,am, w, h);
	
	//Change me!
	this.nextIndex = 0;
	//this.POINTER_ARRAY_ELEM_Y = h - ClosedHash.POINTER_ARRAY_ELEM_WIDTH;
	this.setup();
}

ClosedHash.prototype.addControls = function()
{
	ClosedHash.superclass.addControls.call(this);


	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Linear Probing: f(i) = i",
															 "Quadratic Probing: f(i) = i * i",
															"Double Hashing: f(i) = i * hash2(elem)"], 
															"CollisionStrategy");
	this.linearProblingButton = radioButtonList[0];
	this.linearProblingButton.onclick = this.linearProbeCallback.bind(this);
	this.quadraticProbingButton = radioButtonList[1];
	this.quadraticProbingButton.onclick = this.quadraticProbeCallback.bind(this);
	this.doubleHashingButton = radioButtonList[2];
	this.doubleHashingButton.onclick = this.doubleHashingCallback.bind(this);

	this.linearProblingButton.checked = true;
	this.currentHashingTypeButtonState = this.linearProblingButton;
	
	// Add new controls

}


ClosedHash.prototype.changeProbeType = function(newProbingType)
{
	if (newProbingType == this.linearProblingButton)
	{
		this.linearProblingButton.checked = true;
		this.currentHashingTypeButtonState = this.linearProblingButton;
		for (var i = 0; i < this.table_size; i++)
		{
			this.skipDist[i] = i;
		}
		
	}
	else if (newProbingType == this.quadraticProbingButton)
	{
		this.quadraticProbingButton.checked = true;
		this.currentHashingTypeButtonState = this.quadraticProbingButton;

		for (var i = 0; i < this.	table_size; i++)
		{
			this.skipDist[i] = i * i;
		}
		
		
	}
	else if (newProbingType == this.doubleHashingButton)
	{
		this.doubleHashingButton.checked = true;
		this.currentHashingTypeButtonState = this.doubleHashingButton;
		
		
	}
	this.commands = this.resetAll();
	return this.commands;
}



ClosedHash.prototype.quadraticProbeCallback = function(event)
{
	if (this.currentHashingTypeButtonState != this.quadraticProbingButton)
	{
		this.implementAction(this.changeProbeType.bind(this),this.quadraticProbingButton);
	}
	
}


ClosedHash.prototype.doubleHashingCallback = function(event)
{
	if (this.currentHashingTypeButtonState != this.doubleHashingButton)
	{
		this.implementAction(this.changeProbeType.bind(this),this.doubleHashingButton);		
	}
	
}

ClosedHash.prototype.linearProbeCallback = function(event)
{
	if (this.currentHashingTypeButtonState != this.linearProblingButton)
	{
		this.implementAction(this.changeProbeType.bind(this),this.linearProblingButton);		
	}
	
}

ClosedHash.prototype.insertElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
	var index = this.doHash(elem);
	
	index = this.getEmptyIndex(index, elem);
	this.cmd("SetText", this.ExplainLabel, "");
	if (index != -1)
	{
		var labID = this.nextIndex++;
		this.cmd("CreateLabel", labID, elem, 20, 25);
		this.cmd("Move", labID, this.indexXPos[index], this.indexYPos[index] - ClosedHash.ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		this.cmd("Delete", labID);
		this.cmd("SetText", this.hashTableVisual[index], elem);
		this.hashTableValues[index] = elem;
		this.empty[index] = false;
		this.deleted[index] = false;
	}
	return this.commands;
	
}


ClosedHash.prototype.resetSkipDist = function(elem, labelID)
{
	var skipVal = 7 - (this.currHash % 7);
	this.cmd("CreateLabel", labelID, "hash2("+String(elem) +") = 1 - " + String(this.currHash)  +" % 7 = " + String(skipVal),  20, 45, 0);
	this.skipDist[0] = 0;
	for (var i = 1; i < this.table_size; i++)
	{
		this.skipDist[i] = this.skipDist[i-1] + skipVal;				
	}
	
	
}

ClosedHash.prototype.getEmptyIndex = function(index, elem) 
{
	if (this.currentHashingTypeButtonState == this.doubleHashingButton)
	{
		this.resetSkipDist(elem, this.nextIndex++);				
	}
	var foundIndex = -1;
	for (var i  = 0; i < this.table_size; i++)
	{
		var candidateIndex   = (index + this.skipDist[i]) % this.table_size;
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (this.empty[candidateIndex])
		{
			foundIndex = candidateIndex;
			break;
		}				
	}
	if (this.currentHashingTypeButtonState == this.doubleHashingButton)
	{
		this.cmd("Delete", --this.nextIndex);
	}
	return foundIndex;
}

ClosedHash.prototype.getElemIndex = function(index, elem) 
{
	if (this.currentHashingTypeButtonState == this.doubleHashingButton)
	{
		resetSkipDist(elem, this.nextIndex++);				
	}
	var foundIndex = -1;
	for (var i  = 0; i < this.table_size; i++)
	{
		var candidateIndex   = (index + this.skipDist[i]) % this.table_size;
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem)
		{
			foundIndex= candidateIndex;
			break;
		}
		else if (this.empty[candidateIndex] && !this.deleted[candidateIndex])
		{
		break;				}
	}
	if (this.currentHashingTypeButtonState == this.doubleHashingButton)
	{
		this.cmd("Delete", --this.nextIndex);
	}
	return foundIndex;
}

ClosedHash.prototype.deleteElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
	var index = this.doHash(elem);
	
	index = this.getElemIndex(index, elem);
	
	if (index > 0)
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element deleted");
		this.empty[index] = true;
		this.deleted[index] = true;
		this.cmd("SetText", this.hashTableVisual[index], "<deleted>");
	}
	else 
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");
	}
	return this.commands;
	
}
ClosedHash.prototype.findElement = function(elem)
{
	this.commands = new Array();
	
	this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);
	var index = this.doHash(elem);
	
	var found = this.getElemIndex(index, elem) != -1;
	if (found)
	{
		this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem+ "  Found!")				
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem+ "  Not Found!")
		
	}
	return this.commands;
}




ClosedHash.prototype.setup = function()
{
	this.table_size = ClosedHash.CLOSED_HASH_TABLE_SIZE;
	this.skipDist = new Array(this.table_size);
	this.hashTableVisual = new Array(this.table_size);
	this.hashTableIndices = new Array(this.table_size);
	this.hashTableValues = new Array(this.table_size);
	
	this.indexXPos = new Array(this.table_size);
	this.indexYPos = new Array(this.table_size);
	
	this.empty = new Array(this.table_size);
	this.deleted = new Array(this.table_size);
	
	this.ExplainLabel = this.nextIndex++;
	
	this.commands = [];
	
	for (var i = 0; i < this.table_size; i++)
	{
		this.skipDist[i] = i; // Start with linear probing
		var nextID  = this.nextIndex++;
		this.empty[i] = true;
		this.deleted[i] = false;
		
		var nextXPos =  ClosedHash.ARRAY_ELEM_START_X + (i % this.elements_per_row) * ClosedHash.ARRAY_ELEM_WIDTH;
		var nextYPos =  ClosedHash.ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row) * ClosedHash.ARRAY_VERTICAL_SEPARATION;
		this.cmd("CreateRectangle", nextID, "", ClosedHash.ARRAY_ELEM_WIDTH, ClosedHash.ARRAY_ELEM_HEIGHT,nextXPos, nextYPos)
		this.hashTableVisual[i] = nextID;
		nextID = this.nextIndex++;
		this.hashTableIndices[i] = nextID;
		this.indexXPos[i] = nextXPos;
		this.indexYPos[i] = nextYPos + ClosedHash.ARRAY_ELEM_HEIGHT
		
		this.cmd("CreateLabel", nextID, i,this.indexXPos[i],this.indexYPos[i]);
		this.cmd("SetForegroundColor", nextID, ClosedHash.INDEX_COLOR);
	}
	this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.resetIndex  = this.nextIndex;
}



ClosedHash.prototype.resetAll = function()
{
	this.commands = ClosedHash.superclass.resetAll.call(this);

	for (var i = 0; i < this.table_size; i++)
	{
		this.empty[i] = true;
		this.deleted[i] = false;
		this.cmd("SetText", this.hashTableVisual[i], "");		
	}
	return this.commands;
	// Clear array, etc
}



// NEED TO OVERRIDE IN PARENT
ClosedHash.prototype.reset = function()
{
	for (var i = 0; i < this.table_size; i++)
	{
		this.empty[i]= true;
		this.deleted[i] = false;				
	}
	this.nextIndex = this.resetIndex ;
	ClosedHash.superclass.reset.call(this);

}


function resetCallback(event)
{
	
}





ClosedHash.prototype.disableUI = function(event)
{
	ClosedHash.superclass.disableUI.call(this);
	this.linearProblingButton.disabled = true;
	this.quadraticProbingButton.disabled = true;
	this.doubleHashingButton.disabled = true;
}

ClosedHash.prototype.enableUI = function(event)
{
	ClosedHash.superclass.enableUI.call(this);
	this.linearProblingButton.disabled = false;
	this.quadraticProbingButton.disabled = false;
	this.doubleHashingButton.disabled = false;
}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ClosedHash(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function OpenHash(am, w, h)
{
	// call superclass' constructor, which calls init
	OpenHash.superclass.constructor.call(this, am, w, h);
}
OpenHash.inheritFrom(Hash);


OpenHash.POINTER_ARRAY_ELEM_WIDTH = 70;
OpenHash.POINTER_ARRAY_ELEM_HEIGHT = 30;
OpenHash.POINTER_ARRAY_ELEM_START_X = 50;

OpenHash.LINKED_ITEM_HEIGHT = 30;
OpenHash.LINKED_ITEM_WIDTH = 65;

OpenHash.LINKED_ITEM_Y_DELTA = 50;
OpenHash.LINKED_ITEM_POINTER_PERCENT = 0.25;

OpenHash.MAX_DATA_VALUE = 999;

OpenHash.HASH_TABLE_SIZE  = 13;

OpenHash.ARRAY_Y_POS = 350;


OpenHash.INDEX_COLOR = "#0000FF";





OpenHash.prototype.init = function(am, w, h)
{
	var sc = OpenHash.superclass;
	var fn = sc.init;
	fn.call(this,am, w, h);
	this.nextIndex = 0;
	this.POINTER_ARRAY_ELEM_Y = h - OpenHash.POINTER_ARRAY_ELEM_WIDTH;
	this.setup();
}

OpenHash.prototype.addControls = function()
{
	OpenHash.superclass.addControls.call(this);

	// Add new controls

}

OpenHash.prototype.insertElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
	var index = this.doHash(elem);
	var node  = new LinkedListNode(elem,this.nextIndex++, 100, 75);
	this.cmd("CreateLinkedList", node.graphicID, elem, OpenHash.LINKED_ITEM_WIDTH, OpenHash.LINKED_ITEM_HEIGHT, 100, 75);
	if (this.hashTableValues[index] != null && this.hashTableValues[index] != undefined)
	{
		this.cmd("connect", node.graphicID, this.hashTableValues[index].graphicID);
		this.cmd("disconnect", this.hashTableVisual[index], this.hashTableValues[index].graphicID);				
	}
	else
	{
		this.cmd("SetNull", node.graphicID, 1);
		this.cmd("SetNull", this.hashTableVisual[index], 0);
	}
	this.cmd("connect", this.hashTableVisual[index], node.graphicID);
	node.next = this.hashTableValues[index];
	this.hashTableValues[index] = node;
	
	this.repositionList(index);
	
	this.cmd("SetText", this.ExplainLabel, "");
	
	return this.commands;
	
}


OpenHash.prototype.repositionList = function(index)
{
	var startX = OpenHash.POINTER_ARRAY_ELEM_START_X + index *OpenHash.POINTER_ARRAY_ELEM_WIDTH;
	var startY =  this.POINTER_ARRAY_ELEM_Y - OpenHash.LINKED_ITEM_Y_DELTA;
	var tmp = this.hashTableValues[index];
	while (tmp != null)
	{
		tmp.x = startX;
		tmp.y = startY;
		this.cmd("Move", tmp.graphicID, tmp.x, tmp.y);
		startY = startY - OpenHash.LINKED_ITEM_Y_DELTA;
		tmp = tmp.next;
	}
}


OpenHash.prototype.deleteElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
	var index = this.doHash(elem);
	if (this.hashTableValues[index] == null)
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");
		return this.commands;
	}
	this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 1);
	this.cmd("Step");
	this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 0);
	if (this.hashTableValues[index].data == elem)
	{
		if (this.hashTableValues[index].next != null)
		{
			this.cmd("Connect", this.hashTableVisual[index], this.hashTableValues[index].next.graphicID);
		}
		else
		{
			this.cmd("SetNull", this.hashTableVisual[index], 1);
		}
		this.cmd("Delete", this.hashTableValues[index].graphicID);
		this.hashTableValues[index] = this.hashTableValues[index].next;
		this.repositionList(index);
		return this.commands;
	}
	var tmpPrev = this.hashTableValues[index];
	var tmp = this.hashTableValues[index].next;
	var found = false;
	while (tmp != null && !found)
	{
		this.cmd("SetHighlight", tmp.graphicID, 1);
		this.cmd("Step");
		this.cmd("SetHighlight", tmp.graphicID, 0);
		if (tmp.data == elem)
		{
			found = true;
			this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element deleted");
			if (tmp.next != null)
			{
				this.cmd("Connect", tmpPrev.graphicID, tmp.next.graphicID);
			}
			else
			{
				this.cmd("SetNull", tmpPrev.graphicID, 1);
			}
			tmpPrev.next = tmpPrev.next.next;
			this.cmd("Delete", tmp.graphicID);
			this.repositionList(index);
		}
		else
		{
			tmpPrev = tmp;
			tmp = tmp.next;
		}		
	}
	if (!found)
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");
	}
	return this.commands;
	
}
OpenHash.prototype.findElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);

	var index = this.doHash(elem);
	var compareIndex = this.nextIndex++;
	var found = false;
	var tmp = this.hashTableValues[index];
	this.cmd("CreateLabel", compareIndex, "", 10, 40, 0);
	while (tmp != null && !found)
	{
		this.cmd("SetHighlight", tmp.graphicID, 1);
		if (tmp.data == elem)
		{
			this.cmd("SetText", compareIndex,  tmp.data  + "==" + elem)
			found = true;
		}
		else
		{
			this.cmd("SetText", compareIndex,  tmp.data  + "!=" + elem)
		}
		this.cmd("Step");
		this.cmd("SetHighlight", tmp.graphicID, 0);
		tmp = tmp.next;
	}
	if (found)
	{
		this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem+ "  Found!")				
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem+ "  Not Found!")
		
	}
	this.cmd("Delete", compareIndex);
	this.nextIndex--;
	return this.commands;
}




OpenHash.prototype.setup = function()
{
	this.hashTableVisual = new Array(OpenHash.HASH_TABLE_SIZE);
	this.hashTableIndices = new Array(OpenHash.HASH_TABLE_SIZE);
	this.hashTableValues = new Array(OpenHash.HASH_TABLE_SIZE);
	
	this.indexXPos = new Array(OpenHash.HASH_TABLE_SIZE);
	this.indexYPos = new Array(OpenHash.HASH_TABLE_SIZE);
	
	this.ExplainLabel = this.nextIndex++;
	
	this.table_size = OpenHash.HASH_TABLE_SIZE;

	this.commands = [];
	for (var i = 0; i < OpenHash.HASH_TABLE_SIZE; i++)
	{
		var nextID  = this.nextIndex++;
		
		this.cmd("CreateRectangle", nextID, "", OpenHash.POINTER_ARRAY_ELEM_WIDTH, OpenHash.POINTER_ARRAY_ELEM_HEIGHT, OpenHash.POINTER_ARRAY_ELEM_START_X + i *OpenHash.POINTER_ARRAY_ELEM_WIDTH, this.POINTER_ARRAY_ELEM_Y)
		this.hashTableVisual[i] = nextID;
		this.cmd("SetNull", this.hashTableVisual[i], 1);
		
		nextID = this.nextIndex++;
		this.hashTableIndices[i] = nextID;
		this.indexXPos[i] =  OpenHash.POINTER_ARRAY_ELEM_START_X + i *OpenHash.POINTER_ARRAY_ELEM_WIDTH;
		this.indexYPos[i] = this.POINTER_ARRAY_ELEM_Y + OpenHash.POINTER_ARRAY_ELEM_HEIGHT
		this.hashTableValues[i] = null;
		
		this.cmd("CreateLabel", nextID, i,this.indexXPos[i],this.indexYPos[i] );
		this.cmd("SetForegroundColor", nextID, OpenHash.INDEX_COLOR);
	}
	this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.resetIndex  = this.nextIndex;
}



OpenHash.prototype.resetAll = function()
{
	var tmp;
	this.commands = OpenHash.superclass.resetAll.call(this);
	for (var i = 0; i < this.hashTableValues.length; i++)
	{
		tmp = this.hashTableValues[i];
		if (tmp != null)
		{
			while (tmp != null)
			{
				this.cmd("Delete", tmp.graphicID);
				tmp = tmp.next; 
			}
			this.hashTableValues[i] = null;
			this.cmd("SetNull",  this.hashTableVisual[i], 1);
		}
	}
	return this.commands;
}



// NEED TO OVERRIDE IN PARENT
OpenHash.prototype.reset = function()
{
	for (var i = 0; i < this.table_size; i++)
	{
		this.hashTableValues[i] = null;
	}
	this.nextIndex = this.resetIndex;
	OpenHash.superclass.reset.call(this);
}


OpenHash.prototype.resetCallback = function(event)
{
	
}



/*this.nextIndex = 0;
 this.commands = [];
 this.cmd("CreateLabel", 0, "", 20, 50, 0);
 this.animationManager.StartNewAnimation(this.commands);
 this.animationManager.skipForward();
 this.animationManager.clearHistory(); */
	




OpenHash.prototype.disableUI = function(event)
{
	var sc = OpenHash.superclass;
	var fn = sc.disableUI;
	fn.call(this);
}

OpenHash.prototype.enableUI = function(event)
{
	OpenHash.superclass.enableUI.call(this);
}




function LinkedListNode(val, id, initialX, initialY)
{
	this.data = val;
	this.graphicID = id;
	this.x = initialX;
	this.y = initialY;
	this.next = null;
	
}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new OpenHash(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// TODO:  UNDO (all the way) is BROKEN.  Redo reset ...


function Graph(am, w, h, dir, dag)
{
	// this shouldn't happen if subclassing is done properly
	if (!am)
		throw "this shouldn't happen";

	this.init(am, w, h, dir, dag);
}

Graph.inheritFrom(Algorithm);

Graph.LARGE_ALLOWED = [[false, true, true, false, true, false, false, true, false, false, false, false, false, false, true, false, false, false],
									[true, false, true, false, true, true,  false, false, false, false, false, false, false, false, false, false, false, false],
									[true, true, false, true,  false, true, true,  false, false, false, false, false, false, false, false, false, false, false],
									[false, false, true, false, false,false, true, false, false, false, true, false, false,  false, false, false, false, true],
									[true, true, false, false,  false, true, false, true, true, false, false, false, false, false, false, false,  false,  false],
									[false, true, true, false, true, false, true,   false, true, true, false, false, false, false, false, false,  false,  false],
									[false, false, true, true, false, true, false, false, false, true, true, false, false, false, false, false,  false,  false],
									[true, false, false, false, true, false, false, false, true, false, false, true, false, false, true, false, false, false],
									[false, false, false, false, true, true, false, true, false, true, false, true, true, false,   false, false, false, false],
									[false, false, false, false, false, true, true, false, true, false, true, false, true, true,  false,  false, false, false],
									[false, false, false, true, false,  false, true, false, false, true, false, false, false, true, false, false, false, true],
									[false, false, false, false, false, false, false, true, true, false, false, false, true, false, true, true, false, false],
									[false, false, false, false, false, false, false, false, true, true, false, true, false, true, false, true, true, false],
									[false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, false, true, true],
									[false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
									[false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, true, true],
									[false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, true],
									[false, false, false, false, false, false, false, false, false, false, true, false, false, true, false, true, true, false]];

Graph.LARGE_CURVE  = [[0, 0, -0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.25, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.25],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [-0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4],
								   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								   [0, 0, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.4, 0, 0]]



Graph.LARGE_X_POS_LOGICAL = [600, 700, 800, 900,
										  650, 750, 850,
										  600, 700, 800, 900,
										  650, 750, 850,
										  600, 700, 800, 900];


Graph.LARGE_Y_POS_LOGICAL = [50, 50, 50, 50,
										  150, 150, 150,
										  250, 250, 250, 250, 
										  350, 350, 350, 
										  450,  450, 450, 450];


Graph.SMALL_ALLLOWED = [[false, true,  true,  true,  true,  false, false, false],
									 [true,  false, true,  true,  false, true,  true,  false],
									 [true,  true,  false, false, true,  true,  true,  false],
									 [true,  true,  false, false, false, true,  false, true],
									 [true,  false, true,  false, false,  false, true,  true],
									 [false, true,  true,  true,  false, false, true,  true],
									 [false, true,  true,  false, true,  true,  false, true],
									 [false, false, false, true,  true,  true,  true,  false]];

Graph.SMALL_CURVE = [[0, 0.001, 0, 0.5, -0.5, 0, 0, 0],
								  [0, 0, 0, 0.001, 0, 0.001, -0.2, 0],
								  [0, 0.001, 0, 0, 0, 0.2, 0, 0],
								  [-0.5, 0, 0, 0, 0, 0.001, 0, 0.5],
								  [0.5, 0, 0, 0, 0, 0, 0, -0.5],
								  [0, 0, -0.2, 0, 0, 0, 0.001, 0.001],
								  [0, 0.2, 0, 0, 0, 0, 0, 0],
								  [0, 0, 0, -0.5, 0.5, 0, 0, 0]]

Graph.SMALL_X_POS_LOGICAL = [800, 725, 875, 650, 950, 725, 875, 800];
Graph.SMALL_Y_POS_LOGICAL = [25, 125, 125, 225, 225, 325, 325, 425];


Graph.SMALL_ADJ_MATRIX_X_START = 700;
Graph.SMALL_ADJ_MATRIX_Y_START = 40;
Graph.SMALL_ADJ_MATRIX_WIDTH = 30;
Graph.SMALL_ADJ_MATRIX_HEIGHT = 30;

Graph.SMALL_ADJ_LIST_X_START = 600;
Graph.SMALL_ADJ_LIST_Y_START = 30;

Graph.SMALL_ADJ_LIST_ELEM_WIDTH = 50;
Graph.SMALL_ADJ_LIST_ELEM_HEIGHT = 30;

Graph.SMALL_ADJ_LIST_HEIGHT = 36;
Graph.SMALL_ADJ_LIST_WIDTH = 36;

Graph.SMALL_ADJ_LIST_SPACING = 10;


Graph.LARGE_ADJ_MATRIX_X_START = 575;
Graph.LARGE_ADJ_MATRIX_Y_START = 30;
Graph.LARGE_ADJ_MATRIX_WIDTH = 23;
Graph.LARGE_ADJ_MATRIX_HEIGHT = 23;

Graph.LARGE_ADJ_LIST_X_START = 600;
Graph.LARGE_ADJ_LIST_Y_START = 30;

Graph.LARGE_ADJ_LIST_ELEM_WIDTH = 50;
Graph.LARGE_ADJ_LIST_ELEM_HEIGHT = 26;

Graph.LARGE_ADJ_LIST_HEIGHT = 30;
Graph.LARGE_ADJ_LIST_WIDTH = 30;

Graph.LARGE_ADJ_LIST_SPACING = 10;



Graph.VERTEX_INDEX_COLOR ="#0000FF";
Graph.EDGE_COLOR = "#000000";

Graph.SMALL_SIZE = 8;
Graph.LARGE_SIZE = 18;

Graph.HIGHLIGHT_COLOR = "#0000FF";





Graph.prototype.init = function(am, w, h, directed, dag)
{
	directed = (directed ==  undefined) ? true : directed;
	dag = (dag == undefined) ? false : dag;

	Graph.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	
	this.currentLayer = 1;
	this.isDAG = dag;
	this.directed = directed;
	this.currentLayer = 1;
	this.addControls();
 
	this.setup_small();
}

Graph.prototype.addControls = function(addDirection)
{
	if (addDirection == undefined)
	{
		addDirection = true;
	}
	this.newGraphButton = this.addControlToAlgorithmBar("Button", "New Graph");
	this.newGraphButton.onclick =  this.newGraphCallback.bind(this);

	if (addDirection)
	{
		var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Directed Graph", "Undirected Graph"], "GraphType");
		this.directedGraphButton = radioButtonList[0];
		this.directedGraphButton.onclick = this.directedGraphCallback.bind(this, true);
		this.undirectedGraphButton = radioButtonList[1];
		this.undirectedGraphButton.onclick = this.directedGraphCallback.bind(this, false);
		this.directedGraphButton.checked = this.directed;
		this.undirectedGraphButton.checked = !this.directed;
	}
	

	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Small Graph", "Large Graph"], "GraphSize");
	this.smallGraphButton = radioButtonList[0];
	this.smallGraphButton.onclick = this.smallGraphCallback.bind(this);
	this.largeGraphButton = radioButtonList[1];
	this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);
	this.smallGraphButton.checked = true;
	
	var radioButtonList = this.addRadioButtonGroupToAlgorithmBar(["Logical Representation", 
															  "Adjacency List Representation", 
															  "Adjacency Matrix Representation"
															], 
															"GraphRepresentation");
	this.logicalButton = radioButtonList[0];
	this.logicalButton.onclick = this.graphRepChangedCallback.bind(this,1);
	this.adjacencyListButton = radioButtonList[1];
	this.adjacencyListButton.onclick = this.graphRepChangedCallback.bind(this,2);
	this.adjacencyMatrixButton = radioButtonList[2];
	this.adjacencyMatrixButton.onclick = this.graphRepChangedCallback.bind(this,3);
	this.logicalButton.checked = true;
	
}

Graph.prototype.directedGraphCallback = function (newDirected, event)
{
	if (newDirected != this.directed)
	{
		this.directed =newDirected;
		this.animationManager.resetAll();
		this.setup();
	}
}



Graph.prototype.smallGraphCallback = function (event)
{
	if (this.size != Graph.SMALL_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_small();		
	}
}

Graph.prototype.largeGraphCallback = function (event)
{
	if (this.size != Graph.LARGE_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_large();		
	}	
}


Graph.prototype.newGraphCallback = function(event)
{
	this.animationManager.resetAll();
	this.setup();			
}



Graph.prototype.graphRepChangedCallback = function(newLayer, event) 
{
	this.animationManager.setAllLayers([0,newLayer]);
	this.currentLayer = newLayer;
}


Graph.prototype.recolorGraph = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				this.setEdgeColor(i, j, Graph.EDGE_COLOR);				
			}
		}
	}
}		

Graph.prototype.highlightEdge = function(i,j, highlightVal)
{
	this.cmd("SetHighlight", this.adj_list_edges[i][j], highlightVal);
	this.cmd("SetHighlight", this.adj_matrixID[i][j], highlightVal);
	this.cmd("SetEdgeHighlight", this.circleID[i], this.circleID[j], highlightVal);		
	if (!this.directed)
	{
		this.cmd("SetEdgeHighlight", this.circleID[j], this.circleID[i], highlightVal);
	}
}

Graph.prototype.setEdgeColor = function(i,j, color)
{
	this.cmd("SetForegroundColor", this.adj_list_edges[i][j], color);
	this.cmd("SetTextColor", this.adj_matrixID[i][j], color);
	this.cmd("SetEdgeColor", this.circleID[i], this.circleID[j], color);		
	if (!this.directed)
	{
		this.cmd("SetEdgeColor", this.circleID[j], this.circleID[i], color);
	}
}



Graph.prototype.clearEdges = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				this.cmd("Disconnect", this.circleID[i], this.circleID[j]);
			}
		}
	}
}


Graph.prototype.rebuildEdges = function()
{
	this.clearEdges();
	this.buildEdges();
}



Graph.prototype.buildEdges = function()
{
	
	for (var i = 0; i < this.size; i++)
	{
		for (var j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				var edgeLabel;
				if (this.showEdgeCosts)
				{
					edgeLabel = String(this.adj_matrix[i][j]);
				}
				else
				{
					edgeLabel = "";
				}
				if (this.directed)
				{
					this.cmd("Connect", this.circleID[i], this.circleID[j], Graph.EDGE_COLOR, this.adjustCurveForDirectedEdges(this.curve[i][j], this.adj_matrix[j][i] >= 0), 1, edgeLabel);
				}
				else if (i < j)
				{
					this.cmd("Connect", this.circleID[i], this.circleID[j], Graph.EDGE_COLOR, this.curve[i][j], 0, edgeLabel);							
				}
			}
		}
	}
	
}

Graph.prototype.setup_small = function()
{
	this.allowed = Graph.SMALL_ALLLOWED;
	this.curve = Graph.SMALL_CURVE;
	this. x_pos_logical = Graph.SMALL_X_POS_LOGICAL;
	this. y_pos_logical = Graph.SMALL_Y_POS_LOGICAL;
	this.adj_matrix_x_start = Graph.SMALL_ADJ_MATRIX_X_START;
	this.adj_matrix_y_start = Graph.SMALL_ADJ_MATRIX_Y_START;
	this.adj_matrix_width = Graph.SMALL_ADJ_MATRIX_WIDTH;
	this.adj_matrix_height = Graph.SMALL_ADJ_MATRIX_HEIGHT;
	this.adj_list_x_start = Graph.SMALL_ADJ_LIST_X_START;
	this.adj_list_y_start = Graph.SMALL_ADJ_LIST_Y_START;
	this.adj_list_elem_width = Graph.SMALL_ADJ_LIST_ELEM_WIDTH;
	this.adj_list_elem_height = Graph.SMALL_ADJ_LIST_ELEM_HEIGHT;
	this.adj_list_height = Graph.SMALL_ADJ_LIST_HEIGHT;
	this.adj_list_width = Graph.SMALL_ADJ_LIST_WIDTH;
	this.adj_list_spacing = Graph.SMALL_ADJ_LIST_SPACING;
	this.size = Graph.SMALL_SIZE;
	this.setup();
}

Graph.prototype.setup_large = function()
{
	this.allowed = Graph.LARGE_ALLOWED;
	this.curve = Graph.LARGE_CURVE;
	this. x_pos_logical = Graph.LARGE_X_POS_LOGICAL;
	this. y_pos_logical = Graph.LARGE_Y_POS_LOGICAL;
	this.adj_matrix_x_start = Graph.LARGE_ADJ_MATRIX_X_START;
	this.adj_matrix_y_start = Graph.LARGE_ADJ_MATRIX_Y_START;
	this.adj_matrix_width = Graph.LARGE_ADJ_MATRIX_WIDTH;
	this.adj_matrix_height = Graph.LARGE_ADJ_MATRIX_HEIGHT;
	this.adj_list_x_start = Graph.LARGE_ADJ_LIST_X_START;
	this.adj_list_y_start = Graph.LARGE_ADJ_LIST_Y_START;
	this.adj_list_elem_width = Graph.LARGE_ADJ_LIST_ELEM_WIDTH;
	this.adj_list_elem_height = Graph.LARGE_ADJ_LIST_ELEM_HEIGHT;
	this.adj_list_height = Graph.LARGE_ADJ_LIST_HEIGHT;
	this.adj_list_width = Graph.LARGE_ADJ_LIST_WIDTH;
	this.adj_list_spacing = Graph.LARGE_ADJ_LIST_SPACING;
	this.size = Graph.LARGE_SIZE;
	this.setup();		
}

Graph.prototype.adjustCurveForDirectedEdges = function(curve, bidirectional)
{
	if (!bidirectional || Math.abs(curve) > 0.01)
	{
		return curve;
	}
	else
	{
		return 0.1;
	}
	
}

Graph.prototype.setup = function() 
{
	this.commands = new Array();
	this.circleID = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.circleID[i] = this.nextIndex++;
		this.cmd("CreateCircle", this.circleID[i], i, this. x_pos_logical[i], this. y_pos_logical[i]);
		this.cmd("SetTextColor", this.circleID[i], Graph.VERTEX_INDEX_COLOR, 0);
		
		this.cmd("SetLayer", this.circleID[i], 1);
	}
	
	this.adj_matrix = new Array(this.size);
	this.adj_matrixID = new Array(this.size);
	for (i = 0; i < this.size; i++)
	{
		this.adj_matrix[i] = new Array(this.size);
		this.adj_matrixID[i] = new Array(this.size);
	}
	
	var edgePercent;
	if (this.size == Graph.SMALL_SIZE)
	{
		if (this.directed)
		{
			edgePercent = 0.4;
		}
		else
		{
			edgePercent = 0.5;					
		}
		
	}
	else
	{
		if (this.directed)
		{
			edgePercent = 0.35;
		}
		else
		{
			edgePercent = 0.6;					
		}
		
	}
	
	var lowerBound = 0;
	
	if (this.directed)
	{
		for (i = 0; i < this.size; i++)
		{
			for (var j = 0; j < this.size; j++)
			{
				this.adj_matrixID[i][j] = this.nextIndex++;
				if ((this.allowed[i][j]) && Math.random() <= edgePercent && (i < j || Math.abs(this.curve[i][j]) < 0.01 || this.adj_matrixID[j][i] == -1) && (!this.isDAG || (i < j)))
				{
					if (this.showEdgeCosts)
					{
						this.adj_matrix[i][j] = Math.floor(Math.random()* 9) + 1;
					}
					else
					{
						this.adj_matrix[i][j] = 1;
					}
					
				}
				else
				{
					this.adj_matrix[i][j] = -1;
				}
				
			}				
		}
		this.buildEdges();
		
	}
	else
	{
		for (i = 0; i < this.size; i++)
		{
			for (j = i+1; j < this.size; j++)
			{
				
				this.adj_matrixID[i][j] = this.nextIndex++;
				this.adj_matrixID[j][i] = this.nextIndex++;
				
				if ((this.allowed[i][j]) && Math.random() <= edgePercent)
				{
					if (this.showEdgeCosts)
					{
						this.adj_matrix[i][j] = Math.floor(Math.random()* 9) + 1;
					}
					else
					{
						this.adj_matrix[i][j] = 1;
					}
					this.adj_matrix[j][i] = this.adj_matrix[i][j];
					if (this.showEdgeCosts)
					{
						var edgeLabel  = String(this.adj_matrix[i][j]);
					}
					else
					{
						edgeLabel = "";
					}
					this.cmd("Connect", this.circleID[i], this.circleID[j], Graph.EDGE_COLOR, this.curve[i][j], 0, edgeLabel);
				}
				else
				{
					this.adj_matrix[i][j] = -1;
					this.adj_matrix[j][i] = -1;
				}
				
			}				
		}
		
		this.buildEdges();
		
		
		for (i=0; i < this.size; i++)
		{
			this.adj_matrix[i][i] = -1;
		}
		
	}
	
	
	// Craate Adj List

	
	this.buildAdjList();
	
	
	// Create Adj Matrix
	
	this.buildAdjMatrix();
	
	
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.clearHistory();
}

Graph.prototype.resetAll = function()
{
	
}


Graph.prototype.buildAdjMatrix = function()
{
	
	this.adj_matrix_index_x = new Array(this.size);
	this.adj_matrix_index_y = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.adj_matrix_index_x[i] = this.nextIndex++;
		this.adj_matrix_index_y[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.adj_matrix_index_x[i], i,   this.adj_matrix_x_start + i*this.adj_matrix_width, this.adj_matrix_y_start - this.adj_matrix_height);
		this.cmd("SetForegroundColor", this.adj_matrix_index_x[i], Graph.VERTEX_INDEX_COLOR);
		this.cmd("CreateLabel", this.adj_matrix_index_y[i], i,   this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + i* this.adj_matrix_height);
		this.cmd("SetForegroundColor", this.adj_matrix_index_y[i], Graph.VERTEX_INDEX_COLOR);
		this.cmd("SetLayer", this.adj_matrix_index_x[i], 3);
		this.cmd("SetLayer", this.adj_matrix_index_y[i], 3);
		
		for (var j = 0; j < this.size; j++)
		{
			this.adj_matrixID[i][j] = this.nextIndex++;
			if (this.adj_matrix[i][j] < 0)
			{
				var lab = ""						
			}
			else
			{
				lab = String(this.adj_matrix[i][j])
			}
			this.cmd("CreateRectangle", this.adj_matrixID[i][j], lab, this.adj_matrix_width, this.adj_matrix_height, 
				this.adj_matrix_x_start + j*this.adj_matrix_width,this.adj_matrix_y_start + i * this.adj_matrix_height);
			this.cmd("SetLayer", this.adj_matrixID[i][j], 3);
			
			
		}				
	}
}



Graph.prototype.removeAdjList = function()
{
	for (var i = 0; i < this.size; i++)
	{
		this.cmd("Delete", this.adj_list_list[i], "RAL1");
		this.cmd("Delete", this.adj_list_index[i], "RAL2");
		for (var j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] > 0)
			{
				this.cmd("Delete", this.adj_list_edges[i][j], "RAL3");
			}	
		}
	}
	
}


Graph.prototype.buildAdjList = function()
{					
	this.adj_list_index = new Array(this.size);
	this.adj_list_list = new Array(this.size);
	this.adj_list_edges = new Array(this.size);
	
	for (var i = 0; i < this.size; i++)
	{
		this.adj_list_index[i] = this.nextIndex++;
		this.adj_list_edges[i] = new Array(this.size);
		this.adj_list_index[i] = this.nextIndex++;
		this.adj_list_list[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.adj_list_list[i], "", this.adj_list_width, this.adj_list_height, this.adj_list_x_start, this.adj_list_y_start + i*this.adj_list_height);
		this.cmd("SetLayer", this.adj_list_list[i], 2);
		this.cmd("CreateLabel", this.adj_list_index[i], i, this.adj_list_x_start - this.adj_list_width , this.adj_list_y_start + i*this.adj_list_height);
		this.cmd("SetForegroundColor",  this.adj_list_index[i], Graph.VERTEX_INDEX_COLOR);
		this.cmd("SetLayer", this.adj_list_index[i], 2);
		var lastElem = this.adj_list_list[i];
		var nextXPos = this.adj_list_x_start + this.adj_list_width + this.adj_list_spacing;
		var hasEdges = false;
		for (var j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] > 0)
			{
				hasEdges = true;
				this.adj_list_edges[i][j] = this.nextIndex++;
				this.cmd("CreateLinkedList",this.adj_list_edges[i][j], j,this.adj_list_elem_width, this.adj_list_elem_height, 
					nextXPos, this.adj_list_y_start + i*this.adj_list_height, 0.25, 0, 1, 2);
				this.cmd("SetNull", this.adj_list_edges[i][j], 1);
				this.cmd("SetText", this.adj_list_edges[i][j], this.adj_matrix[i][j], 1); 
				this.cmd("SetTextColor", this.adj_list_edges[i][j], Graph.VERTEX_INDEX_COLOR, 0);
				this.cmd("SetLayer", this.adj_list_edges[i][j], 2);
				
				nextXPos = nextXPos + this.adj_list_elem_width + this.adj_list_spacing;
				this.cmd("Connect", lastElem, this.adj_list_edges[i][j]);
				this.cmd("SetNull", lastElem, 0);
				lastElem = this.adj_list_edges[i][j];						
			}	
		}
		if (!hasEdges)
		{
			this.cmd("SetNull", this.adj_list_list[i], 1);					
		}
	}
}




// NEED TO OVERRIDE IN PARENT
Graph.prototype.reset = function()
{
	// Throw an error?
}


Graph.prototype.disableUI = function(event)
{
	this.newGraphButton.disabled = true;
	if (this.directedGraphButton != null && this.directedGraphButton != undefined)
		this.directedGraphButton.disabled = true;
	if (this.undirectedGraphButton != null && this.undirectedGraphButton != undefined)
		this.undirectedGraphButton.disabled = true;
	this.smallGraphButton.disabled = true;
	this.largeGraphButton.disabled = true;
}



Graph.prototype.enableUI = function(event)
{
	
	this.newGraphButton.disabled = false;
	if (this.directedGraphButton != null && this.directedGraphButton != undefined)
		this.directedGraphButton.disabled = false;
	if (this.undirectedGraphButton != null && this.undirectedGraphButton != undefined)
		this.undirectedGraphButton.disabled = false;
	this.smallGraphButton.disabled = false;
	this.largeGraphButton.disabled = false;
}



/* no init, this is only a base class! */
 var currentAlg;
 function init()
 {
 var animManag = initCanvas();
 currentAlg = new Graph(animManag, canvas.width, canvas.height);
}

				
	
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


function BFS(am, w, h, dir)
{
	// call superclass' constructor, which calls init
	BFS.superclass.constructor.call(this, am, w, h, dir);
}
BFS.inheritFrom(Graph);


BFS.AUX_ARRAY_WIDTH = 25;
BFS.AUX_ARRAY_HEIGHT = 25;
BFS.AUX_ARRAY_START_Y = 50;

BFS.VISITED_START_X = 475;
BFS.PARENT_START_X = 400;

BFS.HIGHLIGHT_CIRCLE_COLOR = "#000000";
BFS.BFS_TREE_COLOR = "#0000FF";
BFS.BFS_QUEUE_HEAD_COLOR = "#0000FF";


BFS.QUEUE_START_X = 30;
BFS.QUEUE_START_Y = 50;
BFS.QUEUE_SPACING = 30;


BFS.prototype.addControls =  function()
{		
	this.addLabelToAlgorithmBar("Start Vertex: ");
	this.startField = this.addControlToAlgorithmBar("Text", "");
	this.startField.onkeydown = this.returnSubmit(this.startField,  this.startCallback.bind(this), 2, true);
	this.startField.size = 2;
	this.startButton = this.addControlToAlgorithmBar("Button", "Run BFS");
	this.startButton.onclick = this.startCallback.bind(this);
	BFS.superclass.addControls.call(this);
}	


BFS.prototype.init = function(am, w, h, dir)
{
	showEdgeCosts = false;
	BFS.superclass.init.call(this, am, w, h, dir); // TODO:  add no edge label flag to this?
	// Setup called in base class constructor
}


BFS.prototype.setup = function() 
{
	BFS.superclass.setup.call(this);
	this.messageID = new Array();
	this.commands = new Array();
	this.visitedID = new Array(this.size);
	this.visitedIndexID = new Array(this.size);
	this.parentID = new Array(this.size);
	this.parentIndexID = new Array(this.size);
	
	for (var i = 0; i < this.size; i++)
	{
		this.visitedID[i] = this.nextIndex++;
		this.visitedIndexID[i] = this.nextIndex++;
		this.parentID[i] = this.nextIndex++;
		this.parentIndexID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.visitedID[i], "f", BFS.AUX_ARRAY_WIDTH, BFS.AUX_ARRAY_HEIGHT, BFS.VISITED_START_X, BFS.AUX_ARRAY_START_Y + i*BFS.AUX_ARRAY_HEIGHT);
		this.cmd("CreateLabel", this.visitedIndexID[i], i, BFS.VISITED_START_X - BFS.AUX_ARRAY_WIDTH , BFS.AUX_ARRAY_START_Y + i*BFS.AUX_ARRAY_HEIGHT);
		this.cmd("SetForegroundColor",  this.visitedIndexID[i], BFS.VERTEX_INDEX_COLOR);
		this.cmd("CreateRectangle", this.parentID[i], "", BFS.AUX_ARRAY_WIDTH, BFS.AUX_ARRAY_HEIGHT, BFS.PARENT_START_X, BFS.AUX_ARRAY_START_Y + i*BFS.AUX_ARRAY_HEIGHT);
		this.cmd("CreateLabel", this.parentIndexID[i], i, BFS.PARENT_START_X - BFS.AUX_ARRAY_WIDTH , BFS.AUX_ARRAY_START_Y + i*BFS.AUX_ARRAY_HEIGHT);
		this.cmd("SetForegroundColor",  this.parentIndexID[i], BFS.VERTEX_INDEX_COLOR);
		
	}
	this.cmd("CreateLabel", this.nextIndex++, "Parent", BFS.PARENT_START_X - BFS.AUX_ARRAY_WIDTH, BFS.AUX_ARRAY_START_Y - BFS.AUX_ARRAY_HEIGHT * 1.5, 0);
	this.cmd("CreateLabel", this.nextIndex++, "Visited", BFS.VISITED_START_X - BFS.AUX_ARRAY_WIDTH, BFS.AUX_ARRAY_START_Y - BFS.AUX_ARRAY_HEIGHT * 1.5, 0);
	this.cmd("CreateLabel", this.nextIndex++, "BFS Queue", BFS.QUEUE_START_X, BFS.QUEUE_START_Y - 30, 0);
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++
}

BFS.prototype.startCallback = function(event)
{
	var startValue;
	
	if (this.startField.value != "")
	{
		startvalue = this.startField.value;
		this.startField.value = "";
		if (parseInt(startvalue) < this.size)
			this.implementAction(this.doBFS.bind(this),startvalue);
	}
}



BFS.prototype.doBFS = function(startVetex)
{
	this.visited = new Array(this.size);
	this.commands = new Array();
	this.queue = new Array(this.size);
	var head = 0;
	var tail = 0;
	var queueID = new Array(this.size);
	var queueSize = 0;
	
	if (this.messageID != null)
	{
		for (var i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}
	}
	
	this.rebuildEdges();
	this.messageID = new Array();
	for (i = 0; i < this.size; i++)
	{
		this.cmd("SetText", this.visitedID[i], "f");
		this.cmd("SetText", this.parentID[i], "");
		this.visited[i] = false;
		queueID[i] = this.nextIndex++;
		
	}
	var vertex = parseInt(startVetex);
	this.visited[vertex] = true;
	this.queue[tail] = vertex;			
	this.cmd("CreateLabel", queueID[tail],  vertex, BFS.QUEUE_START_X + queueSize * BFS.QUEUE_SPACING, BFS.QUEUE_START_Y);
	queueSize = queueSize + 1;
	tail = (tail + 1) % (this.size);
	
	
	while (queueSize > 0)
	{
		vertex = this.queue[head];
		this.cmd("CreateHighlightCircle", this.highlightCircleL, BFS.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
		this.cmd("SetLayer", this.highlightCircleL, 1);
		this.cmd("CreateHighlightCircle", this.highlightCircleAL, BFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
		this.cmd("SetLayer", this.highlightCircleAL, 2);
		this.cmd("CreateHighlightCircle", this.highlightCircleAM, BFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
		this.cmd("SetLayer", this.highlightCircleAM, 3);
		
		this.cmd("SetTextColor", queueID[head], BFS.BFS_QUEUE_HEAD_COLOR);
		
		
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[vertex][neighbor] > 0)
			{
				this.highlightEdge(vertex, neighbor, 1);
				this.cmd("SetHighlight", this.visitedID[neighbor], 1);
				this.cmd("Step");
				if (!this.visited[neighbor])
				{
					this.visited[neighbor] = true;
					this.cmd("SetText", this.visitedID[neighbor], "T");
					this.cmd("SetText", this.parentID[neighbor], vertex);
					this.highlightEdge(vertex, neighbor, 0);
					this.cmd("Disconnect", this.circleID[vertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[vertex], this.circleID[neighbor], BFS.BFS_TREE_COLOR, this.curve[vertex][neighbor], 1, "");
					this.queue[tail] = neighbor;
					this.cmd("CreateLabel", queueID[tail],  neighbor, BFS.QUEUE_START_X + queueSize * BFS.QUEUE_SPACING, BFS.QUEUE_START_Y);
					tail = (tail + 1) % (this.size);
					queueSize = queueSize + 1;
				}
				else
				{
					this.highlightEdge(vertex, neighbor, 0);
				}
				this.cmd("SetHighlight", this.visitedID[neighbor], 0);
				this.cmd("Step");						
			}
			
		}
		this.cmd("Delete", queueID[head]);
		head = (head + 1) % (this.size);
		queueSize = queueSize - 1;
		for (i = 0; i < queueSize; i++)
		{
			var nextQueueIndex = (i + head) % this.size;
			this.cmd("Move", queueID[nextQueueIndex], BFS.QUEUE_START_X + i * BFS.QUEUE_SPACING, BFS.QUEUE_START_Y);
		}
		
		this.cmd("Delete", this.highlightCircleL);
		this.cmd("Delete", this.highlightCircleAM);
		this.cmd("Delete", this.highlightCircleAL);
		
	}
	
	return this.commands
	
}



// NEED TO OVERRIDE IN PARENT
BFS.prototype.reset = function()
{
	// Throw an error?

	this.messageID = new Array();
}




BFS.prototype.enableUI = function(event)
{			
	this.startField.disabled = false;
	this.startButton.disabled = false;
	this.startButton
	
	
	BFS.superclass.enableUI.call(this,event);
}
BFS.prototype.disableUI = function(event)
{
	
	this.startField.disabled = true;
	this.startButton.disabled = true;
	
	BFS.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BFS(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


ConnectedComponent.AUX_ARRAY_WIDTH = 25;
ConnectedComponent.AUX_ARRAY_HEIGHT = 25;
ConnectedComponent.AUX_ARRAY_START_Y = 100;

ConnectedComponent.VISITED_START_X = 475;
ConnectedComponent.PARENT_START_X = 400;


ConnectedComponent.D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
ConnectedComponent.F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];



ConnectedComponent.D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
ConnectedComponent.F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];

ConnectedComponent.D_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];

ConnectedComponent.F_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];



ConnectedComponent.D_Y_POS_LARGE = [037, 037, 037, 037,
									137, 137, 137,
									237, 237, 237, 237, 
									337, 337, 337, 
									437,  437, 437, 437];

ConnectedComponent.F_Y_POS_LARGE = [62, 62, 62, 62,
									162, 162, 162,
									262, 262, 262, 262, 
									362, 362, 362, 
									462,  462, 462, 462];


ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR = "#000000";
ConnectedComponent.DFS_TREE_COLOR = "#0000FF";


function ConnectedComponent(am, w, h)
{
	// call superclass' constructor, which calls init
	ConnectedComponent.superclass.constructor.call(this, am, w, h);
}

ConnectedComponent.inheritFrom(Graph);

ConnectedComponent.prototype.addControls =  function()
{		
	this.startButton = this.addControlToAlgorithmBar("Button", "Run Connected Component");
	this.startButton.onclick = this.startCallback.bind(this);
	ConnectedComponent.superclass.addControls.call(this, false);
}	


ConnectedComponent.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = false;
	ConnectedComponent.superclass.init.call(this, am, w, h, true, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		
ConnectedComponent.prototype.setup = function() 
{
	ConnectedComponent.superclass.setup.call(this); 
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.messageID = new Array();
	this.commands = new Array();
	this.animationManager.clearHistory();
	this.messageID = new Array();
	this.commands = new Array();
	
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++
	this.initialIndex = this.nextIndex;
	
	this.old_adj_matrix = new Array(this.size);
	this.old_adj_list_list = new Array(this.size);
	this.old_adj_list_index = new Array(this.size);
	this.old_adj_list_edges = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.old_adj_matrix[i] = new Array(this.size);
		this.old_adj_list_index[i] = this.adj_list_index[i];
		this.old_adj_list_list[i] = this.adj_list_list[i];
		this.old_adj_list_edges[i] = new Array(this.size);
		for (var j = 0; j < this.size; j++)
		{
			this.old_adj_matrix[i][j] = this.adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.old_adj_list_edges[i][j] = this.adj_list_edges[i][j];
			}	
			
		}
	}
}
		
		
ConnectedComponent.prototype.startCallback = function(event)
{
			this.implementAction(this.doCC.bind(this),"");
}


ConnectedComponent.prototype.transpose = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = i+1; j <this.size; j++)
		{
			var tmp = this.adj_matrix[i][j];
			this.adj_matrix[i][j] = this.adj_matrix[j][i];
			this.adj_matrix[j][i] = tmp;
		}
	}
}

ConnectedComponent.prototype.doCC = function(ignored)
{
		
	this.visited = new Array(this.size);
	this.commands = new Array();
	var i;
	if (this.messageID != null)
	{
		for (i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i], 1);
		}
	}
	this.rebuildEdges();
	this.messageID = new Array();
	
	this.d_timesID_L = new Array(this.size);
	this.f_timesID_L = new Array(this.size);
	this.d_timesID_AL = new Array(this.size);
	this.f_timesID_AL = new Array(this.size);
	this.d_times = new Array(this.size);
	this.f_times = new Array(this.size);
	this.currentTime = 1
	for (i = 0; i < this.size; i++)
	{
		this.d_timesID_L[i] = this.nextIndex++;
		this.f_timesID_L[i] = this.nextIndex++;
		this.d_timesID_AL[i] = this.nextIndex++;
		this.f_timesID_AL[i] = this.nextIndex++;
	}
	
	this.messageY = 30;
	var vertex;
	for (vertex = 0; vertex < this.size; vertex++)
	{
		if (!this.visited[vertex])
		{
			this.cmd("CreateHighlightCircle", this.highlightCircleL, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
			this.cmd("SetLayer", this.highlightCircleL, 1);
			this.cmd("CreateHighlightCircle", this.highlightCircleAL, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
			this.cmd("SetLayer", this.highlightCircleAL, 2);
			
			this.cmd("CreateHighlightCircle", this.highlightCircleAM, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
			this.cmd("SetLayer", this.highlightCircleAM, 3);
			
			if (vertex > 0)
			{
				var breakID = this.nextIndex++;
				this.messageID.push(breakID);
				this.cmd("CreateRectangle", breakID, "", 200, 0, 10, this.messageY,"left","bottom");
				this.messageY = this.messageY + 20;			
			}
			this.dfsVisit(vertex, 10, false);
			this.cmd("Delete", this.highlightCircleL, 2);
			this.cmd("Delete", this.highlightCircleAL, 3);
			this.cmd("Delete", this.highlightCircleAM, 4);
		}
	}
	this.clearEdges();
	this.removeAdjList();
	this.transpose();
	this.buildEdges();
	this.buildAdjList();
	this.currentTime = 1
	
	for (i=0; i < this.size; i++)
	{
		for (j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				this.cmd("SetText", this.adj_matrixID[i][j], "1");
			}
			else
			{
				this.cmd("SetText", this.adj_matrixID[i][j], "");						
			}
		}
	}
	
	
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.visited[vertex] = false;
		this.cmd("Delete", this.d_timesID_L[vertex], 5);
		this.cmd("Delete", this.f_timesID_L[vertex], 6);
		this.cmd("Delete", this.d_timesID_AL[vertex], 7);
		this.cmd("Delete", this.f_timesID_AL[vertex], 8);
	}
	
	var sortedVertex = new Array(this.size);
	var sortedID = new Array(this.size);
	for (vertex = 0; vertex < this.size; vertex++)
	{
		sortedVertex[vertex] = vertex;
		sortedID[vertex] = this.nextIndex++;
		this.cmd("CreateLabel", sortedID[vertex], "Vertex: " + String(vertex)+ " f = " + String(this.f_times[vertex]), 400, 110 + vertex*20, 0);
	}
	this.cmd("Step");
	
	for (i = 1; i < this.size; i++)
	{
		var j = i;
		var tmpTime = this.f_times[i];
		var tmpIndex = sortedVertex[i];
		var tmpID = sortedID[i];
		while (j > 0 && this.f_times[j-1] < tmpTime)
		{
			this.f_times[j] = this.f_times[j-1];
			sortedVertex[j] = sortedVertex[j-1];
			sortedID[j] = sortedID[j-1];
			j--;
		}
		this.f_times[j] = tmpTime;
		sortedVertex[j] = tmpIndex;
		sortedID[j] = tmpID;
	}
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("Move", sortedID[vertex],  400, 110 + vertex*20);
	}
	
	for (i = 0; i < this.messageID.length; i++)
	{
		this.cmd("Delete", this.messageID[i], 9);
	}
	
	this.messageID = new Array();
	this.messageY = 30;
	
	var ccNum = 1;
	for (i  = 0; i < this.size; i++)
	{
		vertex = sortedVertex[i];
		if (!this.visited[vertex])
		{
			
			var breakID1 = this.nextIndex++;
			this.messageID.push(breakID1);
			var breakID2 = this.nextIndex++;
			this.messageID.push(breakID2);
			this.cmd("CreateRectangle", breakID1, "", 200, 0, 50, this.messageY + 8,"left","center");
			this.cmd("CreateLabel", breakID2, "CC #" + String(ccNum++), 10, this.messageY, 0);
			this.cmd("SetForegroundColor",breakID1 ,"#004B00");
			this.cmd("SetForegroundColor",breakID2 ,"#004B00");
			this.messageY = this.messageY + 20;			
			
			this.cmd("CreateHighlightCircle", this.highlightCircleL, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
			this.cmd("SetLayer", this.highlightCircleL, 1);
			this.cmd("CreateHighlightCircle", this.highlightCircleAL, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
			this.cmd("SetLayer", this.highlightCircleAL, 2);
			
			this.cmd("CreateHighlightCircle", this.highlightCircleAM, ConnectedComponent.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
			this.cmd("SetLayer", this.highlightCircleAM, 3);

			
			
			
			
			this.dfsVisit(vertex, 75, true);
			this.cmd("Delete", this.highlightCircleL, 10);
			this.cmd("Delete", this.highlightCircleAL, 11);
			this.cmd("Delete", this.highlightCircleAM, 12);
		}
		this.cmd("Delete", sortedID[i], 13);
	}
	
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("Delete", this.d_timesID_L[vertex], 14);
		this.cmd("Delete", this.f_timesID_L[vertex], 15);
		this.cmd("Delete", this.d_timesID_AL[vertex], 16);
		this.cmd("Delete", this.f_timesID_AL[vertex], 17);
	}
	
	return this.commands
	
}


ConnectedComponent.prototype.setup_large = function()
{
	this.d_x_pos = ConnectedComponent.D_X_POS_LARGE;
	this.d_y_pos = ConnectedComponent.D_Y_POS_LARGE;
	this.f_x_pos = ConnectedComponent.F_X_POS_LARGE;
	this.f_y_pos = ConnectedComponent.F_Y_POS_LARGE;
	
	ConnectedComponent.superclass.setup_large.call(this); 
}		
ConnectedComponent.prototype.setup_small = function()
{
	
	this.d_x_pos = ConnectedComponent.D_X_POS_SMALL;
	this.d_y_pos = ConnectedComponent.D_Y_POS_SMALL;
	this.f_x_pos = ConnectedComponent.F_X_POS_SMALL;
	this.f_y_pos = ConnectedComponent.F_Y_POS_SMALL;

	ConnectedComponent.superclass.setup_small.call(this); 
}

ConnectedComponent.prototype.dfsVisit = function(startVertex, messageX, printCCNum)
{
	if (printCCNum)
	{
		var ccNumberID = this.nextIndex++;
		this.messageID.push(ccNumberID);
		this.cmd("CreateLabel",ccNumberID, "Vertex " +  String(startVertex), 5, this.messageY, 0);
		this.cmd("SetForegroundColor", ccNumberID, "#0000FF");
	}
	var nextMessage = this.nextIndex++;
	this.messageID.push(nextMessage);
	this.cmd("CreateLabel",nextMessage, "DFS(" +  String(startVertex) +  ")", messageX, this.messageY, 0);
	
	this.messageY = this.messageY + 20;
	if (!this.visited[startVertex])
	{
		this.d_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.d_timesID_L[startVertex], "d = " + String(this.d_times[startVertex]), this.d_x_pos[startVertex], this.d_y_pos[startVertex]);				
		this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height - 1/4*this.adj_list_height);
		this.cmd("SetLayer",  this.d_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.d_timesID_AL[startVertex], 2);
		
		this.visited[startVertex] = true;
		this.cmd("Step");
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[startVertex][neighbor] > 0)
			{
				this.highlightEdge(startVertex, neighbor, 1);
				if (this.visited[neighbor])
				{
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Vertex " + String(neighbor) + " already this.visited.", messageX, this.messageY, 0);
				}
				this.cmd("Step");
				this.highlightEdge(startVertex, neighbor, 0);
				if (this.visited[neighbor])
				{
					this.cmd("Delete", nextMessage, "DNM");
				}
				
				if (!this.visited[neighbor])
				{
					this.cmd("Disconnect", this.circleID[startVertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[startVertex], this.circleID[neighbor], ConnectedComponent.DFS_TREE_COLOR, this.curve[startVertex][neighbor], 1, "");
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + neighbor*this.adj_list_height);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + neighbor*this.adj_matrix_height);
					
					this.cmd("Step");
					this.dfsVisit(neighbor, messageX + 10, printCCNum);							
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Returning from recursive call: DFS(" + String(neighbor) + ")", messageX + 20, this.messageY, 0);
					
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[startVertex], this.y_pos_logical[startVertex]);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
					this.cmd("Step");
					this.cmd("Delete", nextMessage, 18);
				}
				this.cmd("Step");
				
				
				
			}
			
		}
		this.f_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.f_timesID_L[startVertex],"f = " + String(this.f_times[startVertex]), this.f_x_pos[startVertex], this.f_y_pos[startVertex]);
		this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height + 1/4*this.adj_list_height);
		
		this.cmd("SetLayer",  this.f_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.f_timesID_AL[startVertex], 2);
		
		
		
	}
	
}


ConnectedComponent.prototype.reset = function()
{
	// TODO:  Fix undo messing with setup vars.
	this.messageID = new Array();
	this.nextIndex = this.initialIndex;
	for (var i = 0; i < this.size; i++)
	{
		this.adj_list_list[i] = this.old_adj_list_list[i];
		this.adj_list_index[i] = this.old_adj_list_index[i];

		for (var j = 0; j < this.size; j++)
		{
			this.adj_matrix[i][j] = this.old_adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.adj_list_edges[i][j] = this.old_adj_list_edges[i][j];
			}	
		}
	}

}



ConnectedComponent.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	
	ConnectedComponent.superclass.enableUI.call(this,event);
}
ConnectedComponent.prototype.disableUI = function(event)
{
	
	this.startButton.disabled = true;
	
	ConnectedComponent.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ConnectedComponent(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


DFS.AUX_ARRAY_WIDTH = 25;
DFS.AUX_ARRAY_HEIGHT = 25;
DFS.AUX_ARRAY_START_Y = 50;

DFS.VISITED_START_X = 475;
DFS.PARENT_START_X = 400;

DFS.HIGHLIGHT_CIRCLE_COLOR = "#000000";
DFS.DFS_TREE_COLOR = "#0000FF";
DFS.BFS_QUEUE_HEAD_COLOR = "#0000FF";


DFS.QUEUE_START_X = 30;
DFS.QUEUE_START_Y = 50;
DFS.QUEUE_SPACING = 30;


function DFS(am, w, h, dir)
{
	// call superclass' constructor, which calls init
	DFS.superclass.constructor.call(this, am, w, h, dir);
}

DFS.inheritFrom(Graph);

DFS.prototype.addControls =  function()
{		
	this.addLabelToAlgorithmBar("Start Vertex: ");
	this.startField = this.addControlToAlgorithmBar("Text", "");
	this.startField.onkeydown = this.returnSubmit(this.startField,  this.startCallback.bind(this), 2, true);
	this.startButton = this.addControlToAlgorithmBar("Button", "Run DFS");
	this.startButton.onclick = this.startCallback.bind(this);
	DFS.superclass.addControls.call(this);
}	


DFS.prototype.init = function(am, w, h, dir)
{
	showEdgeCosts = false;
	DFS.superclass.init.call(this, am, w, h, dir); // TODO:  add no edge label flag to this?
	// Setup called in base class constructor
}


DFS.prototype.setup = function() 
{
	DFS.superclass.setup.call(this);
	this.messageID = new Array();
	this.commands = new Array();
	this.visitedID = new Array(this.size);
	this.visitedIndexID = new Array(this.size);
	this.parentID = new Array(this.size);
	this.parentIndexID = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.visitedID[i] = this.nextIndex++;
		this.visitedIndexID[i] = this.nextIndex++;
		this.parentID[i] = this.nextIndex++;
		this.parentIndexID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.visitedID[i], "f", DFS.AUX_ARRAY_WIDTH, DFS.AUX_ARRAY_HEIGHT, DFS.VISITED_START_X, DFS.AUX_ARRAY_START_Y + i*DFS.AUX_ARRAY_HEIGHT);
		this.cmd("CreateLabel", this.visitedIndexID[i], i, DFS.VISITED_START_X - DFS.AUX_ARRAY_WIDTH , DFS.AUX_ARRAY_START_Y + i*DFS.AUX_ARRAY_HEIGHT);
		this.cmd("SetForegroundColor",  this.visitedIndexID[i], DFS.VERTEX_INDEX_COLOR);
		this.cmd("CreateRectangle", this.parentID[i], "", DFS.AUX_ARRAY_WIDTH, DFS.AUX_ARRAY_HEIGHT, DFS.PARENT_START_X, DFS.AUX_ARRAY_START_Y + i*DFS.AUX_ARRAY_HEIGHT);
		this.cmd("CreateLabel", this.parentIndexID[i], i, DFS.PARENT_START_X - DFS.AUX_ARRAY_WIDTH , DFS.AUX_ARRAY_START_Y + i*DFS.AUX_ARRAY_HEIGHT);
		this.cmd("SetForegroundColor",  this.parentIndexID[i], DFS.VERTEX_INDEX_COLOR);
		
	}
	this.cmd("CreateLabel", this.nextIndex++, "Parent", DFS.PARENT_START_X - DFS.AUX_ARRAY_WIDTH, DFS.AUX_ARRAY_START_Y - DFS.AUX_ARRAY_HEIGHT * 1.5, 0);
	this.cmd("CreateLabel", this.nextIndex++, "Visited", DFS.VISITED_START_X - DFS.AUX_ARRAY_WIDTH, DFS.AUX_ARRAY_START_Y - DFS.AUX_ARRAY_HEIGHT * 1.5, 0);
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++
}

DFS.prototype.startCallback = function(event)
{
	var startValue;
	
	if (this.startField.value != "")
	{
		startvalue = this.startField.value;
		this.startField.value = "";
		if (parseInt(startvalue) < this.size)
			this.implementAction(this.doDFS.bind(this),startvalue);
	}
}



DFS.prototype.doDFS = function(startVetex)
{
	this.visited = new Array(this.size);
	this.commands = new Array();
	if (this.messageID != null)
	{
		for (var i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}
	}
	this.rebuildEdges();
	this.messageID = new Array();
	for (i = 0; i < this.size; i++)
	{
		this.cmd("SetText", this.visitedID[i], "f");
		this.cmd("SetText", this.parentID[i], "");
		this.visited[i] = false;
	}
	var vertex = parseInt(startVetex);
	this.cmd("CreateHighlightCircle", this.highlightCircleL, DFS.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
	this.cmd("SetLayer", this.highlightCircleL, 1);
	this.cmd("CreateHighlightCircle", this.highlightCircleAL, DFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
	this.cmd("SetLayer", this.highlightCircleAL, 2);
	
	this.cmd("CreateHighlightCircle", this.highlightCircleAM, DFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
	this.cmd("SetLayer", this.highlightCircleAM, 3);
	
	this.messageY = 30;
	this.dfsVisit(vertex, 10);
	this.cmd("Delete", this.highlightCircleL);
	this.cmd("Delete", this.highlightCircleAL);
	this.cmd("Delete", this.highlightCircleAM);
	return this.commands
	
}


DFS.prototype.dfsVisit = function(startVertex, messageX)
{
	var nextMessage = this.nextIndex++;
	this.messageID.push(nextMessage);
	
	this.cmd("CreateLabel",nextMessage, "DFS(" +  String(startVertex) +  ")", messageX, this.messageY, 0);
	this.messageY = this.messageY + 20;
	if (!this.visited[startVertex])
	{
		this.visited[startVertex] = true;
		this.cmd("SetText", this.visitedID[startVertex], "T");
		this.cmd("Step");
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[startVertex][neighbor] > 0)
			{
				this.highlightEdge(startVertex, neighbor, 1);
				this.cmd("SetHighlight", this.visitedID[neighbor], 1);
				if (this.visited[neighbor])
				{
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Vertex " + String(neighbor) + " already visited.", messageX, this.messageY, 0);
				}
				this.cmd("Step");
				this.highlightEdge(startVertex, neighbor, 0);
				this.cmd("SetHighlight", this.visitedID[neighbor], 0);
				if (this.visited[neighbor])
				{
					this.cmd("Delete", nextMessage);
				}
				
				if (!this.visited[neighbor])
				{
					this.cmd("Disconnect", this.circleID[startVertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[startVertex], this.circleID[neighbor], DFS.DFS_TREE_COLOR, this.curve[startVertex][neighbor], 1, "");
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + neighbor*this.adj_list_height);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + neighbor*this.adj_matrix_height);
					
					this.cmd("SetText", this.parentID[neighbor], startVertex);
					this.cmd("Step");
					this.dfsVisit(neighbor, messageX + 20);							
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Returning from recursive call: DFS(" + String(neighbor) + ")", messageX + 20, this.messageY, 0);
					
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[startVertex], this.y_pos_logical[startVertex]);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
					this.cmd("Step");
					this.cmd("Delete", nextMessage);
				}
				this.cmd("Step");
				
				
				
			}
			
		}
		
	}
	
}



// NEED TO OVERRIDE IN PARENT
DFS.prototype.reset = function()
{
	// Throw an error?

	this.messageID = new Array();
}




DFS.prototype.enableUI = function(event)
{			
	this.startField.disabled = false;
	this.startButton.disabled = false;
	this.startButton
	
	
	DFS.superclass.enableUI.call(this,event);
}
DFS.prototype.disableUI = function(event)
{
	
	this.startField.disabled = true;
	this.startButton.disabled = true;
	
	DFS.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new DFS(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


DijkstraPrim.TABLE_ENTRY_WIDTH = 50;
DijkstraPrim.TABLE_ENTRY_HEIGHT = 25;
DijkstraPrim.TABLE_START_X = 50;
DijkstraPrim.TABLE_START_Y = 80;

DijkstraPrim.MESSAGE_LABEL_1_X = 20;
DijkstraPrim.MESSAGE_LABEL_1_Y = 10;



DijkstraPrim.HIGHLIGHT_CIRCLE_COLOR = "#000000";



function DijkstraPrim(am, w, h, runningDijkstra, dir)
{
	this.runningDijkstra = runningDijkstra;

	// call superclass' constructor, which calls init
	DijkstraPrim.superclass.constructor.call(this, am, w, h, dir, false);
}

DijkstraPrim.inheritFrom(Graph);

DijkstraPrim.prototype.addControls =  function()
{		
	this.addLabelToAlgorithmBar("Start Vertex: ");
	this.startField = this.addControlToAlgorithmBar("Text", "");
	this.startField.onkeydown = this.returnSubmit(this.startField,  this.startCallback.bind(this), 2, true);
	this.startField.size = 2
	if (this.runningDijkstra)
	{
		this.startButton = this.addControlToAlgorithmBar("Button", "Run Dijkstra");
		
	}
	else
	{
		this.startButton = this.addControlToAlgorithmBar("Button", "Run Prim");
		
	}
	this.startButton.onclick = this.startCallback.bind(this);
	DijkstraPrim.superclass.addControls.call(this, this.runningDijkstra);
}	


DijkstraPrim.prototype.init = function(am, w, h, dir)
{
	this.showEdgeCosts = true;
	DijkstraPrim.superclass.init.call(this, am, w, h, dir, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		
DijkstraPrim.prototype.setup = function() 
{
	this.message1ID = this.nextIndex++;
	DijkstraPrim.superclass.setup.call(this);

	this.commands = new Array();
	this.cmd("CreateLabel", this.message1ID, "", DijkstraPrim.MESSAGE_LABEL_1_X, DijkstraPrim.MESSAGE_LABEL_1_Y, 0);
	
	
	this.vertexID = new Array(this.size);
	this.knownID = new Array(this.size);
	this.distanceID = new Array(this.size);
	this.pathID = new Array(this.size);
	this.known = new Array(this.size);
	this.distance = new Array(this.size);
	this.path = new Array(this.size);
	
	this.messageID = null;

	for (var i = 0; i < this.size; i++)
	{
		this.vertexID[i] = this.nextIndex++;
		this.knownID[i] = this.nextIndex++;
		this.distanceID[i] = this.nextIndex++;
		this.pathID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.vertexID[i], i, DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_ENTRY_HEIGHT, DijkstraPrim.TABLE_START_X, DijkstraPrim.TABLE_START_Y + i*DijkstraPrim.TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.knownID[i], "", DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_ENTRY_HEIGHT, DijkstraPrim.TABLE_START_X + DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y + i*DijkstraPrim.TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.distanceID[i], "", DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_ENTRY_HEIGHT, DijkstraPrim.TABLE_START_X + 2 * DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y + i*DijkstraPrim.TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.pathID[i], "", DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_ENTRY_HEIGHT, DijkstraPrim.TABLE_START_X+ 3 * DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y + i*DijkstraPrim.TABLE_ENTRY_HEIGHT);
		this.cmd("SetTextColor",  this.vertexID[i], DijkstraPrim.VERTEX_INDEX_COLOR);
		
	}
	this.cmd("CreateLabel", this.nextIndex++, "Vertex", DijkstraPrim.TABLE_START_X, DijkstraPrim.TABLE_START_Y  - DijkstraPrim.TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Known", DijkstraPrim.TABLE_START_X + DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y  - DijkstraPrim.TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Cost", DijkstraPrim.TABLE_START_X + 2 * DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y  - DijkstraPrim.TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Path", DijkstraPrim.TABLE_START_X + 3 * DijkstraPrim.TABLE_ENTRY_WIDTH, DijkstraPrim.TABLE_START_Y  - DijkstraPrim.TABLE_ENTRY_HEIGHT);
	
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.comparisonMessageID = this.nextIndex++;
}



DijkstraPrim.prototype.findCheapestUnknown = function() 
{
    var bestIndex = -1;
    this.cmd("SetText", this.message1ID,"Finding Cheapest Uknown Vertex");

	for (var i = 0; i < this.size; i++)
	{
	    if (!this.known[i])
	    {
		this.cmd("SetHighlight", this.distanceID[i], 1);
	    }
	   
		if (!this.known[i] && this.distance[i] != -1 && (bestIndex == -1 ||
											   (this.distance[i] < this.distance[bestIndex])))
		{
			bestIndex = i;
		}
	}
	if (bestIndex == -1)
	{
		var x = 3;
		x = x + 2;
	}
    this.cmd("Step");
    for (var i = 0; i < this.size; i++)
    {
	    if (!this.known[i])
	    {
		this.cmd("SetHighlight", this.distanceID[i], 0);
	    }

    }
	return bestIndex;
}


DijkstraPrim.prototype.doDijkstraPrim = function(startVertex)
{
	this.commands = new Array();
	
	if (!this.runningDijkstra)
	{
		this.recolorGraph();
	}
	
	
	var current = parseInt(startVertex);
	
	for (var i = 0; i < this.size; i++)
	{
		this.known[i] = false;
		this.distance[i] = -1;
		this.path[i] = -1;
		this.cmd("SetText", this.knownID[i], "F");
		this.cmd("SetText", this.distanceID[i], "INF");
		this.cmd("SetText", this.pathID[i], "-1");
		this.cmd("SetTextColor", this.knownID[i], "#000000");
		
	}
	if (this.messageID != null)
	{
		for (i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}				
	}
	this.messageID = new Array();
	
	this.distance[current] = 0;
	this.cmd("SetText", this.distanceID[current], 0);
	
	for (i = 0; i < this.size; i++)
	{ 
		current = this.findCheapestUnknown();
		if (current < 0)
		{
			break;
		}
		this.cmd("SetText",this.message1ID, "Cheapest Unknown Vertex: " + current); // Gotta love Auto Conversion
		this.cmd("SetHighlight", this.distanceID[current], 1);

		this.cmd("SetHighlight", this.circleID[current], 1);
	        this.cmd("Step");
		this.cmd("SetHighlight", this.distanceID[current], 0);
	        this.cmd("SetText", this.message1ID,"Setting known field to True");
		this.cmd("SetHighlight", this.knownID[current], 1);
		this.known[current] = true;
		this.cmd("SetText", this.knownID[current], "T");
		this.cmd("SetTextColor", this.knownID[current], "#AAAAAA");
	        this.cmd("Step");
		this.cmd("SetHighlight", this.knownID[current], 0);
		this.cmd("SetText",this.message1ID, "Updating neighbors of vertex " + current); // Gotta love Auto Conversion
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[current][neighbor] >= 0)
			{
				this.highlightEdge(current, neighbor, 1);
				if (this.known[neighbor])
				{
					
					this.cmd("CreateLabel",  this.comparisonMessageID,"Vertex " + String(neighbor) + " known", 
						DijkstraPrim.TABLE_START_X + 5 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + neighbor*DijkstraPrim.TABLE_ENTRY_HEIGHT);
					this.cmd("SetHighlight", this.knownID[neighbor], 1);
				}
				else
				{	this.cmd("SetHighlight", this.distanceID[current], 1);
					this.cmd("SetHighlight", this.distanceID[neighbor], 1);
					var distString = String(this.distance[neighbor]);
					if (this.distance[neighbor] < 0)
					{
						distString = "INF";
					}
					
					if (this.runningDijkstra)
					{
						if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.distance[current] + this.adj_matrix[current][neighbor])
						{
							this.cmd("CreateLabel", this.comparisonMessageID, distString + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]), 
								DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + neighbor*DijkstraPrim.TABLE_ENTRY_HEIGHT);
						}
						else
						{
							this.cmd("CreateLabel",  this.comparisonMessageID,"!(" + String(this.distance[neighbor])  + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]) + ")", 
								DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + neighbor*DijkstraPrim.TABLE_ENTRY_HEIGHT);							
						}								
						
					}
					else
					{
						if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.adj_matrix[current][neighbor])
						{
							this.cmd("CreateLabel", this.comparisonMessageID, distString + " > " + String(this.adj_matrix[current][neighbor]), 
								DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + neighbor*DijkstraPrim.TABLE_ENTRY_HEIGHT);
						}
						else
						{
							this.cmd("CreateLabel",  this.comparisonMessageID,"!(" + String(this.distance[neighbor])  + " > " + String(this.adj_matrix[current][neighbor]) + ")", 
								DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + neighbor*DijkstraPrim.TABLE_ENTRY_HEIGHT);							
						}
						
						
					}
					
					
				}
				
				this.cmd("Step");
				this.cmd("Delete", this.comparisonMessageID);
				this.highlightEdge(current, neighbor, 0);
				if (this.known[neighbor])
				{
					this.cmd("SetHighlight", this.knownID[neighbor], 0);
					
				}
				else
				{
					this.cmd("SetHighlight", this.distanceID[current], 0);
					this.cmd("SetHighlight", this.distanceID[neighbor], 0);
					var compare;
					if (this.runningDijkstra)
					{
						compare = this.distance[current] + this.adj_matrix[current][neighbor];
					}
					else
					{
						compare = this.adj_matrix[current][neighbor];
					}
					if (this.distance[neighbor] < 0 || this.distance[neighbor] > compare)
					{
						this.distance[neighbor] =  compare;
						this.path[neighbor] = current;
						this.cmd("SetText", this.distanceID[neighbor],this.distance[neighbor] );
						this.cmd("SetText", this.pathID[neighbor],this.path[neighbor]);
					}
				}
				
			}
		}
		this.cmd("SetHighlight", this.circleID[current], 0);
		
	}
	// Running Dijkstra's algorithm, create the paths
	if (this.runningDijkstra)
	{
		this.cmd("SetText",this.message1ID, "Finding Paths in Table"); 
		this.createPaths();
	}
	// Running Prim's algorithm, highlight the tree
	else
	{
		this.cmd("SetText",this.message1ID, "Creating tree from table"); 
		this.highlightTree();
	}
	
       this.cmd("SetText",this.message1ID, ""); 
	return this.commands
}

DijkstraPrim.prototype.createPaths = function()
{
	for (var vertex = 0; vertex < this.size; vertex++)
	{
		var nextLabelID = this.nextIndex++;
		if (this.distance[vertex] < 0)
		{
			this.cmd("CreateLabel", nextLabelID, "No Path",  DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + vertex*DijkstraPrim.TABLE_ENTRY_HEIGHT);
			this.messageID.push(nextLabelID);
		}
		else
		{
			this.cmd("CreateLabel", nextLabelID, vertex,  DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + vertex*DijkstraPrim.TABLE_ENTRY_HEIGHT);
			this.messageID.push(nextLabelID);
			var pathList = [nextLabelID];
			var nextInPath = vertex;
			while (nextInPath >= 0)
			{
				this.cmd("SetHighlight", this.pathID[nextInPath], 1);
				this.cmd("Step");
				if (this.path[nextInPath] != -1)
				{
					nextLabelID = this.nextIndex++;
					this.cmd("CreateLabel", nextLabelID, this.path[nextInPath],  DijkstraPrim.TABLE_START_X + 3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + nextInPath*DijkstraPrim.TABLE_ENTRY_HEIGHT);
					this.cmd("Move", nextLabelID,  DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH,DijkstraPrim.TABLE_START_Y + vertex*DijkstraPrim.TABLE_ENTRY_HEIGHT);
					this.messageID.push(nextLabelID);
					for (var i = pathList.length - 1; i >= 0; i--)
					{
						this.cmd("Move", pathList[i], DijkstraPrim.TABLE_START_X + 4.3 * DijkstraPrim.TABLE_ENTRY_WIDTH + (pathList.length - i) * 17,DijkstraPrim.TABLE_START_Y + vertex*DijkstraPrim.TABLE_ENTRY_HEIGHT)
						
					}
					this.cmd("Step");
					pathList.push(nextLabelID);
				}
				this.cmd("SetHighlight", this.pathID[nextInPath], 0);
				nextInPath = this.path[nextInPath];
				
			}					
		}
	}
}

DijkstraPrim.prototype.highlightTree = function()
{
	for (var vertex = 0; vertex < this.size; vertex++)
	{
		if (this.path[vertex] >= 0)
		{
			this.cmd("SetHighlight", this.vertexID[vertex], 1)
			this.cmd("SetHighlight", this.pathID[vertex], 1);
			this.highlightEdge(vertex, this.path[vertex], 1)
			this.highlightEdge(this.path[vertex], vertex, 1)
			this.cmd("Step");
			this.cmd("SetHighlight", this.vertexID[vertex], 0)
			this.cmd("SetHighlight", this.pathID[vertex], 0);
			this.highlightEdge(vertex, this.path[vertex], 0)
			this.highlightEdge(this.path[vertex], vertex, 0)
			this.setEdgeColor(vertex, this.path[vertex], "#FF0000");				
			this.setEdgeColor(this.path[vertex], vertex,"#FF0000");				
		}
	}			
}

DijkstraPrim.prototype.reset = function()
{
	this.messageID = new Array();
}

DijkstraPrim.prototype.startCallback = function(event)
{
	var startValue;
	
	if (this.startField.value != "")
	{
		startvalue = this.startField.value;
		this.startField.value = "";
		if (parseInt(startvalue) < this.size)
			this.implementAction(this.doDijkstraPrim.bind(this),startvalue);
	}
}


DijkstraPrim.prototype.enableUI = function(event)
{			
	this.startField.disabled = false;
	this.startButton.disabled = false;
	this.startButton
	
	
	DijkstraPrim.superclass.enableUI.call(this,event);
}
DijkstraPrim.prototype.disableUI = function(event)
{
	
	this.startField.disabled = true;
	this.startButton.disabled = true;
	
	DijkstraPrim.superclass.disableUI.call(this, event);
}


var currentAlg;

function init(runDijkstra)
{
	var animManag = initCanvas();
	currentAlg = new DijkstraPrim(animManag, canvas.width, canvas.height, runDijkstra);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function Floyd(am, w, h, dir)
{
	// call superclass' constructor, which calls init
	Floyd.superclass.constructor.call(this, am, w, h, dir);
}

Floyd.inheritFrom(Graph);


Floyd.SMALL_COST_TABLE_WIDTH = 30;
Floyd.SMALL_COST_TABLE_HEIGHT = 30;
Floyd.SMALL_COST_TABLE_START_X = 40;
Floyd.SMALL_COST_TABLE_START_Y = 70;

Floyd.SMALL_PATH_TABLE_WIDTH = 30;
Floyd.SMALL_PATH_TABLE_HEIGHT = 30;
Floyd.SMALL_PATH_TABLE_START_X = 330;
Floyd.SMALL_PATH_TABLE_START_Y = 70;


Floyd.SMALL_NODE_1_X_POS = 50;
Floyd.SMALL_NODE_1_Y_POS = 400;
Floyd.SMALL_NODE_2_X_POS = 150;
Floyd.SMALL_NODE_2_Y_POS = 350;
Floyd.SMALL_NODE_3_X_POS = 250;
Floyd.SMALL_NODE_3_Y_POS = 400;

Floyd.SMALL_MESSAGE_X = 400;
Floyd.SMALL_MESSAGE_Y = 350;

Floyd.LARGE_COST_TABLE_WIDTH = 20;
Floyd.LARGE_COST_TABLE_HEIGHT = 20;
Floyd.LARGE_COST_TABLE_START_X = 40;
Floyd.LARGE_COST_TABLE_START_Y = 50;

Floyd.LARGE_PATH_TABLE_WIDTH = 20;
Floyd.LARGE_PATH_TABLE_HEIGHT = 20;
Floyd.LARGE_PATH_TABLE_START_X = 500;
Floyd.LARGE_PATH_TABLE_START_Y = 50;

Floyd.LARGE_NODE_1_X_POS = 50;
Floyd.LARGE_NODE_1_Y_POS = 500;
Floyd.LARGE_NODE_2_X_POS = 150;
Floyd.LARGE_NODE_2_Y_POS = 450;
Floyd.LARGE_NODE_3_X_POS = 250;
Floyd.LARGE_NODE_3_Y_POS = 500;

Floyd.LARGE_MESSAGE_X = 300;
Floyd.LARGE_MESSAGE_Y = 450;

Floyd.prototype.addControls =  function()
{		
	
	this.startButton = this.addControlToAlgorithmBar("Button", "Run Floyd-Warshall");
	this.startButton.onclick = this.startCallback.bind(this);

	Floyd.superclass.addControls.call(this);
	this.smallGraphButton.onclick = this.smallGraphCallback.bind(this);
	this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);	
}	


Floyd.prototype.init = function(am, w, h, dir)
{
	this.showEdgeCosts = true;
	Floyd.superclass.init.call(this, am, w, h, dir, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

Floyd.prototype.reset = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = 0; j < this.size; j++)
		{
			this.costTable[i][j] = this.adj_matrix[i][j];
			if (this.costTable[i][j] >= 0)
			{
				this.pathTable[i][j] = i;
			}
			else
			{
				this.pathTable[i][j] = -1
			}			
			
		}
		
	}
	
}


Floyd.prototype.smallGraphCallback = function (event)
{
	if (this.size != Graph.SMALL_SIZE)
	{
		this.animationManager.resetAll();
		this.animationManager.setAllLayers([0,this.currentLayer]);
		this.logicalButton.disabled = false;
		this.adjacencyListButton.disabled = false;
		this.adjacencyMatrixButton.disabled = false;
		this.setup_small();		
	}
}

Graph.prototype.largeGraphCallback = function (event)
{
	if (this.size != Graph.LARGE_SIZE)
	{
		this.animationManager.resetAll();
		//this.animationManager.setAllLayers([0]);
		this.logicalButton.disabled = true;
		this.adjacencyListButton.disabled = true;
		this.adjacencyMatrixButton.disabled = true;
		this.setup_large();		
	}	
}




Floyd.prototype.getCostLabel = function(value, alwaysUseINF)
{
	alwaysUseINF = alwaysUseINF == undefined ? false : alwaysUseINF;
	if (value >= 0)
	{
		return String(value);
	}
	else if (this.size == Graph.SMALL_SIZE || alwaysUseINF)
	{
		return "INF";
	}
	else
	{
		return ""
	}			
}

Floyd.prototype.setup_small = function()
{
	this.cost_table_width = Floyd.SMALL_COST_TABLE_WIDTH;
	this.cost_table_height = Floyd.SMALL_COST_TABLE_HEIGHT;
	this.cost_table_start_x = Floyd.SMALL_COST_TABLE_START_X;
	this.cost_table_start_y = Floyd.SMALL_COST_TABLE_START_Y;
	
	this.path_table_width = Floyd.SMALL_PATH_TABLE_WIDTH;
	this.path_table_height = Floyd.SMALL_PATH_TABLE_HEIGHT;
	this.path_table_start_x = Floyd.SMALL_PATH_TABLE_START_X;
	this.path_table_start_y = Floyd.SMALL_PATH_TABLE_START_Y;
	
	this.node_1_x_pos = Floyd.SMALL_NODE_1_X_POS;
	this.node_1_y_pos = Floyd.SMALL_NODE_1_Y_POS;
	this.node_2_x_pos = Floyd.SMALL_NODE_2_X_POS;
	this.node_2_y_pos = Floyd.SMALL_NODE_2_Y_POS;
	this.node_3_x_pos = Floyd.SMALL_NODE_3_X_POS;
	this.node_3_y_pos = Floyd.SMALL_NODE_3_Y_POS;
	
	this.message_x = Floyd.SMALL_MESSAGE_X;
	this.message_y = Floyd.SMALL_MESSAGE_Y;
	Floyd.superclass.setup_small.call(this);
}

Floyd.prototype.setup_large = function()
{
	this.cost_table_width = Floyd.LARGE_COST_TABLE_WIDTH;
	this.cost_table_height = Floyd.LARGE_COST_TABLE_HEIGHT;
	this.cost_table_start_x = Floyd.LARGE_COST_TABLE_START_X;
	this.cost_table_start_y = Floyd.LARGE_COST_TABLE_START_Y;
	
	this.path_table_width = Floyd.LARGE_PATH_TABLE_WIDTH;
	this.path_table_height = Floyd.LARGE_PATH_TABLE_HEIGHT;
	this.path_table_start_x = Floyd.LARGE_PATH_TABLE_START_X;
	this.path_table_start_y = Floyd.LARGE_PATH_TABLE_START_Y;
	
	this.node_1_x_pos = Floyd.LARGE_NODE_1_X_POS;
	this.node_1_y_pos = Floyd.LARGE_NODE_1_Y_POS;
	this.node_2_x_pos = Floyd.LARGE_NODE_2_X_POS;
	this.node_2_y_pos = Floyd.LARGE_NODE_2_Y_POS;
	this.node_3_x_pos = Floyd.LARGE_NODE_3_X_POS;
	this.node_3_y_pos = Floyd.LARGE_NODE_3_Y_POS;
	
	this.message_x = Floyd.LARGE_MESSAGE_X;
	this.message_y = Floyd.LARGE_MESSAGE_Y;
	
	Floyd.superclass.setup_large.call(this);
}


Floyd.prototype.setup = function()
{
	Floyd.superclass.setup.call(this);
	this.commands = new Array();
	
	this.costTable = new Array(this.size);
	this.pathTable = new Array(this.size);
	this.costTableID = new Array(this.size);
	this.pathTableID = new Array(this.size);
	this.pathIndexXID = new Array(this.size);
	this.pathIndexYID = new Array(this.size);
	this.costIndexXID = new Array(this.size);
	this.costIndexYID = new Array(this.size);
	
	this.node1ID = this.nextIndex++;
	this.node2ID = this.nextIndex++;
	this.node3ID = this.nextIndex++;
	
	var i;
	for (i = 0; i < this.size; i++)
	{
		this.costTable[i] = new Array(this.size);
		this.pathTable[i] = new Array(this.size);
		this.costTableID[i] = new Array(this.size);
		this.pathTableID[i] = new Array(this.size);
		
	}
	
	var costTableHeader = this.nextIndex++;
	var pathTableHeader = this.nextIndex++;
	
	this.cmd("CreateLabel", costTableHeader, "Cost Table", this.cost_table_start_x, this.cost_table_start_y - 2*this.cost_table_height, 0);
	this.cmd("CreateLabel", pathTableHeader, "Path Table", this.path_table_start_x, this.path_table_start_y - 2*this.path_table_height, 0);
	
	for (i= 0; i < this.size; i++)
	{
		this.pathIndexXID[i] = this.nextIndex++;
		this.pathIndexYID[i] = this.nextIndex++;
		this.costIndexXID[i] = this.nextIndex++;
		this.costIndexYID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.pathIndexXID[i], i, this.path_table_start_x + i * this.path_table_width, this.path_table_start_y - this.path_table_height);
		this.cmd("SetTextColor", this.pathIndexXID[i], "#0000FF");
		this.cmd("CreateLabel", this.pathIndexYID[i], i, this.path_table_start_x   - this.path_table_width, this.path_table_start_y + i * this.path_table_height);
		this.cmd("SetTextColor", this.pathIndexYID[i], "#0000FF");
		
		this.cmd("CreateLabel", this.costIndexXID[i], i, this.cost_table_start_x + i * this.cost_table_width, this.cost_table_start_y - this.cost_table_height);
		this.cmd("SetTextColor", this.costIndexXID[i], "#0000FF");
		this.cmd("CreateLabel", this.costIndexYID[i], i, this.cost_table_start_x - this.cost_table_width, this.cost_table_start_y + i * this.cost_table_height);
		this.cmd("SetTextColor", this.costIndexYID[i], "#0000FF");
		for (var j = 0; j < this.size; j++)
		{
			this.costTable[i][j] = this.adj_matrix[i][j];
			if (this.costTable[i][j] >= 0)
			{
				this.pathTable[i][j] = i;
			}
			else
			{
				this.pathTable[i][j] = -1
			}
			this.costTableID[i][j] = this.nextIndex++;
			this.pathTableID[i][j] = this.nextIndex++;
			this.cmd("CreateRectangle", this.costTableID[i][j], this.getCostLabel(this.costTable[i][j], true), this.cost_table_width, this.cost_table_height, this.cost_table_start_x + j* this.cost_table_width, this.cost_table_start_y + i*this.cost_table_height);
			this.cmd("CreateRectangle", this.pathTableID[i][j], this.pathTable[i][j], this.path_table_width, this.path_table_height, this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + i*this.path_table_height);
		}
	}
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	if (this.size == Graph.LARGE_SIZE)
	{
		this.animationManager.setAllLayers([0]);
	}
	
}

Floyd.prototype.startCallback = function(event)
{	
	this.implementAction(this.doFloydWarshall.bind(this),"");
}


Floyd.prototype.doFloydWarshall = function(ignored)
{
	this.commands = new Array();
	
	var oldIndex= this.nextIndex;
	var messageID  = this.nextIndex++;
	var moveLabel1ID = this.nextIndex++;
	var moveLabel2ID = this.nextIndex++;
	
	this.cmd("CreateCircle", this.node1ID, "", this.node_1_x_pos, this.node_1_y_pos);
	this.cmd("CreateCircle", this.node2ID, "", this.node_2_x_pos, this.node_2_y_pos);
	this.cmd("CreateCircle", this.node3ID, "", this.node_3_x_pos, this.node_3_y_pos);
	this.cmd("CreateLabel", messageID, "",  this.message_x, this.message_y, 0); 
	
	for (var k = 0; k < this.size; k++)
	{
		for (var i = 0; i < this.size; i++)
		{
			for (var j = 0; j < this.size; j++)
			{
				if (i != j && j != k && i != k)
				{
					this.cmd("SetText", this.node1ID, i);
					this.cmd("SetText", this.node2ID, k);
					this.cmd("SetText", this.node3ID, j);
					this.cmd("Connect",this.node1ID, this.node2ID, "#009999", -0.1, 1, this.getCostLabel(this.costTable[i][k], true))
					this.cmd("Connect",this.node2ID, this.node3ID, "#9900CC", -0.1, 1, this.getCostLabel(this.costTable[k][j], true))
					this.cmd("Connect",this.node1ID, this.node3ID, "#CC0000", 0, 1, this.getCostLabel(this.costTable[i][j], true))
					this.cmd("SetHighlight", this.costTableID[i][k], 1);
					this.cmd("SetHighlight", this.costTableID[k][j], 1);
					this.cmd("SetHighlight", this.costTableID[i][j], 1);
					this.cmd("SetTextColor", this.costTableID[i][k], "#009999");
					this.cmd("SetTextColor", this.costTableID[k][j], "#9900CC");
					this.cmd("SetTextColor", this.costTableID[i][j], "#CC0000");
					if (this.costTable[i][k] >= 0 && this.costTable[k][j] >= 0)
					{
						if (this.costTable[i][j] < 0 || this.costTable[i][k] + this.costTable[k][j] < this.costTable[i][j])
						{							
							this.cmd("SetText", messageID, this.getCostLabel(this.costTable[i][k], true) + " + " +  this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true));
							this.cmd("Step");
							this.costTable[i][j] = this.costTable[i][k] + this.costTable[k][j];
							this.cmd("SetText", this.pathTableID[i][j], "");
							this.cmd("SetText", this.costTableID[i][j], "");
							this.cmd("CreateLabel", moveLabel1ID, this.pathTable[k][j],  this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + k*this.path_table_height);
							this.cmd("Move", moveLabel1ID, this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + i*this.path_table_height)						
							this.cmd("CreateLabel", moveLabel2ID,this.costTable[i][j],  this.message_x, this.message_y);
							this.cmd("SetHighlight", moveLabel2ID, 1);
							this.cmd("Move", moveLabel2ID, this.cost_table_start_x + j* this.cost_table_width, this.cost_table_start_y + i*this.cost_table_height)						
							this.pathTable[i][j] = this.pathTable[k][j];
							this.cmd("Step");
							this.cmd("SetText", this.costTableID[i][j], this.costTable[i][j]);
							this.cmd("SetText", this.pathTableID[i][j], this.pathTable[i][j]);
							this.cmd("Delete", moveLabel1ID);
							this.cmd("Delete", moveLabel2ID);
						}
						else
						{
							this.cmd("SetText", messageID, "!("+this.getCostLabel(this.costTable[i][k], true) + " + " + this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true) + ")");
							this.cmd("Step");
							
						}
						
					}
					else
					{
						this.cmd("SetText", messageID, "!("+this.getCostLabel(this.costTable[i][k], true) + " + " + this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true) + ")");								
						this.cmd("Step");
					}
					this.cmd("SetTextColor", this.costTableID[i][k], "#000000");
					this.cmd("SetTextColor", this.costTableID[k][j], "#000000");
					this.cmd("SetTextColor", this.costTableID[i][j], "#000000");
					this.cmd("Disconnect",this.node1ID, this.node2ID)
					this.cmd("Disconnect",this.node2ID, this.node3ID)
					this.cmd("Disconnect",this.node1ID, this.node3ID)
					this.cmd("SetHighlight", this.costTableID[i][k], 0);
					this.cmd("SetHighlight", this.costTableID[k][j], 0);
					this.cmd("SetHighlight", this.costTableID[i][j], 0);
				}
			}
			
			
		}
	}
	this.cmd("Delete", this.node1ID);
	this.cmd("Delete", this.node2ID);
	this.cmd("Delete", this.node3ID);
	this.cmd("Delete", messageID);
	this.nextIndex = oldIndex;
	
	
	
	return this.commands
}


Floyd.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	Floyd.superclass.enableUI.call(this,event);
}
Floyd.prototype.disableUI = function(event)
{
	this.startButton.disabled = true;	
	Floyd.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Floyd(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function Kruskal(am, w, h)
{
	// call superclass' constructor, which calls init
	Kruskal.superclass.constructor.call(this, am, w, h);
}

Kruskal.inheritFrom(Graph);



Kruskal.HIGHLIGHT_CIRCLE_COLOR = "#000000";

 Kruskal.SET_ARRAY_ELEM_WIDTH = 25;
 Kruskal.SET_ARRAY_ELEM_HEIGHT = 25;
 Kruskal.SET_ARRAY_START_X = 50;
 Kruskal.SET_ARRAY_START_Y = 130;

 Kruskal.EDGE_LIST_ELEM_WIDTH = 40;
 Kruskal.EDGE_LIST_ELEM_HEIGHT = 40;
 Kruskal.EDGE_LIST_COLUMN_WIDTH = 100;
 Kruskal.EDGE_LIST_MAX_PER_COLUMN = 10;

 Kruskal.EDGE_LIST_START_X = 150;
 Kruskal.EDGE_LIST_START_Y = 130;


 Kruskal.FIND_LABEL_1_X = 30;
 Kruskal.FIND_LABEL_2_X = 100;
 Kruskal.FIND_LABEL_1_Y = 30;
 Kruskal.FIND_LABEL_2_Y = Kruskal.FIND_LABEL_1_Y;

 Kruskal.MESSAGE_LABEL_X = 30;
 Kruskal.MESSAGE_LABEL_Y = 50;

 Kruskal.HIGHLIGHT_CIRCLE_COLOR_1 = "#FFAAAA";
 Kruskal.HIGHLIGHT_CIRCLE_COLOR_2 = "#FF0000";


Kruskal.prototype.addControls =  function()
{		
	
	this.startButton = this.addControlToAlgorithmBar("Button", "Run Kruskal");
	this.startButton.onclick = this.startCallback.bind(this);

	Kruskal.superclass.addControls.call(this, false);
}	


Kruskal.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = true;
	Kruskal.superclass.init.call(this, am, w, h, false, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		

Kruskal.prototype.setup = function() 
{
	Kruskal.superclass.setup.call(this);
	this.messageID = new Array();
	this.commands = new Array();
	this.setID = new Array(this.size);
	this.setIndexID = new Array(this.size);
	this.setData = new Array(this.size);
	
	var i;
	for (i = 0; i < this.size; i++)
	{
		this.setID[i] = this.nextIndex++;
		this.setIndexID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.setID[i], "-1", Kruskal.SET_ARRAY_ELEM_WIDTH, Kruskal.SET_ARRAY_ELEM_HEIGHT, Kruskal.SET_ARRAY_START_X, Kruskal.SET_ARRAY_START_Y + i*Kruskal.SET_ARRAY_ELEM_HEIGHT);
		this.cmd("CreateLabel", this.setIndexID[i], i, Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH ,Kruskal.SET_ARRAY_START_Y + i*Kruskal.SET_ARRAY_ELEM_HEIGHT);
		this.cmd("SetForegroundColor",  this.setIndexID[i], Graph.VERTEX_INDEX_COLOR);				
	}
	this.cmd("CreateLabel", this.nextIndex++, "Disjoint Set", Kruskal.SET_ARRAY_START_X - 1 * Kruskal.SET_ARRAY_ELEM_WIDTH, Kruskal.SET_ARRAY_START_Y - Kruskal.SET_ARRAY_ELEM_HEIGHT * 1.5, 0);
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}

Kruskal.prototype.startCallback = function(event)
{
	
	this.implementAction(this.doKruskal.bind(this),"");
	
}



Kruskal.prototype.disjointSetFind = function(valueToFind, highlightCircleID)
{
	this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
	this.cmd("Step");
	while (this.setData[valueToFind] >= 0)
	{
		this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
		this.cmd("Move", highlightCircleID,  Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH ,Kruskal.SET_ARRAY_START_Y + this.setData[valueToFind]*Kruskal.SET_ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		valueToFind =  this.setData[valueToFind];
		this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
		this.cmd("Step");		
	}
	this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
	return valueToFind;
}



Kruskal.prototype.doKruskal = function(ignored)
{
	this.commands = new Array();
	
	this.edgesListLeftID = new Array();
	this.edgesListRightID = new Array();
	this.edgesListLeft = new Array();
	this.edgesListRight = new Array();
	
	var i;
	var j;
	for (i = 0; i < this.size; i++)
	{
		this.setData[i] = -1;
		this.cmd("SetText", this.setID[i], "-1");
	}
	
	this.recolorGraph();
	
	// Create Edge List
	var top;
	for (i = 0; i < this.size; i++)
	{
		for (j = i+1; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				this.edgesListLeftID.push(this.nextIndex++);
				this.edgesListRightID.push(this.nextIndex++);
				top = this.edgesListLeftID.length - 1;
				this.edgesListLeft.push(i);
				this.edgesListRight.push(j);
				this.cmd("CreateLabel", this.edgesListLeftID[top], i, Kruskal.EDGE_LIST_START_X + Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
					Kruskal.EDGE_LIST_START_Y + (top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT);
				this.cmd("CreateLabel", this.edgesListRightID[top], j, Kruskal.EDGE_LIST_START_X +Kruskal.EDGE_LIST_ELEM_WIDTH +  Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
					Kruskal.EDGE_LIST_START_Y + (top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT);
				this.cmd("Connect", this.edgesListLeftID[top], this.edgesListRightID[top], Graph.EDGE_COLOR, 0, 0, this.adj_matrix[i][j])
			}					
		}
	}
	this.cmd("Step");
	
	// Sort edge list based on edge cost
	var edgeCount = this.edgesListLeftID.length;
	var tmpLeftID;
	var tmpRightID;
	var tmpLeft;
	var tmpRight;
	for (i = 1; i < edgeCount; i++)
	{
		tmpLeftID = this.edgesListLeftID[i];
		tmpRightID = this.edgesListRightID[i];
		tmpLeft = this.edgesListLeft[i];
		tmpRight = this.edgesListRight[i];
		j = i;
		while (j > 0 && this.adj_matrix[this.edgesListLeft[j-1]][this.edgesListRight[j-1]] > this.adj_matrix[tmpLeft][tmpRight])
		{
			this.edgesListLeft[j] = this.edgesListLeft[j-1];
			this.edgesListRight[j] = this.edgesListRight[j-1];
			this.edgesListLeftID[j] = this.edgesListLeftID[j-1];
			this.edgesListRightID[j] = this.edgesListRightID[j-1];
			j = j -1
		}
		this.edgesListLeft[j] = tmpLeft;				
		this.edgesListRight[j] = tmpRight;			
		this.edgesListLeftID[j] = tmpLeftID;
		this.edgesListRightID[j] = tmpRightID;				
	}
	for (i = 0; i < edgeCount; i++)
	{
		this.cmd("Move", this.edgesListLeftID[i], Kruskal.EDGE_LIST_START_X + Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
			Kruskal.EDGE_LIST_START_Y + (i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT);
		this.cmd("Move",  this.edgesListRightID[i], Kruskal.EDGE_LIST_START_X +Kruskal.EDGE_LIST_ELEM_WIDTH +  Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
			Kruskal.EDGE_LIST_START_Y + (i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT);
		
	}
	
	this.cmd("Step");
	
	var findLabelLeft = this.nextIndex++;
	var findLabelRight = this.nextIndex++;
	var highlightCircle1 = this.nextIndex++;
	var highlightCircle2 = this.nextIndex++;
	var moveLabelID = this.nextIndex++;
	var messageLabelID = this.nextIndex++;
	
	var edgesAdded = 0;
	var nextListIndex = 0;
	this.cmd("CreateLabel", findLabelLeft, "",  Kruskal.FIND_LABEL_1_X, Kruskal.FIND_LABEL_1_Y, 0);
	this.cmd("CreateLabel", findLabelRight, "",  Kruskal.FIND_LABEL_2_X, Kruskal.FIND_LABEL_2_Y, 0);
	
	while (edgesAdded < this.size - 1 && nextListIndex < edgeCount)
	{				
		this.cmd("SetEdgeHighlight", this.edgesListLeftID[nextListIndex],this.edgesListRightID[nextListIndex], 1);
		
		this.highlightEdge(this.edgesListLeft[nextListIndex], this.edgesListRight[nextListIndex], 1)
		this.highlightEdge(this.edgesListRight[nextListIndex], this.edgesListLeft[nextListIndex], 1)
	
		this.cmd("SetText", findLabelLeft, "find(" + String(this.edgesListLeft[nextListIndex]) + ") = ");
		
		
		this.cmd("CreateHighlightCircle", highlightCircle1, Kruskal.HIGHLIGHT_CIRCLE_COLOR_1,  Kruskal.EDGE_LIST_START_X + Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH, 
			Kruskal.EDGE_LIST_START_Y + (nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT, 15);
		this.cmd("Move", highlightCircle1,  Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH ,Kruskal.SET_ARRAY_START_Y + this.edgesListLeft[nextListIndex]*Kruskal.SET_ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		
		var left = this.disjointSetFind(this.edgesListLeft[nextListIndex], highlightCircle1);
		this.cmd("SetText", findLabelLeft, "find(" + String(this.edgesListLeft[nextListIndex]) + ") = " + String(left));
		
		
		this.cmd("SetText", findLabelRight, "find(" + String(this.edgesListRight[nextListIndex]) + ") = ");
		
		this.cmd("CreateHighlightCircle", highlightCircle2, Kruskal.HIGHLIGHT_CIRCLE_COLOR_2,  Kruskal.EDGE_LIST_START_X +Kruskal.EDGE_LIST_ELEM_WIDTH  + Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH, 
			Kruskal.EDGE_LIST_START_Y + (nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT, 15);
		
		
		this.cmd("Move", highlightCircle2,  Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH ,Kruskal.SET_ARRAY_START_Y + this.edgesListRight[nextListIndex]*Kruskal.SET_ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		
		var right = this.disjointSetFind(this.edgesListRight[nextListIndex], highlightCircle2);
		this.cmd("SetText", findLabelRight, "find(" + String(this.edgesListRight[nextListIndex]) + ") = " + String(right));
		
		this.cmd("Step");
		
		if (left != right)
		{
			this.cmd("CreateLabel", messageLabelID, "Vertices in different trees.  Add edge to tree: Union(" + String(left) + "," + String(right) + ")",  Kruskal.MESSAGE_LABEL_X, Kruskal.MESSAGE_LABEL_Y, 0);
			this.cmd("Step");
			this.highlightEdge(this.edgesListLeft[nextListIndex], this.edgesListRight[nextListIndex], 1)
			this.highlightEdge(this.edgesListRight[nextListIndex], this.edgesListLeft[nextListIndex], 1)
			edgesAdded++;
			this.setEdgeColor(this.edgesListLeft[nextListIndex], this.edgesListRight[nextListIndex], "#FF0000");				
			this.setEdgeColor( this.edgesListRight[nextListIndex], this.edgesListLeft[nextListIndex], "#FF0000");
			if (this.setData[left] < this.setData[right])
			{
				this.cmd("SetText", this.setID[right], "")
				this.cmd("CreateLabel", moveLabelID, this.setData[right], Kruskal.SET_ARRAY_START_X, Kruskal.SET_ARRAY_START_Y + right*Kruskal.SET_ARRAY_ELEM_HEIGHT);
				this.cmd("Move", moveLabelID,  Kruskal.SET_ARRAY_START_X, Kruskal.SET_ARRAY_START_Y + left*Kruskal.SET_ARRAY_ELEM_HEIGHT);
				this.cmd("Step");
				this.cmd("Delete", moveLabelID);
				this.setData[left] = this.setData[left] + this.setData[right]
				this.setData[right] = left;
			}
			else
			{
				this.cmd("SetText", this.setID[left], "")
				this.cmd("CreateLabel", moveLabelID, this.setData[left], Kruskal.SET_ARRAY_START_X, Kruskal.SET_ARRAY_START_Y + left*Kruskal.SET_ARRAY_ELEM_HEIGHT);
				this.cmd("Move", moveLabelID,  Kruskal.SET_ARRAY_START_X, Kruskal.SET_ARRAY_START_Y + right*Kruskal.SET_ARRAY_ELEM_HEIGHT);
				this.cmd("Step");
				this.cmd("Delete", moveLabelID);
				this.setData[right] = this.setData[right] + this.setData[left]
				this.setData[left] = right;
			}
			this.cmd("SetText", this.setID[left], this.setData[left]);
			this.cmd("SetText", this.setID[right], this.setData[right]);
		}
		else
		{
			this.cmd("CreateLabel", messageLabelID, "Vertices in the same tree.  Skip edge",  Kruskal.MESSAGE_LABEL_X, Kruskal.MESSAGE_LABEL_Y, 0);
			this.cmd("Step");
			
		}
		
		this.highlightEdge(this.edgesListLeft[nextListIndex], this.edgesListRight[nextListIndex], 0)
		this.highlightEdge(this.edgesListRight[nextListIndex], this.edgesListLeft[nextListIndex], 0)
		
		this.cmd("Delete", messageLabelID);
		this.cmd("Delete", highlightCircle1);
		this.cmd("Delete", highlightCircle2);
		
		
		this.cmd("Delete", this.edgesListLeftID[nextListIndex]);
		this.cmd("Delete", this.edgesListRightID[nextListIndex]);
		this.cmd("SetText", findLabelLeft, "");
		this.cmd("SetText", findLabelRight, "");
		nextListIndex++;
		
	}
	this.cmd("Delete", findLabelLeft);
	this.cmd("Delete", findLabelRight);
	
	
	
	return this.commands
	
}



Kruskal.prototype.reset = function()
{
	this.messageID = new Array();
}



Kruskal.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	
	
	Kruskal.superclass.enableUI.call(this,event);
}
Kruskal.prototype.disableUI = function(event)
{
	this.startButton.disabled = true;
	
	Kruskal.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Kruskal(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function TopoSortDFS(am, w, h)
{
	// call superclass' constructor, which calls init
	TopoSortDFS.superclass.constructor.call(this, am, w, h);
}

TopoSortDFS.inheritFrom(Graph);



TopoSortDFS.ORDERING_INITIAL_X = 300;
TopoSortDFS.ORDERING_INITIAL_Y = 70;
TopoSortDFS.ORDERING_DELTA_Y = 20;

TopoSortDFS.D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
TopoSortDFS.F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];



TopoSortDFS.D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
TopoSortDFS.F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];

TopoSortDFS.D_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];

TopoSortDFS.F_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];



TopoSortDFS.D_Y_POS_LARGE = [037, 037, 037, 037,
									137, 137, 137,
									237, 237, 237, 237, 
									337, 337, 337, 
									437,  437, 437, 437];

TopoSortDFS.F_Y_POS_LARGE = [62, 62, 62, 62,
									162, 162, 162,
									262, 262, 262, 262, 
									362, 362, 362, 
									462,  462, 462, 462];


TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR = "#000000";
TopoSortDFS.DFS_TREE_COLOR = "#0000FF";



TopoSortDFS.prototype.addControls =  function()
{		
	this.startButton = this.addControlToAlgorithmBar("Button", "Do Topological Sort");
	this.startButton.onclick = this.startCallback.bind(this);
	TopoSortDFS.superclass.addControls.call(this, false);
}	


TopoSortDFS.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = false;
	TopoSortDFS.superclass.init.call(this, am, w, h, true, true); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		
TopoSortDFS.prototype.setup = function() 
{
	TopoSortDFS.superclass.setup.call(this); 
	this.messageID = new Array();
	this.animationManager.setAllLayers([0, this.currentLayer]);
	
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++
	this.initialIndex = this.nextIndex;
	
	this.old_adj_matrix = new Array(this.size);
	this.old_adj_list_list = new Array(this.size);
	this.old_adj_list_index = new Array(this.size);
	this.old_adj_list_edges = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.old_adj_matrix[i] = new Array(this.size);
		this.old_adj_list_index[i] = this.adj_list_index[i];
		this.old_adj_list_list[i] = this.adj_list_list[i];
		this.old_adj_list_edges[i] = new Array(this.size);
		for (var j = 0; j < this.size; j++)
		{
			this.old_adj_matrix[i][j] = this.adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.old_adj_list_edges[i][j] = this.adj_list_edges[i][j];
			}	
			
		}
	}
}
		
		
TopoSortDFS.prototype.startCallback = function(event)
{
			this.implementAction(this.doTopoSort.bind(this),"");
}



TopoSortDFS.prototype.doTopoSort = function(ignored)
{		
	this.visited = new Array(this.size);
	this.commands = new Array();
	this.topoOrderArrayL = new Array();
	this.topoOrderArrayAL = new Array();
	this.topoOrderArrayAM = new Array();
	var i;
	if (this.messageID != null)
	{
		for (i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i], 1);
		}
	}
	this.rebuildEdges(); // HMMM.. do I want this?
	this.messageID = new Array();
	
	var headerID = this.nextIndex++;
	this.messageID.push(headerID);
	this.cmd("CreateLabel", headerID, "Topological Order",  TopoSortDFS.ORDERING_INITIAL_X, TopoSortDFS.ORDERING_INITIAL_Y - 1.5*TopoSortDFS.ORDERING_DELTA_Y);

	
	headerID = this.nextIndex++;
	this.messageID.push(headerID);
	this.cmd("CreateRectangle", headerID, "", 100, 0, TopoSortDFS.ORDERING_INITIAL_X, TopoSortDFS.ORDERING_INITIAL_Y - TopoSortDFS.ORDERING_DELTA_Y,"center","center");
	
	
	
	this.d_timesID_L = new Array(this.size);
	this.f_timesID_L = new Array(this.size);
	this.d_timesID_AL = new Array(this.size);
	this.f_timesID_AL = new Array(this.size);
	this.d_times = new Array(this.size);
	this.f_times = new Array(this.size);
	this.currentTime = 1
	for (i = 0; i < this.size; i++)
	{
		this.d_timesID_L[i] = this.nextIndex++;
		this.f_timesID_L[i] = this.nextIndex++;
		this.d_timesID_AL[i] = this.nextIndex++;
		this.f_timesID_AL[i] = this.nextIndex++;
	}
	
	this.messageY = 30;
	var vertex;
	for (vertex = 0; vertex < this.size; vertex++)
	{
		if (!this.visited[vertex])
		{
			this.cmd("CreateHighlightCircle", this.highlightCircleL, TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
			this.cmd("SetLayer", this.highlightCircleL, 1);
			this.cmd("CreateHighlightCircle", this.highlightCircleAL, TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
			this.cmd("SetLayer", this.highlightCircleAL, 2);
			
			this.cmd("CreateHighlightCircle", this.highlightCircleAM, TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
			this.cmd("SetLayer", this.highlightCircleAM, 3);
			
			if (vertex > 0)
			{
				var breakID = this.nextIndex++;
				this.messageID.push(breakID);
				this.cmd("CreateRectangle", breakID, "", 200, 0, 10, this.messageY,"left","bottom");
				this.messageY = this.messageY + 20;			
			}
			this.dfsVisit(vertex, 10, false);
			this.cmd("Delete", this.highlightCircleL, 2);
			this.cmd("Delete", this.highlightCircleAL, 3);
			this.cmd("Delete", this.highlightCircleAM, 4);
		}
	}

	return this.commands
	
}


TopoSortDFS.prototype.setup_large = function()
{
	this.d_x_pos = TopoSortDFS.D_X_POS_LARGE;
	this.d_y_pos = TopoSortDFS.D_Y_POS_LARGE;
	this.f_x_pos = TopoSortDFS.F_X_POS_LARGE;
	this.f_y_pos = TopoSortDFS.F_Y_POS_LARGE;
	
	TopoSortDFS.superclass.setup_large.call(this); 
}		
TopoSortDFS.prototype.setup_small = function()
{
	
	this.d_x_pos = TopoSortDFS.D_X_POS_SMALL;
	this.d_y_pos = TopoSortDFS.D_Y_POS_SMALL;
	this.f_x_pos = TopoSortDFS.F_X_POS_SMALL;
	this.f_y_pos = TopoSortDFS.F_Y_POS_SMALL;

	TopoSortDFS.superclass.setup_small.call(this); 
}

TopoSortDFS.prototype.dfsVisit = function(startVertex, messageX, printCCNum)
{
	var nextMessage = this.nextIndex++;
	this.messageID.push(nextMessage);
	this.cmd("CreateLabel",nextMessage, "DFS(" +  String(startVertex) +  ")", messageX, this.messageY, 0);
	
	this.messageY = this.messageY + 20;
	if (!this.visited[startVertex])
	{
		this.d_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.d_timesID_L[startVertex], "d = " + String(this.d_times[startVertex]), this.d_x_pos[startVertex], this.d_y_pos[startVertex]);				
		this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height - 1/4*this.adj_list_height);
		this.cmd("SetLayer",  this.d_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.d_timesID_AL[startVertex], 2);
		
		this.visited[startVertex] = true;
		this.cmd("Step");
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[startVertex][neighbor] > 0)
			{
				this.highlightEdge(startVertex, neighbor, 1);
				if (this.visited[neighbor])
				{
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Vertex " + String(neighbor) + " already this.visited.", messageX, this.messageY, 0);
				}
				this.cmd("Step");
				this.highlightEdge(startVertex, neighbor, 0);
				if (this.visited[neighbor])
				{
					this.cmd("Delete", nextMessage, "DNM");
				}
				
				if (!this.visited[neighbor])
				{
					this.cmd("Disconnect", this.circleID[startVertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[startVertex], this.circleID[neighbor], TopoSortDFS.DFS_TREE_COLOR, this.curve[startVertex][neighbor], 1, "");
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + neighbor*this.adj_list_height);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + neighbor*this.adj_matrix_height);
					
					this.cmd("Step");
					this.dfsVisit(neighbor, messageX + 10, printCCNum);							
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Returning from recursive call: DFS(" + String(neighbor) + ")", messageX + 20, this.messageY, 0);
					
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[startVertex], this.y_pos_logical[startVertex]);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
					this.cmd("Step");
					this.cmd("Delete", nextMessage, 18);
				}
				this.cmd("Step");
				
				
				
			}
			
		}
			
		
		this.f_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.f_timesID_L[startVertex],"f = " + String(this.f_times[startVertex]), this.f_x_pos[startVertex], this.f_y_pos[startVertex]);
		this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height + 1/4*this.adj_list_height);
		
		this.cmd("SetLayer",  this.f_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.f_timesID_AL[startVertex], 2);
		
		this.cmd("Step");
		
		var i;
		for (i = this.topoOrderArrayL.length; i > 0; i--)
		{
			this.topoOrderArrayL[i] = this.topoOrderArrayL[i-1];
			this.topoOrderArrayAL[i] = this.topoOrderArrayAL[i-1];
			this.topoOrderArrayAM[i] = this.topoOrderArrayAM[i-1];
		}		
		
		var nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex, this.x_pos_logical[startVertex],  this.y_pos_logical[startVertex]);
		this.cmd("SetLayer", nextVertexLabel, 1);
		this.topoOrderArrayL[0] = nextVertexLabel;
		
		nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
		this.cmd("SetLayer", nextVertexLabel, 2);
		this.topoOrderArrayAL[0] = nextVertexLabel;
		
		nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex,this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
		this.cmd("SetLayer", nextVertexLabel, 3);
		this.topoOrderArrayAM[0] = nextVertexLabel;
		
		for (i = 0; i < this.topoOrderArrayL.length; i++)
		{
			this.cmd("Move", this.topoOrderArrayL[i], TopoSortDFS.ORDERING_INITIAL_X, 
					 TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y);
			this.cmd("Move", this.topoOrderArrayAL[i], TopoSortDFS.ORDERING_INITIAL_X, 
					 TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y);
			this.cmd("Move", this.topoOrderArrayAM[i], TopoSortDFS.ORDERING_INITIAL_X, 
					 TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y);
			
		}
		this.cmd("Step");
		
		
		
	}
	
}


TopoSortDFS.prototype.reset = function()
{
	// TODO:  Fix undo messing with setup vars.
	this.messageID = new Array();
	this.nextIndex = this.initialIndex;
	for (var i = 0; i < this.size; i++)
	{
		this.adj_list_list[i] = this.old_adj_list_list[i];
		this.adj_list_index[i] = this.old_adj_list_index[i];

		for (var j = 0; j < this.size; j++)
		{
			this.adj_matrix[i][j] = this.old_adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.adj_list_edges[i][j] = this.old_adj_list_edges[i][j];
			}	
		}
	}

}



TopoSortDFS.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	
	TopoSortDFS.superclass.enableUI.call(this,event);
}
TopoSortDFS.prototype.disableUI = function(event)
{
	
	this.startButton.disabled = true;
	
	TopoSortDFS.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new TopoSortDFS(animManag, canvas.width, canvas.height);
}

// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function TopoSortIndegree(am, w, h)
{
	// call superclass' constructor, which calls init
	TopoSortIndegree.superclass.constructor.call(this, am, w, h);
}

TopoSortIndegree.inheritFrom(Graph);




TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH = 25;
TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT = 25;
TopoSortIndegree.INDEGREE_ARRAY_START_X = 50;
TopoSortIndegree.INDEGREE_ARRAY_START_Y = 60;


TopoSortIndegree.STACK_START_X = TopoSortIndegree.INDEGREE_ARRAY_START_X + 100;
TopoSortIndegree.STACK_START_Y = TopoSortIndegree.INDEGREE_ARRAY_START_Y;
TopoSortIndegree.STACK_HEIGHT = TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT;


TopoSortIndegree.TOPO_ARRAY_START_X = TopoSortIndegree.STACK_START_X + 150;
TopoSortIndegree.TOPO_ARRAY_START_Y = TopoSortIndegree.INDEGREE_ARRAY_START_Y;
TopoSortIndegree.TOPO_HEIGHT = TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT;


TopoSortIndegree.MESSAGE_LABEL_1_X = 70;
TopoSortIndegree.MESSAGE_LABEL_1_Y = 10;

TopoSortIndegree.MESSAGE_LABEL_2_X = 70;
TopoSortIndegree.MESSAGE_LABEL_2_Y = 40;


TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR = "#000000";
TopoSortIndegree.MESSAGE_COLOR = "#0000FF";


TopoSortIndegree.prototype.addControls =  function()
{		
	this.startButton = this.addControlToAlgorithmBar("Button", "Do Topological Sort");
	this.startButton.onclick = this.startCallback.bind(this);
	TopoSortIndegree.superclass.addControls.call(this, false);
}	


TopoSortIndegree.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = false;
	TopoSortIndegree.superclass.init.call(this, am, w, h, true, true); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		
TopoSortIndegree.prototype.setup = function() 
{
	TopoSortIndegree.superclass.setup.call(this); 
	this.messageID = new Array();
	this.animationManager.setAllLayers([0, this.currentLayer]);
	
	
	this.messageID = new Array();
	this.commands = new Array();
	this.indegreeID = new Array(this.size);
	this.setIndexID = new Array(this.size);
	this.indegree = new Array(this.size);
	this.orderID = new Array(this.size);
	
	
	
	for (var i = 0; i < this.size; i++)
	{
		this.indegreeID[i] = this.nextIndex++;
		this.setIndexID[i] = this.nextIndex++;
		this.orderID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.orderID[i], "", 0, 0); // HACK!!
		this.cmd("CreateRectangle", this.indegreeID[i], " ", TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH, TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT, TopoSortIndegree.INDEGREE_ARRAY_START_X, TopoSortIndegree.INDEGREE_ARRAY_START_Y + i*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
		this.cmd("CreateLabel", this.setIndexID[i], i, TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + i*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
		this.cmd("SetForegroundColor",  this.setIndexID[i], Graph.VERTEX_INDEX_COLOR);				
	}
	this.cmd("CreateLabel", this.nextIndex++, "Indegree", TopoSortIndegree.INDEGREE_ARRAY_START_X - 1 * TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH, TopoSortIndegree.INDEGREE_ARRAY_START_Y - TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT * 1.5, 0);
	
	
	this.message1ID = this.nextIndex++;
	this.message2ID = this.nextIndex++;
	this.cmd("CreateLabel", this.message1ID, "", TopoSortIndegree.MESSAGE_LABEL_1_X, TopoSortIndegree.MESSAGE_LABEL_1_Y, 0);
	this.cmd("SetTextColor", this.message1ID, TopoSortIndegree.MESSAGE_COLOR);
	this.cmd("CreateLabel", this.message2ID, "", TopoSortIndegree.MESSAGE_LABEL_2_X, TopoSortIndegree.MESSAGE_LABEL_2_Y);
	this.cmd("SetTextColor", this.message2ID, TopoSortIndegree.MESSAGE_COLOR);
	
	this.stackLabelID = this.nextIndex++;
	this.topoLabelID = this.nextIndex++;
	this.cmd("CreateLabel", this.stackLabelID, "", TopoSortIndegree.STACK_START_X, TopoSortIndegree.STACK_START_Y - TopoSortIndegree.STACK_HEIGHT);
	this.cmd("CreateLabel", this.topoLabelID, "", TopoSortIndegree.TOPO_ARRAY_START_X, TopoSortIndegree.TOPO_ARRAY_START_Y - TopoSortIndegree.TOPO_HEIGHT);
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++;
	
	this.initialIndex = this.nextIndex;
}
		
		
TopoSortIndegree.prototype.startCallback = function(event)
{
	this.implementAction(this.doTopoSort.bind(this),"");
}



TopoSortIndegree.prototype.doTopoSort = function(ignored)
{
	this.commands = new Array();
	var stack = new Array(this.size);
	var stackID = new Array(this.size);
	var stackTop = 0;
	
	var vertex;
	for (var vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("SetText", this.indegreeID[vertex], "0");
		this.indegree[vertex] = 0;
		stackID[vertex] = this.nextIndex++;
		this.cmd("Delete", this.orderID[vertex]);
	}
	
	this.cmd("SetText", this.message1ID, "Calculate this.indegree of all verticies by going through every edge of the graph");
	this.cmd("SetText", this.topoLabelID, "");
	this.cmd("SetText", this.stackLabelID, "");
	for (vertex = 0; vertex < this.size; vertex++)
	{
		var adjListIndex = 0;
		var neighbor;
		for (neighbor = 0; neighbor < this.size; neighbor++)
			if (this.adj_matrix[vertex][neighbor] >= 0)
			{
				adjListIndex++;
				this.highlightEdge(vertex, neighbor, 1);
				this.cmd("Step");
				
				this.cmd("CreateHighlightCircle", this.highlightCircleL, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
				this.cmd("SetLayer", this.highlightCircleL, 1);
				this.cmd("CreateHighlightCircle", this.highlightCircleAL, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start + adjListIndex * (this.adj_list_width + this.adj_list_spacing), this.adj_list_y_start + vertex*this.adj_list_height);
				this.cmd("SetLayer", this.highlightCircleAL, 2);
				this.cmd("CreateHighlightCircle", this.highlightCircleAM, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  + neighbor * this.adj_matrix_width, this.adj_matrix_y_start - this.adj_matrix_height);
				this.cmd("SetLayer", this.highlightCircleAM, 3);
				
				this.cmd("Move", this.highlightCircleL,TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + neighbor*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				
				this.cmd("Move", this.highlightCircleAL, TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + neighbor*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				this.cmd("Move", this.highlightCircleAM,TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + neighbor*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				
				this.cmd("Step");
				this.indegree[neighbor] = this.indegree[neighbor] + 1;
				this.cmd("SetText", this.indegreeID[neighbor], this.indegree[neighbor]);
				this.cmd("SetTextColor", this.indegreeID[neighbor],  "#FF0000");
				this.cmd("Step");
				this.cmd("Delete", this.highlightCircleL);
				this.cmd("Delete", this.highlightCircleAL);
				this.cmd("Delete", this.highlightCircleAM);
				this.cmd("SetTextColor", this.indegreeID[neighbor], Graph.EDGE_COLOR);
				this.highlightEdge(vertex, neighbor, 0);
			}
		
	}
	this.cmd("SetText", this.message1ID, "Collect all vertices with 0 this.indegree onto a stack");
	this.cmd("SetText", this.stackLabelID, "Zero Indegree Vertices");
	
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("SetHighlight", this.indegreeID[vertex], 1);
		this.cmd("Step");
		if (this.indegree[vertex] == 0)
		{
			stack[stackTop] =vertex;
			this.cmd("CreateLabel", stackID[stackTop], vertex, TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH, TopoSortIndegree.INDEGREE_ARRAY_START_Y + vertex*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
			this.cmd("Move", stackID[stackTop], TopoSortIndegree.STACK_START_X, TopoSortIndegree.STACK_START_Y + stackTop * TopoSortIndegree.STACK_HEIGHT);
			this.cmd("Step")
			stackTop++;
		}
		this.cmd("SetHighlight", this.indegreeID[vertex], 0);
		
	}
	
	this.cmd("SetText", this.topoLabelID, "Topological Order");
	
	
	var nextInOrder = 0;
	while (stackTop >  0)
	{
		stackTop--;
		var nextElem = stack[stackTop];
		this.cmd("SetText", this.message1ID, "Pop off top vertex with this.indegree 0, add to topological sort");
		this.cmd("CreateLabel", this.orderID[nextInOrder], nextElem, TopoSortIndegree.STACK_START_X, TopoSortIndegree.STACK_START_Y + stackTop * TopoSortIndegree.STACK_HEIGHT);
		this.cmd("Delete", stackID[stackTop]);
		this.cmd("Step");
		this.cmd("Move", this.orderID[nextInOrder], TopoSortIndegree.TOPO_ARRAY_START_X, TopoSortIndegree.TOPO_ARRAY_START_Y + nextInOrder * TopoSortIndegree.TOPO_HEIGHT);
		this.cmd("Step");
		this.cmd("SetText", this.message1ID, "Find all neigbors of vertex " + String(nextElem) + ", decrease their this.indegree.  If this.indegree becomes 0, add to stack");
		this.cmd("SetHighlight", this.circleID[nextElem], 1);
		this.cmd("Step")
		
		adjListIndex = 0;
		
		for (vertex = 0; vertex < this.size; vertex++)
		{
			if (this.adj_matrix[nextElem][vertex] >= 0)
			{
				adjListIndex++;
				this.highlightEdge(nextElem, vertex, 1);
				this.cmd("Step");
				
				this.cmd("CreateHighlightCircle", this.highlightCircleL, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
				this.cmd("SetLayer", this.highlightCircleL, 1);
				this.cmd("CreateHighlightCircle", this.highlightCircleAL, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start + adjListIndex * (this.adj_list_width + this.adj_list_spacing), this.adj_list_y_start + nextElem*this.adj_list_height);
				this.cmd("SetLayer", this.highlightCircleAL, 2);
				this.cmd("CreateHighlightCircle", this.highlightCircleAM, TopoSortIndegree.HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  + vertex * this.adj_matrix_width, this.adj_matrix_y_start - this.adj_matrix_height);
				this.cmd("SetLayer", this.highlightCircleAM, 3);
				
				this.cmd("Move", this.highlightCircleL,TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + vertex*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				
				this.cmd("Move", this.highlightCircleAL, TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + vertex*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				this.cmd("Move", this.highlightCircleAM,TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH ,TopoSortIndegree.INDEGREE_ARRAY_START_Y + vertex*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
				
				this.cmd("Step");
				this.indegree[vertex] = this.indegree[vertex] - 1;
				this.cmd("SetText", this.indegreeID[vertex], this.indegree[vertex]);
				this.cmd("SetTextColor", this.indegreeID[vertex], "#FF0000");
				this.cmd("Step");
				if (this.indegree[vertex] == 0)
				{
					stack[stackTop] =vertex;
					this.cmd("CreateLabel", stackID[stackTop], vertex, TopoSortIndegree.INDEGREE_ARRAY_START_X - TopoSortIndegree.INDEGREE_ARRAY_ELEM_WIDTH, TopoSortIndegree.INDEGREE_ARRAY_START_Y + vertex*TopoSortIndegree.INDEGREE_ARRAY_ELEM_HEIGHT);
					this.cmd("Move", stackID[stackTop], TopoSortIndegree.STACK_START_X, TopoSortIndegree.STACK_START_Y + stackTop * TopoSortIndegree.STACK_HEIGHT);
					this.cmd("Step");
					stackTop++;							
				}
				this.cmd("Delete", this.highlightCircleL);
				this.cmd("Delete", this.highlightCircleAL);
				this.cmd("Delete", this.highlightCircleAM);
				this.cmd("SetTextColor", this.indegreeID[vertex], Graph.EDGE_COLOR);
				this.highlightEdge(nextElem, vertex, 0);
				
			}
		}
		this.cmd("SetHighlight", this.circleID[nextElem], 0);
		
		nextInOrder++;
		
		
		
	}
	
	
	this.cmd("SetText", this.message1ID, "");
	this.cmd("SetText", this.stackLabelID, "");
	
	return this.commands
	
}


TopoSortIndegree.prototype.setup_large = function()
{
	this.d_x_pos = TopoSortIndegree.D_X_POS_LARGE;
	this.d_y_pos = TopoSortIndegree.D_Y_POS_LARGE;
	this.f_x_pos = TopoSortIndegree.F_X_POS_LARGE;
	this.f_y_pos = TopoSortIndegree.F_Y_POS_LARGE;
	
	TopoSortIndegree.superclass.setup_large.call(this); 
}		
TopoSortIndegree.prototype.setup_small = function()
{
	
	this.d_x_pos = TopoSortIndegree.D_X_POS_SMALL;
	this.d_y_pos = TopoSortIndegree.D_Y_POS_SMALL;
	this.f_x_pos = TopoSortIndegree.F_X_POS_SMALL;
	this.f_y_pos = TopoSortIndegree.F_Y_POS_SMALL;

	TopoSortIndegree.superclass.setup_small.call(this); 
}

TopoSortIndegree.prototype.dfsVisit = function(startVertex, messageX, printCCNum)
{
	var nextMessage = this.nextIndex++;
	this.messageID.push(nextMessage);
	this.cmd("CreateLabel",nextMessage, "DFS(" +  String(startVertex) +  ")", messageX, this.messageY, 0);
	
	this.messageY = this.messageY + 20;
	if (!this.visited[startVertex])
	{
		this.d_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.d_timesID_L[startVertex], "d = " + String(this.d_times[startVertex]), this.d_x_pos[startVertex], this.d_y_pos[startVertex]);				
		this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height - 1/4*this.adj_list_height);
		this.cmd("SetLayer",  this.d_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.d_timesID_AL[startVertex], 2);
		
		this.visited[startVertex] = true;
		this.cmd("Step");
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[startVertex][neighbor] > 0)
			{
				this.highlightEdge(startVertex, neighbor, 1);
				if (this.visited[neighbor])
				{
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Vertex " + String(neighbor) + " already this.visited.", messageX, this.messageY, 0);
				}
				this.cmd("Step");
				this.highlightEdge(startVertex, neighbor, 0);
				if (this.visited[neighbor])
				{
					this.cmd("Delete", nextMessage, "DNM");
				}
				
				if (!this.visited[neighbor])
				{
					this.cmd("Disconnect", this.circleID[startVertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[startVertex], this.circleID[neighbor], TopoSortIndegree.DFS_TREE_COLOR, this.curve[startVertex][neighbor], 1, "");
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + neighbor*this.adj_list_height);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + neighbor*this.adj_matrix_height);
					
					this.cmd("Step");
					this.dfsVisit(neighbor, messageX + 10, printCCNum);							
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Returning from recursive call: DFS(" + String(neighbor) + ")", messageX + 20, this.messageY, 0);
					
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[startVertex], this.y_pos_logical[startVertex]);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
					this.cmd("Step");
					this.cmd("Delete", nextMessage, 18);
				}
				this.cmd("Step");
				
				
				
			}
			
		}
			
		
		this.f_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.f_timesID_L[startVertex],"f = " + String(this.f_times[startVertex]), this.f_x_pos[startVertex], this.f_y_pos[startVertex]);
		this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height + 1/4*this.adj_list_height);
		
		this.cmd("SetLayer",  this.f_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.f_timesID_AL[startVertex], 2);
		
		this.cmd("Step");
		
		var i;
		for (i = this.topoOrderArrayL.length; i > 0; i--)
		{
			this.topoOrderArrayL[i] = this.topoOrderArrayL[i-1];
			this.topoOrderArrayAL[i] = this.topoOrderArrayAL[i-1];
			this.topoOrderArrayAM[i] = this.topoOrderArrayAM[i-1];
		}		
		
		var nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex, this.x_pos_logical[startVertex],  this.y_pos_logical[startVertex]);
		this.cmd("SetLayer", nextVertexLabel, 1);
		this.topoOrderArrayL[0] = nextVertexLabel;
		
		nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
		this.cmd("SetLayer", nextVertexLabel, 2);
		this.topoOrderArrayAL[0] = nextVertexLabel;
		
		nextVertexLabel = this.nextIndex++;
		this.messageID.push(nextVertexLabel);
		this.cmd("CreateLabel", nextVertexLabel, startVertex,this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
		this.cmd("SetLayer", nextVertexLabel, 3);
		this.topoOrderArrayAM[0] = nextVertexLabel;
		
		for (i = 0; i < this.topoOrderArrayL.length; i++)
		{
			this.cmd("Move", this.topoOrderArrayL[i], TopoSortIndegree.ORDERING_INITIAL_X, 
					 TopoSortIndegree.ORDERING_INITIAL_Y + i * TopoSortIndegree.ORDERING_DELTA_Y);
			this.cmd("Move", this.topoOrderArrayAL[i], TopoSortIndegree.ORDERING_INITIAL_X, 
					 TopoSortIndegree.ORDERING_INITIAL_Y + i * TopoSortIndegree.ORDERING_DELTA_Y);
			this.cmd("Move", this.topoOrderArrayAM[i], TopoSortIndegree.ORDERING_INITIAL_X, 
					 TopoSortIndegree.ORDERING_INITIAL_Y + i * TopoSortIndegree.ORDERING_DELTA_Y);
			
		}
		this.cmd("Step");
		
		
		
	}
	
}


TopoSortIndegree.prototype.reset = function()
{
	this.nextIndex = this.oldNextIndex;
	this.messageID = new Array();
	this.nextIndex = this.initialIndex;
}



TopoSortIndegree.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	
	TopoSortIndegree.superclass.enableUI.call(this,event);
}
TopoSortIndegree.prototype.disableUI = function(event)
{
	
	this.startButton.disabled = true;
	
	TopoSortIndegree.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new TopoSortIndegree(animManag, canvas.width, canvas.height);
}

// For seeding Math.random
// https://github.com/davidbau/seedrandom
!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);

const printing = window.location.search.match(/print-pdf/gi)

let Visualization = {
	init: function() {
		// events
		Reveal.addEventListener('slidechanged', function(event) {
			syncVisual(event.currentSlide)
		})
		Reveal.addEventListener('fragmentshown', function(event) {
			syncVisual(Reveal.getCurrentSlide())
		})
		Reveal.addEventListener('fragmenthidden', function(event) {
			syncVisual(Reveal.getCurrentSlide())
		})

		// key bindings
		Reveal.addKeyBinding(32, onNext)
		Reveal.addKeyBinding(80, onPrev)
		Reveal.addKeyBinding(39, onRight)
		Reveal.addKeyBinding(40, onDown)

	 	// initialize visualizations in all slides
		if(printing)
			// slides will be duplicated to print each fragment in different page, delay initializeSlides to run after duplication
			Reveal.addEventListener('pdf-ready', initializeSlides)
		else
			initializeSlides()
	}
}
Reveal.registerPlugin('visualization', Visualization)


function initializeSlides() {
	for(let slide of Reveal.getSlides()) {
		// NOTE: we want to find elements in the current slide, not nested ones
		let container = Array.from(slide.getElementsByTagName("div"))
			.filter(c => c.parentElement === slide && c.hasAttribute("data-visual-algorithm"))[0]
		if(!container) continue

		// Some magic to properly scale the canvas. Reveal.js scales all slides with CSS
		// (either "zoom" or "transform: scale(x)") but this auto scaling looks bad for canvas.
		// The proper way to scale the canvas is to make it really larger (more pixels) and
		// draw larger graphics in it. We do this with the folloing hacks:
		//
		// We first cancel the canvas' scaling by applying an inverse scale()
		let revealScale = Reveal.getScale()
		let canvas = container.childNodes[0]
		canvas.style.transform = "scale(" + (1/revealScale) + ")"

		// We make the canvas larger by increasing its width/height.
		// The user can also set his own scale in the data-visual-scale attribute
		let fullScale = revealScale * (container.getAttribute("data-visual-scale") || 1)
		let origWidth = canvas.width
		let origHeight = canvas.height
		canvas.width = Math.floor(fullScale * canvas.width)
		canvas.height = Math.floor(fullScale * canvas.height)

		// Hoever the container has become too large now, because it takes into account
		// the new canvas size, plus the scaling (alghough we have "canceled" it out).
		// So we force the container to have the original height.
		container.style.height = origHeight + "px"

		// Also, we need to center the canvas within its container. However, the canvas is _larger_
		// than the container, which makes centering tricky. It is achieved via a flexbox below.
		container.style.display = 'flex'
		container.style.justifyContent = 'center'
		container.style.alignItems = 'start'
		canvas.style.flexShrink = 0

		// Create manager.
		var manager = initCanvas(canvas, null)

		// We apply scale() to the canvas' ctx, so that all graphics are drawn larger
		// This must be done after creating the manager.
		canvas.getContext("2d").scale(fullScale, fullScale)

		// Seed for Math.random can be passed as 'data-visual-seed'
		let seed = container.getAttribute("data-visual-seed")
		if(seed != undefined)
			Math.seedrandom(seed)

		// Algorithm arguments. Impotant: the constructor receives the canvas' width/height, which is used eg to center objects.
		// We pass the _original_ size (without scaling), cause the scaling is automatically applied by scale().
		let algArgs = [manager, origWidth, origHeight]
		for(let i = 1; container.hasAttribute("data-visual-algorithm-arg-"+i); i++)
			algArgs.push(parseValue(container.getAttribute("data-visual-algorithm-arg-"+i)))

		// Finally create the algorithm. We get the class with an eval hack (classes exist in the wrapper function's scope, we avoid exporting to global scope)
		let algClass = eval(container.getAttribute("data-visual-algorithm"))
		let algorithm = new (Function.prototype.bind.apply(algClass, [null].concat(algArgs)))		// 'new' with variable arguments

		manager.SetPaused(true)
		// manager.SetSpeed(0)

		// the slide can contain <div data-visual-action="..."> tags without a fragment class.
		// these are execute at the beginning, to form the initial state of the animation
		let initial = Array.from(slide.getElementsByTagName("div"))
			.filter(function(a) {
				return a.parentElement === slide && !a.classList.contains("fragment") && a.hasAttribute("data-visual-action")
			})

		for(let step of initial) {
			let action = step.getAttribute("data-visual-action")
			let value = parseValue(step.getAttribute("data-visual-value"))
			algorithm.implementAction(algorithm[action].bind(algorithm), value)
			manager.skipForward()
		}

		slide.visualInfo = {
			manager: manager,
			algorithm: algorithm,
			initialNo: initial.length,
			noSkipOnNextSync: false,
		}

		// if printing, we update all slides now
		if(printing)
			syncVisual(slide)
	}
}

function parseValue(s) {
	return s == "" ? "" : JSON.parse(s);
}

// Returns the current fragment of the visualization animation
function currentAnimFragment(vi) {
	// before starting AnimationSteps is empty, after starting previousAnimationSteps
	// contains one entry for each past step. We need to substract any initial actions
	// that are not aniamated so they don't have their own fragments
	//
	return (vi.manager.AnimationSteps ? vi.manager.previousAnimationSteps.length : -1) - vi.initialNo
}

// awaitingStep: animation is paused in the middle of a fragment, waiting for the next step
// currentlyAnimating: animation is playing

function onNext() {
	let vi = Reveal.getCurrentSlide().visualInfo
	if(!vi) return Reveal.next()

	if(vi.manager.awaitingStep) {
		vi.manager.step()
	} else if(!vi.manager.currentlyAnimating) {
		vi.noSkipOnNextSync = true;
		Reveal.next()
	}
}

function onPrev() {
	let vi = Reveal.getCurrentSlide().visualInfo
	if(!vi) return Reveal.prev();

	let current = currentAnimFragment(vi)
	if(vi.manager.awaitingStep) {
		vi.manager.stepBack()

		// all steps are included in the action of the current fragment. This always matches
		// Reveal.getState().indexf. If we keep hitting prev() we will reach the previous
		// fragment, so we need to Reveal.prev() so that indexf matches the visualization.
		//
		function onWaitingOrEnded() {
			vi.manager.removeListener("AnimationWaiting", null, onWaitingOrEnded)
			vi.manager.removeListener("AnimationEnded",   null, onWaitingOrEnded)
			if(currentAnimFragment(vi) != current)
				console.log("calling prev")
		}
		vi.manager.addListener("AnimationWaiting", null, onWaitingOrEnded)
		vi.manager.addListener("AnimationEnded"  , null, onWaitingOrEnded)

	} else if(vi.manager.currentlyAnimating) {
		// do nothing

	} else if(current > -1) {
		vi.noSkipOnNextSync = true
		vi.manager.stepBack()
	
	} else {
		Reveal.prev()
	}
}

function onRight() {
	let vi = Reveal.getCurrentSlide().visualInfo

	if(vi && (vi.manager.awaitingStep || vi.manager.currentlyAnimating))
		vi.manager.skipForward()
	else
		Reveal.right()
}

function onDown() {
	let vi = Reveal.getCurrentSlide().visualInfo

	if(vi && (vi.manager.awaitingStep || vi.manager.currentlyAnimating))
		vi.manager.skipForward()
	else
		Reveal.down()
}

function syncVisual(slide) {
	let vi = slide.visualInfo
	if(!vi) return

	if(!vi.noSkipOnNextSync)
		vi.manager.skipForward()

	let fragments = Array.from(slide.getElementsByClassName("fragment")).filter(f => f.parentElement === slide)
	let animFragments = fragments.filter(f => f.hasAttribute("data-visual-action"))
	let visibleFragIndices = fragments.filter(f => f.classList.contains("visible")).map(f => f.getAttribute("data-fragment-index"))

	let current = currentAnimFragment(vi)
	let toShow = visibleFragIndices.length ? Math.max.apply(null, visibleFragIndices) : -1;

	while(toShow < current) {
		vi.manager.skipBack()
		current--
	}

	while(toShow > current) {
		current++
		if(!animFragments[current])		// more fragments than actions
			break;

		let action = animFragments[current].getAttribute("data-visual-action")
		let value = parseValue(animFragments[current].getAttribute("data-visual-value"))

		vi.algorithm.implementAction(vi.algorithm[action].bind(vi.algorithm), value)
		if(!vi.noSkipOnNextSync)
			vi.manager.skipForward()
	}

	vi.noSkipOnNextSync = false
}
//# sourceMappingURL=visualization.js.map
})()