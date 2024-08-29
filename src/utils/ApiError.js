class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ''  //A string representing the stack trace. It shows where the error occurred in the code. If not provided, it will be automatically generated.
    ){
        super(message) // l invokes the constructor of the parent Error class, passing the message to it.
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace (this, this.constructor)
        }
    }
}
export { ApiError } //named export 