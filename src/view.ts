import { base, getArgs, printLog } from "src/lib";
import { TableSelector } from "./table";
import { Types } from "src/types";
import { RowsFilter } from "./rows";

/**
 * 视图选择器
 * @hideconstructor
 */
export class ViewSelector {
    /**
     * 指定选择的视图名称
     */
    public name: string;
    /**
     * 被选择的 SeaTableAPI 中的 view 对象
     */
    public obj: any;

    /**
     * 构造方法
     * @param table 所属的表格选择器
     * @param view_name 要选择的视图名称，默认为undefined（当前活动的视图）
     */
    constructor(public table: TableSelector, view_name: string | undefined = undefined) {
        const fsig = getArgs("view", arguments);
        if (view_name) {
            this.obj = base.getViewByName(table.name, view_name);
            if (!this.obj) {
                printLog(`表格或视图不存在，请检查表名、视图命是否准确`, "error");
            }else {
                printLog(fsig, `选中表格\`${table.name}\`的视图\`${this.obj.name}\``)
            }
        } else {
            if (table.name != base.getActiveTable().name) {
                this.obj = base.getViews(table.name)[0];
                printLog(fsig, `选中表格\`${table.name}\`的第一个视图\`${this.obj.name}\``)
            } else {
                this.obj = base.getActiveView();
                printLog(fsig, `选中当前视图`);
            }
        }
        this.name = this.obj.name;
    }


    /**
     * 获取本视图的数据（记录）筛选器
     * @param row_filter 筛选方法，**可选的**，支持js函数`RowFilterFunction`、SeaTable 的文本筛选、SeaTable 文本筛选组（适合一般复杂场景）
     * @returns 数据（记录）筛选器
     */
    public rows(row_filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined): RowsFilter {
        return new RowsFilter(this, row_filter);
    }

}
