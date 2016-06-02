materialModule
	.factory('MaterialServ', ['CommFun', 'DataServ', '$rootScope','$state',
		function(CommFun, DataServ, $rootScope,$state) {
			//文件类型图片
			var TYPEJSON = {
				1: "sources/comm/img/excel.gif",
				2: "sources/comm/img/word.png",
				3: "sources/comm/img/ppt.jpg",
				4: "sources/comm/img/pdf.png",
				xlsx: "sources/comm/img/excel.gif",
				xls: "sources/comm/img/excel.gif",
				xlsm: "sources/comm/img/excel.gif",
				doc: "sources/comm/img/word.png",
				docx: "sources/comm/img/word.png",
				pdf: "sources/comm/img/pdf.png",
				ppt: "sources/comm/img/ppt.jpg",
				pptx: "sources/comm/img/ppt.jpg",
				pps: "sources/comm/img/ppt.jpg",
			};
			var localMaterial = [];
			var deleteMaterial = [];
			var processEle = null;
			var serverdata = {
				isScene:false,
				selectindex: 0, //已下载为0 ，资料库为1
				title: '已下载',
				downlist: null, //已下载资料
				alllist: null, //所有资料
				downfile: null, //点击下载文档
				downstatus: 0, //下载状态
				downrate: 0, //下载进度
				isShowProcess: false //是否显示下载进度条
			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData,
				SyncMetrial: SyncMetrial,
				ChangeSelect: ChangeSelect,
				GoDownload: GoDownload,
				DownloadMaterial:DownloadMaterial,
				GoBack: GoBack,
				GoBackScene:GoBackScene,
				Destory:Destory
			}
			return server;

			function GetServerData() {
				return serverdata;
			}

			function InitData() {
				if($rootScope.parentidList && $rootScope.parentidList.length>0){
					serverdata.isScene=true;
				}else{
					//$rootScope.FlagNewSceneItem = true;
					//$rootScope.IsHasNewMessage = true; //是否有新的消息
				}
				SelectDownloadMaterial();
			}

			function SyncMetrial() {
				DataServ.PostGetMaterial().then(function(data) {
					if (data.Success) { //请求成功
						ShowMaterial(data.Value.KnowlegeList, true);
					} else {
						//NotificationAlert("服务器请求资料失败：" + adata.Message, "错误提示"); //输出请求错误信息
					}
				});
			}

			function ChangeSelect(index) {
				if (serverdata.selectindex == index) {
					return;
				}
				serverdata.selectindex = index;
				if (index == 0) {
					serverdata.title = "已下载";
					SelectDownloadMaterial();
				} else {
					serverdata.title = "资料库";
					if (serverdata.alllist == null || serverdata.alllist.length <= 0) {
						DataServ.PostGetMaterial(ShowMaterial).then(function(data) {
							if (data.Success) { //请求成功
								ShowMaterial(data.Value.KnowlegeList, true);
							} else {
								//NotificationAlert("服务器请求资料失败：" + adata.Message, "错误提示"); //输出请求错误信息
							}
						});
					}
				}
				CommFun.RefreshData(serverdata);
			}

			function SelectDownloadMaterial() {
				DataServ.GetDownloadMaterial().then(function(data) {
					if (data) {
						ShowMaterial(data);
						if (localMaterial == null) {
							localMaterial = new Array();
							var _length = data.length;
							for (var i = 0; i < _length; i++) {
								localMaterial[data[i].ID] = data[i].UpdateTime;
							}
						}
					}
				})
			}

			function ShowMaterial(data, idsll) {
				if (data) {
					if(serverdata.alllist){
						serverdata.alllist=null;
					}
					if(serverdata.downlist){
						serverdata.downlist=null;
					}
					var _length = data.length;
					for (var i = 0; i < _length; i++) {
						data[i].DocumentType = TYPEJSON[data[i].DocumentType]
						if (idsll) { //所有资料
							if (serverdata.alllist == null) {
								serverdata.alllist = new Array();
							}
							serverdata.alllist.push(data[i]);
						} else {
							if (serverdata.downlist == null) {
								serverdata.downlist = new Array();
							}
							serverdata.downlist.push(data[i]);
						}
					}
					CommFun.RefreshData(serverdata);
				}
			}

			function GoDownload(index) {
				serverdata.downfile = serverdata.alllist[index];
				if (serverdata.downlist)
					var len = serverdata.downlist.length;
				for (var i = 0; i < len; i++) {
					if (serverdata.downfile.ID == serverdata.downlist[i].ID) {
						serverdata.downstatus = 1;
						break;
					}
				}
			}
			//设置进度条
			function SetProcessWidth() {
				if (processEle == null) {
					processEle = document.getElementById("DownProcess");
				}
				if (processEle) {
					processEle.style.cssText = "width:" + serverdata.downrate + "%";
				}
			}
			function DownloadMaterial(){
				serverdata.isShowProcess=true;
			}
			function GoBack() {
				serverdata.downrate = 0;
				serverdata.downstatus = 0;
				serverdata.downfile = null;
				if (processEle) {
					processEle.style.cssText = "width:0px";
				}
			}
			function GoBackScene(){
				$state.go('sceneItem');
			}
			function Destory(){
				serverdata.selectindex=0;
				serverdata.title = "已下载";
				serverdata.downlist=null;
				serverdata.alllist=null;
				serverdata.isScene=false;
			}

		}
	])