import React from "react"
import { NavLink, useLocation, Outlet } from "react-router-dom"
import { 
  BarChart3, 
  BrainCircuit, 
  Database, 
  FileText, 
  Home, 
  Settings, 
  Shield, 
  Users 
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

const data = {
  navMain: [
    {
      title: "Vue d'ensemble",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Analytics",
      url: "/admin/analytics", 
      icon: BarChart3,
    },
    {
      title: "Publicité IA",
      url: "/admin/advertising-ai",
      icon: BrainCircuit,
    },
    {
      title: "Utilisateurs",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Données",
      url: "/admin/data",
      icon: Database,
    },
    {
      title: "Contenu",
      url: "/admin/content",
      icon: FileText,
    },
    {
      title: "Sécurité", 
      url: "/admin/security",
      icon: Shield,
    },
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

function AdminSidebar() {
  const location = useLocation()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          {state === "expanded" && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">TechRepair</span>
              <span className="truncate text-xs text-muted-foreground">Administration</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = location.pathname === item.url || 
                               (item.url !== '/admin' && location.pathname.startsWith(item.url))
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function AdminDashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'administration TechRepair
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Réparateurs</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+12% ce mois</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Demandes</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">5,678</div>
          <p className="text-xs text-muted-foreground">+8% ce mois</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Campagnes IA</h3>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">45</div>
          <p className="text-xs text-muted-foreground">+25% ce mois</p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Revenus</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">€125,430</div>
          <p className="text-xs text-muted-foreground">+18% ce mois</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Activité récente</h3>
            <p className="text-sm text-muted-foreground">Dernières actions sur la plateforme</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau réparateur inscrit</p>
                <p className="text-xs text-muted-foreground">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Campagne IA créée</p>
                <p className="text-xs text-muted-foreground">Il y a 15 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Demande de réparation</p>
                <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Accès rapide</h3>
            <p className="text-sm text-muted-foreground">Actions fréquentes</p>
          </div>
          <div className="p-6 pt-0 space-y-3">
            <NavLink 
              to="/admin/advertising-ai" 
              className="block w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Publicité IA</p>
                  <p className="text-xs text-muted-foreground">Gérer les campagnes</p>
                </div>
              </div>
            </NavLink>
            
            <NavLink 
              to="/admin/analytics" 
              className="block w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Voir les statistiques</p>
                </div>
              </div>
            </NavLink>
            
            <NavLink 
              to="/admin/users" 
              className="block w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Utilisateurs</p>
                  <p className="text-xs text-muted-foreground">Gérer les comptes</p>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const location = useLocation()
  
  const getCurrentPageTitle = () => {
    const currentItem = data.navMain.find(item => 
      location.pathname === item.url || 
      (item.url !== '/admin' && location.pathname.startsWith(item.url))
    )
    return currentItem?.title || 'Tableau de bord'
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getCurrentPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {location.pathname === '/admin' ? <AdminDashboardHome /> : <Outlet />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}