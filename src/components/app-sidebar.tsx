"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  CreditCard,
  Frame,
  LifeBuoy,
  Map,
  Package,
  PieChart,
  Send,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Produtos",
      url: "/products",
      icon: Package,
    },
    {
      title: "Vendas",
      url: "/sales",
      icon: ShoppingCart,
    },
    {
      title: "Clientes",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Financeiro",
      url: "#",
      icon: CreditCard,
      isActive: true,
      items: [
        {
          title: "Contas a Pagar",
          url: "/financial/payables",
        },
        {
          title: "Contas a Receber",
          url: "/financial/receivables",
        }
      ],
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Nome da Loja</span>
                  <span className="truncate text-xs">21.234.567/0001-00</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
