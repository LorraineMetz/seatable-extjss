// [ ] 表合并工具，链式调用法为：table().mergeBy(索引列名, replace_duplicate).exec([表1, 表2, 表3])

import { TableSelector } from "./table";

/**
 * 表格合并工具（要求所有合并的表格应具有相同的结构，或至少目标表结构均应在数据源表的存在
 * @hideconstructor
 */
export class TableMerger {

    constructor(public table: TableSelector, public index_column: string, public duplicate_row: "append"| "update"| "skip" = "skip") {
    }


    // public exec(...source: string[] | RowsFilter[]) : void{

    // }
}