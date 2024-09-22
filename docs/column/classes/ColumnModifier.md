[**extjss v1.1.0**](../../README.md) • **Docs**

***

[extjss v1.1.0](../../modules.md) / [column](../README.md) / ColumnModifier

# 类: ColumnModifier

字段修改器

## 特性

### rowsFilter

> **rowsFilter**: [`RowsFilter`](../../rows/classes/RowsFilter.md)

数据行筛选器

## 方法

### exec()

> **exec**(`func`): `void`

执行修改（最灵活的方法）

#### 参数

• **func**: [`ColumnModifyFunction`](../../types/namespaces/Types/type-aliases/ColumnModifyFunction.md)

javascript 方法

#### 返回

`void`

***

### map()

> **map**(`index_column`, `map_key`, `result_column`, `operation`): `void`

关联表更新，从其他表获取匹配的数据，更新到本表，类似 Table.map函数，有所区别，本方法支持聚合操作。（因涉及数据转换，执行耗时较长）

#### 参数

• **index\_column**: `string`

本表的关联列

• **map\_key**: `string`

匹配列 格式为：`表名/列名`或`列名`，不指定表名时，关联当前表格

• **result\_column**: `string`

关联表的数据列	函数将使用该列的结果

• **operation**: `undefined` \| `"max"` \| `"min"` \| `"sum"` \| `"last"` \| `"first"` \| `"count"` \| `"avg"` = `undefined`

聚合操作 **可选的**，支持`sum`、`count`、`first`、`last`、`max`、`min`、`avg`，为空时使用首行结果（部分聚合操作，仅限数字列）

#### 返回

`void`

***

### ref()

> **ref**(`raw_filter`, `func`, `operation`, `sourceTableName`): `void`

参考数据（从当前表格或其他表格中查找符合要求的数据行，用于修改本记录，例如查找上一行的余额）

#### 参数

• **raw\_filter**: [`RowsFilterFunction`](../../types/namespaces/Types/type-aliases/RowsFilterFunction.md)

js过滤函数

• **func**: [`ColumnRefModifyFunction`](../../types/namespaces/Types/type-aliases/ColumnRefModifyFunction.md)

结果修改函数

• **operation**: `undefined` \| `"last"` \| `"first"` = `undefined`

引用哪条数据，**可选**，支持`last`、`first`，默认为`first`

• **sourceTableName**: `undefined` \| `string` = `undefined`

数据来源的表名，**可选的**

#### 返回

`void`
