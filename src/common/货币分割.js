function format(num) {
  const res = num.split('')
  const dataRev = res.reduceRight((prev, current, currentIndex) => (currentIndex - 1) % 3 === 0 ? prev + current + ',' : prev + current)
  return dataRev.split('').reverse().join('')
}

console.log(format('1234567890'))
