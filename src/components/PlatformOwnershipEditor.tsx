import { useState, useEffect } from 'react'
import { 
  Check, 
  X, 
  Edit3, 
  Calendar, 
  DollarSign, 
  FileText,
  Package,
  Monitor,
  Smartphone,
  Gamepad2
} from 'lucide-react'
import { PlatformOwnership } from '../contexts/GameContext'

interface PlatformOwnershipEditorProps {
  platforms: string[]
  platformOwnership: PlatformOwnership[]
  onSave: (platformOwnership: PlatformOwnership[]) => void
  onCancel: () => void
  isEditing: boolean
  onEdit: () => void
}

const ownershipTypeIcons = {
  physical: Package,
  digital: Monitor,
  subscription: Smartphone,
  other: Gamepad2,
}

const ownershipTypeLabels = {
  physical: 'Physical',
  digital: 'Digital',
  subscription: 'Subscription',
  other: 'Other',
}

export default function PlatformOwnershipEditor({
  platforms,
  platformOwnership,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: PlatformOwnershipEditorProps) {
  const [localOwnership, setLocalOwnership] = useState<PlatformOwnership[]>(platformOwnership)

  useEffect(() => {
    setLocalOwnership(platformOwnership)
  }, [platformOwnership])

  const handleOwnershipChange = (platform: string, owned: boolean) => {
    setLocalOwnership(prev => {
      const existing = prev.find(p => p.platform === platform)
      if (existing) {
        return prev.map(p => 
          p.platform === platform ? { ...p, owned } : p
        )
      } else {
        return [...prev, {
          platform,
          owned,
          ownershipType: 'other',
          purchaseDate: undefined,
          purchasePrice: undefined,
          notes: undefined,
        }]
      }
    })
  }

  const handleOwnershipTypeChange = (platform: string, ownershipType: PlatformOwnership['ownershipType']) => {
    setLocalOwnership(prev => 
      prev.map(p => 
        p.platform === platform ? { ...p, ownershipType } : p
      )
    )
  }

  const handleFieldChange = (platform: string, field: keyof PlatformOwnership, value: any) => {
    setLocalOwnership(prev => 
      prev.map(p => 
        p.platform === platform ? { ...p, [field]: value } : p
      )
    )
  }

  const handleSave = () => {
    onSave(localOwnership)
  }

  const getOwnershipStatus = (platform: string) => {
    const ownership = localOwnership.find(p => p.platform === platform)
    return ownership?.owned || false
  }

  const getOwnershipType = (platform: string) => {
    const ownership = localOwnership.find(p => p.platform === platform)
    return ownership?.ownershipType || 'other'
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Platform Ownership</h3>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map(platform => {
            const owned = getOwnershipStatus(platform)
            const ownershipType = getOwnershipType(platform)
            const ownership = localOwnership.find(p => p.platform === platform)
            
            return (
              <div key={platform} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {owned ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">{platform}</span>
                </div>
                {owned && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {ownershipTypeLabels[ownershipType]}
                    </span>
                    {ownership?.purchaseDate && (
                      <span className="text-sm text-gray-400">
                        {new Date(ownership.purchaseDate).toLocaleDateString()}
                      </span>
                    )}
                    {ownership?.purchasePrice && (
                      <span className="text-sm text-gray-400">
                        ${ownership.purchasePrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Edit Platform Ownership</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {platforms.map(platform => {
          const owned = getOwnershipStatus(platform)
          const ownershipType = getOwnershipType(platform)
          const ownership = localOwnership.find(p => p.platform === platform)
          
          return (
            <div key={platform} className="p-4 bg-dark-700 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{platform}</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={owned}
                    onChange={(e) => handleOwnershipChange(platform, e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-dark-600 border-dark-500 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Owned</span>
                </label>
              </div>
              
              {owned && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Ownership Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ownership Type
                    </label>
                    <select
                      value={ownershipType}
                      onChange={(e) => handleOwnershipTypeChange(platform, e.target.value as PlatformOwnership['ownershipType'])}
                      className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.entries(ownershipTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={ownership?.purchaseDate || ''}
                      onChange={(e) => handleFieldChange(platform, 'purchaseDate', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* Purchase Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ownership?.purchasePrice || ''}
                      onChange={(e) => handleFieldChange(platform, 'purchasePrice', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={ownership?.notes || ''}
                      onChange={(e) => handleFieldChange(platform, 'notes', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
