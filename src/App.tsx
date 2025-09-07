import './App.css'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {store} from "@/store/index"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"
import Home from "@/components/home"
import Friends from "@/components/friends"
import P2PGame from "@/components/p2p-game"
import { Provider } from 'react-redux';
import RockPaperScissors from './components/rock-paper-scissors';
import Chess from './components/chess';
import AboutPage from './components/about-page';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <SidebarProvider>
          <div className="sidebar">
            <AppSidebar />
          </div>
          <main className={`w-1/1 m-0 p-10`}>
            <SidebarTrigger />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/rps" element={<P2PGame game={RockPaperScissors} />} />
              <Route path="/chess/p2p" element={<P2PGame game={Chess} />} />
              <Route path="/chess/hotseat" element={<Chess player={0} mode="hotseat" />} />
              <Route path="/chess/ai" element={<Chess player={0} mode="ai" />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </SidebarProvider>
      </Router>
    </Provider>
  )
}
 
export default App
