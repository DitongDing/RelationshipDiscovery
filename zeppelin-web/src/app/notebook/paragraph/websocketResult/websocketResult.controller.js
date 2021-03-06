'use strict';

// For AngularJS, it can change the web view by changing JS object binded with it. For example, $scope.tables contains the table data.
angular
		.module('zeppelinWebApp')
		.controller(
				'WebsocketResultCtrl',
				function($scope, $rootScope) {
					$scope.paragraphID = null;
					$scope.show = false;
					$scope.type = "";
					$scope.maxColumnNum = 5;
					$scope.canvas = null;
					$scope.ratePool = null;

					// Message
					$scope.content = null;

					// Table
					$scope.tables = [];
					$scope.relationTuples = [];
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
								// The action performed when receive a message with type "CLEAN"
								$scope.tables = [];
								$scope.relationTuples = [];
								$scope.tablesData = {};
								cleanAllRelation($scope.canvas, $scope.ratePool);
							} else if (obj.type == "MESSAGE") {
								// The action performed when receive a message with type "MESSAGE"
								$scope.content = obj.message;
							} else if (obj.type == "TABLE") {
								// The action performed when receive a message with type "TABLE"
								$scope.canvas = $("#" + $scope.paragraphID + "_canvas");
								$scope.ratePool = $("#" + $scope.paragraphID + "_ratePool");
								for (var i = 0; i < obj.tables.length; i++) {
									var table = {
										tableName : obj.tables[i].tableName,
										tableRows : obj.tables[i].tableRows,
										tableColumns : []
									};
									var j = 0;
									// Assume the max showed column by default is $scope.maxColumnNum.
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
									
									// As we are using AngularJS model-view way to manage the web view, I make a 500 ms delay jQuery-UI draggable function to table divs.
									setTimeout(function() {
										setCanvasSize($scope.canvas);
										for (var i = 0; i < obj.tables.length; i++) {
											var tableElem = $("#" + $scope.paragraphID + "_" + obj.tables[i].tableName
													+ "_table");
											// For refreshing the canvas when drag the tables.
											tableElem.draggable({
												containment : 'parent',
												drag : function(event, ui) {
													redrawAllRelation($scope.canvas, $scope.ratePool, $scope.tables,
															$scope.relationTuples, $scope.paragraphID);
												},
												stop : function(event, ui) {
													redrawAllRelation($scope.canvas, $scope.ratePool, $scope.tables,
															$scope.relationTuples, $scope.paragraphID);
												}
											});
										}
									}, 500);
								}
							} else if (obj.type == "RELATIONSHIP") {
								// The action performed when receive a message with type "RELATIONSHIP"
								var tuple = obj.relationTuple;
								var parent = $scope.canvas.parent();
								var height = parent.height();
								var width = parent.width();

								if (checkColumn($scope.tables, $scope.tablesData, tuple.tableName1, tuple.columnName1)
										&& checkColumn($scope.tables, $scope.tablesData, tuple.tableName2,
												tuple.columnName2))
									setTimeout(function() {
										// When the canvas size has not been changed, then just draw the relationship line.
										if (parent.height() == height && parent.width() == width)
											drawRelation($scope.canvas, $scope.ratePool, $scope.tables,
													obj.relationTuple, $scope.paragraphID);
										// If the canvas size has been changed, then redraw all the relationship lines.
										else {
											setCanvasSize($scope.canvas);
											redrawAllRelation($scope.canvas, $scope.ratePool, $scope.tables,
													$scope.relationTuples, $scope.paragraphID);
										}
									}, 500);

								$scope.relationTuples.push(tuple);
							}
						}
					}

					// For initializing the html model.
					$scope.init = function(pID) {
						if ($rootScope.ddt_websocket == null) {
							// Initialize the websocket.
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

					// The function used for determining the type of result, which will affect the front end.
					$scope.getType = function() {
						if ($scope.type == "MESSAGE")
							return "MESSAGE";
						else if ($scope.type == "TABLE" || $scope.type == "RELATIONSHIP")
							return "RELATIONSHIP";
						return null;
					}

					// The function which will be called when the user opens the closed table.
					$scope.open = function(tableName) {
						var table = $scope.tables[searchList($scope.tables, "tableName", tableName)];
						var tableData = $scope.tablesData[tableName];
						for (var i = 0; i < tableData.tableColumns.length; i++)
							table.tableColumns.push(tableData.tableColumns[i]);
						tableData.tableColumns = [];
						setTimeout(function() {
							setCanvasSize($scope.canvas);
							redrawAllRelation($scope.canvas, $scope.ratePool, $scope.tables, $scope.relationTuples,
									$scope.paragraphID);
						}, 500);
					}

					// The function which will be called when the user closes the closed table.
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
							setCanvasSize($scope.canvas);
							redrawAllRelation($scope.canvas, $scope.ratePool, $scope.tables, $scope.relationTuples,
									$scope.paragraphID);
						}, 500);
					}
				});