import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { cleanupSocket } from '@/redux/socket/socketThunks'
import './App.css'
import Home from './pages/Home'
import NameEntry from './pages/NameEntry'
import QuestionForm from './pages/QuestionForm'
import Question from './pages/Question'
import NotFound from './pages/NotFound'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Cleanup socket on page refresh or app unmount
    const handleBeforeUnload = () => {
      dispatch(cleanupSocket())
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Don't cleanup socket here - let it persist across route changes
    }
  }, [dispatch])
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/name-entry' element={<NameEntry />} />
        <Route path='/create-question' element={<QuestionForm />} />
        <Route path='/question/:id' element={<Question />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App