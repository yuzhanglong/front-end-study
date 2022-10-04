export const templateReplace = (str: string, obj: Record<string, any>) => {
  return str.replace(/{{(.+?)}}/g, (res, args) => {
    return obj[args];
  });
};

console.log(
  templateReplace('{{hello}} world {{name}}', {
    hello: '你好',
    name: 'yzl',
  })
);
