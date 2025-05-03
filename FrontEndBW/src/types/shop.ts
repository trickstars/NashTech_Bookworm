// Đặt ở đầu file src/pages/ShopPage.tsx hoặc import từ file riêng

// Enum định nghĩa các giá trị sắp xếp gửi lên backend
enum SortByBackendValue {
    SALE = 'sale',
    POPULARITY = 'popularity',
    PRICE = 'price',
}

enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

// Enum đại diện cho lựa chọn của người dùng trên UI (kết hợp field và direction)
export enum SortOption {
    POPULARITY_DESC = 'popularity.desc',
    PRICE_ASC = 'price.asc',
    PRICE_DESC = 'price.desc',
    SALE_DESC = 'sale.desc', // Thêm các option khác nếu cần
}

// Cấu hình để hiển thị trên UI và map với Enum
export const SORT_OPTIONS_CONFIG = [
  { value: SortOption.POPULARITY_DESC, label: 'Sort by popularity' },
  { value: SortOption.PRICE_ASC, label: 'Sort by price: low to high' },
  { value: SortOption.PRICE_DESC, label: 'Sort by price: high to low' },
  { value: SortOption.SALE_DESC, label: 'Sort by on sale' },
];

// Hàm helper để tách giá trị enum thành orderBy và orderDir
const parseSortOption = (sortOption: SortOption): { orderBy: SortByBackendValue | null; orderDir: SortDirection } => {
    const parts = sortOption.split('.');
    const orderBy = parts[0] as SortByBackendValue;
    const orderDir = (parts[1] ?? 'desc') as SortDirection; // Mặc định là desc nếu thiếu
    // Kiểm tra xem orderBy có hợp lệ không (tùy chọn)
    if (!Object.values(SortByBackendValue).includes(orderBy)) {
        console.warn(`Invalid order_by value parsed: ${orderBy}`);
        return { orderBy: null, orderDir: SortDirection.DESC }; // Trả về giá trị mặc định an toàn
    }
    return { orderBy, orderDir };
}