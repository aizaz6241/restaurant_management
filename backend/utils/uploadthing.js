const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
    }),
};

module.exports = { uploadRouter };
