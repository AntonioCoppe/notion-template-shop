import { Spinner } from "@medusajs/icons"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useMe } from "../../../hooks/api/users"
import { SearchProvider } from "../../../providers/search-provider"
import { SidebarProvider } from "../../../providers/sidebar-provider"

export const ProtectedRoute = () => {
  const { seller, isPending, error } = useMe()
  const isSuspended = seller?.store_status === "SUSPENDED"

  const location = useLocation()
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    )
  }

  if (!seller) {
    return (
      <Navigate
        to={`/login${error?.message ? `?reason=${error.message}` : ""}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return (
    <SidebarProvider>
      <SearchProvider>
        {isSuspended && (
          <div className="w-full bg-red-600 text-white p-1 text-center text-sm">
            Your store is <b>suspended</b>. Please contact support.
          </div>
        )}
        <Outlet />
      </SearchProvider>
    </SidebarProvider>
  )
}
