import BigNumber from 'bignumber.js'

const falsyOrZero = <T>(num?: T): T | 0 => (num ? num : 0)

const toNaturalBasis = new BigNumber(10).pow(18)

export const toNaturalNumber = (num?: number | string | BigNumber): BigNumber =>
  new BigNumber(falsyOrZero(num)).div(toNaturalBasis)

export const toggle = (state: string, ref: string) => ({
  mounted() {
    window.addEventListener('click', this.onClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.onClick)
  },
  methods: {
    onClick(ev) {
      const onMenu = [...ev.path].includes(this.$refs[ref])
      if (!onMenu) this.$data[state] = false
    },
  },
})
