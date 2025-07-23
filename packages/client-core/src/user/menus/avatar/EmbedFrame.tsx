import React from 'react'

const EmbedFrame = ({ component }) => {
  const src = component.src
  return (
    <div className="relative z-50 h-fit w-[70vw] overflow-y-auto rounded-2xl px-10 py-6">
      <div className="h-[90vh]">
        {src ? (
          <div className="h-full w-full">
            <iframe
              className="h-full w-full"
              src={src}
              frameBorder="0"
              allow="microphone; camera; autoplay; clipboard-write; encrypted-media"
              allowTransparency={true}
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default EmbedFrame
