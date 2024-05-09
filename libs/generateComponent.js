"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
var glob_1 = tslib_1.__importDefault(require("glob"));
var colors_1 = tslib_1.__importDefault(require("colors"));
var lodash_1 = require("lodash");
var getTemplate_1 = require("./getTemplate");
var replace_1 = require("./replace");
var whitespace_1 = require("./whitespace");
var copyTemplate_1 = require("./copyTemplate");
var ATTRIBUTE_FILL_MAP = ['path'];
exports.generateComponent = function (data, config) {
    var names = [];
    var imports = [];
    var saveDir = path_1.default.resolve(config.save_dir);
    var jsxExtension = config.use_typescript ? '.tsx' : '.js';
    var jsExtension = config.use_typescript ? '.ts' : '.js';
    var cases = '';
    mkdirp_1.default.sync(saveDir);
    glob_1.default.sync(path_1.default.join(saveDir, '*')).forEach(function (file) { return fs_1.default.unlinkSync(file); });
    copyTemplate_1.copyTemplate("helper" + jsExtension, path_1.default.join(saveDir, "helper" + jsExtension));
    if (!config.use_typescript) {
        copyTemplate_1.copyTemplate('helper.d.ts', path_1.default.join(saveDir, 'helper.d.ts'));
    }
    data.svg.symbol.forEach(function (item) {
        var singleFile;
        var iconId = item.$.id;
        var iconIdAfterTrim = config.trim_icon_prefix
            ? iconId.replace(new RegExp("^" + config.trim_icon_prefix + "(.+?)$"), function (_, value) { return value.replace(/^[-_.=+#@!~*]+(.+?)$/, '$1'); })
            : iconId;
        var componentName = lodash_1.upperFirst(lodash_1.camelCase(iconId));
        names.push(iconIdAfterTrim);
        cases += whitespace_1.whitespace(4) + "case '" + iconIdAfterTrim + "':\n";
        imports.push(componentName);
        cases += whitespace_1.whitespace(6) + "return <" + componentName + " {...rest} />;\n";
        singleFile = getTemplate_1.getTemplate('SingleIcon' + jsxExtension);
        singleFile = replace_1.replaceSize(singleFile, config.default_icon_size);
        singleFile = replace_1.replaceComponentName(singleFile, componentName);
        singleFile = replace_1.replaceSingleIconContent(singleFile, generateCase(item, 4));
        singleFile = replace_1.replaceSizeUnit(singleFile, config.unit);
        fs_1.default.writeFileSync(path_1.default.join(saveDir, componentName + jsxExtension), singleFile);
        if (!config.use_typescript) {
            var typeDefinitionFile = getTemplate_1.getTemplate('SingleIcon.d.ts');
            typeDefinitionFile = replace_1.replaceComponentName(typeDefinitionFile, componentName);
            fs_1.default.writeFileSync(path_1.default.join(saveDir, componentName + '.d.ts'), typeDefinitionFile);
        }
        console.log(colors_1.default.green('√') + " Generated icon \"" + colors_1.default.yellow(iconId) + "\"");
    });
    var iconFile = getTemplate_1.getTemplate('Icon' + jsxExtension);
    iconFile = replace_1.replaceCases(iconFile, cases);
    iconFile = replace_1.replaceImports(iconFile, imports);
    iconFile = replace_1.replaceExports(iconFile, imports);
    if (config.use_typescript) {
        iconFile = replace_1.replaceNames(iconFile, names);
    }
    else {
        iconFile = replace_1.replaceNamesArray(iconFile, names);
        var typeDefinitionFile = getTemplate_1.getTemplate("Icon.d.ts");
        typeDefinitionFile = replace_1.replaceExports(typeDefinitionFile, imports);
        typeDefinitionFile = replace_1.replaceNames(typeDefinitionFile, names);
        fs_1.default.writeFileSync(path_1.default.join(saveDir, 'index.d.ts'), typeDefinitionFile);
    }
    fs_1.default.writeFileSync(path_1.default.join(saveDir, 'index' + jsxExtension), iconFile);
    console.log("\n" + colors_1.default.green('√') + " All icons have putted into dir: " + colors_1.default.green(config.save_dir) + "\n");
};
var generateCase = function (data, baseIdent) {
    var e_1, _a;
    var template = "\n" + whitespace_1.whitespace(baseIdent) + "<svg viewBox=\"" + data.$.viewBox + "\" width={size} height={size} style={style} {...rest}>\n";
    var _loop_1 = function (domName) {
        if (domName === '$') {
            return "continue";
        }
        if (!domName) {
            console.error(colors_1.default.red("Unable to transform dom \"" + domName + "\""));
            process.exit(1);
        }
        var counter = {
            colorIndex: 0,
            baseIdent: baseIdent,
        };
        if (data[domName].$) {
            template += whitespace_1.whitespace(baseIdent + 2) + "<" + domName + addAttribute(domName, data[domName], counter) + "\n" + whitespace_1.whitespace(baseIdent + 2) + "/>\n";
        }
        else if (Array.isArray(data[domName])) {
            data[domName].forEach(function (sub) {
                template += whitespace_1.whitespace(baseIdent + 2) + "<" + domName + addAttribute(domName, sub, counter) + "\n" + whitespace_1.whitespace(baseIdent + 2) + "/>\n";
            });
        }
    };
    try {
        for (var _b = tslib_1.__values(Object.keys(data)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var domName = _c.value;
            _loop_1(domName);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    template += whitespace_1.whitespace(baseIdent) + "</svg>\n";
    return template;
};
var addAttribute = function (domName, sub, counter) {
    var e_2, _a;
    var template = '';
    if (sub && sub.$) {
        if (ATTRIBUTE_FILL_MAP.includes(domName)) {
            // Set default color same as in iconfont.cn
            // And create placeholder to inject color by user's behavior
            sub.$.fill = sub.$.fill || '#333333';
        }
        try {
            for (var _b = tslib_1.__values(Object.keys(sub.$)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var attributeName = _c.value;
                if (attributeName === 'fill') {
                    template += "\n" + whitespace_1.whitespace(counter.baseIdent + 4) + lodash_1.camelCase(attributeName) + "={getIconColor(color, " + counter.colorIndex + ", '" + sub.$[attributeName] + "')}";
                    counter.colorIndex += 1;
                }
                else {
                    template += "\n" + whitespace_1.whitespace(counter.baseIdent + 4) + lodash_1.camelCase(attributeName) + "=\"" + sub.$[attributeName] + "\"";
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return template;
};
