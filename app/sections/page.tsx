import SectionsClient from "./SectionsClient"
import { sectionsData } from "./data/section"

export default function SectionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Class Sections</h1>
      <SectionsClient sections={sectionsData} />
    </div>
  )
}