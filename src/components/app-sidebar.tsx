import { Home, Joystick, PencilRuler, Users } from "lucide-react"
import WhiteRook from '@/assets/WR.svg?react';
import WhiteKnight from '@/assets/WN.svg?react';
import WhiteBishop from '@/assets/WB.svg?react';

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
    title: "Friend List",
    url: "/friends",
    icon: Users,
 /* }, {
    title: "Rock Paper Scissors",
    url: "/rps",
    icon: Joystick,
  */
  }, {
    title: "P2P Chess",
    url: "/chess/p2p",
    icon: WhiteRook,
  }, {
    title: "Hotseat Chess",
    url: "/chess/hotseat",
    icon: WhiteBishop,      
  },  {
    title: "AI Chess",
    url: "/chess/ai",
    icon: WhiteKnight,      
  },  {
    title: "About",
    url: "/about",
    icon: PencilRuler,
  },
];
 
export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className={isActive ? "bg-muted text-primary" : ""}>
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