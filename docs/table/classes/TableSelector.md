[**extjss v1.1.0**](../../README.md) • **Docs**

***

[extjss v1.1.0](../../modules.md) / [table](../README.md) / TableSelector

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

### view()

> **view**(`view_name`): [`ViewSelector`](../../view/classes/ViewSelector.md)

选择本表的一个视图（链式调用）

#### 参数

• **view\_name**: `undefined` \| `string` = `undefined`

要选择的视图名称，默认为 undefined（当前正在使用的视图）

#### 返回

[`ViewSelector`](../../view/classes/ViewSelector.md)

被选择的视图
