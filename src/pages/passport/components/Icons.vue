<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  icon:
    | 'x'
    | 'twitch'
    | 'instagram'
    | 'tiktok'
    | 'youtube'
    | 'muted'
    | 'music_waves'
    | 'likes'
    | 'share'
  class?: string
}>()
const classNames = computed(() => props.class ?? 'size-6')
</script>

<template>
  <!-- First social -->
  <svg
    v-if="props.icon === 'x'"
    :class="classNames"
    width="25"
    height="23"
    viewBox="0 0 25 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4455_5459)">
      <path
        d="M19.1682 0.700195H22.9002L14.7468 10.0193L24.3389 22.7002H16.8281L10.9459 15.0091L4.21504 22.7002H0.48055L9.20142 12.7325L0 0.700195H7.70092L13.0182 7.72994L19.1682 0.700195ZM17.8583 20.4662H19.9264L6.57734 2.81687H4.35832L17.8583 20.4662Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_4455_5459">
        <rect
          width="24.3389"
          height="22"
          fill="white"
          transform="translate(0 0.700195)"
        />
      </clipPath>
    </defs>
  </svg>

  <!-- Second social -->
  <svg
    v-if="props.icon === 'twitch'"
    :class="classNames"
    width="19"
    height="23"
    viewBox="0 0 19 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4455_5467)">
      <path
        d="M17.2859 10.3143L14.1429 13.4573H10.9999L8.24994 16.2072V13.4573H4.71436V1.67188H17.2859V10.3143Z"
        fill="#FEFEFE"
      />
      <path
        d="M17.2858 10.3147L14.1428 13.4577H10.9998L8.24984 16.2077V13.4577H4.71426V1.67229H17.2858V10.3147ZM3.92862 0.100586L0 4.0292V18.172H4.71426V22.1006L8.64288 18.172H11.7854L18.857 11.1004V0.100586H3.92862Z"
        fill="#7E5AA1"
      />
      <path
        d="M13.3571 9.13613H14.9283V4.42188H13.3571V9.13613ZM9.0354 9.13613H10.6071V4.42188H9.0354V9.13613Z"
        fill="#7E5AA1"
      />
    </g>
    <defs>
      <clipPath id="clip0_4455_5467">
        <rect
          width="18.857"
          height="22"
          fill="white"
          transform="translate(0 0.100586)"
        />
      </clipPath>
    </defs>
  </svg>

  <!-- Third social -->
  <svg
    v-if="props.icon === 'instagram'"
    :class="classNames"
    width="22"
    height="23"
    viewBox="0 0 22 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4455_5496)">
      <path
        d="M11.0056 0.666992C6.48198 0.666992 5.15898 0.671659 4.90182 0.692992C3.97349 0.770159 3.39582 0.916326 2.76649 1.22966C2.28149 1.47049 1.89899 1.74966 1.52149 2.14099C0.833988 2.85466 0.417322 3.73266 0.266489 4.77633C0.193155 5.283 0.171822 5.38633 0.167489 7.97433C0.165822 8.837 0.167489 9.97233 0.167489 11.4952C0.167489 16.0152 0.172489 17.3368 0.194155 17.5935C0.269155 18.4968 0.410822 19.0652 0.710822 19.6868C1.28415 20.8768 2.37915 21.7702 3.66915 22.1035C4.11582 22.2185 4.60915 22.2818 5.24249 22.3118C5.51082 22.3235 8.24582 22.3318 10.9825 22.3318C13.7191 22.3318 16.4558 22.3285 16.7175 22.3152C17.4508 22.2807 17.8766 22.2235 18.3475 22.1018C19.6458 21.7668 20.7208 20.8868 21.3058 19.6802C21.6 19.0735 21.7491 18.4835 21.8166 17.6273C21.8313 17.4407 21.8375 14.4645 21.8375 11.4923C21.8375 8.51967 21.8308 5.549 21.8161 5.36233C21.7478 4.49233 21.5986 3.90733 21.295 3.28899C21.0458 2.78283 20.7691 2.40483 20.3675 2.01833C19.6506 1.33366 18.774 0.916992 17.7293 0.766326C17.2231 0.693159 17.1223 0.671492 14.5323 0.666992H11.0056Z"
        fill="url(#paint0_radial_4455_5496)"
      />
      <path
        d="M11.0056 0.666992C6.48198 0.666992 5.15898 0.671659 4.90182 0.692992C3.97349 0.770159 3.39582 0.916326 2.76649 1.22966C2.28149 1.47049 1.89899 1.74966 1.52149 2.14099C0.833988 2.85466 0.417322 3.73266 0.266489 4.77633C0.193155 5.283 0.171822 5.38633 0.167489 7.97433C0.165822 8.837 0.167489 9.97233 0.167489 11.4952C0.167489 16.0152 0.172489 17.3368 0.194155 17.5935C0.269155 18.4968 0.410822 19.0652 0.710822 19.6868C1.28415 20.8768 2.37915 21.7702 3.66915 22.1035C4.11582 22.2185 4.60915 22.2818 5.24249 22.3118C5.51082 22.3235 8.24582 22.3318 10.9825 22.3318C13.7191 22.3318 16.4558 22.3285 16.7175 22.3152C17.4508 22.2807 17.8766 22.2235 18.3475 22.1018C19.6458 21.7668 20.7208 20.8868 21.3058 19.6802C21.6 19.0735 21.7491 18.4835 21.8166 17.6273C21.8313 17.4407 21.8375 14.4645 21.8375 11.4923C21.8375 8.51967 21.8308 5.549 21.8161 5.36233C21.7478 4.49233 21.5986 3.90733 21.295 3.28899C21.0458 2.78283 20.7691 2.40483 20.3675 2.01833C19.6506 1.33366 18.774 0.916992 17.7293 0.766326C17.2231 0.693159 17.1223 0.671492 14.5323 0.666992H11.0056Z"
        fill="url(#paint1_radial_4455_5496)"
      />
      <path
        d="M11.0007 3.5C8.828 3.5 8.55533 3.5095 7.702 3.54833C6.85033 3.58733 6.269 3.72217 5.76033 3.92C5.23417 4.12433 4.78783 4.39767 4.34317 4.8425C3.89817 5.28717 3.62483 5.7335 3.41983 6.2595C3.2215 6.76833 3.0865 7.34983 3.04817 8.20117C3.01 9.0545 3 9.32734 3 11.5C3 13.6727 3.00967 13.9445 3.04833 14.7978C3.0875 15.6495 3.22233 16.2308 3.42 16.7395C3.6245 17.2657 3.89783 17.712 4.34267 18.1567C4.78717 18.6017 5.2335 18.8757 5.75933 19.08C6.26833 19.2778 6.84983 19.4127 7.70133 19.4517C8.55466 19.4905 8.82716 19.5 10.9997 19.5C13.1725 19.5 13.4443 19.4905 14.2977 19.4517C15.1493 19.4127 15.7313 19.2778 16.2403 19.08C16.7663 18.8757 17.212 18.6017 17.6565 18.1567C18.1015 17.712 18.3748 17.2657 18.5798 16.7397C18.7765 16.2308 18.9115 15.6493 18.9515 14.798C18.9898 13.9447 18.9998 13.6727 18.9998 11.5C18.9998 9.32734 18.9898 9.05467 18.9515 8.20133C18.9115 7.34967 18.7765 6.76833 18.5798 6.25967C18.3748 5.7335 18.1015 5.28717 17.6565 4.8425C17.2115 4.3975 16.7665 4.12417 16.2398 3.92C15.7298 3.72217 15.1482 3.58733 14.2965 3.54833C13.4432 3.5095 13.1715 3.5 10.9982 3.5H11.0007ZM10.283 4.94167C10.496 4.94133 10.7337 4.94167 11.0007 4.94167C13.1367 4.94167 13.3898 4.94933 14.2333 4.98767C15.0133 5.02333 15.4367 5.15367 15.7187 5.26317C16.092 5.40817 16.3582 5.5815 16.638 5.8615C16.918 6.1415 17.0913 6.40817 17.2367 6.7815C17.3462 7.06317 17.4767 7.4865 17.5122 8.2665C17.5505 9.10984 17.5588 9.36317 17.5588 11.4982C17.5588 13.6332 17.5505 13.8865 17.5122 14.7298C17.4765 15.5098 17.3462 15.9332 17.2367 16.2148C17.0917 16.5882 16.918 16.854 16.638 17.1338C16.358 17.4138 16.0922 17.5872 15.7187 17.7322C15.437 17.8422 15.0133 17.9722 14.2333 18.0078C13.39 18.0462 13.1367 18.0545 11.0007 18.0545C8.8645 18.0545 8.61133 18.0462 7.768 18.0078C6.988 17.9718 6.56467 17.8415 6.2825 17.732C5.90917 17.587 5.6425 17.4137 5.3625 17.1337C5.0825 16.8537 4.90917 16.5877 4.76383 16.2142C4.65433 15.9325 4.52383 15.5092 4.48833 14.7292C4.45 13.8858 4.44233 13.6325 4.44233 11.4962C4.44233 9.35984 4.45 9.10784 4.48833 8.2645C4.524 7.4845 4.65433 7.06117 4.76383 6.77917C4.90883 6.40583 5.0825 6.13917 5.3625 5.85917C5.6425 5.57917 5.90917 5.40583 6.2825 5.2605C6.5645 5.1505 6.988 5.0205 7.768 4.98467C8.506 4.95133 8.792 4.94133 10.283 4.93967V4.94167ZM15.271 6.27C14.741 6.27 14.311 6.6995 14.311 7.22967C14.311 7.75967 14.741 8.18967 15.271 8.18967C15.801 8.18967 16.231 7.75967 16.231 7.22967C16.231 6.69967 15.801 6.26967 15.271 6.26967V6.27ZM11.0007 7.39167C8.73183 7.39167 6.89233 9.23117 6.89233 11.5C6.89233 13.7688 8.73183 15.6075 11.0007 15.6075C13.2695 15.6075 15.1083 13.7688 15.1083 11.5C15.1083 9.23117 13.2695 7.39167 11.0007 7.39167ZM11.0007 8.83334C12.4733 8.83334 13.6673 10.0272 13.6673 11.5C13.6673 12.9727 12.4733 14.1667 11.0007 14.1667C9.52783 14.1667 8.334 12.9727 8.334 11.5C8.334 10.0272 9.52783 8.83334 11.0007 8.83334Z"
        fill="white"
      />
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_4455_5496"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(5.92306 24.0005) rotate(-90) scale(21.4715 19.9756)"
      >
        <stop stop-color="#FFDD55" />
        <stop offset="0.1" stop-color="#FFDD55" />
        <stop offset="0.5" stop-color="#FF543E" />
        <stop offset="1" stop-color="#C837AB" />
      </radialGradient>
      <radialGradient
        id="paint1_radial_4455_5496"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(-3.46321 2.22769) rotate(78.6777) scale(9.59793 39.573)"
      >
        <stop stop-color="#3771C8" />
        <stop offset="0.128" stop-color="#3771C8" />
        <stop offset="1" stop-color="#6600FF" stop-opacity="0" />
      </radialGradient>
      <clipPath id="clip0_4455_5496">
        <rect
          width="22.0007"
          height="22"
          fill="white"
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>

  <!-- Fourth social -->
  <svg
    v-if="props.icon === 'tiktok'"
    :class="classNames"
    width="20"
    height="23"
    viewBox="0 0 20 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4455_5500)">
      <path
        d="M16.3197 5.30995C15.1347 4.53732 14.2796 3.30068 14.0129 1.85999C13.9552 1.54881 13.9232 1.22823 13.9232 0.900391H10.1411L10.1347 16.0581C10.0716 17.7558 8.67442 19.1179 6.96182 19.1179C6.42951 19.1179 5.92837 18.9851 5.48698 18.7525C4.47488 18.2202 3.78207 17.1594 3.78207 15.939C3.78207 14.1859 5.20867 12.7593 6.96139 12.7593C7.2888 12.7593 7.60255 12.8135 7.89923 12.9061V9.04506C7.59188 9.0028 7.27984 8.97719 6.96139 8.97719C3.12298 8.97719 0 12.0997 0 15.939C0 18.294 1.17645 20.3784 2.97229 21.6386C4.10265 22.433 5.47845 22.9004 6.96182 22.9004C10.8007 22.9004 13.9232 19.7774 13.9232 15.939V8.25236C15.4066 9.31698 17.2242 9.94447 19.1857 9.94447V6.16198C18.1292 6.16198 17.1452 5.84824 16.3197 5.30995Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_4455_5500">
        <rect
          width="19.1857"
          height="22"
          fill="white"
          transform="translate(0 0.900391)"
        />
      </clipPath>
    </defs>
  </svg>

  <!-- Fifth Social -->
  <svg
    v-if="props.icon === 'youtube'"
    :class="classNames"
    width="22"
    height="23"
    viewBox="0 0 22 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4455_5502)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M21.7755 6.89428C21.7755 6.89428 21.5607 5.37786 20.8997 4.71198C20.0621 3.83623 19.1242 3.83062 18.6955 3.7798C15.6193 3.55566 10.999 3.55566 10.999 3.55566H10.9909C10.9909 3.55566 6.3727 3.55566 3.29479 3.7798C2.86434 3.83214 1.9278 3.83577 1.09059 4.71198C0.429132 5.37786 0.218922 6.89428 0.218922 6.89428C0.218922 6.89428 0 8.67377 0 10.457V12.1245C0 13.904 0.21879 15.6871 0.21879 15.6871C0.21879 15.6871 0.433554 17.2035 1.09045 17.8705C1.92766 18.7463 3.02795 18.7179 3.51912 18.8113C5.28034 18.9794 11.0005 19.0301 11.0005 19.0301C11.0005 19.0301 15.6248 19.0219 18.7011 18.8019C19.1315 18.7511 20.0677 18.746 20.9053 17.8698C21.5666 17.2039 21.781 15.6858 21.781 15.6858C21.781 15.6858 22.0001 13.9063 22.0001 12.1232V10.4558C21.9956 8.67634 21.7767 6.89322 21.7767 6.89322L21.7755 6.89441L21.7754 6.89428H21.7755ZM8.72019 14.1475V7.96453L14.6632 11.0663L8.72019 14.1475Z"
        fill="#FF0000"
      />
    </g>
    <defs>
      <clipPath id="clip0_4455_5502">
        <rect
          width="22"
          height="22"
          fill="white"
          transform="translate(0 0.299805)"
        />
      </clipPath>
    </defs>
  </svg>

  <!-- Muted Button -->
  <svg
    v-if="props.icon === 'muted'"
    xmlns="http://www.w3.org/2000/svg"
    :class="classNames"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M17.25 9.75001L19.5 12M19.5 12L21.75 14.25M19.5 12L21.75 9.75001M19.5 12L17.25 14.25M6.75 8.25001L11.47 3.53001C11.5749 3.42525 11.7085 3.35393 11.8539 3.32504C11.9993 3.29616 12.15 3.31101 12.2869 3.36772C12.4239 3.42443 12.541 3.52046 12.6234 3.64368C12.7058 3.76689 12.7499 3.91177 12.75 4.06001V19.94C12.7499 20.0883 12.7058 20.2331 12.6234 20.3563C12.541 20.4796 12.4239 20.5756 12.2869 20.6323C12.15 20.689 11.9993 20.7039 11.8539 20.675C11.7085 20.6461 11.5749 20.5748 11.47 20.47L6.75 15.75H4.51C3.63 15.75 2.806 15.243 2.572 14.396C2.35751 13.6154 2.2492 12.8095 2.25 12C2.25 11.17 2.362 10.367 2.572 9.60401C2.806 8.75601 3.63 8.25001 4.51 8.25001H6.75Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>

  <!-- Music Waves -->
  <div v-if="props.icon === 'music_waves'" class="flex items-center gap-[2px]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[9px] h-[14px]"
      viewBox="0 0 4 14"
      fill="none"
    >
      <path
        d="M2 2.5L2 11.5"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      ></path>
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[9px] h-[26px]"
      viewBox="0 0 4 26"
      fill="none"
    >
      <path
        d="M2 2L2 24"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      ></path>
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[9px] h-[14px]"
      viewBox="0 0 4 14"
      fill="none"
    >
      <path
        d="M2 2.5L2 11.5"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      ></path>
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-[9px] h-[22px]"
      viewBox="0 0 4 22"
      fill="none"
    >
      <path
        d="M2 2L2 20"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      ></path>
    </svg>
  </div>

  <!-- Likes Button -->
  <div v-if="props.icon === 'likes'">
    <svg
      width="106"
      height="106"
      :class="classNames"
      viewBox="0 0 106 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_3007_3750)">
        <rect x="11" y="7" width="84" height="84" rx="42" fill="white" />
        <path
          d="M72.5 32.375C72.5 26.9908 67.9522 22.625 62.3427 22.625C58.1502 22.625 54.5492 25.0647 53 28.5465C51.4508 25.0647 47.8498 22.625 43.6552 22.625C38.05 22.625 33.5 26.9908 33.5 32.375C33.5 48.0183 53 58.375 53 58.375C53 58.375 72.5 48.0183 72.5 32.375Z"
          stroke="black"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M52.12 79.5V70.4H53.875V79.5H52.12Z" fill="white" />
      </g>
      <defs>
        <filter
          id="filter0_d_3007_3750"
          x="0"
          y="0"
          width="106"
          height="106"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="5.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3007_3750"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3007_3750"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  </div>

  <!-- Share Button -->
  <svg
    v-if="props.icon === 'share'"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    :class="classNames"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
    />
  </svg>
</template>
