import { RowsFilter } from "./rows";
import { Types } from "./types";
import { die, base, printLog, getArgs } from "./lib";

/**
 * 数据同步器
 * @hideconstructor
 */
export class RowSynchronizer {

    /**
     * 
     * @param rowsFilter 数据筛选器
     */
    constructor(public rowsFilter: RowsFilter) {
        printLog(getArgs('sync', arguments), `执行数据同步器`);
    }


    /**
     * 执行同步
     * @param index_column 本表的关联列
     * @param map_key 匹配列 格式为：`表名/列名`
     * @param sync_method 同步方法 可以为js方法(RowSyncFunction)或文本描述
     * @param delete_extra_rows 为 1 时删除目标表中多出的数据 默认为 0
     * @param match_func js匹配方法RowSyncMatchFunction，返回值为true是对目标行更新	仅更新行时有效
     */
    public exec(
        index_column: string,
        map_key: string,
        sync_method: Types.RowSyncFunction | string,
        delete_extra_rows: 0 | 1 = 0,
        match_func: Types.RowSyncMatchFunction | undefined = undefined
    ): void {
        const fsig = getArgs('sync.exec', arguments);

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
        printLog(fsig, `执行数据同步，源表名=${sourceTableName}，源索引=${sourceIndexName}`)
        printLog(fsig, `执行数据同步，目标表=${destTableName}，目标索引=${destIndexName}`)

        const sourceRows = this.rowsFilter.rows;
        const destRows = destTable.rows.map(r => base.getRowById(destTableName, r['_id']));

        const addingRows: Array<object> = []
        const updatingOldRows: Array<object> = []
        const updatingRows: Array<object> = []
        const deletingRows: Array<object> = []

        if (delete_extra_rows == 1) {
            printLog(fsig, `提取目标表内的多余数据用于删除`)

            destRows.forEach(drow => {
                const srow = sourceRows.filter(r => r[sourceIndexName] == drow[destIndexName]);
                if (srow.length == 0) {
                    deletingRows.push(drow);
                }
            });
        }

        let sync_func: Types.RowSyncFunction;
        if (typeof sync_method == 'string') {
            const pairs = sync_method.split(';').map(a => {
                const kv = a.split(':');
                if (kv.length > 1) {
                    return kv;
                }
                return [a, a];
            });
            sync_func = (srow: object, type: "add" | "update" | "delete", drow: object | undefined) => {
                const newrow = {};
                pairs.forEach(kv => {
                    newrow[kv[1]] = srow[kv[0]];
                })
                console.log(srow, type, drow, newrow);
                return newrow;
            };
        } else {
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
