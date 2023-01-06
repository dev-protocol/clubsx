import React from 'react'

import image from '@assets/maxim-berg-unsplash.jpg'

class PublishGrants extends React.Component {
  render() {
    return (
      <div
        className="grants-bg-cover grid gap-[30px] rounded-2xl py-[39px] px-[117px]"
        style={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <p className="text-base font-normal text-black">
          Having trouble with gas fees? Apply!
        </p>
        <p className="font-title text-[42px] font-bold text-black">
          Creator Grants
        </p>
        <p className="font-title text-2xl font-bold text-black">
          Grants to cover the gas fees for tokenization/set up memberships.
        </p>
      </div>
    )
  }
}

export default PublishGrants
