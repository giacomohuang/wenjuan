const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.log(err)
    ctx.status = err.status || 500
    ctx.body = {
      message: err.message || 'Unknown error',
      code: err.code || 500
    }
    console.log('$$$$$$$$$$errorHandler$$$$$$$')
    console.log(err)
  }
}

export default errorHandler
