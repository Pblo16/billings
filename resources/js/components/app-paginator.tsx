import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

export default function AppPaginator({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}) {
  return (
    <footer className="p-2 border-t text-muted-foreground text-sm">
      <Button
        variant="outline"
        className="ml-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="mr-2 w-4 h-4" />
      </Button>
      Page {currentPage} of {lastPage}
      <Button
        variant="outline"
        className="ml-2"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
      >
        <ChevronRight className="mr-2 w-4 h-4" />
      </Button>
    </footer>
  )
}
