/**
 * Video Processing Service
 * 
 * This service handles video quality processing and adaptive streaming.
 * Currently implements basic quality detection, but can be extended with:
 * - FFmpeg integration for server-side transcoding
 * - AWS Elemental MediaConvert for cloud processing
 * - HLS/DASH streaming protocols
 */

import { VIDEO_QUALITIES } from './video-processing'

export interface AdaptiveStreamingConfig {
  enableAdaptive: boolean
  defaultQuality: string
  qualityLevels: string[]
  bandwidthThresholds: {
    slow: number    // < 1 Mbps
    medium: number  // 1-5 Mbps  
    fast: number    // > 5 Mbps
  }
}

export const DEFAULT_STREAMING_CONFIG: AdaptiveStreamingConfig = {
  enableAdaptive: true,
  defaultQuality: 'auto',
  qualityLevels: ['360p', '480p', '720p', '1080p'],
  bandwidthThresholds: {
    slow: 1000,    // 1 Mbps
    medium: 5000,  // 5 Mbps
    fast: 10000    // 10 Mbps
  }
}

/**
 * Detect user's network speed using various methods
 */
export class NetworkSpeedDetector {
  private static instance: NetworkSpeedDetector
  private currentSpeed: 'slow' | 'medium' | 'fast' = 'medium'
  private lastMeasurement: number = 0

  static getInstance(): NetworkSpeedDetector {
    if (!NetworkSpeedDetector.instance) {
      NetworkSpeedDetector.instance = new NetworkSpeedDetector()
    }
    return NetworkSpeedDetector.instance
  }

  async detectSpeed(): Promise<'slow' | 'medium' | 'fast'> {
    // Use multiple detection methods
    const speeds = await Promise.allSettled([
      this.detectViaNavigatorConnection(),
      this.detectViaDownloadTest(),
      this.detectViaNetworkInformation()
    ])

    // Aggregate results
    const validSpeeds = speeds
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<'slow' | 'medium' | 'fast'>).value)

    if (validSpeeds.length > 0) {
      // Use most conservative speed
      if (validSpeeds.includes('slow')) return 'slow'
      if (validSpeeds.includes('medium')) return 'medium'
      return 'fast'
    }

    return this.currentSpeed
  }

  private async detectViaNavigatorConnection(): Promise<'slow' | 'medium' | 'fast'> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection?.effectiveType
      const downlink = connection?.downlink // Mbps

      if (downlink) {
        if (downlink < 1) return 'slow'
        if (downlink < 5) return 'medium'
        return 'fast'
      }

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow'
        case '3g':
          return 'medium'
        case '4g':
        default:
          return 'fast'
      }
    }
    throw new Error('Navigator connection not available')
  }

  private async detectViaDownloadTest(): Promise<'slow' | 'medium' | 'fast'> {
    // Simple download test using a small image
    const testUrl = '/enyamedia-logo.svg' // Use our logo as test file
    const startTime = performance.now()
    
    try {
      const response = await fetch(testUrl + '?t=' + Date.now(), { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (!response.ok) throw new Error('Download test failed')
      
      await response.blob()
      const endTime = performance.now()
      const duration = (endTime - startTime) / 1000 // seconds
      
      // Estimate speed based on download time
      // This is a rough estimate - in production you'd use a larger test file
      if (duration > 2) return 'slow'
      if (duration > 0.5) return 'medium'
      return 'fast'
      
    } catch (error) {
      throw new Error('Download test failed')
    }
  }

  private async detectViaNetworkInformation(): Promise<'slow' | 'medium' | 'fast'> {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const rtt = connection?.rtt // Round trip time in ms
      
      if (rtt) {
        if (rtt > 300) return 'slow'
        if (rtt > 100) return 'medium'
        return 'fast'
      }
    }
    throw new Error('Network Information API not available')
  }

  getCurrentSpeed(): 'slow' | 'medium' | 'fast' {
    return this.currentSpeed
  }

  setCurrentSpeed(speed: 'slow' | 'medium' | 'fast') {
    this.currentSpeed = speed
    this.lastMeasurement = Date.now()
  }
}

