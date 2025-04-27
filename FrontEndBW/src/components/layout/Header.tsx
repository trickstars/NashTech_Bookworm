import { Link, NavLink } from 'react-router-dom'; // Import Link (or NavLink for active styles)

const Header = () => {
  // Helper function for NavLink className to handle active state
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `transition-colors hover:text-foreground/80 ${
      isActive ? 'text-foreground font-medium' : 'text-foreground/60'
    }`;
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
            Cart (0) {/* Cart count needs state management */}
          </NavLink>
          <NavLink to="/signin" className={getNavLinkClass}>
            Sign In
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

// Exporting the component if it's not already the default export
export default Header; // Use this if it's the default export