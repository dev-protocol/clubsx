export default function sticky(
  node: Node,
  { stickToTop }: { stickToTop: boolean },
) {
  const sentinelStyle = 'position: absolute; height: 1px;'
  const stickySentinelTop = document.createElement('div')
  stickySentinelTop.classList.add('stickySentinelTop')
  stickySentinelTop.setAttribute('style', sentinelStyle)
  node.parentNode?.prepend(stickySentinelTop)

  const stickySentinelBottom = document.createElement('div')
  stickySentinelBottom.classList.add('stickySentinelBottom')
  stickySentinelBottom.setAttribute('style', sentinelStyle)
  node.parentNode?.append(stickySentinelBottom)

  const intersectionCallback = function (entries: IntersectionObserverEntry[]) {
    // only observing one item at a time
    const entry = entries[0]
    let isStuck = !entry.isIntersecting
    node.dispatchEvent(
      new CustomEvent('stuck', {
        detail: { isStuck },
      }),
    )
  }

  const intersectionObserver = new IntersectionObserver(
    intersectionCallback,
    {},
  )

  if (stickToTop) {
    intersectionObserver.observe(stickySentinelTop)
  } else {
    intersectionObserver.observe(stickySentinelBottom)
  }
}
