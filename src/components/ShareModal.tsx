'use client'

import { useState } from 'react'
import { X, Copy, Facebook, Twitter, MessageCircle, Send, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  videoTitle: string
}

export default function ShareModal({ isOpen, onClose, videoId, videoTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  if (!isOpen) return null

  const videoUrl = `${window.location.origin}/watch/${videoId}`

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      platform: 'twitter'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      platform: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      platform: 'telegram'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      platform: 'linkedin'
    }
  ]

  const handleShare = async (platform: string) => {
    setSharing(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })

      if (response.ok) {
        const data = await response.json()
        const shareUrl = data.shareUrls[platform]
        
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Please login to share videos')
      }
    } catch (error) {
      console.error('Share failed:', error)
      alert('Share failed. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      // Track copy action
      await fetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'copy' })
      }).catch(() => {}) // Ignore errors for tracking
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Failed to copy link')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Share Video</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            {videoTitle}
          </h4>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
            <input
              type="text"
              value={videoUrl}
              readOnly
              className="flex-1 bg-transparent text-gray-300 text-sm outline-none"
            />
            <Button
              onClick={handleCopyLink}
              className={`px-3 py-1 text-xs ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {copied ? (
                'Copied!'
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Share on social media</h4>
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                onClick={() => handleShare(option.platform)}
                disabled={sharing}
                className={`flex items-center gap-3 p-3 rounded-lg text-white transition-colors ${option.color} ${
                  sharing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Sharing helps support our content creators
          </p>
        </div>
      </div>
    </div>
  )
}