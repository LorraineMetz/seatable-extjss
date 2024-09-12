table('表名(不写的话默认当前表)')
    .view('视图名称')
        .rows(筛选器)
            .column('字段名')
                .exec(javascript_func)
        