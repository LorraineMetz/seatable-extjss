(function () {
  'use strict';

  var name = "extjss";
  var version = "1.2.0";

  var base = window['base'];
  var app = window['app'];
  function die(errMsg) {
      alert(errMsg);
      throw new Error(errMsg);
  }
  function inject(name) {
      return window[name];
  }
  var jss = undefined;
  function getExtjss() {
      if (!jss) {
          jss = window[name];
      }
      return jss;
  }
  function printLog(command, info, level) {
      var _a;
      if (level === void 0) { level = "log"; }
      if (!((_a = getExtjss()) === null || _a === void 0 ? void 0 : _a.debug)) {
          return;
      }
      var msg = typeof info == "object" ? info.message : info;
      msg = "".concat(command, ":    ").concat(msg);
      window['output'].markdown("> [`".concat(level, "`] ").concat(msg));
      switch (level) {
          case 'warn':
              return console.warn(msg);
          case 'error':
              return console.error(msg);
          default:
              console.log(msg);
      }
  }
  function getArgs(function_name, _args) {
      var argv = [];
      for (var i = 0; i < _args.length; i++) {
          var arg = _args[i];
          var tArg = typeof arg;
          switch (tArg) {
              case 'undefined':
                  break;
              case 'symbol':
              case 'object':
              case 'function':
                  argv.push("…");
                  break;
              default:
                  argv.push(arg);
          }
      }
      return "".concat(function_name, "(").concat(argv.join(', '), ")");
  }

  var ColumnModifier = (function () {
      function ColumnModifier(rowsFilter, _columnName) {
          this.rowsFilter = rowsFilter;
          this._columnName = _columnName;
          var fsig = getArgs('column', arguments);
          if (!this._columnName) {
              throw die("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
          }
          printLog(fsig, '获取数据列修改器');
      }
      ColumnModifier.prototype.exec = function (func) {
          var _this = this;
          var fsig = getArgs('column.exec', arguments);
          printLog(fsig, '执行方法');
          var selectedRows = [], updateRows = [];
          this.rowsFilter.rows.forEach(function (row) {
              var _a;
              try {
                  var result = func(row);
                  selectedRows.push(row);
                  updateRows.push((_a = {},
                      _a[_this._columnName] = result,
                      _a));
              }
              catch (_b) {
                  return;
              }
          });
          base.modifyRows(this.rowsFilter.table.name, selectedRows, updateRows);
      };
      ColumnModifier.prototype.ref = function (raw_filter, func, operation, sourceTableName) {
          if (operation === void 0) { operation = undefined; }
          if (sourceTableName === void 0) { sourceTableName = undefined; }
          var fsig = getArgs('column.exec', arguments);
          if (!sourceTableName) {
              sourceTableName = this.rowsFilter.table.name;
          }
          var sourceTable = base.getTableByName(sourceTableName);
          if (!sourceTable) {
              die("\u8868\u3010".concat(sourceTableName, "\u3011\u4E0D\u5B58\u5728"));
          }
          printLog(fsig, "\u6267\u884C\u65B9\u6CD5\uFF0C\u6E90\u8868\u540D=".concat(sourceTableName));
          var sourceRows = sourceTable.rows.map(function (r) { return base.getRowById(sourceTableName, r['_id']); });
          this.exec(function (r) {
              var results = raw_filter(r, sourceRows);
              if (operation == "last") {
                  return func(r, results[results.length - 1]);
              }
              else {
                  return func(r, results[0]);
              }
          });
      };
      ColumnModifier.prototype.map = function (index_column, map_key, result_column, operation) {
          if (operation === void 0) { operation = undefined; }
          var fsig = getArgs('column.map', arguments);
          var sourceTableName = this.rowsFilter.table.name;
          var sourceColumnName = map_key;
          var maps = map_key.split('/');
          if (maps.length > 1) {
              sourceTableName = maps[0];
              sourceColumnName = maps[1];
          }
          var sourceTable = base.getTableByName(sourceTableName);
          if (!sourceTable) {
              die("\u8868\u3010".concat(sourceTableName, "\u3011\u4E0D\u5B58\u5728"));
          }
          printLog(fsig, "\u6267\u884C\u65B9\u6CD5\uFF0C\u6E90\u8868\u540D=".concat(sourceTableName, "\uFF0C \u6E90\u6570\u636E\u5217\u540D=").concat(sourceColumnName));
          var sourceRows = sourceTable.rows.map(function (r) { return base.getRowById(sourceTableName, r['_id']); });
          this.exec(function (r) {
              var results = sourceRows.filter(function (a) { return a[sourceColumnName] == r[index_column]; });
              if (results.length == 0) {
                  throw new Error();
              }
              switch (operation) {
                  case "sum":
                      return results.map(function (a) { return a[result_column] * 1; }).reduce(function (s, i) { return s + i; }, 0);
                  case "avg":
                      return results.map(function (a) { return a[result_column] * 1; }).reduce(function (s, i) { return s + i; }, 0) / results.length;
                  case "count":
                      return results.length;
                  case "max":
                      return Math.max.apply(Math, results.map(function (a) { return a[result_column] * 1; }));
                  case "min":
                      return Math.min.apply(Math, results.map(function (a) { return a[result_column] * 1; }));
                  case "first":
                      return results[0][result_column];
                  case "last":
                      return results[results.length - 1][result_column];
                  default:
                      return results[0][result_column];
              }
          });
      };
      return ColumnModifier;
  }());

  var RowSynchronizer = (function () {
      function RowSynchronizer(rowsFilter) {
          this.rowsFilter = rowsFilter;
          printLog(getArgs('sync', arguments), "\u6267\u884C\u6570\u636E\u540C\u6B65\u5668");
      }
      RowSynchronizer.prototype.exec = function (index_column, map_key, sync_method, delete_extra_rows, match_func) {
          if (delete_extra_rows === void 0) { delete_extra_rows = 0; }
          if (match_func === void 0) { match_func = undefined; }
          var fsig = getArgs('sync.exec', arguments);
          var sourceTableName = this.rowsFilter.table.name;
          var sourceIndexName = index_column;
          var maps = map_key.split('/');
          if (maps.length <= 1) {
              return die("同步仅发生在两个不同的表格，请指定目标表格");
          }
          var destTableName = maps[0];
          var destIndexName = maps[1];
          var sourceTable = base.getTableByName(sourceTableName);
          if (!sourceTable) {
              die("\u8868\u3010".concat(sourceTableName, "\u3011\u4E0D\u5B58\u5728"));
          }
          var destTable = base.getTableByName(destTableName);
          if (!destTable) {
              die("\u8868\u3010".concat(destTableName, "\u3011\u4E0D\u5B58\u5728"));
          }
          printLog(fsig, "\u6267\u884C\u6570\u636E\u540C\u6B65\uFF0C\u6E90\u8868\u540D=".concat(sourceTableName, "\uFF0C\u6E90\u7D22\u5F15=").concat(sourceIndexName));
          printLog(fsig, "\u6267\u884C\u6570\u636E\u540C\u6B65\uFF0C\u76EE\u6807\u8868=".concat(destTableName, "\uFF0C\u76EE\u6807\u7D22\u5F15=").concat(destIndexName));
          var sourceRows = this.rowsFilter.rows;
          var destRows = destTable.rows.map(function (r) { return base.getRowById(destTableName, r['_id']); });
          var addingRows = [];
          var updatingOldRows = [];
          var updatingRows = [];
          var deletingRows = [];
          if (delete_extra_rows == 1) {
              printLog(fsig, "\u63D0\u53D6\u76EE\u6807\u8868\u5185\u7684\u591A\u4F59\u6570\u636E\u7528\u4E8E\u5220\u9664");
              destRows.forEach(function (drow) {
                  var srow = sourceRows.filter(function (r) { return r[sourceIndexName] == drow[destIndexName]; });
                  if (srow.length == 0) {
                      deletingRows.push(drow);
                  }
              });
          }
          var sync_func;
          if (typeof sync_method == 'string') {
              var pairs_1 = sync_method.split(';').map(function (a) {
                  var kv = a.split(':');
                  if (kv.length > 1) {
                      return kv;
                  }
                  return [a, a];
              });
              sync_func = function (srow, type, drow) {
                  var newrow = {};
                  pairs_1.forEach(function (kv) {
                      newrow[kv[1]] = srow[kv[0]];
                  });
                  console.log(srow, type, drow, newrow);
                  return newrow;
              };
          }
          else {
              sync_func = sync_method;
          }
          sourceRows.forEach(function (srow) {
              var drows = destRows.filter(function (d) { return d[destIndexName] == srow[sourceIndexName]; });
              if (drows.length > 0) {
                  var drow = drows[0];
                  if (match_func) {
                      if (!match_func(srow, drow)) {
                          return;
                      }
                  }
                  updatingOldRows.push(drow);
                  updatingRows.push(sync_func(srow, 'update', drow));
              }
              else {
                  var newrow = sync_func(srow, 'add', undefined);
                  newrow[destIndexName] = srow[sourceIndexName];
                  addingRows.push(newrow);
              }
          });
          if (!confirm("\u672C\u6B21\u540C\u6B65\u5171\u6D89\u53CA\u5230 ".concat(addingRows.length, " \u6761\u65B0\u589E\u3001").concat(updatingRows.length, " \u6761\u66F4\u65B0\u3001").concat(deletingRows.length, " \u6761\u5220\u9664\u64CD\u4F5C\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F"))) {
              return alert("同步已取消");
          }
          if (deletingRows.length > 0) {
              deletingRows.map(function (r) { return r['_id']; }).forEach(function (id) { return base.deleteRow(destTableName, id); });
          }
          if (addingRows.length > 0) {
              addingRows.forEach(function (r) { return base.addRow(destTableName, r); });
          }
          if (updatingRows.length > 0) {
              base.modifyRows(destTableName, updatingOldRows, updatingRows);
          }
          alert('同步完成');
      };
      return RowSynchronizer;
  }());

  var RowsFilter = (function () {
      function RowsFilter(view, row_filter) {
          if (row_filter === void 0) { row_filter = undefined; }
          this.view = view;
          this.rows = [];
          var fsig = getArgs("rows", arguments);
          var tableName = view.table.name;
          var viewName = view.name;
          this.table = view.table;
          printLog(fsig, "\u6267\u884C\u6570\u636E\u7B5B\u9009\u5668\uFF1A\u8868\u540D=".concat(tableName, "\uFF0C\u89C6\u56FE\u540D=").concat(viewName));
          if (row_filter) {
              if (typeof row_filter == "function") {
                  this.rows = base
                      .getRows(tableName, viewName)
                      .filter(row_filter);
                  printLog(fsig, "\u4EE5js\u65B9\u6CD5\u5F62\u5F0F\u6267\u884C\u7B5B\u9009\uFF0C\u6570\u636E\u91CF=".concat(this.rows.length));
              }
              else if (typeof row_filter == "string") {
                  var result = base.filter(tableName, viewName, row_filter);
                  if (result) {
                      this.rows = result.all();
                  }
                  printLog(fsig, "\u4EE5\u6587\u672C\u6A21\u5F0F\u6267\u884C\u7B5B\u9009\uFF0C\u6570\u636E\u91CF=".concat(this.rows.length));
              }
              else if (Array.isArray(row_filter)) {
                  var qs_1;
                  row_filter.forEach(function (f) {
                      if (qs_1) {
                          qs_1 = qs_1.filter(f);
                      }
                      else {
                          qs_1 = base.filter(tableName, viewName, f);
                      }
                  });
                  if (qs_1) {
                      this.rows = qs_1.all();
                  }
                  printLog(fsig, "\u4EE5\u6587\u672C\u6570\u7EC4\u6A21\u5F0F\u6267\u884C\u7B5B\u9009\uFF0C\u6570\u636E\u91CF=".concat(this.rows.length));
              }
          }
          else {
              this.rows = base.getRows(tableName, viewName);
              printLog(fsig, "\u83B7\u53D6\u5168\u90E8\u6570\u636E\uFF0C\u6570\u636E\u91CF=".concat(this.rows.length));
          }
      }
      RowsFilter.prototype.column = function (column_name) {
          return new ColumnModifier(this, column_name);
      };
      RowsFilter.prototype.print = function (column_names) {
          if (column_names === void 0) { column_names = undefined; }
          if (column_names) {
              if (typeof column_names == 'string') {
                  this.rows.forEach(function (r) {
                      console.log(r[column_names]);
                  });
              }
              else if (Array.isArray(column_names)) {
                  this.rows.forEach(function (r) {
                      console.log(column_names.map(function (k) { return r[k]; }));
                  });
              }
          }
          else {
              this.rows.forEach(function (r) {
                  console.log(r);
              });
          }
      };
      RowsFilter.prototype.sync = function (index_column, map_key, sync_method, delete_extra_rows, match_func) {
          if (delete_extra_rows === void 0) { delete_extra_rows = 0; }
          if (match_func === void 0) { match_func = undefined; }
          return new RowSynchronizer(this).exec(index_column, map_key, sync_method, delete_extra_rows, match_func);
      };
      return RowsFilter;
  }());

  var ViewSelector = (function () {
      function ViewSelector(table, view_name) {
          if (view_name === void 0) { view_name = undefined; }
          this.table = table;
          var fsig = getArgs("view", arguments);
          if (view_name) {
              this.obj = base.getViewByName(table.name, view_name);
              if (!this.obj) {
                  printLog("\u8868\u683C\u6216\u89C6\u56FE\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u8868\u540D\u3001\u89C6\u56FE\u547D\u662F\u5426\u51C6\u786E", "error");
              }
              else {
                  printLog(fsig, "\u9009\u4E2D\u8868\u683C`".concat(table.name, "`\u7684\u89C6\u56FE`").concat(this.obj.name, "`"));
              }
          }
          else {
              if (table.name != base.getActiveTable().name) {
                  this.obj = base.getViews(table.name)[0];
                  printLog(fsig, "\u9009\u4E2D\u8868\u683C`".concat(table.name, "`\u7684\u7B2C\u4E00\u4E2A\u89C6\u56FE`").concat(this.obj.name, "`"));
              }
              else {
                  this.obj = base.getActiveView();
                  printLog(fsig, "\u9009\u4E2D\u5F53\u524D\u89C6\u56FE");
              }
          }
          this.name = this.obj.name;
      }
      ViewSelector.prototype.rows = function (row_filter) {
          if (row_filter === void 0) { row_filter = undefined; }
          return new RowsFilter(this, row_filter);
      };
      return ViewSelector;
  }());

  var TableMerger = (function () {
      function TableMerger(table, index_column, subtables, duplicate_rows, exists_row) {
          if (duplicate_rows === void 0) { duplicate_rows = "first"; }
          if (exists_row === void 0) { exists_row = "skip"; }
          var fsig = getArgs("merge", arguments);
          printLog(fsig, "执行表格合并");
          for (var _i = 0, subtables_1 = subtables; _i < subtables_1.length; _i++) {
              var subtable = subtables_1[_i];
              if (typeof subtable == 'string') {
                  table.canAssignTo(subtable);
              }
              else {
                  table.canAssignTo(subtable.table.name);
              }
          }
          printLog(fsig, "\u8868\u683C\u6570\u636E\u7ED3\u6784\u76F8\u540C\uFF0C\u53EF\u4EE5\u5408\u5E76\u2026\u2026");
          var adding2 = (function () {
              var table = inject('table');
              printLog(fsig, "\u8FDB\u884C\u6570\u636E\u8F6C\u6362\u2026\u2026");
              var _table_rows = subtables.map(function (t) {
                  if (typeof t == 'string') {
                      var _ = table(t).rows().rows;
                      printLog(fsig, "\u8868\u683C".concat(t, "\u5171").concat(_.length, "\u6761\u6570\u636E"));
                      return _;
                  }
                  else {
                      var _ = t.rows;
                      printLog(fsig, "\u8868\u683C".concat(t.table.name, "\u5171").concat(_.length, "\u6761\u6570\u636E"));
                      return _;
                  }
              });
              var table_rows = Array.prototype.concat.apply([], _table_rows);
              printLog(fsig, "\u6570\u636E\u5C55\u5F00\u5B8C\u6210\uFF0C\u5F85\u5408\u5E76\u8868\u683C\u5171\u6709".concat(table_rows.length, "\u6761\u6570\u636E"));
              if (duplicate_rows == 'first') {
                  var rtKeys_1 = [];
                  table_rows = table_rows.filter(function (row) {
                      var key = row[index_column];
                      if (rtKeys_1.indexOf(key) >= 0) {
                          return false;
                      }
                      rtKeys_1.push(key);
                      return true;
                  });
              }
              return table_rows;
          })();
          printLog(fsig, "\u5171\u6709".concat(adding2.length, "\u6761\u6570\u636E\u9700\u8981\u5408\u5E76\u81F3\u672C\u8868"));
          var updatingRows = [];
          var updatingOldRows = [];
          var addingRows = [];
          (function () {
              var myRows = table.rows().rows;
              var myRowsKeys = myRows.map(function (r) { return r[index_column]; });
              if (exists_row == 'skip') {
                  addingRows = adding2.filter(function (r) { return myRowsKeys.indexOf(r[index_column]) === -1; });
                  return;
              }
              var _loop_1 = function (row) {
                  var key = row[index_column];
                  if (myRowsKeys.indexOf(key) >= 0) {
                      var exists_one = myRows.filter(function (r) { return r[index_column] == key; })[0];
                      updatingOldRows.push(exists_one);
                      updatingRows.push(row);
                  }
                  else {
                      addingRows.push(row);
                  }
              };
              for (var _i = 0, adding2_1 = adding2; _i < adding2_1.length; _i++) {
                  var row = adding2_1[_i];
                  _loop_1(row);
              }
          })();
          printLog(fsig, "\u672C\u6B21\u5408\u5E76\u5171\u6D89\u53CA\u5230 ".concat(addingRows.length, " \u6761\u65B0\u589E\u3001").concat(updatingRows.length, " \u6761\u66F4\u65B0"));
          if (!confirm("\u672C\u6B21\u5408\u5E76\u5171\u6D89\u53CA\u5230 ".concat(addingRows.length, " \u6761\u65B0\u589E\u3001").concat(updatingRows.length, " \u6761\u66F4\u65B0\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F"))) {
              printLog(fsig, "\u5408\u5E76\u5DF2\u53D6\u6D88");
              alert("合并已取消");
              return;
          }
          if (updatingRows.length > 0) {
              printLog(fsig, "\u66F4\u65B0\u65E2\u6709\u6570\u636E\u2026\u2026");
              base.modifyRows(table.name, updatingOldRows, updatingRows);
              printLog(fsig, "\u65E2\u6709\u6570\u636E\u66F4\u65B0\u5B8C\u6210");
          }
          if (addingRows.length > 0) {
              printLog(fsig, "\u6267\u884C\u65B0\u589E\u6570\u636E\u2026\u2026");
              addingRows.forEach(function (r) { return base.addRow(table.name, r); });
              printLog(fsig, "\u65B0\u589E\u6570\u636E\u5B8C\u6210");
          }
          printLog(fsig, "\u5408\u5E76\u5B8C\u6210");
          alert('合并完成');
      }
      return TableMerger;
  }());

  var TableSplitter = (function () {
      function TableSplitter(table, items, index_column, exists_row) {
          if (exists_row === void 0) { exists_row = "skip"; }
          var fsig = getArgs("split", arguments);
          for (var tableName in items) {
              var rowfilter = items[tableName];
              table.canAssignTo(rowfilter.table.name);
          }
          var table_cmd = inject('table');
          var changed = Object.keys(items).map(function (tableName) {
              var rowfilter = items[tableName];
              var sourceRows = rowfilter.rows;
              var destTable = table_cmd(tableName);
              var destRows = destTable.rows().rows;
              var sourceKeys = sourceRows.map(function (r) { return r[index_column]; });
              var destKeys = destRows.map(function (r) { return r[index_column]; });
              var duplicateKeys = destKeys.filter(function (k) { return sourceKeys.indexOf(k) >= 0; });
              var updatingRows = [];
              var updatingOldRows = [];
              var adding;
              if (duplicateKeys.length > 0) {
                  adding = sourceRows.filter(function (r) { return duplicateKeys.indexOf(r[index_column]) === -1; });
                  if (exists_row == 'update') {
                      duplicateKeys.forEach(function (k) {
                          var source = sourceRows.filter(function (r) { return r[index_column] == k; })[0];
                          var dest = destRows.filter(function (r) { return r[index_column] == k; })[0];
                          updatingRows.push(source);
                          updatingOldRows.push(dest);
                      });
                  }
              }
              else {
                  adding = sourceRows;
              }
              printLog(fsig, "\u8BA1\u7B97\u66F4\u6539\uFF1A\u8868\u540D=".concat(tableName, "\uFF0C\u65B0\u589E=").concat(adding.length, "\u6761\uFF0C\u66F4\u65B0=").concat(updatingRows.length, "\u6761"));
              return {
                  adding: adding,
                  updating: {
                      old: updatingOldRows,
                      new: updatingRows
                  },
                  tableName: tableName
              };
          });
          var tips = false;
          changed.forEach(function (c) {
              printLog(fsig, "\u6267\u884C\u62C6\u5206\uFF0C".concat(table.name, "->").concat(c.tableName, "\uFF0C \u65B0\u589E=").concat(c.adding.length, "\uFF0C\u66F4\u65B0=").concat(c.updating.new.length));
              if (!confirm("\u672C\u6B21\u62C6\u5206\uFF1A".concat(table.name, "->").concat(c.tableName, "\uFF0C \u65B0\u589E=").concat(c.adding.length, "\uFF0C\u66F4\u65B0=").concat(c.updating.new.length, "\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F"))) {
                  alert("\u62C6\u5206\u4EFB\u52A1".concat(table.name, "->").concat(c.tableName, "\u5DF2\u53D6\u6D88"));
                  return;
              }
              if (c.updating.new.length > 0) {
                  printLog(fsig, "\u66F4\u65B0\u65E2\u6709\u6570\u636E\u2026\u2026");
                  base.modifyRows(c.tableName, c.updating.old, c.updating.new);
                  printLog(fsig, "\u65E2\u6709\u6570\u636E\u66F4\u65B0\u5B8C\u6210");
              }
              if (c.adding.length > 0) {
                  printLog(fsig, "\u6267\u884C\u65B0\u589E\u6570\u636E\u2026\u2026");
                  c.adding.forEach(function (r) { return base.addRow(c.tableName, r); });
                  printLog(fsig, "\u65B0\u589E\u6570\u636E\u5B8C\u6210");
              }
              printLog(fsig, "\u62C6\u5206\u4EFB\u52A1".concat(table.name, "->").concat(c.tableName, "\u5DF2\u5B8C\u6210"));
              tips = true;
          });
          if (tips) {
              alert('拆分操作已完成');
          }
      }
      return TableSplitter;
  }());

  var TableSelector = (function () {
      function TableSelector(table_name) {
          if (table_name === void 0) { table_name = undefined; }
          var fsig = getArgs("table", arguments);
          if (table_name) {
              this.obj = base.getTableByName(table_name);
              if (!this.obj) {
                  printLog(fsig, "\u8868\u683C\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u8868\u540D\u662F\u5426\u51C6\u786E", "error");
              }
          }
          else {
              this.obj = base.getActiveTable();
          }
          this.name = this.obj.name;
          printLog(fsig, "\u9009\u4E2D\u8868\u683C\uFF1A**".concat(this.name, "**"));
      }
      TableSelector.prototype.view = function (view_name) {
          if (view_name === void 0) { view_name = undefined; }
          return new ViewSelector(this, view_name);
      };
      TableSelector.prototype.rows = function (row_filter) {
          if (row_filter === void 0) { row_filter = undefined; }
          return this.view().rows(row_filter);
      };
      TableSelector.prototype.column = function (column_name) {
          return this.rows().column(column_name);
      };
      TableSelector.prototype.map = function (fill_column, index_column, map_key, result_column) {
          var fsig = getArgs("table.map", arguments);
          var maps = map_key.split('/');
          var sourceTableName = this.name;
          var sourceColumnName = map_key;
          if (maps.length > 1) {
              sourceTableName = maps[0];
              sourceColumnName = maps[1];
          }
          printLog(fsig, "\u76EE\u6807\u8868\uFF1A\u8868\u540D=".concat(this.name, "\uFF0C\u586B\u5145\u5B57\u6BB5=").concat(fill_column, "\uFF0C\u7D22\u5F15\u5B57\u6BB5=").concat(index_column));
          printLog(fsig, "\u6570\u636E\u6E90\uFF1A\u8868\u540D=".concat(sourceTableName, "\uFF0C\u6570\u636E\u5B57\u6BB5=").concat(result_column, "\uFF0C\u7D22\u5F15\u5B57\u6BB5=").concat(sourceColumnName));
          base.utils.lookupAndCopy(this.name, fill_column, index_column, sourceTableName, result_column, sourceColumnName);
      };
      TableSelector.prototype.mergeBy = function (index_column, subtables, duplicate_rows, exists_row) {
          if (duplicate_rows === void 0) { duplicate_rows = "first"; }
          if (exists_row === void 0) { exists_row = "skip"; }
          return new TableMerger(this, index_column, subtables, duplicate_rows, exists_row);
      };
      TableSelector.prototype.splitTo = function (items, index_column, exists_row) {
          if (exists_row === void 0) { exists_row = "skip"; }
          return new TableSplitter(this, items, index_column, exists_row);
      };
      TableSelector.prototype.canAssignTo = function (table_name) {
          var my_columns = base.getColumns(this.name);
          var other_columns = base.getColumns(table_name);
          var _loop_1 = function (mycol) {
              var name = mycol.name, type = mycol.type;
              var othercols = other_columns.filter(function (c) { return c['name'] == name; });
              if (!othercols || othercols.length == 0) {
                  return { value: die("\u5B57\u6BB5".concat(name, "\u5728").concat(table_name, "\u8868\u4E0D\u5B58\u5728")) };
              }
              var othercol = othercols[0];
              if (othercol['type'] != type) {
                  return { value: die("\u5B57\u6BB5".concat(name, "\u7684\u7C7B\u578B\u4E0E").concat(table_name, "\u8868\u4E0D\u4E00\u81F4")) };
              }
          };
          for (var _i = 0, my_columns_1 = my_columns; _i < my_columns_1.length; _i++) {
              var mycol = my_columns_1[_i];
              var state_1 = _loop_1(mycol);
              if (typeof state_1 === "object")
                  return state_1.value;
          }
      };
      return TableSelector;
  }());

  var RowSelector = (function () {
      function RowSelector() {
          var fsig = getArgs("row", arguments);
          this.obj = app.getCurrentRow();
          if (this.obj) {
              this.id = this.obj._id;
          }
          else {
              throw die('Row 对象只生效在当前行');
          }
          printLog(fsig, "\u83B7\u53D6\u5F53\u524D\u884C\uFF0CID=".concat(this.id));
      }
      RowSelector.prototype.column = function (column_name) {
          var rowsFilter = inject('rows')();
          rowsFilter.rows = [base.getRowById(rowsFilter.table.name, this.id)];
          return new ColumnModifier(rowsFilter, column_name);
      };
      return RowSelector;
  }());

  var Extjss = (function () {
      function Extjss() {
          this.debug = false;
          this.version();
      }
      Extjss.prototype.version = function () {
          console.warn("".concat(name, " v").concat(version));
      };
      Extjss.prototype.table = function (table_name) {
          if (table_name === void 0) { table_name = undefined; }
          return new TableSelector(table_name);
      };
      Extjss.prototype.view = function (view_name) {
          if (view_name === void 0) { view_name = undefined; }
          var table = inject('table');
          return new ViewSelector(table(), view_name);
      };
      Extjss.prototype.rows = function (filter) {
          if (filter === void 0) { filter = undefined; }
          var view = inject('view');
          return new RowsFilter(view(), filter);
      };
      Extjss.prototype.row = function () {
          return new RowSelector();
      };
      Extjss.prototype.column = function (column_name) {
          var rows = inject('rows');
          return new ColumnModifier(rows(), column_name);
      };
      Extjss.prototype.register = function (mount_point) {
          mount_point[name] = this;
          mount_point['table'] = this.table;
          mount_point['view'] = this.view;
          mount_point['rows'] = this.rows;
          mount_point['row'] = this.row;
          mount_point['column'] = this.column;
      };
      return Extjss;
  }());

  new Extjss().register(window);

})();
