// Used for manage table columns.
function searchList(list, name, value) {
	if (list != null)
		for (var i = 0; i < list.length; i++)
			if (list[i][name] == value)
				return i;
	return -1;
}

function drawLine(canvas, position1, position2) {
	var context = canvas[0].getContext('2d');
	context.beginPath();
	context.moveTo(position1.x, position1.y);
	context.lineTo(position2.x, position2.y);
	context.stroke();
}

function clean(canvas) {
	var canvas = canvas[0];
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

// function setCanvasSize(canvas) {
// var parent = canvas.parent();
// var height = parent.height();
// var width = parent.width();
// canvas.attr("height", height);
// canvas.attr("width", width);
// redrawAllRelation(canvas[0], $scope.relationTurples);
// }
