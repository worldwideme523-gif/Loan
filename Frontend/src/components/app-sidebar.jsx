import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"

export function AppSidebar({ items, user, role, activeTab, onNavigate, onLogout, ...props }) {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-slate-700/50 bg-slate-900 text-white [--sidebar-accent:transparent] [--sidebar-accent-foreground:inherit] [--sidebar-background:#0f172a]"
      {...props}
    >
      {/* Brand Header */}
      <SidebarHeader className="border-b border-slate-700/50 p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 group-data-[collapsible=icon]:size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <span className="text-sm group-data-[collapsible=icon]:text-xs font-bold text-white">S</span>
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-white truncate">Velaris</p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">Loan Platform</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="p-3 group-data-[collapsible=icon]:p-1.5">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {items.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onNavigate(item.id)}
                      tooltip={item.label}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 data-[active=true]:bg-emerald-500 data-[active=true]:text-white'
                          : 'text-slate-300 hover:bg-blue-500/20 hover:text-blue-200'
                      }`}
                    >
                      <item.icon className="size-[18px] group-data-[collapsible=icon]:size-4 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                      {item.count !== undefined && (
                        <Badge
                          variant={item.count > 0 ? "default" : "outline"}
                          className={`ml-auto text-[10px] h-5 px-1.5 shrink-0 group-data-[collapsible=icon]:hidden ${
                            isActive
                              ? 'bg-emerald-400 text-emerald-900 border-0'
                              : 'bg-slate-700 text-slate-300 border-0'
                          }`}
                        >
                          {item.count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer - pinned to bottom */}
      <SidebarFooter className="border-t border-slate-700/50 p-4 group-data-[collapsible=icon]:p-2 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex size-9 group-data-[collapsible=icon]:size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 ring-2 ring-slate-600 shadow-sm">
            <span className="text-sm group-data-[collapsible=icon]:text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">{role}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex size-8 group-data-[collapsible=icon]:size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="size-[18px] group-data-[collapsible=icon]:size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
