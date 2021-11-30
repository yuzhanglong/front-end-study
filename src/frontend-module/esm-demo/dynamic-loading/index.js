console.log('hello world!')

const click = document.getElementById('click-me')
click.addEventListener('click', () => {
  import('./foo').then((res) => {
    console.log(res)
  })
})
