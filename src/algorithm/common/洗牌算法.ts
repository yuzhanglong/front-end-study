const shuffle = (arr: any[]) => {
  for (let i = 0; i < arr.length; i++) {
    const randomIndex = Math.floor(i + Math.random() * (arr.length - i));
    const temp = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = temp;
  }
  return arr;
};

const arr = Array.from(Array(100), (item, index) => index);
shuffle(arr);
console.log(arr);
