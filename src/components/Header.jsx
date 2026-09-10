import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Menu,
  ShieldCheck,
  UserCog,
  IdCard,
} from "lucide-react";
import {
  getMyNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "../api/notificationApi";
import { getSocket } from "../utils/socket";
import { timeAgo } from "../utils/timeAgo";
import CelebrationPopup from "./CelebrationPopup";

const POLL_INTERVAL_MS = 60000; // fallback poll interval; sockets handle real-time updates

// Notification types that also trigger the full-screen popup, shown only
// to the user the notification was personally addressed to.
const POPUP_NOTIFICATION_TYPES = ["BIRTHDAY", "ANNIVERSARY"];

// Sides of the app a multi-role user can switch between, used by the header's view switcher
const VIEW_OPTIONS = [
  { key: "admin", name: "Admin Panel", path: "/admin", icon: ShieldCheck },
  { key: "hr", name: "HR View", path: "/hr/dashboard", icon: UserCog },
  {
    key: "employee",
    name: "Employee View",
    path: "/employee/dashboard",
    icon: IdCard,
  },
];

export default function Header({ sidebarOpen, setSidebarOpen, role }) {
  const [openNotif, setOpenNotif] = useState(false);
  const [openViewSwitcher, setOpenViewSwitcher] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [celebrationPopup, setCelebrationPopup] = useState({
    isOpen: false,
    message: "",
    variant: "BIRTHDAY",
    notifId: null,
  });

  const notifRef = useRef(null);
  const viewSwitcherRef = useRef(null);
  const navigate = useNavigate();

  // The logged-in user's own id, used to detect notifications sent personally to them
  const myId = (() => {
    try {
      return JSON.parse(localStorage.getItem("technoUser") || "{}")?.id;
    } catch {
      return null;
    }
  })();

  // The switcher is shown only to users holding more than one role
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("technoUser") || "null");
  } catch {
    currentUser = null;
  }
  const userRoles = currentUser?.roles || [];
  const availableViews = userRoles.includes("admin")
    ? VIEW_OPTIONS
    : userRoles.includes("hr")
      ? VIEW_OPTIONS.filter((v) => v.key !== "admin")
      : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
      if (
        viewSwitcherRef.current &&
        !viewSwitcherRef.current.contains(e.target)
      ) {
        setOpenViewSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCountApi();
      setUnreadCount(res?.count || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotif(true);
    try {
      const res = await getMyNotificationsApi({ limit: 15 });
      setNotifications(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  // Initial load plus fallback polling for the unread count
  useEffect(() => {
    const token = localStorage.getItem("technoToken");
    if (!token) return;

    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("technoToken");
    if (!token) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show the celebration popup only for notifications addressed to this user
      if (
        POPUP_NOTIFICATION_TYPES.includes(notif.type) &&
        notif.recipientId &&
        String(notif.recipientId) === String(myId)
      ) {
        setCelebrationPopup({
          isOpen: true,
          message: notif.message,
          variant: notif.type,
          notifId: notif._id,
        });
      }
    };

    // Re-sync unread count when the socket reconnects
    const handleConnect = () => refreshUnreadCount();

    socket.on("notification:new", handleNewNotification);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("connect", handleConnect);
    };
  }, [refreshUnreadCount]);

  // Show any celebration notification that arrived before this session started
  useEffect(() => {
    const token = localStorage.getItem("technoToken");
    if (!token) return;

    (async () => {
      try {
        const res = await getMyNotificationsApi({ limit: 10 });
        const myCelebration = (res?.data || []).find(
          (n) =>
            POPUP_NOTIFICATION_TYPES.includes(n.type) &&
            n.recipientId &&
            String(n.recipientId) === String(myId) &&
            !n.isRead,
        );
        if (myCelebration) {
          setCelebrationPopup({
            isOpen: true,
            message: myCelebration.message,
            variant: myCelebration.type,
            notifId: myCelebration._id,
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Fetch the full list whenever the dropdown is opened
  useEffect(() => {
    if (openNotif) {
      fetchNotifications();
    }
  }, [openNotif, fetchNotifications]);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsReadApi(notif._id);
      } catch (err) {
        console.error(err);
      }
    }

    setOpenNotif(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Marks the celebration notification as read, same as clicking it in the bell dropdown
  const handleCelebrate = async () => {
    const notifId = celebrationPopup.notifId;
    if (!notifId) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsReadApi(notifId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsAsReadApi();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const readNotifs = notifications.filter((n) => n.isRead);

  return (
    <header className="sticky top-0 z-30 transition-all duration-300 bg-base-100/95 backdrop-blur border-b border-base-300 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost btn-sm btn-circle text-primary hover:bg-[#e0f2fe]"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Section */}
      <div className="relative flex items-center gap-2" ref={notifRef}>
        {/* Lets a multi-role user switch views without logging out */}
        {availableViews.length > 0 && (
          <div
            role="tablist"
            aria-label="Switch dashboard view"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-base-200 p-1 border border-base-300 shrink-0"
          >
            {availableViews.map((view) => {
              const isActive = view.key === role;
              return (
                <button
                  key={view.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    if (!isActive) navigate(view.path);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-base-content/70 hover:bg-base-300/60"
                  }`}
                >
                  <view.icon size={14} className="shrink-0" />
                  <span className="whitespace-nowrap">{view.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Compact view switcher for small screens */}
        {availableViews.length > 0 && (
          <div className="relative sm:hidden" ref={viewSwitcherRef}>
            <button
              type="button"
              onClick={() => setOpenViewSwitcher((prev) => !prev)}
              aria-label="Switch dashboard view"
              aria-expanded={openViewSwitcher}
              className={`btn btn-sm rounded-full gap-1.5 px-3 ${
                openViewSwitcher
                  ? "btn-primary"
                  : "btn-ghost text-base-content/60 hover:bg-[#e0f2fe] hover:text-primary"
              }`}
            >
              {(() => {
                const activeView = availableViews.find((v) => v.key === role);
                const ActiveIcon = activeView?.icon || ShieldCheck;
                return (
                  <>
                    <ActiveIcon size={16} className="shrink-0" />
                    <span className="text-xs font-medium">
                      {activeView?.key === "admin"
                        ? "Admin"
                        : activeView?.key === "hr"
                          ? "HR"
                          : "Employee"}
                    </span>
                  </>
                );
              })()}
            </button>

            {openViewSwitcher && (
              <div className="absolute right-0 top-11 w-48 rounded-xl bg-base-100 shadow-xl border border-base-300 p-1.5 z-50">
                {availableViews.map((view) => {
                  const isActive = view.key === role;
                  return (
                    <button
                      key={view.key}
                      type="button"
                      onClick={() => {
                        setOpenViewSwitcher(false);
                        if (!isActive) navigate(view.path);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-sky-600 text-white"
                          : "text-base-content/70 hover:bg-base-200"
                      }`}
                    >
                      <view.icon size={16} className="shrink-0" />
                      <span>{view.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:bg-[#e0f2fe] hover:text-primary">
          <MessageSquare size={18} />
        </button>

        <button
          onClick={() => setOpenNotif(!openNotif)}
          className={`btn btn-sm btn-circle relative ${
            openNotif
              ? "btn-primary"
              : "btn-ghost text-base-content/60 hover:bg-[#e0f2fe] hover:text-primary"
          }`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-error text-white text-[10px] leading-4 font-semibold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Popup */}
        {openNotif && (
          <div className="absolute right-0 top-14 w-[calc(100vw-2rem)] max-w-72 sm:w-72 md:w-80 z-50">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Notification</h3>
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {loadingNotif && notifications.length === 0 && (
                  <p className="text-xs opacity-60 mt-3">Loading...</p>
                )}

                {!loadingNotif && notifications.length === 0 && (
                  <p className="text-xs opacity-60 mt-3">
                    No notifications yet.
                  </p>
                )}

                {unreadNotifs.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs opacity-60 mb-1">Unread</p>
                    {unreadNotifs.map((n) => (
                      <NotifItem
                        key={n._id}
                        text={n.title ? `${n.title} — ${n.message}` : n.message}
                        time={timeAgo(n.createdAt)}
                        unread
                        onClick={() => handleNotifClick(n)}
                      />
                    ))}
                  </div>
                )}

                {readNotifs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs opacity-60 mb-1">Earlier</p>
                    {readNotifs.map((n) => (
                      <NotifItem
                        key={n._id}
                        text={n.title ? `${n.title} — ${n.message}` : n.message}
                        time={timeAgo(n.createdAt)}
                        onClick={() => handleNotifClick(n)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Birthday / Work Anniversary Celebration Popup */}
      <CelebrationPopup
        isOpen={celebrationPopup.isOpen}
        message={celebrationPopup.message}
        variant={celebrationPopup.variant}
        onCelebrate={handleCelebrate}
        onClose={() =>
          setCelebrationPopup({
            isOpen: false,
            message: "",
            variant: "BIRTHDAY",
            notifId: null,
          })
        }
      />
    </header>
  );
}

/* Notification Item */
function NotifItem({ text, time, unread = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex gap-3 items-start py-2 w-full text-left hover:bg-base-200/60 rounded-md px-1 -mx-1 transition-colors"
    >
      <div
        className={`h-9 w-9 flex items-center justify-center rounded-full ${
          unread
            ? "bg-primary/15 text-primary"
            : "bg-base-200 text-base-content/50"
        }`}
      >
        <Bell size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${unread ? "font-medium" : ""}`}>{text}</p>
        <span className="text-xs opacity-60">{time}</span>
      </div>
      {unread && (
        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}
