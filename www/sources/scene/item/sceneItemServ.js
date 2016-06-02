sceneModule
	.factory('SceneItemServ', ['$state', 'DataServ', '$rootScope', 'CommFun',
		function($state, DataServ, $rootScope, CommFun) {
			var IsLoadHistory = {};
			var serverdata = {
				isinit:true,
				noMore: true, //是否可加载更多
				sceneState: 0,
				IsSceneWorker: false, //是否为本现场工作人员
				SelectStatus: 0,
				sceneid: '', //当前现场id
				scenemessage: null, //现场数据
				uploadimg: null //上传图片
			}
			var server = {
				GetServerData: GetServerData,
				InitData: InitData, //进入初始化
				LoadMore: LoadMore, //加载更多
				DeleteComment: DeleteComment, //删除评论

				SceneItemSign: SceneItemSign, //签到签退
				GotoMaterialScene:GotoMaterialScene,//查看资料手册
				
				ShowAlert:ShowAlert,
				GoBack: GoBack //返回
			}
			return server;

			function GetServerData() {
				return serverdata;
			}

			function InitData() {
				serverdata.IsSceneWorker = false;
				serverdata.SelectStatus = 0;
				InitScentItem();
			}

			function InitScentItem() {
				if ($rootScope.parentidList && $rootScope.parentidList.length > 1) {
					serverdata.isinit=true;
					var len = $rootScope.parentidList.length;
					serverdata.sceneid = $rootScope.parentidList[len - 1];
					DataServ.BaseSelect("select * from tb_Scenes where SceneID = ?", [serverdata.sceneid]).then(function(data) {
						if (data) {
							serverdata.sceneState = data[0].SceneState;
							//判断用户是否为改现场工作人员
							var scworker = JSON.parse(data[0].SceneWorker);
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
									CheckInitDBData(adata);
								}
							})
						}
					})
				}
			}
			/*检测数据是否有10条，不足获取服务器，足够显示*/
			function CheckInitDBData(data) {
				var _time = IsLoadHistory[serverdata.sceneid];
				if (data && data.length > 0) {
					ShowLocal(data);
					IsLoadHistory[serverdata.sceneid] = data[data.length - 1].CreateTime;
				}
				if (!data || serverdata.isinit || data.length <= 0) {
					if (_time != false) {
						DataServ.PostHistoryData(serverdata.sceneid, _time).then(function(adata) {
							if (adata.Success) {
								var jsondata = adata.Value.Data;
								var count = adata.Value.Count;
								if (jsondata.length < 10) {
									serverdata.noMore = true;
									IsLoadHistory[serverdata.sceneid] = false;
								} else {
									serverdata.noMore = false;
									IsLoadHistory[serverdata.sceneid] = jsondata[jsondata.length - 1].CreateTime;
								}
								var _length = jsondata.length;
								DataServ.SaveSceneMessageData(jsondata);
								ShowData(jsondata);
								if(	serverdata.isinit){
										serverdata.isinit=false;
								}
							} else {
								//NotificationAlert("服务器获取现场历史数据错误：" + adata.Message, "错误提示");
							}
						});
					}
				}
				if (serverdata.isinit) {
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

			function ShowData(jsondatas, islocal,_new) {
				var _length = jsondatas.length;
				var _arrayTem = [];
				for (var i = 0; i <_length; i++) {
					var jsondata = jsondatas[i];
					if (islocal) {
						var Add_GPS = jsondata.Address.split(',')
						jsondata.Address = Add_GPS[0];
						jsondata.GPS = Add_GPS[1] == undefined ? [] : Add_GPS[1].split('|');
						jsondata.Id = jsondata.MessageID;
						if (jsondata.Comments != null && jsondata.Comments != '') {
							jsondata.Comments = JSON.parse(jsondata.Comments);
						}
					}else{
						
						jsondata.GPS =jsondata.GPS == undefined ? [] : jsondata.GPS.split('|');
					}
					jsondata.Longitude = jsondata.GPS[1] == undefined ? "" : jsondata.GPS[1];
						jsondata.Latitude = jsondata.GPS[0] == undefined ? "" : jsondata.GPS[0];
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
					jsondata.Options = ShowOption(jsondata.UserID, jsondata.Type, jsondata.Status, jsondata.IsExamine);
					jsondata.StatusText = stastr;
					if (jsondata.Comments) {
						var len = jsondata.Comments.length;
						for (var k = 0; k < len; k++) {
							jsondata.Comments[k].Option = SetCommentOption(jsondata.Comments[k].UserID, jsondata.Status, jsondata.Comments[k].Content, jsondata.IsExamine);
						}
					}
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
						if(_new){
							serverdata.scenemessage.unshift(jsondata)
						}else{
							serverdata.scenemessage.push(jsondata)
						}
						
					}
					
				}
			}
			//上划加载更多
			function LoadMore() {
				if (IsLoadHistory[serverdata.sceneid] != false && serverdata.noMore==false && serverdata.isinit==false) {
					DataServ.BaseSelect("select * from tb_SceneMessageComments where SceneID = ? and State != 0 and State !=2 and CreateTime < ? order by CreateTime desc limit 0,10", [serverdata.sceneid, IsLoadHistory[serverdata.sceneid]]).then(function(adata) {
						CheckInitDBData(adata)
					})
				}
			}
			//删除评论
			function DeleteComment(parentIndex, index) {
				CommFun.ShowConfirm("删除提醒!", "确定要删除评论吗?").then(function(res) {
					var _time = CommFun.format(new Date(), "yyyy-MM-dd hh:mm:ss");
					var item = serverdata.scenemessage[parentIndex];
					var comments=item[index].Commentsl
					//请求服务器删除评论
					DataServ.PostDeleteComment(item.Id, comments[index].CommentGuid, _time);
					//删除界面评论
					serverdata.scenemessage[parentIndex].Comments.splice(index,1);
					//操作本地数据库
					DataServ.BaseSelect("select * from tb_SceneMessageComments where MessageID = ?", [item.Id]).thne(function(data) {
						if (data) {
							var _jsondata = JSON.parse(data[0].Comments);
							var _length = _jsondata.length;
							for (var i = 0; i < _length; i++) {
								if (_jsondata[i].indexOf(comments[index].CommentGuid) != -1) {
									_jsondata.splice(i, 1);
									break;
								}
							}
							DataServ.BaseSaveUpdate("tb_SceneMessageComments", ['Comments', 'Status', 'State'], [_jsondata, data[0].Status, 3], "MessageID=?", [item.Id])
						}
					})
				})

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
				if (serverdata.sceneState != "3") {
					var _optemarray = [false, false, false];
					if (type != 1 && type != 32) {
						if ($rootScope.userInfo.VerifySceneData && !(status == "2" && (isexamine == "true" || isexamine))) {
							//审核
							_optemarray[0] = true;
						}
						if ($rootScope.userInfo.UserID == userid || ($.inArray("Root.AppPermission.SceneManage.DeleteSceneData", $rootScope.userInfo.FunctionIDs) != -1 && IsSceneWorker)) {
							//删除
							_optemarray[1] = true;
						}
						if ($rootScope.userInfo.ArchiveSceneData && !(status == "2" && (isexamine == "true" || isexamine))) {
							//归档
							_optemarray[2] = true;
						}
					}
				}
				return _optemarray;
			};
			//设置评论后缀
			function SetCommentOption(userid, status, content, isExamine) {
				if (userid == $rootScope.userInfo.UserID && serverdata.sceneState != '3' && status != 3) {
					return 1
				}
				if (content.indexOf("需要整改") == 0 && userid == $rootScope.userInfo.UserID && (isExamine == "false" || !isExamine)) {
					return 2
				}
				return 0;
			}
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
						if (serverdata.scenemessage == null) {
							serverdata.scenemessage = new Array();
						}
						serverdata.scenemessage.push(data[i]);
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
								Token: $rootScope.userInfo.Token,
								Time: jsondata.CreateTime,
								Address: _position.latitude + "|" + _position.longitude,
								Type: jsondata.Type,
								Content: jsondata.Description,
								Count: _length,
								Relation: jsondata.Relation,
								Guid: jsondata.MessageID
							};
							if ($rootScope.onLine) {
								DataServ.PostAddSceneItem(_jsondata, jsondata.Status).then(function(adata) {
									if (adata.status == 200) { //请求发送成功
										if (adata.Success) {
											adata.Value.Address = adata.Value.Address + "," + _jsondata.Address;
											_UPCallback(adata.Value, _jsondata.Guid);
										} else {
											ShowAlert("错误提示", "服务器添加现场错误：" + adata.Message); //输出请求错误信息
											DataServ.BaseDelete("tb_SceneMessageComments", "MessageID=?", [_jsondata.Guid]);
											var len = serverdata.scenemessage.length;
											for (var i = 0; i < len; i++) {
												if (serverdata.scenemessage[i].Id == _jsondata.Guid) {
													serverdata.scenemessage.splice(i,1);
													break;
												}
											}
										}

									} else { //请求发送失败
										ShowAlert("错误提示", "服务器添加现场错误：" + adata.Message); //输出请求错误信息
										DataServ.BaseDelete("tb_SceneMessageComments", "MessageID=?", [_jsondata.Guid]);
										var len = serverdata.scenemessage.length;
										for (var i = 0; i < len; i++) {
											if (serverdata.scenemessage[i].Id == _jsondata.Guid) {
												serverdata.scenemessage[i] = null;
												break;
											}
										}
									}
								})
							} else {
								DataServ.BaseSaveUpdate("tb_SceneMessageComments", ['Status', 'state'], [jsondata.Status, 2], "MessageID=?", [_jsondata.Guid]).then(function() {

								})
								ShowAlert("提示", "网络已断开，请连接");
							}
						}
					}

					function _UPCallback(upvalue, messageid) { //Post成功回调函数
						DataServ.BaseDelete("tb_SceneMessageComments", "MessageID=?", [jsondata.MessageID]).then(function(res) {
							//修改界面
							var len = serverdata.scenemessage.length;
							for (var i = 0; i < len; i++) {
								if (serverdata.scenemessage[i].Id == messageid) {
									serverdata.scenemessage[i].Id = upvalue.MessageID;
									var arr = upvalue.Address.split(',')
									serverdata.scenemessage[i].Address = arr[0];
									serverdata.scenemessage[i].GPS = arr[1];
									var gps = arr[1] == undefined ? [] : arr[1].split('|');
									serverdata.scenemessage[i].GPS = gps;
									serverdata.scenemessage[i].Longitude = gps[1] == undefined ? "" : gps[1];
									serverdata.scenemessage[i].Latitude = gps[0] == undefined ? "" : gps[0];
									serverdata.scenemessage[i].State = 1;
									break;
								}
							}
						})

					}
				})
			};
			//签到签退
			function SceneItemSign(type) {
				if (serverdata.IsSceneWorker) {
					if (type == 1) {
						CommFun.ShowConfirm("签到提示!", "确定要签到吗?").then(function(res) {
							if (res) {
								SignConfirm(type);
							}

						});
					} else {
						CommFun.ShowConfirm("签到提示!", "确定要签退吗?").then(function(res) {
							if (res) {
								SignConfirm(type);
							}

						});
					}
				} else {
					ShowAlert("提示", "非本现场工作人员无法操作!")
				}
			}

			function SignConfirm(type) {
				if ($rootScope.userInfo["SceneBuilding"] && serverdata.sceneState != '3') {
					AddComplate(type, function(messageid) {
						DataServ.BaseSelect("select * from tb_SceneMessageComments where MessageID = ?", [messageid]).then(function(adata) {
							ShowData(adata, true,true);
							UploadSceneItem(adata[0]);
						})
					})
				}
			}
			//添加一条说说完成
			function AddComplate(SignType, callback) {
				var _guid = CommFun.NewGuid();
				var _sceneid = serverdata.sceneid;
				var _time = CommFun.secondFormat(new Date(), "yyyy-MM-dd hh:mm:ss"); //本地时间
				var _description = CommFun.GetPosition();
				var _images = serverdata.uploadimg;
				var _status = 0;
				var _type = SignType;
				var _state = 0; //_state 0:待上传，1:上传成功
				var _relation = "";
				var _isexamine = false;
				if (SignType == 1 || SignType == 32) {
					_description = "";
					_images = "";
					_type = SignType;
				}
				DataServ.BaseSaveUpdate("tb_SceneMessageComments", ['MessageID', 'SceneID', 'UserID', 'UserPicture', 'UserPictureURI', 'UserName', 'Address', 'CreateTime', 'Description', 'Images', 'Comments', 'Status', 'Type', 'State', 'PictureGuid', 'Relation', 'IsExamine', 'Examines', 'Files'], [_guid, _sceneid, $rootScope.userInfo.UserID, $rootScope.userInfo.HeadPictureURI, "", $rootScope.userInfo.UserName, "", _time, _description, _images, "", _status, _type, _state, "", _relation, _isexamine, "[]", "[]"], "MessageID=?", [_guid]).then(function(res) {
					if (res) {
						if (typeof(callback) == 'function') {
							callback(_guid);
						} else {
							//ChangePage("sceneItem.html?parentid=" + GetUrlParam("parentid") + "&sceneid=" + GetUrlParam("sceneid") + "&projectid=" + GetUrlParam("projectid"));
						}
					}
				})
			};

			function GoBack() {
				if ($rootScope.parentidList) {
					$rootScope.parentidList.pop();
					serverdata.scenemessage = null;
					serverdata.noMore=true;
					var len = $rootScope.parentidList.length;
					$state.go('scene', {
						projectID: $rootScope.projectId,
						manager: null,
						sceneID: $rootScope.parentidList[len - 1]
					})
				}

			}
			function GotoMaterialScene(){
				$state.go('tab.material',{
					isScene:'1'
				})
			}
			function ShowAlert(title,content){
				CommFun.ShowAlert(title,content)
			}
		}
	])