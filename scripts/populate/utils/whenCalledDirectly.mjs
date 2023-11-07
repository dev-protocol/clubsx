export const whenCalledDirectly = async (handler) => {
  if (process.argv.includes('scripts/populate/index.mjs') === false) {
    await handler()
  }
}
