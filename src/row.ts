import { app, base, die, inject } from "./lib";
import { ColumnModifier } from "./column";


/**
 * 当前行选择器（选中当前行）
 * @hideconstructor
 */
export class RowSelector {
    /**
     * 当前行的id
     */
    public id: string;
    /**
     * 当前行的对象
     */
    public obj: any;

    /**
     * 构造方法
     */
    constructor() {
        this.obj = app.getCurrentRow();
        if (this.obj) {
            this.id = this.obj._id;
        } else {
            throw die('Row 对象只生效在当前行');
        }
    }

    /**
     * 获取当前行的字段修改器
     * @param column_name 要修改的字段名称
     * @returns 字段修改器
     */
    public column(column_name: string) : ColumnModifier {
        const rowsFilter = inject('rows')();
        rowsFilter.rows = [base.getRowById(rowsFilter.table.name, this.id)];
        return new ColumnModifier(rowsFilter, column_name);
    }
}

