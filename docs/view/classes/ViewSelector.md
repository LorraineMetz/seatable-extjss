[**extjss v1.2.0**](../../README.md) • **Docs**

***

[extjss v1.2.0](../../modules.md) / [view](../README.md) / ViewSelector

# 类: ViewSelector

视图选择器

## 特性

### name

> **name**: `string`

指定选择的视图名称

***

### obj

> **obj**: `any`

被选择的 SeaTableAPI 中的 view 对象

***

### table

> **table**: [`TableSelector`](../../table/classes/TableSelector.md)

所属的表格选择器

## 方法

### rows()

> **rows**(`row_filter`): [`RowsFilter`](../../rows/classes/RowsFilter.md)

获取本视图的数据（记录）筛选器

#### 参数

• **row\_filter**: `undefined` \| `string` \| `string`[] \| [`RowFilterFunction`](../../types/namespaces/Types/type-aliases/RowFilterFunction.md) = `undefined`

筛选方法，**可选的**，支持js函数`RowFilterFunction`、SeaTable 的文本筛选、SeaTable 文本筛选组（适合一般复杂场景）

#### 返回

[`RowsFilter`](../../rows/classes/RowsFilter.md)

数据（记录）筛选器
