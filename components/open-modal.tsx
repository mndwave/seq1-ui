"use client"

import { useState, useEffect } from "react"
import { FolderOpen, Search } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface OpenModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock data for saved projects - expanded list to demonstrate search functionality
const savedProjects = [
  { id: 1, name: "techno_pattern_128", date: "2025-03-28" },
  { id: 2, name: "ambient_pad_sequence", date: "2025-03-27" },
  { id: 3, name: "drum_loop_140bpm", date: "2025-03-26" },
  { id: 4, name: "acid_bass_pattern", date: "2025-03-25" },
  { id: 5, name: "synth_sequence_01", date: "2025-03-24" },
  { id: 6, name: "house_beat_124bpm", date: "2025-03-23" },
  { id: 7, name: "breakbeat_jungle", date: "2025-03-22" },
  { id: 8, name: "deep_techno_bassline", date: "2025-03-21" },
  { id: 9, name: "melodic_progression", date: "2025-03-20" },
  { id: 10, name: "tr808_pattern_classic", date: "2025-03-19" },
  { id: 11, name: "detroit_techno_sequence", date: "2025-03-18" },
  { id: 12, name: "berlin_dub_techno", date: "2025-03-17" },
  { id: 13, name: "minimal_clicks_cuts", date: "2025-03-16" },
  { id: 14, name: "electro_sequence_132", date: "2025-03-15" },
  { id: 15, name: "modular_experiment_1", date: "2025-03-14" },
]

export default function OpenModal({ isOpen, onClose }: OpenModalProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProjects, setFilteredProjects] = useState(savedProjects)

  // Filter projects when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(savedProjects)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = savedProjects.filter((project) => project.name.toLowerCase().includes(query))
      setFilteredProjects(filtered)
    }
  }, [searchQuery])

  // Reset search and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setSelectedProject(null)
      setFilteredProjects(savedProjects)
    }
  }, [isOpen])

  const handleOpen = () => {
    if (selectedProject !== null) {
      // Open logic would go here
      const project = savedProjects.find((p) => p.id === selectedProject)
      console.log(`Opening project: ${project?.name}`)
      onClose()
    }
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="OPEN PROJECT"
      icon={<FolderOpen size={16} className="text-[#a09080]" />}
      width="w-[450px]"
    >
      <div className="space-y-4">
        {/* Project list with search */}
        <div className="space-y-1">
          <label className="text-xs text-[#a09080] tracking-wide">SAVED PROJECTS</label>

          {/* Search input */}
          <div className="relative mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#a09080]" />
          </div>

          {/* Project list */}
          <div className="max-h-60 overflow-y-auto bg-[#1a1015] border border-[#3a2a30] rounded-sm">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`px-3 py-2 border-b border-[#3a2a30] last:border-b-0 cursor-pointer ${
                    selectedProject === project.id ? "bg-[#3a2a30]" : "hover:bg-[#2a1a20]"
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#f0e6c8] tracking-wide">{project.name}</span>
                    <span className="text-xs text-[#a09080]">{project.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-[#a09080] text-sm">No projects match your search</div>
            )}
          </div>

          {/* Search results count */}
          <div className="text-[10px] text-[#a09080] mt-1">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            className={`channel-button ${selectedProject !== null ? "active" : ""} flex items-center px-3 py-1.5`}
            onClick={handleOpen}
            disabled={selectedProject === null}
          >
            <FolderOpen size={14} className="mr-1.5" />
            <span className="text-xs tracking-wide">OPEN</span>
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
