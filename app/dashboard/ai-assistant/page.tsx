"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send, Loader2, Brain, Pill, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// OpenAI API integration
const getAIResponse = async (symptoms: string) => {
  try {
    const response = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", data); // Log the response for debugging
    return data;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw new Error("Failed to fetch response from AI");
  }
};

// Common symptom suggestions
const symptomSuggestions = [
  "I have a headache and feel tired",
  "I'm experiencing cold symptoms with a runny nose",
  "I have seasonal allergies with itchy eyes",
  "I have muscle pain after exercise",
  "I'm having trouble sleeping",
];

// AI Assistant page component
export default function AIAssistantPage() {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState<{
    response: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("medications");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError("Please enter your symptoms");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get AI response (replace mock with actual API request)
      const aiResponse = await getAIResponse(symptoms);
      setResponse(aiResponse);
      setActiveTab("medications");
    } catch (error) {
      console.error("Error getting AI response:", error);
      setError("Failed to get medication suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a suggestion to the textarea
  const addSuggestion = (suggestion: string) => {
    setSymptoms(suggestion);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">AI Medication Assistant</h1>
        <p className="text-gray-500 dark:text-gray-400">Get medication suggestions based on your symptoms</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Describe Your Symptoms
              </CardTitle>
              <CardDescription>Enter your symptoms in detail to get medication suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Textarea
                  placeholder="Describe your symptoms here... (e.g., I have a headache and slight fever)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[150px] transition-all focus:ring-2 focus:ring-primary/50"
                />
              </form>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Common symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {symptomSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                      onClick={() => addSuggestion(suggestion)}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={loading || !symptoms.trim()}
                className="w-full relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing symptoms...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Get Suggestions
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Pill className="mr-2 h-5 w-5 text-primary" />
                Medication Suggestions
              </CardTitle>
              <CardDescription>
                {response ? "Based on your symptoms" : "Enter your symptoms to get suggestions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                    <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Analyzing your symptoms...</p>
                </div>
              ) : response ? (
                <div className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="medications" className="flex-1">
                        <Pill className="mr-2 h-4 w-4" />
                        Medications
                      </TabsTrigger>
                      <TabsTrigger value="dosage" className="flex-1">
                        <Info className="mr-2 h-4 w-4" />
                        Dosage
                      </TabsTrigger>
                      <TabsTrigger value="sideEffects" className="flex-1">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Side Effects
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="sync">
                      {/* Rendering medications if available */}
                      {activeTab === "medications" && response.response && (
                        <TabsContent value="medications" className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h3 className="font-medium text-primary mb-2">Suggested Medications</h3>
                            <p className="whitespace-pre-line">{response.response}</p>
                          </motion.div>
                        </TabsContent>
                      )}
                    </AnimatePresence>
                  </Tabs>

                  <Alert className="mt-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is for informational purposes only. Always consult with a healthcare professional before
                      taking any medication.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <Brain className="h-16 w-16 text-gray-300 mb-4" />
                  <p>Enter your symptoms to receive medication suggestions</p>
                  <p className="text-sm mt-2">
                    Our AI assistant will analyze your symptoms and provide recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}