import './App.css'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {store} from "@/store/index"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"
import Home from "@/components/home"
import Friends from "@/components/friends"
import P2PGame from "@/components/p2p-game"
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-1/1 m-0 p-10">
            <SidebarTrigger />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/game" element={<P2PGame />} />
            </Routes>
          </main>
        </SidebarProvider>
      </Router>
    </Provider>
  )
}
 
export default App
