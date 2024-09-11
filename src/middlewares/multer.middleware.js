import multer from 'multer'


// It primarily handles file uploads to your local file system or memory. 

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/temp')
    },
    filename: function (req,file,cb){
        cb(null , file.originalname)
    }
})

export const upload = multer({ //The multer function is called with an object that contains the storage configuration. This tells multer to use the disk storage engine you defined for handling uploads.
    storage
})


// Summary of the Workflow:
// A file upload request is sent to your server.
// Multer processes the request and applies the storage configuration you defined.
// The file is saved to the specified directory (./public/temp) with its original name.
// Your route handler can then access the file details via req.file.