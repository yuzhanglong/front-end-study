import React, { lazy, Suspense, useState } from 'react'

const Other = lazy(() => import('./OtherComponent'))

const LazyLoad = () => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <button onClick={() => setShow(!show)}>show!</button>
      <Suspense fallback={null}>{show && <Other />}</Suspense>
    </div>
  )
}

export default LazyLoad
