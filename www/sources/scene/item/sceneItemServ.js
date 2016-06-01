sceneModule
	.factory('SceneItemServ', ['$state', 'DataServ', '$rootScope', 'CommFun',
		function($state, DataServ, $rootScope, CommFun) {
			var IsLoadHistory = {};
			var serverdata = {
				sceneState: 0,
				IsSceneWorker: false, //是否为本现场工作人员
				SelectStatus: 0,
				sceneid: '', //当前现场id
				scenemessage: null //现场数据
			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData,
				GoBack: GoBack
			}
			return server;

			function GetServerData() {
				return serverdata;
			}

			function InitData() {
				serverdata.IsSceneWorker = false;
				serverdata.SelectStatus = 0;
				if ($rootScope.parentidList && $rootScope.parentidList.length > 1) {
					var len = $rootScope.parentidList.length;
					serverdata.sceneid = $rootScope.parentidList[len - 1];
					DataServ.BaseSelect("select * from tb_Scenes where SceneID = ?", [serverdata.sceneid]).then(function(data) {
						if (data) {
							serverdata.sceneState = data[0].SceneState;
							//判断用户是否为改现场工作人员
							var scworker = data[0].SceneWorker;
							var _length = scworker.length;
							for (var i = 0; i < _length; i++) {
								var userids = scworker[i].UserID;
								if (CommFun.CheckItem(userids, $rootScope.userInfo.UserID) != -1) {
									serverdata.IsSceneWorker = true;
									break;
								}
							}
							var _time = CommFun.format(new Date(3015, 0, 1, 10, 10, 10), "yyyy-MM-dd hh:mm:ss");
							IsLoadHistory[serverdata.sceneid] = _time;
							//查找最近的10条数据
							DataServ.BaseSelect("select * from tb_SceneMessageComments where SceneID = ? and State != 0 and State !=2 and CreateTime < ? order by CreateTime desc limit 0,10", [serverdata.sceneid, _time]).then(function(adata) {
								if (adata) {
									CheckInitDBData(adata, true);
								}
							})
						}
					})
				}
			}
			/*检测数据是否有10条，不足获取服务器，足够显示*/
			function CheckInitDBData(data, isinit) {
				var _time = IsLoadHistory[serverdata.sceneid];
				if (data) {
					ShowLocal(data);
					IsLoadHistory[serverdata.sceneid] = data[data.length - 1].CreateTime;
				}
				if (!data || isinit) {
					if (_time != false) {
						DataServ.PostHistoryData(serverdata.sceneid, _time).then(function(adata) {
							if (adata.Success) {
								var jsondata = adata.Value.Data;
								var count = adata.Value.Count;
								if (adata.length < 10) {
									IsLoadHistory[serverdata.sceneid] = false;
								} else {
									IsLoadHistory[serverdata.sceneid] = jsondata[jsondata.length - 1].CreateTime;
								}
								var _length = jsondata.length;
								DataServ.SaveSceneMessageData(jsondata);
								ShowData(adata);
							} else {
								//NotificationAlert("服务器获取现场历史数据错误：" + adata.Message, "错误提示");
							}
						});
					}
				}
				if (isinit) {
					SelectDBUpload(serverdata.sceneid, [0, 2]);
				}
				//显示本地数据
				function ShowLocal(_jsondata) {
					if (_jsondata && _jsondata.length > 0) {
						IsLoadHistory[serverdata.sceneid] = _jsondata[_jsondata.length - 1].CreateTime;
						ShowData(_jsondata, true);
					}
				}
			};

			function ShowData(jsondatas, islocal) {
				var _length = jsondatas.length;
				var _arrayTem = [];
				for (var i = _length - 1; i >= 0; i--) {
					var jsondata = jsondatas[i];
					if (islocal) {
						jsondata.Id = jsondata.MessageID;
						jsondata.Comments = JSON.parse(jsondata.Comments);
					}
					//			_tem = _tem.replace(/{SendUserI
					if (islocal) {
						var Add_GPS = jsondata.Address.split(',')
						jsondata.Address = Add_GPS[0];
						jsondata.GPS = Add_GPS[1] == undefined ? [] : Add_GPS[1].split('|');
						jsondata.Longitude = jsondata.GPS[1] == undefined ? "" : jsondata.GPS[1];
						jsondata.Latitude = jsondata.GPS[0] == undefined ? "" : jsondata.GPS[0];
					}
					jsondata.Description = jsondata.Description == null ? "" : jsondata.Description;
					var str = '';
					switch (jsondata.Type) {
						case 1:
							str = "签到";
							break;
						case 2:
							str = "过程照";
							break;
						case 4:
							str = "安全照";
							break;
						case 8:
							str = "临检照";
							break;
						case 16:
							str = "交底照"
							break;
						case 32:
							str = "签退"
							break;
						case 64:
							str = "完工照"
							break;
						default:

							break;
					}
					jsondata.TypeText = str;
					var stastr = '';
					if (jsondata.Status == "0") {
						stastr = "正常状态";
					} else if (jsondata.Status == "1") {
						stastr = "审核通过";
					} else if (jsondata.Status == "2" && (jsondata.IsExamine == "false" || !jsondata.IsExamine)) {
						stastr = "需要整改";
					} else if (jsondata.Status == "2" && (jsondata.IsExamine == "true" || jsondata.IsExamine)) {
						stastr = "已整改";
					} else if (jsondata.Status == "3") {
						stastr = "已归档";
					}
					jsondata.Model = CheckTem(jsondata.Status, jsondata.Type, jsondata.State);
					jsondata.Options=ShowOption(jsondata.UserID, jsondata.Type, jsondata.Status, jsondata.IsExamine);
					jsondata.StatusText = stastr;
					if (serverdata.scenemessage == null) {
						serverdata.scenemessage = new Array();
					}
					var len = serverdata.scenemessage.length;
					var has = false;
					for (var j = 0; j < len; j++) {
						if (serverdata.scenemessage[j].Id == jsondata.Id) {
							serverdata.scenemessage[j] = jsondata;
							has = true;
						}
					}
					if (has == false) {
						serverdata.scenemessage.unshift(jsondata)
					}
				}
				console.log(serverdata.scenemessage);
			}
			/*选择模板*/
			function CheckTem(status, type, state) {
				var _status = parseInt(state);
				if (serverdata.sceneState != "3") {
					if (state != 4) {
						var _status = parseInt(status);
						var _type = parseInt(type);
						if (_type == 1 || _type == 32) {
							return 0; //签到签退
						} else if (_type != 1 && _type != 32 && _status == 3) {
							return 1; //归档模板
						} else {
							return 2;
						}
					} else {
						return "";
					}
				} else {
					return 1; //归档模板
				}
			};
			//设置消息按钮权限
			function ShowOption(userid, type, status, isexamine) {
				if (serverdata.sceneState!="3") {
					var _optemarray =[false,false,false];
					if (type != 1 && type != 32) {
						if ($rootScope.userInfo.VerifySceneData && !(status == "2" && (isexamine == "true" || isexamine))) {
							//审核
							_optemarray[0]=true;
						}
						if ($rootScope.userInfo.UserID == userid || ($.inArray("Root.AppPermission.SceneManage.DeleteSceneData",$rootScope.userInfo.FunctionIDs) != -1 && IsSceneWorker)) {
							//删除
							_optemarray[1]=true;
						}
						if ($rootScope.userInfo.ArchiveSceneData && !(status == "2" && (isexamine == "true" || isexamine))) {
							//归档
							_optemarray[2]=true;
						}
					}
				} 
				return _optemarray;
			};
			/*获取数据库数据 */
			function SelectDBUpload(sceneid, state) {
				var _length = state.length;
				var _state = [];
				var _pramas = [sceneid, $rootScope.userInfo.UserID];
				for (var i = 0; i < _length; i++) {
					_state.push("State = ?");
					_pramas.push(state[i]);
				}
				var _sql = "select * from tb_SceneMessageComments where SceneID = ? and UserID = ? and (" + _state.join(' or ') + ") order by CreateTime desc";
				DataServ.BaseSelect(_sql, _pramas).then(function(data) {
					CheckDBUploadData(data)
				})
			};
			/*检测是否有待发送的数据*/
			function CheckDBUploadData(data) {
				if (data) {
					var _length = data.length;
					DataServ.ChangeState(data, 2);
					for (var i = 0; i < _length; i++) {
						serverdata.message.push(data[i]);
						if (parseInt(data[i].State) == 2 || parseInt(data[i].State) == 0) {
							//LoadImg(data[i].MessageID); 
						}
						if (parseInt(data[i].State) == 0) {
							UploadSceneItem(data[i]);
						}
					}
				}
			};
			/*上传数据*/
			function UploadSceneItem(jsondata) {
				CommFun.GetPosition(function(_position) { //获取经纬度
					if (_position != null) {
						var _length = 0;
						if (jsondata.Images != "" && jsondata.Images != "[]") {
							var _images = JSON.parse(jsondata.Images);
							_length = _images.length;
							var _fileNum = _length;
							var _sceneid = serverdata.sceneid;
							for (var i = 0; i < _length; i++) {
								var _uploadjson = {
									Type: 0, //上传类型，0图片，1头像
									URI: _images[i].ThumbnailPicture, //上传文件地址   
									Pramas: "", //过渡参数
									UploadPramas: {
										Token: $scope.userInfo.Token,
										Guid: jsondata.MessageID,
										SceneID: _sceneid
									}, //上传参数
									Callback: UploadImgCallback //回调函数
								}
								UploadFile(_uploadjson);

								function UploadImgCallback() {
									_fileNum -= 1;
									if (_fileNum == 0) {
										UploadCallback();
									}
								};
							}
						} else {
							UploadCallback(); //上传数据
						}

						function UploadCallback() { //闭包上传函数
							var _jsondata = { //Post数据
								SceneID: serverdata.sceneid,
								Token: $scope.userInfo.Token,
								Time: jsondata.CreateTime,
								Address: _position.latitude + "|" + _position.longitude,
								Type: jsondata.Type,
								Content: jsondata.Description,
								Count: _length,
								Relation: jsondata.Relation,
								Guid: jsondata.MessageID
							};
							CommFun.PostAddSceneItem(_jsondata, jsondata.Status).then(function(data) {
								_UPCallback(data);
							}); //Post操作
						}
					}

					function _UPCallback(upvalue) { //Post成功回调函数
						DataServ.BaseSaveUpdate("tb_SceneMessageComments", ['MessageID', 'Address', 'State'], [upvalue.MessageID, upvalue.Address, 1], "MessageID=?", jsondata.MessageID).then(function(res) {
							DataServ.BaseSelect("select * from tb_SceneMessageComments where MessageID=?", [upvalue.MessageID]).then(function(repdata) {

							})
						})
						dbBase.OpenTransaction(function(tx) {
							dbBase.SaveOrUpdateTable(tx, "tb_SceneMessageComments", ['MessageID', 'Address', 'State'], [upvalue.MessageID, upvalue.Address, 1], "MessageID", jsondata.MessageID, function(istrue) {
								dbBase.SelectTable(tx, "select * from tb_SceneMessageComments where MessageID=?", [upvalue.MessageID], function(repdata) {

									var _tem = ShowData(arrayrep, true);
									if ($messageid.length > 0) {
										$messageid.replaceWith(_tem);
									}
									var $temp_SceneItem = $("#temp_SceneItem");
									$(".contentimage").trigger('create');
									$temp_SceneItem.listview('refresh');
									myScroll.refresh();
								})
							})
						});
					}
				})
			};

			function GoBack() {
				if ($rootScope.parentidList) {
					$rootScope.parentidList.pop();
					var len = $rootScope.parentidList.length;
					$state.go('scene', {
						projectID: $rootScope.projectId,
						manager: null,
						sceneID: $rootScope.parentidList[len - 1]
					})
				}

			}
		}
	])