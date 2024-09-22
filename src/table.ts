import { base } from "src/lib";
import { ViewSelector } from "./view";

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
        if (table_name) {
            this.obj = base.getTableByName(table_name);
        } else {
            this.obj = base.getActiveTable();
        }

        this.name = this.obj.name;
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
     * 在另一个表（表B）中查找符合条件的数据，并填充到本表(表A)指定字段，参考 **Seatable** 的`base.utils.lookupAndCopy`函数。
     * 在需要的操作比较简单时，推荐使用该方法。
     * @see [base.utils.lookupAndCopy](https://seatable.github.io/seatable-scripts-cn/javascript/utils/#lookupandcopy)
     * @param fill_column 本表(表 A)要填充的字段列
     * @param index_column 本表（表 A）的关联列
     * @param map_key 关联表（表 B）的匹配列，格式为：`表名/列名`或`列名`，不指定表名时，关联当前表格（表 A）
     * @param result_column 关联表（表 B）的数据列
     */
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
