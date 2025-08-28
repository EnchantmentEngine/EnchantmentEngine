import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorisedPage = (props) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#43484F',
        color: '#f1f1f1',
        position: 'relative',
        height: '100vh'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '35%',
          transform: 'translate(-50%, 50%)',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          lineHeight: '1.4'
        }}
      >
        <p
          style={{
            fontFamily: 'inherit',
            color: '#c9c9c9',
            fontSize: '18px',
            fontWeight: 'normal',
            marginTop: '0',
            marginBottom: '40px'
          }}
        >
          {props.message}
        </p>
        <Link style={{ textDecoration: 'none' }} to="/">
          <button
            style={{
              height: '50px',
              margin: 'auto 5px',
              width: '100%',
              background: 'rgb(58, 65, 73)',
              color: '#f1f1f1 !important',
              border: 'solid #f1f1f1 2px'
            }}
          >
            Home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default UnauthorisedPage
