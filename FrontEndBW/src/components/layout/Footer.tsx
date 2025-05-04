// --- Đọc URL logo từ biến môi trường ---
const logoUrl = import.meta.env.VITE_APP_LOGO_URL || '/logo.svg'; // Có giá trị dự phòng
// --- ---

const Footer = () => {
  return (
    <footer className="border-t mt-16 py-10 bg-muted/40"> {/* Increased top margin and padding */}
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8"> {/* Added justify-between and gap */}
        {/* Logo & Info Block */}
        <div className="flex items-center sm:items-start space-x-4">
            {/* --- THAY THẾ DIV BẰNG IMG --- */}
           {/* Thay div placeholder bằng thẻ img */}
           <img
               src={logoUrl} // <-- Sử dụng biến môi trường
               alt="Bookworm Footer Logo"
               className="w-16 h-16 object-contain flex-shrink-0" // Giữ kích thước hoặc điều chỉnh, thêm object-contain
            />
           {/* --- KẾT THÚC THAY THẾ --- */}
           {/* Info */}
           <div className="text-left"> {/* Ensured text-left */}
             <p className="font-semibold text-lg">BOOKWORM</p> {/* Slightly larger font */}
             <p className="text-sm text-muted-foreground">123 Book St, Reading City</p> {/* Example Address */}
             <p className="text-sm text-muted-foreground">(+84) 123-456-789</p> {/* Example Phone */}
           </div>
        </div>

        {/* Optional: Footer Links or Copyright */}
        <div className="text-center sm:text-right text-sm text-muted-foreground">
           {/* Use current year dynamically */}
           <p>&copy; {new Date().getFullYear()} BOOKWORM. All rights reserved.</p>
           {/* Add other links here if needed */}
           {/* <div className="mt-2 space-x-4">
             <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
           </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer; // Use this if it's the default export