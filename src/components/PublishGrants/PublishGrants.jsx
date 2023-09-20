import React from 'react'

import image from '@assets/maxim-berg-unsplash.jpg'
import MaticLogo from '@assets/matic_logo.png'

class PublishGrants extends React.Component {
  render() {
    return (
      <div
        className="grants-bg-cover grid gap-8 px-7 py-7 xl:px-28 xl:py-14"
        style={{
          backgroundImage: `url(${image.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <p className="text-base font-normal text-black">
          Having trouble with gas fees? Apply!
        </p>
        <p className="grid grid-cols-[1fr_100px] grid-rows-2 justify-start xl:grid-cols-[auto_120px_auto] xl:gap-4">
          <span className="col-span-1 font-title text-2xl font-bold text-black xl:text-3xl">
            The first $MATIC
          </span>
          <img
            src={MaticLogo.src}
            className="row-span-2 h-auto xl:col-span-1"
          />
          <span className="col-span-1 font-title text-2xl font-bold text-black xl:row-span-2 xl:self-end xl:text-3xl">
            is covered
          </span>
        </p>
        <p className="font-title text-xl font-bold text-black xl:text-2xl">
          Grants to assist first-time web3 creators with onboarding.
        </p>
      </div>
    )
  }
}

export default PublishGrants
