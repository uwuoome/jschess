import {Link} from "react-router-dom";

export default function AboutPage(){
    return (
        <div className="p-2">
            <h1>About</h1>
            <h2>Overview of Technologies Used</h2>
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
            <h2>Basic Chess Engine</h2>
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
            </p>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                components/chess.tsx
            </code>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                store/chessSlice.ts
            </code>
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                lib/chess-logic.ts 
            </code>
            <h2>AI Play</h2>
            <p>For the AI, the plan was to use alpha-beta minmax. Rather than spend a lot of effort coming up with my own solution, 
                as I did with  
                <Link to="https://literant.com"> Scrabble</Link>, I'd use an existing algorithm. The AI is a Javascript adaption of this 
                <Link to="https://medium.com/dscvitpune/lets-create-a-chess-ai-8542a12afef"> python code</Link>.
                What follows is a brief summary of how it all works.
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
                applies a smaller weight in centipawns with a range of +-50. The effect is to promote behaviour, such as positioning 
                knights centrally to control more of the board and to push pawns towards the end of teh board for promotion.
            </p>
            <h3>Move Search</h3>
            <p>Chess is a zero sum game, meaning one player's gain is equivalent to the other players loss.</p>
            <p>
                MinMax is an algorithm that assumes both players play optimally. 
                It searches through each move a player can make, assessing the value of the resulting board state. 
                For each move it then assesses each response the opponent can make, alternating between positive and negative dependent on
                whether it is active player or opponent.
                This process can be repeated for better results, but soon becomes computationally infeasible.
            </p>
            <p>
                Alpha-Beta pruning is an optimisation allowing the algorithm to ignore the exploration of
                search branches that are known in advance to be suboptimal. 
                This reduces computation time without affecting the result, accomodating deeper search potential.
            </p>
            <p>
                The fixed depth at which the minmax search ends is known as the horizon effect. 
                If the following turn pieces can be taken, this would significantly impact the value of the move.  
            </p>
            <p>
                Quiescence search goes to greater depths, but only while players can continue to take one another's pieces, 
                which is typically closer to a list-like sequence of moves than an exponentially branching tree. 
                Once no players can take one another's pieces the search ends.
            </p>
            <p>
                Negamax is a simplified minmaxing function that used withing the quiescence search. 
            </p> 
            <code className="pl-2 pr-2 mr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                lib/chess-ai.ts 
            </code>
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
                middleware/chess-mid.ts 
            </code>
            <code className="pl-2 pr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                workers/ai-worker.ts 
            </code>

            <h2>Network Play</h2>
            <p>
                Network games work slightly different from the other modes because an opponent needs to be found first.
                Before playing a player needs to define a user handle, which the server checks for uniqueness then returns an ID token.
                A player can search for a game against a specific friend or any opponent that the pairing server finds.
            </p>
            <code className="pl-2 pr-2 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 text-white">
                components/p2p-game.ts 
            </code>           
        </div>
    );
}