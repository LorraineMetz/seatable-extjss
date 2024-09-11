// 请将本文件内代码置入seatable脚本开头

async function loadExtensions() {
  if (window.extjss) {
    return res();
  }

  return new Promise((res, rej) => {
    let script = document.createElement("script");
    script.src = "URL_ADDRESS";
    script.onload = () => {
      res();
    };
    document.body.appendChild(script);
  });
}

await loadExtensions();
