"use client"

import { useState } from "react"
import { Section } from "./data/section"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Props {
  sections: Section[]
}

export default function SectionsClient({ sections }: Props) {
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const grades = Array.from(new Set(sections.map(section => section.grade)))

  const filteredSections = sections.filter(section => {
    const matchesGrade = selectedGrade === "all" || section.grade === selectedGrade
    const matchesSearch = section.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGrade && matchesSearch
  })

  const handleSectionClick = (section: Section) => {
    router.push(`/attendance?grade=${encodeURIComponent(section.grade)}&section=${encodeURIComponent(section.section)}`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Sections</h1>
          <p className="text-muted-foreground mt-1">
            Manage attendance for different classes and sections
          </p>
        </div>
        
        <Button onClick={() => router.push('/sections/new')}>
          Add New Section
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections, grades, or teachers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map(grade => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
            onClick={() => handleSectionClick(section)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.grade}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="font-normal">
                      {section.section}
                    </Badge>
                    <span>• {section.teacher}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>Students enrolled:</span>
                <span className="font-semibold text-foreground">{section.studentCount}</span>
              </div>
              
              <Button className="w-full" size="sm">
                View Attendance
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium">No sections found</p>
              <p className="mt-1">
                {searchQuery || selectedGrade !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No sections have been created yet"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {filteredSections.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {filteredSections.length} of {sections.length} sections
              </span>
              <span className="text-muted-foreground">
                Total students: {filteredSections.reduce((sum, section) => sum + section.studentCount, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}