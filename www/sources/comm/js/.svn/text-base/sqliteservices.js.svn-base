/*数据库服务
 * 考试类型表：
 * 类型ID、类型名、父ID
 * 试卷表：
 * 试卷ID、试卷名、考试类型ID、试卷类型ID、总分、题目数量、试卷状态（0免费，1VIP，2已下载，3更新）、合格分数、上传者ID、考试总时间、所属年份、包含题型、创建时间、创建者ID、最后更新时间、更新者ID
 * 试题表：
 * 试题ID、试卷ID、编号、联合编号、父编号、题干、序号、试题类型、分值、选项、答案、解析、版本
 * 用户表：
 * 用户ID、用户名、用户昵称、是否VIP、是否登录
 * 用户试题关联表(错题、收藏)：
 * 关联ID、类型ID、试卷ID、试题ID、用户ID、关联类型(错题、收藏)、是否已同步
 * 历史记录表：
 * 记录ID、试卷ID、用户ID、已用时间、得分、历史内容（[{ID:"1",answer:"A"},{ID:"23",answer:""}]）、考试是否确认交卷（0未交，1已交）、是否已同步
 */
commModule
	.factory('SqliteServ', ['$q', '$cordovaSQLite', '$http',
		function($q, $cordovaSQLite, $http) {
			var db = null;
			var table = [];
			if (!window.openDatabase) {
				alert('该浏览器不支持数据库');
				return false;
			} else {
				db = window.openDatabase('bcdb', '1.0', 'bcdb', 30000);
				var service = {
					createDB: createDB,
					transaction: transaction,
					insert: insert,
					select: select,
					selectsql: selectsql,
					selectfree: selectfree,
					update:update,
					saveOrupadte: saveOrupadte,
					deletehis: deletehis,
					deletetable:deletetable
				};
				return service;
			}
			//开启事务
			function transaction(callback) {
				$cordovaSQLite.transactionOpen(db, function(tx) {
					callback(tx);
				})
			}
			//查找数据
			function select(tablename, condition, param) {
				var q = $q.defer();
				var where = "";
				if (param.length > 0) {
					where = " where " + condition;
				}
				var query = "select * from " + tablename + where;
				$cordovaSQLite.execute(db, query, param).then(function(response) {
					var _length = response.rows.length;
					if (_length == 0) {
						q.resolve([]);
					} else {
						var _data = [];
						for (var i = 0; i < _length; i++) {
							_data.push(response.rows.item(i))
						}
						q.resolve(_data);
					}
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			};
			//查找
			function selectsql(sql, param) {
				var q = $q.defer();
				$cordovaSQLite.execute(db, sql, param).then(function(response) {
					var _length = response.rows.length;
					if (_length == 0) {
						q.resolve([]);
					} else {
						var _data = [];
						for (var i = 0; i < _length; i++) {
							_data.push(response.rows.item(i))
						}
						q.resolve(_data);
					}
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			}
			//查找数据
			function selectfree(tablename, condition, param) {
				var q = $q.defer();
				var query = "select * from " + tablename + " " + condition;
				$cordovaSQLite.execute(db, query, param).then(function(response) {
					var _length = response.rows.length;
					if (_length == 0) {
						q.resolve([]);
					} else {
						var _data = [];
						for (var i = 0; i < _length; i++) {
							_data.push(response.rows.item(i))
						}
						q.resolve(_data);
					}
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			};
			function selectMore(tx,tablename, condition, param){
				var q = $q.defer();
				var query = "select * from " + tablename + " " + condition;
				$cordovaSQLite.insetexecute(tx, query, param).then(function(response) {
					var _length = response.rows.length;
					if (_length == 0) {
						q.resolve([]);
					} else {
						var _data = [];
						for (var i = 0; i < _length; i++) {
							_data.push(response.rows.item(i))
						}
						q.resolve(_data);
					}
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			}
			//插入数据
			function insert(tx, tablename, field, param) {
				var q = $q.defer();
				var _length = field.length;
				var _array = []
				for (var i = 0; i < _length; i++) {
					_array.push("?");
				}
				var query = "insert into " + tablename + "(" + field.join(',') + ") values (" + _array.join(',') + ")";
				$cordovaSQLite.insetexecute(tx, query, param).then(function(response) {
					q.resolve(response);
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			};
			//插入数据
			function insertsignal(tablename, field, param) {
				var q = $q.defer();
				var _length = field.length;
				var _array = []
				for (var i = 0; i < _length; i++) {
					_array.push("?");
				}
				var query = "insert into " + tablename + "(" + field.join(',') + ") values (" + _array.join(',') + ")";
				$cordovaSQLite.execute(db, query, param).then(function(response) {
					q.resolve(response);
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			};
			//修改数据
			function update(tablename, field, param, condition, cparam) {
				var q = $q.defer();
				var _length = field.length;
				var _array = [];
				for (var i = 0; i < _length; i++) {
					_array.push(field[i] + "=?");
				}
				var _length = cparam.length;
				for (var i = 0; i < _length; i++) {
					param.push(cparam[i]);
				}
				var query = "update " + tablename + " set " + _array.join(",") + " where " + condition;
				$cordovaSQLite.execute(db, query, param).then(function(response) {
					q.resolve(response);
				}, function(err) {
					console.log(err.message);
					q.reject(err); //成功返回
				});
				return q.promise;
			};
			//删除数据
			function deletehis(tablename, condition, param) {
				var q = $q.defer();
				var where = "";
				if (param.length > 0) {
					where = " where " + condition;
				}
				var query = "delete from " + tablename + where;
				$cordovaSQLite.execute(db, query, param).then(function(response) {
					q.resolve(response);
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			}
			//删除数据
			function deletetable(tx,tablename, condition, param){
				var q = $q.defer();
				var query = "delete from " + tablename + condition;
				$cordovaSQLite.insetexecute(tx, query, param).then(function(response) {
					q.resolve(response);
				}, function(err) {
					q.reject(err); //成功返回
				});
				return q.promise;
			}
			//插入或修改数据
			function saveOrupadte(tablename, field, param, condition, cparam) {
				var q = $q.defer();
				select(tablename, condition, cparam).then(function(data) {
					if (data.length > 0) {
						update(tablename, field, param, condition, cparam).then(function(res){
							q.resolve(res);
						});
					} else {
						insertsignal(tablename, field, param).then(function(res){
							q.resolve(res);
						});
					}
				})
				return q.promise;
			};
			//创建数据库
			function createDB() {
				var q = $q.defer();
				$http.get('sources/comm/json/sqlite.json')
					.success(function(data, status, header, config) {
						var _length = data.length;
						for (var i = 0; i < _length; i++) {
							var query = "CREATE TABLE IF NOT EXISTS " + data[i].tableName + " (" + data[i].tablePrama.join(',') + ")";
							$cordovaSQLite.execute(db, query, []).then(function(res) {
								console.log("cerate: " + res.insertId);
							}, function(err) {
								console.error(err);
							});
						}

					}).error(function() {});
			}

		}
	]);