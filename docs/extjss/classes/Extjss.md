[**extjss v1.1.0**](../../README.md) • **Docs**

***

[extjss v1.1.0](../../modules.md) / [extjss](../README.md) / Extjss

# 类: Extjss

Extjss 函数库

## 构造函数

### new Extjss()

> **new Extjss**(): [`Extjss`](Extjss.md)

#### 返回

[`Extjss`](Extjss.md)

## 方法

### column()

> **column**(`column_name`): [`ColumnModifier`](../../column/classes/ColumnModifier.md)

column指令，用于获取字段修改器

#### 参数

• **column\_name**: `string`

字段名称

#### 返回

[`ColumnModifier`](../../column/classes/ColumnModifier.md)

***

### register()

> **register**(`mount_point`): `void`

向 window 注册函数库

#### 参数

• **mount\_point**: `any`

注册点（window）

#### 返回

`void`

***

### row()

> **row**(): [`RowSelector`](../../row/classes/RowSelector.md)

row 指令，用于获取当前行

#### 返回

[`RowSelector`](../../row/classes/RowSelector.md)

***

### rows()

> **rows**(`filter`?): [`RowsFilter`](../../rows/classes/RowsFilter.md)

rows指令，用于获取数据筛选器

#### 参数

• **filter?**: `string` \| `string`[] \| [`RowFilterFunction`](../../types/namespaces/Types/type-aliases/RowFilterFunction.md) = `undefined`

筛选方法

#### 返回

[`RowsFilter`](../../rows/classes/RowsFilter.md)

数据筛选器

***

### table()

> **table**(`table_name`?): [`TableSelector`](../../table/classes/TableSelector.md)

table 指令，用于获取表格

#### 参数

• **table\_name?**: `string` = `undefined`

表格名称

#### 返回

[`TableSelector`](../../table/classes/TableSelector.md)

表格选择器

***

### version()

> **version**(): `void`

输出函数库版本号

#### 返回

`void`

***

### view()

> **view**(`view_name`?): [`ViewSelector`](../../view/classes/ViewSelector.md)

view 指令，用于获取视图

#### 参数

• **view\_name?**: `string` = `undefined`

视图名称

#### 返回

[`ViewSelector`](../../view/classes/ViewSelector.md)

视图选择器
