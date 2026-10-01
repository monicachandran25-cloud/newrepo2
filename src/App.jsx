import { useEffect, useState } from 'react'
import pageUrl from './page.html?url'
import pageScripts from './page-scripts.json'
import './page.css'

let scriptsInitialized = false

function App() {
  const [markup, setMarkup] = useState('')

  useEffect(() => {
    fetch(pageUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load the page content.')
        return response.text()
      })
      .then(setMarkup)
  }, [])

  useEffect(() => {
    if (!markup) return
    if (scriptsInitialized) return
    scriptsInitialized = true

    pageScripts.forEach((source) => {
      if (!source.trim()) return
      const script = document.createElement('script')
      script.textContent = source
      document.body.appendChild(script)
      script.remove()
    })

    if (pageScripts.some((source) => /DOMContentLoaded/.test(source))) {
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }
    if (pageScripts.some((source) => /addEventListener\s*\(\s*['"]load['"]/.test(source))) {
      window.dispatchEvent(new Event('load'))
    }
  }, [markup])

  return markup ? <div dangerouslySetInnerHTML={{ __html: markup }} /> : null
}

export default App
