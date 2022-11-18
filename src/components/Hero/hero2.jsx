export default function Hero2({
  title,
  description,
  avatarImgSrc,
  projectName,
}) {
  return (
    <div>
      <div className="relative md:mx-20">
        <div className="flex">
          <img
            className="h-24 w-24 rounded-full object-cover md:h-52 md:w-52"
            src={avatarImgSrc}
            alt={projectName + 'avatar image'}
          />
          <h2 className="ml-[10px] flex items-center justify-center font-title text-2xl font-bold font-extrabold capitalize text-white md:text-5xl">
            {title}
          </h2>
        </div>
        {description.map((text) => (
          <p className="my-8 font-light capitalize text-white md:text-2xl">
            {text}
          </p>
        ))}
      </div>
    </div>
  )
}
