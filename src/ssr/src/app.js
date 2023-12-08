import express from "express";
import React from "react";
import Home from "./containers/Home";
import { renderToString } from "react-dom/server";

const app = express();
app.use(express.static("public"));
const content = renderToString(<Home />);
app.get("/", function (req, res) {
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
