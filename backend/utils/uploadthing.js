const { createUploadthing } = require("uploadthing/express");
const { UTApi } = require("uploadthing/server");

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "10MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
    }),
};

const deleteFileFromUploadThing = async (fileUrl) => {
  if (!fileUrl) return;

  // Check if it's an UploadThing URL
  const isUploadThing = fileUrl.includes("utfs.io") || fileUrl.includes("ufs.sh") || fileUrl.includes("uploadthing");
  if (!isUploadThing) return;

  try {
    const parts = fileUrl.split("/");
    const fileKey = parts[parts.length - 1];

    if (fileKey) {
      const utapi = new UTApi({ apiKey: process.env.UPLOADTHING_TOKEN });
      await utapi.deleteFiles(fileKey);
      console.log(`Deleted file from UploadThing storage: ${fileKey}`);
    }
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error.message);
  }
};

module.exports = { uploadRouter, deleteFileFromUploadThing };
