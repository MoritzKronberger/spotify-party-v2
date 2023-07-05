const logFns = {
  info: console.log,
  warning: console.warn,
  error: console.error,
}

/** Log to console using timestamp and log level. */
export const log = (message: string, level: keyof typeof logFns = 'info') => {
  const timestamp = new Date().toISOString()
  const line = `${timestamp} - ${level.toUpperCase()} - ${message}`
  logFns[level](line)
}
