"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceSize = function (content, size) {
    return content.replace(/#size#/g, String(size));
};
exports.replaceCases = function (content, cases) {
    return content.replace(/#cases#/g, cases);
};
exports.replaceNames = function (content, names) {
    return content.replace(/#names#/g, names.join("' | '"));
};
exports.replaceNamesArray = function (content, names) {
    return content.replace(/#namesArray#/g, JSON.stringify(names)
        .replace(/"/g, '\'')
        .replace(/','/g, '\', \''));
};
exports.replaceComponentName = function (content, name) {
    return content.replace(/#componentName#/g, name);
};
exports.replaceSingleIconContent = function (content, render) {
    return content.replace(/#iconContent#/g, render);
};
exports.replaceImports = function (content, imports) {
    return content.replace(/#imports#/g, imports.map(function (item) { return "import " + item + " from './" + item + "';"; }).join('\n'));
};
exports.replaceSizeUnit = function (content, unit) {
    return content.replace(/\{size\}/g, "{size + '" + unit + "'}");
};
exports.replaceExports = function (content, exports) {
    return content.replace(/#exports#/g, exports.map(function (item) { return "export { default as " + item + " } from './" + item + "';"; }).join('\n'));
};
