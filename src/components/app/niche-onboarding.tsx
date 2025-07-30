"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Video, 
  GraduationCap, 
  Briefcase, 
  Users, 
  ArrowRight,
  Check,
  Plus,
  X,
  FileText,
  Upload,
  UserPlus,
  Zap,
  Target,
  TrendingUp,
  HeartHandshake,
  Lightbulb,
  Mic,
  Camera
} from "lucide-react"

interface NicheOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  examples: string[]
  defaultStages: string[]
}

interface OnboardingProps {
  onComplete: (data: {
    niche: string
    stages: string[]
    importMethod?: string
    teamMembers?: string[]
  }) => void
}

const NICHE_OPTIONS: NicheOption[] = [
  {
    id: "creator",
    title: "Content Creator",
    description: "Build your audience and monetize your creative content",
    icon: <Video className="w-8 h-8" />,
    color: "from-purple-500 to-pink-500",
    examples: ["YouTube channels", "TikTok growth", "Brand partnerships", "Course sales"],
    defaultStages: ["Outreach / Pitched", "Awaiting Response", "In Conversation", "Negotiation", "Contract Signed", "Content in Progress", "Delivered", "Paid", "Archived / Lost"]
  },
  {
    id: "coach",
    title: "Coach",
    description: "Transform lives through personalized coaching and programs",
    icon: <GraduationCap className="w-8 h-8" />,
    color: "from-emerald-500 to-teal-500",
    examples: ["1:1 coaching", "Group programs", "Masterminds", "Speaking engagements"],
    defaultStages: ["New Lead", "Discovery Call Scheduled", "Discovery Call Completed", "Proposal Sent", "Follow-Up", "Negotiation", "Signed Client", "Paid", "Active Program", "Completed", "Archived / Lost"]
  },
  {
    id: "podcaster",
    title: "Podcaster",
    description: "Grow your podcast audience and create multiple revenue streams",
    icon: <Mic className="w-8 h-8" />,
    color: "from-orange-500 to-red-500",
    examples: ["Sponsorship deals", "Premium content", "Live events", "Merchandise"],
            defaultStages: ["Guest Outreach", "Awaiting Response", "In Conversation", "Negotiation", "Agreement in Place", "Scheduled", "Recorded", "Published", "Paid", "Archived / Lost"]
  },
  {
    id: "freelancer",
    title: "Freelancer",
    description: "Scale your freelance business and attract premium clients",
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-blue-500 to-indigo-500",
    examples: ["Client acquisition", "Project management", "Retainer clients", "Agency growth"],
    defaultStages: ["New Inquiry", "Discovery Call", "Proposal Sent", "Follow-Up", "In Negotiation", "Contract Signed", "Project In Progress", "Delivered", "Paid", "Archived / Lost"]
  }
]

const IMPORT_OPTIONS = [
  {
    id: "csv",
    title: "CSV Upload",
    description: "Import your existing contacts from a spreadsheet",
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: "manual",
    title: "Manual Entry",
    description: "Add contacts one by one as you go",
    icon: <Plus className="w-6 h-6" />
  },
  {
    id: "integration",
    title: "Connect Apps",
    description: "Sync with your existing tools and platforms",
    icon: <Zap className="w-6 h-6" />
  }
]

