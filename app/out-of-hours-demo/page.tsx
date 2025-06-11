"use client"

import { useState } from "react"
import OutOfHoursModal from "@/components/out-of-hours-modal"
import { Button } from "@/components/ui/button"

export default function OutOfHoursDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [remainingHours, setRemainingHours] = useState(0)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleAccountUpdate = (newHours: number) => {
    setRemainingHours(newHours)
    // If hours were added, we can close the modal
    if (newHours > 0) {
      setIsModalOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Out of Hours Demo</h1>

      <div className="mb-4">
        <p>Current remaining hours: {remainingHours}</p>
      </div>

      <Button onClick={handleOpenModal}>Simulate Out of Hours</Button>

      <OutOfHoursModal isOpen={isModalOpen} onClose={handleCloseModal} remainingHours={remainingHours} />
    </div>
  )
}
