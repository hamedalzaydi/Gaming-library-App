import { useState, useEffect } from 'react'
import { 
  Check, 
  X, 
  Edit3, 
  Calendar, 
  DollarSign, 
  FileText,
  Store,
  CreditCard,
  Gamepad2,
  Package
} from 'lucide-react'
import { PlatformOwnership, Storefront, SubscriptionService } from '../contexts/GameContext'

interface PlatformOwnershipEditorProps {
  platforms: string[]
  platformOwnership: PlatformOwnership[]
  onSave: (platformOwnership: PlatformOwnership[]) => void
  onCancel: () => void
  isEditing: boolean
  onEdit: () => void
}

const storefrontOptions: { value: Storefront; label: string; category: string }[] = [
  // Physical Copies
  { value: 'Physical', label: 'Physical Copy', category: 'Physical Copies' },
  // PC Storefronts
  { value: 'Steam', label: 'Steam', category: 'PC' },
  { value: 'Epic Games Store', label: 'Epic Games Store', category: 'PC' },
  { value: 'GOG Galaxy', label: 'GOG Galaxy', category: 'PC' },
  { value: 'Battle.net', label: 'Battle.net', category: 'PC' },
  { value: 'Origin', label: 'Origin', category: 'PC' },
  { value: 'EA App', label: 'EA App', category: 'PC' },
  { value: 'Ubisoft Connect', label: 'Ubisoft Connect', category: 'PC' },
  { value: 'Rockstar Games Launcher', label: 'Rockstar Games Launcher', category: 'PC' },
  { value: 'Bethesda.net', label: 'Bethesda.net', category: 'PC' },
  { value: 'Microsoft Store', label: 'Microsoft Store', category: 'PC' },
  { value: 'itch.io', label: 'itch.io', category: 'PC' },
  { value: 'Humble Store', label: 'Humble Store', category: 'PC' },
  { value: 'Green Man Gaming', label: 'Green Man Gaming', category: 'PC' },
  { value: 'Fanatical', label: 'Fanatical', category: 'PC' },
  // Console Storefronts
  { value: 'PlayStation Store', label: 'PlayStation Store', category: 'Console' },
  { value: 'Xbox Store', label: 'Xbox Store', category: 'Console' },
  { value: 'Nintendo eShop', label: 'Nintendo eShop', category: 'Console' },
  // Mobile Storefronts
  { value: 'App Store', label: 'App Store', category: 'Mobile' },
  { value: 'Google Play Store', label: 'Google Play Store', category: 'Mobile' },
  { value: 'Amazon Appstore', label: 'Amazon Appstore', category: 'Mobile' },
  // Other
  { value: 'Other', label: 'Other', category: 'Other' },
]

const subscriptionOptions: { value: SubscriptionService; label: string; category: string }[] = [
  // PC Subscriptions
  { value: 'Xbox Game Pass (PC)', label: 'Xbox Game Pass (PC)', category: 'PC' },
  { value: 'EA Play', label: 'EA Play', category: 'PC' },
  { value: 'Ubisoft+', label: 'Ubisoft+', category: 'PC' },
  { value: 'Apple Arcade', label: 'Apple Arcade', category: 'PC' },
  { value: 'Amazon Prime Gaming', label: 'Amazon Prime Gaming', category: 'PC' },
  // Console Subscriptions
  { value: 'Xbox Game Pass (Console)', label: 'Xbox Game Pass (Console)', category: 'Console' },
  { value: 'Xbox Game Pass Ultimate', label: 'Xbox Game Pass Ultimate', category: 'Console' },
  { value: 'PlayStation Plus', label: 'PlayStation Plus', category: 'Console' },
  { value: 'PlayStation Now', label: 'PlayStation Now', category: 'Console' },
  { value: 'Nintendo Switch Online', label: 'Nintendo Switch Online', category: 'Console' },
  // Other
  { value: 'Other', label: 'Other', category: 'Other' },
]

