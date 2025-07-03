import * as React from "react"
import {
  Command,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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
import { userService } from "@/lib/services"

const navMain = [
  {
    title: "Produtos",
    url: "#",
    isActive: true,
    items: [
      {
        title: "Lista de Produtos",
        url: "/products",
      },
      {
        title: "Categorias",
        url: "/products/categories",
      },
    ],
  },
  {
    title: "Vendas",
    url: "/sales",
  },
  {
    title: "Clientes",
    url: "/customers",
  },
  {
    title: "Financeiro",
    url: "#",
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
]

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Buscar dados do usuário autenticado
  const userProfile = await userService.getCurrentUser()
  
  // Dados do usuário para o componente NavUser
  const userData = userProfile ? {
    name: userProfile.name,
    email: userProfile.email,
    avatar: userProfile.avatar_url || "",
  } : {
    name: "Usuário",
    email: "",
    avatar: "",
  }

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
                  <span className="truncate text-xs">00.000.000/0000-00</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
