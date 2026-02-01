'use client'

import { useState, useRef } from 'react'
import { generateMonthlyReport } from '@/app/actions/analysis'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface MonthlyReportProps {
    monthId: string
    initialReport?: string | null
}

export function MonthlyReport({ monthId, initialReport }: MonthlyReportProps) {
    const [report, setReport] = useState<string | null>(initialReport || null)
    const [isLoading, setIsLoading] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    const handleGenerate = async () => {
        setIsLoading(true)
        const result = await generateMonthlyReport(monthId)

        if (result.error) {
            alert(result.error)
        } else if (result.report) {
            setReport(result.report)
        }
        setIsLoading(false)
    }

    const handleDownload = async () => {
        if (!reportRef.current) return

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher resolution
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`monthly-report-${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('PDF Generation Error:', error)
            alert('Failed to generate PDF')
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                    Monthly Insights
                </h3>

                {!report && (
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            'Analyzing...'
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                Generate Report
                            </>
                        )}
                    </button>
                )}
            </div>

            {isLoading && !report && (
                <div className="animate-pulse space-y-3 py-4">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            )}

            {report && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div ref={reportRef} className="prose prose-sm prose-indigo dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <ReactMarkdown>{report}</ReactMarkdown>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            onClick={handleDownload}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download PDF
                        </button>
                        <button
                            onClick={handleGenerate}
                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                            Regenerate
                        </button>
                    </div>
                </div>
            )}

            {!report && !isLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get an AI-powered breakdown of your spending habits, recurring expenses, and financial health for this month.
                </p>
            )}
        </div>
    )
}
