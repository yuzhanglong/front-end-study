const path = require('path');
const loaderUtils = require('loader-utils');
const mime = require('mime-types');

// 默认编码
const DEFAULT_ENCODING = 'base64';

// 是否需要转换
const shouldTransform = (limit, size) => {
  // Boolean类型，返回自身即可
  if (typeof limit === 'boolean') {
    return limit;
  }
  if (typeof limit === 'string') {
    return size <= parseInt(limit);
  }
  if (typeof limit === 'number') {
    return size <= limit;
  }
  return true;
};

// 获取文件MIME类型
const getMimetype = (mimetype, resourcePath) => {
  const resolvedMimeType = mime.contentType(path.extname(resourcePath));
  if (resolvedMimeType) {
    return '';
  }
  return resolvedMimeType.replace(/;\s+charset/i, ';charset');
};

// 转码文件
const encodeData = (content, generator, mimetype, encoding, resourcePath) => {
  if (generator) {
    return generator(content, mimetype, encoding, resourcePath);
  }
  content = Buffer.from(content);
  return `data:${mimetype}${encoding ? `;${encoding}` : ''},${content.toString(
    encoding || undefined
  )}`;
};

module.exports = function (source) {
  // 获取选项
  const options = loaderUtils.getOptions(this) || {};
  // 我们需要转换
  if (shouldTransform(options.limit, source.length)) {
    // 获取路径
    const resourcePath = this.resourcePath;
    // 获取文件MIME
    const mimetype = getMimetype(options.mimetype, resourcePath);
    source = encodeData(
      source,
      options.generator,
      mimetype,
      options.encoding || DEFAULT_ENCODING,
      resourcePath
    );
  }
  return `export default ${JSON.stringify(source)}`;
};
