'use client'

import * as React from 'react'
import { Moon, Sun, X, Trash2, Settings, Database, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

import { useChatStore } from '@/lib/store'
import ChatSettings from './chat-settings'

interface SidebarProps {
  isMobile: boolean
  onClose: () => void
}

export function AppSidebar({ isMobile, onClose }: SidebarProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { user } = useUser()
  const { clearMessages, patrons, plugins, togglePlugin } = useChatStore()
  const [isPatron, setIsPatron] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setIsPatron(user?.email ? patrons.includes(user.email) : false)
  }, [user, patrons])

  return (
    <Sidebar className={`h-full ${isMobile ? 'w-[85vw] max-w-[400px]' : 'w-96'}`}>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold text-primary">Ustawienia</span>
        </div>
        <div className="flex items-center space-x-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-primary"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
              className="text-muted-foreground hover:text-primary"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-4 p-4">
        <div className="space-y-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.name}
              className={`flex items-center justify-between 
              ${plugin.enabled ? 'bg-primary/10' : 'bg-secondary/50'}
               p-3 rounded-lg`}
            >
              <span className="text-sm font-medium flex items-center">
                <Database className="w-4 h-4 mr-2 text-primary" />
                korzystaj z {plugin.name}
              </span>
              <Switch
                checked={plugin.enabled}
                onCheckedChange={() => togglePlugin(plugin.name)}
              />
            </div>
          ))}
          {!isPatron && (
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                <Link
                  href="https://patronite.pl/sejm-stats"
                  className="text-primary font-semibold hover:underline"
                >
                  Zostań patronem
                </Link>
                , aby korzystać z płatnych modeli.
              </p>
            </div>
          )}
        </div>

        <ChatSettings />
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={clearMessages} className="w-full text-sm text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń historię
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <>
              <SidebarMenuItem>
                <Link href="/profile-client" passHref>
                  <SidebarMenuButton className="w-full text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/api/auth/logout" passHref>
                  <SidebarMenuButton className="w-full text-sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}