const asyncHandler = (requestHandler) => {
    // The asyncHandler function returns a new function
    return (req, res, next) => {
        // Inside the returned function, the requestHandler is executed
        Promise
            .resolve(requestHandler(req, res, next))  // Wrap the requestHandler in a promise
            .catch((err) => next(err));  // Catch any errors and pass them to the next middleware (error handler)
    }
}




export default asyncHandler





// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => { () => {} }
// const asyncHandler = (func) =>  async() => {}



// higher order function
// const asyncHandler =  (func) =>  async(req,res,next) => {
//     try{
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }