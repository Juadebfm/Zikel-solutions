"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function NeedHelpCard() {
  return (
    <Card className="bg-sidebar text-sidebar-foreground">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
        <p className="text-sm text-sidebar-foreground/80 mb-4">
          Access the latest documentation and support resources.
        </p>
        <Link href="/help">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            Knowledge Base
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
