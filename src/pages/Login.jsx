import "../App.css";

function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <h1>MachineMitra AI</h1>
          <p>Intelligent Predictive Maintenance</p>
        </div>

        <div className="login-form">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to access your machine dashboard</p>

          <label>Email</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot Password?</a>
          </div>

          <button className="login-button" onClick={onLogin}>
  Login
</button>
        </div>

        <p className="footer-text">
          © 2026 MachineMitra AI
        </p>
      </div>
    </div>
  )
}

export default Login;