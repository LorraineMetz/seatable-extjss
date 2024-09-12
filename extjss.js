class Table {
  constructor(table_name) {
    if (table_name) {
      this._tableName = table_name;
    } else {
      this._tableName = base.getActiveTable().name;
    }

    this._tableObj = base.getTableByName(this._tableName);
    return this;
  }

  view(view_name) {
    if (view_name) {
      this._viewName = view_name;
    } else {
      this._viewName = base.getActiveView();
    }

    this._viewObj = base.getViewByName(this._tableName, this._viewName);
    return this;
  }

  rows(filter) {
    if (filter) {
      if (typeof filter == "function") {
        this._rowsObj = base
          .getRows(this._tableName, this._viewName)
          .filter(filter);
      } else if (typeof filter == "string") {
        this._rowsObj = base.filter(this._tableName, this._viewName, filter);
      }
    } else {
      this._rowsObj = base.getRows(this._tableName, this._viewName);
    }
    return this;
  }

  column(column_name) {
    if (column_name) {
      this._columnName = column_name;
    }else {
      alert("脚本执行失败，原因是未指定字段名称“.column(column_name)”");
    }
    return this;
  }

  exec(func) {
    var selectedRows = [],
      updateRows = [];
    this._rowsObj.forEach((row) => {
      selectedRows.push(row);
      updateRows.push({
        [this._columnName]: func(row),
      });
    });
    base.modifyRows(this._tableObj, selectedRows, updateRows);
  }
}

window.extjss = (function () {
  const FUNC_VERSION = "1.0.1";
  console.warn("extjss loaded");

  window.table = function (table_name) {
    return new Table(table_name);
  };

  window.view = function (view_name) {
    return table().view(view_name);
  };

  window.rows = function (filter) {
    return view().rows(filter);
  };

  window.column = function (column_name) {
    return rows().column(column_name);
  };

  return {
    version: FUNC_VERSION,
  };
})();
