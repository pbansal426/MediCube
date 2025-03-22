"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heart, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

// Firestore caretaker data shape
interface Caretaker {
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

export default function CaretakerPage() {
  const { user } = useAuth();
  const [caretaker, setCaretaker] = useState<Caretaker>({
    name: "",
    phone: "",
    email: "",
    relationship: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    if (!db) {
      setError("Firebase not initialized");
      setLoading(false);
      return;
    }

    const caretakerRef = doc(db, "users", user.uid, "settings", "caretaker");
    const unsubscribe = onSnapshot(
      caretakerRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          setCaretaker(snapshot.data() as Caretaker);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching caretaker:", err);
        setError("Failed to load caretaker info.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user || !db) return;
    setSavedMessage("");

    try {
      const caretakerRef = doc(db, "users", user.uid, "settings", "caretaker");
      await setDoc(caretakerRef, caretaker, { merge: true });
      setSavedMessage("Caretaker info saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save caretaker info.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-2"
      >
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Caretaker Info</h1>
      </motion.div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {savedMessage && (
        <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {savedMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Primary Caretaker</CardTitle>
          <CardDescription>Update caretaker's contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={caretaker.name}
              onChange={(e) => setCaretaker({ ...caretaker, name: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={caretaker.phone}
              onChange={(e) => setCaretaker({ ...caretaker, phone: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={caretaker.email}
              onChange={(e) => setCaretaker({ ...caretaker, email: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={caretaker.relationship}
              onChange={(e) => setCaretaker({ ...caretaker, relationship: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={handleSave} className="mt-2">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
