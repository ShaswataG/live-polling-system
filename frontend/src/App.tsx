import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import NameEntry from './pages/NameEntry'
import QuestionForm from './pages/QuestionForm'
import Question from './pages/Question'
import NotFound from './pages/NotFound'
import { useAppDispatch } from './redux/hooks'
import { bindSocketListeners } from './redux/socket/socketThunks'

function SocketBootstrapper() {
	const dispatch = useAppDispatch()

	useEffect(() => {
    dispatch(bindSocketListeners())
	}, [dispatch])

	return null
}

function App() {
  return (
    <Router>
      <SocketBootstrapper />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/name-entry' element={<NameEntry />} />
        <Route path='/create-question' element={<QuestionForm />} />
        <Route path='/question/:id' element={<Question />} />
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </Router>
  )
}

export default App