import React, { useEffect } from 'react'
import { useState } from 'react'

const Header = () => {
  console.log('header render!')
  return <div>Header!</div>
}

const Content = () => {
  console.log('content render')
  return <div>Content!</div>
}

const Footer = () => {
  console.log('foot render')
  return <div>Footer!</div>
}

const ConditionalRenderingCmp = () => {
  const [flag, setFlag] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setFlag(true)
    }, 1000)
  }, [])
  return (
    <>
      {flag && <Header />}
      <Content />
      <Footer />
    </>
  )
}

export default ConditionalRenderingCmp
