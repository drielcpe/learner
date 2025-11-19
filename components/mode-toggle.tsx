"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ModeToggle() {


  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8"
    
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}