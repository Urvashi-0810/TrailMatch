import React from "react"

export function PulseIcon({ className }: { className?: string }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M30 90H60L75 60L95 120L115 40L135 110L150 90H180"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
