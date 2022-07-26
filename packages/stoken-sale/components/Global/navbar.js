import ConnectButton from "../Walllet/connectbutton"
export default function Navbar() {
  return (
    <div className="font-body flex items-center justify-between px-8 py-4 bg-black">
      <h1>
        <a className="font-Syne py-4 font-bold text-white dark:text-white">
          KOGENJI
        </a>
      </h1>
        <div className="flex items-center gap-4">
          <ConnectButton />
          {/* <div class="relative">
            <button class="rounded border p-2" onclick="toggle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <ul
              className="absolute right-0 z-50 mt-2 w-48 rounded border border-slate-800 bg-black p-2 shadow"
              >
              <li>
                <a
                  href="https://stakes.social/"
                  class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
                  target="_blank"
                  rel="norefferer noopener"
                  >Social media1</a
                >
              </li>
              <hr class="my-4 border-slate-50/20" />
              <li>
                <a
                  href="https://www.youtube.com/user/suiundo/"
                  class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
                  target="_blank"
                  rel="norefferer noopener"
                  >Social media2 
                </a>
              </li>
              <hr class="my-4 border-slate-50/20" />
              <li>
                <a
                  href="https://www.youtube.com/user/suiundo/"
                  class="inline-block w-full rounded px-4 py-2 hover:bg-neutral-900"
                  target="_blank"
                  rel="norefferer noopener"
                  >More social media
                </a>
              </li>
            </ul>
          </div> */}
        </div>
    </div>
  )
}