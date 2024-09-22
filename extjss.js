(function () {
  'use strict';

  var name = "extjss";
  var version = "1.1.0";

  var base = window['base'];
  var app = window['app'];
  function die(errMsg) {
      alert(errMsg);
      throw new Error(errMsg);
  }
  function inject(name) {
      return window[name];
  }

  var ColumnModifier = (function () {
      function ColumnModifier(rows_filter, column_name) {
          this.rowsFilter = rows_filter;
          if (column_name) {
              this._columnName = column_name;
          }
          else {
              throw die("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
          }
      }
      ColumnModifier.prototype.exec = function (func) {
          var _this = this;
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
              catch (error) {
                  return;
              }
          });
          base.modifyRows(this.rowsFilter.table.name, selectedRows, updateRows);
      };
      ColumnModifier.prototype.ref = function (raw_filter, func, operation, sourceTableName) {
          if (operation === void 0) { operation = undefined; }
          if (sourceTableName === void 0) { sourceTableName = undefined; }
          if (!sourceTableName) {
              sourceTableName = this.rowsFilter.table.name;
          }
          var sourceTable = base.getTableByName(sourceTableName);
          if (!sourceTable) {
              die("\u8868\u3010".concat(sourceTableName, "\u3011\u4E0D\u5B58\u5728"));
          }
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
      function RowSynchronizer(rows_filter) {
          this.rowsFilter = rows_filter;
      }
      RowSynchronizer.prototype.exec = function (index_column, map_key, sync_method, delete_extra_rows, match_func) {
          if (delete_extra_rows === void 0) { delete_extra_rows = 0; }
          if (match_func === void 0) { match_func = undefined; }
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
          var sourceRows = this.rowsFilter.rows;
          var destRows = destTable.rows.map(function (r) { return base.getRowById(destTableName, r['_id']); });
          var addingRows = [];
          var updatingOldRows = [];
          var updatingRows = [];
          var deletingRows = [];
          if (delete_extra_rows == 1) {
              destRows.forEach(function (drow) {
                  var srow = sourceRows.filter(function (r) { return r[sourceIndexName] == drow[destIndexName]; });
                  if (srow.length == 0) {
                      deletingRows.push(drow);
                  }
              });
          }
          var sync_func;
          if (typeof sync_method == 'string') {
              var pairs = sync_method.split(';').map(function (a) {
                  var kv = a.split(':');
                  if (kv.length > 1) {
                      return kv;
                  }
                  return [a, a];
              });
              sync_func = function (srow, type, drow) {
                  var newrow = {};
                  pairs.forEach(function (kv) {
                      newrow[kv[1]] = srow[kv[0]];
                  });
                  console.log(srow, newrow);
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
          this.rows = [];
          var tableName = view.table.name;
          var viewName = view.name;
          this.table = view.table;
          this.view = view;
          if (row_filter) {
              if (typeof row_filter == "function") {
                  this.rows = base
                      .getRows(tableName, viewName)
                      .filter(row_filter);
              }
              else if (typeof row_filter == "string") {
                  var result = base.filter(tableName, viewName, row_filter);
                  if (result) {
                      this.rows = result.all();
                  }
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
              }
          }
          else {
              this.rows = base.getRows(tableName, viewName);
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
          if (view_name) {
              this.obj = base.getViewByName(table.name, view_name);
          }
          else {
              if (table.name != base.getActiveTable().name) {
                  this.obj = base.getViews(table.name)[0];
              }
              else {
                  this.obj = base.getActiveView();
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

  var TableSelector = (function () {
      function TableSelector(table_name) {
          if (table_name === void 0) { table_name = undefined; }
          if (table_name) {
              this.obj = base.getTableByName(table_name);
          }
          else {
              this.obj = base.getActiveTable();
          }
          this.name = this.obj.name;
      }
      TableSelector.prototype.view = function (view_name) {
          if (view_name === void 0) { view_name = undefined; }
          return new ViewSelector(this, view_name);
      };
      TableSelector.prototype.map = function (fill_column, index_column, map_key, result_column) {
          var maps = map_key.split('/');
          var sourceTableName = this.name;
          var sourceColumnName = map_key;
          if (maps.length > 1) {
              sourceTableName = maps[0];
              sourceColumnName = maps[1];
          }
          base.utils.lookupAndCopy(this.name, fill_column, index_column, sourceTableName, result_column, sourceColumnName);
      };
      return TableSelector;
  }());

  var RowSelector = (function () {
      function RowSelector() {
          this.obj = app.getCurrentRow();
          if (this.obj) {
              this.id = this.obj._id;
          }
          else {
              throw die('Row 对象只生效在当前行');
          }
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
