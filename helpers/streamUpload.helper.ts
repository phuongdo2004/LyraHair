import express, { Request, Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { resolve } from 'path'
import { rejects } from 'assert'


export const StreamUpload = async (buffer: any) => {
  // Gọi lại config ở đây để đảm bảo biến env đã được nạp
  cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET 
  });

  try {
    const imageResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            return reject(error);
          }
          resolve({
            url: result?.secure_url,
            id: result?.public_id,
          });
        }
      );
      stream.end(buffer);
    });

    return imageResult;
  } catch (error) {
    console.error("Lỗi trong StreamUpload:", error);
    throw error; // PHẢI throw error để middleware nhận biết được
  }
};