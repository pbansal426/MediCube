"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, AlertTriangle } from "lucide-react"

// Types for prescription data
interface Prescription {
  id: string
  medName: string
  dosage: string
  scheduledTime: Timestamp
  trayLocation: string
  taken: boolean
  missed: boolean
  createdAt: Timestamp
}

// Logs page component
export default function LogsPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch prescriptions from Firestore
  useEffect(() => {
    if (!user) return

    setLoading(true)

    // Create query for user's prescriptions ordered by scheduled time
    const prescriptionsRef = collection(db, "users", user.uid, "prescriptions")
    const q = query(prescriptionsRef, orderBy("scheduledTime", "desc"))

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

        setPrescriptions(prescriptionData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching prescriptions:", err)
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  // Format date for display
  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // Group prescriptions by date
  const groupByDate = (prescriptions: Prescription[]) => {
    const groups: Record<string, Prescription[]> = {}

    prescriptions.forEach((prescription) => {
      const date = prescription.scheduledTime.toDate().toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(prescription)
    })

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }))
  }

  // Filter prescriptions by status
  const takenPrescriptions = prescriptions.filter((p) => p.taken)
  const missedPrescriptions = prescriptions.filter((p) => p.missed)
  const allGrouped = groupByDate(prescriptions)
  const takenGrouped = groupByDate(takenPrescriptions)
  const missedGrouped = groupByDate(missedPrescriptions)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Medication Logs</h1>
        <p className="text-gray-500 dark:text-gray-400">View history of medication adherence</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="taken">Taken</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <LogsLoading />
          ) : allGrouped.length === 0 ? (
            <NoLogsMessage />
          ) : (
            <LogsList groups={allGrouped} formatDateTime={formatDateTime} />
          )}
        </TabsContent>

        <TabsContent value="taken">
          {loading ? (
            <LogsLoading />
          ) : takenGrouped.length === 0 ? (
            <NoLogsMessage message="No taken medications found." />
          ) : (
            <LogsList groups={takenGrouped} formatDateTime={formatDateTime} />
          )}
        </TabsContent>

        <TabsContent value="missed">
          {loading ? (
            <LogsLoading />
          ) : missedGrouped.length === 0 ? (
            <NoLogsMessage message="No missed medications found." />
          ) : (
            <LogsList groups={missedGrouped} formatDateTime={formatDateTime} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading component for logs
function LogsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between py-2">
                  <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// No logs message component
function NoLogsMessage({ message = "No medication logs found." }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Logs</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  )
}

// Logs list component
function LogsList({
  groups,
  formatDateTime,
}: {
  groups: { date: string; items: Prescription[] }[]
  formatDateTime: (timestamp: Timestamp) => string
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.date}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{group.date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.items.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between border-b py-2 last:border-0">
                  <div>
                    <div className="font-medium">{prescription.medName}</div>
                    <div className="text-sm text-gray-500">
                      {prescription.dosage} • {prescription.trayLocation}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-sm text-right">{formatDateTime(prescription.scheduledTime)}</div>
                    {prescription.taken ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" />
                        Taken
                      </Badge>
                    ) : prescription.missed ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Missed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Scheduled</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

