import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'
import App from './App'
import { GlobalContextProvider } from './contexts/globalContext'
import { MessageProvider } from './contexts/messageContext'
import { LoaderProvider } from './contexts/loaderContext'
// import { AxiosInterceptors } from './commonComponents/interceptor/interceptor';
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <GlobalContextProvider>
    <MessageProvider>
      <LoaderProvider>
        {/* <AxiosInterceptors/> */}
        <App />
      </LoaderProvider>
    </MessageProvider>
  </GlobalContextProvider>,
)

reportWebVitals()
