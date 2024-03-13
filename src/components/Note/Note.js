import React from 'react'
import './Note.scss'

const Note = ({ title, children, className }) => {
    return (
      <div className={`note-component ${className ?? ''}`}>
        <strong>{title} </strong> {children}
      </div>
    )
}

export default Note