/**
 * Quality selector based on network conditions
 */
export class QualitySelector {
  static selectOptimalQuality(
    availableQualities: Array<{ label: string; height: number; url: string }>,
    networkSpeed: 'slow' | 'medium' | 'fast',
    userPreference?: string
  ): { label: string; height: number; url: string } | null {
    
    if (availableQualities.length === 0) return null
    
    // If user has a specific preference, try to honor it
    if (userPreference && userPreference !== 'auto') {
      const preferred = availableQualities.find(q => q.label.toLowerCase() === userPreference.toLowerCase())
      if (preferred) return preferred
    }

    // Filter out 'Auto' option for selection
    const actualQualities = availableQualities.filter(q => q.label !== 'Auto')
    if (actualQualities.length === 0) return availableQualities[0]

    // Sort by height (quality) descending
    const sortedQualities = [...actualQualities].sort((a, b) => b.height - a.height)

    // Select based on network speed
    switch (networkSpeed) {
      case 'slow':
        // Prefer 360p or lowest available
        return sortedQualities.find(q => q.height <= 360) || sortedQualities[sortedQualities.length - 1]
      
      case 'medium':
        // Prefer 480p-720p
        return sortedQualities.find(q => q.height <= 720 && q.height >= 480) || 
               sortedQualities.find(q => q.height <= 720) ||
               sortedQualities[sortedQualities.length - 1]
      
      case 'fast':
        // Prefer 1080p or highest available
        return sortedQualities.find(q => q.height >= 1080) || sortedQualities[0]
      
      default:
        return sortedQualities[Math.floor(sortedQualities.length / 2)] // Middle quality
    }
  }
}

/**
 * Adaptive streaming manager
 */
export class AdaptiveStreamingManager {
  private networkDetector: NetworkSpeedDetector
  private currentQuality: string = 'auto'
  private config: AdaptiveStreamingConfig

  constructor(config: AdaptiveStreamingConfig = DEFAULT_STREAMING_CONFIG) {
    this.networkDetector = NetworkSpeedDetector.getInstance()
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.config.enableAdaptive) {
      const speed = await this.networkDetector.detectSpeed()
      this.networkDetector.setCurrentSpeed(speed)
    }
  }

  getRecommendedQuality(availableQualities: Array<{ label: string; height: number; url: string }>): string {
    const networkSpeed = this.networkDetector.getCurrentSpeed()
    const optimal = QualitySelector.selectOptimalQuality(availableQualities, networkSpeed)
    return optimal?.label || 'auto'
  }

  shouldSwitchQuality(currentBandwidth: number, bufferHealth: number): boolean {
    // Implement adaptive switching logic
    // Switch to lower quality if bandwidth drops or buffer is low
    // Switch to higher quality if bandwidth improves and buffer is healthy
    
    const { slow, medium, fast } = this.config.bandwidthThresholds
    
    if (currentBandwidth < slow && bufferHealth < 5) {
      return true // Switch to lower quality
    }
    
    if (currentBandwidth > fast && bufferHealth > 15) {
      return true // Switch to higher quality
    }
    
    return false
  }
}

/**
 * Video analytics for quality optimization
 */
export class VideoAnalytics {
  private static metrics: Map<string, any> = new Map()

  static trackQualitySwitch(videoId: string, fromQuality: string, toQuality: string, reason: string) {
    const key = `quality_switch_${videoId}`
    const existing = this.metrics.get(key) || []
    existing.push({
      timestamp: Date.now(),
      from: fromQuality,
      to: toQuality,
      reason
    })
    this.metrics.set(key, existing)
  }

  static trackBuffering(videoId: string, duration: number, quality: string) {
    const key = `buffering_${videoId}`
    const existing = this.metrics.get(key) || []
    existing.push({
      timestamp: Date.now(),
      duration,
      quality
    })
    this.metrics.set(key, existing)
  }

  static getMetrics(videoId: string): any {
    return {
      qualitySwitches: this.metrics.get(`quality_switch_${videoId}`) || [],
      bufferingEvents: this.metrics.get(`buffering_${videoId}`) || []
    }
  }
}