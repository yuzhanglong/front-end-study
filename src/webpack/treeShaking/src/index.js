import { cube } from './math.js'
import './myModule'

const component = () => {
  const element = document.createElement('pre')
  element.innerHTML = _.join(['Hello', 'webpack'], ' ')
  element.innerHTML = ['Hello webpack!', '5 cubed is equal to ' + cube(5)].join(
    '\n\n'
  )

  return element
}

const pure = /*#__PURE__*/ hello()

document.body = component()
