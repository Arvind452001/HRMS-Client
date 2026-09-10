import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from ".././assets/logo.jpg";
import { LogOut } from "lucide-react";
import { menu } from "../data/Dummy-Data";
import { disconnectSocket } from "../utils/socket";

export default function Sidebar({ role, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close the sidebar on outside click, mobile only, so the user doesn't
  // have to click a menu item just to dismiss it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSidebarOpen]);

  const handleLogout = () => {
    // Clear stored auth data
    localStorage.removeItem("technoToken");
    localStorage.removeItem("technoUser");

    // Close the real-time notification connection
    disconnectSocket();

    navigate("/login");
  };

  // Auto-close sidebar on nav click (mobile only, any role)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-dvh w-64 bg-base-100 border-r border-base-300 flex flex-col transition-transform duration-300 z-40  ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Logo */}
          <div className="mb-6 px-2 flex items-center justify-center">
            <img
              src={logo}
              alt="Technorizen"
              className="h-16 w-auto object-contain rounded-lg bg-white px-2.5 py-1 shadow-sm"
            />
          </div>

          {/* Menu */}
          <ul className="menu p-0 gap-1">
            {menu[role]?.map((item, index) => (
              <li key={index}>
                {item.external ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 rounded-lg text-sm font-medium px-3 py-2.5 transition-all text-base-content/70 hover:bg-[#e0f2fe] hover:text-primary"
                  >
                    <item.icon size={18} />
                    {item.name}
                  </a>
                ) : (
                  <NavLink
                    end
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg text-sm font-medium px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-primary text-primary-content"
                          : "text-base-content/70 hover:bg-[#e0f2fe] hover:text-primary"
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="px-4 py-4 border-t border-base-300 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition text-error font-medium text-sm hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
