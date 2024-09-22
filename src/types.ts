/**
 * 常用的方法类型
 */
export declare namespace Types {
    /**
     * 
     */
    export type RowFilterFunction = (row: object) => boolean;
    export type RowsFilterFunction = (row: object, rows: Array<object>) => Array<object>;
    export type ColumnModifyFunction = (row: object) => any;
    export type ColumnRefModifyFunction = (row: object, ds: object) => any;
    export type RowSyncMatchFunction = (row_src: object, row_dst: object) => boolean;
    export type RowSyncFunction = (row_src: object, type: "add" | "update" | "delete", row_dst: object | undefined) => object;
}