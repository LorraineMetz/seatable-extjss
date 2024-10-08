import { base, die, getArgs, printLog } from "src/lib";
import { ViewSelector } from "./view";
import { Types } from "./types";
import { RowsFilter } from "./rows";
import { ColumnModifier } from "./column";
import { TableMerger } from "./merge";
import { TableSplitter } from "./split";

/**
 * 表格选择器
 * @hideconstructor
 */
export class TableSelector {
    /**
     * 指定选择的表名
     */
    public name: string;
    /**
     * SeaTableAPI 中的 Table 对象
     */
    public obj: any;


    /**
     * 构造方法
     * @param table_name 要选择的表名，默认为undefined（当前活动的表格）
     */
    constructor(table_name: string | undefined = undefined) {
        const fsig = getArgs("table", arguments);
        if (table_name) {
            this.obj = base.getTableByName(table_name);
            if (!this.obj) {
                printLog(fsig, `表格不存在，请检查表名是否准确`, "error");
            }
        } else {
            this.obj = base.getActiveTable();
        }

        this.name = this.obj.name;
        printLog(fsig, `选中表格：**${this.name}**`)
    }

    /**
     * 选择本表的一个视图（链式调用）
     * @param view_name 要选择的视图名称，默认为 undefined（当前正在使用的视图）
     * @returns 被选择的视图
     */
    public view(view_name: string | undefined = undefined): ViewSelector {
        return new ViewSelector(this, view_name);
    }

    
    /**
     * 获取本表当前视图（或默认视图）的数据（记录）筛选器
     * @param row_filter 筛选方法，**可选的**，支持js函数`RowFilterFunction`、SeaTable 的文本筛选、SeaTable 文本筛选组（适合一般复杂场景）
     * @returns 数据（记录）筛选器
     */
    public rows(row_filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined): RowsFilter {
        return this.view().rows(row_filter);
    }

    /**
     * 获取本表当前（或默认）视图全部数据行的数据列（字段）修改器
     * @param column_name 指定要修改的字段名称
     * @returns 数据列（字段）修改器
     */
    public column(column_name: string): ColumnModifier {
        return this.rows().column(column_name);
    }


    /**
     * 在另一个表（表B）中查找符合条件的数据，并填充到本表(表A)指定字段，参考 **Seatable** 的`base.utils.lookupAndCopy`函数。
     * 在需要的操作比较简单时，推荐使用该方法。
     * @see [base.utils.lookupAndCopy](https://seatable.github.io/seatable-scripts-cn/javascript/utils/#lookupandcopy)
     * @param fill_column 本表(表 A)要填充的字段列
     * @param index_column 本表（表 A）的关联列
     * @param map_key 关联表（表 B）的匹配列，格式为：`表名/列名`或`列名`，不指定表名时，关联当前表格（表 A）
     * @param result_column 关联表（表 B）的数据列
     */
    public map(fill_column: string, index_column: string, map_key: string, result_column: string): void {
        const fsig = getArgs("table.map", arguments);


        const maps = map_key.split('/');
        let sourceTableName = this.name;
        let sourceColumnName = map_key;
        if (maps.length > 1) {
            sourceTableName = maps[0];
            sourceColumnName = maps[1];
        }
        printLog(fsig, `目标表：表名=${this.name}，填充字段=${fill_column}，索引字段=${index_column}`)
        printLog(fsig, `数据源：表名=${sourceTableName}，数据字段=${result_column}，索引字段=${sourceColumnName}`)

        base.utils.lookupAndCopy(
            this.name, fill_column, index_column,
            sourceTableName, result_column, sourceColumnName
        );
    }


    /**
     * 获取表格合并器
     * @param index_column 索引列
     * @param subtables 其他表，可以为文本表名或 行筛选器
     * @param duplicate_rows 重复行处理方式， first：仅保留第一个表格的首个数据；all：保留所有数据
     * @param exists_row 已存在行的处理方式，update：更新；skip：跳过
     * @returns 表格合并器
     */
    public mergeBy(index_column: string, 
        subtables: Array<string> | Array<RowsFilter>,
        duplicate_rows: "first"| "all"= "first",
        exists_row: "update"| "skip" = "skip"): TableMerger {
        return new TableMerger(this, index_column, subtables, duplicate_rows, exists_row);
    }

    /**
     * 获取表格分割工具，将当前表的数据分配到目标表（不删除当前表）
     * @param items 表格定义，；类似`{"目标表 1": rows()}`的方式定义，你可以按需要筛选数据到不同的表格
     * @param index_column 索引列
     * @param [exists_row="skip"] 已存在的行处理方式，update：更新;skip：跳过
     * @returns 表格分割器
     */
    public splitTo(items: {[key: string]: RowsFilter}, index_column: string, exists_row: "update"| "skip" = "skip"): TableSplitter {
        return new TableSplitter(this, items, index_column, exists_row);
    }

    /**
     * 判断本表是否可以分配给目标表（本表的字段能在目标表中找到，目标表可以多于本表）
     * @param table_name 目标表名
     */
    public canAssignTo(table_name: string) {
        const my_columns = base.getColumns(this.name);
        const other_columns = base.getColumns(table_name);

        for(const mycol of my_columns) {
            const {name, type} = mycol;
            const othercols = other_columns.filter(c=>c['name'] == name);
            if (!othercols || othercols.length == 0) {
                return die(`字段${name}在${table_name}表不存在`);
            }
            const othercol = othercols[0];
            if (othercol['type'] != type) {
                return die(`字段${name}的类型与${table_name}表不一致`);
            }
        }

    }
}
