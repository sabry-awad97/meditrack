import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Package,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Pill,
  Bell,
  Moon,
  Sun,
  Languages,
  LogOut,
  PackageSearch,
  FileText,
  TrendingUp,
} from "lucide-react";

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
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { useAlertStats, useSettingValue, useUpsertSettingValue } from "@/hooks";
import {
  useLocale,
  LOCALES,
  useTranslation,
  useDirection,
} from "@meditrack/i18n";
import { useAuth } from "@/hooks/use-auth";
import { getSettingDefinition } from "@/lib/constants";
import {
  SETTING_SIDEBAR_DEFAULT_STATE,
  SETTING_DEFAULT_THEME,
  SETTING_DEFAULT_LANGUAGE,
} from "@/lib/constants";
import { useInventoryStatistics } from "@/hooks/use-inventory";

// ============================================================================
// Types
// ============================================================================

interface MenuItem {
  title: string;
  url?: string; // Optional - parent items with subItems don't need a URL
  icon: React.ComponentType<{ className?: string }>;
  badge?: "orders" | "inventory";
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BadgeConfig {
  value: number;
  show: boolean;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Custom hook to manage expanded menu items state
 */
function useExpandedMenuItems(currentPath: string, menuItems: MenuItem[]) {
  // Auto-expand parent menu if a subitem is active
  const getInitialExpandedItems = useCallback(() => {
    const expanded = new Set<string>();
    menuItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (subItem) =>
            currentPath === subItem.url ||
            currentPath.startsWith(subItem.url + "/"),
        );
        if (hasActiveSubItem) {
          expanded.add(item.title);
        }
      }
    });
    return expanded;
  }, [currentPath, menuItems]);

  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    getInitialExpandedItems,
  );

  // Update expanded items when route changes
  useEffect(() => {
    setExpandedItems(getInitialExpandedItems());
  }, [getInitialExpandedItems]);

  const toggleExpanded = useCallback((itemTitle: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemTitle)) {
        next.delete(itemTitle);
      } else {
        next.add(itemTitle);
      }
      return next;
    });
  }, []);

  return { expandedItems, toggleExpanded };
}

/**
 * Custom hook to manage all menu items configuration
 */
function useMenuItems(t: (key: string) => string) {
  const mainMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        title: t("navigation.home"),
        url: "/",
        icon: Home,
      },
      {
        title: t("navigation.inventory"),
        // No URL - parent item with submenu
        icon: PackageSearch,
        badge: "inventory",
        subItems: [
          {
            title: t("navigation.allItems"),
            url: "/inventory",
            icon: PackageSearch,
          },
          {
            title: t("navigation.manufacturers"),
            url: "/inventory/manufacturers",
            icon: Users,
          },
        ],
      },
      {
        title: t("navigation.orders"),
        url: "/special-orders",
        icon: Package,
        badge: "orders",
      },
      {
        title: t("navigation.suppliers"),
        url: "/suppliers",
        icon: Users,
      },
      {
        title: t("navigation.reports"),
        // No URL - parent item with submenu
        icon: BarChart3,
        subItems: [
          {
            title: t("navigation.salesReports"),
            url: "/reports/sales",
            icon: TrendingUp,
          },
          {
            title: t("navigation.inventoryReports"),
            url: "/reports/inventory",
            icon: FileText,
          },
        ],
      },
    ],
    [t],
  );

  const secondaryMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        title: t("navigation.settings"),
        url: "/settings",
        icon: Settings,
      },
      {
        title: t("navigation.help"),
        url: "/help",
        icon: HelpCircle,
      },
    ],
    [t],
  );

  return { mainMenuItems, secondaryMenuItems };
}

/**
 * Custom hook to manage sidebar persistence
 */
