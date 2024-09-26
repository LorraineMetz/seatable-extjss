// 表拆分工具，链式调用法为：table().split({"表": "条件" or ()=>()}).exec(replace_duplicate)

import { base, getArgs, inject, printLog } from "./lib";
import { RowsFilter } from "./rows";
import { TableSelector } from "./table";


/**
 * 表拆分工具
 * @hideconstructor
 */
export class TableSplitter {

    /**
     * 表拆分工具
     */
    constructor(table: TableSelector,
        items: {[key: string]: RowsFilter}, 
        index_column: string,
        exists_row: "update"| "skip" = "skip"
    ) {
        const fsig = getArgs("split", arguments);

        // 验表
        for (const tableName in items) {
            const rowfilter = items[tableName];
            table.canAssignTo(rowfilter.table.name);
        }
     
        const table_cmd = inject('table');
        const changed = Object.keys(items).map(tableName=>{
            const rowfilter = items[tableName];

            const sourceRows = rowfilter.rows;

            const destTable: TableSelector = table_cmd(tableName);
            const destRows = destTable.rows().rows;

            const sourceKeys = sourceRows.map(r=>r[index_column]);
            const destKeys = destRows.map(r=>r[index_column]);

            // 判断重复值
            const duplicateKeys = destKeys.filter(k=> sourceKeys.indexOf(k)>=0);

            const updatingRows: any[] = [];
            const updatingOldRows: any[] = [];
            let adding: any[] ;
            if (duplicateKeys.length >0) {
                // 有重复数据时
                adding = sourceRows.filter(r=>duplicateKeys.indexOf(r[index_column])===-1);
                if (exists_row == 'update') {
                    duplicateKeys.forEach(k=> {
                        const source = sourceRows.filter(r=>r[index_column] == k)[0];
                        const dest = destRows.filter(r=>r[index_column] == k)[0];
                        updatingRows.push(source);
                        updatingOldRows.push(dest);
                    });
                }
            }else {
                adding = sourceRows;
            }

            printLog(fsig, `计算更改：表名=${tableName}，新增=${adding.length}条，更新=${updatingRows.length}条`);
            
            return {
                adding,
                updating: {
                    old: updatingOldRows,
                    new: updatingRows
                },
                tableName
            };
        });


        let tips = false;
        changed.forEach(c=>{
            printLog(fsig, `执行拆分，${table.name}->${c.tableName}， 新增=${c.adding.length}，更新=${c.updating.new.length}`);
            if (!confirm(`本次拆分：${table.name}->${c.tableName}， 新增=${c.adding.length}，更新=${c.updating.new.length}，是否继续？`)){
                alert(`拆分任务${table.name}->${c.tableName}已取消`)
                return;
            }


            if (c.updating.new.length > 0) {
                printLog(fsig, `更新既有数据……`);
                base.modifyRows(c.tableName, c.updating.old, c.updating.new);
                printLog(fsig, `既有数据更新完成`);
            }

            if (c.adding.length > 0) {
                printLog(fsig, `执行新增数据……`);
                c.adding.forEach(r => base.addRow(c.tableName, r))
                printLog(fsig, `新增数据完成`);
            }
            printLog(fsig, `拆分任务${table.name}->${c.tableName}已完成`);
            tips = true;
        });
        if (tips) {
            alert('拆分操作已完成');
        }
    }

}
