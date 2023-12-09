"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "main";
exports.ids = ["main"];
exports.modules = {

/***/ "./src/client/index.js":
/*!*****************************!*\
  !*** ./src/client/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _containers_Home__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../containers/Home */ \"./src/containers/Home/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"../../node_modules/.pnpm/registry.npmmirror.com+react@18.2.0/node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom/client */ \"../../node_modules/.pnpm/registry.npmmirror.com+react-dom@18.2.0_react@18.2.0/node_modules/react-dom/client.js\");\n\n\n\nconst root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_2__.createRoot)(document.getElementById(\"root\"));\nroot.render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_containers_Home__WEBPACK_IMPORTED_MODULE_0__[\"default\"], null));\n\n//# sourceURL=webpack://ssr/./src/client/index.js?");

/***/ }),

/***/ "./src/containers/Home/index.js":
/*!**************************************!*\
  !*** ./src/containers/Home/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst React = __webpack_require__(/*! react */ \"../../node_modules/.pnpm/registry.npmmirror.com+react@18.2.0/node_modules/react/index.js\");\nconst Home = () => {\n  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(\"h1\", null, \"home\"), /*#__PURE__*/React.createElement(\"button\", {\n    onClick: () => {\n      alert(\"click\");\n    }\n  }, \"button\"));\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);\n\n//# sourceURL=webpack://ssr/./src/containers/Home/index.js?");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./runtime.8e310f07a4d53efc725e.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendors"], () => (__webpack_exec__("./src/client/index.js")));

})();