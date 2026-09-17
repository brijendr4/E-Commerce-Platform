import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="container-main py-24 flex items-center justify-center">
      <div className="shadow-soft p-12 text-center max-w-md w-full bg-primary rounded-3xl border border-white/60">
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl shadow-inset flex items-center justify-center mx-auto mb-6 border border-white/50 bg-primary">
          <FaExclamationTriangle className="text-3xl text-zinc-400" />
        </div>

        {/* Error code */}
        <div className="text-7xl font-black text-zinc-200 tracking-tighter mb-2 font-mono select-none">
          404
        </div>

        <h1 className="text-2xl font-black uppercase text-zinc-900 tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-semibold">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Check the URL or head back to the homepage.
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/" className="btn btn-secondary no-underline w-full justify-center py-3 text-xs flex items-center gap-2">
            <FaHome className="text-xs" /> Back to Homepage
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary w-full justify-center py-3 text-xs flex items-center gap-2 cursor-pointer"
          >
            <FaArrowLeft className="text-xs" /> Go Back
          </button>
        </div>

      </div>
    </div>
  )
}
