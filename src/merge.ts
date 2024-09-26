
import { base, getArgs, inject, printLog } from "./lib";
import { RowsFilter } from "./rows";
import { TableSelector } from "./table";

/**
 * 表格合并工具（要求所有合并的表格应具有相同的结构，或至少目标表结构均应在数据源表的存在
 * @hideconstructor
 */
export class TableMerger {

    /**
     * 执行合并（请注意，数据合并不会保留顺序）
     * @param subtables 其他表
     */
    constructor(table: TableSelector, 
        index_column: string, 
        subtables: Array<string> | Array<RowsFilter>,
        duplicate_rows: "first"| "all"= "first",
        exists_row: "update"| "skip" = "skip") {
        const fsig = getArgs("merge", arguments);
        printLog(fsig, "执行表格合并");

        for (const subtable of subtables) {
            if (typeof subtable == 'string') {
                table.canAssignTo(subtable);
            }else {
                table.canAssignTo(subtable.table.name);
            }
        }

        printLog(fsig, `表格数据结构相同，可以合并……`);

        const adding2 = (()=> {
            const table = inject('table');

            // 将表转为数据行数组
            printLog(fsig, `进行数据转换……`);
            const _table_rows: Array<any[]> = subtables.map(t=> {
                if (typeof t == 'string') {
                    const _ = table(t).rows().rows;
                    printLog(fsig, `表格${t}共${_.length}条数据`);
                    return _;
                }else {
                    const _ = t.rows;
                    printLog(fsig, `表格${t.table.name}共${_.length}条数据`);
                    return _;
                }
            });

            // 数组展开
            let table_rows = Array.prototype.concat.apply([], _table_rows);
            printLog(fsig, `数据展开完成，待合并表格共有${table_rows.length}条数据`);


            // 如果是first模式，将数组实时过滤
            if (duplicate_rows == 'first') {
                // 实时 key 表
                const rtKeys: string[] = [];

                table_rows = table_rows.filter(row=> {
                    const key: string  = row[index_column];
                    if (rtKeys.indexOf(key) >= 0) {
                        return false;
                    }
                    rtKeys.push(key);
                    return true;
                })
            }
            return table_rows;
        })();
        printLog(fsig, `共有${adding2.length}条数据需要合并至本表`);

        const updatingRows: any[] = [];
        const updatingOldRows: any[] = [];
        let addingRows: any[] = [];

        // 计算rows
        (function() {
            const myRows: any[] = table.rows().rows;
            const myRowsKeys = myRows.map(r=>r[index_column]);

            if (exists_row == 'skip') {
                addingRows = adding2.filter(r=>myRowsKeys.indexOf(r[index_column]) === -1);
                return;
            }
            // 更新数据
            for (const row of adding2) {
                const key = row[index_column];
                if (myRowsKeys.indexOf(key) >= 0) {
                    // 找到本表的重复数据
                    const exists_one = myRows.filter(r=>r[index_column] == key)[0];
                    updatingOldRows.push(exists_one);
                    updatingRows.push(row);
                }else {
                    addingRows.push(row);
                }
            }
        })();

        // 按照需要，更新数据，插入数据
        printLog(fsig, `本次合并共涉及到 ${addingRows.length} 条新增、${updatingRows.length} 条更新`);
        if (!confirm(`本次合并共涉及到 ${addingRows.length} 条新增、${updatingRows.length} 条更新，是否继续？`)) {
            printLog(fsig, `合并已取消`);
            alert("合并已取消");
            return;
        }

        if (updatingRows.length > 0) {
            printLog(fsig, `更新既有数据……`);
            base.modifyRows(table.name, updatingOldRows, updatingRows);
            printLog(fsig, `既有数据更新完成`);
        }

        if (addingRows.length > 0) {
            printLog(fsig, `执行新增数据……`);
            addingRows.forEach(r => base.addRow(table.name, r))
            printLog(fsig, `新增数据完成`);
        }
        printLog(fsig, `合并完成`);
        alert('合并完成');
    }
}