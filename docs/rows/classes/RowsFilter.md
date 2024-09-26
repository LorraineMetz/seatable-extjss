[**extjss v1.2.0**](../../README.md) • **Docs**

***

[extjss v1.2.0](../../modules.md) / [rows](../README.md) / RowsFilter

# 类: RowsFilter

数据行（记录）筛选器

## 特性

### rows

> **rows**: `any`[] = `[]`

已筛选的数据行（记录）

***

### table

> **table**: [`TableSelector`](../../table/classes/TableSelector.md)

所属的表格选择器

***

### view

> **view**: [`ViewSelector`](../../view/classes/ViewSelector.md)

视图选择器

## 方法

### column()

> **column**(`column_name`): [`ColumnModifier`](../../column/classes/ColumnModifier.md)

获取数据列（字段）修改器

#### 参数

• **column\_name**: `string`

指定要修改的字段名称

#### 返回

[`ColumnModifier`](../../column/classes/ColumnModifier.md)

数据列（字段）修改器

***

### print()

> **print**(`column_names`): `void`

列印已筛选的数据行指定的字段

#### 参数

• **column\_names**: `undefined` \| `string` \| `string`[] = `undefined`

字段名称、列名称

#### 返回

`void`

***

### sync()

> **sync**(`index_column`, `map_key`, `sync_method`, `delete_extra_rows`, `match_func`): `void`

获取数据行（记录）同步器

#### 参数

• **index\_column**: `string`

• **map\_key**: `string`

• **sync\_method**: `string` \| [`RowSyncFunction`](../../types/namespaces/Types/type-aliases/RowSyncFunction.md)

• **delete\_extra\_rows**: `0` \| `1` = `0`

• **match\_func**: `undefined` \| [`RowSyncMatchFunction`](../../types/namespaces/Types/type-aliases/RowSyncMatchFunction.md) = `undefined`

#### 返回

`void`
