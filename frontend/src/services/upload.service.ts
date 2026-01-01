import axiosInstance from "../lib/axios";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  };
}

class UploadService {
  private baseUrl = "/api/upload";

  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post<UploadResponse>(
      `${this.baseUrl}/product`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteProductImage(filename: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/product/${filename}`);
  }
}

export const uploadService = new UploadService();
export default uploadService;
