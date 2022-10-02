export const numberFormat = (number: number) => {
  const numberStr = number.toString().split('');
  const len = numberStr.length;
  // 1234567
  // 7
  //

  for (let i = 0; i < numberStr.length; i++) {
    if (i !== 0 && i % 3 === 0) {
      // 后一位追加 ,
      numberStr.splice(len - i, 0, ',');
    }
  }
  return numberStr.join('');
};

console.log(numberFormat(1234567));
