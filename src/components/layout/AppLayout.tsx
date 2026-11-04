import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, Settings, User, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const { user, settings, conversations } = useApp();

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sleek Vertical Navigation Bar (Desktop & Tablet) */}
      <nav className="hidden sm:flex flex-col items-center justify-between w-16 py-4 bg-surface border-r border-border shrink-0 select-none z-20">
        <div className="flex flex-col items-center gap-6">
          {/* Logo Mark */}
          <NavLink
            to="/chat"
            className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-subtle hover:bg-accent-hover transition-colors"
            title="EchoPulse Home"
          >
            <Radio className="w-5 h-5 text-white" />
          </NavLink>

          {/* Navigation Links */}
          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `relative p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-muted-text hover:text-primary-text hover:bg-surface-subtle'
                }`
              }
              title="Chats"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent"></span>
              )}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-muted-text hover:text-primary-text hover:bg-surface-subtle'
                }`
              }
              title="Translation & Audio Settings"
            >
              <Settings className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent-subtle text-accent'
                    : 'text-muted-text hover:text-primary-text hover:bg-surface-subtle'
                }`
              }
              title="User Profile"
            >
              <User className="w-5 h-5" />
            </NavLink>
          </div>
        </div>

        {/* Bottom Profile & Language Indicator */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-[10px] font-bold text-accent uppercase tracking-tighter"
            title={`Preferred: ${settings.preferredLanguage}`}
          >
            {settings.preferredLanguage.slice(0, 2)}
          </div>

          <NavLink to="/profile" title={user.name}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-border hover:ring-2 hover:ring-accent transition-all"
            />
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 h-14 bg-surface border-t border-border flex items-center justify-around z-30 px-2 select-none shadow-card">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs ${
              isActive ? 'text-accent font-medium' : 'text-muted-text'
            }`
          }
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs ${
              isActive ? 'text-accent font-medium' : 'text-muted-text'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs ${
              isActive ? 'text-accent font-medium' : 'text-muted-text'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
};
