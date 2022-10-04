export const get = (obj: any, path: string, defaultValue: any) => {
  const pathArr = path.replace(/\[(\d+)]/g, '.$1');
  console.log(pathArr);
  // 迭代下去即可，略
};

get({ a: null }, 'a.b.c', 3);
// output: 3

get({ a: undefined }, 'a', 3);
// output: 3

get({ a: null }, 'a', 3);
// output: 3

get({ a: [{ b: 1 }] }, 'a[0].b', 3);
// output: 1
