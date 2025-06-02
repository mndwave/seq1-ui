"use client"
import { useState, useRef, useCallback } from "react"
import { Share, Upload, Image, X, Wand2, Info } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface ShareTrackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShareTrackModal({ isOpen, onClose }: ShareTrackModalProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [trackTitle, setTrackTitle] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [useNostrProfile, setUseNostrProfile] = useState(true)
  
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Handle drag and drop for audio files
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      setAudioFile(audioFile)
      // Generate title from filename if empty
      if (!trackTitle) {
        const name = audioFile.name.replace(/\.[^/.]+$/, "").toUpperCase()
        setTrackTitle(name)
      }
    }
  }, [trackTitle])

  // Handle audio file selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      if (!trackTitle) {
        const name = file.name.replace(/\.[^/.]+$/, "").toUpperCase()
        setTrackTitle(name)
      }
    }
  }

  // Handle cover image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      setUseNostrProfile(false)
    }
  }

  // Generate track title
  const generateTrackTitle = () => {
    // This would use the same name generator as save modal
    const adjectives = ["DIGITAL", "ETHEREAL", "NOCTURNAL", "ELECTRIC", "QUANTUM", "STELLAR"]
    const nouns = ["FREQUENCIES", "SEQUENCES", "HARMONICS", "WAVELENGTHS", "RESONANCE", "SYNTHESIS"]
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    setTrackTitle(`${randomAdj} ${randomNoun}`)
  }

  // Handle share submission
  const handleShare = async () => {
    if (!audioFile || !trackTitle.trim()) return

    setIsProcessing(true)
    
    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('title', trackTitle)
      formData.append('useNostrProfile', useNostrProfile.toString())
      
      if (coverImage) {
        formData.append('coverImage', coverImage)
      }

      // Upload and process
      const response = await fetch('/api/share-track', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Track shared successfully:', result)
        onClose()
        // Reset form
        setAudioFile(null)
        setCoverImage(null)
        setTrackTitle("")
        setUseNostrProfile(true)
      } else {
        console.error('Failed to share track')
      }
    } catch (error) {
      console.error('Error sharing track:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="SHARE TRACK"
      icon={<Share size={16} className="text-[#a09080]" />}
    >
      <div className="space-y-4">
        {/* Audio Upload Area */}
        <div
          className={`border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
            isDragOver
              ? "border-[#4287f5] bg-[#4287f5]/10"
              : "border-[#3a2a30] hover:border-[#4a3a40]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {audioFile ? (
            <div className="space-y-2">
              <div className="text-[#50dc64] text-sm">✓ Audio file selected</div>
              <div className="text-xs text-[#a09080]">{audioFile.name}</div>
              <button
                onClick={() => setAudioFile(null)}
                className="text-xs text-[#a09080] hover:text-[#f0e6c8] underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto text-[#a09080]" />
              <div className="text-sm text-[#f0e6c8]">Drop audio file here</div>
              <div className="text-xs text-[#a09080]">or click to browse</div>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="vintage-button px-3 py-1 text-xs"
              >
                BROWSE FILES
              </button>
            </div>
          )}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioSelect}
            className="hidden"
          />
        </div>

        {/* Track Title */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-[#a09080] tracking-wide">TITLE</label>
            <button
              onClick={generateTrackTitle}
              className="vintage-button px-2 py-1 flex items-center rounded-sm"
              title="Generate title"
            >
              <Wand2 size={12} className="mr-1" />
              <span className="text-xs tracking-wide">GENERATE</span>
            </button>
          </div>
          <input
            type="text"
            value={trackTitle}
            onChange={(e) => setTrackTitle(e.target.value.toUpperCase())}
            placeholder="TRACK TITLE"
            className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
          />
        </div>

        {/* Cover Art Selection */}
        <div className="space-y-2">
          <label className="text-xs text-[#a09080] tracking-wide">COVER</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="nostr-profile"
                name="coverArt"
                checked={useNostrProfile && !coverImage}
                onChange={() => {
                  setUseNostrProfile(true)
                  setCoverImage(null)
                }}
                className="w-3 h-3"
              />
              <label htmlFor="nostr-profile" className="text-xs text-[#f0e6c8]">
                Profile picture
              </label>
            </div>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="vintage-button px-3 py-1 flex items-center text-xs"
            >
              <Image size={12} className="mr-1" />
              {coverImage ? "CHANGE" : "SELECT"}
            </button>
          </div>
          {coverImage && (
            <div className="text-xs text-[#50dc64]">✓ Custom: {coverImage.name}</div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Information Panel */}
        <div className="p-3 bg-[#1a1015] border border-[#3a2a30] rounded-sm">
          <div className="text-xs text-[#a09080] leading-relaxed space-y-2">
            <p>
              Share tracks across Nostr. Engagement refines the system.
            </p>
            <p>
              Use <span className="text-[#f0e6c8] font-medium">#SEQ1</span> anywhere with the correct title — we track it.
            </p>
          </div>
        </div>

        {/* Video Processing Info */}
        <div className="p-2 bg-[#1a1015] border border-[#3a2a30] rounded-sm">
          <div className="flex items-start gap-2">
            <Info size={12} className="text-[#a09080] mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-[#a09080] leading-relaxed">
              <p>Creates 1:1 video with waveform, effects, and branding.</p>
              <p>Served from media.seq1.net for decentralized sharing.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button 
            className="channel-button flex items-center px-3 py-1.5" 
            onClick={onClose}
            disabled={isProcessing}
          >
            <span className="text-xs tracking-wide">CANCEL</span>
          </button>

          <button 
            className={`channel-button flex items-center px-3 py-1.5 ${
              audioFile && trackTitle.trim() && !isProcessing ? "active" : "opacity-50"
            }`}
            onClick={handleShare}
            disabled={!audioFile || !trackTitle.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin mr-1.5">
                  <Share size={14} />
                </div>
                <span className="text-xs tracking-wide">PROCESSING...</span>
              </>
            ) : (
              <>
                <Share size={14} className="mr-1.5" />
                <span className="text-xs tracking-wide">SHARE TRACK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DraggableModal>
  )
} 