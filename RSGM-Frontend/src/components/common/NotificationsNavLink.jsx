import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "../../services/notificationService";

export default function NotificationsNavLink({ to, accent = "violet", onClick }) {
  const [unread, setUnread] = useState(0);
  const [shake, setShake] = useState(false);
  const previousUnread = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const result = await getUnreadNotificationCount();
        if (alive) {
          if (result.count > 0 && (previousUnread.current === null || result.count > previousUnread.current)) {
            setShake(false);
            window.requestAnimationFrame(() => setShake(true));
            window.setTimeout(() => setShake(false), 1200);
          }
          previousUnread.current = result.count;
          setUnread(result.count);
        }
      } catch { /* The notification page displays request errors. */ }
    }
    const whenVisible = () => { if (!document.hidden) refresh(); };
    refresh();
    const timer = window.setInterval(whenVisible, 30000);
    window.addEventListener("focus", whenVisible);
    document.addEventListener("visibilitychange", whenVisible);
    window.addEventListener("notifications-updated", refresh);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", whenVisible);
      document.removeEventListener("visibilitychange", whenVisible);
      window.removeEventListener("notifications-updated", refresh);
    };
  }, [pathname]);

  return <NavLink to={to} onClick={onClick} className={({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive
      ? "bg-neutral-900 text-white shadow-sm"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`
  }>
    <Bell size={17} className={shake ? "animate-bell-shake" : ""} />
    <span className="flex-1">Notifications</span>
    {unread > 0 && <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${accent === "amber" ? "bg-amber-100 text-amber-700" : accent === "emerald" ? "bg-emerald-100 text-emerald-700" : accent === "blue" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`} aria-label={`${unread} unread notifications`}>{unread > 99 ? "99+" : unread}</span>}
  </NavLink>;
}
