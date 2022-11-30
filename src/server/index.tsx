import express from "express";
import childProcess from "child_process";
import { renderToString } from "react-dom/server";
import path from "path";
import router from "@/router";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";

const app = express();
// 把模板元素转换成 HTML 字符串返回。
// 它的底层和客户端模板编译其实是一样的，都是根据 AST （也就是虚拟 DOM ）来转化成真实 DOM 的过程
// React 在它的基础上，提供了更多流相关的能力，返回了一套 server 相关的 api，

app.use(express.static(path.resolve(process.cwd(), "client_build")));

app.get("*", (req, res) => {
  const content = renderToString(
    // StaticRouter 无状态路由
    <StaticRouter location={req.path}>
      <Routes>
        {router?.map((item, index) => {
          return <Route key={index} {...item} />;
        })}
      </Routes>
    </StaticRouter>
  );

  res.send(`
    <html>
      <body>
        <div id="root">${content}</div>
        <script src="/index.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("ssr-server listen on 3000");
});

childProcess.exec("start http://127.0.0.1:3000");
