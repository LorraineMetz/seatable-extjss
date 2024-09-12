// 请将本文件内代码置入seatable脚本开头

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