export default function PlatformOwnershipEditor({ 
  platforms, 
  platformOwnership, 
  onSave, 
  onCancel, 
  isEditing, 
  onEdit 
}: PlatformOwnershipEditorProps) {
  const [ownership, setOwnership] = useState<PlatformOwnership[]>(platformOwnership)

  useEffect(() => {
    setOwnership(platformOwnership)
  }, [platformOwnership])

  const handleOwnershipChange = (platform: string, field: keyof PlatformOwnership, value: any) => {
    setOwnership(prev => prev.map(item => 
      item.platform === platform 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const handleSave = () => {
    onSave(ownership)
  }

  const getStorefrontIcon = (storefront: Storefront | null) => {
    if (!storefront) return <Gamepad2 className="w-4 h-4" />
    
    // Physical Copies
    if (storefront === 'Physical') {
      return <Package className="w-4 h-4" />
    }
    
    // PC Storefronts
    if (['Steam', 'Epic Games Store', 'GOG Galaxy', 'Battle.net', 'Origin', 'EA App', 'Ubisoft Connect', 'Rockstar Games Launcher', 'Bethesda.net', 'Microsoft Store', 'itch.io', 'Humble Store', 'Green Man Gaming', 'Fanatical'].includes(storefront)) {
      return <Store className="w-4 h-4" />
    }
    
    // Console Storefronts
    if (['PlayStation Store', 'Xbox Store', 'Nintendo eShop'].includes(storefront)) {
      return <Gamepad2 className="w-4 h-4" />
    }
    
    // Mobile Storefronts
    if (['App Store', 'Google Play Store', 'Amazon Appstore'].includes(storefront)) {
      return <Store className="w-4 h-4" />
    }
    
    return <Store className="w-4 h-4" />
  }

  const getSubscriptionIcon = (subscription: SubscriptionService | null) => {
    if (!subscription) return <Gamepad2 className="w-4 h-4" />
    return <CreditCard className="w-4 h-4" />
  }

  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Store className="w-5 h-5 text-blue-400" />
            <span>Platform Ownership</span>
          </h3>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {ownership.map((item) => (
            <div key={item.platform} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 font-medium">{item.platform}</span>
                {item.owned && (
                  <div className="flex items-center space-x-2">
                    {item.storefront && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md border border-blue-700/30">
                        {getStorefrontIcon(item.storefront)}
                        <span>{item.storefront}</span>
                      </span>
                    )}
                    {item.subscriptionService && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-md border border-green-700/30">
                        {getSubscriptionIcon(item.subscriptionService)}
                        <span>{item.subscriptionService}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-md ${
                  item.owned 
                    ? 'bg-green-900/30 text-green-300 border border-green-700/30' 
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}>
                  {item.owned ? 'Owned' : 'Not Owned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Store className="w-5 h-5 text-blue-400" />
          <span>Edit Platform Ownership</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {ownership.map((item) => (
          <div key={item.platform} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">{item.platform}</span>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.owned}
                  onChange={(e) => handleOwnershipChange(item.platform, 'owned', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-300 text-sm">Owned</span>
              </label>
            </div>
            
            {item.owned && (
              <div className="space-y-3">
                {/* Storefront Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Storefront
                  </label>
                  <select
                    value={item.storefront || ''}
                    onChange={(e) => handleOwnershipChange(item.platform, 'storefront', e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Storefront</option>
                    {storefrontOptions.map((option) => (
                      <optgroup key={option.category} label={option.category}>
                        <option value={option.value}>{option.label}</option>
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Subscription Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subscription Service (Optional)
                  </label>
                  <select
                    value={item.subscriptionService || ''}
                    onChange={(e) => handleOwnershipChange(item.platform, 'subscriptionService', e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Subscription</option>
                    {subscriptionOptions.map((option) => (
                      <optgroup key={option.category} label={option.category}>
                        <option value={option.value}>{option.label}</option>
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Purchase Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={item.purchaseDate || ''}
                    onChange={(e) => handleOwnershipChange(item.platform, 'purchaseDate', e.target.value || undefined)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Purchase Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.purchasePrice || ''}
                      onChange={(e) => handleOwnershipChange(item.platform, 'purchasePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={item.notes || ''}
                    onChange={(e) => handleOwnershipChange(item.platform, 'notes', e.target.value || undefined)}
                    rows={2}
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
