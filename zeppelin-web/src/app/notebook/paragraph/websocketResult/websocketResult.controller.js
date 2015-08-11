'use strict';

angular
		.module('zeppelinWebApp')
		.controller(
				'WebsocketResultCtrl',
				function($scope, $rootScope) {
					$scope.paragraphID = null;
					$scope.show = false;
					$scope.type = "";
					$scope.maxColumnNum = 5;

					// Message
					$scope.content = null;

					// Table
					$scope.tables = [];
					$scope.relationTurples = [];
					// Store table data
					$scope.tablesData = {};

					// make a callback in $rootScope for websocket to use
					var closure = {
						"update" : function(data) {
							$scope.show = true;
							var obj = JSON.parse(data);
							$scope.type = obj.type;
							if (obj.type == "ERROR") {
								// TODO remains to be finished
							} else if (obj.type == "CLEAN") {
								$scope.tables = [];
								$scope.relationTurples = [];
								$scope.tablesData = {};
								$("#" + $scope.paragraphID + "_ratePool").empty();
								clean($("#" + $scope.paragraphID + "_canvas")[0]);
							} else if (obj.type == "MESSAGE") {
								$scope.content = obj.message;
							} else if (obj.type == "TABLE") {
								for (var i = 0; i < obj.tables.length; i++) {
									var table = {
										tableName : obj.tables[i].tableName,
										tableRows : obj.tables[i].tableRows,
										tableColumns : []
									};
									var j = 0;
									for (; j < obj.tables[i].tableColumns.length && j < $scope.maxColumnNum; j++) {
										obj.tables[i].tableColumns[j].related = false;
										table.tableColumns.push(obj.tables[i].tableColumns[j]);
									}
									$scope.tables.push(table);

									table = {
										tableName : obj.tables[i].tableName,
										tableRows : obj.tables[i].tableRows,
										tableColumns : []
									};
									for (; j < obj.tables[i].tableColumns.length; j++) {
										obj.tables[i].tableColumns[j].related = false;
										table.tableColumns.push(obj.tables[i].tableColumns[j]);
									}
									var ID = obj.tables[i].tableName;
									$scope.tablesData[ID] = table;

									setTimeout(function() {
										var canvas = $("#" + $scope.paragraphID + "_canvas")[0];
										for (var i = 0; i < obj.tables.length; i++) {
											var tableElem = $("#" + obj.tables[i].tableName + "_table");
											tableElem.draggable({
												containment : 'parent',
												stop : function(event, ui) {
													redrawAllRelation(canvas, $scope.relationTurples);
												}
											});
										}
									}, 500);
								}
							} else if (obj.type == "RELATIONSHIP") {
								var turple = obj.relationTurple;
								var canvas = $("#" + $scope.paragraphID + "_canvas")[0];

								if (canvas != null && checkColumn(turple.tableName1, turple.columnName1)
										&& checkColumn(turple.tableName2, turple.columnName2))
									setTimeout(function() {
										drawRelation(canvas, obj.relationTurple);
									}, 500);

								$scope.relationTurples.push(turple);
							}
						}
					}

					$scope.init = function(pID) {
						if ($rootScope.ddt_websocket == null) {
							var uri = "ws://" + location.hostname + ":820";
							$rootScope.ddt_websocket = new WebSocket(uri);
							$rootScope.ddt_map = {};
							var websocket = $rootScope.ddt_websocket;
							websocket.onopen = function(evt) {
								var data = {
									type : "OPEN",
								}
								websocket.send(JSON.stringify(data));
							};
							websocket.onclose = function(evt) {
								console.log("websocket result closed");
							};
							websocket.onmessage = function(evt) {
								var obj = JSON.parse(evt.data);
								var ID = obj.paragraphID;
								$rootScope.ddt_map[ID].update(evt.data);
							};
							websocket.onerror = function(evt) {
								console.log(evt.data);
							};
						}
						$scope.paragraphID = pID;
						$rootScope.ddt_map[$scope.paragraphID] = closure;
					}

					$scope.getType = function() {
						if ($scope.type == "MESSAGE")
							return "MESSAGE";
						else if ($scope.type == "TABLE" || $scope.type == "RELATIONSHIP")
							return "RELATIONSHIP";
						return null;
					}

					$scope.open = function(tableName) {
						var table = $scope.tables[searchList($scope.tables, "tableName", tableName)];
						var tableData = $scope.tablesData[tableName];
						for (var i = 0; i < tableData.tableColumns.length; i++)
							table.tableColumns.push(tableData.tableColumns[i]);
						tableData.tableColumns = [];
					}

					$scope.close = function(tableName) {
						// alert(tableName);
						var table = $scope.tables[searchList($scope.tables, "tableName", tableName)];
						var tableData = $scope.tablesData[tableName];
						var tmpTableColumns = [];
						var canvas = $("#" + $scope.paragraphID + "_canvas")[0];

						for (var i = 0; i < table.tableColumns.length; i++) {
							if (table.tableColumns[i].related)
								tmpTableColumns.push(table.tableColumns[i]);
							else
								tableData.tableColumns.push(table.tableColumns[i]);
						}
						if (tmpTableColumns.length == 0)
							while (tmpTableColumns.length < $scope.maxColumnNum) {
								var column = tableData.tableColumns.pop();
								tmpTableColumns.push(column);
							}
						table.tableColumns = tmpTableColumns;
						setTimeout(function() {
							redrawAllRelation(canvas, $scope.relationTurples);
						}, 500);
					}

					function redrawAllRelation(canvas, turpleList) {
						$("#" + $scope.paragraphID + "_ratePool").empty();
						clean(canvas);
						for (var i = 0; i < turpleList.length; i++)
							drawRelation(canvas, turpleList[i]);
					}

					// Functions for drawing line for relationship discovery
					function drawRelation(canvas, turple) {
						// set related property as true.
						var tableColumns1 = $scope.tables[searchList($scope.tables, "tableName", turple.tableName1)].tableColumns;
						tableColumns1[searchList(tableColumns1, "columnName", turple.columnName1)].related = true;
						var tableColumns2 = $scope.tables[searchList($scope.tables, "tableName", turple.tableName2)].tableColumns;
						tableColumns2[searchList(tableColumns2, "columnName", turple.columnName2)].related = true;

						var obj1 = $("#" + $scope.paragraphID + "_" + turple.tableName1 + "_" + turple.columnName1);
						var obj2 = $("#" + $scope.paragraphID + "_" + turple.tableName2 + "_" + turple.columnName2);
						var rate = turple.rate;

						var mid1 = getMid(obj1);
						var mid2 = getMid(obj2);
						var original = $(canvas).offset();

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
						putRate(position1, position2, rate);
					}

					function drawLine(canvas, position1, position2) {
						var context = canvas.getContext('2d');
						context.beginPath();
						context.moveTo(position1.x, position1.y);
						context.lineTo(position2.x, position2.y);
						context.stroke();
					}

					function clean(canvas) {
						var context = canvas.getContext('2d');
						context.clearRect(0, 0, canvas.width, canvas.height);
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

					function putRate(position1, position2, rate) {
						rate = Math.round(rate * 100);
						var div = $("<div></div>");
						div.html("" + rate + "%");
						div.css("position", "absolute");
						div.css("top", (position1.y + position2.y) / 2);
						div.css("left", (position1.x + position2.x) / 2 - 14);
						$("#" + $scope.paragraphID + "_ratePool").append(div);
					}

					// Used for manage table columns.
					function searchList(list, name, value) {
						if (list != null)
							for (var i = 0; i < list.length; i++)
								if (list[i][name] == value)
									return i;
						return -1;
					}

					function addNewColumn(tableList, tableName, column) {
						var index = searchList(tableList, "tableName", tableName);
						if (searchList(tableList[index].tableColumns, "columnName", column.columnName) == -1) {
							tableList[index].tableColumns.push(column);
						}
					}

					function checkColumn(tableName, columnName) {
						var obj = $("#" + $scope.paragraphID + "_" + tableName + "_" + columnName);
						if (obj.length == 0) {
							var table = $scope.tablesData[tableName];
							var column = searchList(table.tableColumns, "columnName", columnName);
							if (column != -1) {
								addNewColumn($scope.tables, tableName, table.tableColumns[column]);
								table.tableColumns.splice(column, 1);
								return true;
							} else
								return false;
						} else
							return true;
					}
				});