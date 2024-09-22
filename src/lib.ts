// 导出 base 、app
export const base : any = window['base'];
export const app : any = window['app'];

/**
 * 函数终止执行方法
 * @param errMsg 错误消息（会以强制弹窗形式展示）
 */
export function die(errMsg) {
    alert(errMsg);
    throw new Error(errMsg);
}

/**
 * 获取指令方式
 * @param name 指令名称
 */
export function inject(name: "table"| "view"| "rows"| "row"| "column") {
    return window[name];
}