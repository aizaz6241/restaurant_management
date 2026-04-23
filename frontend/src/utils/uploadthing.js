import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { API_BASE_URL } from "../config";

export const UploadButton = generateUploadButton({
  url: `${API_BASE_URL}/api/uploadthing`,
});
export const UploadDropzone = generateUploadDropzone({
  url: `${API_BASE_URL}/api/uploadthing`,
});
