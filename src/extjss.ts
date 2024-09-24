import { version as LIB_VERSION, name as LIB_NAME } from 'package.json'

import { TableSelector } from './table';
import { ViewSelector } from './view';
import { inject } from './lib';
import { Types } from './types';
import { RowsFilter } from './rows';
import { RowSelector } from './row';
import { ColumnModifier } from './column';

/**
 * Extjss 函数库
 */
export class Extjss {

    /**
     * 是否开启debug模式
     */
    public debug: boolean = false;

    constructor() {
        this.version();
    }

    /**
     * 输出函数库版本号
     */
    public version() {
        console.warn(`${LIB_NAME} v${LIB_VERSION}`);
    }

    /**
     * table 指令，用于获取表格
     * @param [table_name=undefined] 表格名称
     * @returns 表格选择器
     */
    public table(table_name: string | undefined = undefined): TableSelector {
        return new TableSelector(table_name);
    }

    /**
     * view 指令，用于获取视图
     * @param [view_name=undefined] 视图名称
     * @returns 视图选择器
     */
    public view(view_name: string | undefined = undefined): ViewSelector {
        const table = inject('table');
        return new ViewSelector(table(), view_name);
    }

    /**
     * rows指令，用于获取数据筛选器
     * @param [filter=undefined] 筛选方法
     * @returns 数据筛选器
     */
    public rows(filter: Types.RowFilterFunction | string | Array<string> | undefined = undefined): RowsFilter {
        const view = inject('view');
        return new RowsFilter(view(), filter);
    }

    /**
     * row 指令，用于获取当前行
     * @returns 
     */
    public row() {
        return new RowSelector();
    }

    /**
     * column指令，用于获取字段修改器
     * @param column_name 字段名称
     * @returns 
     */
    public column(column_name: string): ColumnModifier {
        const rows = inject('rows');
        return new ColumnModifier(rows(), column_name);
    }


    /**
     * 向 window 注册函数库
     * @param mount_point 注册点（window）
     */
    public register(mount_point: any) {
        mount_point[LIB_NAME] = this;

        // 挂载函数
        mount_point['table'] = this.table;
        mount_point['view'] = this.view;
        mount_point['rows'] = this.rows;
        mount_point['row'] = this.row;
        mount_point['column'] = this.column;
    }
}
