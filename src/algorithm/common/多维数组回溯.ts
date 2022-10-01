function backTrack(arr: string[][], prevState: string[], index: number) {
  if (index === arr.length) {
    return prevState;
  }

  const target = arr[index];

  const newState = [];
  for (let i = 0; i < prevState.length; i++) {
    for (let j = 0; j < target.length; j++) {
      newState.push(prevState[i] + target[j]);
    }
  }

  return backTrack(arr, newState, index + 1);
}

function arrayBackTrack(arr: string[][]) {
  return backTrack(arr, [''], 0);
}

console.log(
  arrayBackTrack([
    ['a', 'b', 'c', 'd'],
    ['n', 'm'],
    ['0', '1'],
  ])
);
