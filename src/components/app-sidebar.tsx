import { Home,  PencilRuler,  Settings } from "lucide-react"
import WhiteRook from '@/assets/WR.svg?react';
import WhiteKnight from '@/assets/WN.svg?react';
import JavaScript from '@/assets/JS.svg?react';
import WebAssembly from '@/assets/WA.svg?react';
import GitHub from '@/assets/GitHub.svg?react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom";
 
// Menu items.
const items = [{
    title: "Home",
    url: "/",
    icon: Home,
  }, {
    title: "Play: JavaScript AI",
    url: "/chess/ai",
    icon: JavaScript,      
  },  {
    title: "Play: Web Assembly AI",
    url: "/chess/ai-wasm",
    icon: WebAssembly
  }, {
    title: "Play: Peer to Peer",
    url: "/chess/p2p",
    icon: WhiteKnight,
  }, {
    title: "Play: Hotseat Mode",
    url: "/chess/hotseat",
    icon: WhiteRook,      
  },  {
    title: "Settings",
    url: "/profile",
    icon: Settings,
  }, {
    title: "About",
    url: "/about",
    icon: PencilRuler,
  }, {
    title: "Source",
    url: "https://github.com/uwuoome/jschess",
    icon: GitHub,
  }
];
 
export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className={isActive ? "bg-muted" : ""}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}