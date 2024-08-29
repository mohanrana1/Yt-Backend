//DESCRIPTION OF ASYNCHANDLER FUNCTION
// The asyncHandler function is a higher-order function designed to handle asynchronous operations in Express.js route handlers.
//  It simplifies error handling in asynchronous code by automatically catching errors and passing them to Express's error-handling middleware

//  Why Use asyncHandler?
// In an Express.js application, route handlers often contain asynchronous code (e.g., database queries, HTTP requests) that returns promises.
//  When using async/await, errors can be caught using try/catch blocks, but this can become repetitive and cumbersome.


const asyncHandler = (requestHandler) => {
    // The asyncHandler function returns a new function
    return (req, res, next) => {
        // Inside the returned function, the requestHandler is executed
        Promise.resolve(requestHandler(req, res, next))  // Wrap the requestHandler in a promise
            .catch((err) => next(err));  // Catch any errors and pass them to the next middleware (error handler)
    }
}


export { asyncHandler }





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