"use client"

import type React from "react"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { updateEmail, updatePassword } from "firebase/auth"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle } from "lucide-react"

// Settings page component
export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      setError("You must be logged in to update your profile")
      return
    }

    setLoading(true)

    try {
      // Update user document in Firestore
      if (name) {
        await updateDoc(doc(db, "users", user.uid), {
          name,
        })
      }

      // Update email if changed
      if (email && email !== user.email) {
        await updateEmail(user, email)
      }

      setSuccess("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      setError("You must be logged in to change your password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Update password
      await updatePassword(user, newPassword)

      setSuccess("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      setError(error.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  // Handle notification settings update
  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      setError("You must be logged in to update notification settings")
      return
    }

    if (smsNotifications && !phoneNumber) {
      setError("Please enter a phone number for SMS notifications")
      return
    }

    setLoading(true)

    try {
      // Update notification settings in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        smsNotifications,
        phoneNumber: smsNotifications ? phoneNumber : "",
      })

      setSuccess("Notification settings updated successfully")
    } catch (error: any) {
      console.error("Error updating notification settings:", error)
      setError(error.message || "Failed to update notification settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and notification preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </CardFooter>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handlePasswordChange}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you want to receive alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleNotificationUpdate} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive text messages when medications are missed
                  </p>
                </div>
                <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>

              {smsNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleNotificationUpdate}
              disabled={loading || (smsNotifications && !phoneNumber)}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

