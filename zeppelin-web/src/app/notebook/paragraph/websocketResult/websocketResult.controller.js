'use strict';

angular.module('zeppelinWebApp').controller(
		'WebsocketResultCtrl',
		function($scope, $rootScope) {
			$scope.paragraphID = null;
			$scope.show = false;
			$scope.type = "";

			// Message
			$scope.content = null;

			// Table
			$scope.tables = [];
			$scope.relationTurples = [];

			var ratePool = null;

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
						clean($("#" + $scope.paragraphID + "_canvas")[0]);
					} else if (obj.type == "MESSAGE") {
						$scope.content = obj.message;
					} else if (obj.type == "TABLE") {
						$scope.tables = obj.tables;
					} else if (obj.type == "RELATIONSHIP") {
						// $scope.relationTurples.push(obj.relationTurple);
						var canvas = $("#" + $scope.paragraphID + "_canvas")[0];
						var obj1 = $("#" + $scope.paragraphID + "_" + obj.relationTurple.tableName1 + "_"
								+ obj.relationTurple.columnName1);
						var obj2 = $("#" + $scope.paragraphID + "_" + obj.relationTurple.tableName2 + "_"
								+ obj.relationTurple.columnName2);
						if (canvas != null && obj1 != null && obj2 != null)
							drawRelation(canvas, obj1, obj2, obj.relationTurple.rate);
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
				ratePool = $("#" + pID + "_ratePool");
			}

			$scope.getType = function() {
				if ($scope.type == "MESSAGE")
					return "MESSAGE";
				else if ($scope.type == "TABLE" || $scope.type == "RELATIONSHIP")
					return "RELATIONSHIP";
				return null;
			}

			// Functions for drawing line for relationship discovery
			function drawRelation(canvas, obj1, obj2, rate) {
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
				ratePool.empty();
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
				rate = Math.round(rate*100);
				var div = $("<div></div>");
				div.html("" + rate + "%");
				div.css("position", "absolute");
				div.css("top", (position1.y + position2.y) / 2);
				div.css("left", (position1.x + position2.x) / 2 - 14);
				$("#" + $scope.paragraphID + "_ratePool").append(div);
			}
		});