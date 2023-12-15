import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import router from "./router";

const app = express();
app.use(express.static("public"));

app.get("*", function (req, res) {
  const content = renderToString(
    <StaticRouter context={{}} location={req.path}>
      {router}
    </StaticRouter>,
  );
  res.send(
    `<html>
			<head>
				<title>hello</title>
			</head>
			<body>
				<div id="root">${content}</div>
				<script src="index.js"></script>
			</body>
  	</html>`,
  );
});

app.listen(3000);
