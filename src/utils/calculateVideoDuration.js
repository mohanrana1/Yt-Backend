import Ffmpeg from "fluent-ffmpeg";

const calculateVideoDuration = (videoPath) => {
    return new Promise((res,rej) => {
        Ffmpeg.ffprobe(videoPath, (err, metadata) => { //ffprobe: This function is part of fluent-ffmpeg and is used to extract metadata from a video file, including the duration
            if(err){
                return rej(err)
            }
            const durationInSeconds = metadata.format.duration; //duration in second
            
            res(durationInSeconds)
        })

    })
}

export {calculateVideoDuration}