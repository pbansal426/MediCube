"use client"

import { useEffect, useState } from "react"
import { collection, query, onSnapshot, doc, updateDoc, Timestamp, getDoc, addDoc } from "firebase/firestore"
import { getFirebaseFirestore } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, AlertTriangle, Bell, Pill, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/firebase"



// Types for prescription data
interface Prescription {
  id: string
  medName: string
  dosage: string
  scheduledTime: Timestamp
  trayLocation: string
  taken: boolean
  missed: boolean
}


// Dashboard page component
export default function Dashboard() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    upcoming: 0,
    unique: 0,
  })

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch prescriptions from Firestore
  useEffect(() => {
    if (!mounted || !user) return

    setLoading(true)

    if (!db) {
      setError("Firebase is not initialized")
      setLoading(false)
      return
    }

    // Create query for user's prescriptions
    const prescriptionsRef = collection(db, "users", user.uid, "prescriptions")
    const q = query(prescriptionsRef)

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prescriptionData: Prescription[] = []
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<Prescription, "id">
          prescriptionData.push({
            id: doc.id,
            ...data,
          })
        })

        // Sort prescriptions by scheduled time
        prescriptionData.sort((a, b) => a.scheduledTime.toMillis() - b.scheduledTime.toMillis())

        // Calculate stats
        let uniqueMedications = new Set();

        prescriptionData.forEach((p) => {
          uniqueMedications.add(p.id);  // Or p.name if you prefer to count by name
        });

        const taken = prescriptionData.filter((p) => p.taken).length
        const missed = prescriptionData.filter((p) => p.missed).length
        const upcoming = prescriptionData.filter((p) => !p.taken && !p.missed).length

        // Manually decrease unique count for medications that have been marked as taken
        prescriptionData.forEach((p) => {
          if (p.taken) {
            uniqueMedications.delete(p.id);  // Remove from unique set if it's taken
          }
        });

        console.log(prescriptionData);
        console.log('Unique Medications Count:', uniqueMedications.size);


        setStats({
          total: prescriptionData.length,
          taken,
          missed,
          upcoming,
          unique: uniqueMedications.size,
        })

        setPrescriptions(prescriptionData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching prescriptions:", err)
        setError("Failed to load prescriptions. Please try again.")
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user, mounted])


  // Mark prescription as taken manually and create a new copy scheduled 1 day later
  const markAsTaken = async (id: string) => {
    if (!user) return

    try {
      const prescriptionRef = doc(db, "users", user.uid, "prescriptions", id)
      const prescriptionSnapshot = await getDoc(prescriptionRef)

      if (!prescriptionSnapshot.exists()) {
        throw new Error("Prescription not found")
      }

      const prescriptionData = prescriptionSnapshot.data() as Prescription

      // Update the current prescription to mark as taken
      await updateDoc(prescriptionRef, {
        taken: true,
        missed: false,
      })

      // Create a new prescription for the next day at the same time
      const newPrescription = {
        ...prescriptionData,
        scheduledTime: Timestamp.fromDate(new Date(prescriptionData.scheduledTime.toDate().getTime() + 24 * 60 * 60 * 1000)), // 24 hours later
        taken: false, // The new prescription is not taken
        missed: false, // The new prescription is not missed
      }

      const prescriptionsRef = collection(db, "users", user.uid, "prescriptions")
      await addDoc(prescriptionsRef, newPrescription)

      console.log("Prescription marked as taken and new prescription scheduled for tomorrow.")
    } catch (error) {
      console.error("Error updating prescription:", error)
      setError("Failed to update prescription status.")
    }
  }

  // Get prescription status
  const getPrescriptionStatus = (prescription: Prescription) => {
    const now = new Date()
    const scheduledTime = prescription.scheduledTime.toDate()

    // Compare both the date and time
    const sameDay =
      now.getFullYear() === scheduledTime.getFullYear() &&
      now.getMonth() === scheduledTime.getMonth() &&
      now.getDate() === scheduledTime.getDate()

    const scheduledHours = scheduledTime.getHours()
    const scheduledMinutes = scheduledTime.getMinutes()

    // Get the current time (hour, minute)
    const nowHours = now.getHours()
    const nowMinutes = now.getMinutes()

    // If the prescription is scheduled for today but has not passed
    if (sameDay) {
      const scheduledToday = new Date(now)
      scheduledToday.setHours(scheduledHours, scheduledMinutes, 0, 0)

      const thirtyMinutesLater = new Date(scheduledToday.getTime() + 30 * 60000)

      if (now < scheduledToday) {
        // Prescription is upcoming
        return { status: "upcoming", label: "Upcoming", icon: Clock, color: "bg-blue-100 text-blue-800" }
      } else if (now >= scheduledToday && now <= thirtyMinutesLater && !prescription.taken) {
        // Prescription is due but not taken yet (within the 30-minute window)
        return { status: "due", label: "Due Now", icon: Bell, color: "bg-yellow-100 text-yellow-800" }
      } else if (now > thirtyMinutesLater && !prescription.taken) {
        // Prescription missed (more than 30 minutes late)



        return { status: "missed", label: "Missed", icon: AlertTriangle, color: "bg-red-100 text-red-800" }
      } else if (prescription.taken) {
        // Prescription taken on time
        return { status: "taken", label: "Taken", icon: Check, color: "bg-green-100 text-green-800" }
      }
    }

    // If the prescription is scheduled for a future day, don't allow marking as taken
    if (now < scheduledTime) {
      return { status: "upcoming", label: "Upcoming", icon: Clock, color: "bg-blue-100 text-blue-800" }
    }

    // If the prescription is for a past day (should never happen unless there's an issue)
    return { status: "missed", label: "Missed", icon: AlertTriangle, color: "bg-red-100 text-red-800" }
  }



  // Format date for display
  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date)
  }


  // Calculate time remaining
  const getTimeRemaining = (timestamp: Timestamp) => {
    const now = new Date()
    const scheduledTime = timestamp.toDate()

    // Check if the scheduled time is for today
    const sameDay =
      now.getFullYear() === scheduledTime.getFullYear() &&
      now.getMonth() === scheduledTime.getMonth() &&
      now.getDate() === scheduledTime.getDate()

    if (sameDay) {
      const scheduledToday = new Date(now)
      scheduledToday.setHours(scheduledTime.getHours(), scheduledTime.getMinutes(), 0, 0)

      if (scheduledToday < now) {
        return "Past due"
      }

      const diffMs = scheduledToday.getTime() - now.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (diffHrs > 0) {
        return `${diffHrs}h ${diffMins}m`
      }

      return `${diffMins}m`
    }

    return "Scheduled for tomorrow"
  }
  // Get today's date in a readable format
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Function to check and update missed status
  const checkPrescriptionStatus = () => {
    const now = new Date();

    setPrescriptions((prevPrescriptions) =>
      prevPrescriptions.map((prescription) => {
        const scheduledTime = prescription.scheduledTime.toDate();
        const thirtyMinutesLater = new Date(scheduledTime.getTime() + 30 * 60000);

        // Check if the prescription is missed (more than 30 minutes late)
        if (now > thirtyMinutesLater && !prescription.taken && !prescription.missed) {
          // Only update if not already missed
          return { ...prescription, missed: true };
        }
        return prescription;
      })
    );
  };

  // UseEffect to run once when the component mounts
  useEffect(() => {
    // Call the function initially
    checkPrescriptionStatus();

    // Optional: Set an interval to check periodically (e.g., every 30 minutes)
    const intervalId = setInterval(checkPrescriptionStatus, 30 * 60 * 1000); // Every 30 minutes

    return () => {
      // Clean up the interval when the component is unmounted
      clearInterval(intervalId);
    };
  }, []);
  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">{getTodayDate()} • Manage medications and monitor adherence</p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 mb-6 md:grid-cols-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-none shadow-md">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-500/10 p-3 mr-4">
              <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Medications</p>
              <h3 className="text-2xl font-bold">{stats.unique}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-none shadow-md">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-500/10 p-3 mr-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Taken</p>
              <h3 className="text-2xl font-bold">{stats.taken}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-none shadow-md">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-red-500/10 p-3 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Missed</p>
              <h3 className="text-2xl font-bold">{stats.missed}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-none shadow-md">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-purple-500/10 p-3 mr-4">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Upcoming</p>
              <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prescriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Medications</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Prescriptions</CardTitle>
                  <CardDescription>You haven't added any prescriptions yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <a href="/dashboard/add-prescription">Add Prescription</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prescriptions.map((prescription, index) => {
                  const { status, label, icon: StatusIcon, color } = getPrescriptionStatus(prescription)

                  return (
                    <motion.div
                      key={prescription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{prescription.medName}</CardTitle>
                            <Badge variant="outline" className={color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {label}
                            </Badge>
                          </div>
                          <CardDescription>
                            {prescription.dosage} • {prescription.trayLocation}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Scheduled:</span>
                              <span className="font-medium">{formatTime(prescription.scheduledTime)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Time remaining:</span>
                              <span className="font-medium">{getTimeRemaining(prescription.scheduledTime)}</span>
                            </div>

                            {!prescription.taken && status !== "upcoming" && (
                              <Button
                                variant="outline"
                                className="w-full mt-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                                onClick={() => markAsTaken(prescription.id)}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Taken
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Other tab contents would go here */}
        </Tabs>
      </motion.div>
    </div>
  )
}

