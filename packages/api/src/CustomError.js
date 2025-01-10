class CustomError extends Error {
  constructor(httpStatus, message, code) {
    const err = super()
    err.message = message
    this.status = httpStatus
    this.code = code
  }
}

export default CustomError
