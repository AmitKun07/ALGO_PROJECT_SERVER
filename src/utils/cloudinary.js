import {v2 as cloudinary} from "cloudinary" 
    import fs from "fs" 
    
    
    
      const uploadOnCloudinary = async (localFilePath) => {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
          });
          
        try {
            if (!localFilePath) return null
            //upload the File on Cloudinary 
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            //file has been uploaded succesfully
            console.log("File  Upload succesful", response.url)
            fs.unlinkSync(localFilePath)
            return response
        } catch (error) {
            fs.unlinkSync (localFilePath) //Removes file as the upload operation got failed
            return null
        }
      }
      
    
    export {uploadOnCloudinary}
     