function useSidebarPersistence(
  open: boolean,
  setOpen: (open: boolean) => void,
  sidebarDefaultState: string | undefined,
) {
  const upsertSettingValue = useUpsertSettingValue();
  const isInitialMount = useRef(true);

  // Load sidebar state from settings on mount
  useEffect(() => {
    if (sidebarDefaultState) {
      const shouldBeOpen = sidebarDefaultState === "open";
      if (open !== shouldBeOpen) {
        setOpen(shouldBeOpen);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save sidebar state to settings when it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newState = open ? "open" : "collapsed";
    if (sidebarDefaultState !== newState) {
      const def = getSettingDefinition(SETTING_SIDEBAR_DEFAULT_STATE);
      upsertSettingValue.mutate({
        key: SETTING_SIDEBAR_DEFAULT_STATE,
        value: newState,
        category: def?.category,
      });
    }
  }, [open, sidebarDefaultState, upsertSettingValue]);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a menu item is active based on current path
 * For submenu items, only exact matches are considered active
 */
function isMenuItemActive(
  itemUrl: string | undefined,
  currentPath: string,
  isSubItem: boolean = false,
): boolean {
  if (!itemUrl) return false; // Parent items with no URL are never active

  // For subitems, only exact match
  if (isSubItem) {
    return currentPath === itemUrl;
  }

  // For main items, exact match or starts with (for nested routes)
  return currentPath === itemUrl || currentPath.startsWith(itemUrl + "/");
}

/**
 * Calculate badge configuration for a menu item
 */
function getBadgeConfig(
  badge: MenuItem["badge"],
  totalAlerts: number,
  totalInventoryItems: number,
): BadgeConfig {
  if (badge === "orders" && totalAlerts > 0) {
    return { value: totalAlerts, show: true };
  }
  if (badge === "inventory" && totalInventoryItems > 0) {
    return { value: totalInventoryItems, show: true };
  }
  return { value: 0, show: false };
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CollapsibleMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  badgeConfig: BadgeConfig;
  currentPath: string;
  sidebarState: "expanded" | "collapsed";
  isRTL: boolean;
  onToggle: () => void;
}

function CollapsibleMenuItem({
  item,
  isActive,
  isExpanded,
  badgeConfig,
  currentPath,
  sidebarState,
  isRTL,
  onToggle,
}: CollapsibleMenuItemProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggle}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={(props) => (
            <SidebarMenuButton
              isActive={isActive}
              tooltip={sidebarState === "collapsed" ? item.title : undefined}
              className="w-full"
              {...props}
            >
              <item.icon className="shrink-0 size-4" />
              <span className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                {item.title}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={`shrink-0 ${isRTL ? "rotate-180" : ""}`}
              >
                <ChevronRight className="size-4" />
              </motion.div>
            </SidebarMenuButton>
          )}
        />
        {badgeConfig.show && (
          <SidebarMenuBadge
            className={isRTL ? "left-6 right-auto" : "right-6 left-auto"}
          >
            {badgeConfig.value}
          </SidebarMenuBadge>
        )}
        <CollapsibleContent>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <SidebarMenuSub>
                  {item.subItems?.map((subItem, index) => {
                    const isSubActive = isMenuItemActive(
                      subItem.url,
                      currentPath,
                      true, // This is a subitem, use exact match only
                    );
                    return (
                      <motion.div
                        key={subItem.title}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.15,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                      >
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={isSubActive}
                            render={(props) => (
                              <Link to={subItem.url} {...props} />
                            )}
                          >
                            <subItem.icon className="shrink-0 size-4" />
                            <span
                              className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {subItem.title}
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </motion.div>
                    );
                  })}
                </SidebarMenuSub>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

interface SimpleMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  badgeConfig: BadgeConfig;
  sidebarState: "expanded" | "collapsed";
  isRTL: boolean;
}

function SimpleMenuItem({
  item,
  isActive,
  badgeConfig,
  sidebarState,
  isRTL,
}: SimpleMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={sidebarState === "collapsed" ? item.title : undefined}
        render={(props) =>
          item.url ? <Link to={item.url} {...props} /> : <div {...props} />
        }
      >
        <item.icon className="shrink-0 size-4" />
        <span className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
          {item.title}
        </span>
      </SidebarMenuButton>
      {badgeConfig.show && (
        <SidebarMenuBadge
          className={isRTL ? "left-1 right-auto" : "right-1 left-auto"}
        >
          {badgeConfig.value}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AppSidebar() {
  const { state, open, setOpen } = useSidebar();
  const sidebarDefaultState = useSettingValue<string>(
    SETTING_SIDEBAR_DEFAULT_STATE,
    "open",
  );
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { theme, setTheme } = useTheme();
  const { data: alertStats } = useAlertStats();
  const { data: inventoryStats } = useInventoryStatistics();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("common");
  const { isRTL } = useDirection();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const upsertSettingValue = useUpsertSettingValue();

  // Menu configuration
  const { mainMenuItems, secondaryMenuItems } = useMenuItems(t);

  // Calculate badge values
  const totalAlerts = useMemo(
    () =>
      (alertStats?.oldOrders || 0) +
      (alertStats?.notPickedUp || 0) +
      (alertStats?.delayed || 0),
    [alertStats],
  );

  const totalInventoryItems = inventoryStats?.active_items || 0;

  // Custom hooks
  const { expandedItems, toggleExpanded } = useExpandedMenuItems(
    currentPath,
    mainMenuItems,
  );
  useSidebarPersistence(open, setOpen, sidebarDefaultState);

  // Event handlers
  const handleLogout = useCallback(async () => {
    await logout();
    navigate({ to: "/login" });
  }, [logout, navigate]);

  const handleThemeChange = useCallback(() => {
    const newTheme: "light" | "dark" | "system" =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    setTheme(newTheme);

    const def = getSettingDefinition(SETTING_DEFAULT_THEME);
    upsertSettingValue.mutate({
      key: SETTING_DEFAULT_THEME,
      value: newTheme,
      category: def?.category,
    });
  }, [theme, setTheme, upsertSettingValue]);

  const handleLanguageChange = useCallback(() => {
    const newLocale = locale === "ar" ? "en" : "ar";
    setLocale(newLocale);

    const def = getSettingDefinition(SETTING_DEFAULT_LANGUAGE);
    upsertSettingValue.mutate({
      key: SETTING_DEFAULT_LANGUAGE,
      value: newLocale,
      category: def?.category,
    });
  }, [locale, setLocale, upsertSettingValue]);

  return (
    <Sidebar
      collapsible="icon"
      side={isRTL ? "right" : "left"}
      className={isRTL ? "border-l" : "border-r"}
    >
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 py-3">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                <Pill className="size-4" />
              </div>
              <div
                className={`grid flex-1 text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden ${isRTL ? "text-right" : "text-left"}`}
              >
                <span className="truncate font-bold text-base">
                  {t("app.title")}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("app.subtitle")}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const isActive = isMenuItemActive(item.url, currentPath);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.has(item.title);
                const badgeConfig = getBadgeConfig(
                  item.badge,
                  totalAlerts,
                  totalInventoryItems,
                );

                if (hasSubItems) {
                  return (
                    <CollapsibleMenuItem
                      key={item.title}
                      item={item}
                      isActive={isActive}
                      isExpanded={isExpanded}
                      badgeConfig={badgeConfig}
                      currentPath={currentPath}
                      sidebarState={state}
                      isRTL={isRTL}
                      onToggle={() => toggleExpanded(item.title)}
                    />
                  );
                }

                return (
                  <SimpleMenuItem
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    badgeConfig={badgeConfig}
                    sidebarState={state}
                    isRTL={isRTL}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Secondary Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.other")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => {
                const isActive = isMenuItemActive(item.url, currentPath);
                return (
                  <SimpleMenuItem
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    badgeConfig={{ value: 0, show: false }}
                    sidebarState={state}
                    isRTL={isRTL}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Appearance Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.appearance")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleThemeChange}
                  tooltip={
                    state === "collapsed"
                      ? theme === "light"
                        ? t("theme.dark")
                        : theme === "dark"
                          ? t("theme.system")
                          : t("theme.light")
                      : undefined
                  }
                  className="flex items-center gap-2"
                >
                  {theme === "light" ? (
                    <Moon className="shrink-0 size-4" />
                  ) : theme === "dark" ? (
                    <Settings className="shrink-0 size-4" />
                  ) : (
                    <Sun className="shrink-0 size-4" />
                  )}
                  <span
                    className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {theme === "light"
                      ? t("theme.dark")
                      : theme === "dark"
                        ? t("theme.system")
                        : t("theme.light")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLanguageChange}
                  tooltip={
                    state === "collapsed"
                      ? LOCALES[locale === "ar" ? "en" : "ar"].nativeName
                      : undefined
                  }
                  className="flex items-center gap-2"
                >
                  <Languages className="shrink-0 size-4" />
                  <span
                    className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {LOCALES[locale === "ar" ? "en" : "ar"].nativeName}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(props) => (
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    {...props}
                  />
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8 rounded-lg shrink-0">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user?.first_name?.charAt(0) || "U"}
                      {user?.last_name?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`grid flex-1 text-sm leading-tight min-w-0 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <span className="truncate font-semibold">
                      {user?.display_name ||
                        `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                        t("user.pharmacy")}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || t("user.pharmacist")}
                    </span>
                  </div>
                  <ChevronDown
                    className={`shrink-0 size-4 ${isRTL ? "mr-auto" : "ml-auto"}`}
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>{t("navigation.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                  <Bell className="h-4 w-4 shrink-0" />
                  <span>{t("user.notifications")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <span>{t("navigation.help")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{t("auth.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
