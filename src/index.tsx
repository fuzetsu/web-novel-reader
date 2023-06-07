// import 'preact/debug'
import { App } from 'cmp/App'
import { render } from 'preact'
import './styles.css'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(registration =>
      console.log('Service Worker registered with scope:', registration.scope)
    )
    .catch(error => console.error('Service Worker registration failed:', error))
}

render(<App />, document.body)
