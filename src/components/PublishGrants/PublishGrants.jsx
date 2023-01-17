import React from 'react'

import image from '@assets/maxim-berg-unsplash.jpg'

class PublishGrants extends React.Component {
  render() {
    return (
      <div
        className="grants-bg-cover grid gap-8 py-7 px-14 lg:py-14 lg:px-28"
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
        <p className="font-title text-3xl font-bold text-black lg:text-4xl">
          Creator Grants
        </p>
        <p className="font-title text-xl font-bold text-black lg:text-2xl">
          Grants to cover the gas fees for tokenization/set up memberships.
        </p>
      </div>
    )
  }
}

export default PublishGrants
