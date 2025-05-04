import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- Import useAuth
import { Link, NavLink } from 'react-router-dom'; // Import Link (or NavLink for active styles)

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Thêm DialogClose để đóng modal bằng nút
} from "@/components/ui/dialog";
import { LogOut, Loader2 } from 'lucide-react'; // Icon logout và loading
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Cho menu user
import ToastWithCountdown from '../common/ToastWithCountDown';

const Header = () => {
  // Lấy trực tiếp giá trị cartItemCount từ context
  const { cartItemCount } = useCart();
  // Lấy state và hàm modal từ context
  const { isAuthenticated, user, logout, login, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

  // const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false); // State đóng/mở Dialog
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `transition-colors hover:text-foreground/80 ${
      isActive ? 'text-foreground font-medium' : 'text-foreground/60'
    }`;
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
        const success = await login(loginEmail, loginPassword);
        if (success) {
          toast.success(
            <ToastWithCountdown message="Login successfully!" />
            // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
            // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
          );
            // setIsLoginDialogOpen(false); // Đóng dialog khi thành công
            setLoginEmail(''); // Reset form
            setLoginPassword('');
        }
        // Không cần xử lý lỗi ở đây nữa vì hàm login đã throw error
    } catch (error: any) {
         setLoginError(error.message || "Login failed. Please check your credentials.");
        //  toast.error(error.message || "Login failed."); // Hiển thị toast lỗi
         toast.error(
          <ToastWithCountdown message={error.message || "Login failed."} />
          // Không cần set duration ở đây nữa vì Toaster đã có mặc định 10s
          // { duration: 10000, closeButton: true } // Các options này giờ đã set ở Toaster
      );
    } finally {
         setIsLoggingIn(false);
    }
};

  return (
    <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Added sticky, z-index, background, and blur for better header behavior */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo with Image */}
        <Link
          to="/"
          // Added flex items-center to align image and text vertically
          className="flex items-center font-bold text-xl mr-6"
        >
          <img
            // --- IMPORTANT ---
            // Replace '/logo.svg' with the actual path to your logo image
            // If your logo is in the 'public' folder, '/logo.svg' or '/logo.png' should work.
            src="/logo.svg"
            alt="Bookworm Logo"
            // Adjust size (h-7 w-7) and margin (mr-2) as needed
            className="h-8 w-8 mr-2"
          />
          BOOKWORM
        </Link>

        {/* Navigation */}
        {/* Consider using shadcn NavigationMenu for more complex scenarios */}
        <nav className="flex items-center space-x-4 sm:space-x-6 text-sm"> {/* Adjusted spacing */}
          <NavLink to="/" className={getNavLinkClass} end> {/* Use NavLink and 'end' prop for exact match */}
            Home
          </NavLink>
          <NavLink to="/shop" className={getNavLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/about" className={getNavLinkClass}>
            About
          </NavLink>
          <NavLink to="/cart" className={getNavLinkClass}>
            Cart ({cartItemCount}) {/* Cart count needs state management */}
          </NavLink>
          {/* Conditional Rendering: Sign In hoặc User Menu/Sign Out */}
          {isAuthenticated && user ? (
            // --- User Logged In: Hiển thị Dropdown Menu ---
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-auto justify-start px-2 sm:px-4">
                        {/* Có thể hiển thị Avatar ở đây */}
                        <span>{user.firstName} {user.lastName}</span> {/* Hiển thị tên hoặc email */}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            ID: {user.id} {user.admin ? '(Admin)' : ''}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Thêm các mục khác nếu cần: Profile, Orders... */}
                    {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                    {/* <DropdownMenuItem>Orders</DropdownMenuItem> */}
                    {/* <DropdownMenuSeparator /> */}
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            // --- ---

          ) : (
            // --- User Not Logged In: Hiển thị Sign In Dialog Trigger ---
            // Dialog giờ được kiểm soát bởi state từ context
            <Dialog open={isLoginModalOpen} onOpenChange={(open) => open ? openLoginModal() : closeLoginModal()}>
              <DialogTrigger asChild>
                 <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80">
                    Sign In
                 </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sign In</DialogTitle>
                  <DialogDescription>
                    Enter your email and password to access your account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLoginSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="login-email" className="text-right">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isLoggingIn}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="login-password" className="text-right">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoggingIn}
                        className="col-span-3"
                        />
                    </div>
                    {loginError && (
                        // < className='grid grid-cols-4 items-center gap-4'>
                          <p className="text-sm text-destructive text-left">{loginError}</p>
                        
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoggingIn}>
                      {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            // --- ---
          )}
        </nav>
      </div>
    </header>
  );
};

// Exporting the component if it's not already the default export
export default Header; // Use this if it's the default export