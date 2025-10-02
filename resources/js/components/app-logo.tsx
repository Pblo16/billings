import AppLogoIcon from './app-logo-icon'

export default function AppLogo() {
  return (
    <>
      <div className="flex justify-center items-center bg-sidebar-primary rounded-md size-8 aspect-square text-sidebar-primary-foreground shrink-0">
        <AppLogoIcon className="fill-current size-5 text-white dark:text-black" />
      </div>
      <div className="group-data-[collapsible=icon]:hidden flex-1 grid ml-1 text-sm text-left leading-tight transition-all">
        <span className="font-semibold truncate">Laravel Starter Kit</span>
      </div>
    </>
  )
}
