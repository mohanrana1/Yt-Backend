import multer from 'multer'

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