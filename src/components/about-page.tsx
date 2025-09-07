import {Link} from "react-router-dom";

export default function AboutPage(){
    return (
        <div className="p-2">
            <h1>About</h1>
            <h2>Overview</h2>
            <p>
                This project started out getting and WebRTC connection set up for peer to peer gaming.
                The way this works is that there is a pairing server, which clients connect to via web sockets.
                The server pairs two players for a game, and passes each player the other's socket ID so that they can set up a direct connection.
                Players then play their games directly against one-another, and may report their results to the server when done.
                An advantage in particular about this approach is that a server no longer has to act as a go between for all communication,
                as is the case with conventional web sockets.
            </p>
            <p>
                The client is based on React, Redux and Shadcn. It can be installed as a PWA (app). 
                Offline first capability means the application can be used without a network connection.
            </p>
            <p> 
                The server uses Express to handle HTTP requests and Socket.IO for pairing via web sockets.
                User's handles along with their ELO are store in a basic SQLite database.
            </p> 
            <h2>Building A Basic Chess Engine</h2>
            <p>
                By design there would be three game modes: Hotseat, Network and vs AI. 
                Hotseat is the least commonly played, but easiest to implement and seemed to make a good starting point for developing the rules engine.
                In hotseat mode, players take turns on the same device with the board being rotated to the opponent's point of view after each move is made.
            </p>
            <p>
                I had ChatGPT layout the elements for the board UI and styled it from there.
                The state for the game is held in a Redux store, which accesses a utility library of functions performing various tasks,
                like finding all moves available for a given chess piece, or finding out if a player is in check, checkmate or stalemate. 
                Having the rules engine as a stateless utility library makes its easy to reuse and test.
                A rudimentary set of tests were prepared using Vitest and can be found in the <code>/tests</code> subdirectory of the project.
            </p>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white whitespace-nowrap">
                components/chess.tsx
            </code>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white whitespace-nowrap">
                store/chessSlice.ts
            </code>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white whitespace-nowrap">
                lib/chess-logic.ts 
            </code>
            <h2>AI Play</h2>
            <p>For the AI, the plan was to use alpha-beta minmax. Rather than spend a lot of effort coming up with my own solution, 
                as I did with  
                <Link to="https://literant.com"> Scrabble</Link>, I'd use an existing algorithm. The AI is a Javascript adaption of this 
                <Link to="https://medium.com/dscvitpune/lets-create-a-chess-ai-8542a12afef"> python code</Link>.
                Here's how it works:
            </p>
            <h3>Weighing the Board</h3>
            <p>
                Before we can find a move, we need a way to determine how strong it is. This is done through an evaluate function, 
                which typically assesses two things: How many pieces each player has on the board and how favourably they are positioned.
                A way to measure this by using Pawns as a unit of value. Roughly speaking 3 pawns are equivalent to a knight or bishop, 
                5 for a rook and 9 for a queen. Kings are assessed seperately for check, checkmate and stalemate. 
                The algorithm I used weigh knight slightly higher than 3 pawns and bishop slightly above knight.
            </p>
            <p>
                A smaller weight is applied by board positions that pieces are in. Each piece has a lookup table named after itself which 
                applies a smaller weight in centipawns with a range of +-50. The effect is to promote behaviour leading to favourable game 
                states, such as positioning knights centrally or to push pawns towards promotion.
            </p>
            <h3>Move Selection using MinMax with Alpha-Beta Pruning and Negamax Quiescence Search</h3>
            <p>
                Chess is a zero sum game, meaning one player's gain is equivalent to the other players loss.
                MinMax is an algorithm that assumes both players play optimally. 
                It searches through each move a player can make, assessing the value of the resulting board state. 
                For each move it then assesses each response the opponent can make, alternating between positive and negative
                weights dependent on whether it is active player or opponent.
            </p>
            <p>
                Alpha-Beta pruning is a technique that ignores the exploration of search branches that are known in advance to be suboptimal. 
                This reduces computation time without affecting the result, accomodating deeper or faster searches.
            </p>
            <p>
                Minmax searches to a given depth (number of turns into the future).
                The depth at which the minmax search ends is known as the horizon effect. 
                If the following turn pieces can be taken, this would significantly impact the value of the move.  
                Quiescence search continues to greater depths, but only while players can continue to take one another's pieces, 
                which is typically closer to a list-like sequence of moves than an exponentially branching tree. 
                Once no players can take one another's pieces the search ends.
                Negamax is a simplified minmaxing function that used for the quiescence search. 
            </p> 
            <h3>Running the MinMax Search in A Browser</h3>
            <p>
                Searches can take a significant amount of time to complete. 
                We don't want to lock the UI thread while doing this, so the task can be dispatched the to a Web Worker.
                A Web Worker carries out the task in a seperate thread then sends a message with the result upon completion.
                The program now needs to maintain concurrency between the two threads. For example: If we restart the game while
                the AI is thinking we don't want to mutate the reset board when it produces a result.
                To handle this the web worker calls an asynchronous variant of the search function and creates an abort controller
                on each search request. If the game ends while the AI is searching an abort signal is sent to terminate the task.
            </p>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                lib/chess-ai.ts 
            </code>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                middleware/chess-mid.ts 
            </code>
            <code className="pl-2 pr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                workers/ai-worker.ts 
            </code>
            <h2>Offline First and Local Persistence</h2>
            <p>
                Hotseat and AI games should be available even when a device is offline and, being a game, it is desireable for 
                the app to be installed in a portable device. Having the app built as a &nbsp;
                <a href="https://web.dev/explore/progressive-web-apps" target="_blank">PWA</a> by VitePWA takes care of this.
                The app was given an icon generated by Sora, and configured to cache resources.    
            </p>        
            <p>
                Local persistence allows players to start from the state they left their game in last time they closed app or tab.
                The Redux store contains the game's state, but is intended to be free of side effects so additional middleware
                was added to intercept UI calls to on turn end, game end and initialisation. Saving the state simply involves 
                serialising the redux store and saving it to localStorage.
            </p>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                vite.config.ts
            </code>    
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                middleware/chess-mid.ts 
            </code>
            <h2>Network Play</h2>
            <p>
                Network games work slightly different from the other modes because an opponent needs to be found first.
                Before playing a player needs to define a user handle, which the server checks for uniqueness then returns a token.
                A player can search for a game against a specific friend or any opponent that the pairing server finds.
            </p>
            <h3>Peer to Peer</h3>
            <p>
                The server uses Express to handle general purpose HTTP requests, but the games are setup to use peer to peer connection
                using WebRTC. Players seeking a game connect to the server using a websocket. On pairing players recieve each other's 
                socket ID and then play directly against one another, thus reducing server load and latency that would be involed in 
                mediating games.
            </p>
            <h3>Elo Rating System</h3>
            <p>
                The Elo rating system is a method for calculating the relative skill levels of players in zero-sum games such as chess 
                or esports.
            </p>
            <p>
                The difference in the ratings between two players serves as a predictor of the outcome of a match. Two players with 
                equal ratings who play against each other are expected to score an equal number of wins. A player whose rating is 100 
                points greater than their opponent's is expected to score 64%; if the difference is 200 points, then the expected score 
                for the stronger player is 76% (<a href="https://en.wikipedia.org/wiki/Elo_rating_system" target="_blank">Wikipedia</a>).
            </p>
            <code className="pl-2 pr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                components/p2p-game.ts 
            </code>           
        </div>
    );
}