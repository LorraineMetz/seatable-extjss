import { RowsFilter } from "./rows";
import { die, base, getArgs, printLog } from "./lib";
import { Types } from "./types";

/**
 * 字段修改器
 * @hideconstructor
 */
export class ColumnModifier {

    /**
     * 
     * @param rowsFilter 数据行筛选器
     * @param _columnName 要修改的字段名称
     */
    constructor(public rowsFilter: RowsFilter, private _columnName: string) {
        const fsig = getArgs('column', arguments);

        if (!this._columnName) {
            throw die("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
        }
        printLog(fsig, '获取数据列修改器');
    }


    /**
     * 执行修改（最灵活的方法）
     * @param func javascript 方法
     */
    public exec(func: Types.ColumnModifyFunction): void {
        const fsig = getArgs('column.exec', arguments);
        printLog(fsig, '执行方法');
        const selectedRows: Array<any> = [],
            updateRows: Array<any> = [];
        this.rowsFilter.rows.forEach((row) => {
            try {
                const result = func(row);
                selectedRows.push(row);
                updateRows.push({
                    [this._columnName]: result,
                });
            } catch {
                return;
            }
        });
        base.modifyRows(this.rowsFilter.table.name, selectedRows, updateRows);
    }

    /**
     * 参考数据（从当前表格或其他表格中查找符合要求的数据行，用于修改本记录，例如查找上一行的余额）
     * @param raw_filter js过滤函数
     * @param func 结果修改函数
     * @param operation 引用哪条数据，**可选**，支持`last`、`first`，默认为`first`
     * @param sourceTableName 数据来源的表名，**可选的**
     */
    public ref(raw_filter: Types.RowsFilterFunction, func: Types.ColumnRefModifyFunction,
        operation: "last" | "first" | undefined = undefined,
        sourceTableName: string | undefined = undefined): void {
        const fsig = getArgs('column.exec', arguments);

        if (!sourceTableName) {
            sourceTableName = this.rowsFilter.table.name;
        }
        const sourceTable = base.getTableByName(sourceTableName);
        if (!sourceTable) {
            die(`表【${sourceTableName}】不存在`);
        }
        printLog(fsig, `执行方法，源表名=${sourceTableName}`);

        const sourceRows = sourceTable.rows.map(r => base.getRowById(sourceTableName, r['_id']))

        this.exec(r => {
            const results = raw_filter(r, sourceRows);
            if (operation == "last") {
                return func(r, results[results.length - 1]);
            } else {
                return func(r, results[0]);
            }
        });
    }

    /**
     * 关联表更新，从其他表获取匹配的数据，更新到本表，类似 Table.map函数，有所区别，本方法支持聚合操作。（因涉及数据转换，执行耗时较长）
     * @param index_column 本表的关联列
     * @param map_key 匹配列 格式为：`表名/列名`或`列名`，不指定表名时，关联当前表格
     * @param result_column 关联表的数据列	函数将使用该列的结果
     * @param operation 聚合操作 **可选的**，支持`sum`、`count`、`first`、`last`、`max`、`min`、`avg`，为空时使用首行结果（部分聚合操作，仅限数字列）
     */
    public map(index_column: string, map_key: string, result_column: string,
        operation: "sum" | "count" | "first" | "last" | "max" | "min" | "avg" | undefined = undefined): void {
        const fsig = getArgs('column.map', arguments);

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
        printLog(fsig, `执行方法，源表名=${sourceTableName}， 源数据列名=${sourceColumnName}`);

        const sourceRows = sourceTable.rows.map(r => base.getRowById(sourceTableName, r['_id']))

        this.exec(r => {
            const results = sourceRows.filter(a => a[sourceColumnName] == r[index_column]);
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
