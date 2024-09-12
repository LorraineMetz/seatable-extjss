const LIB_VERSION = "1.0.4";

declare namespace Types {
    export type RowFilterFunction = (row: object) => boolean;
    export type RowsFilterFunction = (row: object, rows: Array<object>) => Array<object>;
    export type ColumnModifyFunction = (row: object) => any;
    export type ColumnRefModifyFunction = (row: object, ds: object) => any;
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
                }else {
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






