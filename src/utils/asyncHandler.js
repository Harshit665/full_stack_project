// what is utils (utility class)
// it is like function inside function and think like function written in some big applications like printf,slice
// this is like bigger companies made apps

//using the try catch

// const asyncHandler = (fn) => async (req,res,next) =>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }

// using promises and .then()

const asyncHandler = (fn) => {
  (req, res, next) => {
    Promise.resolve(fn(req,res,next)).catch((err)=> next(err))
  };
};

export { asyncHandler };
