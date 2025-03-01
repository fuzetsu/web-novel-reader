import { App } from '@/cmp/App'
import './styles.css'
import { render } from 'solid-js/web'
import { attachDevtoolsOverlay } from '@solid-devtools/overlay'

// attachDevtoolsOverlay()

render(() => <App />, document.body)
