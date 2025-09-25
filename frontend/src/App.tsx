import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import Home from './pages/Home'
import QuestionForm from './pages/QuestionForm'
import Question from './pages/Question'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/create-question' element={<QuestionForm />} />
        <Route path='/question/:id' element={<Question />} />
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </Router>
  )
}

export default App