"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // or getFirebaseFirestore() if needed
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Edit, Trash2, Plus, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

// Firestore data shape
interface Prescription {
  id: string;
  medName: string;
  dosage: string;
  frequency: string;
  trayLocation?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
}

// Prescriptions Page
export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    setLoading(true);

    if (!db) {
      setError("Firebase is not initialized.");
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "prescriptions");
    const q = query(ref);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Prescription[] = [];
        snapshot.forEach((docSnap) => {
          const docData = docSnap.data() as Omit<Prescription, "id">;
          data.push({ id: docSnap.id, ...docData });
        });
        setPrescriptions(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load prescriptions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, mounted]);

  const handleDelete = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "prescriptions", id));
    } catch (err) {
      console.error("Error deleting prescription:", err);
      setError("Failed to delete prescription.");
    }
  };

  // Format timestamp
  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "N/A";
    return ts.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          Prescriptions
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage all of your current prescriptions.
        </p>
      </motion.div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Prescriptions</CardTitle>
            <CardDescription>Click “Add Prescription” to create one.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((rx, index) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{rx.medName}</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      {rx.frequency || "N/A"}
                    </Badge>
                  </div>
                  <CardDescription>{rx.dosage}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Start:</strong> {formatDate(rx.startDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>End:</strong> {formatDate(rx.endDate)}
                  </p>
                  {rx.trayLocation && (
                    <p className="text-sm text-gray-600">
                      <strong>Tray:</strong> {rx.trayLocation}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(rx.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
