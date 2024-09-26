[**extjss v1.2.0**](../../README.md) • **Docs**

***

[extjss v1.2.0](../../modules.md) / [sync](../README.md) / RowSynchronizer

# 类: RowSynchronizer

数据同步器

## 特性

### rowsFilter

> **rowsFilter**: [`RowsFilter`](../../rows/classes/RowsFilter.md)

数据筛选器

## 方法

### exec()

> **exec**(`index_column`, `map_key`, `sync_method`, `delete_extra_rows`, `match_func`): `void`

执行同步

#### 参数

• **index\_column**: `string`

本表的关联列

• **map\_key**: `string`

匹配列 格式为：`表名/列名`

• **sync\_method**: `string` \| [`RowSyncFunction`](../../types/namespaces/Types/type-aliases/RowSyncFunction.md)

同步方法 可以为js方法(RowSyncFunction)或文本描述

• **delete\_extra\_rows**: `0` \| `1` = `0`

为 1 时删除目标表中多出的数据 默认为 0

• **match\_func**: `undefined` \| [`RowSyncMatchFunction`](../../types/namespaces/Types/type-aliases/RowSyncMatchFunction.md) = `undefined`

js匹配方法RowSyncMatchFunction，返回值为true是对目标行更新	仅更新行时有效

#### 返回

`void`
