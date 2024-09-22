import { Types } from "./types";
import { TableSelector } from "./table";
import { ViewSelector } from "./view";
import { ColumnModifier } from "./column";
import { RowSynchronizer } from "./sync";
import { base } from "./lib";

/**
 * 数据行（记录）筛选器
 * @hideconstructor
 */
export class RowsFilter {
    /**
     * 所属的表格选择器
     */
    public table: TableSelector;
    /**
     * 所属的视图选择器
     */
    public view: ViewSelector;
    /**
     * 已筛选的数据行（记录）
     */
    public rows: Array<any> = [];
    

    /**
     * 
     * @param view 视图选择器
     * @param row_filter 筛选方法，参考View.rows()
     */
    constructor(view: ViewSelector, row_filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined) {
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


    /**
     * 获取数据列（字段）修改器
     * @param column_name 指定要修改的字段名称
     * @returns 数据列（字段）修改器
     */
    public column(column_name: string): ColumnModifier {
        return new ColumnModifier(this, column_name);
    }

    /**
     * 列印已筛选的数据行指定的字段
     * @param column_names 字段名称、列名称
     */
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

    /**
     * 获取数据行（记录）同步器
     * @param index_column 
     * @param map_key 
     * @param sync_method 
     * @param delete_extra_rows 
     * @param match_func 
     * @returns 
     */
    public sync(
        index_column: string,
        map_key: string,
        sync_method: Types.RowSyncFunction | string,
        delete_extra_rows: 0 | 1 = 0,
        match_func: Types.RowSyncMatchFunction | undefined = undefined): void {
        return new RowSynchronizer(this).exec(index_column, map_key, sync_method, delete_extra_rows, match_func);
    }
}
