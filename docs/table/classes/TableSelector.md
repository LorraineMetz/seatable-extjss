[**extjss v1.2.0**](../../README.md) • **Docs**

***

[extjss v1.2.0](../../modules.md) / [table](../README.md) / TableSelector

# 类: TableSelector

表格选择器

## 特性

### name

> **name**: `string`

指定选择的表名

***

### obj

> **obj**: `any`

SeaTableAPI 中的 Table 对象

## 方法

### canAssignTo()

> **canAssignTo**(`table_name`): `void`

判断本表是否可以分配给目标表（本表的字段能在目标表中找到，目标表可以多于本表）

#### 参数

• **table\_name**: `string`

目标表名

#### 返回

`void`

***

### column()

> **column**(`column_name`): [`ColumnModifier`](../../column/classes/ColumnModifier.md)

获取本表当前（或默认）视图全部数据行的数据列（字段）修改器

#### 参数

• **column\_name**: `string`

指定要修改的字段名称

#### 返回

[`ColumnModifier`](../../column/classes/ColumnModifier.md)

数据列（字段）修改器

***

### map()

> **map**(`fill_column`, `index_column`, `map_key`, `result_column`): `void`

在另一个表（表B）中查找符合条件的数据，并填充到本表(表A)指定字段，参考 **Seatable** 的`base.utils.lookupAndCopy`函数。
在需要的操作比较简单时，推荐使用该方法。

#### 参数

• **fill\_column**: `string`

本表(表 A)要填充的字段列

• **index\_column**: `string`

本表（表 A）的关联列

• **map\_key**: `string`

关联表（表 B）的匹配列，格式为：`表名/列名`或`列名`，不指定表名时，关联当前表格（表 A）

• **result\_column**: `string`

关联表（表 B）的数据列

#### 返回

`void`

#### 参阅

[base.utils.lookupAndCopy](https://seatable.github.io/seatable-scripts-cn/javascript/utils/#lookupandcopy)

***

### mergeBy()

> **mergeBy**(`index_column`, `subtables`, `duplicate_rows`, `exists_row`): [`TableMerger`](../../merge/classes/TableMerger.md)

获取表格合并器

#### 参数

• **index\_column**: `string`

索引列

• **subtables**: `string`[] \| [`RowsFilter`](../../rows/classes/RowsFilter.md)[]

其他表，可以为文本表名或 行筛选器

• **duplicate\_rows**: `"all"` \| `"first"` = `"first"`

重复行处理方式， first：仅保留第一个表格的首个数据；all：保留所有数据

• **exists\_row**: `"update"` \| `"skip"` = `"skip"`

已存在行的处理方式，update：更新；skip：跳过

#### 返回

[`TableMerger`](../../merge/classes/TableMerger.md)

表格合并器

***

### rows()

> **rows**(`row_filter`): [`RowsFilter`](../../rows/classes/RowsFilter.md)

获取本表当前视图（或默认视图）的数据（记录）筛选器

#### 参数

• **row\_filter**: `undefined` \| `string` \| `string`[] \| [`RowFilterFunction`](../../types/namespaces/Types/type-aliases/RowFilterFunction.md) = `undefined`

筛选方法，**可选的**，支持js函数`RowFilterFunction`、SeaTable 的文本筛选、SeaTable 文本筛选组（适合一般复杂场景）

#### 返回

[`RowsFilter`](../../rows/classes/RowsFilter.md)

数据（记录）筛选器

***

### splitTo()

> **splitTo**(`items`, `index_column`, `exists_row`?): [`TableSplitter`](../../split/classes/TableSplitter.md)

获取表格分割工具，将当前表的数据分配到目标表（不删除当前表）

#### 参数

• **items**

表格定义，；类似`{"目标表 1": rows()}`的方式定义，你可以按需要筛选数据到不同的表格

• **index\_column**: `string`

索引列

• **exists\_row?**: `"update"` \| `"skip"` = `"skip"`

已存在的行处理方式，update：更新;skip：跳过

#### 返回

[`TableSplitter`](../../split/classes/TableSplitter.md)

表格分割器

***

### view()

> **view**(`view_name`): [`ViewSelector`](../../view/classes/ViewSelector.md)

选择本表的一个视图（链式调用）

#### 参数

• **view\_name**: `undefined` \| `string` = `undefined`

要选择的视图名称，默认为 undefined（当前正在使用的视图）

#### 返回

[`ViewSelector`](../../view/classes/ViewSelector.md)

被选择的视图
