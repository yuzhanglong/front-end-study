import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from './context'

export const connect = (mapStateToProps, mapDispatchToProps) => {
  return (WrappedCmp) => {
    return (props) => {
      const context = useContext(StoreContext)
      const [, setState] = useState(context.getState())

      useEffect(() => {
        return context.subscribe(() => {
          setState(context.getState())
        })
      }, [])

      return (
        <WrappedCmp
          {...props}
          {...mapStateToProps(context.getState())}
          {...mapDispatchToProps(context.dispatch)}
        />
      )
    }
  }
}

export default connect
