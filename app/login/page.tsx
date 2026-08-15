'use client'

import React, { useState } from 'react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Title */}
        <h1 className="title">EduPortal</h1>
        <p className="subtitle">Sign in to your account</p>

        {/* Form */}
        <form>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <MdEmail className="icon" size={20} />
              <input type="email" id="email" placeholder="Enter your email" />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <MdLock className="icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="form-options">
            <label className="remember">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="btn-signin">Sign in</button>

        </form>

        {/* Footer */}
        <p className="footer-text">
          Don&apos;t have an account? <a href="#">Request access</a>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
