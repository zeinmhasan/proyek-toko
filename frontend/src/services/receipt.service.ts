import axios from "../lib/axios";

export const receiptService = {
  downloadReceipt: async (transactionId: string) => {
    const response = await axios.get(`/receipt/${transactionId}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
