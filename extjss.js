(function () {
    var base = window['base'];
    var app = window['app'];
    function die(errMsg) {
        alert(errMsg);
        throw new Error(errMsg);
    }
    window['extjss'] = function () {
        var LIB_VERSION = "1.0.3";
        console.warn("extjss v".concat(LIB_VERSION, " loaded"));
    };
    function table(table_name) {
        if (table_name === void 0) { table_name = undefined; }
        return new Table(table_name);
    }
    window['table'] = table;
    function view(view_name) {
        if (view_name === void 0) { view_name = undefined; }
        return new View(table(), view_name);
    }
    window['view'] = view;
    function rows(filter) {
        if (filter === void 0) { filter = undefined; }
        return new RowsFilter(view(), filter);
    }
    window['rows'] = rows;
    function row() {
        return new Row();
    }
    window['row'] = row;
    function column(column_name) {
        return new ColumnModifier(rows(), column_name);
    }
    window['column'] = column;
    var ColumnModifier = /** @class */ (function () {
        function ColumnModifier(rows_filter, column_name) {
            this.rowsFilter = rows_filter;
            if (column_name) {
                this._columnName = column_name;
            }
            else {
                die("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
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
        //calc_option 可选值
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
    var RowsFilter = /** @class */ (function () {
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
        return RowsFilter;
    }());
    var Row = /** @class */ (function () {
        function Row() {
            this.obj = app.getCurrentRow();
            if (this.obj) {
                this.id = this.obj._id;
            }
            else {
                die('Row 对象只生效在当前行');
            }
        }
        Row.prototype.column = function (column_name) {
            var rowsFilter = rows();
            rowsFilter.rows = [base.getRowById(rowsFilter.table.name, this.id)];
            return new ColumnModifier(rowsFilter, column_name);
        };
        return Row;
    }());
    var View = /** @class */ (function () {
        function View(table, view_name) {
            if (view_name === void 0) { view_name = undefined; }
            this.table = table;
            if (view_name) {
                this.obj = base.getViewByName(table.name, view_name);
            }
            else {
                this.obj = base.getActiveView();
            }
            this.name = this.obj.name;
        }
        View.prototype.rows = function (row_filter) {
            if (row_filter === void 0) { row_filter = undefined; }
            return new RowsFilter(this, row_filter);
        };
        return View;
    }());
    var Table = /** @class */ (function () {
        function Table(table_name) {
            if (table_name === void 0) { table_name = undefined; }
            if (table_name) {
                this.obj = base.getTableByName(table_name);
            }
            else {
                this.obj = base.getActiveTable();
            }
            this.name = this.obj.name;
        }
        Table.prototype.view = function (view_name) {
            if (view_name === void 0) { view_name = undefined; }
            return new View(this, view_name);
        };
        // lookupAndCopy
        Table.prototype.map = function (fill_column, index_column, map_key, result_column) {
            var maps = map_key.split('/');
            var sourceTableName = this.name;
            var sourceColumnName = map_key;
            if (maps.length > 1) {
                sourceTableName = maps[0];
                sourceColumnName = maps[1];
            }
            base.utils.lookupAndCopy(this.name, fill_column, index_column, sourceTableName, result_column, sourceColumnName);
        };
        return Table;
    }());
})();
