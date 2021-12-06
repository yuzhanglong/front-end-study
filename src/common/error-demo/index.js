const a = () => {
  console.log(111);
  const c = () => {
    throw new Error('hello world!');
  };
  c();
};

const b = () => {
  console.log('bbbb');
  a();
};
