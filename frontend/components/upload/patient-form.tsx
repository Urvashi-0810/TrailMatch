"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface PatientFormEntryProps {
  onSubmit: (formData: any) => void
}

const predefinedConditions = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Disease",
  "Kidney Disease",
  "Breast Cancer",
  "Lung Cancer",
  "Colon Cancer",
  "Prostate Cancer",
  "Depression",
  "Anxiety",
  "Arthritis",
  "Obesity",
  "Thyroid Disorder",
]

export function PatientFormEntry({ onSubmit }: PatientFormEntryProps) {
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [medicationInput, setMedicationInput] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState("")
  const [notes, setNotes] = useState("")

  const handleAddMedication = () => {
    if (medicationInput.trim()) {
      setMedications([...medications, medicationInput.trim()])
      setMedicationInput("")
    }
  }

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()])
      setAllergyInput("")
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const handleToggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
    } else {
      setSelectedConditions([...selectedConditions, condition])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!age || !gender || selectedConditions.length === 0) {
      alert("Please fill in required fields: Age, Gender, and at least one condition")
      return
    }

    const formData = {
      age: parseInt(age),
      gender,
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
      conditions: selectedConditions,
      medications,
      allergies,
      notes,
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="150"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Medical Conditions *</h3>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        <div className="grid gap-2 md:grid-cols-2">
          {predefinedConditions.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => handleToggleCondition(condition)}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                selectedConditions.includes(condition)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Current Medications</h3>
        <div className="flex gap-2">
          <Input
            value={medicationInput}
            onChange={(e) => setMedicationInput(e.target.value)}
            placeholder="Enter medication name..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddMedication()
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddMedication}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {medications.map((med, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {med}
              <button
                type="button"
                onClick={() => handleRemoveMedication(index)}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Known Allergies</h3>
        <div className="flex gap-2">
          <Input
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="Enter allergy..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddAllergy()
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddAllergy}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy, index) => (
            <Badge key={index} variant="destructive" className="gap-1 pr-1">
              {allergy}
              <button
                type="button"
                onClick={() => handleRemoveAllergy(index)}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional medical information or notes..."
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg">
        Analyze Patient Data
      </Button>
    </form>
  )
}
