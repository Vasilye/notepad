import React, { useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import '../styles/welcome.css'
import photoWelcome from '../assets/todo-welcome.svg'

function Welcome() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerInfo, setRegisterInfo] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/notes-with-auth/homepage')
      }
    })
  }, [])

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/notes-with-auth/homepage')
      })
      .catch((err) => alert(err.message))
  }

  const handleRegister = () => {
    if (registerInfo.password !== registerInfo.confirmPassword) {
      alert('Паролі не співпадають')
      return
    }
    createUserWithEmailAndPassword(
      auth,
      registerInfo.email,
      registerInfo.password
    )
      .then(() => {
        navigate('/notes-with-auth/homepage')
      })
      .catch((err) => alert(err.message))
  }

  return (
    <div className="welcome">
      <img src={photoWelcome} className="todo-svg" />
      <h1>Нотатки</h1>
      <div className="input-field">
        {isRegistering ? (
          <>
            <input
              type="email"
              placeholder="Введіть email"
              value={registerInfo.email}
              onChange={(e) =>
                setRegisterInfo({ ...registerInfo, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Введіть пароль"
              value={registerInfo.password}
              onChange={(e) =>
                setRegisterInfo({ ...registerInfo, password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Підтвердіть пароль"
              value={registerInfo.confirmPassword}
              onChange={(e) =>
                setRegisterInfo({
                  ...registerInfo,
                  confirmPassword: e.target.value,
                })
              }
            />
            <h1 className="register-button" onClick={handleRegister}>
              Реєстрація
            </h1>
            <button
              className="back-account-button"
              onClick={() => setIsRegistering(false)}
            >
              Повернутися
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              onChange={handleEmailChange}
              value={email}
              placeholder="Email"
            />
            <input
              type="password"
              onChange={handlePasswordChange}
              value={password}
              placeholder="Пароль"
            />
            <button className="sign-in" onClick={handleSignIn}>
              Увійти
            </button>
            <button
              className="create-account-button"
              onClick={() => setIsRegistering(true)}
            >
              Зараєструватися
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Welcome
