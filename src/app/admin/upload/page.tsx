'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  name: string
  size: number
  type: string
  lastModified?: number
  coverImage?: File
  previewUrl?: string
}

export default function AdminUpload() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/mp4': ['.mp4'],
      'video/mpeg': ['.mpeg', '.mpg'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/webm': ['.webm']
    },
    maxSize: 500 * 1024 * 1024, // 500MB limit
    onDrop: (acceptedFiles, rejectedFiles) => {
      console.log('Files dropped:', { acceptedFiles, rejectedFiles })
      
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(rejection => {
          const error = rejection.errors[0]
          if (error.code === 'file-too-large') {
            return `${rejection.file.name}: File too large (max 500MB)`
          } else if (error.code === 'file-invalid-type') {
            return `${rejection.file.name}: Invalid file type. Only MP4, MPEG, MOV, AVI, WebM are supported`
          }
          return `${rejection.file.name}: ${error.message}`
        })
        alert('Upload errors:\n' + errors.join('\n'))
      }

      // Handle accepted files with better validation
      const newFiles = acceptedFiles
        .filter(file => {
          // Additional validation
          if (!file || !file.name || file.name === '') {
            console.error('File has no name:', file)
            return false
          }
          if (!file.size || file.size === 0) {
            console.error('File has no size:', file)
            return false
          }
          return true
        })
        .map(file => {
          console.log('Processing file:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          })
          
          return {
            file: file,
            id: Math.random().toString(36).substring(2),
            progress: 0,
            status: 'pending' as const,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }
        })
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles])
      } else if (acceptedFiles.length > 0) {
        alert('No valid files were added. Please check that your files are valid video files.')
      }
    },
    onError: (error) => {
      console.error('Dropzone error:', error)
      alert('Error handling files: ' + error.message)
    }
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadFileToServer = async (uploadFile: UploadFile, formData: FormData) => {
    try {
      console.log('Starting upload for:', {
        name: uploadFile.name,
        size: uploadFile.size,
        type: uploadFile.type,
        id: uploadFile.id,
        hasCoverImage: !!uploadFile.coverImage
      })

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      const token = localStorage.getItem('auth-token')
      
      // Add cover image if available
      if (uploadFile.coverImage) {
        formData.append('coverImage', uploadFile.coverImage)
      }
      
      // Log FormData contents
      console.log('FormData contents:')
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type
          })
        } else {
          console.log(`${key}:`, value)
        }
      }

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log('Upload response text:', responseText)

      if (response.ok) {
        const result = JSON.parse(responseText)
        console.log('Upload successful:', result)
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
        ))
      } else {
        let error
        try {
          error = JSON.parse(responseText)
        } catch {
          error = { error: responseText || 'Upload failed' }
        }
        console.error('Upload failed:', error)
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { 
            ...f, 
            status: 'error',
            error: error.error || 'Upload failed'
          } : f
        ))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error',
          error: 'Network error occurred'
        } : f
      ))
    }
  }

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploading(true)

    const formData = new FormData(event.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const isPublic = formData.get('isPublic') === 'on'
    const isFeatured = formData.get('isFeatured') === 'on'

    if (!title || title.trim() === '') {
      alert('Please enter a title')
      setUploading(false)
      return
    }

    const pendingFiles = files.filter(f => f.status === 'pending')
    
    if (pendingFiles.length === 0) {
      alert('Please select at least one video file')
      setUploading(false)
      return
    }

    // Validate files before upload
    const invalidFiles = pendingFiles.filter(uploadFile => 
      !uploadFile.name || !uploadFile.size || uploadFile.size === 0
    )
    
    if (invalidFiles.length > 0) {
      alert(`Invalid files detected: ${invalidFiles.map(f => f.name || 'Unknown').join(', ')}. Please remove them and try again.`)
      setUploading(false)
      return
    }
    
    console.log('Starting upload for files:', pendingFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })))
    
    for (const uploadFile of pendingFiles) {
      const uploadFormData = new FormData()
      uploadFormData.append('video', uploadFile.file)
      uploadFormData.append('title', `${title}${pendingFiles.length > 1 ? ` - ${uploadFile.name}` : ''}`)
      uploadFormData.append('description', description)
      uploadFormData.append('category', category)
      uploadFormData.append('tags', tags)
      uploadFormData.append('isPublic', isPublic.toString())
      uploadFormData.append('isFeatured', isFeatured.toString())

      console.log('Uploading file:', uploadFile.name, 'Size:', uploadFile.size, 'Type:', uploadFile.type)
      await uploadFileToServer(uploadFile, uploadFormData)
    }

    setUploading(false)
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Videos</h1>
        <p className="mt-2 text-gray-400">
          Upload and manage video content with custom cover images
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-500 mb-2">Debug Info</h3>
        <p className="text-xs text-gray-300">
          Files selected: {files.length} | 
          Browser: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown'} |
          File API supported: {typeof File !== 'undefined' ? 'Yes' : 'No'}
        </p>
        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-yellow-500 font-medium">File Details:</p>
            {files.map(uploadFile => (
              <p key={uploadFile.id} className="text-xs text-gray-400">
                {uploadFile.name || 'NO NAME'} - {uploadFile.size || 'NO SIZE'} bytes - {uploadFile.type || 'NO TYPE'} - Status: {uploadFile.status}
              </p>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* File Drop Zone */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Select Videos</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-yellow-400 bg-yellow-500/10' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-300 mb-2">
              {isDragActive
                ? 'Drop the videos here...'
                : 'Drag & drop videos here, or click to select files'
              }
            </p>
            <p className="text-sm text-gray-500">
              Supports MP4, MPEG, MOV, AVI, WebM (Max 500MB each)
            </p>
          </div>

          {/* Manual File Input Fallback */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or select files manually:
            </label>
            <input
              type="file"
              multiple
              accept=".mp4,.mpeg,.mpg,.mov,.avi,.webm,video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || [])
                console.log('Manual file selection:', selectedFiles)
                
                const validFiles = selectedFiles
                  .filter(file => {
                    if (!file || !file.name || file.name === '') {
                      console.error('File has no name:', file)
                      return false
                    }
                    if (!file.size || file.size === 0) {
                      console.error('File has no size:', file)
                      return false
                    }
                    if (file.size > 500 * 1024 * 1024) {
                      alert(`${file.name} is too large (max 500MB)`)
                      return false
                    }
                    return true
                  })
                  .map(file => {
                    console.log('Processing manual file:', {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      lastModified: file.lastModified
                    })
                    
                    return {
                      file: file,
                      id: Math.random().toString(36).substring(2),
                      progress: 0,
                      status: 'pending' as const,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      lastModified: file.lastModified
                    }
                  })
                
                if (validFiles.length > 0) {
                  setFiles(prev => [...prev, ...validFiles])
                }
                
                // Reset the input
                e.target.value = ''
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-4">
              {files.map(uploadFile => (
                <div key={uploadFile.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {uploadFile.name || 'Unknown file'}
                        {!uploadFile.name && <span className="text-red-400 ml-2">(Invalid file)</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        Size: {formatFileSize(uploadFile.size)}
                        {(!uploadFile.size || uploadFile.size === 0) && <span className="text-red-400 ml-2">(Invalid size)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        Type: {uploadFile.type || 'Unknown'}
                        {!uploadFile.type && <span className="text-red-400 ml-2">(Invalid type)</span>}
                      </p>
                      {uploadFile.lastModified && (
                        <p className="text-xs text-gray-500">
                          Modified: {new Date(uploadFile.lastModified).toLocaleString()}
                        </p>
                      )}
                      
                      {/* Cover Image Upload */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-300 mb-2">
                          Cover Image (Optional)
                        </label>
                        <div className="flex items-center space-x-3">
                          {uploadFile.previewUrl ? (
                            <div className="relative">
                              <img 
                                src={uploadFile.previewUrl} 
                                alt="Cover preview" 
                                className="w-16 h-12 object-cover rounded border border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles(prev => prev.map(f => 
                                    f.id === uploadFile.id 
                                      ? { ...f, coverImage: undefined, previewUrl: undefined }
                                      : f
                                  ))
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-12 bg-gray-700 border border-gray-600 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const previewUrl = URL.createObjectURL(file)
                                setFiles(prev => prev.map(f => 
                                  f.id === uploadFile.id 
                                    ? { ...f, coverImage: file, previewUrl }
                                    : f
                                ))
                              }
                            }}
                            className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          If no cover image is uploaded, a thumbnail will be generated from the video
                        </p>
                      </div>
                      
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}
                      {uploadFile.error && (
                        <p className="text-xs text-red-400 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                      {uploadFile.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-gray-500 hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Video Details</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full bg-gray-800 border-gray-600 text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                name="category"
                id="category"
                className="mt-1 block w-full bg-gray-800 border-gray-600 text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              >
                <option value="">Select category</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="news">News</option>
                <option value="technology">Technology</option>
                <option value="classic">Classic Movies</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 block w-full bg-gray-800 border-gray-600 text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="mt-1 block w-full bg-gray-800 border-gray-600 text-white rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                id="isPublic"
                defaultChecked
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-600 bg-gray-800 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-300">
                Make video public
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-600 bg-gray-800 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-300">
                <span className="font-medium text-yellow-400">Featured in Hero Section</span>
                <p className="text-xs text-gray-400 mt-1">
                  This video can appear as the main hero banner on the homepage
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={files.length === 0 || uploading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Videos
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}