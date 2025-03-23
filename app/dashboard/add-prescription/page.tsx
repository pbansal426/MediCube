"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Check } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Add Prescription page component
export default function AddPrescriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [medName, setMedName] = useState("")
  const [dosage, setDosage] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [trayLocation, setTrayLocation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Tray location options with visual representation
  const trayLocations = [
    { id: "top-left", name: "Top Left", position: "col-start-1 row-start-1" },
    { id: "top-right", name: "Top Right", position: "col-start-2 row-start-1" },
    { id: "middle-left", name: "Middle Left", position: "col-start-1 row-start-2" },
    { id: "middle-right", name: "Middle Right", position: "col-start-2 row-start-2" },
    { id: "bottom-left", name: "Bottom Left", position: "col-start-1 row-start-3" },
    { id: "bottom-right", name: "Bottom Right", position: "col-start-2 row-start-3" },
    { id: "center", name: "Center", position: "col-start-1 col-span-2 row-start-4" },
  ]

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("You must be logged in to add a prescription")
      return
    }

    // Validate form inputs
    if (!medName || !dosage || !scheduledDate || !scheduledTime || !trayLocation) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      // Combine date and time into a single timestamp
      const dateTimeString = `${scheduledDate}T${scheduledTime}`
      const scheduledDateTime = new Date(dateTimeString)

      // Check if date is valid
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error("Invalid date or time")
      }

      // Add prescription to Firestore
      await addDoc(collection(db, "users", user.uid, "prescriptions"), {
        medName,
        dosage,
        scheduledTime: Timestamp.fromDate(scheduledDateTime),
        trayLocation,
        taken: false,
        missed: false,
        createdAt: Timestamp.now(),
      })
      

      // Show success message
      setSuccess(true)

      // Reset form
      setMedName("")
      setDosage("")
      setScheduledDate("")
      setScheduledTime("")
      setTrayLocation("")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error: any) {
      console.error("Error adding prescription:", error)
      setError(error.message || "Failed to add prescription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Prescription Added Successfully!
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Your medication has been added to the system and will be dispensed at the scheduled time.
              </p>
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Add New Prescription</CardTitle>
            <CardDescription>Enter the details of the medication to add to the dispenser</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="medName">Medication Name</Label>
                <Input
                  id="medName"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g., Aspirin, Lisinopril"
                  required
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 1 pill, 10mg"
                  required
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tray Location</Label>
                <div className="grid grid-cols-2 grid-rows-4 gap-3 mt-2">
                  {trayLocations.map((location) => (
                    <motion.div
                      key={location.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all",
                        location.position,
                        trayLocation === location.name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600",
                      )}
                      onClick={() => setTrayLocation(location.name)}
                    >
                      {location.name}
                      {trayLocation === location.name && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full relative overflow-hidden group" onClick={handleSubmit} disabled={loading}>
              <span className="relative z-10">{loading ? "Adding..." : "Add Prescription"}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

