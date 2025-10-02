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
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-0 sm:px-3 w-8 sm:w-auto h-8 sm:h-9"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
      </Button>
      <span className="text-xs sm:text-sm whitespace-nowrap">
        Page {currentPage} of {lastPage}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-0 sm:px-3 w-8 sm:w-auto h-8 sm:h-9"
      >
        <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
