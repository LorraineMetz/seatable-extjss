import { name as LIB_NAME } from 'package.json'
import { Extjss } from './extjss';

// 导出 base 、app
export const base: any = window['base'];
export const app: any = window['app'];

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
export function inject(name: "table" | "view" | "rows" | "row" | "column") {
    return window[name];
}

let jss: Extjss | undefined = undefined;
function getExtjss() {
    if (!jss) {
        jss = window[LIB_NAME];
    }
    return jss;
}
/**
 * 打印日志（需要开启debug开关），同步在控制台输出
 * @param info 要输出的内容 
 * @param level 日志级别
 */
export function printLog(command: string, info: string | Error, level: "log" | "warn" | "error" = "log") {
    if (!getExtjss()?.debug) {
        return
    }
    let msg = typeof info == "object" ? info.message : info;
    msg = `${command}:    ${msg}`;
    window['output'].markdown(`> [\`${level}\`] ${msg}`)
    switch (level) {
        case 'warn':
            return console.warn(msg);
        case 'error':
            return console.error(msg);
        default:
            console.log(msg);
    }
}

export function getArgs(function_name: string, _args: IArguments) {
    const argv: string[] = [];
    for (let i = 0; i < _args.length; i++) {
        const arg = _args[i];
        const tArg = typeof arg;
        switch (tArg) {
            case 'undefined':
                break;
            case 'symbol':
            case 'object':
            case 'function':
                argv.push("…")
                break;
            default:
                argv.push(arg);
        }
    }
    return `${function_name}(${argv.join(', ')})`;
}