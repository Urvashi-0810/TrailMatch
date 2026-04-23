"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Image, X, Camera, ArrowRight, File } from "lucide-react"

interface UploadZoneProps {
  onFilesUploaded: (files: File[]) => void
}

const supportedFormats = [
  { name: "PDF", icon: <FileText className="h-4 w-4" /> },
  { name: "Images", icon: <Image className="h-4 w-4" /> },
  { name: "Lab Reports", icon: <File className="h-4 w-4" /> },
]

export function UploadZone({ onFilesUploaded }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = () => {
    if (files.length > 0) {
      onFilesUploaded(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Upload Medical Records</h1>
        <p className="text-muted-foreground">
          Upload your medical documents to receive AI-powered trial matching and treatment insights
        </p>
      </div>

      {/* Supported Formats */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Supported formats:</span>
        {supportedFormats.map((format) => (
          <Badge key={format.name} variant="secondary" className="gap-1">
            {format.icon}
            {format.name}
          </Badge>
        ))}
      </div>

      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer border-2 border-dashed transition-all ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-card/50"
        }`}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {isDragActive ? "Drop files here" : "Drag & drop your files"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            or click to browse your computer
          </p>
          <Button variant="outline" type="button">
            Select Files
          </Button>
        </CardContent>
      </Card>

      {/* Smart Scan Option */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Smart Document Scanner</h4>
              <p className="text-sm text-muted-foreground">
                Capture medical documents directly with your camera
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Camera className="h-4 w-4" />
            Open Scanner
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files ({files.length})</CardTitle>
            <CardDescription>Review your files before analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {file.type.startsWith("image/") ? (
                      <Image className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button onClick={handleAnalyze} className="mt-4 w-full gap-2" size="lg">
              Start AI Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
