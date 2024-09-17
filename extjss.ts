const LIB_VERSION = "1.0.5";

declare namespace Types {
    export type RowFilterFunction = (row: object) => boolean;
    export type RowsFilterFunction = (row: object, rows: Array<object>) => Array<object>;
    export type ColumnModifyFunction = (row: object) => any;
    export type ColumnRefModifyFunction = (row: object, ds: object) => any;
    export type RowSyncMatchFunction = (row_src: object, row_dst: object) => boolean;
    export type RowSyncFunction = (row_src: object, type: "add" | "update" | "delete", row_dst: object | undefined) => object;
}


(function () {
    const base: any = window['base'];
    const app: any = window['app'];

    function die(errMsg) {
        alert(errMsg);
        throw new Error(errMsg);
    }

    window['extjss'] = function () {
        console.warn(`extjss v${LIB_VERSION} loaded`);
    };

    function table(table_name: string | undefined = undefined): Table {
        return new Table(table_name);
    }
    window['table'] = table;

    function view(view_name: string | undefined = undefined): View {
        return new View(table(), view_name);
    }
    window['view'] = view;

    function rows(filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined): RowsFilter {
        return new RowsFilter(view(), filter);
    }
    window['rows'] = rows;

    function row() {
        return new Row();
    }
    window['row'] = row;

    function column(column_name: string): ColumnModifier {
        return new ColumnModifier(rows(), column_name);
    }
    window['column'] = column;



    class ColumnModifier {
        public rowsFilter: RowsFilter;
        private _columnName: string;

        constructor(rows_filter: RowsFilter, column_name: string) {
            this.rowsFilter = rows_filter;
            if (column_name) {
                this._columnName = column_name;
            } else {
                die("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
            }
        }


        public exec(func: Types.ColumnModifyFunction): void {
            const selectedRows: Array<any> = [],
                updateRows: Array<any> = [];
            this.rowsFilter.rows.forEach((row) => {
                try {
                    const result = func(row);
                    selectedRows.push(row);
                    updateRows.push({
                        [this._columnName]: result,
                    });
                } catch (error) {
                    return;
                }
            });
            base.modifyRows(this.rowsFilter.table.name, selectedRows, updateRows);
        }

        public ref(raw_filter: Types.RowsFilterFunction, func: Types.ColumnRefModifyFunction,
            operation: "last" | "first" | undefined = undefined,
            sourceTableName: string | undefined = undefined): void {
            if (!sourceTableName) {
                sourceTableName = this.rowsFilter.table.name;
            }
            const sourceTable = base.getTableByName(sourceTableName);
            if (!sourceTable) {
                die(`表【${sourceTableName}】不存在`);
            }
            const sourceRows = sourceTable.rows.map(r => base.getRowById(sourceTableName, r['_id']))

            this.exec(r => {
                var results = raw_filter(r, sourceRows);
                if (operation == "last") {
                    return func(r, results[results.length - 1]);
                } else {
                    return func(r, results[0]);
                }
            });
        }

        //calc_option 可选值
        public map(index_column: string, map_key: string, result_column: string,
            operation: "sum" | "count" | "first" | "last" | "max" | "min" | "avg" | undefined = undefined): void {

            let sourceTableName = this.rowsFilter.table.name;
            let sourceColumnName = map_key;
            const maps = map_key.split('/');
            if (maps.length > 1) {
                sourceTableName = maps[0];
                sourceColumnName = maps[1];
            }
            const sourceTable = base.getTableByName(sourceTableName);
            if (!sourceTable) {
                die(`表【${sourceTableName}】不存在`);
            }
            const sourceRows = sourceTable.rows.map(r => base.getRowById(sourceTableName, r['_id']))

            this.exec(r => {
                var results = sourceRows.filter(a => a[sourceColumnName] == r[index_column]);
                if (results.length == 0) {
                    throw new Error();
                }
                switch (operation) {
                    case "sum":
                        return results.map(a => a[result_column] * 1).reduce((s, i) => s + i, 0);
                    case "avg":
                        return results.map(a => a[result_column] * 1).reduce((s, i) => s + i, 0) / results.length;
                    case "count":
                        return results.length;
                    case "max":
                        return Math.max(...results.map(a => a[result_column] * 1));
                    case "min":
                        return Math.min(...results.map(a => a[result_column] * 1));
                    case "first":
                        return results[0][result_column];
                    case "last":
                        return results[results.length - 1][result_column];
                    default:
                        return results[0][result_column];

                }
            });
        }
    }

    class RowSynchronizer {
        public rowsFilter: RowsFilter;

        constructor(rows_filter: RowsFilter) {
            this.rowsFilter = rows_filter;
        }


        public exec(
            index_column: string,
            map_key: string,
            sync_method: Types.RowSyncFunction | string,
            delete_extra_rows: 0 | 1 = 0,
            match_func: Types.RowSyncMatchFunction | undefined = undefined,
        ): void {
            const sourceTableName = this.rowsFilter.table.name;
            const sourceIndexName = index_column;

            const maps = map_key.split('/');
            if (maps.length <= 1) {
                return die("同步仅发生在两个不同的表格，请指定目标表格");
            }
            const destTableName = maps[0];
            const destIndexName = maps[1];

            const sourceTable = base.getTableByName(sourceTableName);
            if (!sourceTable) {
                die(`表【${sourceTableName}】不存在`);
            }

            const destTable = base.getTableByName(destTableName);
            if (!destTable) {
                die(`表【${destTableName}】不存在`);
            }

            const sourceRows = this.rowsFilter.rows;
            const destRows = destTable.rows.map(r => base.getRowById(destTableName, r['_id']));

            const addingRows: Array<object> = []
            const updatingOldRows: Array<object> = []
            const updatingRows: Array<object> = []
            const deletingRows: Array<object> = []

            if (delete_extra_rows == 1) {
                destRows.forEach(drow => {
                    const srow = sourceRows.filter(r => r[sourceIndexName] == drow[destIndexName]);
                    if (srow.length == 0) {
                        deletingRows.push(drow);
                    }
                });
            }

            let sync_func: Types.RowSyncFunction;
            if (typeof sync_method == 'string') {
                var pairs = sync_method.split(';').map(a=>{
                    const kv = a.split(':');
                    if (kv.length >1) {
                        return kv;
                    }
                    return [a, a];
                });
                sync_func = (srow: object, type: "add" | "update" | "delete", drow: object | undefined) =>{
                    const newrow = {};
                    pairs.forEach(kv=> {
                        newrow[kv[1]] = srow[kv[0]];
                    })
                    console.log(srow,newrow);
                    return newrow;
                };
            }else {
                sync_func = sync_method;
            }

            sourceRows.forEach(srow => {
                const drows = destRows.filter(d => d[destIndexName] == srow[sourceIndexName]);
                if (drows.length > 0) {
                    const drow = drows[0];
                    if (match_func) {
                        if (!match_func(srow, drow)) {
                            return;
                        }
                    }
                    updatingOldRows.push(drow);
                    updatingRows.push(sync_func(srow, 'update', drow));
                } else {
                    const newrow = sync_func(srow, 'add', undefined);
                    newrow[destIndexName] = srow[sourceIndexName];
                    addingRows.push(newrow);
                }
            });
            if (!confirm(`本次同步共涉及到 ${addingRows.length} 条新增、${updatingRows.length} 条更新、${deletingRows.length} 条删除操作，是否继续？`)) {
                return alert("同步已取消");
            }

            if (deletingRows.length > 0) {
                deletingRows.map(r => r['_id']).forEach(id => base.deleteRow(destTableName, id));
            }

            if (addingRows.length > 0) {
                addingRows.forEach(r => base.addRow(destTableName, r))
            }

            if (updatingRows.length > 0) {
                base.modifyRows(destTableName, updatingOldRows, updatingRows);
            }
            alert('同步完成');
        }
    }

    class RowsFilter {
        public table: Table;
        public view: View;
        public rows: Array<any> = [];

        constructor(view: View, row_filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined) {
            const tableName = view.table.name;
            const viewName = view.name;
            this.table = view.table;
            this.view = view;


            if (row_filter) {
                if (typeof row_filter == "function") {
                    this.rows = base
                        .getRows(tableName, viewName)
                        .filter(row_filter);
                } else if (typeof row_filter == "string") {
                    const result = base.filter(tableName, viewName, row_filter);
                    if (result) {
                        this.rows = result.all();
                    }
                } else if (Array.isArray(row_filter)) {
                    let qs;
                    row_filter.forEach(f => {
                        if (qs) {
                            qs = qs.filter(f);
                        } else {
                            qs = base.filter(tableName, viewName, f);
                        }
                    })
                    if (qs) {
                        this.rows = qs.all();
                    }
                }
            } else {
                this.rows = base.getRows(tableName, viewName);
            }
        }


        public column(column_name: string) {
            return new ColumnModifier(this, column_name);
        }

        public print(column_names: string | Array<string> | undefined = undefined): void {
            if (column_names) {
                if (typeof column_names == 'string') {
                    this.rows.forEach(r => {
                        console.log(r[column_names]);
                    })
                } else if (Array.isArray(column_names)) {

                    this.rows.forEach(r => {
                        console.log(column_names.map(k => r[k]));
                    })
                }
            } else {
                this.rows.forEach(r => {
                    console.log(r);
                })
            }

        }

        public sync(
            index_column: string,
            map_key: string,
            sync_method: Types.RowSyncFunction | string,
            delete_extra_rows: 0 | 1 = 0,
            match_func: Types.RowSyncMatchFunction | undefined = undefined): void {
            return new RowSynchronizer(this).exec(index_column, map_key, sync_method, delete_extra_rows, match_func);
        }
    }

    class Row {
        public id: string;
        public obj: any;

        constructor() {
            this.obj = app.getCurrentRow();
            if (this.obj) {
                this.id = this.obj._id;
            } else {
                die('Row 对象只生效在当前行');
            }
        }

        public column(column_name: string) {
            const rowsFilter = rows();
            rowsFilter.rows = [base.getRowById(rowsFilter.table.name, this.id)];
            return new ColumnModifier(rowsFilter, column_name);
        }
    }


    class View {
        public name: string;
        public obj: any;

        public table: Table;

        constructor(table: Table, view_name: string | undefined = undefined) {
            this.table = table;
            if (view_name) {
                this.obj = base.getViewByName(table.name, view_name);
            } else {
                if (table.name != base.getActiveTable().name) {
                    this.obj = base.getViews(table.name)[0];
                } else {
                    this.obj = base.getActiveView();
                }
            }
            this.name = this.obj.name;
        }


        public rows(row_filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined): RowsFilter {
            return new RowsFilter(this, row_filter);
        }

    }




    class Table {
        public name: string;
        public obj: any;


        constructor(table_name: string | undefined = undefined) {
            if (table_name) {
                this.obj = base.getTableByName(table_name);
            } else {
                this.obj = base.getActiveTable();
            }

            this.name = this.obj.name;
        }

        public view(view_name: string | undefined = undefined): View {
            return new View(this, view_name);
        }

        // lookupAndCopy
        public map(fill_column: string, index_column: string, map_key: string, result_column: string): void {
            const maps = map_key.split('/');
            let sourceTableName = this.name;
            let sourceColumnName = map_key;
            if (maps.length > 1) {
                sourceTableName = maps[0];
                sourceColumnName = maps[1];
            }

            base.utils.lookupAndCopy(
                this.name, fill_column, index_column,
                sourceTableName, result_column, sourceColumnName
            );
        }
    }

})();