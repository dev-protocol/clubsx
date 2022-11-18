export default function Hero({ coverImgSrc, projectName }) {
  return (
    <div>
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="relative inset-0">
              <img
                className="h-full w-full object-cover"
                src={coverImgSrc}
                alt={projectName + 'cover image'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
