# seatable-extjss
seatable脚本扩展

# 使用方法

Seatable 中增加脚本，将代码复制放到脚本开头，即可调用扩展函数。
```js
await new Promise(res => {
  v='1.0.0';
  if (window.extjss) {
    res();
  } else {
    d = document;
    s = d.createElement("script");
    s.src =
      'https://cdn.jsdelivr.net/gh/LorraineMetz/seatable-extjss@v'+v+'/extjss.min.js';
    s.onload = res;
    d.body.appendChild(s);
  }
});
```

或

```js
await new Promise(res=>{v='1.0.0';if(window.extjss){res();}else{d=document;s=d.createElement("script");s.src='https://cdn.jsdelivr.net/gh/LorraineMetz/seatable-extjss@v'+v+'/extjss.min.js';s.onload=res;d.body.appendChild(s);}});
```
