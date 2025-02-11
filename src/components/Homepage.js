import React, { useEffect, useRef, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { uid } from 'uid'
import { set, ref, onValue, remove, update } from 'firebase/database'
import '../styles/homepage.css'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import DoneIcon from '@mui/icons-material/Done'
import photoHomepage from '../assets/todo-homepage.gif'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone'

function Homepage() {
  const [todo, setTodo] = useState('')
  const [todos, setTodos] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [tempUidd, setTempUidd] = useState('')
  const inputRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setTodos([])
          const data = snapshot.val()
          if (data !== null) {
            Object.values(data).map((todo) => {
              setTodos((oldArray) => [...oldArray, todo])
            })
          }
        })
      } else if (!user) {
        navigate('/notes-with-auth')
      }
    })
  }, [])

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigate('/notes-with-auth'))
      .catch((err) => alert(err.message))
  }

  // add
  const writeToDatabase = () => {
    if (todo.trim() !== '') {
      const uidd = uid()
      set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
        todo: todo,
        uidd: uidd,
        completed: false,
      })

      setTodo('')
    }
  }

  const writeToDatabaseKeyPress = (e) => {
    if (e.key === 'Enter' && todo.trim() !== '' && !isEdit) {
      const uidd = uid()
      set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
        todo: todo,
        uidd: uidd,
        completed: false,
      })

      setTodo('')
    }
  }

  // update
  const handleUpdate = (todo) => {
    inputRef.current.focus()
    setIsEdit(true)
    setTodo(todo.todo)
    setTempUidd(todo.uidd)
  }

  // delete
  const handleDelete = (uid) => {
    if (!isEdit) {
      remove(ref(db, `/${auth.currentUser.uid}/${uid}`))
    }
  }

  //confirm update
  const handleEditConfirm = () => {
    if (todo.trim() === '') {
      remove(ref(db, `/${auth.currentUser.uid}/${tempUidd}`))
      setTodo('')
      setIsEdit(false)
      return
    }

    update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
      todo: todo,
      tempUidd: tempUidd,
    })

    setTodo('')
    setIsEdit(false)
  }

  // change to done
  const handleChanger = (uidd) => {
    update(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
      completed: (todos.completed = !todos.completed),
    })
  }

  return (
    <>
      <div className="container">
        <div className="wrap">
          <div className="input-field-homepage wrap__item">
            <input
              ref={inputRef}
              placeholder="Додати нотатку..."
              className="add-edit-input wrap__input"
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              id="title"
              onKeyPress={writeToDatabaseKeyPress}
            ></input>

            {isEdit ? (
              <DoneIcon
                onClick={handleEditConfirm}
                className="add-confirm-icon"
              />
            ) : (
              <AddIcon onClick={writeToDatabase} className="add-confirm-icon" />
            )}
          </div>
        </div>
        {!todos.length && (
          <p style={{ textAlign: 'center', fontSize: '20px' }}>
            Нотаток немає, додайте що-небудь!
          </p>
        )}
        <TransitionGroup>
          {todos.map((todo) => {
            const classes = ['todo']
            if (todo.completed) {
              classes.push('done')
            }

            const word = todo.todo
            const wordMiddle = word.match(/(https?:\/\/[^\s]+)/)

            if (wordMiddle) {
              return (
                <CSSTransition
                  key={todo.uidd}
                  classNames={'note'}
                  timeout={500}
                >
                  <div className={classes.join(' ')}>
                    <FileDownloadDoneIcon
                      fontSize="large"
                      className="change-button"
                      onClick={() => handleChanger(todo.uidd)}
                    />

                    <a
                      href={word.substring(
                        wordMiddle.index,
                        wordMiddle.index + wordMiddle[0].length
                      )}
                    >
                      <span>{word}</span>
                    </a>

                    <EditIcon
                      fontSize="large"
                      onClick={() => handleUpdate(todo)}
                      className="edit-button"
                    />
                    <DeleteForeverIcon
                      fontSize="large"
                      onClick={() => handleDelete(todo.uidd)}
                      className="delete-button"
                    />
                  </div>
                </CSSTransition>
              )
            } else {
              return (
                <CSSTransition
                  key={todo.uidd}
                  classNames={'note'}
                  timeout={500}
                >
                  <div className={classes.join(' ')}>
                    <FileDownloadDoneIcon
                      fontSize="large"
                      className="change-button"
                      onClick={() => handleChanger(todo.uidd)}
                    />

                    <span>{word}</span>

                    <EditIcon
                      fontSize="large"
                      onClick={() => handleUpdate(todo)}
                      className="edit-button"
                    />
                    <DeleteForeverIcon
                      fontSize="large"
                      onClick={() => handleDelete(todo.uidd)}
                      className="delete-button"
                    />
                  </div>
                </CSSTransition>
              )
            }
          })}
        </TransitionGroup>
        <LogoutOutlinedIcon
          fontSize="large"
          onClick={handleSignOut}
          className="logout-icon"
        />
        <div className="versia">
          <img src={photoHomepage} className="todo-icon" />

          <p
            className="version"
            style={{ textAlign: 'center', fontSize: '20px' }}
          >
            Версія <strong>0.001</strong>
          </p>
        </div>
      </div>
    </>
  )
}

export default Homepage
