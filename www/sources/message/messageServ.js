messageModule
	.factory('MessageServ', ['DataServ', '$rootScope', 'CommFun',
		function(DataServ, $rootScope, CommFun) {
			var _isrefresh; //是否可以刷新历史
			var messagePageSize = 10; //每次刷新条数
			var _isfirst = true; //是否为第一次加载true是，false否
			var _historytime; //最旧显示消息时间
			var nodeItem = "{id:'{id}',pId:'{pid}',name:'{name}',type:'{type}'}"; //树形结构列
			var CurrentSelectPerson = [];
			$rootScope.MessageList = null; //消息列表
			$rootScope.NoticeList = null; //公告列表
			var setting = {
				view: {
					selectedMulti: false,
					showLine: false
				},
				check: {
					enable: true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onCheck: OnCheck,
					onClick: OnClick
				}
			};
			var serverdata = {
				zNodes: [],
				personcount: 0, //发送消息选择人数
				content: '' //发送内容
			}
			var server = {
				GetServerdata: GetServerdata,
				InitData: InitData,
				SelectMessage: SelectMessage,
				ClickNotice: ClickNotice,
				InitSendMessage: InitSendMessage,
				SendMessageFun: SendMessageFun,
				Destory: Destory
			}
			return server;

			function GetServerdata() {
				return serverdata;
			}

			function InitData() {
				$rootScope.IsHasNewMessage = false;
				if ($rootScope.MessageList == null || ($rootScope.MessageList && $rootScope.MessageList.length < 0)) {
					CommFun.Start();
					SelectMessage(true);
				}
				//发送用$ionicModal，提前加载树形模块
				SelectDepartment();

			}

			function SelectMessage(bool) {
				_isfirst = bool;
				//查询信息
				if (_isfirst) { //第一次加载
					//初始化
					InitUserMessage();
					CheckNotice();
				} else {
					//加载历史记录
					AddHistoryMessage();
				}

			}

			function InitUserMessage() {
				_isrefresh = true;
				DataServ.BaseSelect("select * from (select * from tb_UserMessage where EnterpriseID=? or EnterpriseID='System' And (SendUserID=? OR Recipients like '%" + $rootScope.userInfo.UserID + "%') order by Time DESC) limit 0," + messagePageSize, [$rootScope.userInfo.EnterpriseID, $rootScope.userInfo.UserID]).then(function(adata) {
					if (adata) {
						var _len = adata.length;
						_historytime = adata[_len - 1].Time;
						if ($rootScope.MessageList == null) {
							$rootScope.MessageList = new Array();
						}
						for (var i = _len - 1; i >= 0; i--) {
							$rootScope.MessageList.push(adata[i]);
							DownLoadHeadImg(adata[i]);
						}
						//$rootScope.MessageList = $rootScope.MessageList.concat(adata);
						if (_len < messagePageSize) {
							_isrefresh = false;
						}
					}
					CommFun.RefreshData(serverdata);

				})
			}
			//添加历史
			function AddHistoryMessage() {
				if (_isrefresh) {
					DataServ.BaseSelect("select * from (select * from tb_UserMessage where EnterpriseID=? And Time<? And (SendUserID=? Or Recipients like '%" + $rootScope.userInfo.UserID + "%' )order by Time DESC) limit 0," + messagePageSize, [$rootScope.userInfo.EnterpriseID, _historytime, $rootScope.userInfo.UserID]).then(function(adata) {
						if (adata) {
							var _len = adata.length;
							_historytime = adata[_len - 1].Time;
							for (var i = 0; i < _len; i++) {
								$rootScope.MessageList.unshift(adata[i]);
								DownLoadHeadImg(adata[i]);
							}
							CommFun.RefreshData(serverdata);
							if (_len < messagePageSize) { //不足条数向服务器请求
								var _data = {
									Token: $rootScope.userInfo.Token,
									QueryTime: _historytime,
									PageSize: messagePageSize
								}
								DataServ.PostHistoryMessage(_data).then(function(res) {
									ShowHistoryMessage(res.Value.Data);
								});
							}
						} else {
							var _data = {
								Token: userInfo.Token,
								QueryTime: _historytime,
								PageSize: messagePageSize
							}
							DataServ.PostHistoryMessage(_data).then(function(res) {
								ShowHistoryMessage(res.Value.Data);
							});
						}
					})
				}
			}
			//服务器请求历史数据显示
			function ShowHistoryMessage(jsondata) {
				if (jsondata) {
					//显示加载数据
					var _length = jsondata.length;
					if (_length >= 1) {
						_historytime = jsondata[_length - 1].Time;
						for (var i = 0; i < length; i++) {
							$rootScope.MessageList.unshift(adata[i]);
							DownLoadHeadImg(adata[i]);
						}
					}
					if (_length < messagePageSize) {
						_isrefresh = false;
					}
				}
				CommFun.RefreshData(serverdata);
			};
			//获取公告
			function CheckNotice() {
				DataServ.BaseSelect("select * from  tb_UserMessage where MsgType=? and IsRead=?", [2, 2]).then(function(data) {
					if (data) {
						var _length = data.length;
						for (var i = 0; i < _length; i++) {
							$rootScope.NoticeList.push(data[i]);
						}
					}
					CommFun.RefreshData(serverdata);
				})
			}
			//点击公告关闭
			function ClickNotice(id) {
				if ($rootScope.NoticeList && $rootScope.NoticeList.length > 0) {
					if ($rootScope.NoticeList[0].id == id) {
						$rootScope.NoticeList.shift();
						DataServ.UpdateNoticeStatus(id);
						DataServ.PostNoticeRead(id);
					}
				}
				CommFun.RefreshData(serverdata);
			}
			//组装属性结构
			function SelectDepartment() {
				//组装企业
				AssembleEnterpriseTree();
				DataServ.BaseSelect("select * from tb_Departments where EnterpriseID=?", [$rootScope.userInfo.EnterpriseID]).then(function(adata) {
					var _len = adata.length;
					for (var i = 0; i < _len; i++) {
						//组装部门
						AssembleDepartmentTree(adata[i]);
					}
					DataServ.BaseSelect("select * from tb_FrontUsers where EnterpriseID=? And UserID!=?", [$rootScope.userInfo.EnterpriseID, $rootScope.userInfo.UserID]).then(function(data) {
						AssemblePersonTree(data)
					})
				})
			}
			//组装企业
			function AssembleEnterpriseTree() {
				if (serverdata.zNodes) {
					serverdata.zNodes = null;
					serverdata.zNodes = new Array();
				}
				if ($rootScope.userInfo) {
					var _item = nodeItem;
					_item = _item.replace(/{id}/g, $rootScope.userInfo.EnterpriseID);
					_item = _item.replace(/{name}/g, $rootScope.userInfo.EnterpriseName);
					_item = _item.replace(/{pid}/g, "0");
					_item = _item.replace(/{type}/g, "0");
					serverdata.zNodes.push(_item);
				}
			};
			//组装部门
			function AssembleDepartmentTree(adata) {
				if (adata) {
					var _item = nodeItem;
					_item = _item.replace(/{id}/g, adata.DepartmentID);
					if (adata.ParentID == 0 || adata.ParentID == "0") {
						_item = _item.replace(/{pid}/g, $rootScope.userInfo.EnterpriseID);
					} else {
						_item = _item.replace(/{pid}/g, adata.ParentID);
					}
					_item = _item.replace(/{name}/g, adata.DepartmentName);
					_item = _item.replace(/{type}/g, "1");
					serverdata.zNodes.push(_item);
				}
			};
			//组装人员
			function AssemblePersonTree(adata) {
				if (adata) {
					var _len = adata.length;
					for (var i = 0; i < _len; i++) {
						var _item = nodeItem;
						_item = _item.replace(/{id}/g, adata[i].UserID);
						if (adata[i].DepartmentID) {
							_item = _item.replace(/{pid}/g, adata[i].DepartmentID);
						} else {
							_item = _item.replace(/{pid}/g, $rootScope.userInfo.EnterpriseID);
						}
						_item = _item.replace(/{name}/g, adata[i].UserName);
						_item = _item.replace(/{type}/g, "2");
						serverdata.zNodes.push(_item);
					}
				}
			};
			//隐藏发送数据
			function InitSendMessage() {
				serverdata.personcount = 0;
				serverdata.content = '';
				InitTree();
				CommFun.RefreshData(serverdata);
			}
			//初始化树形结构
			function InitTree() {
				var _str = serverdata.zNodes.join(",");
				var _json = eval('[' + _str + ']');
				$.fn.zTree.init($("#treeDemo"), setting, _json);
				SetCheck();
			};

			function OnClick(e, treeId, treeNode, clickFlag) {
				ShowClickSelectData(treeNode);
				getCheckedNum();
			}

			function OnCheck(e, treeId, treeNode) {
				getCheckedNum();
			};

			function getCheckedNum() {
				CurrentSelectPerson = [];
				var zTree = $.fn.zTree.getZTreeObj("treeDemo");
				var nodes = zTree.getCheckedNodes(true);
				var _length = nodes.length - 1;
				var _numP = 0;
				var _numD = 0;
				while (_length >= 0) {
					if (nodes[_length].type == "2") {
						_numP += 1;
						CurrentSelectPerson.push(nodes[_length].id);
					}
					_length--;
				}
				serverdata.personcount = _numP;
				CommFun.RefreshData(serverdata);
			}

			function SetCheck() {
				var _ztree = $.fn.zTree.getZTreeObj("treeDemo");
				_ztree.setting.check.chkboxType = {
					"Y": "ps",
					"N": "ps"
				};
			};

			function ShowClickSelectData(treeNode) {
				var zTree = $.fn.zTree.getZTreeObj("treeDemo");
				treeNode.checked = !treeNode.checked;
				var nodes = treeNode.children;
				doCheck(nodes);
				if (treeNode.checked == false) {
					doParentCheck(treeNode)
				}
				zTree.refresh();

				function doCheck(Node) {
					if (Node) {
						var _length = Node.length;
						for (var i = 0; i < _length; i++) {
							Node[i].checked = treeNode.checked;
							doCheck(Node[i].children);
						}
					}
				}

				function doParentCheck(Node) {
					var pNode = Node.getParentNode();
					if (pNode) {
						var cNodes = pNode.children;
						var _length = cNodes.length;
						var isAllFalse = false;
						for (var i = 0; i < _length; i++) {
							if (cNodes[i].checked == true) {
								isAllFalse = true;
							}
						}
						if (!isAllFalse) {
							pNode.checked = false;
							doParentCheck(pNode);
						}
					}
				}
			}
			/*
			 * 点击名字删除选中
			 * @id点击对象id
			 */
			function DeleteSelect(id) {
				var _ztree = $.fn.zTree.getZTreeObj("treeDemo");
				_ztree.checkNode(_ztree.getNodeByParam('id', id), false, true);
				var obj = document.getElementById(id);
				obj.remove();
			};
			//发送消息，content为消息内容
			function SendMessageFun(message) {
				if (CurrentSelectPerson == null || CurrentSelectPerson.length < 1) {
					//NotificationAlert("请选择人员", "提示");
					return;
				}
				if (message == "" || message == null) {
					//NotificationAlert("发送类容为空", "提示");
					return;
				}
				CurrentSelectPerson.push($rootScope.userInfo.UserID);
				DataServ.BaseSelect("select Time from tb_UserMessage order by Time DESC").then(function(adata) {
					var _str = CommFun.secondFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
					var _time = _str;
					if (adata) {
						var _date = new Date(adata[0].Time);
						_time = CommFun.secondFormat(new Date(Math.abs(_date) + (30 * 1000)), "yyyy-MM-dd hh:mm:ss");
					}
					var sendMessageData = {
						MessageID: CommFun.NewGuid(),
						Token: $rootScope.userInfo.Token,
						Message: message,
						SendUserID: $rootScope.userInfo.UserID,
						Recipients: CurrentSelectPerson.join("|"),
						SendUserName: $rootScope.userInfo.UserName,
						SendUserPicture: $rootScope.userInfo.HeadImage,
						SendTime: _str,
						Time: _time,
						EnterpriseID: $rootScope.userInfo.EnterpriseID,
						Status: '0'
					};
					HandleSendMessage(sendMessageData);
				})
			}
			//处理发送数据
			function HandleSendMessage(data, callback) {
				//添加数据库
				DataServ.AddSendMessage(data).then(function(res) {
					//发送数据
					DataServ.PostSendMessage(data).then(function(adata) {
						if (adata.Success) { //请求成功
							DataServ.UpdateSendMessage(data);
							data.Status = '1';
							ShowAddMessage(data);
							DownLoadHeadImg(data);
						} else {
							DataServ.DeleteSendMessage(data);
							//NotificationAlert("服务器发送消息错误：" + adata.Message, "错误提示"); //输出请求错误信息
						}
						
					});
				});
				//界面显示
				ShowAddMessage(data);
			};
			function ShowAddMessage(data){
				if($rootScope.MessageList==null){
					$rootScope.MessageList=new Array();
				}
				var len=$rootScope.MessageList.length;
				var has=false;
				for(var i=0;i<len;i++){
					if($rootScope.MessageList[i].MessageID==data.MessageID){
						has=true;
						$rootScope.MessageList[i].Status=data.Status;
						break;
					}
				}
				if(has==false){
					$rootScope.MessageList.push(data);
				}
				CommFun.RefreshData(serverdata);
			}
			//下载头像
			function DownLoadHeadImg(jsondata) {
				if (jsondata) {
					CommFun.Download(jsondata.SendUserPicture).then(function(adata) {
						if (adata && typeof(adata) != 'string') {
							if ($rootScope.MessageList && $rootScope.MessageList.length > 0) {
								var len = $rootScope.MessageList.length;
								for (var i = 0; i < len; i++) {
									if ($rootScope.MessageList[i].SendUserID == jsondata.SendUserID) {
										$rootScope.MessageList[i].SendUserPicture = adata.nativeURL;
									}
								}
								CommFun.RefreshData(serverdata);
							}
						}
					})
				}

			}

			function Destory() {

			}

		}
	])