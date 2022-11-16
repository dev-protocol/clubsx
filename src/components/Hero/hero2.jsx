export default function Hero2({
  title,
  description,
  avatarImgSrc,
  projectName,
}) {
  return (
    <div>
      <div className="relative mx-[89px] mt-[32px]">
        <div className="flex">
          <img
            className="h-[220px] w-[220px] rounded-full object-cover"
            src={avatarImgSrc}
            alt={projectName + 'avatar image'}
          />
          <p className="font-Syne ml-[10px] flex items-center justify-center text-5xl font-extrabold capitalize text-white">
            {title}
          </p>
        </div>
        <p className="mt-[76px] text-2xl font-light capitalize text-white">
          {description}
        </p>
      </div>
    </div>
  )
}
