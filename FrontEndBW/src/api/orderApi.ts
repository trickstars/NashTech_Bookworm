// src/api/orderApi.ts (Tạo file mới hoặc thêm vào api chung)
import {authApiClient} from './apiClient';
// import type { Order } from '@/types/order'; // Import Order từ backend schema (đã camelCase)
import type { OrderCreate, Order } from '@/types/order'; // Import OrderItemBase (đã camelCase) - Hoặc định nghĩa type ở đây
import axios from 'axios';

const ENDPOINTS = {
  CREATE_ORDER: '/orders/', // Endpoint POST /orders/ của FastAPI
};

export const createOrder = async (orderPayload: OrderCreate): Promise<Order> => {
  try {
    // Interceptor sẽ tự thêm Auth header
    // Interceptor của axios sẽ tự chuyển camelCase payload thành snake_case nếu được cấu hình
    const response = await authApiClient.post<Order>(ENDPOINTS.CREATE_ORDER, orderPayload);
    // Interceptor response sẽ tự chuyển snake_case response thành camelCase
    return response.data;
  } catch (error: any) {
     // --- SỬA LẠI KHỐI CATCH ---
     // Chỉ log lỗi và ném lại lỗi gốc để component cha xử lý chi tiết
     if (axios.isAxiosError(error)) {
      console.error(
        `Create Order API Error (${error.response?.status}):`,
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error during order creation:", error);
    }
    // Ném lại lỗi gốc để component gọi (CartPage) có thể bắt và đọc detail
    throw error;
    // --- KẾT THÚC SỬA ĐỔI ---
  }
};