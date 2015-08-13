// Used for manage table columns.
function searchList(list, name, value) {
	if (list != null)
		for (var i = 0; i < list.length; i++)
			if (list[i][name] == value)
				return i;
	return -1;
}

function getMid(obj) {
	var top = obj.offset().top;
	var left = obj.offset().left;
	var height = obj.height();
	var width = obj.width();

	var mid = {
		x : left + width / 2,
		y : top + height / 2
	}

	return mid;
}

function getColumnID(paragraphID, tableName, columnName) {
	return "#" + paragraphID + "_" + tableName + "_" + columnName;
}

function setRelated(tables, tableName, columnName) {
	var tableColumns = tables[searchList(tables, "tableName", tableName)].tableColumns;
	tableColumns[searchList(tableColumns, "columnName", columnName)].related = true;
}

function redrawAllRelation(canvas, ratePool, tables, turpleList, paragraphID) {
	cleanAllRelation(canvas, ratePool);
	for (var i = 0; i < turpleList.length; i++)
		drawRelation(canvas, ratePool, tables, turpleList[i], paragraphID);
}

// Functions for drawing line for relationship discovery
function drawRelation(canvas, ratePool, tables, turple, paragraphID) {
	// set related property as true.
	setRelated(tables, turple.tableName1, turple.columnName1);
	setRelated(tables, turple.tableName2, turple.columnName2);

	var obj1 = $(getColumnID(paragraphID, turple.tableName1, turple.columnName1));
	var obj2 = $(getColumnID(paragraphID, turple.tableName2, turple.columnName2));
	var rate = turple.rate;

	var mid1 = getMid(obj1);
	var mid2 = getMid(obj2);
	var original = canvas.offset();

	var position1 = {
		x : mid1.x - original.left,
		y : mid1.y - original.top
	};

	var position2 = {
		x : mid2.x - original.left,
		y : mid2.y - original.top
	};

	if (mid1.x < mid2.x) {
		position1.x += obj1.width() / 2;
		position2.x -= obj2.width() / 2;
	} else {
		position1.x -= obj1.width() / 2;
		position2.x += obj2.width() / 2;
	}

	drawLine(canvas, position1, position2);
	putRate(position1, position2, rate, ratePool);
}

function putRate(position1, position2, rate, ratePool) {
	rate = Math.round(rate * 100);
	var div = $("<div></div>");
	div.html("" + rate + "%");
	div.css("position", "absolute");
	div.css("top", (position1.y + position2.y) / 2);
	div.css("left", (position1.x + position2.x) / 2 - 14);
	ratePool.append(div);
}

function drawLine(canvas, position1, position2) {
	var context = canvas[0].getContext('2d');
	context.beginPath();
	context.moveTo(position1.x, position1.y);
	context.lineTo(position2.x, position2.y);
	context.stroke();
}

function cleanAllRelation(canvas, ratePool) {
	if (ratePool != null && ratePool.length != 0)
		ratePool.empty();
	if (canvas != null && canvas.length != 0)
		clean(canvas);
}

function clean(canvas) {
	var canvas = canvas[0];
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function addNewColumn(tableList, tableName, column) {
	var index = searchList(tableList, "tableName", tableName);
	if (searchList(tableList[index].tableColumns, "columnName", column.columnName) == -1)
		tableList[index].tableColumns.push(column);
}

function checkColumn(tables, tablesData, tableName, columnName) {
	var tableIndex = searchList(tables, "tableName", tableName);
	if (tableIndex != -1) {
		var tableColumns = tables[tableIndex].tableColumns;
		if (searchList(tableColumns, "columnName", columnName) != -1)
			return true;
		else {
			var table = tablesData[tableName];
			if (table != null) {
				tableColumns = table.tableColumns;
				var columnIndex = searchList(tableColumns, "columnName", columnName);
				if (columnIndex != -1) {
					addNewColumn(tables, tableName, tableColumns.splice(columnIndex, 1)[0]);
					return true;
				}
			}
		}
	}
	return false;
}

function setCanvasSize(canvas) {
	var parent = canvas.parent();
	var height = parent.height();
	var width = parent.width();
	canvas.attr("height", height);
	canvas.attr("width", width);
}