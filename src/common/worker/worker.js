console.log('hello world')

onmessage = (e) => {
  let res = 'Result: ' + e.data[0] * e.data[1]
  console.log(e.data[0] * e.data[1])
  postMessage(res)
}
