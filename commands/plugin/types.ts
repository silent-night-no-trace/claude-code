import type { LocalJSXCommandOnDone } from '../../types/command.js'

export type PluginSettingsProps = {
  onComplete: LocalJSXCommandOnDone
  args?: string
  showMcpRedirectMessage?: boolean
}

export type ManagePluginsAction = 'enable' | 'disable' | 'uninstall'

export type ManageMarketplacesAction = 'update' | 'remove'

export type ViewState =
  | {
      type: 'menu'
    }
  | {
      type: 'help'
    }
  | {
      type: 'validate'
      path?: string
    }
  | {
      type: 'discover-plugins'
      targetPlugin?: string
    }
  | {
      type: 'browse-marketplace'
      targetMarketplace?: string
      targetPlugin?: string
    }
  | {
      type: 'manage-plugins'
      targetPlugin?: string
      targetMarketplace?: string
      action?: ManagePluginsAction
    }
  | {
      type: 'manage-marketplaces'
      targetMarketplace?: string
      action?: ManageMarketplacesAction
    }
  | {
      type: 'add-marketplace'
      initialValue?: string
    }
  | {
      type: 'marketplace-menu'
    }
  | {
      type: 'marketplace-list'
    }
