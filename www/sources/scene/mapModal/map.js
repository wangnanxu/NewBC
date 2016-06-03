sceneModule
	.directive('sceneMap', ['$timeout',
		function($timeout) {
			return {
				restrict: 'E',
				template: "<div id='mapcontainer' style='margin: 0; padding: 0;height: 100%; width: 100%;'></div>",
				scope: {
					param: "=data"
				},
				link: function($scope, $element, $attrs) {
					var BaiduMap;
					var marker
					$element.bind("$destroy", function() {
						BaiduMap = null;
					})
					$timeout(function() {
						CreatMap();
					}, 200)

					function CreatMap() {
						BaiduMap = new BMap.Map("mapcontainer"); //创建地图实例
						var Point = {
							lng: "106.583613",
							lat: "29.563503"
						}
						var point = new BMap.Point(Point.lng, Point.lat); //初始化创建点坐标(解放碑)
						BaiduMap.centerAndZoom(point, 15); //初始化地图，设置中心点坐标和地图级别
						var myGeo = new BMap.Geocoder();
					}
					$scope.$watch('param', function() {
							$timeout(function() {
								//创建地理编码实例
								var GPS;
								if ($scope.param == null) {
									return;
								}
								if ($scope.param.GPS[1]) {
									GPS = $scope.param.GPS[1]
								}
								if (GPS && GPS != "") {
									var arr = GPS.split('|');
									var result = {
										lng: arr[1],
										lat: arr[0]
									}
									BaiduMap.panTo(new BMap.Point(result.lng, result.lat)); //获取地址后滚动到新的地点
									addMarker(result); //标注
								} else {
									BaiduMap.panTo(new BMap.Point(Point.lng, Point.lat)); //获取地址后滚动到新的地点
									NotificationAlert("无坐标信息", "提示");
								}
							}, 500)

						})
						/* 添加标注 */
					function addMarker(parampoint) {
						parampoint = new BMap.Point(parampoint.lng, parampoint.lat); //创建点坐标
						var myIcon = new BMap.Icon("http://api.map.baidu.com/images/marker_red_sprite.png", new BMap.Size(23, 25), {
							// 指定定位位置。当标注显示在地图上时，其所指向的地理位置距离图标左上角各偏移10像素和25像素。您可以看到在本例中该位置即是图标中央下端的尖角位置。
							offset: new BMap.Size(10, 25),
							// 设置图片偏移。当您需要从一幅较大的图片中截取某部分作为标注图标时，您 需要指定大图的偏移位置，此做法与 css sprites 技术类似。      
							imageOffset: new BMap.Size(0, 0)
								// 设置图片偏移 
						});
						// 创建标注对象
						if (marker) {
							BaiduMap.removeOverlay(marker);
							marker = null;
						}
						marker = new BMap.Marker(parampoint, {
							icon: myIcon
						});
						BaiduMap.addOverlay(marker); //添加标注到地图
					};
				}
			}
		}
	])