export const countDuplicatedCharacterInWords = (str: string) => {
  let count = 0;

  let prev = 0;
  let current = 1;
  while (prev < str.length) {
    if (str[current] === str[prev]) {
      if (current - prev === 1) {
        count += 1;
      }
    } else {
      prev = current;
    }
    current += 1;
  }

  return count;
};
console.log(countDuplicatedCharacterInWords('aaeeeeeebfbccdd'));