export default function NicheOnboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNiche, setSelectedNiche] = useState<string>("")
  const [customStages, setCustomStages] = useState<string[]>([])
  const [selectedImportMethod, setSelectedImportMethod] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const totalSteps = 5

  const selectedNicheData = NICHE_OPTIONS.find(niche => niche.id === selectedNiche)

  React.useEffect(() => {
    if (selectedNicheData && customStages.length === 0) {
      setCustomStages([...selectedNicheData.defaultStages])
    }
  }, [selectedNiche, selectedNicheData, customStages.length])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        niche: selectedNiche,
        stages: customStages,
        importMethod: selectedImportMethod,
        teamMembers
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete({
      niche: selectedNiche,
      stages: customStages,
      importMethod: selectedImportMethod || "manual",
      teamMembers
    })
  }

  const addStage = () => {
    setCustomStages([...customStages, `New Stage ${customStages.length + 1}`])
  }

  const removeStage = (index: number) => {
    setCustomStages(customStages.filter((_, i) => i !== index))
  }

  const updateStage = (index: number, value: string) => {
    const updatedStages = [...customStages]
    updatedStages[index] = value
    setCustomStages(updatedStages)
  }

  const addTeamMember = () => {
    if (newMemberEmail && !teamMembers.includes(newMemberEmail)) {
      setTeamMembers([...teamMembers, newMemberEmail])
      setNewMemberEmail("")
    }
  }

  const removeTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(member => member !== email))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return selectedNiche !== ""
      case 3:
        return customStages.length > 0
      case 4:
        return selectedImportMethod !== ""
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-full bg-border rounded-full h-1 mb-0">
            <motion.div
              className="bg-primary h-1 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-3 md:p-4 lg:p-6">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mb-4 md:mb-6 lg:mb-8">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-primary to-accent rounded-full mb-3 md:mb-4 lg:mb-6">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
                    Welcome to Your Business Growth Platform
                  </h1>
                  <p className="text-sm md:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Let's set up your personalized pipeline to track leads, manage relationships, 
                    and grow your business. This will only take a few minutes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8 lg:mt-12">
                  <Card className="bg-card border-border">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center">
                      <Target className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary mx-auto mb-2 md:mb-3 lg:mb-4" />
                      <h3 className="text-sm md:text-base lg:text-lg font-semibold mb-1 md:mb-2">Targeted Setup</h3>
                      <p className="text-xs md:text-xs lg:text-sm text-muted-foreground">
                        Customize your pipeline based on your specific business type
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center">
                      <TrendingUp className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary mx-auto mb-2 md:mb-3 lg:mb-4" />
                      <h3 className="text-sm md:text-base lg:text-lg font-semibold mb-1 md:mb-2">Growth Focused</h3>
                      <p className="text-xs md:text-xs lg:text-sm text-muted-foreground">
                        Track every interaction from first contact to conversion
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-3 md:p-4 lg:p-6 text-center">
                      <HeartHandshake className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary mx-auto mb-2 md:mb-3 lg:mb-4" />
                      <h3 className="text-sm md:text-base lg:text-lg font-semibold mb-1 md:mb-2">Relationship Building</h3>
                      <p className="text-xs md:text-xs lg:text-sm text-muted-foreground">
                        Nurture connections and build lasting business relationships
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Step 2: Niche Selection */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6 md:mb-8 lg:mb-12">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4">
                    What best describes your business?
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
                    Choose your business type to get a customized pipeline
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                  {NICHE_OPTIONS.map((niche) => (
                    <motion.div
                      key={niche.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedNiche === niche.id
                            ? "ring-2 ring-primary bg-secondary"
                            : "hover:shadow-lg border-border bg-card"
                        }`}
                        onClick={() => setSelectedNiche(niche.id)}
                      >
                        <CardContent className="p-3 md:p-6 lg:p-8">
                          <div className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 md:space-x-4">
                            <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-r ${niche.color} text-white w-fit`}>
                              {niche.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1 md:mb-2">
                                {niche.title}
                              </h3>
                              <p className="text-xs md:text-sm lg:text-base text-muted-foreground mb-3 md:mb-4">
                                {niche.description}
                              </p>
                              <div className="space-y-1 md:space-y-2">
                                <p className="text-xs md:text-sm font-medium text-foreground">
                                  Perfect for:
                                </p>
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  {niche.examples.map((example, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs md:text-sm px-2 py-1">
                                      {example}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {selectedNiche === niche.id && (
                              <Check className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Pipeline Customization */}
            {currentStep === 3 && selectedNicheData && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Customize Your Pipeline Stages
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    We've pre-configured stages for {selectedNicheData.title.toLowerCase()}s. 
                    Feel free to modify them to match your process.
                  </p>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <span>Your Pipeline Stages</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customStages.map((stage, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <Input
                            value={stage}
                            onChange={(e) => updateStage(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStage(index)}
                            disabled={customStages.length <= 3}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={addStage}
                      className="w-full mt-6"
                      disabled={customStages.length >= 15}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stage
                    </Button>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Tip:</strong> Keep 5-10 stages for optimal tracking. 
                        You can always add or modify stages later in your dashboard.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Import Options */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    How would you like to add your contacts?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Choose the method that works best for you
                  </p>
                </div>

                <div className="grid gap-6">
                  {IMPORT_OPTIONS.map((option) => (
                    <motion.div
                      key={option.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedImportMethod === option.id
                            ? "ring-2 ring-primary bg-secondary"
                            : "hover:shadow-lg border-border bg-card"
                        }`}
                        onClick={() => setSelectedImportMethod(option.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground mb-1">
                                {option.title}
                              </h3>
                              <p className="text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {selectedImportMethod === option.id ? (
                                <Check className="w-6 h-6 text-primary" />
                              ) : (
                                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {selectedImportMethod && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                  >
                    <Card className="bg-secondary border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Upload className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold text-foreground">
                            {selectedImportMethod === "csv" && "CSV Import Ready"}
                            {selectedImportMethod === "manual" && "Manual Entry Mode"}
                            {selectedImportMethod === "integration" && "Integration Setup"}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedImportMethod === "csv" && "After setup, you'll be able to upload your CSV file with contact information."}
                          {selectedImportMethod === "manual" && "You can start adding contacts manually right after completing the setup."}
                          {selectedImportMethod === "integration" && "We'll help you connect your existing tools and sync your contacts automatically."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 5: Team Setup */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Invite Your Team
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Collaborate with team members to manage your pipeline together (optional)
                  </p>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Team Members</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <Input
                          placeholder="Enter email address"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTeamMember()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={addTeamMember}
                          disabled={!newMemberEmail}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>

                      {teamMembers.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Invited Members:</Label>
                          {teamMembers.map((email, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <span className="text-sm">{email}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeamMember(email)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {teamMembers.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            No team members invited yet. You can always invite them later from your workspace.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              {currentStep < totalSteps && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground w-full sm:w-auto"
                >
                  Skip for now
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 min-w-[120px] w-full sm:w-auto"
              >
                <span>{currentStep === totalSteps ? "Complete Setup" : "Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}